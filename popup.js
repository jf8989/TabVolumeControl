document.addEventListener('DOMContentLoaded', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = new URL(tabs[0].url);
        const domain = url.hostname; // Extract the domain name

        // Load saved volume and toggle state
        chrome.storage.local.get([domain, `active_${domain}`], (data) => {
            const volume = data[domain] || 20; // Default to 20
            const isActive = data[`active_${domain}`] ?? true; // Default to true

            const volumeSlider = document.getElementById('volume');
            const toggleSwitch = document.getElementById('extension-toggle');

            // Set initial slider value and toggle state
            volumeSlider.value = volume;
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

// Normalize slider value (0-20) to media-compatible range (0-1)
function normalizeVolume(value) {
    return value / 20;
}

function setVolumeOnPage(volume) {
    document.querySelectorAll('audio, video').forEach((media) => {
        media.volume = volume;
    });
}
