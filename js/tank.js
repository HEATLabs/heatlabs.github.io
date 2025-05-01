// Tank Page JS for PCWStats
document.addEventListener('DOMContentLoaded', function() {
    // Initialize gamemode selector functionality
    const gamemodeButtons = document.querySelectorAll('.gamemode-btn');
    const gamemodeSections = document.querySelectorAll('.gamemode-section');

    // Set up click handlers for gamemode buttons
    gamemodeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            gamemodeButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            // Get the gamemode to show
            const gamemode = this.dataset.gamemode;

            // Hide all gamemode sections
            gamemodeSections.forEach(section => {
                section.classList.remove('active');
            });

            // Show the selected gamemode section
            document.getElementById(gamemode).classList.add('active');

            // Update URL hash if needed
            window.location.hash = gamemode;
        });
    });

    // Check for hash on page load to set initial gamemode
    if (window.location.hash) {
        const initialGamemode = window.location.hash.substring(1);
        const initialButton = document.querySelector(`.gamemode-btn[data-gamemode="${initialGamemode}"]`);

        if (initialButton) {
            initialButton.click();
        }
    }

    // Initialize agent modals
    initializeAgentModals();

    // Initialize any interactive elements specific to tank pages
    initializeTankPageElements();
});

function initializeAgentModals() {
    // Agent modal elements
    const agentModal = document.getElementById('agentModal');
    const agentModalOverlay = document.getElementById('agentModalOverlay');
    const agentModalClose = document.getElementById('agentModalClose');
    const agentModalImage = document.getElementById('agentModalImage');
    const agentModalName = document.getElementById('agentModalName');
    const agentModalSpecialty = document.getElementById('agentModalSpecialty');
    const agentModalDescription = document.getElementById('agentModalDescription');
    const agentModalStory = document.getElementById('agentModalStory');
    const agentModalTanksContainer = document.getElementById('agentModalTanksContainer');

    // Sample data - in the final implementation this data would be fetched from the CDN
    const agentsData = {
        "Chopper 1": {
            image: "https://raw.githubusercontent.com/PCWStats/Website-Images/main/agents/Chopper.png",
            specialty: "Ability: Shock and Awe",
            description: "Call in the support of Chopper's friend in the Air Force, the bomber will fly to the targeted position deal a lot of damage, and become dazed.",
            story: "A frontline fighter who calls in air support to hold the line. He is a bear of a man on his chrome-plated bike, but appearances deceive. Big personality, heart of gold: devoted to friends, lethal to enemies. A father figure to many Agents, hes a down-to-earth family man who signed up to provide for his kids education, yet this practical soul has a literary quote ready for any moment. But cross this bear at your own peril.",
            compatibleTanks: [{
                    name: "M1E1",
                    image: "https://raw.githubusercontent.com/PCWStats/Website-Images/main/tanks/m1e1/icon_m1e1.png"
                },
                {
                    name: "M1E1",
                    image: "https://raw.githubusercontent.com/PCWStats/Website-Images/main/tanks/m1e1/icon_m1e1.png"
                },
                {
                    name: "M1E1",
                    image: "https://raw.githubusercontent.com/PCWStats/Website-Images/main/tanks/m1e1/icon_m1e1.png"
                }
            ]
        },
        "Chopper 2": {
            image: "https://raw.githubusercontent.com/PCWStats/Website-Images/main/agents/Chopper.png",
            specialty: "Ability: Shock and Awe",
            description: "Call in the support of Chopper's friend in the Air Force, the bomber will fly to the targeted position deal a lot of damage, and become dazed.",
            story: "A frontline fighter who calls in air support to hold the line. He is a bear of a man on his chrome-plated bike, but appearances deceive. Big personality, heart of gold: devoted to friends, lethal to enemies. A father figure to many Agents, hes a down-to-earth family man who signed up to provide for his kids education, yet this practical soul has a literary quote ready for any moment. But cross this bear at your own peril.",
            compatibleTanks: [{
                    name: "M1E1",
                    image: "https://raw.githubusercontent.com/PCWStats/Website-Images/main/tanks/m1e1/icon_m1e1.png"
                },
                {
                    name: "M1E1",
                    image: "https://raw.githubusercontent.com/PCWStats/Website-Images/main/tanks/m1e1/icon_m1e1.png"
                },
                {
                    name: "M1E1",
                    image: "https://raw.githubusercontent.com/PCWStats/Website-Images/main/tanks/m1e1/icon_m1e1.png"
                }
            ]
        },
        "Chopper 3": {
            image: "https://raw.githubusercontent.com/PCWStats/Website-Images/main/agents/Chopper.png",
            specialty: "Ability: Shock and Awe",
            description: "Call in the support of Chopper's friend in the Air Force, the bomber will fly to the targeted position deal a lot of damage, and become dazed.",
            story: "A frontline fighter who calls in air support to hold the line. He is a bear of a man on his chrome-plated bike, but appearances deceive. Big personality, heart of gold: devoted to friends, lethal to enemies. A father figure to many Agents, hes a down-to-earth family man who signed up to provide for his kids education, yet this practical soul has a literary quote ready for any moment. But cross this bear at your own peril.",
            compatibleTanks: [{
                    name: "M1E1",
                    image: "https://raw.githubusercontent.com/PCWStats/Website-Images/main/tanks/m1e1/icon_m1e1.png"
                },
                {
                    name: "M1E1",
                    image: "https://raw.githubusercontent.com/PCWStats/Website-Images/main/tanks/m1e1/icon_m1e1.png"
                },
                {
                    name: "M1E1",
                    image: "https://raw.githubusercontent.com/PCWStats/Website-Images/main/tanks/m1e1/icon_m1e1.png"
                }
            ]
        }
    };

    // Set up click handlers for all agent cards
    document.querySelectorAll('.agent-card').forEach(card => {
        card.addEventListener('click', function() {
            const agentName = this.querySelector('h3').textContent;
            const agentData = agentsData[agentName];

            if (agentData) {
                // Populate modal with agent data
                agentModalImage.src = agentData.image;
                agentModalImage.alt = agentName;
                agentModalName.textContent = agentName;
                agentModalSpecialty.textContent = agentData.specialty;
                agentModalDescription.textContent = agentData.description;
                agentModalStory.textContent = agentData.story;

                // Clear previous tank images
                agentModalTanksContainer.innerHTML = '';

                // Add compatible tanks
                agentData.compatibleTanks.forEach(tank => {
                    const tankElement = document.createElement('div');
                    tankElement.className = 'agent-modal-tank';

                    const tankImg = document.createElement('img');
                    tankImg.src = tank.image;
                    tankImg.alt = tank.name;

                    const tankName = document.createElement('span');
                    tankName.textContent = tank.name;

                    tankElement.appendChild(tankImg);
                    tankElement.appendChild(tankName);
                    agentModalTanksContainer.appendChild(tankElement);
                });

                // Show modal
                agentModal.classList.add('active');
                agentModalOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Close modal handlers
    agentModalOverlay.addEventListener('click', closeAgentModal);
    agentModalClose.addEventListener('click', closeAgentModal);

    // Close with ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && agentModal.classList.contains('active')) {
            closeAgentModal();
        }
    });

    function closeAgentModal() {
        agentModal.classList.remove('active');
        agentModalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function initializeTankPageElements() {
    // Initialize image gallery
    initializeImageGallery();

    // FAQ Accordion functionality
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle current item
            item.classList.toggle('active');
        });
    });

    // Add intersection observer for animated elements if needed
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        // Observe any elements that need to animate in
        document.querySelectorAll('.map-image, .sidebar-card').forEach(el => {
            observer.observe(el);
        });
    }
}

