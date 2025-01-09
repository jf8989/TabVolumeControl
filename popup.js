document.addEventListener('DOMContentLoaded', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = new URL(tabs[0].url);
        const domain = url.hostname; // Extract the domain name

        chrome.storage.local.get([domain], (data) => {
            const volume = data[domain] || 20; // Default to 20 if no value is stored
            const volumeSlider = document.getElementById('volume');

            // Set the slider's value to the stored volume
            volumeSlider.value = volume;

            // Apply the stored volume to the current tab, normalized
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: setVolumeOnPage,
                args: [normalizeVolume(volume)],
            });
        });
    });
});

document.getElementById('volume').addEventListener('input', (event) => {
    const volume = event.target.value;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = new URL(tabs[0].url);
        const domain = url.hostname; // Extract the domain name

        // Save the volume for this domain
        chrome.storage.local.set({ [domain]: volume });

        // Apply the new volume to the current tab, normalized
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: setVolumeOnPage,
            args: [normalizeVolume(volume)],
        });
    });
});

// Normalize slider value (0-20) to media-compatible range (0-1)
function normalizeVolume(value) {
    return value / 20; // Convert 0-20 to 0-1
}

function setVolumeOnPage(volume) {
    document.querySelectorAll('audio, video').forEach((media) => {
        media.volume = volume;
    });
}
