// Store tournament data and cards globally
window.tournamentData = [];
let originalCards = [];
let currentPage = 1;
let postsPerPage = 12;

// Function to format date as "Month Day, Year"
function formatDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        console.warn("Invalid date format:", dateString);
        return dateString; // Return original if invalid
    }
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Function to update date displays in cards
function updateCardDates() {
    document.querySelectorAll('.tournament-date').forEach(dateElement => {
        const rawDate = dateElement.closest('.tournament-card').dataset.date;
        if (rawDate) {
            dateElement.innerHTML = `<i class="fa-solid fa-calendar"></i> ${formatDate(rawDate)}`;
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
            updateTournamentsDisplay();
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
            updateTournamentsDisplay();
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
            updateTournamentsDisplay();
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
            updateTournamentsDisplay();
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
            updateTournamentsDisplay();
        }
    });
    paginationContainer.appendChild(nextButton);
}

// Function to sort and filter tournaments cards
function updateTournamentsDisplay() {
    const sortFilter = document.getElementById('sortFilter');
    const typeFilter = document.getElementById('typeFilter');
    const postsPerPageFilter = document.getElementById('postsPerPage');
    const tournamentGrid = document.querySelector('.tournament-grid');

    const sortValue = sortFilter.value;
    const typeValue = typeFilter.value.toLowerCase();
    postsPerPage = postsPerPageFilter.value === 'all' ? originalCards.length : parseInt(postsPerPageFilter.value);

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
    tournamentGrid.innerHTML = '';

    // Add paginated cards back to the grid
    paginatedCards.forEach(card => {
        tournamentGrid.appendChild(card.cloneNode(true));
    });

    // Format card dates
    updateCardDates();

    // Update pagination controls
    updatePaginationControls(totalPages);
}

// Fetch tournament data from JSON file
async function fetchTournamentData() {
    try {
        const response = await fetch('https://cdn.jsdelivr.net/gh/PCWStats/Website-Configs@main/tournaments.json');
        // Uncomment line below to use local JSON
        // const response = await fetch('../Website-Configs/tournaments.json');
        if (!response.ok) {
            throw new Error('Failed to load tournament data');
        }
        const data = await response.json();
        window.tournamentData = data; // Store globally
        return data;
    } catch (error) {
        console.error('Error loading tournament data:', error);
        return []; // Return empty array if there's an error
    }
}

async function fetchTournamentViewCount(imageName) {
    try {
        const response = await fetch(`https://pcwstats-pixel-api.vercel.app/api/stats?image=pcwstats-tracker-pixel-${imageName}.png`);
        if (!response.ok) {
            throw new Error('Failed to load view count');
        }
        const data = await response.json();
        return data.totalViews || 0;
    } catch (error) {
        console.error('Error loading view count:', error);
        return 0; // Return 0 if there's an error
    }
}

// Function to update view counters on all tournament cards
async function updateTournamentViewCounters() {
    const tournamentCards = document.querySelectorAll('.tournament-card');

    for (const card of tournamentCards) {
        const tournamentLink = card.querySelector('a.btn-accent');
        if (tournamentLink) {
            // Extract the tournament name from the href (e.g., "tournaments/open-alpha-2-tournament.html" -> "open-alpha-2-tournament")
            const tournamentName = tournamentLink.getAttribute('href')
                .split('/').pop()
                .replace('.html', '');

            // Fetch the view count
            const views = await fetchTournamentViewCount(tournamentName);
            const viewsElement = card.querySelector('.views-count');

            if (viewsElement) {
                viewsElement.textContent = views.toLocaleString();
            }
        }
    }
}

// Create tournament card HTML
function createTournamentCard(tournament) {
    const card = document.createElement('div');
    card.className = 'tournament-card';
    card.dataset.date = tournament.date;
    card.dataset.type = tournament.type.toLowerCase();
    card.dataset.mode = tournament.mode;

    const tournamentTag = (() => {
        switch (tournament.type?.toLowerCase()) {
            case 'ended': return 'ended';
            case 'upcoming': return 'upcoming';
            case 'dev': return 'dev';
            case 'cancelled': return 'cancelled';
            default: return 'ongoing';
        }
    })();
    const tournamentTypeHTML = tournament.type && tournament.type.trim() !== '' ?
        `<div class="${tournamentTag}-tournament-tag">${tournament.type}</div>` : '<div class="ongoing-tournament-tag">Ongoing</div>';

    card.innerHTML = `
        <div class="tournament-img-container">
            <div class="tournament-views-counter">
                <i class="fas fa-eye"></i>
                <span class="views-count">0</span>
            </div>
            <img src="${tournament.image}" alt="${tournament.name} Preview" class="tournament-img" onerror="this.src='https://cdn.jsdelivr.net/gh/PCWStats/Website-Images@main/placeholder/imagefailedtoload.webp'">
            ${tournamentTypeHTML}
        </div>
        <div class="tournament-info">
            <h3>${tournament.name}</h3>
            <div class="tournament-meta items-center">
                <span class="tournament-date"><i class="fa-solid fa-calendar"></i> ${tournament.date}</span>
            </div>
            <div class="tournament-meta items-center">
                <span><i class="fa-solid fa-bomb"></i> ${tournament.mode}</span>
            </div>
            <p class="tournament-desc">${tournament.description}</p>
            <div class="tournament-buttons">
                <a href="tournaments/${tournament.slug}.html" class="btn-accent">
                    <i class="fa-solid fa-trophy mr-2"></i>About Tournament
                </a>
            </div>
        </div>
    `;

    return card;
}

// Render all tournament cards
async function renderTournamentCards() {
    const tournamentGrid = document.querySelector('.tournament-grid');
    const tournaments = await fetchTournamentData();
    tournamentGrid.innerHTML = ''; // Clear existing cards

    if (!tournaments || tournaments.length === 0) {
        tournamentGrid.innerHTML = '<p class="text-center py-10">Failed to load tournament data. Please try again later.</p>';
        return;
    }

    // Create and append cards for each tournament
    tournaments.forEach(tournament => {
        const card = createTournamentCard(tournament);
        tournamentGrid.appendChild(card);
    });

    // Store original cards for filtering/sorting
    originalCards = Array.from(tournamentGrid.querySelectorAll('.tournament-card'));

    // Initialize display with sorting/filtering
    updateTournamentsDisplay();

    // Update view counters after all cards are rendered
    await updateTournamentViewCounters();
}

// Initialize tournament functionality
document.addEventListener('DOMContentLoaded', function() {
    const sortFilter = document.getElementById('sortFilter');
    const typeFilter = document.getElementById('typeFilter');
    const postsPerPageFilter = document.getElementById('postsPerPage');

    // Render tournament cards and initialize functionality
    renderTournamentCards();

    // Add event listeners for filter changes
    if (sortFilter) {
        sortFilter.addEventListener('change', () => {
            currentPage = 1;
            updateTournamentsDisplay();
        });
    }

    if (typeFilter) {
        typeFilter.addEventListener('change', () => {
            currentPage = 1;
            updateTournamentsDisplay();
        });
    }

    if (postsPerPageFilter) {
        postsPerPageFilter.addEventListener('change', () => {
            currentPage = 1;
            updateTournamentsDisplay();
        });
    }
});