// Store original cards array
let originalCards = [];

// Function to sort and filter news cards
function updateNewsDisplay() {
    const sortFilter = document.getElementById('sortFilter');
    const typeFilter = document.getElementById('typeFilter');
    const newsGrid = document.querySelector('.news-grid');

    const sortValue = sortFilter.value;
    const typeValue = typeFilter.value;

    // If originalCards is empty (first load), store the initial cards
    if (originalCards.length === 0) {
        originalCards = Array.from(newsGrid.querySelectorAll('.news-card'));
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

    // Clear the grid
    while (newsGrid.firstChild) {
        newsGrid.removeChild(newsGrid.firstChild);
    }

    // Add filtered and sorted cards back to the grid
    filteredCards.forEach(card => {
        newsGrid.appendChild(card.cloneNode(true));
    });

    // Reinitialize animations
    setTimeout(() => {
        const currentCards = newsGrid.querySelectorAll('.news-card');
        currentCards.forEach(card => {
            card.classList.add('animated');
        });
    }, 50);
}

// Initialize news functionality
document.addEventListener('DOMContentLoaded', function() {
    const sortFilter = document.getElementById('sortFilter');
    const typeFilter = document.getElementById('typeFilter');

    // Initialize with default sorting
    updateNewsDisplay();

    // Add event listeners for filter changes
    sortFilter.addEventListener('change', updateNewsDisplay);
    typeFilter.addEventListener('change', updateNewsDisplay);

    // Initialize animations after page load
    setTimeout(() => {
        const newsCards = document.querySelectorAll('.news-card');
        newsCards.forEach(card => {
            card.classList.add('animated');
        });
    }, 300);
});