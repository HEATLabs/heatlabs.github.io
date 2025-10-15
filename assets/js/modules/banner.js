/* HEATLabs Banner System */
document.addEventListener('DOMContentLoaded', () => {
    // Debug mode - set to true to see console logs
    const DEBUG = false;

    // Banner configuration
    const BANNER_CONFIG_URL = '"https://cdn1.heatlabs.net/banner.json';
    const BANNER_STORAGE_KEY = 'heatlabs_banner_dismissed';
    const BANNER_EXPIRY_DAYS = 7;

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[BANNER]', ...args);
        }
    }

    // Create banner element
    function createBanner(bannerData) {
        debugLog('Creating banner with data:', bannerData);

        const {
            message,
            ctaText,
            ctaUrl,
            backgroundColor,
            textColor,
            buttonColor
        } = bannerData;

        // Create banner container
        const banner = document.createElement('div');
        banner.className = 'site-banner';
        if (backgroundColor) banner.style.backgroundColor = backgroundColor;
        if (textColor) banner.style.color = textColor;

        // Create banner content wrapper
        const bannerContent = document.createElement('div');
        bannerContent.className = 'banner-content';

        // Add message text
        const messageElement = document.createElement('p');
        messageElement.innerHTML = message;
        bannerContent.appendChild(messageElement);

        // Create buttons container
        const bannerButtons = document.createElement('div');
        bannerButtons.className = 'banner-buttons';

        // Add CTA button if provided
        if (ctaText && ctaUrl) {
            const ctaButton = document.createElement('a');
            ctaButton.href = ctaUrl;
            ctaButton.className = 'banner-cta-button';
            ctaButton.textContent = ctaText;
            if (buttonColor) ctaButton.style.backgroundColor = buttonColor;
            bannerButtons.appendChild(ctaButton);
        }

        // Add close button
        const closeButton = document.createElement('button');
        closeButton.className = 'banner-close-button';
        closeButton.innerHTML = '<i class="fas fa-times"></i>';
        closeButton.addEventListener('click', () => dismissBanner(bannerData.id));
        bannerButtons.appendChild(closeButton);

        // Assemble banner
        banner.appendChild(bannerContent);
        banner.appendChild(bannerButtons);

        return banner;
    }

    // Store banner dismissal with timestamp
    function dismissBanner(bannerId) {
        debugLog('Dismissing banner:', bannerId);

        const dismissalData = {
            id: bannerId,
            timestamp: new Date().getTime()
        };

        try {
            localStorage.setItem(BANNER_STORAGE_KEY, JSON.stringify(dismissalData));
            debugLog('Banner dismissal saved to localStorage');
        } catch (error) {
            console.error('Error saving banner dismissal to localStorage:', error);
        }

        // Remove banner from DOM
        const banner = document.querySelector('.site-banner');
        if (banner) {
            banner.classList.add('banner-dismissed');
            setTimeout(() => {
                banner.remove();
            }, 300);
        }
    }

    // Check if banner was dismissed within the expiry period
    function isBannerDismissed(bannerId) {
        try {
            const dismissalDataString = localStorage.getItem(BANNER_STORAGE_KEY);
            debugLog('Stored dismissal data:', dismissalDataString);

            if (!dismissalDataString) {
                debugLog('No dismissal data found');
                return false;
            }

            const dismissalData = JSON.parse(dismissalDataString);

            // If this is a different banner ID, show the new banner
            if (dismissalData.id !== bannerId) {
                debugLog('Different banner ID, showing new banner');
                return false;
            }

            const dismissedTime = dismissalData.timestamp;
            const currentTime = new Date().getTime();
            const expiryTime = BANNER_EXPIRY_DAYS * 24 * 60 * 60 * 1000; // 7 days in milliseconds (thanks JavaScript)
            const timeElapsed = currentTime - dismissedTime;
            const isExpired = timeElapsed >= expiryTime;

            debugLog('Time since dismissal:', Math.floor(timeElapsed / (1000 * 60 * 60 * 24)), 'days');
            debugLog('Dismissal expired?', isExpired);

            // Check if the dismissal has expired
            return !isExpired;
        } catch (e) {
            console.error('Error parsing banner dismissal data:', e);
            return false;
        }
    }

    // Display the banner on the page
    function displayBanner(bannerData) {
        debugLog('Displaying banner on page');
        const banner = createBanner(bannerData);

        // Insert after header
        const header = document.querySelector('header.navbar');
        if (header) {
            debugLog('Found header, inserting after it');
            if (header.nextElementSibling) {
                header.parentNode.insertBefore(banner, header.nextElementSibling);
            } else {
                header.parentNode.appendChild(banner);
            }
        } else {
            debugLog('No header found, prepending to body');
            document.body.prepend(banner);
        }

        // Animate banner entrance (delayed to ensure DOM is ready)
        setTimeout(() => {
            banner.classList.add('banner-visible');
        }, 100);
    }

    // Check if there's mock banner data for testing
    const mockBanner = {
        id: "test-banner",
        active: true,
        message: "⚠️ <strong>Test Banner</strong> - This is a test banner to verify the banner system is working.",
        ctaText: "Learn More",
        ctaUrl: "#"
    };

    // Fetch and process banner data
    async function fetchBannerData() {
        try {
            debugLog('Fetching banner data from:', BANNER_CONFIG_URL);
            const response = await fetch(BANNER_CONFIG_URL, {
                method: 'GET',
                cache: 'no-cache',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch banner config: ${response.status}`);
            }

            const bannerData = await response.json();
            debugLog('Banner data fetched:', bannerData);

            processBannerData(bannerData);
        } catch (error) {
            console.error('Error loading banner from remote source:', error);

            // Fallback to mock banner for testing
            if (DEBUG) {
                debugLog('Using mock banner for testing');
                processBannerData(mockBanner);
            }
        }
    }

    // Process the banner data and determine whether to show it
    function processBannerData(bannerData) {
        // Check if banner exists and is active
        if (!bannerData || !bannerData.active) {
            debugLog('Banner is not active or data missing');
            return;
        }

        // Check if banner is scheduled for the current date
        if (bannerData.startDate || bannerData.endDate) {
            const currentDate = new Date();

            if (bannerData.startDate) {
                const startDate = new Date(bannerData.startDate);
                if (currentDate < startDate) {
                    debugLog('Banner not active yet, scheduled for:', bannerData.startDate);
                    return;
                }
            }

            if (bannerData.endDate) {
                const endDate = new Date(bannerData.endDate);
                if (currentDate > endDate) {
                    debugLog('Banner expired on:', bannerData.endDate);
                    return;
                }
            }
        }

        // Check if banner was dismissed
        if (isBannerDismissed(bannerData.id)) {
            debugLog('Banner was dismissed within expiry period');
            return;
        }

        // Display the banner
        displayBanner(bannerData);
    }

    // Initialize banner system
    debugLog('Banner system initializing');
    fetchBannerData();
});