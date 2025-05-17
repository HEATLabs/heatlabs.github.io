// Tankopedia Page JS
document.addEventListener('DOMContentLoaded', function() {
    // Fetch data
    async function fetchTankopediaData() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/PCWStats/Website-Configs/refs/heads/main/tankopedia.json');
            if (!response.ok) {
                throw new Error('Failed to load tankopedia data');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error loading tankopedia data:', error);
            return {
                category_order: [],
                categories: []
            };
        }
    }

    // Create card HTML
    function createTankopediaCard(item) {
        const card = document.createElement('div');
        card.className = 'tankopedia-card';
        card.setAttribute('data-category', item.category);
        card.setAttribute('data-name', item.name);
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        card.innerHTML = `
            <div class="tankopedia-img-container">
                <img src="${item.image}" alt="${item.name}" class="tankopedia-img" onerror="this.src='https://raw.githubusercontent.com/PCWStats/Website-Images/main/placeholder/imagefailedtoload.png'">
            </div>
            <div class="tankopedia-info">
                <h3>${item.name}</h3>
                <p>${item.description.substring(0, 60)}</p>
                <p>${item.acquire.substring(0, 60)}</p>
            </div>
        `;

        // Add click event to open modal
        card.addEventListener('click', function() {
            openTankopediaModal(item);
        });

        return card;
    }

    // Sort items alphabetically by name
    function sortItemsAlphabetically(items) {
        return items.sort(function(a, b) {
            return a.name.localeCompare(b.name);
        });
    }

    // Create category section
    function createCategorySection(category) {
        const section = document.createElement('section');
        section.className = 'category-section';
        section.setAttribute('data-category', category.name);

        section.innerHTML = `
            <div class="container mx-auto px-4">
                <h2 class="section-title">${category.name}</h2>
                ${category.description ? `<p class="category-description text-center mb-10">${category.description}</p>` : ''}
                <div class="tankopedia-grid">
                    <!-- Items will be loaded here -->
                </div>
            </div>
        `;

        const grid = section.querySelector('.tankopedia-grid');

        // Sort items alphabetically
        const sortedItems = sortItemsAlphabetically(category.items);

        // Create and append cards for each item
        sortedItems.forEach(function(item, index) {
            // Add category info to each item for modal
            item.category = category.name;
            const card = createTankopediaCard(item);
            grid.appendChild(card);

            // Animate card into view
            setTimeout(function() {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            }, index * 100);
        });

        return section;
    }

    // Create filter buttons
    function createFilterButtons(categories) {
        const filterContainer = document.createElement('div');
        filterContainer.className = 'filter-container container mx-auto px-4 mb-10';

        const filterWrapper = document.createElement('div');
        filterWrapper.className = 'filter-wrapper flex flex-wrap justify-center gap-3';

        // Sort categories by item count (descending)
        const sortedCategories = categories.slice().sort(function(a, b) {
            return b.items.length - a.items.length;
        });

        sortedCategories.forEach(function(category) {
            const button = document.createElement('button');
            button.className = 'filter-button px-4 py-2 rounded-full transition-colors';
            button.innerHTML = `
                <span>${category.name}</span>
                <span class="item-count">${category.items.length}</span>
            `;
            button.setAttribute('data-category', category.name);

            button.addEventListener('click', function() {
                filterByCategory(category.name);
            });

            filterWrapper.appendChild(button);
        });

        // Add "All" button
        const allButton = document.createElement('button');
        allButton.className = 'filter-button active px-4 py-2 rounded-full transition-colors';
        allButton.innerHTML = `
            <span>All</span>
            <span class="item-count">${categories.reduce(function(acc, cat) {
                return acc + cat.items.length;
            }, 0)}</span>
        `;
        allButton.addEventListener('click', function() {
            filterByCategory('all');
        });

        filterWrapper.prepend(allButton);
        filterContainer.appendChild(filterWrapper);
        return filterContainer;
    }

    // Filter items by category
    function filterByCategory(categoryName) {
        const buttons = document.querySelectorAll('.filter-button');
        const sections = document.querySelectorAll('.category-section');

        // Update active button
        buttons.forEach(function(button) {
            button.classList.remove('active');
            if ((categoryName === 'all' && button.textContent.includes('All')) ||
                button.getAttribute('data-category') === categoryName) {
                button.classList.add('active');
            }
        });

        // Show/hide sections
        sections.forEach(function(section) {
            if (categoryName === 'all' || section.getAttribute('data-category') === categoryName) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });

        // Reinitialize intersection observer for new visible elements
        initIntersectionObserver();
    }

    // Render all category sections
    async function renderTankopediaSections() {
        const data = await fetchTankopediaData();
        const category_order = data.category_order || [];
        const categories = data.categories || [];
        const categoriesContainer = document.querySelector('#categories-container');

        if (categories.length === 0) {
            categoriesContainer.innerHTML = '<p class="text-center py-10">Failed to load tankopedia data. Please try again later.</p>';
            return;
        }

        // Create a map of category name to category data for easy lookup
        const categoryMap = {};
        categories.forEach(function(category) {
            categoryMap[category.name] = category;
        });

        // Clear container
        categoriesContainer.innerHTML = '';

        // Add filter buttons
        const filterButtons = createFilterButtons(categories);
        categoriesContainer.appendChild(filterButtons);

        // If category_order exists, use it to order the sections
        if (category_order.length > 0) {
            // First add categories that are in the order list
            category_order.forEach(function(categoryName) {
                if (categoryMap[categoryName]) {
                    const section = createCategorySection(categoryMap[categoryName]);
                    categoriesContainer.appendChild(section);
                    // Remove from map to avoid duplicates
                    delete categoryMap[categoryName];
                }
            });

            // Then add any remaining categories not in the order list
            Object.keys(categoryMap).forEach(function(categoryName) {
                const section = createCategorySection(categoryMap[categoryName]);
                categoriesContainer.appendChild(section);
            });
        } else {
            // Fallback to original behavior if no category_order
            categories.forEach(function(category) {
                const section = createCategorySection(category);
                categoriesContainer.appendChild(section);
            });
        }

        // Initialize intersection observer for scroll animations
        initIntersectionObserver();
    }

    // Initialize intersection observer for scroll animations
    function initIntersectionObserver() {
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        document.querySelectorAll('.tankopedia-card').forEach(function(card) {
            observer.observe(card);
        });
    }

    // Initialize modal
    function initTankopediaModal() {
        const modalOverlay = document.getElementById('tankopediaModalOverlay');
        const modal = document.getElementById('tankopediaModal');
        const modalClose = document.getElementById('tankopediaModalClose');

        // Close modal handlers
        modalOverlay.addEventListener('click', closeTankopediaModal);
        modalClose.addEventListener('click', closeTankopediaModal);

        // Close with ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeTankopediaModal();
            }
        });
    }

    // Open modal with item data
    function openTankopediaModal(item) {
        const modal = document.getElementById('tankopediaModal');
        const modalOverlay = document.getElementById('tankopediaModalOverlay');
        const modalImage = document.getElementById('tankopediaModalImage');
        const modalName = document.getElementById('tankopediaModalName');
        const modalId = document.getElementById('tankopediaModalId');
        const modalCategory = document.getElementById('tankopediaModalCategory');
        const modalDescription = document.getElementById('tankopediaModalDescription');

        // Populate modal with item data
        modalImage.src = item.image;
        modalImage.alt = item.name;
        modalId.textContent = 'ID: ' + item.id;
        modalName.textContent = item.name;
        modalCategory.textContent = 'Category: ' + item.category;
        modalDescription.textContent = item.description;

        // Show modal
        modal.classList.add('active');
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeTankopediaModal() {
        const modal = document.getElementById('tankopediaModal');
        const modalOverlay = document.getElementById('tankopediaModalOverlay');

        modal.classList.remove('active');
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Initialize the page
    renderTankopediaSections();
    initTankopediaModal();
});