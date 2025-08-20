// Store original cards array
let originalCards = [];
let currentPage = 1;
let postsPerPage = 12;

// Function to update devs display
function updatedevsDisplay() {
    const sortFilter = document.getElementById('sortFilter');
    const postsPerPageFilter = document.getElementById('postsPerPage');
    const devGrid = document.querySelector('.dev-grid');

    const sortValue = sortFilter.value;
    postsPerPage = postsPerPageFilter.value === 'all' ? originalCards.length : parseInt(postsPerPageFilter.value);

    // If originalCards is empty (first load), store the initial cards
    if (originalCards.length === 0) {
        originalCards = Array.from(devGrid.querySelectorAll('.dev-card'));
    }

    // Sort cards alphabetically
    let sortedCards = [...originalCards];
    sortedCards.sort((a, b) => {
        const titleA = a.querySelector('h3').textContent.toLowerCase();
        const titleB = b.querySelector('h3').textContent.toLowerCase();
        return sortValue === 'z-a' ? titleB.localeCompare(titleA) : titleA.localeCompare(titleB);
    });

    // Calculate pagination
    const totalPages = Math.ceil(sortedCards.length / postsPerPage);
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = Math.min(startIndex + postsPerPage, sortedCards.length);
    const paginatedCards = sortedCards.slice(startIndex, endIndex);

    // Clear the grid
    while (devGrid.firstChild) {
        devGrid.removeChild(devGrid.firstChild);
    }

    // Add paginated cards back to the grid
    paginatedCards.forEach(card => {
        const clonedCard = card.cloneNode(true);
        devGrid.appendChild(clonedCard);
    });

    // Update pagination controls
    updatePaginationControls(totalPages);

    // Reinitialize animations
    setTimeout(() => {
        const currentCards = devGrid.querySelectorAll('.dev-card');
        currentCards.forEach(card => {
            card.classList.add('animated');
        });
    }, 50);
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
            updatedevsDisplay();
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
            updatedevsDisplay();
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
            updatedevsDisplay();
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
            updatedevsDisplay();
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
            updatedevsDisplay();
        }
    });
    paginationContainer.appendChild(nextButton);
}

// Web Tests Functionality
function initializeWebTests() {
    // Create the web tests section
    const mainSection = document.querySelector('#main .container');
    const webTestsSection = document.createElement('div');
    webTestsSection.className = 'web-tests-section';
    webTestsSection.innerHTML = `
        <h2 class="section-title">Web Tests</h2>
        <div class="web-tests-container">
        <p class="text-center mb-8">Various tests to verify website functionality and performance</p>
            <!-- Tests will be added here -->
        </div>
    `;
    mainSection.appendChild(webTestsSection);

    const testsContainer = webTestsSection.querySelector('.web-tests-container');

    // Hitbox Viewer Test
    createTest(testsContainer, {
        id: 'hitbox-viewer',
        title: 'Hitbox Viewer',
        description: 'Displays the hitbox around ALL elements on the page at that moment',
        runTest: runHitboxTest,
        clearTest: clearHitboxTest
    });

    // LocalStorage Test
    createTest(testsContainer, {
        id: 'localstorage-test',
        title: 'LocalStorage Test',
        description: 'Write/read/clear test data from browser localStorage',
        runTest: runLocalStorageTest,
        clearTest: clearLocalStorageTest
    });

    // LocalStorage Viewer/Editor
    createTest(testsContainer, {
        id: 'localstorage-viewer',
        title: 'LocalStorage Viewer/Editor',
        description: 'Test how game saves or settings could be handled locally',
        runTest: runLocalStorageViewer,
        clearTest: clearLocalStorageViewer
    });

    // Latency Tester
    createTest(testsContainer, {
        id: 'latency-tester',
        title: 'Latency Tester',
        description: 'Ping test to GitHub servers to measure latency',
        runTest: runLatencyTest,
        clearTest: clearLatencyTest
    });

    // Input Lag Tester
    createTest(testsContainer, {
        id: 'input-lag-tester',
        title: 'Input Lag Tester',
        description: 'Measure time from keypress to visual feedback',
        runTest: runInputLagTest,
        clearTest: clearInputLagTest
    });

    // Animation Test
    createTest(testsContainer, {
        id: 'animation-test',
        title: 'Animation Test',
        description: 'Show different easing/animation curves used in your game or site',
        runTest: runAnimationTest,
        clearTest: clearAnimationTest
    });

    // Screen Resolution Checker
    createTest(testsContainer, {
        id: 'resolution-checker',
        title: 'Screen Resolution Checker',
        description: 'Display current screen/browser size and ratio',
        runTest: runResolutionTest,
        clearTest: clearResolutionTest
    });

    // DOM Stress Tester
    createTest(testsContainer, {
        id: 'dom-stress-test',
        title: 'DOM Stress Tester',
        description: 'Spawn thousands of nodes to test layout performance',
        runTest: runDomStressTest,
        clearTest: clearDomStressTest
    });

    // Mouse Accuracy Tracker
    createTest(testsContainer, {
        id: 'mouse-accuracy-test',
        title: 'Mouse Accuracy Tracker',
        description: 'Mini crosshair test with deviation visualization',
        runTest: runMouseAccuracyTest,
        clearTest: clearMouseAccuracyTest
    });

    // Key Press Timing Test
    createTest(testsContainer, {
        id: 'key-timing-test',
        title: 'Key Press Timing Test',
        description: 'For measuring keyboard event latency',
        runTest: runKeyTimingTest,
        clearTest: clearKeyTimingTest
    });

    // Save File Mock Test
    createTest(testsContainer, {
        id: 'save-file-test',
        title: 'Save File Mock',
        description: 'Upload and parse a mock .save or .json file with fake data',
        runTest: runSaveFileTest,
        clearTest: clearSaveFileTest
    });
}

