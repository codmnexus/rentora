const { db, verifyAuth, cors } = require('./_lib/admin');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = await verifyAuth(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const userDoc = await db.collection('users').doc(user.uid).get();
  const isAdmin = userDoc.exists && userDoc.data().role === 'admin';

  let escrows;
  if (isAdmin) {
    const snap = await db.collection('escrow').orderBy('createdAt', 'desc').limit(100).get();
    escrows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } else {
    const [payerSnap, receiverSnap] = await Promise.all([
      db.collection('escrow').where('payerId', '==', user.uid).get(),
      db.collection('escrow').where('receiverId', '==', user.uid).get(),
    ]);
    const map = new Map();
    payerSnap.docs.forEach(d => map.set(d.id, { id: d.id, ...d.data() }));
    receiverSnap.docs.forEach(d => map.set(d.id, { id: d.id, ...d.data() }));
    escrows = Array.from(map.values());
  }

  return res.status(200).json({ escrows });
};
