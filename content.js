function applyVolume(volume) {
    const normalizedVolume = volume / 20; // Normalize to 0-1 range
    document.querySelectorAll('audio, video').forEach((media) => {
        media.volume = normalizedVolume;
    });
}

function initObserver() {
    let observer;

    try {
        observer = new MutationObserver(() => {
            // Check if the extension context is still valid
            if (chrome && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get(window.location.hostname, (data) => {
                    if (chrome.runtime.lastError) {
                        console.warn("Extension context invalidated during volume update.");
                        return;
                    }
                    const volume = data[window.location.hostname] || 20; // Default to 20
                    applyVolume(volume);
                });
            } else {
                console.warn("Extension context invalidated. Disconnecting observer.");
                if (observer) observer.disconnect(); // Disconnect the observer
            }
        });

        // Start observing for changes
        observer.observe(document.body, { childList: true, subtree: true });

        // Apply volume to existing media elements
        if (chrome && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get(window.location.hostname, (data) => {
                if (chrome.runtime.lastError) {
                    //console.warn("Extension context invalidated during initial volume application.");
                    return;
                }
                const volume = data[window.location.hostname] || 20; // Default to 20
                applyVolume(volume);
            });
        }
    } catch (error) {
        console.error("Error initializing observer:", error);
        if (observer) observer.disconnect(); // Ensure observer is disconnected on failure
    }
}

// Ensure document.body is ready before initializing the observer
if (document.body) {
    initObserver();
} else {
    document.addEventListener('DOMContentLoaded', initObserver);
}
