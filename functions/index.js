// ==================================================
// Rentora — Cloud Functions (Payment, Wallet, Escrow)
// ==================================================
// All balance mutations happen HERE, never on the client.
// Paystack webhook is the single source of truth.
// ==================================================

const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const crypto = require("crypto");

initializeApp();
const db = getFirestore();
const auth = getAuth();

// ==================================================
// CONFIG — Paystack keys from environment
// ==================================================
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";
const PAYSTACK_BASE = "https://api.paystack.co";

// ==================================================
// HELPERS
// ==================================================

/** Make authenticated request to Paystack API */
async function paystackRequest(method, path, body = null) {
  const https = require("https");
  const url = new URL(path, PAYSTACK_BASE);

  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error("Failed to parse Paystack response")); }
      });
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

/** Generate unique reference */
function genRef(prefix = "PAY") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Ensure wallet exists for user, create if not */
async function ensureWallet(userId, transaction = null) {
  const walletRef = db.collection("wallets").doc(userId);
  const run = transaction
    ? async (fn) => fn(transaction)
    : async (fn) => db.runTransaction(fn);

  let wallet;
  await run(async (t) => {
    const snap = await t.get(walletRef);
    if (!snap.exists) {
      t.set(walletRef, {
        userId,
        balance: 0,
        createdAt: FieldValue.serverTimestamp(),
      });
      wallet = { userId, balance: 0 };
    } else {
      wallet = snap.data();
    }
  });
  return wallet;
}

/** Log a transaction (must be called inside a Firestore transaction) */
function logTransaction(t, { userId, type, amount, status, reference, metadata = {} }) {
  const txnRef = db.collection("transactions").doc();
  t.set(txnRef, {
    userId,
    type,
    amount,
    status,
    reference: reference || genRef("TXN"),
    metadata,
    createdAt: FieldValue.serverTimestamp(),
  });
  return txnRef.id;
}

/** Structured logging */
function auditLog(action, data) {
  console.log(JSON.stringify({
    severity: "INFO",
    action,
    timestamp: new Date().toISOString(),
    ...data,
  }));
}

// ==================================================
// RATE LIMITING (in-memory, per-function instance)
// ==================================================
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 10; // max requests per window

function checkRateLimit(userId) {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(userId, { windowStart: now, count: 1 });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

// ==================================================
// 1. INITIALIZE PAYMENT (Callable)
// ==================================================
// Client calls this → we create payment record → call Paystack → return checkout URL
exports.initializePayment = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be logged in.");
  }

  const userId = request.auth.uid;
  if (!checkRateLimit(userId)) {
    throw new HttpsError("resource-exhausted", "Too many requests. Try again later.");
  }

  const { amount, email, metadata = {} } = request.data;

  if (!amount || typeof amount !== "number" || amount < 100) {
    throw new HttpsError("invalid-argument", "Amount must be at least ₦100.");
  }
  if (!email || typeof email !== "string") {
    throw new HttpsError("invalid-argument", "Valid email required.");
  }

  const reference = genRef("PAY");

  // Create payment record in Firestore FIRST
  await db.collection("payments").doc(reference).set({
    userId,
    provider: "paystack",
    reference,
    amount,
    status: "pending",
    metadata,
    createdAt: FieldValue.serverTimestamp(),
  });

  auditLog("payment_initiated", { userId, amount, reference });

  // Call Paystack to initialize transaction
  const result = await paystackRequest("POST", "/transaction/initialize", {
    email,
    amount: amount * 100, // Paystack expects kobo
    reference,
    callback_url: metadata.callbackUrl || undefined,
    metadata: {
      userId,
      ...metadata,
    },
  });

  if (!result.status) {
    // Update payment as failed
    await db.collection("payments").doc(reference).update({ status: "failed" });
    auditLog("payment_init_failed", { userId, reference, error: result.message });
    throw new HttpsError("internal", result.message || "Payment initialization failed.");
  }

  return {
    authorization_url: result.data.authorization_url,
    access_code: result.data.access_code,
    reference,
  };
});

