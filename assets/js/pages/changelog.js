document.addEventListener('DOMContentLoaded', function() {
    // Fetch changelog data from GitHub
    fetchChangelogData();
});

function fetchChangelogData() {
    const changelogUrl = 'https://raw.githubusercontent.com/PCWStats/Website-Configs/refs/heads/main/changelog.json';
    const changelogContainer = document.getElementById('changelogContainer');

    // Show loading state
    changelogContainer.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Loading changelog...</p>
        </div>
    `;

    fetch(changelogUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            renderChangelog(data.updates);
        })
        .catch(error => {
            console.error('Error fetching changelog:', error);
            changelogContainer.innerHTML = `
                <div class="error-message text-center py-10">
                    <i class="fas fa-exclamation-triangle text-3xl text-red-500 mb-4"></i>
                    <h3 class="text-xl font-semibold mb-2">Failed to load changelog</h3>
                    <p class="text-gray-500">We couldn't load the changelog data. Please try again later.</p>
                    <button onclick="fetchChangelogData()" class="btn-accent mt-4">
                        <i class="fas fa-sync-alt mr-2"></i>Retry
                    </button>
                </div>
            `;
        });
}

function renderChangelog(updates) {
    const changelogContainer = document.getElementById('changelogContainer');

    if (!updates || updates.length === 0) {
        changelogContainer.innerHTML = `
            <div class="empty-state text-center py-10">
                <i class="fas fa-clipboard-list text-3xl text-gray-400 mb-4"></i>
                <h3 class="text-xl font-semibold mb-2">No updates yet</h3>
                <p class="text-gray-500">Check back later for updates to the project.</p>
            </div>
        `;
        return;
    }

    // Sort updates by date (newest first)
    updates.sort((a, b) => new Date(b.date) - new Date(a.date));

    let html = `
        <div class="latest-update-section">
            <h3 class="section-title">
                <i class="fas fa-star"></i> Latest Update
            </h3>
            ${renderUpdateCard(updates[0])}
        </div>

        <div class="older-updates-section">
            <h3 class="section-title">
                <i class="fas fa-history"></i> Past Updates
                <button id="toggleOlderUpdates" class="toggle-btn">
                    <i class="fas fa-chevron-down"></i> Show All
                </button>
            </h3>
            <div class="older-updates-container" style="display: none;">
                ${updates.slice(1).map(update => renderUpdateCard(update)).join('')}
            </div>
        </div>
    `;

    changelogContainer.innerHTML = html;

    // Set up toggle functionality
    const toggleBtn = document.getElementById('toggleOlderUpdates');
    const olderUpdatesContainer = document.querySelector('.older-updates-container');

    toggleBtn.addEventListener('click', () => {
        const isHidden = olderUpdatesContainer.style.display === 'none';
        olderUpdatesContainer.style.display = isHidden ? 'block' : 'none';
        toggleBtn.innerHTML = isHidden ?
            '<i class="fas fa-chevron-up"></i> Hide' :
            '<i class="fas fa-chevron-down"></i> Show All';
    });
}

function renderUpdateCard(update) {
    const hasAdded = update.added && update.added.length > 0;
    const hasChanged = update.changed && update.changed.length > 0;
    const hasFixed = update.fixed && update.fixed.length > 0;
    const hasRemoved = update.removed && update.removed.length > 0;

    return `
        <div class="update-card">
            <div class="update-header">
                <h3 class="update-title">${update.title}</h3>
                <div class="update-meta">
                    <span class="update-version">v${update.version}</span>
                    <span class="update-date">${formatDate(update.date)}</span>
                    <span class="update-author">
                        <i class="fas fa-user"></i>
                        ${update.author}
                    </span>
                </div>
            </div>

            <p class="update-description">${update.description}</p>

            <div class="update-details">
                ${hasAdded ? `
                    <div class="update-section added">
                        <h4><i class="fas fa-plus-circle"></i> Added</h4>
                        <ul class="update-list">
                            ${update.added.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}

                ${hasChanged ? `
                    <div class="update-section changed">
                        <h4><i class="fas fa-exchange-alt"></i> Changed</h4>
                        <ul class="update-list">
                            ${update.changed.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}

                ${hasFixed ? `
                    <div class="update-section fixed">
                        <h4><i class="fas fa-bug"></i> Fixed</h4>
                        <ul class="update-list">
                            ${update.fixed.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}

                ${hasRemoved ? `
                    <div class="update-section removed">
                        <h4><i class="fas fa-minus-circle"></i> Removed</h4>
                        <ul class="update-list">
                            ${update.removed.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function formatDate(dateString) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Make fetchChangelogData available globally for retry button
window.fetchChangelogData = fetchChangelogData;