function createTest(container, options) {
    const testElement = document.createElement('div');
    testElement.className = 'web-test';
    testElement.id = `test-${options.id}`;
    testElement.innerHTML = `
        <div class="test-header">
            <div class="test-status"></div>
            <div class="test-title">${options.title}</div>
        </div>
        <div class="test-description">${options.description}</div>
        <div class="test-controls">
            <button class="test-btn run" onclick="runTest('${options.id}')">Run Test</button>
            <button class="test-btn clear" onclick="clearTest('${options.id}')">Clear Test</button>
        </div>
        <div class="test-output">
            <div class="test-log">
                <div class="test-log-title">Log</div>
                <div class="test-log-content"></div>
            </div>
            <div class="test-results">
                <div class="test-results-title">Results</div>
                <div class="test-results-content"></div>
            </div>
        </div>
    `;
    container.appendChild(testElement);

    // Store the test functions
    testElement._runTest = options.runTest;
    testElement._clearTest = options.clearTest;
}

function runTest(testId) {
    const testElement = document.getElementById(`test-${testId}`);
    const runBtn = testElement.querySelector('.test-btn.run');

    // Change button text
    runBtn.textContent = 'Run Again';

    // Clear previous logs if any
    testElement.querySelector('.test-log-content').textContent = '';
    testElement.querySelector('.test-results-content').textContent = '';

    // Run the test
    testElement._runTest(testElement);
}

function clearTest(testId) {
    const testElement = document.getElementById(`test-${testId}`);
    const runBtn = testElement.querySelector('.test-btn.run');

    // Reset button text
    runBtn.textContent = 'Run Test';

    // Clear logs and results
    testElement.querySelector('.test-log-content').textContent = '';
    testElement.querySelector('.test-results-content').textContent = '';

    // Reset status
    const statusIndicator = testElement.querySelector('.test-status');
    statusIndicator.className = 'test-status';

    // Run any test-specific cleanup
    testElement._clearTest(testElement);
}

function updateTestStatus(testElement, status) {
    const statusIndicator = testElement.querySelector('.test-status');
    statusIndicator.className = 'test-status';
    statusIndicator.classList.add(status);
}

function logTestMessage(testElement, message) {
    const logContent = testElement.querySelector('.test-log-content');
    logContent.textContent += message + '\n';
    logContent.scrollTop = logContent.scrollHeight;
}

function setTestResults(testElement, results) {
    const resultsContent = testElement.querySelector('.test-results-content');
    resultsContent.textContent = results;
}

// Test Implementations

