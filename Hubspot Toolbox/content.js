chrome.storage.local.get(['darkModeEnabled'], function (result) {
  if (result.darkModeEnabled) {
    enableDarkMode();
  } else {
    disableDarkMode();
  }
});

function enableDarkMode() {
  let style = document.getElementById('dark-mode-style');
  if (!style) {
    style = document.createElement('style');
    style.id = 'dark-mode-style';
    style.innerHTML = `
      html {
        filter: invert(1) hue-rotate(180deg);
      }
      img, video {
        filter: invert(1) hue-rotate(180deg);
      }
    `;
    document.head.appendChild(style);
  }
}

function disableDarkMode() {
  const style = document.getElementById('dark-mode-style');
  if (style) {
    style.remove();
  }
}
