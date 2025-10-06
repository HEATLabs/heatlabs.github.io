// Guide Page JS for HEAT Labs
document.addEventListener('DOMContentLoaded', function() {
    // Initialize any interactive elements specific to guide pages
    initializeGuidePageElements();

    // Fetch and display view count
    fetchViewCount().then(views => {
        const guideMeta = document.querySelector('.guide-meta');
        if (guideMeta) {
            const viewCounter = document.createElement('span');
            viewCounter.className = 'guide-views-counter';
            viewCounter.innerHTML = `
                <i class="fas fa-eye"></i>
                <span class="guide-views-count">${views.totalViews.toLocaleString()}</span> views
            `;
            guideMeta.appendChild(viewCounter);
        }
    });
});

// Function to fetch view count from API
async function fetchViewCount() {
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

function initializeGuidePageElements() {
    // Initialize image gallery if needed
    if (typeof initializeImageGallery === 'function') {
        initializeImageGallery();
    }

    // Initialize FAQ accordion if present
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                // Close all other FAQ items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });

                // Toggle current item
                item.classList.toggle('active');
            });
        }
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
        document.querySelectorAll('.guide-image, .sidebar-card').forEach(el => {
            observer.observe(el);
        });
    }

    // Initialize table of contents navigation
    const tocLinks = document.querySelectorAll('.sidebar-card a[href^="#"]');
    tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Calculate offset based on header height
                const headerHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
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
}