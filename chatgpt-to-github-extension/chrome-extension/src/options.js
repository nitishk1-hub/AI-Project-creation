// chrome-extension/src/options.js
import { onAuthStateChanged, signOutUser } from './utils/auth';

document.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged((user) => {
    if (user) {
      loadSettings();
    } else {
      window.location.href = 'popup.html';
    }
  });
});

function loadSettings() {
  chrome.storage.local.get(
    ['githubUsername', 'githubRepo', 'githubBranch', 'projectName'],
    (items) => {
      document.getElementById('githubUsername').value = items.githubUsername || '';
      document.getElementById('githubRepo').value = items.githubRepo || '';
      document.getElementById('githubBranch').value = items.githubBranch || '';
      document.getElementById('projectName').value = items.projectName || '';
    }
  );
}

document.getElementById('save').addEventListener('click', () => {
  const githubUsername = document.getElementById('githubUsername').value.trim();
  const githubRepo = document.getElementById('githubRepo').value.trim();
  const githubBranch = document.getElementById('githubBranch').value.trim() || 'main';
  const projectName = document.getElementById('projectName').value.trim();

  const messageDiv = document.getElementById('message');
  messageDiv.textContent = '';
  messageDiv.className = '';

  if (!githubUsername || !githubRepo || !projectName) {
    messageDiv.className = 'error';
    messageDiv.textContent = 'Please fill in all required fields.';
    return;
  }

  chrome.storage.local.set(
    {
      githubUsername,
      githubRepo,
      githubBranch,
      projectName,
    },
    () => {
      messageDiv.className = 'success';
      messageDiv.textContent = 'Settings saved successfully.';
    }
  );
});

document.getElementById('logout').addEventListener('click', () => {
  signOutUser()
    .then(() => {
      window.location.href = 'popup.html';
    })
    .catch((error) => {
      console.error('Logout error:', error);
    });
});
