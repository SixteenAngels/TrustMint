const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

// Load service account from env or local file
// Place your service account JSON path in GOOGLE_APPLICATION_CREDENTIALS
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Google SSO
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.post('/auth/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'idToken required' });

    const ticket = await googleClient.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const uid = `google:${payload.sub}`;

    await admin.auth().updateUser(uid, { email: payload.email }).catch(async (e) => {
      if (e.code === 'auth/user-not-found') {
        await admin.auth().createUser({ uid, email: payload.email, displayName: payload.name });
      } else { throw e; }
    });

    const customToken = await admin.auth().createCustomToken(uid);
    return res.json({ customToken });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Google auth failed' });
  }
});

// Apple SSO: verify identityToken (JWT) and nonce; simplified verification
app.post('/auth/apple', async (req, res) => {
  try {
    const { identityToken, rawNonce } = req.body;
    if (!identityToken || !rawNonce) return res.status(400).json({ error: 'identityToken and rawNonce required' });

    // Decode the JWT to extract the subject (sub) and email. In production,
    // verify the signature against Apple public keys (JWKS). Libraries exist for this.
    const decoded = jwt.decode(identityToken, { complete: true });
    if (!decoded || !decoded.payload || !decoded.payload.sub) throw new Error('Invalid token');
    const sub = decoded.payload.sub;
    const email = decoded.payload.email;

    const uid = `apple:${sub}`;

    // Create or update user
    await admin.auth().updateUser(uid, { email }).catch(async (e) => {
      if (e.code === 'auth/user-not-found') {
        await admin.auth().createUser({ uid, email });
      } else { throw e; }
    });

    const customToken = await admin.auth().createCustomToken(uid);
    return res.json({ customToken });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Apple auth failed' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Auth server running on http://localhost:${PORT}`));
