// firebase-functions/functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");
const querystring = require("querystring");

admin.initializeApp();

// Function to handle GitHub OAuth redirect
exports.authGitHub = functions.https.onRequest((req, res) => {
  const state = req.query.state || "state";
  const clientId = functions.config().github.client_id;
  const redirectUri = `https://${req.hostname}/callback`;

  const authParams = querystring.stringify({
    client_id: clientId,
    redirect_uri: redirectUri,
    state: state,
    scope: "repo,user",
  });

  const authUrl = `https://github.com/login/oauth/authorize?${authParams}`;

  res.redirect(authUrl);
});

// Function to handle GitHub OAuth callback
exports.callback = functions.https.onRequest(async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;

  if (!code) {
    res.status(400).send("Missing code parameter");
    return;
  }

  const clientId = functions.config().github.client_id;
  const clientSecret = functions.config().github.client_secret;
  const tokenUrl = "https://github.com/login/oauth/access_token";
  const redirectUri = `https://${req.hostname}/callback`;

  // Exchange code for access token
  const tokenResponse = await fetch(tokenUrl, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: querystring.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      redirect_uri: redirectUri,
      state: state,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (tokenData.error) {
    const errorMsg = `Error exchanging code: ${tokenData.error_description}`;
    res.status(400).send(errorMsg);
    return;
  }

  const accessToken = tokenData.access_token;

  // Use access token to get user info
  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `token ${accessToken}`,
      Accept: "application/json",
    },
  });

  const userData = await userResponse.json();

  if (userData.error) {
    const errorMsg = `Error fetching user data: ${userData.error_description}`;
    res.status(400).send(errorMsg);
    return;
  }

  const uid = userData.id.toString();

  // Create custom token for Firebase Authentication
  const firebaseToken = await admin.auth().createCustomToken(uid);

  // Store GitHub access token in Firestore
  await admin.firestore().collection("tokens").doc(uid).set({
    githubAccessToken: accessToken,
  });

  // Redirect back to the Chrome extension with the Firebase token
  const redirectUrl = `chrome-extension://${state}/popup.html?` +
    `token=${firebaseToken}`;
  res.redirect(redirectUrl);
});

// Callable function to retrieve GitHub access token
exports.getGitHubToken = functions.https.onCall(
    async (data, context) => {
      if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "User not authenticated",
        );
      }

      const uid = context.auth.uid;

      const tokenDoc = await admin.firestore()
          .collection("tokens")
          .doc(uid)
          .get();

      if (!tokenDoc.exists) {
        throw new functions.https.HttpsError(
            "not-found",
            "Access token not found",
        );
      }

      const githubAccessToken = tokenDoc.data().githubAccessToken;

      return { githubAccessToken };
    },
);
