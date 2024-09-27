import { auth, firebaseOnAuthStateChanged, signInWithCustomToken } from '../firebase-config';

export function onAuthStateChanged(callback) {
  firebaseOnAuthStateChanged(auth, callback);
}

export function signInWithGitHub() {
  return new Promise((resolve, reject) => {
    const redirectUri = `https://clip-extension-34a13.firebaseapp.com/__/auth/handler`;
    const extensionId = chrome.runtime.id;
    const authUrl = `${redirectUri}?state=${extensionId}`;

    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl,
        interactive: true,
      },
      (redirectedTo) => {
        if (chrome.runtime.lastError || !redirectedTo) {
          reject(chrome.runtime.lastError);
          return;
        }

        const url = new URL(redirectedTo);
        const token = url.searchParams.get('token');

        if (!token) {
          reject(new Error('No token received'));
          return;
        }

        signInWithCustomToken(auth, token)
          .then(resolve)
          .catch(reject);
      }
    );
  });
}

export function signOutUser() {
  return auth.signOut();
}
