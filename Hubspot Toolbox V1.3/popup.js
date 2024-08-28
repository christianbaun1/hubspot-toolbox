document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('search-input');
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

        // Reset to original state if search is empty
        if (query === '') {
            resetSearch();
        }
    }

    // Reset function to return to the original state
    function resetSearch() {
        categories.forEach(category => {
            category.style.display = 'block'; // Show all categories
            const toolsInCategory = category.querySelectorAll('ul li a');
            toolsInCategory.forEach(tool => {
                tool.style.display = 'block'; // Show all tools
            });
        });
    }

    // Trigger search dynamically as user types
    searchInput.addEventListener('input', searchTools);

    // Handling UTM Generator functionality
    const generateBtn = document.getElementById('generate-btn');

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
            this.textContent = 'Copied to Clipboard!';

            // Reset the button text after 2 seconds
            setTimeout(() => {
                this.textContent = 'Generate URL';
            }, 2000);
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

    // Handling Dark Mode toggle functionality
    const darkModeToggle = document.getElementById('dark-mode-toggle');

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

    // Handling Quick Note functionality
    const saveNoteBtn = document.getElementById('save-note');
    const quickNote = document.getElementById('quick-note');

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

    // Handling Color Picker functionality
    const pickColorBtn = document.getElementById('pick-color-btn');
    const colorPicker = document.getElementById('color-picker');
    const colorDisplay = document.getElementById('color-display');
    const colorHex = document.getElementById('color-hex');
    const colorRgb = document.getElementById('color-rgb');
    const savedColorsContainer = document.getElementById('saved-colors');
    const copyHexBtn = document.getElementById('copy-hex');

    pickColorBtn.addEventListener('click', function () {
        colorPicker.click();
    });

    colorPicker.addEventListener('input', function () {
        const color = colorPicker.value;
        colorHex.textContent = color.toUpperCase();
        colorRgb.textContent = hexToRgb(color);
        colorDisplay.style.backgroundColor = color;

        // Save the new color and update the squares
        saveColor(color);
    });

    copyHexBtn.addEventListener('click', function () {
        const hexValue = colorHex.textContent;
        copyToClipboard(hexValue);
        copyHexBtn.textContent = "Copied to Clipboard!";
        setTimeout(() => copyHexBtn.textContent = "Copy HEX", 2000);
    });

    // Load saved colors from local storage
    chrome.storage.local.get(['savedColors'], function (result) {
        if (result.savedColors) {
            displaySavedColors(result.savedColors);
        }
    });

    function saveColor(color) {
        chrome.storage.local.get(['savedColors'], function (result) {
            let colors = result.savedColors || [];
            
            // Add the new color to the beginning of the array
            colors.unshift(color);

            // Limit to 5 colors
            if (colors.length > 5) {
                colors.pop(); // Remove the oldest color
            }

            // Save updated array back to local storage
            chrome.storage.local.set({ savedColors: colors }, function () {
                displaySavedColors(colors);
            });
        });
    }

    function displaySavedColors(colors) {
        savedColorsContainer.innerHTML = ''; // Clear existing squares
        colors.forEach(color => {
            const colorSquare = document.createElement('div');
            colorSquare.className = 'color-square';
            colorSquare.style.backgroundColor = color;
            colorSquare.addEventListener('click', function () {
                // Update color picker value without re-rendering the squares
                colorPicker.value = color;
                colorHex.textContent = color.toUpperCase();
                colorRgb.textContent = hexToRgb(color);
                colorDisplay.style.backgroundColor = color;
            });
            savedColorsContainer.appendChild(colorSquare);
        });
    }

    function hexToRgb(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgb(${r}, ${g}, ${b})`;
    }

    // Handle category click to toggle content visibility
    const categoriesToggle = document.querySelectorAll('.category h2');
    let openTab = null;

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
});
