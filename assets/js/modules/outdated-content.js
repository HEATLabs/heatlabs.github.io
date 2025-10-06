document.addEventListener('DOMContentLoaded', function() {
    // Get the last update date from meta tag
    const updateDateMeta = document.querySelector('meta[name="content-update-date"]');

    if (!updateDateMeta) return;

    const lastUpdateDate = new Date(updateDateMeta.content);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Check if content is outdated (older than 6 months)
    if (lastUpdateDate < sixMonthsAgo) {
        // Create modal elements
        const overlay = document.createElement('div');
        overlay.className = 'outdated-warning-overlay';

        const modal = document.createElement('div');
        modal.className = 'outdated-warning-modal';

        const formattedDate = lastUpdateDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        modal.innerHTML = `
        <div class="outdated-warning-modal-header">
            <i class="fas fa-exclamation-triangle"></i>
            <h2 class="outdated-warning-modal-title">
                Content May Be Outdated
            </h2>
            <p class="outdated-warning-modal-subtitle">This page hasn't been updated in over 6 months</p>
        </div>
        <div class="outdated-warning-modal-content">
            <p>The information on this page was last updated on <span class="outdated-warning-modal-date">${formattedDate}</span> and may no longer be accurate.</p>
            <p>We recommend verifying this information with official sources before making decisions based on it.</p>
        </div>
        <div class="outdated-warning-modal-buttons">
            <button class="outdated-warning-modal-button outdated-warning-modal-button-secondary" id="outdatedWarningClose">
                <i class="fas fa-times mr-2"></i>Close
            </button>
            <button class="outdated-warning-modal-button outdated-warning-modal-button-primary" id="outdatedWarningSubmit">
                <i class="fas fa-paper-plane mr-2"></i>Submit Info
            </button>
        </div>
    `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Show modal after a short delay for better animation
        setTimeout(() => {
            overlay.classList.add('active');
        }, 100);

        // Handle close button click
        document.getElementById('outdatedWarningClose').addEventListener('click', function() {
            overlay.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(overlay);
            }, 300);
        });

        // Handle submit button click
        document.getElementById('outdatedWarningSubmit').addEventListener('click', function() {
            window.location.href = '../resources/contact-us';
        });

        // Close when clicking outside modal
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                overlay.classList.remove('active');
                setTimeout(() => {
                    document.body.removeChild(overlay);
                }, 300);
            }
        });
    }
});