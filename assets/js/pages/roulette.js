document.addEventListener('DOMContentLoaded', function() {
    // Configuration settings - adjust these to fine-tune the roulette behavior
    const rouletteConfig = {
        // Base speed (higher = faster)
        baseSpeed: 50,

        // Minimum speed when slowing down (lower = slower final spin)
        minSpeed: 15,

        // Duration range in milliseconds (min and max spin time)
        minDuration: 5000, // 3 seconds minimum
        maxDuration: 10000, // 10 seconds maximum

        // Speed reduction factors (how quickly it slows down)
        // Mess with those to create the illusion of rigging
        initialSlowdownFactor: 45, // How much to reduce speed during first 80% of spin
        finalSlowdownFactor: 25, // How much to reduce speed during last 20% of spin

        // Sound effect volume (0 to 1)
        soundVolume: 0.5,

        // Animation smoothness (higher = smoother but more CPU intensive)
        animationInterval: 25,

        // Special prize configuration
        specialPrize: {
            name: "Special Prize",
            image: "https://raw.githubusercontent.com/HEATLabs/HEAT-Labs-Images-Features/refs/heads/main/roulette/special.webp",
            nation: "Mystery",
            type: "Legendary",
            slug: "special-prize",
            id: "special-prize-999",
            // How many special prize items to add to the wheel (spread throughout)
            count: 1,
            // Minimum distance (in items) to move away if special prize would be selected
            minAvoidDistance: 2,
            // Sound to play when special prize is "almost" selected
            almostSound: "https://github.com/HEATLabs/HEAT-Labs-Database/raw/refs/heads/main/sounds/fail.wav"
        }
    };

    // DOM elements
    const rouletteWheel = document.getElementById('rouletteWheel');
    const spinButton = document.getElementById('spinButton');
    const resultContainer = document.getElementById('resultContainer');
    const resultCard = document.getElementById('resultCard');
    const resultImage = document.getElementById('resultImage');
    const resultName = document.getElementById('resultName');
    const resultNation = document.getElementById('resultNation');
    const resultType = document.getElementById('resultType');
    const resultLink = document.getElementById('resultLink');
    const spinCount = document.getElementById('spinCount');

    let tanks = [];
    let isSpinning = false;
    let spins = 0;
    let currentPosition = 0;
    let spinInterval;
    let selectedTank = null;
    let itemWidth = 200; // Default width of each roulette item
    let lastCenterItemId = null;
    let centerItemIdAtStop = null; // Track the center item when stopping
    const clickSound = new Audio('https://github.com/HEATLabs/HEAT-Labs-Database/raw/refs/heads/main/sounds/click_2.wav');
    const almostSound = new Audio(rouletteConfig.specialPrize.almostSound);
    clickSound.volume = rouletteConfig.soundVolume;
    almostSound.volume = rouletteConfig.soundVolume;

    // Fetch tank data from JSON file
    async function fetchTankData() {
        try {
            const response = await fetch('https://cdn.jsdelivr.net/gh/HEATLabs/HEAT-Labs-Configs@main/tanks.json');
            if (!response.ok) {
                throw new Error('Failed to load tank data');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error loading tank data:', error);
            return [];
        }
    }

    // Create roulette items
    function createRouletteItems(tankData) {
        rouletteWheel.innerHTML = '';

        // Store the original tanks array for result selection
        tanks = tankData;

        // Create a version of the tank data with special prizes inserted
        const tanksWithSpecial = [...tankData];
        const specialPrize = {
            ...rouletteConfig.specialPrize,
            isSpecial: true
        };

        // Insert special prizes at random positions
        for (let i = 0; i < rouletteConfig.specialPrize.count; i++) {
            const insertPos = Math.floor(Math.random() * tanksWithSpecial.length);
            tanksWithSpecial.splice(insertPos, 0, specialPrize);
        }

        // Create a mapping between wheel items and original tank indices
        const wheelToTankMap = [];
        for (let i = 0; i < tanksWithSpecial.length; i++) {
            if (tanksWithSpecial[i].isSpecial) {
                wheelToTankMap.push(null); // Special items map to null
            } else {
                // Find the original index in the tanks array
                const originalIndex = tanks.findIndex(t => t.id === tanksWithSpecial[i].id);
                wheelToTankMap.push(originalIndex);
            }
        }

        // Create enough duplicates to make the wheel seem infinite
        const duplicatedTanks = [...tanksWithSpecial, ...tanksWithSpecial, ...tanksWithSpecial];
        const duplicatedMap = [...wheelToTankMap, ...wheelToTankMap, ...wheelToTankMap];

        duplicatedTanks.forEach((tank, index) => {
            const item = document.createElement('div');
            item.className = 'roulette-item';
            item.setAttribute('data-tank-id', tank.id);
            item.setAttribute('data-tank-index', index % tanksWithSpecial.length); // Index in tanksWithSpecial array
            item.setAttribute('data-original-index', duplicatedMap[index % tanksWithSpecial.length]); // Original tank index or null
            item.setAttribute('data-item-id', `item-${index}`); // Unique ID for each item
            item.setAttribute('data-is-special', tank.isSpecial || false);

            item.innerHTML = `
                <img src="${tank.image}" alt="${tank.name}" onerror="this.src='https://cdn.jsdelivr.net/gh/HEATLabs/HEAT-Labs-Images@main/placeholder/imagefailedtoload.webp'">
                <h4>${tank.name}</h4>
            `;

            rouletteWheel.appendChild(item);
        });

        // Get the ACTUAL width of an item after it's rendered
        if (rouletteWheel.firstChild) {
            itemWidth = rouletteWheel.firstChild.getBoundingClientRect().width;
        }
    }

    // Reset wheel position when nearing the end to create infinite effect
    function checkWheelPosition() {
        const totalWidth = rouletteWheel.scrollWidth;
        const threshold = totalWidth / 3; // Reset when we've scrolled 1/3 of the way

        if (currentPosition > threshold) {
            currentPosition -= threshold;
            rouletteWheel.style.transition = 'none';
            rouletteWheel.style.transform = `translateX(-${currentPosition}px)`;

            // Force reflow
            void rouletteWheel.offsetWidth;

            // Restore transition
            rouletteWheel.style.transition = 'transform 0.1s ease-out';
        }
    }

    // Start the spinning animation
    function startSpinning() {
        isSpinning = true;
        spinButton.disabled = true;
        resultCard.classList.remove('visible');
        lastCenterItemId = null;
        centerItemIdAtStop = null;

        // Reset highlighted items
        document.querySelectorAll('.roulette-item').forEach(item => {
            item.classList.remove('highlighted');
        });

        // Random duration within configured range
        const spinDuration = rouletteConfig.minDuration + Math.random() *
            (rouletteConfig.maxDuration - rouletteConfig.minDuration);
        const startTime = Date.now();

        // Initial fast spin using base speed
        let speed = rouletteConfig.baseSpeed;

        spinInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / spinDuration;

            // Gradually slow down using configured factors
            if (progress < 0.6) {
                speed = rouletteConfig.baseSpeed - (progress * rouletteConfig.initialSlowdownFactor);
            } else {
                speed = rouletteConfig.minSpeed - ((progress - 0.6) * rouletteConfig.finalSlowdownFactor);
            }

            currentPosition += speed;
            rouletteWheel.style.transform = `translateX(-${currentPosition}px)`;

            // Check if we need to reset position for infinite effect
            if (isSpinning) {
                checkWheelPosition();
            }

            // Highlight the center item and play sound when a new item passes
            highlightCenterItem();

            // Stop when time is up
            if (elapsed >= spinDuration) {
                stopSpinning();
            }
        }, rouletteConfig.animationInterval);
    }

    // Stop the spinning animation
    function stopSpinning() {
        clearInterval(spinInterval);
        isSpinning = false;
        spinButton.disabled = false;

        // Get the center item at the moment of stopping
        const centerItem = getCenterItem();
        if (centerItem) {
            centerItemIdAtStop = centerItem.getAttribute('data-item-id');

            // Check if this is the special prize
            if (centerItem.getAttribute('data-is-special') === 'true') {
                // Play the "almost" sound
                almostSound.currentTime = 0;
                almostSound.play().catch(e => console.log("Almost sound play failed:", e));

                // Move to the next non-special item
                avoidSpecialPrize(centerItem);
            } else {
                // Select the tank in the center with smooth animation
                smoothStopToCenter(centerItem);
            }
        } else {
            // Fallback if no center item found
            smoothStopToCenter();
        }
    }

    // Move the wheel away from the special prize
    function avoidSpecialPrize(specialItem) {
        const items = document.querySelectorAll('.roulette-item');
        const viewportCenter = window.innerWidth / 2;
        const direction = Math.random() > 0.5 ? 1 : -1; // Randomly choose left or right
        const distance = rouletteConfig.specialPrize.minAvoidDistance +
            Math.floor(Math.random() * 2); // Add some randomness

        let candidateItem = null;
        let attempts = 0;
        const maxAttempts = 10;

        // Find the next non-special item in the chosen direction
        while (!candidateItem && attempts < maxAttempts) {
            attempts++;
            const currentIndex = Array.from(items).indexOf(specialItem);
            let checkIndex = currentIndex + (direction * distance);

            // Wrap around if needed
            if (checkIndex < 0) checkIndex = items.length + checkIndex;
            if (checkIndex >= items.length) checkIndex = checkIndex - items.length;

            const potentialItem = items[checkIndex];
            if (potentialItem && potentialItem.getAttribute('data-is-special') === 'false') {
                candidateItem = potentialItem;
            } else {
                // Try the other direction if we can't find a non-special item
                direction *= -1;
            }
        }

        // If we found a candidate, move to it, otherwise just pick any non-special item
        if (!candidateItem) {
            const nonSpecialItems = Array.from(items).filter(item =>
                item.getAttribute('data-is-special') === 'false'
            );
            candidateItem = nonSpecialItems[Math.floor(Math.random() * nonSpecialItems.length)];
        }

        if (candidateItem) {
            smoothStopToCenter(candidateItem);
        } else {
            // Fallback if something went really wrong
            smoothStopToCenter();
        }
    }

    // Get the current center item
    function getCenterItem() {
        const items = document.querySelectorAll('.roulette-item');
        const viewportCenter = window.innerWidth / 2;

        let closestItem = null;
        let smallestDistance = Infinity;

        items.forEach(item => {
            const itemRect = item.getBoundingClientRect();
            const itemCenter = itemRect.left + (itemRect.width / 2);
            const distance = Math.abs(itemCenter - viewportCenter);

            if (distance < smallestDistance) {
                smallestDistance = distance;
                closestItem = item;
            }
        });

        return closestItem;
    }

    // Smoothly stop the wheel with the selected tank in center
    function smoothStopToCenter(centerItem = null) {
        const items = document.querySelectorAll('.roulette-item');
        const viewportCenter = window.innerWidth / 2;

        let targetItem = centerItem;
        let targetPosition = 0;

        // If no center item provided, find it
        if (!targetItem) {
            targetItem = getCenterItem();
        }

        if (targetItem) {
            const itemRect = targetItem.getBoundingClientRect();
            const itemCenter = itemRect.left + (itemRect.width / 2);
            // Calculate the exact position needed to center this item
            targetPosition = currentPosition + (viewportCenter - itemCenter);

            // Use CSS animation for smooth stopping
            rouletteWheel.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
            rouletteWheel.style.transform = `translateX(-${targetPosition}px)`;

            // After animation completes, select the tank
            setTimeout(() => {
                // Verify the center item is still the same one we targeted
                const finalCenterItem = getCenterItem();
                if (finalCenterItem) {
                    // Get the original tank index from the data attribute
                    const originalIndex = finalCenterItem.getAttribute('data-original-index');

                    if (originalIndex !== 'null') {
                        selectedTank = tanks[originalIndex];
                    } else {
                        // This shouldn't happen since we avoid special prizes, but just in case
                        const nonSpecialItems = Array.from(items).filter(item =>
                            item.getAttribute('data-is-special') === 'false'
                        );
                        const randomItem = nonSpecialItems[Math.floor(Math.random() * nonSpecialItems.length)];
                        selectedTank = tanks[randomItem.getAttribute('data-original-index')];
                    }

                    if (selectedTank) {
                        showResult(selectedTank);
                    }
                }

                // Update spin counter
                spins++;
                spinCount.textContent = spins;

                // Reset transition for next spin
                rouletteWheel.style.transition = 'transform 0.1s ease-out';
            }, 500);
        }
    }

    // Highlight the item in the center of the viewport and play sound when items pass
    function highlightCenterItem() {
        const items = document.querySelectorAll('.roulette-item');
        const viewportCenter = window.innerWidth / 2;

        items.forEach(item => {
            const itemRect = item.getBoundingClientRect();
            const itemCenter = itemRect.left + (itemRect.width / 2);
            const itemId = item.getAttribute('data-item-id');

            // If item is within 30px of center, highlight it
            if (Math.abs(itemCenter - viewportCenter) < 50) {
                item.classList.add('highlighted');

                // Play sound if this is a new item crossing the center
                if (itemId !== lastCenterItemId) {
                    clickSound.currentTime = 0; // Rewind sound to start
                    clickSound.play().catch(e => console.log("Sound play failed:", e));
                    lastCenterItemId = itemId;
                }
            } else {
                item.classList.remove('highlighted');
            }
        });
    }

    // Show the selected tank result
    function showResult(tank) {
        resultImage.src = tank.image;
        resultImage.alt = tank.name;
        resultName.textContent = tank.name;
        resultNation.innerHTML = `<i class="fas fa-flag"></i> ${tank.nation}`;
        resultType.innerHTML = `<i class="fas fa-tag"></i> ${tank.type}`;
        resultLink.href = `../tanks/${tank.slug}`;

        // Show the result card with animation
        setTimeout(() => {
            resultCard.classList.remove('hidden');
            resultCard.classList.add('visible');
        }, 500);
    }

    // Initialize the page
    async function init() {
        const tankData = await fetchTankData();
        if (tankData.length > 0) {
            createRouletteItems(tankData);

            // Set up spin button
            spinButton.addEventListener('click', startSpinning);
        } else {
            rouletteWheel.innerHTML = '<p class="text-center py-10">Failed to load tank data. Please try again later.</p>';
            spinButton.disabled = true;
        }
    }

    init();
});