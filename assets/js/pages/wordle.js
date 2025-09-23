document.addEventListener('DOMContentLoaded', function() {
    // Game constants
    const MAX_GUESSES = 3;

    // DOM Elements
    const wordleGame = document.getElementById('wordleGame');
    const wordleBoard = document.getElementById('wordleBoard');
    const wordleInput = document.getElementById('wordleInput');
    const submitButton = document.getElementById('submitGuess');
    const newGameButton = document.getElementById('newGame');

    // Modal elements
    const wordleModal = document.getElementById('wordleModal');
    const wordleModalIcon = document.getElementById('wordleModalIcon');
    const wordleModalTitle = document.getElementById('wordleModalTitle');
    const wordleModalMessage = document.getElementById('wordleModalMessage');
    const wordleModalClose = document.getElementById('wordleModalClose');

    const currentStreakElement = document.getElementById('currentStreak');
    const maxStreakElement = document.getElementById('maxStreak');
    const gamesPlayedElement = document.getElementById('gamesPlayed');
    const winPercentageElement = document.getElementById('winPercentage');
    const guessDistributionElement = document.getElementById('guessDistribution');

    // Game state
    let currentGuess = '';
    let currentRow = 0;
    let gameOver = false;
    let wordOfTheDay = '';
    let wordList = [];
    let wordLength = 5; // Dynamically set based on chosen word
    let letterTiles = [];

    // Stats
    let stats = {
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        maxStreak: 0,
        guessDistribution: {}, // Object to handle variable word lengths
        lastPlayed: null
    };

    // Initialize the game
    async function init() {
        // Load word list
        await loadWordList();

        // Load stats from localStorage
        loadStats();

        // Check if we need a new word
        checkForNewWord();

        // Set up event listeners
        wordleInput.addEventListener('input', handleInput);
        wordleInput.addEventListener('keydown', handleKeyDown);
        submitButton.addEventListener('click', submitGuess);
        newGameButton.addEventListener('click', startNewGame);
        wordleModalClose.addEventListener('click', closeModal);

        // Focus the input field
        wordleInput.focus();

        // Update stats display
        updateStatsDisplay();
    }

    // Load word list from JSON
    async function loadWordList() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/HEATLabs/Website-Configs/refs/heads/main/words.json');
            const data = await response.json();
            wordList = data.words;

            if (wordList.length === 0) {
                throw new Error('No valid words found in word list');
            }
        } catch (error) {
            console.error('Error loading word list:', error);
            // Fallback word list with varying lengths
            wordList = ['ray', 'kent', 'blitz', 'ember', 'hound', 'tank', 'shell', 'armor', 'battle', 'strategy'];
            showModal('Error', 'Error loading word list. Using fallback words.', 'error');
        }
    }

    // Load stats from localStorage
    function loadStats() {
        const savedStats = localStorage.getItem('wordleStats');
        if (savedStats) {
            stats = JSON.parse(savedStats);

            // Ensure guessDistribution is an object
            if (!stats.guessDistribution || typeof stats.guessDistribution !== 'object') {
                stats.guessDistribution = {};
            }
        }
    }

    // Save stats to localStorage
    function saveStats() {
        localStorage.setItem('wordleStats', JSON.stringify(stats));
    }

    // Check if we need a new word for the day
    function checkForNewWord() {
        const today = new Date().toDateString();
        const lastPlayed = stats.lastPlayed ? new Date(stats.lastPlayed).toDateString() : null;

        // If we've already played today, load the saved game state
        if (lastPlayed === today) {
            const savedGame = localStorage.getItem('wordleGameState');
            if (savedGame) {
                const gameState = JSON.parse(savedGame);
                wordOfTheDay = gameState.wordOfTheDay;
                wordLength = wordOfTheDay.length;
                currentRow = gameState.currentRow;
                currentGuess = gameState.currentGuess;
                gameOver = gameState.gameOver;

                // Recreate the board with correct dimensions
                createBoard();

                // Restore the board state
                restoreBoard(gameState.boardState);

                if (gameOver) {
                    disableInput();
                }

                return;
            }
        }

        // Otherwise, start a new game with today's word
        startNewGame();
    }

    // Generate a consistent word of the day based on the date
    function getWordOfTheDay() {
        const today = new Date();
        const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

        // Simple deterministic random based on date
        const index = seed % wordList.length;
        return wordList[index].toUpperCase();
    }

    // Create the game board dynamically based on word length
    function createBoard() {
        wordleBoard.innerHTML = '';
        letterTiles = [];

        // Update input maxlength
        wordleInput.maxLength = wordLength;

        for (let row = 0; row < MAX_GUESSES; row++) {
            const guessRow = document.createElement('div');
            guessRow.className = 'guess-row';

            for (let col = 0; col < wordLength; col++) {
                const tile = document.createElement('div');
                tile.className = 'letter-tile';
                tile.setAttribute('data-row', row);
                tile.setAttribute('data-col', col);
                guessRow.appendChild(tile);
                letterTiles.push(tile);
            }

            wordleBoard.appendChild(guessRow);
        }

        // Update CSS for dynamic tile sizing
        updateTileStyles();
    }

    // Update tile styles based on word length
    function updateTileStyles() {
        const tileSize = Math.min(60, Math.max(30, 400 / wordLength)); // Responsive sizing
        const fontSize = Math.min(1.5, Math.max(1, tileSize / 40));

        const style = document.createElement('style');
        style.textContent = `
            .letter-tile {
                width: ${tileSize}px;
                height: ${tileSize}px;
                font-size: ${fontSize}rem;
            }

            @media (max-width: 768px) {
                .letter-tile {
                    width: ${tileSize * 0.85}px;
                    height: ${tileSize * 0.85}px;
                    font-size: ${fontSize * 0.85}rem;
                }
            }

            @media (max-width: 480px) {
                .letter-tile {
                    width: ${tileSize * 0.7}px;
                    height: ${tileSize * 0.7}px;
                    font-size: ${fontSize * 0.7}rem;
                }
            }
        `;

        // Remove existing dynamic styles
        const existingStyle = document.getElementById('dynamicTileStyles');
        if (existingStyle) {
            existingStyle.remove();
        }

        style.id = 'dynamicTileStyles';
        document.head.appendChild(style);
    }

    // Start a new game
    function startNewGame() {
        // Reset game state
        currentGuess = '';
        currentRow = 0;
        gameOver = false;

        // Get today's word
        wordOfTheDay = getWordOfTheDay();
        wordLength = wordOfTheDay.length;

        // Create the board with correct dimensions
        createBoard();

        // Enable input
        enableInput();

        // Close any open modal
        closeModal();

        // Focus input field
        wordleInput.focus();
        wordleInput.value = '';

        // Save initial game state
        saveGameState();
    }

    // Restore the board from saved state
    function restoreBoard(boardState) {
        for (let row = 0; row < MAX_GUESSES; row++) {
            for (let col = 0; col < wordLength; col++) {
                const tileIndex = row * wordLength + col;
                const tile = letterTiles[tileIndex];
                const letterState = boardState[row][col];

                if (letterState.letter) {
                    tile.textContent = letterState.letter;
                    tile.classList.add('filled');

                    if (letterState.status) {
                        tile.classList.add(letterState.status);
                    }
                }
            }
        }
    }

    // Handle input in the text field
    function handleInput() {
        let input = wordleInput.value.toUpperCase().replace(/[^A-Z]/g, '');

        // Limit to word length
        if (input.length > wordLength) {
            input = input.substring(0, wordLength);
        }

        wordleInput.value = input;
        currentGuess = input;

        // Update the board display
        updateBoard();
    }

    // Handle keyboard events
    function handleKeyDown(e) {
        if (e.key === 'Enter') {
            submitGuess();
        } else if (e.key === 'Backspace') {
            // Allow backspace to work naturally
            setTimeout(() => {
                currentGuess = wordleInput.value.toUpperCase();
                updateBoard();
            }, 0);
        }
    }

    // Update the visual board with current guess
    function updateBoard() {
        // Clear current row
        for (let i = 0; i < wordLength; i++) {
            const tileIndex = currentRow * wordLength + i;
            const tile = letterTiles[tileIndex];
            tile.textContent = '';
            tile.className = 'letter-tile';
        }

        // Fill with current guess
        for (let i = 0; i < currentGuess.length; i++) {
            const tileIndex = currentRow * wordLength + i;
            const tile = letterTiles[tileIndex];
            tile.textContent = currentGuess[i];
            tile.classList.add('filled');
        }
    }

    // Submit the current guess
    function submitGuess() {
        if (gameOver) return;

        // Validate guess
        if (currentGuess.length !== wordLength) {
            showModal('Invalid Guess', `Guess must be ${wordLength} letters`, 'error');
            return;
        }

        if (!wordList.map(w => w.toUpperCase()).includes(currentGuess)) {
            showModal('Invalid Word', 'Not a valid word', 'error');
            return;
        }

        // Evaluate the guess
        evaluateGuess();

        // Check for win/lose conditions
        if (currentGuess === wordOfTheDay) {
            gameWon();
        } else if (currentRow === MAX_GUESSES - 1) {
            gameLost();
        } else {
            // Move to next row
            currentRow++;
            currentGuess = '';
            wordleInput.value = '';
            wordleInput.focus();
        }

        // Save game state
        saveGameState();
    }

    // Evaluate the current guess and color the tiles
    function evaluateGuess() {
        const guess = currentGuess;
        const target = wordOfTheDay;

        // Create arrays to track which letters have been matched
        const targetLetters = target.split('');
        const guessLetters = guess.split('');
        const result = Array(wordLength).fill('absent');

        // First pass: mark correct letters
        for (let i = 0; i < wordLength; i++) {
            if (guessLetters[i] === targetLetters[i]) {
                result[i] = 'correct';
                targetLetters[i] = null; // Mark as used
            }
        }

        // Second pass: mark present letters (correct but wrong position)
        for (let i = 0; i < wordLength; i++) {
            if (result[i] === 'correct') continue;

            const index = targetLetters.indexOf(guessLetters[i]);
            if (index !== -1) {
                result[i] = 'present';
                targetLetters[index] = null; // Mark as used
            }
        }

        // Apply the results to the board
        for (let i = 0; i < wordLength; i++) {
            const tileIndex = currentRow * wordLength + i;
            const tile = letterTiles[tileIndex];
            tile.classList.add(result[i]);
        }
    }

    // Handle game win
    function gameWon() {
        gameOver = true;
        showModal(
            'Congratulations!',
            `You found the word in ${currentRow + 1} guess${currentRow + 1 === 1 ? '' : 'es'}!`,
            'success'
        );
        disableInput();

        // Update stats
        updateStats(true, currentRow + 1);
    }

    // Handle game loss
    function gameLost() {
        gameOver = true;
        showModal('Game Over', `The word was ${wordOfTheDay}.`, 'error');
        disableInput();

        // Update stats
        updateStats(false);
    }

    // Show modal with message
    function showModal(title, message, type) {
        // Set modal content based on type
        wordleModalTitle.textContent = title;
        wordleModalMessage.textContent = message;

        // Clear previous icon classes
        wordleModalIcon.className = 'wordle-modal-icon';

        // Add appropriate icon and styling based on type
        switch (type) {
            case 'success':
                wordleModalIcon.classList.add('success');
                wordleModalIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
                break;
            case 'error':
                wordleModalIcon.classList.add('error');
                wordleModalIcon.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
                break;
            case 'info':
                wordleModalIcon.classList.add('info');
                wordleModalIcon.innerHTML = '<i class="fas fa-info-circle"></i>';
                break;
        }

        // Show the modal
        wordleModal.classList.add('active');

        // Focus the close button for accessibility
        setTimeout(() => {
            wordleModalClose.focus();
        }, 100);
    }

    // Close modal
    function closeModal() {
        wordleModal.classList.remove('active');
        wordleInput.focus();
    }

    // Update statistics
    function updateStats(won, guessCount = null) {
        const today = new Date().toDateString();
        const lastPlayed = stats.lastPlayed ? new Date(stats.lastPlayed).toDateString() : null;

        // Only update if we haven't played today
        if (lastPlayed !== today) {
            stats.gamesPlayed++;

            if (won) {
                stats.gamesWon++;
                stats.currentStreak++;

                // Store guess distribution by word length
                const lengthKey = wordLength.toString();
                if (!stats.guessDistribution[lengthKey]) {
                    stats.guessDistribution[lengthKey] = [0, 0, 0];
                }
                stats.guessDistribution[lengthKey][guessCount - 1]++;

                if (stats.currentStreak > stats.maxStreak) {
                    stats.maxStreak = stats.currentStreak;
                }
            } else {
                stats.currentStreak = 0;
            }

            stats.lastPlayed = new Date().toISOString();
            saveStats();
            updateStatsDisplay();
        }
    }

    // Update the stats display
    function updateStatsDisplay() {
        currentStreakElement.textContent = stats.currentStreak;
        maxStreakElement.textContent = stats.maxStreak;
        gamesPlayedElement.textContent = stats.gamesPlayed;

        const winPercentage = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
        winPercentageElement.textContent = `${winPercentage}%`;

        // Update guess distribution for current word length
        updateGuessDistribution();
    }

    // Update the guess distribution chart
    function updateGuessDistribution() {
        const lengthKey = wordLength.toString();
        const distribution = stats.guessDistribution[lengthKey] || [0, 0, 0];
        const maxGuesses = Math.max(...distribution, 1); // Avoid division by zero

        guessDistributionElement.innerHTML = '';

        for (let i = 0; i < MAX_GUESSES; i++) {
            const count = distribution[i] || 0;
            const percentage = maxGuesses > 0 ? (count / maxGuesses) * 100 : 0;

            const row = document.createElement('div');
            row.className = 'distribution-row';

            row.innerHTML = `
                <div class="distribution-label">${i + 1}</div>
                <div class="distribution-bar">
                    <div class="distribution-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="distribution-count">${count}</div>
            `;

            guessDistributionElement.appendChild(row);
        }
    }

    // Enable input
    function enableInput() {
        wordleInput.disabled = false;
        submitButton.disabled = false;
    }

    // Disable input
    function disableInput() {
        wordleInput.disabled = true;
        submitButton.disabled = true;
    }

    // Save the current game state
    function saveGameState() {
        const boardState = [];

        for (let row = 0; row < MAX_GUESSES; row++) {
            const rowState = [];

            for (let col = 0; col < wordLength; col++) {
                const tileIndex = row * wordLength + col;
                const tile = letterTiles[tileIndex];

                rowState.push({
                    letter: tile.textContent || '',
                    status: tile.classList.contains('correct') ? 'correct' : tile.classList.contains('present') ? 'present' : tile.classList.contains('absent') ? 'absent' : ''
                });
            }

            boardState.push(rowState);
        }

        const gameState = {
            wordOfTheDay: wordOfTheDay,
            wordLength: wordLength,
            currentRow: currentRow,
            currentGuess: currentGuess,
            gameOver: gameOver,
            boardState: boardState,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('wordleGameState', JSON.stringify(gameState));
    }

    // Initialize the game
    init();
});