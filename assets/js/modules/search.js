document.addEventListener('DOMContentLoaded', function() {
    const openSearchBtn = document.getElementById('openSearch');
    const searchModal = document.getElementById('searchModal');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = document.querySelector('.search-modal-input');
    const searchResultsContainer = document.querySelector('.search-results-container');
    const searchPlaceholder = document.querySelector('.search-results-placeholder');
    const pastSearchesContainer = document.querySelector('.past-searches-tags');
    let searchData = [];
    let pastSearches = JSON.parse(localStorage.getItem('pastSearches')) || [];
    let currentResults = []; // Track current search results

    // Load search data
    fetch('https://raw.githubusercontent.com/PCWStats/Website-Configs/refs/heads/main/search-keywords.json')
        .then(response => response.json())
        .then(data => {
            searchData = data;
            updatePastSearchesDisplay();
        })
        .catch(error => {
            console.error('Error loading search data:', error);
        });

    // Open search modal
    openSearchBtn.addEventListener('click', function() {
        searchModal.classList.add('open');
        searchOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        searchInput.focus();
        updatePastSearchesDisplay();
    });

    // Close search modal
    function closeSearch() {
        searchModal.classList.remove('open');
        searchOverlay.classList.remove('open');
        document.body.style.overflow = '';
        searchInput.value = '';
        clearResults();
    }

    // Close when clicking on overlay
    searchOverlay.addEventListener('click', closeSearch);

    // Close with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && searchModal.classList.contains('open')) {
            closeSearch();
        }
    });

    // Handle Enter key to open first result
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent default form submission

            const query = searchInput.value.trim().toLowerCase();

            // Perform search immediately to ensure currentResults is up-to-date
            currentResults = searchPages(query);

            if (currentResults.length > 0) {
                // Save search term to past searches
                saveToPastSearches(query);

                // Navigate to the first result
                window.location.href = currentResults[0].path;
            }
        }
    });

    // Handle search input with debounce
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = this.value.trim().toLowerCase();
            if (query.length === 0) {
                clearResults();
                return;
            }

            currentResults = searchPages(query);
            displayResults(currentResults);
        }, 200);
    });

    // Save to past searches
    function saveToPastSearches(query) {
        if (query.length > 0 && !pastSearches.includes(query)) {
            pastSearches.unshift(query);
            if (pastSearches.length > 5) {
                pastSearches.pop();
            }
            localStorage.setItem('pastSearches', JSON.stringify(pastSearches));
            updatePastSearchesDisplay();
        }
    }

    // Update past searches display
    function updatePastSearchesDisplay() {
        pastSearchesContainer.innerHTML = '';

        if (pastSearches.length === 0) {
            pastSearchesContainer.innerHTML = '<p class="no-past-searches">No past searches yet</p>';
            return;
        }

        pastSearches.slice(0, 5).forEach(search => {
            const displayText = search.length > 20 ? search.substring(0, 20) + '...' : search;
            const tag = document.createElement('span');
            tag.className = 'past-search-tag';
            tag.textContent = displayText;
            tag.title = search; // Show full text on hover
            tag.addEventListener('click', function() {
                searchInput.value = search;
                const event = new Event('input', { bubbles: true });
                searchInput.dispatchEvent(event);
                searchInput.focus();
            });
            pastSearchesContainer.appendChild(tag);
        });
    }

    // Search function
    function searchPages(query) {
        if (!searchData.length || query.length < 2) return [];

        // Score each page based on keyword matches
        const scoredResults = searchData.map(page => {
            let score = 0;

            // Check name
            if (page.name.toLowerCase().includes(query)) {
                score += 3;
            }

            // Check description
            if (page.description.toLowerCase().includes(query)) {
                score += 1;
            }

            // Check keywords
            page.keywords.forEach(keyword => {
                if (keyword.toLowerCase().includes(query)) {
                    score += 2;
                }
            });

            return { ...page, score };
        });

        // Filter out zero-score results and sort by score
        return scoredResults
            .filter(result => result.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);
    }

    // Display results
    function displayResults(results) {
        clearResults();

        if (results.length === 0) {
            searchPlaceholder.innerHTML = `
                <i class="fas fa-search-minus"></i>
                <p>No results found for your search</p>
            `;
            return;
        }

        searchPlaceholder.style.display = 'none';

        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-results';

        results.forEach(result => {
            const resultElement = document.createElement('a');
            resultElement.href = result.path;
            resultElement.className = 'search-result-item';

            resultElement.innerHTML = `
                <h4>${result.name}</h4>
                <p>${result.description}</p>
            `;

            // Add click event to save search term when result is clicked
            resultElement.addEventListener('click', function() {
                const query = searchInput.value.trim().toLowerCase();
                saveToPastSearches(query);
            });

            resultsContainer.appendChild(resultElement);
        });

        searchResultsContainer.appendChild(resultsContainer);
    }

    // Clear results
    function clearResults() {
        searchResultsContainer.querySelectorAll('.search-results').forEach(el => el.remove());

        searchPlaceholder.style.display = 'flex';
        searchPlaceholder.innerHTML = `
            <i class="fas fa-search"></i>
            <p>Your search results will appear here</p>
        `;
    }
});