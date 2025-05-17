document.addEventListener('DOMContentLoaded', function() {
  // Fetch changelog data from GitHub
  fetchChangelogData();

  // Add event listeners for back to top button
  setupBackToTop();
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

  // Calculate statistics
  const stats = calculateStats(updates);

  let html = `
    <div class="changelog-stats">
      <div class="stat-card additions">
        <div class="stat-value">${stats.totalAdded}</div>
        <div class="stat-label">Additions</div>
      </div>
      <div class="stat-card changes">
        <div class="stat-value">${stats.totalChanged}</div>
        <div class="stat-label">Changes</div>
      </div>
      <div class="stat-card removals">
        <div class="stat-value">${stats.totalRemoved}</div>
        <div class="stat-label">Removals</div>
      </div>
      <div class="stat-card updates">
        <div class="stat-value">${stats.totalUpdates}</div>
        <div class="stat-label">Updates</div>
      </div>
    </div>
  `;

  updates.forEach(update => {
    html += `
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
          ${update.added.length > 0 ? `
            <div class="update-section added">
              <h4><i class="fas fa-plus-circle"></i> Added</h4>
              <ul class="update-list">
                ${update.added.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${update.changed.length > 0 ? `
            <div class="update-section changed">
              <h4><i class="fas fa-exchange-alt"></i> Changed</h4>
              <ul class="update-list">
                ${update.changed.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${update.removed.length > 0 ? `
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
  });

  changelogContainer.innerHTML = html;
}

function calculateStats(updates) {
  let totalAdded = 0;
  let totalChanged = 0;
  let totalRemoved = 0;

  updates.forEach(update => {
    totalAdded += update.added.length;
    totalChanged += update.changed.length;
    totalRemoved += update.removed.length;
  });

  return {
    totalAdded,
    totalChanged,
    totalRemoved,
    totalUpdates: updates.length
  };
}

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Make fetchChangelogData available globally for retry button
window.fetchChangelogData = fetchChangelogData;