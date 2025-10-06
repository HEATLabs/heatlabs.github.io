// Function to fetch view count from API
async function fetchViewCount(pageName) {
    try {
        const response = await fetch(`https://views.heatlabs.net/api/stats?image=pcwstats-tracker-pixel-${pageName}.png`);
        if (!response.ok) {
            throw new Error('Failed to load view count');
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading view count:', error);
        return { totalViews: 0 }; // Return 0 if there's an error
    }
}

// Function to update view counters on all legal cards
async function updateLegalViewCounters() {
    const legalCards = document.querySelectorAll('.legal-card');

    for (const card of legalCards) {
        const legalLink = card.querySelector('a.btn-legal');
        if (legalLink) {
            // Extract the page name from the href (e.g., "legal/privacy-policy.html" -> "privacy-policy")
            const pageName = legalLink.getAttribute('href').split('/').pop().replace('.html', '');

            // Fetch the view count
            const viewsData = await fetchViewCount(pageName);
            const viewsElement = card.querySelector('.views-count');

            if (viewsElement) {
                viewsElement.textContent = viewsData.totalViews.toLocaleString();
            }
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    updateLegalViewCounters();
});