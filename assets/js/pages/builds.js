// Store original builds array and tank data
let originalBuilds = [];
let tankData = [];
let currentPage = 1;
let buildsPerPage = 12;
let isLoading = false;
let hasMoreBuilds = true;
const MAX_CONCURRENT_REQUESTS = 10;
const REQUEST_DELAY = 500; // 0.5s between batches
const loaderMessages = [
    "Crafting lore out of patch notes... ",
    "Tracking Chopper's 12th rework... ",
    "Testing bugs before the bugs test us... ",
    "Loading textures... hopefully this time... ",
    "Inspecting grenades for personality... ",
    "Replacing the coffee with diesel... ",
    "Debating if Chopper is still OP... ",
    "Rebinding every control to 'E'... ",
    "Asking when is the next playtest... ",
    "Sending Titan dummies to therapy... ",
    "Breaking something to prove it’s fixed... ",
    "Watching the server hamster do laps... ",
    "Slowly testing your patience... ",
    "It still works on our machine... ",
    // Easter Egg Messages
    "Reading IAmEdWards 15000 word feedback... ",
    "Finding Shockwave's AllSpark... ",
    "Pushing antitank99 out of bounds... ",
    "Forcing Wargaming to hire Anuraen... ",
    "Getting esmatty more explosives... ",
    "Messaging SINEWAVE... ",
    "Confusing VEN0M... "
];

// Function to fetch tank data with error handling and retries
async function fetchTankData() {
    try {
        showLoader();
        const response = await fetchWithRetry(
            'https://cdn.jsdelivr.net/gh/HEATLabs/HEAT-Labs-Configs@main/tanks.json',
            3 // retry 3 times
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        tankData = await response.json();
        populateTankFilter();
        fetchBuildsData();
    } catch (error) {
        console.error('Error fetching tank data:', error);
        showError("Failed to load tank data. Please try again later.");
        hideLoader();
    }
}

// Helper function for fetch with retry
async function fetchWithRetry(url, retries, delay = 1000) {
    try {
        const response = await fetch(url);
        if (response.ok) return response;

        if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(url, retries - 1, delay * 2); // exponential backoff
        }
        throw new Error(`Failed after ${retries} retries`);
    } catch (error) {
        throw error;
    }
}

// Function to show loader with random message
function showLoader(message) {
    const buildsGrid = document.querySelector('.builds-grid');
    if (!buildsGrid) return;

    buildsGrid.innerHTML = `
        <div class="builds-loader">
            <div class="loader-spinner"></div>
            <p class="loader-message">${message || loaderMessages[Math.floor(Math.random() * loaderMessages.length)]}</p>
        </div>
    `;
}

// Function to show error message
function showError(message) {
    const buildsGrid = document.querySelector('.builds-grid');
    if (!buildsGrid) return;

    buildsGrid.innerHTML = `
        <div class="builds-loader">
            <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
            <p class="loader-message">${message}</p>
            <button id="retryLoading" class="btn-accent mt-4">
                <i class="fas fa-sync-alt mr-2"></i> Retry
            </button>
        </div>
    `;

    document.getElementById('retryLoading').addEventListener('click', () => {
        fetchTankData();
    });
}

// Function to hide loader
function hideLoader() {
    const loader = document.querySelector('.builds-loader');
    if (loader) {
        loader.remove();
    }
}

// Function to populate tank filter dropdown
function populateTankFilter() {
    updateFilterOptions();
}

// Function to fetch builds data in batches to avoid rate limits
async function fetchBuildsData() {
    if (isLoading) return;
    isLoading = true;

    try {
        // Choose a random loader message
        const randomMessage = loaderMessages[Math.floor(Math.random() * loaderMessages.length)];

        // Show initial loading message
        showLoader("Loading tank builds...");

        // Process tanks in batches
        const batchSize = MAX_CONCURRENT_REQUESTS;
        let processedTanks = 0;

        while (processedTanks < tankData.length) {
            const batch = tankData.slice(processedTanks, processedTanks + batchSize);

            // Process current batch
            await Promise.all(batch.map(tank => processTankBuilds(tank)));

            processedTanks += batchSize;

            // Update UI with what we have so far
            updateBuildsDisplay();

            // Show progress
            showLoader(`${randomMessage} (${processedTanks}/${tankData.length})`);

            // Delay before next batch if there's more to process
            if (processedTanks < tankData.length) {
                await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));
            }
        }

        hasMoreBuilds = false;
        updateBuildsDisplay();
    } catch (error) {
        console.error('Error fetching builds data:', error);
        showError("Failed to load some builds. Showing available data...");
    } finally {
        isLoading = false;
        hideLoader();
    }
}

