// Load the saved volume value when the popup is opened
document.addEventListener('DOMContentLoaded', () => {
    // Get the saved volume from storage
    chrome.storage.local.get('currentVolume', (data) => {
        // Use the saved volume, or default to 1 if no value is set
        const volume = data.currentVolume || 1;
        const volumeSlider = document.getElementById('volume');

        // Set the slider's value to the saved volume
        volumeSlider.value = volume;

        // Apply the saved volume to the current tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: setVolumeOnPage,
                args: [volume],
            });
        });
    });
});

// Handle volume slider input
document.getElementById('volume').addEventListener('input', (event) => {
    const volume = event.target.value;

    // Save the volume value to local storage
    chrome.storage.local.set({ currentVolume: volume });

    // Apply the new volume to the current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: setVolumeOnPage,
            args: [volume],
        });
    });
});

// Function to set the volume of all audio/video elements on the page
function setVolumeOnPage(volume) {
    document.querySelectorAll('audio, video').forEach((media) => {
        media.volume = volume;
    });
}
