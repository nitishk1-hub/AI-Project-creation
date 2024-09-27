// chrome-extension/src/utils/notifications.js
export function showNotification(message, isSuccess = true) {
  const notification = document.createElement('div');
  notification.innerText = message;
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.padding = '15px';
  notification.style.backgroundColor = isSuccess ? '#4caf50' : '#f44336';
  notification.style.color = '#fff';
  notification.style.borderRadius = '5px';
  notification.style.zIndex = '9999';
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.remove();
  }, 3000);
}
