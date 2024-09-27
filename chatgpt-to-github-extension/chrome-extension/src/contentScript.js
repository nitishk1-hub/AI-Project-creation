import { onAuthStateChanged } from './utils/auth';
import { showNotification } from './utils/notifications';

onAuthStateChanged((user) => {
  if (user) {
    startExtension();
  } else {
    console.log('User not authenticated.');
  }
});

function startExtension() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          processNode(node);
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  function processNode(node) {
    if (node.matches && node.matches('pre')) {
      addPushButton(node);
    } else {
      const codeBlocks = node.querySelectorAll('pre');
      codeBlocks.forEach(addPushButton);
    }
  }

  function addPushButton(preElement) {
    if (preElement.querySelector('.push-to-github-button')) {
      return;
    }

    const button = document.createElement('button');
    button.innerText = 'Push to GitHub';
    button.className = 'push-to-github-button';
    button.style.margin = '5px';

    button.addEventListener('click', () => {
      pushCodeToGitHub(preElement);
    });

    preElement.insertBefore(button, preElement.firstChild);
  }

  function pushCodeToGitHub(preElement) {
    const codeElement = preElement.querySelector('code');
    const code = codeElement ? codeElement.innerText : preElement.innerText;

    let fileName = extractFileName(preElement);

    if (!fileName) {
      fileName = prompt('Enter file name to save on GitHub (including path):', generateFileName(codeElement));
    }

    if (fileName) {
      chrome.runtime.sendMessage(
        {
          action: 'pushToGitHub',
          data: {
            code: code,
            fileName: fileName,
          },
        },
        (response) => {
          if (response && response.success) {
            showNotification('Code pushed to GitHub successfully.');
          } else {
            showNotification('Failed to push code to GitHub: ' + (response.error || ''), false);
          }
        }
      );
    }
  }

  function extractFileName(preElement) {
    return null;
  }

  function generateFileName(codeElement) {
    const languageClass = codeElement ? codeElement.className : '';
    const languageMatch = languageClass.match(/language-(\w+)/);
    const language = languageMatch ? languageMatch[1] : 'txt';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `snippet-${timestamp}.${language}`;
  }
}
