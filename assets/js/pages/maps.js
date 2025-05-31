// Function to fetch view count from API
async function fetchViewCount(imageName) {
    try {
        const response = await fetch(`https://pcwstats-pixel-api.vercel.app/api/stats?image=pcwstats-tracker-pixel-${imageName}.png`);
        if (!response.ok) {
            throw new Error('Failed to load view count');
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading view count:', error);
        return { totalViews: 0 }; // Return 0 if there's an error
    }
}

// Function to update view counters on all map cards
async function updateMapViewCounters() {
    const mapCards = document.querySelectorAll('.map-card');

    for (const card of mapCards) {
        const mapLink = card.querySelector('a.btn-map');
        if (mapLink) {
            // Extract the map name from the href (e.g., "maps/nord-oko.html" -> "nord-oko")
            const mapName = mapLink.getAttribute('href').split('/').pop().replace('.html', '');

            // Fetch the view count
            const viewsData = await fetchViewCount(mapName);
            const viewsElement = card.querySelector('.views-count');

            if (viewsElement) {
                viewsElement.textContent = viewsData.totalViews.toLocaleString();
            }
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    updateMapViewCounters();
});