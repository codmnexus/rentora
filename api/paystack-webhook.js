const crypto = require('crypto');
const { db, FieldValue, auditLog, genRef, logTransaction, PAYSTACK_SECRET, paystackRequest } = require('./_lib/admin');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(JSON.stringify(req.body)).digest('hex');
  if (hash !== req.headers['x-paystack-signature']) {
    auditLog('webhook_signature_invalid', { ip: req.headers['x-forwarded-for'] });
    return res.status(401).send('Invalid signature');
  }

  const event = req.body;
  auditLog('webhook_received', { event: event.event, reference: event.data?.reference });

  if (event.event === 'charge.success') {
    const { reference, amount: amountKobo, customer } = event.data;
    const amount = amountKobo / 100;

    try {
      const paymentSnap = await db.collection('payments').doc(reference).get();
      if (!paymentSnap.exists) { auditLog('webhook_unknown_reference', { reference }); return res.status(200).send('OK'); }

      const payment = paymentSnap.data();
      if (payment.status === 'success') { auditLog('webhook_duplicate_ignored', { reference }); return res.status(200).send('OK'); }

      const verification = await paystackRequest('GET', `/transaction/verify/${reference}`);
      if (!verification.status || verification.data.status !== 'success') {
        await db.collection('payments').doc(reference).update({ status: 'failed' });
        return res.status(200).send('OK');
      }

      const userId = payment.userId;
      await db.runTransaction(async (t) => {
        const walletRef = db.collection('wallets').doc(userId);
        const walletSnap = await t.get(walletRef);
        if (!walletSnap.exists) {
          t.set(walletRef, { userId, balance: amount, createdAt: FieldValue.serverTimestamp() });
        } else {
          t.update(walletRef, { balance: FieldValue.increment(amount) });
        }
        t.update(db.collection('payments').doc(reference), { status: 'success', verifiedAt: FieldValue.serverTimestamp() });
        logTransaction(t, { userId, type: 'deposit', amount, status: 'completed', reference, metadata: { provider: 'paystack', email: customer?.email } });
      });

      auditLog('wallet_credited', { userId, amount, reference });
    } catch (err) {
      auditLog('webhook_error', { reference, error: err.message });
      console.error('Webhook error:', err);
    }
  }

  return res.status(200).send('OK');
};