// Hitbox Viewer Test
function runHitboxTest(testElement) {
    logTestMessage(testElement, 'Running Hitbox Viewer test...');
    logTestMessage(testElement, 'Highlighting clickable elements...');

    // Clear any existing highlights
    clearHitboxTest(testElement);

    // Highlight clickable elements (buttons, links, inputs, etc.)
    const clickableSelectors = [
        'a', 'button', 'input', 'select', 'textarea',
        '[role="button"]', '[role="link"]', '[tabindex]'
    ];

    let elementsHighlighted = 0;

    clickableSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);

        elements.forEach(element => {
            if (element === testElement || element.closest('.web-test')) return;

            const rect = element.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                const highlight = document.createElement('div');
                highlight.className = 'hitbox-highlight';
                highlight.style.left = `${rect.left + window.scrollX}px`;
                highlight.style.top = `${rect.top + window.scrollY}px`;
                highlight.style.width = `${rect.width}px`;
                highlight.style.height = `${rect.height}px`;
                document.body.appendChild(highlight);
                elementsHighlighted++;
            }
        });
    });

    logTestMessage(testElement, `Highlighted ${elementsHighlighted} clickable elements on the page`);
    setTestResults(testElement, `Clickable elements highlighted: ${elementsHighlighted}`);
    updateTestStatus(testElement, 'green');
}

function clearHitboxTest(testElement) {
    const highlights = document.querySelectorAll('.hitbox-highlight');
    highlights.forEach(highlight => highlight.remove());
}

// LocalStorage Test
function runLocalStorageTest(testElement) {
    logTestMessage(testElement, 'Running LocalStorage test...');

    try {
        // Test write
        localStorage.setItem('heatlabs_test', 'test_value');
        logTestMessage(testElement, 'Successfully wrote to localStorage');

        // Test read
        const value = localStorage.getItem('heatlabs_test');
        logTestMessage(testElement, `Read from localStorage: ${value}`);

        // Test clear
        localStorage.removeItem('heatlabs_test');
        logTestMessage(testElement, 'Successfully removed test item from localStorage');

        setTestResults(testElement, 'All LocalStorage operations completed successfully');
        updateTestStatus(testElement, 'green');
    } catch (e) {
        logTestMessage(testElement, `Error: ${e.message}`);
        setTestResults(testElement, 'LocalStorage test failed');
        updateTestStatus(testElement, 'red');
    }
}

function clearLocalStorageTest(testElement) {
    // Nothing to clear for this test
}

// LocalStorage Viewer/Editor
function runLocalStorageViewer(testElement) {
    logTestMessage(testElement, 'Running LocalStorage Viewer/Editor...');

    try {
        let results = 'Current LocalStorage Contents:\n';
        let hasContent = false;

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            results += `${key}: ${value}\n`;
            hasContent = true;
        }

        if (!hasContent) {
            results += 'LocalStorage is empty';
        }

        setTestResults(testElement, results);
        updateTestStatus(testElement, hasContent ? 'green' : 'yellow');
    } catch (e) {
        logTestMessage(testElement, `Error: ${e.message}`);
        setTestResults(testElement, 'Failed to access LocalStorage');
        updateTestStatus(testElement, 'red');
    }
}

function clearLocalStorageViewer(testElement) {
    // Nothing to clear for this test
}

// Latency Tester
function runLatencyTest(testElement) {
    logTestMessage(testElement, 'Running Latency Test (ping to GitHub)...');

    const startTime = performance.now();
    fetch('https://api.github.com', {
        method: 'HEAD',
        cache: 'no-store'
    })
    .then(() => {
        const latency = Math.round(performance.now() - startTime);
        logTestMessage(testElement, `Ping to GitHub completed in ${latency}ms`);
        setTestResults(testElement, `Latency: ${latency}ms`);

        if (latency < 100) {
            updateTestStatus(testElement, 'green');
        } else if (latency < 300) {
            updateTestStatus(testElement, 'yellow');
        } else {
            updateTestStatus(testElement, 'red');
        }
    })
    .catch(error => {
        logTestMessage(testElement, `Error: ${error.message}`);
        setTestResults(testElement, 'Failed to ping GitHub');
        updateTestStatus(testElement, 'red');
    });
}

function clearLatencyTest(testElement) {
    // Nothing to clear for this test
}

// Input Lag Tester
let inputLagStartTime;
let inputLagSamples = [];
const inputLagSampleCount = 1; // Changed to test only one key press
let inputLagTestActive = false;
let inputLagTimeout;

