document.addEventListener('DOMContentLoaded', function() {
    // Check if user has already acknowledged the warning
    if (!localStorage.getItem('warningAcknowledged')) {
        // Create modal elements
        const overlay = document.createElement('div');
        overlay.className = 'warning-modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'warning-modal';

        modal.innerHTML = `
            <div class="warning-modal-header">
                <h2 class="warning-modal-title">
                    Message from the Developers
                </h2>
                <p class="warning-modal-subtitle">Please read this important notice</p>
            </div>
            <div class="warning-modal-content">
                <p class="text-center">Welcome to PCWStats! This website is currently in active development.</p>

                <ul class="warning-modal-list">
                    <li>
                        <i class="fas fa-code-branch"></i>
                        <span>Some pages or features may be incomplete</span>
                    </li>
                    <li>
                        <i class="fas fa-database"></i>
                        <span>Data may be placeholder or outdated</span>
                    </li>
                    <li>
                        <i class="fas fa-bug"></i>
                        <span>You might encounter temporary bugs</span>
                    </li>
                    <li>
                        <i class="fa-brands fa-firefox-browser"></i>
                        <span>Firefox users are encouraged to keep hardware acceleration enabled</span>
                    </li>
                </ul>
            </div>
            <button class="warning-modal-button" id="warningAcknowledge">
                <i class="fas fa-check-circle mr-2"></i>I Understand
            </button>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Show modal after a short delay for better animation
        setTimeout(() => {
            overlay.classList.add('active');
        }, 100);

        // Handle button click
        document.getElementById('warningAcknowledge').addEventListener('click', function() {
            localStorage.setItem('warningAcknowledged', 'true');
            overlay.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(overlay);
            }, 300); // Match this with your CSS transition duration
        });

        // Close when clicking outside modal (but don't set acknowledged flag)
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