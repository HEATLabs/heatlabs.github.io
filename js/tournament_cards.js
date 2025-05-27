// Store tournament data globally
window.tournamentData = [];

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const tournamentGrid = document.querySelector('.tournament-grid');

    // Fetch tournament data from JSON file
    async function fetchTournamentData() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/PCWStats/Website-Configs/refs/heads/main/tournament_cards.json');
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

    // Create tournament card HTML
    function createTournamentCard(tournament) {
        const card = document.createElement('div');
        card.className = 'tournament-card';
        card.dataset.date = tournament.date;
        card.dataset.type = tournament.type.toLowerCase();
        card.dataset.mode = tournament.mode;

        const tournamentTag = tournament.type.toLowerCase() === 'ongoing' ? 'ongoing' : 'ended';
        const tournamentTypeHTML = tournament.type && tournament.type.trim() !== '' ?
            `<div class="${tournamentTag}-tournament-tag">${tournament.type}</div>` : '';

        card.innerHTML = `
            <div class="tournament-img-container">
                <img src="${tournament.image}" alt="${tournament.name} Preview" class="tournament-img" onerror="this.src='https://raw.githubusercontent.com/PCWStats/Website-Images/main/placeholder/imagefailedtoload.png'">
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
                        <i class="fa-solid fa-trophy"></i>About Tournament
                    </a>
                </div>
            </div>
        `;
        return card;
    }

    // Render all tournament cards
    async function renderTournamentCards() {
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

        // Dispatch event that cards are loaded
        const event = new Event('tournamentCardsLoaded');
        document.dispatchEvent(event);
    }

    renderTournamentCards();
});