function runInputLagTest(testElement) {
    logTestMessage(testElement, 'Running Input Lag Test...');
    logTestMessage(testElement, 'Press any key to measure input lag');

    // Reset state
    inputLagSamples = [];
    inputLagTestActive = true;

    // Change button text
    const runBtn = testElement.querySelector('.test-btn.run');
    runBtn.textContent = 'Running...';
    runBtn.disabled = true;

    // Clear previous logs if any
    testElement.querySelector('.test-log-content').textContent = '';
    testElement.querySelector('.test-results-content').textContent = '';

    // Start listening for key presses
    document.addEventListener('keydown', handleKeyDownForInputLag);

    // Set timeout to finish test if no key press
    inputLagTimeout = setTimeout(() => {
        if (inputLagSamples.length === 0) {
            finishInputLagTest(testElement);
        }
    }, 5000); // 5 second timeout

    // Start measurement
    inputLagStartTime = performance.now();
    logTestMessage(testElement, 'Press any key now...');
}

function handleKeyDownForInputLag() {
    if (!inputLagTestActive) return;

    const now = performance.now();
    const lag = now - inputLagStartTime;
    inputLagSamples.push(lag);

    const testElement = document.querySelector('.web-test#test-input-lag-tester');
    logTestMessage(testElement, `Input lag: ${lag.toFixed(2)}ms`);

    finishInputLagTest(testElement);
}

function finishInputLagTest(testElement) {
    if (!inputLagTestActive) return;
    inputLagTestActive = false;

    clearTimeout(inputLagTimeout);
    document.removeEventListener('keydown', handleKeyDownForInputLag);

    const runBtn = testElement.querySelector('.test-btn.run');
    runBtn.textContent = 'Run Again';
    runBtn.disabled = false;

    if (inputLagSamples.length === 0) {
        setTestResults(testElement, 'No key press recorded');
        updateTestStatus(testElement, 'red');
        return;
    }

    const lag = inputLagSamples[0];
    const results = `Input Lag: ${lag.toFixed(2)}ms`;

    setTestResults(testElement, results);

    if (lag < 50) {
        updateTestStatus(testElement, 'green');
    } else if (lag < 100) {
        updateTestStatus(testElement, 'yellow');
    } else {
        updateTestStatus(testElement, 'red');
    }
}

function clearInputLagTest(testElement) {
    inputLagTestActive = false;
    clearTimeout(inputLagTimeout);
    document.removeEventListener('keydown', handleKeyDownForInputLag);
    inputLagSamples = [];
    inputLagStartTime = null;

    const runBtn = testElement.querySelector('.test-btn.run');
    runBtn.textContent = 'Run Test';
    runBtn.disabled = false;
}

