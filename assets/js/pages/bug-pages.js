document.addEventListener('DOMContentLoaded', function() {
    // Initialize view counter
    fetchBugViewCount().then(views => {
        const bugMeta = document.querySelector('.bug-meta');
        if (bugMeta) {
            const viewCounter = document.createElement('span');
            viewCounter.className = 'bug-views-counter';
            viewCounter.innerHTML = `
                <i class="fas fa-eye"></i>
                <span class="bug-views-count">${views.totalViews.toLocaleString()}</span> views
            `;
            bugMeta.appendChild(viewCounter);
        }
    });

    // Initialize any interactive elements specific to bug pages
    initializeBugPageElements();
});

// Function to fetch view count from API
async function fetchBugViewCount() {
    try {
        // Get the tracking pixel URL from the meta tag
        const trackingPixel = document.querySelector('.heatlabs-tracking-pixel');
        if (!trackingPixel || !trackingPixel.src) {
            return {
                totalViews: 0
            };
        }

        // Extract the image filename from the tracking pixel URL
        const imageName = trackingPixel.src.split('/').pop();

        // Build the stats API URL
        const statsApiUrl = `https://views.heatlabs.net/api/stats?image=${imageName}`;
        const response = await fetch(statsApiUrl);

        if (!response.ok) {
            throw new Error('Failed to load view count');
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading view count:', error);
        return {
            totalViews: 0
        }; // Return 0 if there's an error
    }
}

function initializeBugPageElements() {
    // Initialize any bug-specific interactive elements here

    // Example: Table of Contents smooth scrolling
    const tocLinks = document.querySelectorAll('.sidebar-card a[href^="#"]');
    tocLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });

                // Update URL hash without jumping
                if (history.pushState) {
                    history.pushState(null, null, targetId);
                } else {
                    window.location.hash = targetId;
                }
            }
        });
    });

    // Add intersection observer for animated elements if needed
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        // Observe any elements that need to animate in
        document.querySelectorAll('.bug-image, .sidebar-card').forEach(el => {
            observer.observe(el);
        });
    }
}