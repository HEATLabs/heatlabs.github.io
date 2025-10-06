document.addEventListener('DOMContentLoaded', function() {
    // Initialize view counter
    fetchNewsViewCount().then(views => {
        const newsMeta = document.querySelector('.news-meta');
        if (newsMeta) {
            const viewCounter = document.createElement('span');
            viewCounter.className = 'news-views-counter';
            viewCounter.innerHTML = `
                <i class="fas fa-eye"></i>
                <span class="news-views-count">${views.totalViews.toLocaleString()}</span> views
            `;
            newsMeta.appendChild(viewCounter);
        }
    });

    // Initialize any interactive elements specific to news pages
    initializeNewsPageElements();
});

// Function to fetch view count from API
async function fetchNewsViewCount() {
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

function initializeNewsPageElements() {
    // Initialize any news-specific interactive elements here

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
        document.querySelectorAll('.news-image, .sidebar-card').forEach(el => {
            observer.observe(el);
        });
    }
}