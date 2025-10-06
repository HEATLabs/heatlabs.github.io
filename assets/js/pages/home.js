// home.js - Fun Facts Counter Animation
document.addEventListener('DOMContentLoaded', function() {
    // Fetch fun facts data from JSON
    fetchFunFactsData();

    // Initialize hero counters
    initializeHeroCounters();
});

// Hero Counters Animation
async function initializeHeroCounters() {
    try {
        // Fetch all required data
        const [agentsData, mapsData, tanksData] = await Promise.all([
            fetch('https://raw.githubusercontent.com/HEATLabs/HEAT-Labs-Configs/refs/heads/main/agents.json').then(res => res.json()),
            fetch('https://raw.githubusercontent.com/HEATLabs/HEAT-Labs-Configs/refs/heads/main/maps.json').then(res => res.json()),
            fetch('https://raw.githubusercontent.com/HEATLabs/HEAT-Labs-Configs/refs/heads/main/tanks.json').then(res => res.json())
        ]);

        // Count all items
        const agentsCount = agentsData.agents.length;
        const mapsCount = mapsData.maps.length;
        const tanksCount = tanksData.length;

        // Speed factor: higher = faster, lower = slower
        const speedFactor = 2;

        // Animate counters with speed factor
        animateHeroCounter('agents-count', agentsCount, 1500, speedFactor);
        animateHeroCounter('maps-count', mapsCount, 1500, speedFactor);
        animateHeroCounter('tanks-count', tanksCount, 1500, speedFactor);

    } catch (error) {
        console.error('Error loading hero counters data:', error);
        // Show N/A if fetch fails
        document.getElementById('agents-count').textContent = 'N/A';
        document.getElementById('maps-count').textContent = 'N/A';
        document.getElementById('tanks-count').textContent = 'N/A';
    }
}

function animateHeroCounter(elementId, targetValue, duration, speedFactor = 1) {
    const element = document.getElementById(elementId);
    if (!element) return;

    let startValue = 0;
    const startTime = performance.now();

    function updateCounter(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        // Apply speed factor
        const adjustedProgress = Math.min(progress * speedFactor, 1);
        const currentValue = Math.floor(startValue + (targetValue - startValue) * adjustedProgress);

        element.textContent = currentValue.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = targetValue.toLocaleString();
        }
    }

    requestAnimationFrame(updateCounter);
}

async function fetchFunFactsData() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/HEATLabs/HEAT-Labs-Configs/refs/heads/main/home-stats.json');
        if (!response.ok) {
            throw new Error('Failed to fetch fun facts data');
        }
        const data = await response.json();

        // Initialize counters with the fetched data
        initializeCounters(data);
        calculateDaysAndCoffee(data);
    } catch (error) {
        console.error('Error loading fun facts data:', error);
        // Show N/A for all counters if fetch fails
        showNAForAllCounters();
    }
}

function showNAForAllCounters() {
    const counters = document.querySelectorAll('.fun-fact-number');
    counters.forEach(counter => {
        counter.innerText = 'N/A';
    });
}