// Animation Test
function runAnimationTest(testElement) {
    logTestMessage(testElement, 'Running Animation Test...');

    const animationContainer = document.createElement('div');
    animationContainer.className = 'animation-test-container';

    const easings = [
        'ease', 'ease-in', 'ease-out', 'ease-in-out',
        'linear', 'step-start', 'step-end'
    ];

    easings.forEach(easing => {
        const box = document.createElement('div');
        box.className = 'animation-box';
        box.textContent = easing;
        box.style.animation = `2s infinite ${easing} alternate pulse`;
        animationContainer.appendChild(box);
    });

    testElement.querySelector('.test-results').appendChild(animationContainer);

    // Add CSS keyframes if not already present
    if (!document.getElementById('pulse-animation')) {
        const style = document.createElement('style');
        style.id = 'pulse-animation';
        style.textContent = `
            @keyframes pulse {
                from { transform: scale(1); opacity: 0.7; }
                to { transform: scale(1.1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    setTestResults(testElement, 'Animations running with different easing functions');
    updateTestStatus(testElement, 'green');
}

function clearAnimationTest(testElement) {
    const container = testElement.querySelector('.animation-test-container');
    if (container) container.remove();
}

// Screen Resolution Checker
function runResolutionTest(testElement) {
    logTestMessage(testElement, 'Running Screen Resolution Test...');

    const width = window.screen.width;
    const height = window.screen.height;
    const availWidth = window.screen.availWidth;
    const availHeight = window.screen.availHeight;
    const pixelRatio = window.devicePixelRatio;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const results = `
        Screen Resolution: ${width} × ${height}px
        Available Screen: ${availWidth} × ${availHeight}px
        Device Pixel Ratio: ${pixelRatio}
        Viewport Size: ${viewportWidth} × ${viewportHeight}px
    `;

    setTestResults(testElement, results);
    updateTestStatus(testElement, 'green');
}

function clearResolutionTest(testElement) {
    // Nothing to clear for this test
}

// DOM Stress Tester
function runDomStressTest(testElement) {
    logTestMessage(testElement, 'Running DOM Stress Test...');
    logTestMessage(testElement, 'Creating 1000 DOM elements...');

    const container = document.createElement('div');
    container.className = 'dom-stress-container';

    const startTime = performance.now();

    for (let i = 0; i < 1000; i++) {
        const item = document.createElement('div');
        item.className = 'dom-stress-item';
        item.textContent = i + 1;
        container.appendChild(item);
    }

    const duration = performance.now() - startTime;

    testElement.querySelector('.test-results').appendChild(container);

    setTestResults(testElement, `Created 1000 DOM elements in ${duration.toFixed(2)}ms`);
    updateTestStatus(testElement, duration < 100 ? 'green' : duration < 300 ? 'yellow' : 'red');
}

function clearDomStressTest(testElement) {
    const container = testElement.querySelector('.dom-stress-container');
    if (container) container.remove();
}

// Mouse Accuracy Tracker
function runMouseAccuracyTest(testElement) {
    logTestMessage(testElement, 'Running Mouse Accuracy Test...');
    logTestMessage(testElement, 'Click on the targets that appear in the test area');

    const container = document.createElement('div');
    container.className = 'crosshair-container';

    const crosshair = document.createElement('div');
    crosshair.className = 'crosshair';
    crosshair.innerHTML = `
        <div class="crosshair-horizontal"></div>
        <div class="crosshair-vertical"></div>
    `;

    container.appendChild(crosshair);

    let targetCount = 0;
    let hits = 0;
    let misses = 0;
    let totalDeviation = 0;

    function placeTarget() {
        if (targetCount >= 5) {
            finishMouseTest();
            return;
        }

        targetCount++;

        // Remove existing target if any
        const existingTarget = container.querySelector('.target');
        if (existingTarget) existingTarget.remove();

        // Place new target
        const target = document.createElement('div');
        target.className = 'target';

        const containerRect = container.getBoundingClientRect();
        const maxX = containerRect.width - 10;
        const maxY = containerRect.height - 10;

        const x = 10 + Math.random() * (maxX - 20);
        const y = 10 + Math.random() * (maxY - 20);

        target.style.left = `${x}px`;
        target.style.top = `${y}px`;

        container.appendChild(target);

        logTestMessage(testElement, `Target ${targetCount} placed - click on it!`);
    }

    function handleMouseMove(e) {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        crosshair.style.left = `${x}px`;
        crosshair.style.top = `${y}px`;
    }

    function handleMouseClick(e) {
        const target = container.querySelector('.target');
        if (!target) return;

        const targetRect = target.getBoundingClientRect();
        const targetX = targetRect.left + targetRect.width / 2;
        const targetY = targetRect.top + targetRect.height / 2;

        const clickX = e.clientX;
        const clickY = e.clientY;

        const distance = Math.sqrt(
            Math.pow(clickX - targetX, 2) +
            Math.pow(clickY - targetY, 2)
        );

        // Show deviation line
        const deviationLine = document.createElement('div');
        deviationLine.className = 'deviation-line';
        deviationLine.style.left = `${targetX - container.getBoundingClientRect().left}px`;
        deviationLine.style.top = `${targetY - container.getBoundingClientRect().top}px`;
        deviationLine.style.width = `${distance}px`;
        deviationLine.style.transform = `rotate(${Math.atan2(clickY - targetY, clickX - targetX)}rad)`;
        container.appendChild(deviationLine);

        if (distance < 20) { // Hit
            hits++;
            logTestMessage(testElement, `Hit! Deviation: ${distance.toFixed(2)}px`);
        } else { // Miss
            misses++;
            logTestMessage(testElement, `Miss! Deviation: ${distance.toFixed(2)}px`);
        }

        totalDeviation += distance;

        // Place next target
        setTimeout(placeTarget, 500);
    }

    function finishMouseTest() {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('click', handleMouseClick);

        const avgDeviation = totalDeviation / (hits + misses);
        const accuracy = (hits / (hits + misses)) * 100;

        const results = `
            Hits: ${hits}
            Misses: ${misses}
            Accuracy: ${accuracy.toFixed(1)}%
            Average Deviation: ${avgDeviation.toFixed(2)}px
        `;

        setTestResults(testElement, results);

        if (accuracy > 90) {
            updateTestStatus(testElement, 'green');
        } else if (accuracy > 70) {
            updateTestStatus(testElement, 'yellow');
        } else {
            updateTestStatus(testElement, 'red');
        }
    }

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleMouseClick);

    testElement.querySelector('.test-results').appendChild(container);

    // Start first target
    placeTarget();
}

function clearMouseAccuracyTest(testElement) {
    const container = testElement.querySelector('.crosshair-container');
    if (container) container.remove();
}

// Key Press Timing Test
let keyTimingStartTime;
let keyTimingSamples = [];
const keyTimingSampleCount = 10;
let keyTimingInterval;
let keyTimingTestActive = false;

function runKeyTimingTest(testElement) {
    logTestMessage(testElement, 'Running Key Press Timing Test...');
    logTestMessage(testElement, `Press any key ${keyTimingSampleCount} times as quickly as possible`);

    // Reset state
    keyTimingSamples = [];
    keyTimingTestActive = true;

    // Change button text
    const runBtn = testElement.querySelector('.test-btn.run');
    runBtn.textContent = 'Running...';
    runBtn.disabled = true;

    // Clear previous logs if any
    testElement.querySelector('.test-log-content').textContent = '';
    testElement.querySelector('.test-results-content').textContent = '';

    // Start listening for key presses
    document.addEventListener('keydown', handleKeyDownForTiming);

    // Set timeout to finish test if not enough key presses
    keyTimingInterval = setTimeout(() => {
        if (keyTimingSamples.length < keyTimingSampleCount) {
            finishKeyTimingTest(testElement);
        }
    }, 10000); // 10 second timeout

    logTestMessage(testElement, 'Start pressing any key repeatedly...');
}

function handleKeyDownForTiming(e) {
    if (!keyTimingTestActive) return;

    const now = performance.now();

    if (keyTimingStartTime) {
        const interval = now - keyTimingStartTime;
        keyTimingSamples.push(interval);

        const testElement = document.querySelector('.web-test#test-key-timing-test');
        logTestMessage(testElement, `Key press ${keyTimingSamples.length}: ${interval.toFixed(2)}ms`);

        if (keyTimingSamples.length >= keyTimingSampleCount) {
            finishKeyTimingTest(testElement);
        }
    }

    keyTimingStartTime = now;
}

function finishKeyTimingTest(testElement) {
    if (!keyTimingTestActive) return;
    keyTimingTestActive = false;

    clearTimeout(keyTimingInterval);
    document.removeEventListener('keydown', handleKeyDownForTiming);

    const runBtn = testElement.querySelector('.test-btn.run');
    runBtn.textContent = 'Run Again';
    runBtn.disabled = false;

    if (keyTimingSamples.length === 0) {
        setTestResults(testElement, 'No key presses recorded');
        updateTestStatus(testElement, 'red');
        return;
    }

    const average = keyTimingSamples.reduce((sum, val) => sum + val, 0) / keyTimingSamples.length;
    const max = Math.max(...keyTimingSamples);
    const min = Math.min(...keyTimingSamples);
    const consistency = (max - min) / average * 100;

    const results = `
        Key Presses Recorded: ${keyTimingSamples.length}
        Average Interval: ${average.toFixed(2)}ms
        Min Interval: ${min.toFixed(2)}ms
        Max Interval: ${max.toFixed(2)}ms
        Consistency: ${consistency.toFixed(1)}%
    `;

    setTestResults(testElement, results);

    if (consistency < 20) {
        updateTestStatus(testElement, 'green');
    } else if (consistency < 40) {
        updateTestStatus(testElement, 'yellow');
    } else {
        updateTestStatus(testElement, 'red');
    }
}

function clearKeyTimingTest(testElement) {
    keyTimingTestActive = false;
    clearTimeout(keyTimingInterval);
    document.removeEventListener('keydown', handleKeyDownForTiming);
    keyTimingSamples = [];
    keyTimingStartTime = null;

    const runBtn = testElement.querySelector('.test-btn.run');
    runBtn.textContent = 'Run Test';
    runBtn.disabled = false;
}

// Save File Mock Test
function runSaveFileTest(testElement) {
    logTestMessage(testElement, 'Running Save File Mock Test...');

    // Create mock save data
    const mockSaveData = {
        version: "1.0",
        player: {
            id: "player_" + Math.random().toString(36).substr(2, 9),
            name: "SINEWAVE",
            level: 100,
            experience: 9000,
            currency: {
                gold: 1,
                silver: -50
            }
        },
        settings: {
            graphics: "potato",
            controls: "Wii Remote",
            audio: {
                master: 100,
                music: 100,
                effects: 0
            }
        },
        timestamp: new Date().toISOString()
    };

    // Convert to JSON string
    const jsonData = JSON.stringify(mockSaveData, null, 2);

    // Create download link
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mock_save_file.json';

    // Change button to "Check Test"
    const runBtn = testElement.querySelector('.test-btn.run');
    runBtn.textContent = 'Check Test';
    runBtn.onclick = () => checkSaveFileTest(testElement);

    // Clear previous logs if any
    testElement.querySelector('.test-log-content').textContent = '';
    testElement.querySelector('.test-results-content').textContent = '';

    logTestMessage(testElement, 'Downloading mock save file...');

    // Trigger download
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    logTestMessage(testElement, 'Mock save file downloaded. Edit it and click "Check Test" to verify.');
    updateTestStatus(testElement, 'yellow');
}

function checkSaveFileTest(testElement) {
    logTestMessage(testElement, 'Checking edited save file...');

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json,.save';
    fileInput.style.display = 'none';

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                logTestMessage(testElement, `Successfully parsed ${file.name}`);

                // Display the parsed data in a readable format
                const formattedData = JSON.stringify(data, null, 2);
                setTestResults(testElement, `File Contents:\n${formattedData}`);

                // Check if the file was modified
                if (file.name === 'mock_save_file.json' &&
                    data.player &&
                    data.player.name === "TestPlayer") {
                    logTestMessage(testElement, 'File appears to be the original mock file');
                    updateTestStatus(testElement, 'yellow');
                } else {
                    logTestMessage(testElement, 'File appears to have been modified');
                    updateTestStatus(testElement, 'green');
                }
            } catch (error) {
                logTestMessage(testElement, `Error parsing file: ${error.message}`);
                setTestResults(testElement, 'Invalid file format');
                updateTestStatus(testElement, 'red');
            }
        };
        reader.onerror = () => {
            logTestMessage(testElement, 'Error reading file');
            setTestResults(testElement, 'File read error');
            updateTestStatus(testElement, 'red');
        };
        reader.readAsText(file);
    });

    testElement.appendChild(fileInput);
    fileInput.click();

    // Reset button to "Run Test" for next time
    const runBtn = testElement.querySelector('.test-btn.run');
    runBtn.textContent = 'Run Test';
    runBtn.onclick = () => runSaveFileTest(testElement);
}

function clearSaveFileTest(testElement) {
    // Reset button
    const runBtn = testElement.querySelector('.test-btn.run');
    runBtn.textContent = 'Run Test';
    runBtn.onclick = () => runSaveFileTest(testElement);
}

// Initialize dev functionality
document.addEventListener('DOMContentLoaded', function() {
    const sortFilter = document.getElementById('sortFilter');
    const postsPerPageFilter = document.getElementById('postsPerPage');

    // Initialize with default sorting
    updatedevsDisplay();

    // Add event listeners for filter changes
    sortFilter.addEventListener('change', () => {
        currentPage = 1;
        updatedevsDisplay();
    });
    postsPerPageFilter.addEventListener('change', () => {
        currentPage = 1;
        updatedevsDisplay();
    });

    // Initialize animations after page load
    setTimeout(() => {
        const devCards = document.querySelectorAll('.dev-card');
        devCards.forEach(card => {
            card.classList.add('animated');
        });
    }, 300);

    // Initialize web tests
    initializeWebTests();
});