// Process builds for a single tank
async function processTankBuilds(tank) {
    try {
        const response = await fetchWithRetry(tank.builds, 2);
        if (!response.ok) return;

        const buildsData = await response.json();
        if (buildsData.buildList && buildsData.buildList.length > 0) {
            buildsData.buildList.forEach(build => {
                if (build.buildDisplay) {
                    const fullBuild = {
                        ...build,
                        tankId: tank.id,
                        tankName: tank.name,
                        tankNation: tank.nation,
                        tankType: tank.type,
                        tankImage: tank.image,
                        tankSlug: tank.slug
                    };

                    // Check if this build already exists
                    const exists = originalBuilds.some(existingBuild =>
                        existingBuild.tankSlug === fullBuild.tankSlug &&
                        existingBuild.buildNumber === fullBuild.buildNumber
                    );

                    if (!exists) {
                        originalBuilds.push(fullBuild);
                    }
                }
            });
        }
    } catch (error) {
        console.error(`Error fetching builds for ${tank.name}:`, error);
    }
}

// Function to format date from DD-MM-YYYY to Month DD, YYYY
function formatDate(dateString) {
    if (!dateString) return 'Unknown date';

    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;

    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const day = parts[0];
    const monthIndex = parseInt(parts[1]) - 1;
    const year = parts[2];

    return `${months[monthIndex]} ${parseInt(day)}, ${year}`;
}

