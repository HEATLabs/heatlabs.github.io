// Store original cards array
let originalCards = [];
let currentPage = 1;
let postsPerPage = 12;

// Function to fetch view count from API
async function fetchBugViewCount(bugName) {
    try {
        // Remove any path prefixes and .html extension
        const baseName = bugName.replace(/^.*[\\\/]/, '').replace('.html', '');
        const response = await fetch(`https://views.heatlabs.net/api/stats?image=pcwstats-tracker-pixel-${baseName}.png`);
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

// Function to update view counters on all bug cards
async function updateBugViewCounters() {
    const bugCards = document.querySelectorAll('.bug-card');

    for (const card of bugCards) {
        const bugLink = card.querySelector('a.btn-bug');
        if (bugLink) {
            // Get the href attribute which contains the bug path
            const href = bugLink.getAttribute('href');

            // Fetch the view count using the corrected href
            const viewsData = await fetchBugViewCount(href);
            const viewsElement = card.querySelector('.views-count');

            if (viewsElement) {
                viewsElement.textContent = viewsData.totalViews.toLocaleString();
            }
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    updateBugViewCounters();
});

// Function to format date as "Month Day, Year"
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
}

// Function to update date displays in cards
function updateCardDates(cards) {
    cards.forEach(card => {
        const dateElement = card.querySelector('.bug-meta span:first-child');
        if (dateElement) {
            const dateString = card.dataset.date;
            const formattedDate = formatDate(dateString);
            dateElement.innerHTML = `<i class="fa-solid fa-calendar"></i> ${formattedDate}`;
        }
    });
}

// Function to update pagination controls
function updatePaginationControls(totalPages) {
    const paginationContainer = document.querySelector('.pagination-controls');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';

    // Previous button
    const prevButton = document.createElement('button');
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.className = 'pagination-button';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updateBugDisplay();
        }
    });
    paginationContainer.appendChild(prevButton);

    // Page numbers
    const maxVisiblePages = 3;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        const firstPageButton = document.createElement('button');
        firstPageButton.textContent = '1';
        firstPageButton.className = 'pagination-button';
        firstPageButton.addEventListener('click', () => {
            currentPage = 1;
            updateBugDisplay();
        });
        paginationContainer.appendChild(firstPageButton);

        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.className = 'pagination-ellipsis';
            paginationContainer.appendChild(ellipsis);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = `pagination-button ${i === currentPage ? 'active' : ''}`;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            updateBugDisplay();
        });
        paginationContainer.appendChild(pageButton);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.className = 'pagination-ellipsis';
            paginationContainer.appendChild(ellipsis);
        }

        const lastPageButton = document.createElement('button');
        lastPageButton.textContent = totalPages;
        lastPageButton.className = 'pagination-button';
        lastPageButton.addEventListener('click', () => {
            currentPage = totalPages;
            updateBugDisplay();
        });
        paginationContainer.appendChild(lastPageButton);
    }

    // Next button
    const nextButton = document.createElement('button');
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.className = 'pagination-button';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            updateBugDisplay();
        }
    });
    paginationContainer.appendChild(nextButton);
}

// Function to sort and filter bug cards
function updateBugDisplay() {
    const sortFilter = document.getElementById('sortFilter');
    const typeFilter = document.getElementById('typeFilter');
    const postsPerPageFilter = document.getElementById('postsPerPage');
    const bugGrid = document.querySelector('.bug-grid');

    const sortValue = sortFilter.value;
    const typeValue = typeFilter.value;
    postsPerPage = postsPerPageFilter.value === 'all' ? originalCards.length : parseInt(postsPerPageFilter.value);

    // If originalCards is empty (first load), store the initial cards
    if (originalCards.length === 0) {
        originalCards = Array.from(bugGrid.querySelectorAll('.bug-card'));
        // Update dates in original cards
        updateCardDates(originalCards);
    }

    // Filter cards by type
    let filteredCards = originalCards;
    if (typeValue !== 'all') {
        filteredCards = originalCards.filter(card => card.dataset.type === typeValue);
    }

    // Sort cards by date
    filteredCards.sort((a, b) => {
        const dateA = new Date(a.dataset.date);
        const dateB = new Date(b.dataset.date);
        return sortValue === 'latest' ? dateB - dateA : dateA - dateB;
    });

    // Calculate pagination
    const totalPages = Math.ceil(filteredCards.length / postsPerPage);
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = Math.min(startIndex + postsPerPage, filteredCards.length);
    const paginatedCards = filteredCards.slice(startIndex, endIndex);

    // Clear the grid
    while (bugGrid.firstChild) {
        bugGrid.removeChild(bugGrid.firstChild);
    }

    // Add paginated cards back to the grid
    paginatedCards.forEach(card => {
        const clonedCard = card.cloneNode(true);
        bugGrid.appendChild(clonedCard);
    });

    // Update dates in the newly added cards
    const currentCards = bugGrid.querySelectorAll('.bug-card');
    updateCardDates(currentCards);

    // Update pagination controls
    updatePaginationControls(totalPages);

    // Update view counters for the newly added cards
    updateBugViewCounters();

    setTimeout(() => {
        currentCards.forEach(card => {
            card.classList.add('animated');
        });
    }, 50);
}

// Initialize bug functionality
document.addEventListener('DOMContentLoaded', function() {
    const sortFilter = document.getElementById('sortFilter');
    const typeFilter = document.getElementById('typeFilter');
    const postsPerPageFilter = document.getElementById('postsPerPage');

    // Initialize with default sorting
    updateBugDisplay();

    // Add event listeners for filter changes
    sortFilter.addEventListener('change', () => {
        currentPage = 1;
        updateBugDisplay();
    });
    typeFilter.addEventListener('change', () => {
        currentPage = 1;
        updateBugDisplay();
    });
    postsPerPageFilter.addEventListener('change', () => {
        currentPage = 1;
        updateBugDisplay();
    });

    // Initialize animations after page load
    setTimeout(() => {
        const bugCards = document.querySelectorAll('.bug-card');
        bugCards.forEach(card => {
            card.classList.add('animated');
        });
    }, 300);
});