// ==================================================
// 2. PAYSTACK WEBHOOK (HTTP endpoint)
// ==================================================
// Paystack sends POST here after payment events
exports.paystackWebhook = onRequest({ cors: false }, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method not allowed");
    return;
  }

  // Verify webhook signature
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    auditLog("webhook_signature_invalid", { ip: req.ip });
    res.status(401).send("Invalid signature");
    return;
  }

  const event = req.body;
  auditLog("webhook_received", { event: event.event, reference: event.data?.reference });

  if (event.event === "charge.success") {
    const { reference, amount: amountKobo, customer } = event.data;
    const amount = amountKobo / 100; // Convert from kobo to Naira

    try {
      // DOUBLE-SPEND PROTECTION: check if already processed
      const paymentSnap = await db.collection("payments").doc(reference).get();

      if (!paymentSnap.exists) {
        auditLog("webhook_unknown_reference", { reference });
        res.status(200).send("OK"); // Acknowledge but ignore unknown references
        return;
      }

      const payment = paymentSnap.data();

      if (payment.status === "success") {
        auditLog("webhook_duplicate_ignored", { reference });
        res.status(200).send("OK"); // Already processed — idempotent
        return;
      }

      // Verify with Paystack API (belt + suspenders)
      const verification = await paystackRequest("GET", `/transaction/verify/${reference}`);
      if (!verification.status || verification.data.status !== "success") {
        auditLog("webhook_verification_failed", { reference });
        await db.collection("payments").doc(reference).update({ status: "failed" });
        res.status(200).send("OK");
        return;
      }

      const userId = payment.userId;

      // ATOMIC: update wallet + payment + create transaction
      await db.runTransaction(async (t) => {
        const walletRef = db.collection("wallets").doc(userId);
        const walletSnap = await t.get(walletRef);

        if (!walletSnap.exists) {
          t.set(walletRef, {
            userId,
            balance: amount,
            createdAt: FieldValue.serverTimestamp(),
          });
        } else {
          t.update(walletRef, {
            balance: FieldValue.increment(amount),
          });
        }

        t.update(db.collection("payments").doc(reference), {
          status: "success",
          verifiedAt: FieldValue.serverTimestamp(),
        });

        logTransaction(t, {
          userId,
          type: "deposit",
          amount,
          status: "completed",
          reference,
          metadata: { provider: "paystack", email: customer?.email },
        });
      });

      auditLog("wallet_credited", { userId, amount, reference });
    } catch (err) {
      auditLog("webhook_processing_error", { reference, error: err.message });
      console.error("Webhook error:", err);
    }
  }

  res.status(200).send("OK");
});

// ==================================================
// 3. GET WALLET BALANCE (Callable)
// ==================================================
exports.getWalletBalance = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be logged in.");
  }

  const userId = request.auth.uid;
  const wallet = await ensureWallet(userId);

  return { balance: wallet.balance || 0 };
});

// ==================================================
// 4. CREATE ESCROW (Callable)
// ==================================================
// Tenant pays rent → money moves from wallet to escrow
exports.createEscrow = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be logged in.");
  }

  const userId = request.auth.uid;
  if (!checkRateLimit(userId)) {
    throw new HttpsError("resource-exhausted", "Too many requests.");
  }

  const { amount, receiverId, listingId } = request.data;

  if (!amount || typeof amount !== "number" || amount <= 0) {
    throw new HttpsError("invalid-argument", "Invalid amount.");
  }
  if (!receiverId || typeof receiverId !== "string") {
    throw new HttpsError("invalid-argument", "Receiver ID required.");
  }
  if (!listingId || typeof listingId !== "string") {
    throw new HttpsError("invalid-argument", "Listing ID required.");
  }

  // Cannot escrow to yourself
  if (receiverId === userId) {
    throw new HttpsError("invalid-argument", "Cannot create escrow to yourself.");
  }

  let escrowId;

  await db.runTransaction(async (t) => {
    // Check wallet balance
    const walletRef = db.collection("wallets").doc(userId);
    const walletSnap = await t.get(walletRef);

    if (!walletSnap.exists || (walletSnap.data().balance || 0) < amount) {
      throw new HttpsError("failed-precondition", "Insufficient balance.");
    }

    const reference = genRef("ESC");

    // Debit wallet
    t.update(walletRef, {
      balance: FieldValue.increment(-amount),
    });

    // Create escrow record
    const escrowRef = db.collection("escrow").doc();
    escrowId = escrowRef.id;

    t.set(escrowRef, {
      payerId: userId,
      receiverId,
      amount,
      status: "held",
      listingId,
      reference,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Log transaction — payer
    logTransaction(t, {
      userId,
      type: "escrow_hold",
      amount: -amount,
      status: "completed",
      reference,
      metadata: { escrowId, receiverId, listingId },
    });
  });

  auditLog("escrow_created", { payerId: userId, receiverId, amount, escrowId });

  return { escrowId, status: "held" };
});

