// Asset Gallery Page JS
document.addEventListener('DOMContentLoaded', function() {
    // Fetch data
    async function fetchassetGalleryData() {
        try {
            const response = await fetch('https://cdn.jsdelivr.net/gh/HEATLabs/HEAT-Labs-Configs@main/asset-gallery.json');

            // Uncomment line below to check using local JSON
            // const response = await fetch('../HEAT-Labs-Configs/asset-gallery.json');

            if (!response.ok) {
                throw new Error('Failed to load Asset Gallery data');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error loading Asset Gallery data:', error);
            return {
                category_order: [],
                categories: []
            };
        }
    }

    // Function to get thumbnail path for videos
    function getThumbnailPath(videoPath) {
        // Check if this is a video file
        const videoExtensions = ['.webm', '.mp4', '.avi', '.mov', '.wmv'];
        const isVideo = videoExtensions.some(ext => videoPath.toLowerCase().includes(ext));

        if (!isVideo) {
            return videoPath; // Return original path if not a video
        }

        // Extract filename and extension
        const lastSlashIndex = videoPath.lastIndexOf('/');
        const filenameWithExt = videoPath.substring(lastSlashIndex + 1);
        const dotIndex = filenameWithExt.lastIndexOf('.');
        const filename = filenameWithExt.substring(0, dotIndex);
        const extension = filenameWithExt.substring(dotIndex);

        // Replace extension with .webp for thumbnail
        const thumbnailExtension = '.webp';

        // Construct thumbnail path by inserting '/thumbnails/' before filename
        const basePath = videoPath.substring(0, lastSlashIndex + 1);
        const thumbnailPath = basePath + 'thumbnails/' + filename + thumbnailExtension;

        return thumbnailPath;
    }

    // Create card HTML
    function createassetGalleryCard(item) {
        const card = document.createElement('div');
        card.className = 'assetGallery-card';
        card.setAttribute('data-category', item.category);
        card.setAttribute('data-name', item.name);
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        // Determine image source - use thumbnail for videos, original image for others (Default: Abilities)
        const imageSrc = item.modalType === 'video' ? getThumbnailPath(item.image) : item.image;
        const isAbilities = item.category.toLocaleLowerCase() === 'abilities';

        // Different strategies based on importance
        const loadingStrategy = isAbilities ? 'eager' : 'lazy';
        const decodingStrategy = isAbilities ? 'sync' : 'async';
        const imageStyle = !isAbilities ? 'style="opacity: 0; transition: opacity 0.1s ease;"' : '';

        card.innerHTML = `
        <div class="assetGallery-img-container">
            <img src="${imageSrc}" loading="${loadingStrategy}" decoding="${decodingStrategy}" alt="${item.name}" class="assetGallery-img" ${imageStyle} onerror="this.src='https://cdn5.heatlabs.net/placeholder/imagefailedtoload.webp'; this.style.opacity='1'">
        </div>
        <div class="assetGallery-info">
            <h3>${item.name}</h3>
            <p>${item.description.substring(0, 60)}</p>
        </div>
    `;

        const img = card.querySelector('.assetGallery-img');

        if (isAbilities) {
            // For Abilities
            img.decode?.().catch(console.error);
        } else {
            // Lazy images
            img.addEventListener('load', function() {
                //console.log(`Lazy image decoded and faded in: ${item.name}`);
                this.style.opacity = '1';
            });

            if (img.complete) {
                img.style.opacity = '1';
            }
        }
        // Add click event to open modal
        card.addEventListener('click', function() {
            openassetGalleryModal(item);
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
                <div class="assetGallery-grid">
                    <!-- Items will be loaded here -->
                </div>
            </div>
        `;

        const grid = section.querySelector('.assetGallery-grid');

        // Sort items alphabetically
        const sortedItems = sortItemsAlphabetically(category.items);

        // Create and append cards for each item
        sortedItems.forEach(function(item, index) {
            // Add category info to each item for modal
            item.category = category.name;
            const card = createassetGalleryCard(item);
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

        // Sort categories alphabetically by name
        const sortedCategories = categories.slice().sort(function(a, b) {
            return a.name.localeCompare(b.name);
        });

        // Create category buttons (sorted alphabetically)
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
        allButton.className = 'filter-button px-4 py-2 rounded-full transition-colors';
        allButton.innerHTML = `
            <span>All</span>
            <span class="item-count">${categories.reduce(function(acc, cat) {
                return acc + cat.items.length;
            }, 0)}</span>
        `;
        allButton.setAttribute('data-category', 'all');
        allButton.addEventListener('click', function() {
            filterByCategory('all');
        });

        filterWrapper.appendChild(allButton);

        // Set the first category as active by default and filter by it
        if (sortedCategories.length > 0) {
            const firstCategoryButton = filterWrapper.querySelector(`[data-category="${sortedCategories[0].name}"]`);
            if (firstCategoryButton) {
                firstCategoryButton.classList.add('active');
            }
        }

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
            if (button.getAttribute('data-category') === categoryName) {
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
    async function renderassetGallerySections() {
        const data = await fetchassetGalleryData();
        const category_order = data.category_order || [];
        const categories = data.categories || [];
        const categoriesContainer = document.querySelector('#categories-container');

        if (categories.length === 0) {
            categoriesContainer.innerHTML = '<p class="text-center py-10">Failed to load Asset Gallery data. Please try again later.</p>';
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

        // Apply default filter to first category after all sections are created
        const sortedCategories = categories.slice().sort(function(a, b) {
            return a.name.localeCompare(b.name);
        });

        if (sortedCategories.length > 0) {
            filterByCategory(sortedCategories[0].name);
        }
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

        document.querySelectorAll('.assetGallery-card').forEach(function(card) {
            observer.observe(card);
        });
    }

    // Initialize modals
    function initassetGalleryModals() {
        const modalOverlays = document.querySelectorAll('.modal-overlay');
        const modalCloses = document.querySelectorAll('.modal-close');

        // Close modal handlers
        modalOverlays.forEach(overlay => {
            overlay.addEventListener('click', closeAllModals);
        });

        modalCloses.forEach(closeBtn => {
            closeBtn.addEventListener('click', closeAllModals);
        });

        // Close with ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeAllModals();
            }
        });
    }

    // Close all modals
    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.classList.remove('active');
        });
        document.body.style.overflow = '';

        // Pause any playing videos
        document.querySelectorAll('.modal-video').forEach(video => {
            video.pause();
            video.currentTime = 0;
            video.removeAttribute('src');
            video.load();
        });
    }

    // Open modal with item data
    function openassetGalleryModal(item) {
        // Determine which modal to show based on item.modalType or default to standard
        const modalType = item.modalType || 'standard';

        // Hide all modals first
        closeAllModals();

        // Show the specific modal
        switch (modalType) {
            case 'banner':
                openBannerModal(item);
                break;
            case 'video':
                openVideoModal(item);
                break;
            case '360':
                open360Modal(item);
                break;
            default:
                openStandardModal(item);
        }
    }

    // Standard Modal
    function openStandardModal(item) {
        const modal = document.getElementById('assetGalleryModalStandard');
        const modalOverlay = document.getElementById('assetGalleryModalOverlay');
        const modalImage = document.getElementById('assetGalleryModalStandardImage');
        const modalName = document.getElementById('assetGalleryModalStandardName');
        const modalId = document.getElementById('assetGalleryModalStandardId');
        const modalCategory = document.getElementById('assetGalleryModalStandardCategory');
        const modalDescription = document.getElementById('assetGalleryModalStandardDescription');
        const modalHowToObtain = document.getElementById('assetGalleryModalStandardHowToObtain');
        modalImage.src = item.image;
        modalImage.alt = item.name;
        modalId.textContent = 'ID: ' + item.id;
        modalName.textContent = item.name;
        modalCategory.textContent = 'Category: ' + item.category;
        modalDescription.textContent = item.description;

        // Add How to Obtain section
        if (item.howto) {
            modalHowToObtain.innerHTML = `
                <h3>How to Obtain</h3>
                <p>${item.howto}</p>
            `;
            modalHowToObtain.style.display = 'block';
        } else {
            modalHowToObtain.style.display = 'none';
        }

        // Show modal
        modal.classList.add('active');
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Banner Modal
    function openBannerModal(item) {
        const modal = document.getElementById('assetGalleryModalBanner');
        const modalOverlay = document.getElementById('assetGalleryModalOverlay');
        const modalImage = document.getElementById('assetGalleryModalBannerImage');
        const modalName = document.getElementById('assetGalleryModalBannerName');
        const modalId = document.getElementById('assetGalleryModalBannerId');
        const modalCategory = document.getElementById('assetGalleryModalBannerCategory');

        modalImage.src = item.image;
        modalImage.alt = item.name;
        modalId.textContent = 'ID: ' + item.id;
        modalName.textContent = item.name;
        modalCategory.textContent = 'Category: ' + item.category;

        modal.classList.add('active');
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Video Modal
    function openVideoModal(item) {
        const modal = document.getElementById('assetGalleryModalVideo');
        const modalOverlay = document.getElementById('assetGalleryModalOverlay');
        const modalVideo = document.getElementById('assetGalleryModalVideoElement');
        const modalName = document.getElementById('assetGalleryModalVideoName');
        const modalId = document.getElementById('assetGalleryModalVideoId');
        const modalCategory = document.getElementById('assetGalleryModalVideoCategory');

        modalVideo.pause();
        modalVideo.currentTime = 0;

        modalVideo.src = item.videoUrl || item.image;
        modalVideo.setAttribute('poster', getThumbnailPath(item.image));
        modalId.textContent = 'ID: ' + item.id;
        modalName.textContent = item.name;
        modalCategory.textContent = 'Category: ' + item.category;

        modal.classList.add('active');
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // 360 Modal
    function open360Modal(item) {
        const modal = document.getElementById('assetGalleryModal360');
        const modalOverlay = document.getElementById('assetGalleryModalOverlay');
        const modalImage = document.getElementById('assetGalleryModal360Image');
        const modalName = document.getElementById('assetGalleryModal360Name');
        const modalId = document.getElementById('assetGalleryModal360Id');
        const modalCategory = document.getElementById('assetGalleryModal360Category');

        modalImage.src = item.image;
        modalImage.alt = item.name;
        modalId.textContent = 'ID: ' + item.id;
        modalName.textContent = item.name;
        modalCategory.textContent = 'Category: ' + item.category;

        modal.classList.add('active');
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Initialize 360 viewer if needed
        if (window.Pannellum) {
            pannellum.viewer('assetGalleryModal360Image', {
                type: 'equirectangular',
                panorama: item.image,
                autoLoad: true
            });
        }
    }

    // Initialize the page
    renderassetGallerySections();
    initassetGalleryModals();
});