document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const categories = document.querySelectorAll('.category');
    const tools = document.querySelectorAll('.category ul li a');

    // Search Function
    function searchTools() {
        const query = searchInput.value.toLowerCase().trim();
        
        categories.forEach(category => {
            const categoryName = category.querySelector('h2').textContent.toLowerCase();
            const toolsInCategory = category.querySelectorAll('ul li a');
            let categoryMatch = categoryName.includes(query);
            let toolMatch = false;

            toolsInCategory.forEach(tool => {
                const toolName = tool.textContent.toLowerCase();
                if (toolName.includes(query)) {
                    tool.style.display = 'block'; // Show matching tool
                    toolMatch = true;
                } else {
                    tool.style.display = 'none'; // Hide non-matching tool
                }
            });

            if (categoryMatch || toolMatch) {
                category.style.display = 'block'; // Show category if it matches or contains matching tools
            } else {
                category.style.display = 'none'; // Hide category if no tools or category name match
            }
        });
    }

    // Trigger search on button click or Enter key
    searchBtn.addEventListener('click', searchTools);
    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            searchTools();
        }
    });

    // Existing code...
    const categoriesToggle = document.querySelectorAll('.category h2');
    const generateBtn = document.getElementById('generate-btn');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const saveNoteBtn = document.getElementById('save-note');
    const quickNote = document.getElementById('quick-note');
    const pickColorBtn = document.getElementById('pick-color-btn');
    const colorPicker = document.getElementById('color-picker');
    const copyHexBtn = document.getElementById('copy-hex');
    const colorHex = document.getElementById('color-hex');
    const colorRgb = document.getElementById('color-rgb');
    const colorDisplay = document.getElementById('color-display');

    let openTab = null;

    // Trigger color picker when button is clicked
    pickColorBtn.addEventListener('click', function () {
        colorPicker.click();
    });

    // Handle color picker input
    colorPicker.addEventListener('input', function () {
        const color = colorPicker.value;
        colorHex.textContent = color.toUpperCase();
        colorRgb.textContent = hexToRgb(color);
        colorDisplay.style.backgroundColor = color;
    });

    copyHexBtn.addEventListener('click', function () {
        const hexValue = colorHex.textContent;
        copyToClipboard(hexValue);
        copyHexBtn.textContent = "Copied to Clipboard!";
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

    // Handle category click to toggle content visibility
    categoriesToggle.forEach(category => {
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

    // Pre-fill URL input with the current page URL
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        document.getElementById('url').value = tabs[0].url;
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
});