// ==================================================
// 5. RELEASE ESCROW (Callable)
// ==================================================
// Tenant confirms OR admin releases → funds go to landlord
exports.releaseEscrow = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be logged in.");
  }

  const userId = request.auth.uid;
  const { escrowId } = request.data;

  if (!escrowId || typeof escrowId !== "string") {
    throw new HttpsError("invalid-argument", "Escrow ID required.");
  }

  await db.runTransaction(async (t) => {
    const escrowRef = db.collection("escrow").doc(escrowId);
    const escrowSnap = await t.get(escrowRef);

    if (!escrowSnap.exists) {
      throw new HttpsError("not-found", "Escrow not found.");
    }

    const escrow = escrowSnap.data();

    if (escrow.status !== "held") {
      throw new HttpsError("failed-precondition", `Escrow is ${escrow.status}, not held.`);
    }

    // Only payer (tenant) or admin can release
    const userDoc = await t.get(db.collection("users").doc(userId));
    const isAdmin = userDoc.exists && userDoc.data().role === "admin";

    if (escrow.payerId !== userId && !isAdmin) {
      throw new HttpsError("permission-denied", "Only the payer or an admin can release escrow.");
    }

    const reference = genRef("REL");

    // Credit receiver wallet
    const receiverWalletRef = db.collection("wallets").doc(escrow.receiverId);
    const receiverWalletSnap = await t.get(receiverWalletRef);

    if (!receiverWalletSnap.exists) {
      t.set(receiverWalletRef, {
        userId: escrow.receiverId,
        balance: escrow.amount,
        createdAt: FieldValue.serverTimestamp(),
      });
    } else {
      t.update(receiverWalletRef, {
        balance: FieldValue.increment(escrow.amount),
      });
    }

    // Update escrow status
    t.update(escrowRef, {
      status: "released",
      releasedBy: userId,
      releasedAt: FieldValue.serverTimestamp(),
    });

    // Log transaction — receiver credited
    logTransaction(t, {
      userId: escrow.receiverId,
      type: "escrow_release",
      amount: escrow.amount,
      status: "completed",
      reference,
      metadata: { escrowId, payerId: escrow.payerId, listingId: escrow.listingId },
    });
  });

  auditLog("escrow_released", { escrowId, releasedBy: userId });

  return { success: true };
});

// ==================================================
// 6. REFUND ESCROW (Callable — admin only)
// ==================================================
exports.refundEscrow = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be logged in.");
  }

  const userId = request.auth.uid;
  const { escrowId } = request.data;

  // Verify admin
  const userDoc = await db.collection("users").doc(userId).get();
  if (!userDoc.exists || userDoc.data().role !== "admin") {
    throw new HttpsError("permission-denied", "Only admins can refund escrow.");
  }

  if (!escrowId) {
    throw new HttpsError("invalid-argument", "Escrow ID required.");
  }

  await db.runTransaction(async (t) => {
    const escrowRef = db.collection("escrow").doc(escrowId);
    const escrowSnap = await t.get(escrowRef);

    if (!escrowSnap.exists) {
      throw new HttpsError("not-found", "Escrow not found.");
    }

    const escrow = escrowSnap.data();

    if (escrow.status !== "held") {
      throw new HttpsError("failed-precondition", `Escrow is ${escrow.status}, cannot refund.`);
    }

    const reference = genRef("RFD");

    // Credit payer wallet back
    const payerWalletRef = db.collection("wallets").doc(escrow.payerId);
    const payerWalletSnap = await t.get(payerWalletRef);

    if (!payerWalletSnap.exists) {
      t.set(payerWalletRef, {
        userId: escrow.payerId,
        balance: escrow.amount,
        createdAt: FieldValue.serverTimestamp(),
      });
    } else {
      t.update(payerWalletRef, {
        balance: FieldValue.increment(escrow.amount),
      });
    }

    // Update escrow
    t.update(escrowRef, {
      status: "refunded",
      refundedBy: userId,
      refundedAt: FieldValue.serverTimestamp(),
    });

    // Log refund transaction
    logTransaction(t, {
      userId: escrow.payerId,
      type: "refund",
      amount: escrow.amount,
      status: "completed",
      reference,
      metadata: { escrowId, adminId: userId },
    });
  });

  auditLog("escrow_refunded", { escrowId, adminId: userId });

  return { success: true };
});

// ==================================================
// 7. REQUEST WITHDRAWAL (Callable)
// ==================================================
exports.requestWithdrawal = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be logged in.");
  }

  const userId = request.auth.uid;
  if (!checkRateLimit(userId)) {
    throw new HttpsError("resource-exhausted", "Too many requests.");
  }

  const { amount } = request.data;

  if (!amount || typeof amount !== "number" || amount < 100) {
    throw new HttpsError("invalid-argument", "Minimum withdrawal is ₦100.");
  }

  // Check for pending withdrawals
  const pendingSnap = await db.collection("withdrawals")
    .where("userId", "==", userId)
    .where("status", "==", "pending")
    .get();

  if (!pendingSnap.empty) {
    throw new HttpsError("failed-precondition", "You already have a pending withdrawal.");
  }

  // Check balance
  const walletSnap = await db.collection("wallets").doc(userId).get();
  if (!walletSnap.exists || (walletSnap.data().balance || 0) < amount) {
    throw new HttpsError("failed-precondition", "Insufficient balance.");
  }

  // Create withdrawal request (DO NOT debit wallet until approved)
  const withdrawalRef = await db.collection("withdrawals").add({
    userId,
    amount,
    status: "pending",
    createdAt: FieldValue.serverTimestamp(),
  });

  auditLog("withdrawal_requested", { userId, amount, withdrawalId: withdrawalRef.id });

  return { withdrawalId: withdrawalRef.id, status: "pending" };
});