// Function to create and show build detail modal
function showBuildDetailModal(build) {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'build-detail-modal';
    modal.id = 'buildDetailModal';

    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'build-detail-overlay';
    overlay.id = 'buildDetailOverlay';

    // Modal content
    modal.innerHTML = `
        <div class="build-detail-content">
            <div class="build-detail-header">
                <h3>${build.buildName}</h3>
                <button class="build-detail-close" id="closeBuildDetail">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class="build-detail-body">
                <div class="build-detail-meta">
                    <div class="build-detail-tank">
                        <div class="tank-image-container">
                            <img src="${build.tankImage}" alt="${build.tankName}" class="build-tank-image-modal">
                        </div>
                        <div>
                            <h4>${build.tankName}</h4>
                            <div class="build-detail-tank-info">
                                <span class="tank-type">${build.tankType || 'Unknown'}</span>
                                <span class="tank-nation">${build.tankNation}</span>
                            </div>
                        </div>
                    </div>
                    <div class="build-detail-author">
                        <span>Created by: ${build.buildAuthor}</span>
                        <span>Date: ${formatDate(build.buildDate)}</span>
                    </div>
                </div>

                <div class="build-detail-description">
                    ${build.buildDescription || 'No description provided.'}
                </div>

                <div class="build-detail-sections">
                    <!-- Modules Section -->
                    <div class="build-detail-section">
                        <h4>Modules Section</h4>
                        <div class="build-components-grid">
                            ${build.modules.map(module => `
                                <div class="build-component-item" data-tooltip="${module.moduleDescription}">
                                    <div class="component-icon">
                                        <img src="${module.moduleIcon}" alt="${module.moduleName}">
                                    </div>
                                    <span class="component-name">${module.moduleName}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Perks Section -->
                    <div class="build-detail-section">
                        <h4>Perks Section</h4>
                        <div class="build-components-grid perks">
                            ${build.perks.map(perk => `
                                <div class="build-component-item" data-tooltip="${perk.perkDescription}">
                                    <div class="component-icon">
                                        <img src="${perk.perkIcon}" alt="${perk.perkName}">
                                    </div>
                                    <span class="component-name">${perk.perkName}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Equipment Section -->
                    <div class="build-detail-section">
                        <h4>Equipments Section</h4>
                        <div class="build-components-grid equipments">
                            ${build.equipments.map(equipment => `
                                <div class="build-component-item" data-tooltip="${equipment.equipmentDescription}">
                                    <div class="component-icon">
                                        <img src="${equipment.equipmentIcon}" alt="${equipment.equipmentName}">
                                    </div>
                                    <span class="component-name">${equipment.equipmentName}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <div class="build-detail-footer">
                <button class="btn-accent" id="copyBuildLink">
                    <i class="fas fa-link"></i> Copy Build Link
                </button>
            </div>
        </div>
    `;

    // Add to DOM
    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    // Add event listeners
    document.getElementById('closeBuildDetail').addEventListener('click', closeBuildDetailModal);
    overlay.addEventListener('click', closeBuildDetailModal);

    // Initialize tooltips
    initTooltips();

    // Copy build link functionality
    document.getElementById('copyBuildLink').addEventListener('click', () => {
        const buildUrl = `${window.location.origin}${window.location.pathname}?tank=${build.tankSlug}&build=${build.buildNumber}`;
        navigator.clipboard.writeText(buildUrl).then(() => {
            const button = document.getElementById('copyBuildLink');
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Link Copied!';
            setTimeout(() => {
                button.innerHTML = originalText;
            }, 2000);
        });
    });

    // Show modal with animation
    setTimeout(() => {
        overlay.classList.add('visible');
        modal.classList.add('visible');
    }, 10);
}

// Function to parse URL parameters
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        tank: params.get('tank'),
        build: params.get('build')
    };
}

// Function to find a build by tank slug and build number
function findBuildByParams(tankSlug, buildNumber) {
    const numBuildNumber = typeof buildNumber === 'string' ? parseInt(buildNumber) : buildNumber;

    return originalBuilds.find(build =>
        build.tankSlug === tankSlug &&
        build.buildNumber === numBuildNumber
    );
}

// Function to handle URL parameters on page load
function handleUrlParams() {
    const {
        tank,
        build
    } = getUrlParams();

    if (tank && build) {
        // Wait for builds to load before trying to find the specific build
        const checkBuildsLoaded = setInterval(() => {
            if (originalBuilds.length > 0 || !hasMoreBuilds) {
                clearInterval(checkBuildsLoaded);
                const targetBuild = findBuildByParams(tank, build);

                if (targetBuild) {
                    // Set filters to match the build's tank
                    document.getElementById('tankFilter').value = targetBuild.tankId;
                    document.getElementById('nationFilter').value = targetBuild.tankNation;
                    document.getElementById('typeFilter').value = targetBuild.tankType;
                    document.getElementById('sortFilter').value = 'featured';

                    // Force update the filter options
                    updateFilterOptions();

                    // Update the display and then show the modal
                    updateBuildsDisplay();

                    // Small delay to ensure DOM is updated
                    setTimeout(() => {
                        showBuildDetailModal(targetBuild);

                        // Update URL without reloading
                        history.replaceState({}, '',
                            `${window.location.pathname}?tank=${tank}&build=${build}`
                        );
                    }, 100);
                } else {
                    console.warn(`Build not found for tank: ${tank}, build: ${build}`);
                }
            }
        }, 100);
    }
}

// Function to initialize tooltips
function initTooltips() {
    const componentItems = document.querySelectorAll('.build-component-item');

    componentItems.forEach(item => {
        const tooltipText = item.getAttribute('data-tooltip');
        if (!tooltipText) return;

        const tooltip = document.createElement('div');
        tooltip.className = 'component-tooltip';
        tooltip.textContent = tooltipText;
        document.body.appendChild(tooltip);

        item.addEventListener('mouseenter', (e) => {
            const rect = item.getBoundingClientRect();
            tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
            tooltip.style.opacity = '1';
            tooltip.style.visibility = 'visible';
        });

        item.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
            tooltip.style.visibility = 'hidden';
        });

        item.addEventListener('mousemove', (e) => {
            tooltip.style.left = `${e.clientX - tooltip.offsetWidth / 2}px`;
            tooltip.style.top = `${e.clientY - tooltip.offsetHeight - 10}px`;
        });
    });
}

// Function to close build detail modal
function closeBuildDetailModal() {
    const modal = document.getElementById('buildDetailModal');
    const overlay = document.getElementById('buildDetailOverlay');

    if (modal && overlay) {
        modal.classList.remove('visible');
        overlay.classList.remove('visible');

        // Remove all tooltips
        document.querySelectorAll('.component-tooltip').forEach(tooltip => {
            tooltip.remove();
        });

        setTimeout(() => {
            modal.remove();
            overlay.remove();
        }, 300);
    }
}

// Function to update builds display based on filters
function updateBuildsDisplay() {
    const sortFilter = document.getElementById('sortFilter');
    const tankFilter = document.getElementById('tankFilter');
    const nationFilter = document.getElementById('nationFilter');
    const typeFilter = document.getElementById('typeFilter');
    const buildsPerPageFilter = document.getElementById('buildsPerPage');
    const buildsGrid = document.querySelector('.builds-grid');

    const sortValue = sortFilter.value;
    const tankValue = tankFilter.value;
    const nationValue = nationFilter.value;
    const typeValue = typeFilter.value;
    buildsPerPage = buildsPerPageFilter.value === 'all' ? originalBuilds.length : parseInt(buildsPerPageFilter.value);

    // Filter builds
    let filteredBuilds = originalBuilds;

    if (tankValue !== 'all') {
        filteredBuilds = filteredBuilds.filter(build => build.tankId.toString() === tankValue.toString());
    }

    if (nationValue !== 'all') {
        filteredBuilds = filteredBuilds.filter(build => build.tankNation === nationValue);
    }

    if (typeValue !== 'all') {
        filteredBuilds = filteredBuilds.filter(build => build.tankType === typeValue);
    }

    // Sort builds
    filteredBuilds.sort((a, b) => {
        // Parse dates to Date objects for comparison
        const dateA = new Date(a.buildDate.split('-').reverse().join('-'));
        const dateB = new Date(b.buildDate.split('-').reverse().join('-'));

        if (sortValue === 'oldest') {
            return dateA - dateB; // Oldest first
        } else if (sortValue === 'featured') {
            // Featured first, then by date (newest first)
            if (a.buildFeatured && !b.buildFeatured) return -1;
            if (!a.buildFeatured && b.buildFeatured) return 1;
            return dateB - dateA;
        } else {
            // Default: newest first
            return dateB - dateA;
        }
    });

    // Calculate pagination
    const totalPages = Math.ceil(filteredBuilds.length / buildsPerPage);
    const startIndex = (currentPage - 1) * buildsPerPage;
    const endIndex = Math.min(startIndex + buildsPerPage, filteredBuilds.length);
    const paginatedBuilds = filteredBuilds.slice(startIndex, endIndex);

    // Clear the grid
    buildsGrid.innerHTML = '';

    // If no builds found
    if (paginatedBuilds.length === 0) {
        if (filteredBuilds.length === 0 && originalBuilds.length > 0) {
            buildsGrid.innerHTML = `
                <div class="builds-loader">
                    <i class="fas fa-search text-4xl mb-4 text-gray-400"></i>
                    <p class="loader-message">No builds match your filters. Try adjusting your criteria.</p>
                </div>
            `;
        } else if (isLoading) {
            showLoader("Loading more builds...");
        } else if (originalBuilds.length === 0) {
            showError("No builds available. Please check back later.");
        }
        return;
    }

    // Add builds to grid
    paginatedBuilds.forEach(build => {
        // Get featured modules (up to 4)
        const featuredModules = build.modules.filter(module => module.moduleFeatured).slice(0, 4);

        const buildCard = document.createElement('div');
        buildCard.className = 'build-card';
        buildCard.dataset.tankId = build.tankId;
        buildCard.dataset.nation = build.tankNation;
        buildCard.dataset.type = build.tankType;

        buildCard.innerHTML = `
            <div class="build-header">
                <img src="${build.tankImage}" alt="${build.tankName}" class="build-tank-image">
                <div class="build-tank-name">${build.tankName}</div>
                <div class="build-tank-type">${build.tankType || 'Unknown'}</div>
                <div class="build-tank-nation">${build.tankNation}</div>
            </div>
            <div class="build-content">
                <h3 class="build-title">${build.buildName}</h3>
                <p class="build-description">${build.buildDescription || 'No description provided.'}</p>

                <div class="build-meta">
                    <span class="build-author">
                        <i class="fas fa-user"></i> ${build.buildAuthor}
                    </span>
                    <span class="build-date">
                        <i class="fas fa-calendar-alt"></i> ${formatDate(build.buildDate)}
                    </span>
                </div>

                <div class="build-modules">
                    <div class="build-modules-title">Key Components:</div>
                    <div class="build-modules-list">
                        ${featuredModules.map(module => `<span class="build-module">${module.moduleName}</span>`).join('')}
                    </div>
                </div>

                <div class="build-actions">
                    <button class="btn-accent btn-view-build" data-build-id="${build.buildNumber}">
                        <i class="fas fa-search mr-1"></i> View Build
                    </button>
                    ${build.buildFeatured ? '<span class="featured-badge"><i class="fas fa-star"></i> Featured</span>' : ''}
                </div>
            </div>
        `;

        buildsGrid.appendChild(buildCard);

        // Add event listener to view build button
        buildCard.querySelector('.btn-view-build').addEventListener('click', () => {
            showBuildDetailModal(build);
        });
    });

    // Update pagination controls
    updatePaginationControls(totalPages);

    // Initialize animations
    setTimeout(() => {
        document.querySelectorAll('.build-card').forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animated');
            }, index * 100);
        });
    }, 50);
}

// Function to update filter options based on current selections
function updateFilterOptions() {
    const tankFilter = document.getElementById('tankFilter');
    const nationFilter = document.getElementById('nationFilter');
    const typeFilter = document.getElementById('typeFilter');

    // Get current filter values
    const currentNation = nationFilter.value;
    const currentType = typeFilter.value;

    // Filter tanks based on current nation and type selections
    let filteredTanks = tankData;

    if (currentNation !== 'all') {
        filteredTanks = filteredTanks.filter(tank => tank.nation === currentNation);
    }

    if (currentType !== 'all') {
        filteredTanks = filteredTanks.filter(tank => tank.type === currentType);
    }

    // Update tank filter options
    while (tankFilter.options.length > 1) {
        tankFilter.remove(1);
    }

    filteredTanks.forEach(tank => {
        const option = document.createElement('option');
        option.value = tank.id;
        option.textContent = tank.name;
        tankFilter.appendChild(option);
    });

    // If only one tank remains, select it automatically
    if (filteredTanks.length === 1 && tankFilter.value !== filteredTanks[0].id.toString()) {
        tankFilter.value = filteredTanks[0].id.toString();
    }

    // Update nation filter options based on available types
    updateNationOptions();

    // Update type filter options based on available nations
    updateTypeOptions();
}

// Function to update nation options based on current type selection
function updateNationOptions() {
    const nationFilter = document.getElementById('nationFilter');
    const typeFilter = document.getElementById('typeFilter');
    const currentType = typeFilter.value;

    // Get all unique nations from tank data
    let availableNations = [...new Set(tankData.map(tank => tank.nation))];

    // If a type is selected, filter nations that have that type
    if (currentType !== 'all') {
        availableNations = [...new Set(
            tankData
            .filter(tank => tank.type === currentType)
            .map(tank => tank.nation)
        )];
    }

    // Store current selection
    const currentNation = nationFilter.value;

    // Update options
    for (let i = 1; i < nationFilter.options.length; i++) {
        const option = nationFilter.options[i];
        option.disabled = !availableNations.includes(option.value);
    }

    // If current selection is no longer available, reset to 'all'
    if (currentNation !== 'all' && !availableNations.includes(currentNation)) {
        nationFilter.value = 'all';
    }
}

// Function to update type options based on current nation selection
function updateTypeOptions() {
    const typeFilter = document.getElementById('typeFilter');
    const nationFilter = document.getElementById('nationFilter');
    const currentNation = nationFilter.value;

    // Get all unique types from tank data
    let availableTypes = [...new Set(tankData.map(tank => tank.type))];

    // If a nation is selected, filter types that exist for that nation
    if (currentNation !== 'all') {
        availableTypes = [...new Set(
            tankData
            .filter(tank => tank.nation === currentNation)
            .map(tank => tank.type)
        )];
    }

    // Store current selection
    const currentType = typeFilter.value;

    // Update options
    for (let i = 1; i < typeFilter.options.length; i++) {
        const option = typeFilter.options[i];
        option.disabled = !availableTypes.includes(option.value);
    }

    // If current selection is no longer available, reset to 'all'
    if (currentType !== 'all' && !availableTypes.includes(currentType)) {
        typeFilter.value = 'all';
    }
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
            updateBuildsDisplay();
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
            updateBuildsDisplay();
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
            updateBuildsDisplay();
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
            updateBuildsDisplay();
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
            updateBuildsDisplay();
        }
    });
    paginationContainer.appendChild(nextButton);
}

// Initialize builds functionality
document.addEventListener('DOMContentLoaded', function() {
    const sortFilter = document.getElementById('sortFilter');
    const tankFilter = document.getElementById('tankFilter');
    const nationFilter = document.getElementById('nationFilter');
    const typeFilter = document.getElementById('typeFilter');
    const buildsPerPageFilter = document.getElementById('buildsPerPage');

    // First fetch tank data, then builds data
    fetchTankData();

    // Add event listeners for filter changes
    sortFilter.addEventListener('change', () => {
        currentPage = 1;
        updateBuildsDisplay();
    });

    tankFilter.addEventListener('change', () => {
        currentPage = 1;
        updateBuildsDisplay();
    });

    nationFilter.addEventListener('change', () => {
        currentPage = 1;
        updateFilterOptions();
        updateBuildsDisplay();
    });

    typeFilter.addEventListener('change', () => {
        currentPage = 1;
        updateFilterOptions();
        updateBuildsDisplay();
    });

    buildsPerPageFilter.addEventListener('change', () => {
        currentPage = 1;
        updateBuildsDisplay();
    });

    // Initialize animations after page load
    setTimeout(() => {
        document.querySelectorAll('.build-card').forEach(card => {
            card.classList.add('animated');
        });
    }, 300);

    // Handle URL parameters after everything is loaded
    handleUrlParams();
});