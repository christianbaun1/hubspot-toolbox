chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleDarkMode") {
    chrome.storage.local.get(['darkModeEnabled'], function (result) {
      if (result.darkModeEnabled) {
        // Disable dark mode
        chrome.scripting.removeCSS({
          target: { tabId: request.tabId },
          files: ["darkmode.css"]
        }, () => {
          chrome.storage.local.set({ darkModeEnabled: false }, () => {
            sendResponse({ status: "disabled" });
          });
        });
      } else {
        // Enable dark mode
        chrome.scripting.insertCSS({
          target: { tabId: request.tabId },
          files: ["darkmode.css"]
        }, () => {
          chrome.storage.local.set({ darkModeEnabled: true }, () => {
            sendResponse({ status: "enabled" });
          });
        });
      }
    });
  }
  return true; // Keep the message channel open for sendResponse
});
