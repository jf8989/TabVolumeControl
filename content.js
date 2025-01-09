function applyVolume(volume) {
    const normalizedVolume = volume / 20; // Normalize to 0-1 range
    document.querySelectorAll('audio, video').forEach((media) => {
        media.volume = normalizedVolume;
    });
}

function observeDynamicMedia() {
    const domain = window.location.hostname;

    chrome.storage.local.get([domain, `active_${domain}`], (data) => {
        const isActive = data[`active_${domain}`] ?? true; // Default to true
        const volume = data[domain] || 20; // Default to 20

        if (!isActive) {
            console.log(`Extension disabled for ${domain}. Skipping volume updates.`);
            return; // Skip updates if the extension is disabled for this domain
        }

        // Observe dynamic changes in the DOM
        const observer = new MutationObserver(() => {
            chrome.storage.local.get(domain, (volumeData) => {
                const updatedVolume = volumeData[domain] || 20; // Default to 20
                applyVolume(updatedVolume);
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        // Apply volume to existing media elements
        applyVolume(volume);
    });
}

function initObserver() {
    let observer;
    const domain = window.location.hostname;

    try {
        observer = new MutationObserver(() => {
            if (chrome && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get([domain, `active_${domain}`], (data) => {
                    const isActive = data[`active_${domain}`] ?? true; // Default to true
                    if (!isActive) return; // Skip updates if disabled for this domain

                    const volume = data[domain] || 20; // Default to 20
                    applyVolume(volume);
                });
            } else {
                console.warn("Extension context invalidated. Disconnecting observer.");
                if (observer) observer.disconnect(); // Disconnect the observer
            }
        });

        // Start observing dynamic DOM changes
        observer.observe(document.body, { childList: true, subtree: true });

        // Apply volume to existing media elements on initial load
        observeDynamicMedia();
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
