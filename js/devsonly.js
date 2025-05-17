// Store original cards array
let originalCards = [];
let currentPage = 1;
let postsPerPage = 12;

// Function to update devs display
function updatedevsDisplay() {
    const sortFilter = document.getElementById('sortFilter');
    const postsPerPageFilter = document.getElementById('postsPerPage');
    const devGrid = document.querySelector('.dev-grid');

    const sortValue = sortFilter.value;
    postsPerPage = postsPerPageFilter.value === 'all' ? originalCards.length : parseInt(postsPerPageFilter.value);

    // If originalCards is empty (first load), store the initial cards
    if (originalCards.length === 0) {
        originalCards = Array.from(devGrid.querySelectorAll('.dev-card'));
    }

    // Sort cards alphabetically
    let sortedCards = [...originalCards];
    sortedCards.sort((a, b) => {
        const titleA = a.querySelector('h3').textContent.toLowerCase();
        const titleB = b.querySelector('h3').textContent.toLowerCase();
        return sortValue === 'z-a' ? titleB.localeCompare(titleA) : titleA.localeCompare(titleB);
    });

    // Calculate pagination
    const totalPages = Math.ceil(sortedCards.length / postsPerPage);
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = Math.min(startIndex + postsPerPage, sortedCards.length);
    const paginatedCards = sortedCards.slice(startIndex, endIndex);

    // Clear the grid
    while (devGrid.firstChild) {
        devGrid.removeChild(devGrid.firstChild);
    }

    // Add paginated cards back to the grid
    paginatedCards.forEach(card => {
        const clonedCard = card.cloneNode(true);
        devGrid.appendChild(clonedCard);
    });

    // Update pagination controls
    updatePaginationControls(totalPages);

    // Reinitialize animations
    setTimeout(() => {
        const currentCards = devGrid.querySelectorAll('.dev-card');
        currentCards.forEach(card => {
            card.classList.add('animated');
        });
    }, 50);
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
            updatedevsDisplay();
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
            updatedevsDisplay();
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
            updatedevsDisplay();
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
            updatedevsDisplay();
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
            updatedevsDisplay();
        }
    });
    paginationContainer.appendChild(nextButton);
}

// Initialize dev functionality
document.addEventListener('DOMContentLoaded', function() {
    const sortFilter = document.getElementById('sortFilter');
    const postsPerPageFilter = document.getElementById('postsPerPage');

    // Initialize with default sorting
    updatedevsDisplay();

    // Add event listeners for filter changes
    sortFilter.addEventListener('change', () => {
        currentPage = 1;
        updatedevsDisplay();
    });
    postsPerPageFilter.addEventListener('change', () => {
        currentPage = 1;
        updatedevsDisplay();
    });

    // Initialize animations after page load
    setTimeout(() => {
        const devCards = document.querySelectorAll('.dev-card');
        devCards.forEach(card => {
            card.classList.add('animated');
        });
    }, 300);
});