function initializeImageGallery() {
    const galleryModal = document.getElementById('galleryModal');
    const galleryMainImage = document.getElementById('galleryMainImage');
    const galleryImageCaption = document.getElementById('galleryImageCaption');
    const galleryThumbnailsContainer = document.getElementById('galleryThumbnailsContainer');
    const galleryCloseBtn = document.getElementById('galleryCloseBtn');
    const galleryPrevBtn = document.getElementById('galleryPrevBtn');
    const galleryNextBtn = document.getElementById('galleryNextBtn');

    // Collect all images from the page that should be in the gallery
    const galleryImages = [];

    // Add main content images
    document.querySelectorAll('.map-image img').forEach(img => {
        galleryImages.push({
            src: img.src,
            alt: img.alt,
            caption: img.nextElementSibling?.textContent || ''
        });
    });

    // Add sidebar gallery images
    document.querySelectorAll('.sidebar-card .gallery-thumbnail img').forEach(img => {
        galleryImages.push({
            src: img.parentElement.href,
            alt: img.alt,
            caption: img.alt
        });
    });

    // If no images found, don't initialize the gallery
    if (galleryImages.length === 0) return;

    let currentImageIndex = 0;

    // Function to open the gallery at a specific index
    function openGallery(index) {
        if (index < 0 || index >= galleryImages.length) return;

        currentImageIndex = index;
        updateGalleryImage();
        galleryModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Function to update the gallery with current image
    function updateGalleryImage() {
        const currentImage = galleryImages[currentImageIndex];
        galleryMainImage.src = currentImage.src;
        galleryMainImage.alt = currentImage.alt;
        galleryImageCaption.textContent = currentImage.caption;

        // Update active thumbnail
        document.querySelectorAll('.gallery-thumbnail-item').forEach((thumb, idx) => {
            thumb.classList.toggle('active', idx === currentImageIndex);
        });

        // Scroll thumbnails to show active one
        const activeThumb = document.querySelector('.gallery-thumbnail-item.active');
        if (activeThumb) {
            activeThumb.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }

    // Function to close the gallery
    function closeGallery() {
        galleryModal.classList.remove('active');
        document.body.style.overflow = '';
        galleryMainImage.classList.remove('zoomed');
    }

    // Create thumbnail items
    function createThumbnails() {
        galleryThumbnailsContainer.innerHTML = '';
        galleryImages.forEach((img, index) => {
            const thumbItem = document.createElement('div');
            thumbItem.className = 'gallery-thumbnail-item';
            if (index === currentImageIndex) thumbItem.classList.add('active');

            const thumbImg = document.createElement('img');
            thumbImg.src = img.src;
            thumbImg.alt = img.alt;

            thumbItem.appendChild(thumbImg);
            thumbItem.addEventListener('click', () => {
                currentImageIndex = index;
                updateGalleryImage();
            });

            galleryThumbnailsContainer.appendChild(thumbItem);
        });
    }

    // Initialize thumbnails
    createThumbnails();

    // Set up click handlers for all gallery images
    document.querySelectorAll('.map-image img, .sidebar-card .gallery-thumbnail').forEach((element, index) => {
        element.addEventListener('click', (e) => {
            e.preventDefault();
            openGallery(index);
        });
    });

    // Navigation buttons
    galleryPrevBtn.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
        updateGalleryImage();
    });

    galleryNextBtn.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
        updateGalleryImage();
    });

    // Close button
    galleryCloseBtn.addEventListener('click', closeGallery);

    // Close when clicking outside the image
    galleryModal.addEventListener('click', (e) => {
        if (e.target === galleryModal) {
            closeGallery();
        }
    });

    // Zoom functionality
    galleryMainImage.addEventListener('click', () => {
        galleryMainImage.classList.toggle('zoomed');
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!galleryModal.classList.contains('active')) return;

        switch (e.key) {
            case 'Escape':
                closeGallery();
                break;
            case 'ArrowLeft':
                currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
                updateGalleryImage();
                break;
            case 'ArrowRight':
                currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
                updateGalleryImage();
                break;
        }
    });

    // Swipe support for touch devices
    let touchStartX = 0;
    let touchEndX = 0;

    galleryMainImage.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, {
        passive: true
    });

    galleryMainImage.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, {
        passive: true
    });

    function handleSwipe() {
        if (touchStartX - touchEndX > 50) {
            // Swipe left - next image
            currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
            updateGalleryImage();
        } else if (touchEndX - touchStartX > 50) {
            // Swipe right - previous image
            currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
            updateGalleryImage();
        }
    }
}