document.addEventListener('DOMContentLoaded', function() {
    // API endpoints
    const STATS_API_URL = 'https://pcwstats-pixel-api.vercel.app/api/stats';
    const PIXEL_MAPPING_URL = 'https://raw.githubusercontent.com/PCWStats/Website-Configs/refs/heads/main/tracking-pixel.json';
    const GSC_INDEX_URL = 'https://raw.githubusercontent.com/PCWStats/Website-Configs/refs/heads/main/gsc-index.json';

    // DOM elements
    const totalViewsEl = document.getElementById('totalViews');
    const todaysViewsEl = document.getElementById('todaysViews');
    const trackedPagesEl = document.getElementById('trackedPages');
    const mostPopularViewsEl = document.getElementById('mostPopularViews');
    const mostPopularPageEl = document.getElementById('mostPopularPage');
    const dailyViewsChartEl = document.getElementById('dailyViewsChart');
    const topPagesChartEl = document.getElementById('topPagesChart');
    const viewsByTimeChartEl = document.getElementById('viewsByTimeChart');
    const indexedPagesChartEl = document.getElementById('indexedPagesChart');
    const viewsByCategoryChartEl = document.getElementById('viewsByCategoryChart');
    const statsTableBody = document.getElementById('statsTableBody');
    const pageSearch = document.getElementById('pageSearch');
    const sortBy = document.getElementById('sortBy');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');

    // Loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="loader-spinner"></div>
        <div class="loading-text">Loading Website Statistics</div>
        <div class="loading-subtext">Fetching and processing data...</div>
        <div class="loading-progress">
            <div class="loading-progress-bar" id="loadingProgressBar"></div>
        </div>
    `;
    document.body.appendChild(loadingOverlay);
    const loadingProgressBar = document.getElementById('loadingProgressBar');

    // Modal elements
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Page Statistics</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="modal-stats-grid" id="modalStatsGrid"></div>
      </div>
    </div>
  `;
    document.body.appendChild(modalOverlay);
    const modalTitle = modalOverlay.querySelector('.modal-title');
    const modalStatsGrid = modalOverlay.querySelector('#modalStatsGrid');
    const modalClose = modalOverlay.querySelector('.modal-close');

    // Global variables
    let statsData = {};
    let pixelMapping = {};
    let gscIndexData = {};
    let processedData = [];
    let currentPage = 1;
    const itemsPerPage = 10;
    let filteredData = [];

    // Initialize the page
    async function init() {
        try {
            showLoading();
            updateLoadingProgress(20);

            const [statsResponse, mappingResponse, gscResponse] = await Promise.all([
                fetch(STATS_API_URL),
                fetch(PIXEL_MAPPING_URL),
                fetch(GSC_INDEX_URL)
            ]);

            if (!statsResponse.ok || !mappingResponse.ok || !gscResponse.ok) {
                throw new Error('Failed to fetch data');
            }

            updateLoadingProgress(40);
            statsData = await statsResponse.json();
            updateLoadingProgress(50);
            pixelMapping = await mappingResponse.json();
            updateLoadingProgress(60);
            gscIndexData = await gscResponse.json();
            updateLoadingProgress(70);

            processData();
            updateLoadingProgress(80);
            updateSummaryCards();
            updateLoadingProgress(85);
            renderCharts();
            updateLoadingProgress(95);
            renderTable();
            updateLoadingProgress(100);
            setupEventListeners();

            // Small delay before hiding to ensure everything is rendered
            setTimeout(hideLoading, 300);
        } catch (error) {
            console.error('Error loading data:', error);
            showError();
            hideLoading();
        }
    }

    function processData() {
        processedData = [];
        const today = new Date().toISOString().split('T')[0];

        for (const [pixelFilename, pixelStats] of Object.entries(statsData)) {
            const pageInfo = pixelMapping.pixels.find(p => p.pixel_filename === pixelFilename);

            if (pageInfo) {
                const last7DaysViews = calculateLastNDaysViews(pixelStats.dailyViews, 7);
                const last30DaysViews = calculateLastNDaysViews(pixelStats.dailyViews, 30);

                // Determine if page is a main page
                const isMainPage = [
                    'tournaments.html',
                    'tanks.html',
                    'tankopedia.html',
                    'strategy-planner.html',
                    'news.html',
                    'maps.html',
                    'legal.html',
                    'index.html',
                    'guides.html',
                    'game-data.html',
                    'check-compare.html',
                    'builds.html',
                    'bug-hunting.html',
                    'blog.html',
                    '404.html',
                ].some(mainPage => pageInfo.html_file.includes(mainPage));

                processedData.push({
                    pixelFilename,
                    pageName: pageInfo.page_name,
                    htmlFile: pageInfo.html_file,
                    totalViews: pixelStats.totalViews,
                    todaysViews: pixelStats.dailyViews[today] || 0,
                    last7DaysViews,
                    last30DaysViews,
                    dailyViews: pixelStats.dailyViews,
                    category: isMainPage ? 'Main Pages' : getCategoryFromPath(pageInfo.html_file),
                    isIndexed: isPageIndexed(pageInfo.html_file)
                });
            }
        }

        filteredData = [...processedData];
    }

    function isPageIndexed(htmlFile) {
        if (!gscIndexData?.data?.pages) return false;

        const pageUrl = `https://pcwstats.github.io/${htmlFile}`;
        return gscIndexData.data.pages.some(page =>
            page.url === pageUrl &&
            page.indexing_state === 'INDEXED' &&
            page.coverage_state === 'VALID'
        );
    }

    function calculateLastNDaysViews(dailyViews, days) {
        const dates = Object.keys(dailyViews).sort().reverse();
        let sum = 0;
        let count = 0;

        for (const date of dates) {
            if (count >= days) break;
            sum += dailyViews[date];
            count++;
        }

        return sum;
    }

    function getCategoryFromPath(path) {
        if (path.includes('announcements/')) return 'Announcements';
        if (path.includes('blog/')) return 'Blog';
        if (path.includes('bug-hunting/')) return 'Bug Hunting';
        if (path.includes('guides/')) return 'Guides';
        if (path.includes('legal/')) return 'Legal';
        if (path.includes('maps/')) return 'Maps';
        if (path.includes('news/')) return 'News';
        if (path.includes('tanks/')) return 'Tanks';
        if (path.includes('tournaments/')) return 'Tournaments';
        if (path.includes('resources/')) return 'Resources';
        if (path.includes('easter-eggs/')) return 'Easter Eggs';
        return 'Other';
    }

    function updateSummaryCards() {
        const totalViews = processedData.reduce((sum, page) => sum + page.totalViews, 0);
        const todaysViews = processedData.reduce((sum, page) => sum + page.todaysViews, 0);

        let mostPopular = {
            totalViews: 0,
            pageName: ''
        };
        for (const page of processedData) {
            if (page.totalViews > mostPopular.totalViews) {
                mostPopular = {
                    totalViews: page.totalViews,
                    pageName: page.pageName
                };
            }
        }

        totalViewsEl.textContent = totalViews.toLocaleString();
        todaysViewsEl.textContent = todaysViews.toLocaleString();
        trackedPagesEl.textContent = processedData.length.toLocaleString();
        mostPopularViewsEl.textContent = mostPopular.totalViews.toLocaleString();
        mostPopularPageEl.textContent = mostPopular.pageName;
    }

    function renderCharts() {
        renderDailyViewsChart();
        renderTopPagesChart();
        renderViewsByTimeChart();
        renderIndexedPagesChart();
        renderViewsByCategoryChart();
    }

    function renderDailyViewsChart() {
        const dates = [];
        const today = new Date();

        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            dates.push(date.toISOString().split('T')[0]);
        }

        const dailyViewsData = dates.map(date => {
            let sum = 0;
            for (const page of processedData) {
                sum += page.dailyViews[date] || 0;
            }
            return sum;
        });

        const displayDates = dates.map(date => {
            const [year, month, day] = date.split('-');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}`;
        });

        new Chart(dailyViewsChartEl, {
            type: 'line',
            data: {
                labels: displayDates,
                datasets: [{
                    label: 'Daily Views',
                    data: dailyViewsData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }

    function renderTopPagesChart() {
        const topPages = [...processedData]
            .sort((a, b) => b.totalViews - a.totalViews)
            .slice(0, 10);

        const pageNames = topPages.map(page => page.pageName);
        const views = topPages.map(page => page.totalViews);

        new Chart(topPagesChartEl, {
            type: 'bar',
            data: {
                labels: pageNames,
                datasets: [{
                    label: 'Total Views',
                    data: views,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'nearest',
                        intersect: true,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                },
                indexAxis: 'y'
            }
        });
    }

    function renderViewsByTimeChart() {
        const timePeriods = ['Today', 'Last 7 Days', 'Last 30 Days', 'All Time'];
        const viewsData = [
            processedData.reduce((sum, page) => sum + page.todaysViews, 0),
            processedData.reduce((sum, page) => sum + page.last7DaysViews, 0),
            processedData.reduce((sum, page) => sum + page.last30DaysViews, 0),
            processedData.reduce((sum, page) => sum + page.totalViews, 0)
        ];

        new Chart(viewsByTimeChartEl, {
            type: 'bar',
            data: {
                labels: timePeriods,
                datasets: [{
                    label: 'Views',
                    data: viewsData,
                    backgroundColor: 'rgba(153, 102, 255, 0.7)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }

    function renderIndexedPagesChart() {
        const indexedCount = processedData.filter(page => page.isIndexed).length;
        const notIndexedCount = processedData.filter(page => !page.isIndexed).length;

        new Chart(indexedPagesChartEl, {
            type: 'pie',
            data: {
                labels: ['Indexed & Tracked', 'Tracked Not Indexed'],
                datasets: [{
                    data: [indexedCount, notIndexedCount],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 99, 132, 0.7)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    function renderViewsByCategoryChart() {
        const categories = {};
        const today = new Date();

        // Calculate views by category for last 30 days
        processedData.forEach(page => {
            if (!categories[page.category]) {
                categories[page.category] = 0;
            }

            // Sum views for last 30 days
            for (let i = 0; i < 30; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                categories[page.category] += page.dailyViews[dateStr] || 0;
            }
        });

        const sortedCategories = Object.entries(categories)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10); // Limit to top 10 categories

        new Chart(viewsByCategoryChartEl, {
            type: 'bar',
            data: {
                labels: sortedCategories.map(item => item[0]),
                datasets: [{
                    label: 'Views',
                    data: sortedCategories.map(item => item[1]),
                    backgroundColor: 'rgba(153, 102, 255, 0.7)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }

    function renderTable() {
        applySorting();
        const totalPages = Math.ceil(filteredData.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length);
        const pageData = filteredData.slice(startIndex, endIndex);

        statsTableBody.innerHTML = '';

        for (const page of pageData) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${page.pageName}</td>
                <td>${page.todaysViews.toLocaleString()}</td>
                <td>${page.totalViews.toLocaleString()}</td>
                <td>${page.last7DaysViews.toLocaleString()}</td>
                <td>${page.last30DaysViews.toLocaleString()}</td>
                <td>
                    <button class="view-details-btn" data-page="${page.pageName}">
                        <i class="fas fa-chart-line mr-1"></i>Details
                    </button>
                </td>
            `;
            statsTableBody.appendChild(row);
        }

        updatePaginationControls(totalPages);
    }

    function applySorting() {
        const [sortKey, sortDir] = sortBy.value.split('-');
        filteredData.sort((a, b) => {
            let comparison = 0;
            if (sortKey === 'total') {
                comparison = a.totalViews - b.totalViews;
            } else if (sortKey === 'name') {
                comparison = a.pageName.localeCompare(b.pageName);
            }
            return sortDir === 'desc' ? -comparison : comparison;
        });
    }

    function updatePaginationControls(totalPages) {
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= totalPages;
    }

    function setupEventListeners() {
        pageSearch.addEventListener('input', () => {
            const searchTerm = pageSearch.value.toLowerCase();
            filteredData = searchTerm ?
                processedData.filter(page =>
                    page.pageName.toLowerCase().includes(searchTerm) ||
                    page.htmlFile.toLowerCase().includes(searchTerm)
                ) : [...processedData];
            currentPage = 1;
            renderTable();
        });

        sortBy.addEventListener('change', () => {
            currentPage = 1;
            renderTable();
        });

        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        });

        nextPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredData.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderTable();
            }
        });

        statsTableBody.addEventListener('click', (e) => {
            if (e.target.closest('.view-details-btn')) {
                const pageName = e.target.closest('.view-details-btn').dataset.page;
                viewPageDetails(pageName);
            }
        });

        modalClose.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
    }

    function viewPageDetails(pageName) {
        const page = processedData.find(p => p.pageName === pageName);
        if (!page) return;

        modalTitle.textContent = page.pageName;

        modalStatsGrid.innerHTML = `
      <div class="modal-stat-item">
        <div class="modal-stat-label">Total Views</div>
        <div class="modal-stat-value">${page.totalViews.toLocaleString()}</div>
      </div>
      <div class="modal-stat-item">
        <div class="modal-stat-label">Today's Views</div>
        <div class="modal-stat-value">${page.todaysViews.toLocaleString()}</div>
      </div>
      <div class="modal-stat-item">
        <div class="modal-stat-label">Last 7 Days</div>
        <div class="modal-stat-value">${page.last7DaysViews.toLocaleString()}</div>
      </div>
      <div class="modal-stat-item">
        <div class="modal-stat-label">Last 30 Days</div>
        <div class="modal-stat-value">${page.last30DaysViews.toLocaleString()}</div>
      </div>
      <div class="modal-stat-item">
        <div class="modal-stat-label">Category</div>
        <div class="modal-stat-value">${page.category}</div>
      </div>
      <div class="modal-stat-item">
        <div class="modal-stat-label">Page URL</div>
        <div class="modal-stat-value" style="word-break: break-all;">${page.htmlFile}</div>
      </div>
      <div class="modal-stat-item">
        <div class="modal-stat-label">Indexed Status</div>
        <div class="modal-stat-value">${page.isIndexed ? 'Indexed' : 'Not Indexed'}</div>
      </div>
    `;

        openModal();
    }

    function openModal() {
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showLoading() {
        loadingOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        updateLoadingProgress(10);
    }

    function hideLoading() {
        loadingOverlay.classList.add('hidden');
        document.body.style.overflow = '';
    }

    function updateLoadingProgress(percent) {
        loadingProgressBar.style.width = `${percent}%`;
    }

    function showError() {
        alert('Failed to load statistics data. Please try again later.');
    }

    init();
});