// Store original cards array
let originalCards = [];

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
        const dateElement = card.querySelector('.news-meta span');
        if (dateElement) {
            const dateString = card.dataset.date;
            const formattedDate = formatDate(dateString);
            dateElement.innerHTML = `<i class="fa-solid fa-calendar"></i> ${formattedDate}`;
        }
    });
}

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

    // Clear the grid
    while (newsGrid.firstChild) {
        newsGrid.removeChild(newsGrid.firstChild);
    }

    // Add filtered and sorted cards back to the grid
    filteredCards.forEach(card => {
        const clonedCard = card.cloneNode(true);
        newsGrid.appendChild(clonedCard);
    });

    // Update dates in the newly added cards
    const currentCards = newsGrid.querySelectorAll('.news-card');
    updateCardDates(currentCards);

    // Reinitialize animations
    setTimeout(() => {
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