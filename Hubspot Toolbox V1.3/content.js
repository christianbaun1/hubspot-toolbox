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

// Listen for changes to dark mode
chrome.storage.onChanged.addListener(function (changes, namespace) {
  if (namespace === 'local' && changes.darkModeEnabled) {
    if (changes.darkModeEnabled.newValue) {
      enableDarkMode();
    } else {
      disableDarkMode();
    }
  }
});
