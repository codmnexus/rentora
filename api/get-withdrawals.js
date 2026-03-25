// GET /api/get-withdrawals
// Auth: Bearer <Firebase ID Token>
// Returns user's withdrawals (or all if admin)

import { db, verifyAuth, cors } from './_lib/admin.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = await verifyAuth(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const userDoc = await db.collection('users').doc(user.uid).get();
  const isAdmin = userDoc.exists && userDoc.data().role === 'admin';

  let snap;
  if (isAdmin) {
    snap = await db.collection('withdrawals').orderBy('createdAt', 'desc').limit(100).get();
  } else {
    snap = await db.collection('withdrawals').where('userId', '==', user.uid).get();
  }

  return res.status(200).json({
    withdrawals: snap.docs.map(d => ({ id: d.id, ...d.data() })),
  });
}
