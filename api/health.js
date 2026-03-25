// Diagnostic endpoint — test that env vars and Firebase Admin initialize correctly
// DELETE this file after debugging

module.exports = async function handler(req, res) {
  const checks = {
    nodeVersion: process.version,
    envVars: {
      FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
      FIREBASE_PRIVATE_KEY_LENGTH: (process.env.FIREBASE_PRIVATE_KEY || '').length,
      FIREBASE_PRIVATE_KEY_STARTS_WITH: (process.env.FIREBASE_PRIVATE_KEY || '').substring(0, 30),
      PAYSTACK_SECRET_KEY: !!process.env.PAYSTACK_SECRET_KEY,
    },
    firebaseAdmin: 'not tested',
  };

  try {
    const { db } = require('./_lib/admin');
    checks.firebaseAdmin = 'initialized OK';
    // Try a simple read to verify credentials work
    const testRef = await db.collection('users').limit(1).get();
    checks.firestoreRead = `OK - found ${testRef.size} docs`;
  } catch (err) {
    checks.firebaseAdmin = `FAILED: ${err.message}`;
  }

  return res.status(200).json(checks);
};
