// Function to fetch view count from API
async function fetchGuideViewCount(guideName) {
    try {
        const response = await fetch(`https://views.heatlabs.net/api/stats?image=pcwstats-tracker-pixel-${guideName}.png`);
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

// Function to update view counters on all guide cards
async function updateGuideViewCounters() {
    const guideCards = document.querySelectorAll('.guide-card');

    for (const card of guideCards) {
        const guideLink = card.querySelector('a.btn-accent');
        if (guideLink) {
            // Extract the guide name from the href (e.g., "guides/tank-guides/xm1-v-build-guide.html" -> "xm1-v-build-guide")
            const guidePath = guideLink.getAttribute('href');
            const guideName = guidePath.split('/').pop().replace('.html', '');

            // Fetch the view count
            const viewsData = await fetchGuideViewCount(guideName);
            const viewsElement = card.querySelector('.views-count');

            if (viewsElement) {
                viewsElement.textContent = viewsData.totalViews.toLocaleString();
            }
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    updateGuideViewCounters();
});