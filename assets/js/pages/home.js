// home.js - Fun Facts Counter Animation
document.addEventListener('DOMContentLoaded', function() {
    // Fetch fun facts data from JSON
    fetchFunFactsData();
});

async function fetchFunFactsData() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/PCWStats/Website-Configs/refs/heads/main/home-stats.json');
        if (!response.ok) {
            throw new Error('Failed to fetch fun facts data');
        }
        const data = await response.json();

        // Initialize counters with the fetched data
        initializeCounters(data);
        calculateDaysAndCoffee(data);
    } catch (error) {
        console.error('Error loading fun facts data:', error);
        // Fallback to default values if fetch fails
        const fallbackData = {
            creationDate: 'April 24, 2025 00:00:00',
            coffeePerDay: 11,
            stats: {
                teamMembers: 7,
                linesOfCode: 1190141,
                contributors: 1
            }
        };
        initializeCounters(fallbackData);
        calculateDaysAndCoffee(fallbackData);
    }
}

function initializeCounters(data) {
    const counters = document.querySelectorAll('.fun-fact-number');
    const speed = 200; // The lower the faster
    let animationComplete = true;

    counters.forEach(counter => {
        const parentItem = counter.closest('.fun-fact-item');
        const label = parentItem.querySelector('.fun-fact-label').textContent;
        let target = 0;

        // Determine which counter we are dealing with
        if (label.includes('Team Members')) {
            target = data.stats.teamMembers;
        } else if (label.includes('Lines of Code')) {
            target = data.stats.linesOfCode;
        } else if (label.includes('Community Contributors')) {
            target = data.stats.contributors;
        } else if (label.includes('Coffee Cups')) {
            // Skip coffee cups
            return;
        } else if (label.includes('Days Since Creation')) {
            // Skip days counter
            return;
        } else {
            return; // Skip unknown counters
        }

        const currentText = counter.innerText;
        let currentCount = parseFloat(currentText.replace(/[^0-9.]/g, '')) || 0;

        const isLinesOfCode = label.includes('Lines of Code');

        if (currentCount < target) {
            animationComplete = false;
            const increment = Math.max(1, target / speed);
            let newCount = Math.min(currentCount + increment, target);

            if (isLinesOfCode) {
                // For lines of code, we show raw numbers during animation
                counter.innerText = Math.floor(newCount).toLocaleString();
            } else {
                counter.innerText = Math.floor(newCount);
            }
        } else if (isLinesOfCode && !currentText.includes('M')) {
            // For the "lines of code" counter, add "M" after animation completes
            counter.innerText = (target / 1000000).toFixed(2) + 'M';
        }
    });

    if (!animationComplete) {
        requestAnimationFrame(() => initializeCounters(data));
    }
}

function calculateDaysAndCoffee(data) {
    const creationDate = new Date(data.creationDate);
    const today = new Date();
    const diffTime = today - creationDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const coffeeCups = diffDays * data.coffeePerDay;

    // Animate the days counter
    const daysCounter = document.getElementById('days-since-creation');
    animateValue(daysCounter, 0, diffDays, 2000);

    // Find and animate the coffee cups counter
    const coffeeCupsElements = document.querySelectorAll('.fun-fact-item');
    coffeeCupsElements.forEach(item => {
        if (item.querySelector('.fun-fact-label').textContent.includes('Coffee Cups')) {
            const coffeeCounter = item.querySelector('.fun-fact-number');
            animateValue(coffeeCounter, 0, coffeeCups, 2000);
        }
    });
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