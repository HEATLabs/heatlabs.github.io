// Function to fetch view count from API
async function fetchViewCount(imageName) {
    try {
        const response = await fetch(`https://views.heatlabs.net/api/stats?image=pcwstats-tracker-pixel-${imageName}.png`);
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

// Initialize filters
const filters = {
    size: [],
    status: ['Available Now']
};

// DOM elements
const activeFiltersContainer = document.querySelector('.active-filters');
const noFiltersMessage = document.querySelector('.no-filters-message');
const mapsGrid = document.querySelector('.maps-grid');
let mapCards = Array.from(document.querySelectorAll('.map-card'));

// Function to extract size from map meta
function getMapSize(card) {
    const sizeText = card.querySelector('.map-meta span:first-child').textContent;
    const sizeMatch = sizeText.match(/(\d+)m x (\d+)m/);
    if (sizeMatch) {
        return parseInt(sizeMatch[1]) * parseInt(sizeMatch[2]); // Return area in m²
    }
    return 0; // For "Unknown Size"
}

// Filter maps based on active filters
function filterMaps() {
    mapCards.forEach(card => {
        const cardStatus = card.querySelector('.map-tag')?.textContent || 'Unknown';
        const cardSize = getMapSize(card);

        const statusMatch = filters.status.length === 0 ||
            (filters.status.includes('Available Now') && cardStatus === 'Available Now') ||
            (filters.status.includes('To Be Released') && cardStatus === 'To Be Released');

        let sizeMatch = true;
        if (filters.size.length > 0) {
            if (filters.size.includes('Biggest First')) {
                // Sorting will handle this
                sizeMatch = true;
            } else if (filters.size.includes('Smallest First')) {
                // Sorting will handle this
                sizeMatch = true;
            }
        }

        if (statusMatch && sizeMatch) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });

    // Apply sorting if size filter is active
    if (filters.size.length > 0) {
        const container = document.querySelector('.maps-grid');
        const cards = Array.from(container.querySelectorAll('.map-card'));

        cards.sort((a, b) => {
            const sizeA = getMapSize(a);
            const sizeB = getMapSize(b);

            if (filters.size.includes('Biggest First')) {
                return sizeB - sizeA;
            } else {
                return sizeA - sizeB;
            }
        });

        // Re-append sorted cards
        cards.forEach(card => container.appendChild(card));
    }
}

// Toggle filter on/off
function toggleFilter(filterType, value, button) {
    // For both size and status filters, only allow one to be active at a time
    if (filterType === 'size' || filterType === 'status') {
        const isAlreadyActive = filters[filterType].includes(value);

        if (isAlreadyActive) {
            // If clicking the active filter, remove it
            filters[filterType] = [];
            button.classList.remove('active');
        } else {
            // Otherwise, set this as the only active filter
            filters[filterType] = [value];

            // Update all filter buttons of this type
            document.querySelectorAll(`.${filterType}-filter`).forEach(btn => {
                btn.classList.remove('active');
            });

            // Activate the clicked button
            button.classList.add('active');
        }
    }

    updateActiveFilters();
    filterMaps();
}

// Update active filters display
function updateActiveFilters() {
    activeFiltersContainer.innerHTML = '';

    // Check if any filters are active
    const hasFilters = filters.size.length > 0 || filters.status.length > 0;

    if (!hasFilters) {
        activeFiltersContainer.innerHTML = '<div class="no-filters-message">No filters selected</div>';
        return;
    }

    // Add size filters
    filters.size.forEach(size => {
        const pill = createFilterPill(size, 'size');
        activeFiltersContainer.appendChild(pill);
    });

    // Add status filters
    filters.status.forEach(status => {
        const pill = createFilterPill(status, 'status');
        activeFiltersContainer.appendChild(pill);
    });
}

// Create filter pill element
function createFilterPill(value, filterType) {
    const pill = document.createElement('div');
    pill.className = 'filter-pill';
    pill.innerHTML = `
        ${value}
        <button class="remove-filter" data-filter-type="${filterType}" data-value="${value}">
            <i class="fas fa-times"></i>
        </button>
    `;

    pill.querySelector('.remove-filter').addEventListener('click', function() {
        const filterType = this.getAttribute('data-filter-type');
        const value = this.getAttribute('data-value');

        // Remove from filters
        const index = filters[filterType].indexOf(value);
        if (index !== -1) {
            filters[filterType].splice(index, 1);
        }

        // Update corresponding filter button
        const button = document.querySelector(`.${filterType}-filter[data-${filterType}="${value}"]`);
        if (button) button.classList.remove('active');

        updateActiveFilters();
        filterMaps();
    });

    return pill;
}

// Initialize filter buttons
function initFilterButtons() {
    // Size filter buttons
    document.querySelectorAll('.size-filter').forEach(button => {
        button.addEventListener('click', function() {
            const size = this.getAttribute('data-size');
            toggleFilter('size', size, this);
        });
    });

    // Status filter buttons
    document.querySelectorAll('.status-filter').forEach(button => {
        button.addEventListener('click', function() {
            const status = this.getAttribute('data-status');
            toggleFilter('status', status, this);
        });
    });

    // Initialize active filters display
    updateActiveFilters();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initFilterButtons();
    updateMapViewCounters();

    // Sets default map status filter to Available Now
    const availableNowBtn = document.querySelector('.status-filter[data-status="Available Now"]');
    availableNowBtn.classList.add('active');
    filterMaps();
});