// ==================================================
// 8. APPROVE WITHDRAWAL (Callable — admin only)
// ==================================================
exports.approveWithdrawal = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be logged in.");
  }

  const adminId = request.auth.uid;
  const { withdrawalId, action } = request.data;

  // Verify admin
  const adminDoc = await db.collection("users").doc(adminId).get();
  if (!adminDoc.exists || adminDoc.data().role !== "admin") {
    throw new HttpsError("permission-denied", "Only admins can process withdrawals.");
  }

  if (!withdrawalId) {
    throw new HttpsError("invalid-argument", "Withdrawal ID required.");
  }

  if (action === "reject") {
    await db.collection("withdrawals").doc(withdrawalId).update({
      status: "rejected",
      processedBy: adminId,
      processedAt: FieldValue.serverTimestamp(),
    });
    auditLog("withdrawal_rejected", { withdrawalId, adminId });
    return { success: true, status: "rejected" };
  }

  // Approve: atomic debit wallet + update withdrawal + log transaction
  await db.runTransaction(async (t) => {
    const withdrawalRef = db.collection("withdrawals").doc(withdrawalId);
    const withdrawalSnap = await t.get(withdrawalRef);

    if (!withdrawalSnap.exists) {
      throw new HttpsError("not-found", "Withdrawal not found.");
    }

    const withdrawal = withdrawalSnap.data();

    if (withdrawal.status !== "pending") {
      throw new HttpsError("failed-precondition", `Withdrawal is ${withdrawal.status}.`);
    }

    // Verify balance again
    const walletRef = db.collection("wallets").doc(withdrawal.userId);
    const walletSnap = await t.get(walletRef);

    if (!walletSnap.exists || (walletSnap.data().balance || 0) < withdrawal.amount) {
      throw new HttpsError("failed-precondition", "Insufficient balance for withdrawal.");
    }

    const reference = genRef("WDR");

    // Debit wallet
    t.update(walletRef, {
      balance: FieldValue.increment(-withdrawal.amount),
    });

    // Update withdrawal
    t.update(withdrawalRef, {
      status: "approved",
      processedBy: adminId,
      processedAt: FieldValue.serverTimestamp(),
    });

    // Log transaction
    logTransaction(t, {
      userId: withdrawal.userId,
      type: "withdraw",
      amount: -withdrawal.amount,
      status: "completed",
      reference,
      metadata: { withdrawalId, adminId },
    });
  });

  auditLog("withdrawal_approved", { withdrawalId, adminId });

  return { success: true, status: "approved" };
});

// ==================================================
// 9. GET ALL ESCROWS (Callable — admin only)
// ==================================================
exports.getEscrows = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be logged in.");
  }

  const userId = request.auth.uid;
  const userDoc = await db.collection("users").doc(userId).get();
  const isAdmin = userDoc.exists && userDoc.data().role === "admin";

  let snaps;
  if (isAdmin) {
    snaps = await db.collection("escrow").orderBy("createdAt", "desc").limit(100).get();
  } else {
    // Users see only their own escrows (as payer or receiver)
    const [payerSnap, receiverSnap] = await Promise.all([
      db.collection("escrow").where("payerId", "==", userId).get(),
      db.collection("escrow").where("receiverId", "==", userId).get(),
    ]);
    const map = new Map();
    payerSnap.docs.forEach((d) => map.set(d.id, { id: d.id, ...d.data() }));
    receiverSnap.docs.forEach((d) => map.set(d.id, { id: d.id, ...d.data() }));
    return { escrows: Array.from(map.values()) };
  }

  return {
    escrows: snaps.docs.map((d) => ({ id: d.id, ...d.data() })),
  };
});

// ==================================================
// 10. GET ALL WITHDRAWALS (Callable — admin only)
// ==================================================
exports.getWithdrawals = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be logged in.");
  }

  const userId = request.auth.uid;
  const userDoc = await db.collection("users").doc(userId).get();

  if (!userDoc.exists || userDoc.data().role !== "admin") {
    // Non-admin: return only their own
    const snap = await db.collection("withdrawals").where("userId", "==", userId).get();
    return { withdrawals: snap.docs.map((d) => ({ id: d.id, ...d.data() })) };
  }

  // Admin: return all
  const snap = await db.collection("withdrawals").orderBy("createdAt", "desc").limit(100).get();
  return { withdrawals: snap.docs.map((d) => ({ id: d.id, ...d.data() })) };
});
