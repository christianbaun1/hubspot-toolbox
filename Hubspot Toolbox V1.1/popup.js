document.addEventListener('DOMContentLoaded', function () {
  const categories = document.querySelectorAll('.category h2');
  const generateBtn = document.getElementById('generate-btn');
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const saveNoteBtn = document.getElementById('save-note');
  const quickNote = document.getElementById('quick-note');

  let openTab = null;

  // Pre-fill URL input with the current page URL
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    document.getElementById('url').value = tabs[0].url;
  });

  categories.forEach(category => {
    category.addEventListener('click', function () {
      const content = this.nextElementSibling;

      if (openTab && openTab !== content) {
        openTab.style.display = 'none';
      }

      if (content.style.display === 'block') {
        content.style.display = 'none';
        openTab = null;
      } else {
        content.style.display = 'block';
        openTab = content;
      }
    });
  });

  generateBtn.addEventListener('click', function () {
    if (this.textContent === 'Generate URL') {
      generateUTM();
      this.textContent = 'Copy URL';
    } else if (this.textContent === 'Copy URL') {
      copyToClipboard(document.getElementById('generated-url').textContent);
      this.textContent = 'Generate URL';
    }
  });

  // Load dark mode state
  chrome.storage.local.get(['darkModeEnabled'], function (result) {
    if (result.darkModeEnabled) {
      darkModeToggle.checked = true;
    }
  });

  darkModeToggle.addEventListener('change', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.runtime.sendMessage({ action: "toggleDarkMode", tabId: tabs[0].id }, response => {
        console.log(response.status);
      });
    });
  });

  saveNoteBtn.addEventListener('click', function () {
    const note = quickNote.value;
    chrome.storage.local.set({ quickNote: note }, function () {
      document.getElementById('note-status').textContent = 'Note saved and will remain in the extension.';
    });
  });

  chrome.storage.local.get(['quickNote'], function (result) {
    if (result.quickNote) {
      quickNote.value = result.quickNote;
    }
  });

  const colorPicker = document.getElementById('color-picker');
  const copyHexBtn = document.getElementById('copy-hex');
  const colorHex = document.getElementById('color-hex');
  const colorRgb = document.getElementById('color-rgb');
  const colorDisplay = document.getElementById('color-display');

  colorPicker.addEventListener('input', function () {
    const color = colorPicker.value;
    colorHex.textContent = color.toUpperCase();
    colorRgb.textContent = hexToRgb(color);
    colorDisplay.style.backgroundColor = color;
  });

  copyHexBtn.addEventListener('click', function () {
    const hexValue = colorHex.textContent;
    copyToClipboard(hexValue);
    copyHexBtn.textContent = "Copied!";
    setTimeout(() => copyHexBtn.textContent = "Copy HEX", 2000);
  });

  function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgb(${r}, ${g}, ${b})`;
  }

  function copyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
});

function generateUTM() {
  const url = document.getElementById('url').value;
  const utm_source = document.getElementById('utm_source').value;
  const utm_medium = document.getElementById('utm_medium').value;
  const utm_campaign = document.getElementById('utm_campaign').value;
  const utm_content = document.getElementById('utm_content').value;
  const utm_term = document.getElementById('utm_term').value;

  const params = new URLSearchParams({
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term
  });

  const generatedUrl = `${url}?${params.toString()}`;
  document.getElementById('generated-url').textContent = generatedUrl;
}

function copyToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
}
