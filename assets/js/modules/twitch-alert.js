// Twitch Alert System
class TwitchAlert {
    constructor() {
        this.channel = 'wot_heat';
        this.banner = null;
        this.checkInterval = 60000;
        this.isCurrentlyLive = false;
        this.dismissedUntil = null;
        this.storageKey = 'twitchAlertDismissed';
        this.dismissDuration = 600000;
        this.init();
    }

    init() {
        // Load dismissed state from localStorage
        this.loadDismissedState();

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.startMonitoring());
        } else {
            this.startMonitoring();
        }
    }

    loadDismissedState() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.dismissedUntil = parseInt(stored);
                // If dismissal period has expired, clear it
                if (Date.now() > this.dismissedUntil) {
                    localStorage.removeItem(this.storageKey);
                    this.dismissedUntil = null;
                }
            }
        } catch (err) {
            // Could not access localStorage
        }
    }

    saveDismissedState() {
        try {
            const dismissUntilTime = Date.now() + this.dismissDuration;
            localStorage.setItem(this.storageKey, dismissUntilTime.toString());
            this.dismissedUntil = dismissUntilTime;
        } catch (err) {
            // Could not save to localStorage
        }
    }

    startMonitoring() {
        // Initial check
        this.checkLiveStatus();

        // Set up periodic checks
        setInterval(() => this.checkLiveStatus(), this.checkInterval);
    }

    async checkLiveStatus() {
        // Don't check if user has dismissed the alert
        if (this.dismissedUntil && Date.now() < this.dismissedUntil) {
            return false;
        }

        try {
            const res = await fetch(`https://decapi.me/twitch/uptime/${encodeURIComponent(this.channel)}`);
            const text = await res.text();

            const isLive = !text.toLowerCase().includes('offline');

            if (isLive && !this.isCurrentlyLive) {
                this.showBanner();
                this.isCurrentlyLive = true;
            } else if (!isLive && this.isCurrentlyLive) {
                this.hideBanner();
                this.isCurrentlyLive = false;
            }

            return isLive;
        } catch (err) {
            return false;
        }
    }

    showBanner() {
        // Don't show if already visible
        if (this.banner && document.body.contains(this.banner)) {
            return;
        }

        // Create banner element
        this.banner = document.createElement('div');
        this.banner.className = 'twitch-live-banner';
        this.banner.innerHTML = `
            <div class="twitch-banner-content">
                <div class="twitch-banner-info">
                    <div class="twitch-live-indicator">
                        <span class="live-dot"></span>
                        <span class="live-text">LIVE</span>
                    </div>
                    <div class="twitch-banner-message">
                        World of Tanks: HEAT is live on Twitch!
                    </div>
                </div>
                <a href="https://twitch.tv/${this.channel}" target="_blank" rel="noopener noreferrer" class="twitch-watch-btn">
                    <i class="fab fa-twitch"></i>
                    Watch Now
                </a>
                <button class="twitch-close-btn" aria-label="Close banner">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add styles
        this.addStyles();

        // Add to page
        document.body.appendChild(this.banner);

        // Add event listeners
        this.banner.querySelector('.twitch-close-btn').addEventListener('click', () => {
            this.saveDismissedState();
            this.hideBanner();
        });
    }

    hideBanner() {
        if (this.banner && document.body.contains(this.banner)) {
            this.banner.classList.add('twitch-banner-hiding');
            setTimeout(() => {
                if (this.banner && document.body.contains(this.banner)) {
                    document.body.removeChild(this.banner);
                    this.banner = null;
                }
            }, 500);
        }
        this.isCurrentlyLive = false;
    }

    addStyles() {
        if (document.getElementById('twitch-alert-styles')) return;

        const styles = `
            .twitch-live-banner {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #9146FF 0%, #6441A5 100%);
                color: white;
                border-radius: 12px;
                padding: 0;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                animation: twitchBannerSlideIn 0.5s ease-out;
                border: 1px solid rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                max-width: 440px;
                overflow: hidden;
            }

            .twitch-live-banner.twitch-banner-hiding {
                animation: twitchBannerSlideOut 0.5s ease-in forwards;
            }

            .twitch-banner-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 20px;
                gap: 16px;
            }

            .twitch-banner-info {
                display: flex;
                align-items: center;
                gap: 12px;
                flex: 1;
            }

            .twitch-live-indicator {
                display: flex;
                align-items: center;
                gap: 6px;
                background: rgba(255, 255, 255, 0.15);
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 0.75rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .live-dot {
                width: 6px;
                height: 6px;
                background: #FF0000;
                border-radius: 50%;
                animation: livePulse 2s infinite;
            }

            .twitch-banner-message {
                font-weight: 500;
                font-size: 0.9rem;
                line-height: 1.3;
            }

            .twitch-watch-btn {
                display: flex;
                align-items: center;
                gap: 6px;
                background: rgba(255, 255, 255, 0.2);
                color: white;
                text-decoration: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-weight: 600;
                font-size: 0.85rem;
                transition: all 0.3s ease;
                border: 1px solid rgba(255, 255, 255, 0.3);
            }

            .twitch-watch-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-1px);
            }

            .twitch-close-btn {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: background 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .twitch-close-btn:hover {
                background: rgba(255, 255, 255, 0.1);
            }

            @keyframes twitchBannerSlideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes twitchBannerSlideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }

            @keyframes livePulse {
                0% {
                    opacity: 1;
                    transform: scale(1);
                }
                50% {
                    opacity: 0.5;
                    transform: scale(1.1);
                }
                100% {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            /* Responsive design */
            @media (max-width: 768px) {
                .twitch-live-banner {
                    bottom: 12px;
                    right: 12px;
                    left: 12px;
                    max-width: none;
                }

                .twitch-banner-content {
                    flex-direction: column;
                    padding: 14px 16px;
                    gap: 12px;
                }

                .twitch-banner-info {
                    width: 100%;
                    flex-direction: row;
                    align-items: center;
                    gap: 10px;
                }

                .twitch-live-indicator {
                    flex-shrink: 0;
                    padding: 4px 8px;
                    font-size: 0.7rem;
                }

                .twitch-banner-message {
                    font-size: 0.9rem;
                    line-height: 1.4;
                }

                .twitch-watch-btn {
                    width: 100%;
                    justify-content: center;
                    padding: 10px 16px;
                    font-size: 0.9rem;
                }

                .twitch-close-btn {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    padding: 6px;
                }
            }

            @media (max-width: 480px) {
                .twitch-live-banner {
                    bottom: 8px;
                    right: 8px;
                    left: 8px;
                }

                .twitch-banner-content {
                    padding: 12px 14px;
                    gap: 10px;
                }

                .twitch-banner-info {
                    gap: 8px;
                }

                .twitch-live-indicator {
                    padding: 3px 6px;
                    font-size: 0.65rem;
                }

                .live-dot {
                    width: 5px;
                    height: 5px;
                }

                .twitch-banner-message {
                    font-size: 0.85rem;
                    line-height: 1.3;
                }

                .twitch-watch-btn {
                    padding: 9px 14px;
                    font-size: 0.8rem;
                }

                .twitch-close-btn {
                    top: 6px;
                    right: 6px;
                    padding: 5px;
                }
            }

            /* Dark/Light theme compatibility */
            .dark-theme .twitch-live-banner {
                border: 1px solid rgba(255, 255, 255, 0.15);
            }

            .light-theme .twitch-live-banner {
                border: 1px solid rgba(0, 0, 0, 0.1);
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.id = 'twitch-alert-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
}

// Initialize Twitch Alert when script loads
document.addEventListener('DOMContentLoaded', () => {
    new TwitchAlert();
});
