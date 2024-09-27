// chrome-extension/src/utils/github.js
export function pushToGitHub({
  code,
  fileName,
  githubToken,
  githubUsername,
  githubRepo,
  githubBranch,
  projectName,
}) {
  return new Promise((resolve, reject) => {
    const apiUrl = `https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/${projectName}/${fileName}`;
    const branch = githubBranch || 'main';

    fetch(`${apiUrl}?ref=${branch}`, {
      method: 'GET',
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else if (response.status === 404) {
          return null;
        } else {
          throw new Error(`GitHub API responded with status ${response.status}`);
        }
      })
      .then((data) => {
        const sha = data ? data.sha : undefined;
        const content = btoa(unescape(encodeURIComponent(code)));

        const body = {
          message: sha ? `Update ${fileName}` : `Create ${fileName}`,
          content: content,
          branch: branch,
          committer: {
            name: githubUsername,
            email: `${githubUsername}@users.noreply.github.com`,
          },
          sha: sha,
        };

        return fetch(apiUrl, {
          method: 'PUT',
          headers: {
            Authorization: `token ${githubToken}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
      })
      .then((response) => {
        if (response.ok) {
          resolve();
        } else {
          return response.json().then((errData) => {
            reject(new Error(errData.message || 'Unknown error.'));
          });
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}
