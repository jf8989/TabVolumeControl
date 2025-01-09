// popup.js
document.addEventListener('DOMContentLoaded', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = new URL(tabs[0].url);
        const domain = url.hostname;

        // Load saved volume and toggle state
        chrome.storage.local.get([domain, `active_${domain}`], (data) => {
            const volume = data[domain] || 100; // Default to 100 (100%)
            const isActive = data[`active_${domain}`] ?? true; // Default to true

            const volumeSlider = document.getElementById('volume');
            const volumeDisplay = document.getElementById('volume-display');
            const toggleSwitch = document.getElementById('extension-toggle');

            // Set initial slider value and toggle state
            volumeSlider.value = volume;
            volumeDisplay.textContent = `${Math.round(volume)}%`;
            toggleSwitch.checked = isActive;

            // Enable/disable the slider based on the toggle state
            volumeSlider.disabled = !isActive;

            // Apply the stored volume if enabled
            if (isActive) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: setVolumeOnPage,
                    args: [normalizeVolume(volume)],
                });
            }
        });

        // Handle volume slider input
        document.getElementById('volume').addEventListener('input', (event) => {
            const volume = event.target.value;
            document.getElementById('volume-display').textContent = `${Math.round(volume)}%`;

            // Save the volume for this specific domain
            chrome.storage.local.set({ [domain]: volume }, () => {
                // Apply the new volume only to the current tab
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: setVolumeOnPage,
                    args: [normalizeVolume(volume)],
                });
            });
        });

        // Handle toggle switch change
        document.getElementById('extension-toggle').addEventListener('change', (event) => {
            const isActive = event.target.checked;

            // Save the toggle state for this domain
            chrome.storage.local.set({ [`active_${domain}`]: isActive }, () => {
                // Reload the current tab to apply changes
                chrome.tabs.reload(tabs[0].id);
            });

            // Enable/disable the slider based on toggle
            document.getElementById('volume').disabled = !isActive;

            // If disabled, reset volume on the page
            if (!isActive) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: setVolumeOnPage,
                    args: [1], // Reset to default volume (normalized)
                });
            }
        });
    });
});

// Normalize slider value (0-100) to media-compatible range (0-1)
function normalizeVolume(value) {
    return value / 100;
}

function setVolumeOnPage(volume) {
    document.querySelectorAll('audio, video').forEach((media) => {
        media.volume = volume;
    });
}