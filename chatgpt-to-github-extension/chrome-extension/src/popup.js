// chrome-extension/src/popup.js
import { onAuthStateChanged, signInWithGitHub, signOutUser } from './utils/auth';

document.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged((user) => {
    if (user) {
      document.getElementById('status').textContent = 'Logged in';
      document.getElementById('authButton').textContent = 'Logout';
      document.getElementById('authButton').addEventListener('click', logout);
    } else {
      document.getElementById('status').textContent = 'Not logged in';
      document.getElementById('authButton').textContent = 'Login with GitHub';
      document.getElementById('authButton').addEventListener('click', login);
    }
  });
});

function login() {
  signInWithGitHub()
    .then(() => {
      window.location.reload();
    })
    .catch((error) => {
      console.error('Login error:', error);
    });
}

function logout() {
  signOutUser()
    .then(() => {
      window.location.reload();
    })
    .catch((error) => {
      console.error('Logout error:', error);
    });
}
