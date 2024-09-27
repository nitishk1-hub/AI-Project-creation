// chrome-extension/src/background.js
import { onAuthStateChanged } from './utils/auth';
import { pushToGitHub } from './utils/github';
import { functions, httpsCallable } from './firebase-config';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'pushToGitHub') {
    handlePushToGitHub(request.data, sendResponse);
    return true;
  }
});

function handlePushToGitHub(data, sendResponse) {
  onAuthStateChanged(async (user) => {
    if (user) {
      const getGitHubToken = httpsCallable(functions, 'getGitHubToken');
      try {
        const result = await getGitHubToken();
        const githubAccessToken = result.data.githubAccessToken;

        if (!githubAccessToken) {
          sendResponse({ success: false, error: 'GitHub access token not available.' });
          return;
        }

        chrome.storage.local.get(
          ['githubUsername', 'githubRepo', 'githubBranch', 'projectName'],
          (items) => {
            const { githubUsername, githubRepo, githubBranch, projectName } = items;

            if (!githubUsername || !githubRepo || !projectName) {
              sendResponse({ success: false, error: 'GitHub configuration not set.' });
              return;
            }

            pushToGitHub({
              code: data.code,
              fileName: data.fileName,
              githubToken: githubAccessToken,
              githubUsername,
              githubRepo,
              githubBranch,
              projectName,
            })
              .then(() => {
                sendResponse({ success: true });
              })
              .catch((error) => {
                sendResponse({ success: false, error: error.message });
              });
          }
        );
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    } else {
      sendResponse({ success: false, error: 'User not authenticated.' });
    }
  });
}