function initializeCounters(data) {
    const counters = document.querySelectorAll('.fun-fact-number');
    const speed = 200; // The lower the faster
    let animationComplete = true;

    counters.forEach(counter => {
        const parentItem = counter.closest('.fun-fact-item');
        const label = parentItem.querySelector('.fun-fact-label').textContent;
        let target = null;
        let isLinesOfCode = false;
        let isTotalFiles = false;

        // Determine which counter we are dealing with
        if (label.includes('Team Members')) {
            target = data.stats.teamMembers;
        } else if (label.includes('Lines of Code')) {
            target = data.stats.linesOfCode;
            isLinesOfCode = true;
        } else if (label.includes('Community Contributors')) {
            target = data.stats.contributors;
        } else if (label.includes('Total Files')) {
            target = data.stats.filesCount;
            isTotalFiles = true;
        } else if (label.includes('Total Folders')) {
            target = data.stats.foldersCount;
        } else if (label.includes('Project Size')) {
            target = data.stats.totalSizeGB;
        } else if (label.includes('Coffee Cups')) {
            // Skip coffee cups
            return;
        } else if (label.includes('Days Since Creation')) {
            // Skip days counter
            return;
        } else {
            return; // Skip unknown counters
        }

        // If data is missing for this counter, show N/A
        if (target === null || target === undefined) {
            counter.innerText = 'N/A';
            return;
        }

        const currentText = counter.innerText;
        let currentCount = 0;

        // Parse current count based on format
        if (currentText.includes('k')) {
            currentCount = parseFloat(currentText) * 1000;
        } else if (currentText.includes('M')) {
            currentCount = parseFloat(currentText) * 1000000;
        } else if (currentText.includes('GB')) {
            currentCount = parseFloat(currentText);
        } else if (currentText === 'N/A') {
            currentCount = 0;
        } else {
            currentCount = parseFloat(currentText.replace(/[^0-9.]/g, '')) || 0;
        }

        // If animation is not complete, continue animating
        if (currentCount < target) {
            animationComplete = false;
            const increment = Math.max(1, target / speed);
            let newCount = Math.min(currentCount + increment, target);

            if (isTotalFiles) {
                // For total files, show raw number during animation
                counter.innerText = Math.floor(newCount).toLocaleString();
            } else if (label.includes('Project Size')) {
                // For project size, show GB with 2 decimal places
                counter.innerText = newCount.toFixed(2) + 'GB';
            } else if (isLinesOfCode) {
                // For lines of code, we show raw numbers during animation
                counter.innerText = Math.floor(newCount).toLocaleString();
            } else {
                counter.innerText = Math.floor(newCount);
            }
        } else {
            // Animation complete, set final formatted values
            if (isLinesOfCode) {
                counter.innerText = (target / 1000000).toFixed(2) + 'M';
            } else if (isTotalFiles) {
                // For total files, show the full number with commas
                counter.innerText = target.toLocaleString();
            } else if (label.includes('Project Size')) {
                counter.innerText = target.toFixed(2) + 'GB';
            } else {
                counter.innerText = target.toLocaleString();
            }
        }
    });

    if (!animationComplete) {
        requestAnimationFrame(() => initializeCounters(data));
    }
}

function calculateDaysAndCoffee(data) {
    try {
        const creationDate = new Date(data.creationDate);
        const today = new Date();
        const diffTime = today - creationDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const coffeeCups = diffDays * data.coffeePerDay;

        // Animate the days counter
        const daysCounter = document.getElementById('days-since-creation');
        if (daysCounter) {
            animateValue(daysCounter, 0, diffDays, 2000);
        }

        // Find and animate the coffee cups counter
        const coffeeCupsElements = document.querySelectorAll('.fun-fact-item');
        coffeeCupsElements.forEach(item => {
            if (item.querySelector('.fun-fact-label').textContent.includes('Coffee Cups')) {
                const coffeeCounter = item.querySelector('.fun-fact-number');
                if (coffeeCounter) {
                    animateValue(coffeeCounter, 0, coffeeCups, 2000);
                }
            }
        });
    } catch (error) {
        console.error('Error calculating days and coffee:', error);
        // Show N/A for days and coffee counters
        const daysCounter = document.getElementById('days-since-creation');
        if (daysCounter) {
            daysCounter.innerText = 'N/A';
        }

        const coffeeCupsElements = document.querySelectorAll('.fun-fact-item');
        coffeeCupsElements.forEach(item => {
            if (item.querySelector('.fun-fact-label').textContent.includes('Coffee Cups')) {
                const coffeeCounter = item.querySelector('.fun-fact-number');
                if (coffeeCounter) {
                    coffeeCounter.innerText = 'N/A';
                }
            }
        });
    }
}

function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}