// HEAT Labs PWA App Installation Script

// Global variables
let deferredPrompt = null;
let isIos = false;
let isStandalone = false;

// Check if the app is already installed
function checkIsPwaInstalled() {
    return (window.matchMedia('(display-mode: standalone)').matches) ||
        (window.navigator.standalone) ||
        (document.referrer.includes('android-app://'));
}

// Check if device is iOS
function checkIsIos() {
    return [
            'iPad Simulator',
            'iPhone Simulator',
            'iPod Simulator',
            'iPad',
            'iPhone',
            'iPod'
        ].includes(navigator.platform) ||
        (navigator.userAgent.includes("Mac") && "ontouchend" in document);
}

// Initialize the PWA installation functionality
function initPwaInstall() {
    isIos = checkIsIos();
    isStandalone = checkIsPwaInstalled();

    // If already installed, hide install buttons
    if (isStandalone) {
        document.getElementById('installButton').style.display = 'none';
        document.getElementById('installIosGuide').style.display = 'none';
        return;
    }

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later
        deferredPrompt = e;

        // Show install button for non-iOS devices
        if (!isIos) {
            document.getElementById('installButton').style.display = 'flex';
            document.getElementById('installIosGuide').style.display = 'none';
        } else {
            document.getElementById('installButton').style.display = 'none';
            document.getElementById('installIosGuide').style.display = 'flex';
        }
    });

    // If the app wasn't triggered by beforeinstallprompt, check if we should show iOS instructions
    if (!deferredPrompt && isIos) {
        document.getElementById('installButton').style.display = 'none';
        document.getElementById('installIosGuide').style.display = 'flex';
    }

    // If we don't detect either scenario, hide both buttons
    if (!deferredPrompt && !isIos) {
        document.getElementById('installButton').style.display = 'none';
        document.getElementById('installIosGuide').style.display = 'none';
    }

    // Set up event listeners
    setupEventListeners();
}

// Set up event listeners for buttons
function setupEventListeners() {
    // Install button click handler
    const installButton = document.getElementById('installButton');
    if (installButton) {
        installButton.addEventListener('click', async () => {
            if (deferredPrompt) {
                // Show the install prompt
                deferredPrompt.prompt();

                // Wait for the user to respond to the prompt
                const {
                    outcome
                } = await deferredPrompt.userChoice;

                // We've used the prompt, and can't use it again, so clear it
                deferredPrompt = null;

                // Hide the install button
                installButton.style.display = 'none';
            }
        });
    }

    // iOS guide button and modal handlers
    const installIosGuide = document.getElementById('installIosGuide');
    const iosGuideModal = document.getElementById('iosGuideModal');
    const closeIosGuide = document.getElementById('closeIosGuide');
    const closeIosGuideBtn = document.getElementById('closeIosGuideBtn');

    if (installIosGuide) {
        installIosGuide.addEventListener('click', () => {
            iosGuideModal.classList.remove('hidden');
        });
    }

    if (closeIosGuide) {
        closeIosGuide.addEventListener('click', () => {
            iosGuideModal.classList.add('hidden');
        });
    }

    if (closeIosGuideBtn) {
        closeIosGuideBtn.addEventListener('click', () => {
            iosGuideModal.classList.add('hidden');
        });
    }

    // Close modal when clicking outside
    if (iosGuideModal) {
        iosGuideModal.addEventListener('click', (e) => {
            if (e.target === iosGuideModal) {
                iosGuideModal.classList.add('hidden');
            }
        });
    }
}

// Track app installation
function trackAppInstallation() {
    window.addEventListener('appinstalled', () => {
        // Hide the install button
        document.getElementById('installButton').style.display = 'none';
        document.getElementById('installIosGuide').style.display = 'none';

        // Log installation or send to analytics
        console.log('HEAT Labs PWA was installed.');
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initPwaInstall();
    trackAppInstallation();

    // Add service worker registration for offline functionality
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('../../../site-data/sw.js')
                .then((registration) => {
                    console.log('SW registered: ', registration);
                })
                .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
});

// Export functions for potential module use (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initPwaInstall,
        checkIsPwaInstalled,
        checkIsIos
    };
}