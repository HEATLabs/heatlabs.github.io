// Console Easter Egg JS for HEATLabs
document.addEventListener('DOMContentLoaded', function() {
    // Console elements
    const consoleModal = document.getElementById('consoleModal');
    const consoleOverlay = document.getElementById('consoleOverlay');
    const consoleContent = document.getElementById('consoleContent');
    const consoleInput = document.getElementById('consoleInput');
    const consoleOutput = document.getElementById('consoleOutput');

    // ASCII Art for boot screen
    const asciiArt = `
░█░█░█▀▀░█▀█░▀█▀░░░█░░░█▀█░█▀▄░█▀▀
░█▀█░█▀▀░█▀█░░█░░░░█░░░█▀█░█▀▄░▀▀█
░▀░▀░▀▀▀░▀░▀░░▀░░░░▀▀▀░▀░▀░▀▀░░▀▀▀
    `;

    // Easter egg activation - typing "console" or "hacker"
    let activationBuffer = '';
    const activationWords = ['console', 'hacker'];

    // Command history
    let commandHistory = [];
    let historyIndex = -1;

    // Sudo state
    let sudoActive = false;
    let sudoAttempts = 0;
    let currentSudoCommand = null;

    // Available commands
    const commands = {
        help: {
            description: 'Displays this help message',
            usage: 'help',
            execute: () => showHelp()
        },
        clear: {
            description: 'Clears the console',
            usage: 'clear',
            execute: () => clearConsole()
        },
        tanks: {
            description: 'Lists all available tanks',
            usage: 'tanks',
            execute: () => listTanks()
        },
        stats: {
            description: 'Shows tank stats',
            usage: 'stats <tank_name>',
            execute: (args) => showTankStats(args)
        },
        compare: {
            description: 'Compare two tanks',
            usage: 'compare <tank1> <tank2>',
            execute: (args) => compareTanks(args)
        },
        tournaments: {
            description: 'Lists recent tournaments',
            usage: 'tournaments',
            execute: () => listTournaments()
        },
        version: {
            description: 'Shows HEAT Labs version info',
            usage: 'version',
            execute: () => showVersion()
        },
        about: {
            description: 'About HEAT Labs project',
            usage: 'about',
            execute: () => aboutProject()
        },
        echo: {
            description: 'Prints the given text',
            usage: 'echo <text>',
            execute: (args) => echo(args)
        },
        matrix: {
            description: 'Enter the matrix',
            usage: 'matrix',
            execute: () => matrixEffect()
        },
        roulette: {
            description: 'Random tank selector',
            usage: 'roulette',
            execute: () => tankRoulette()
        },
        secret: {
            description: 'You found a secret command!',
            usage: 'secret',
            execute: () => secretCommand(),
            hidden: true
        },
        sudo: {
            description: 'Gives you admin privileges (not really)',
            usage: 'sudo <command>',
            execute: (args) => sudoCommand(args),
            hidden: true
        },
        hack: {
            description: 'Hack the mainframe',
            usage: 'hack',
            execute: () => hackCommand(),
            hidden: true
        },
        reboot: {
            description: 'Reboot the console',
            usage: 'reboot',
            execute: () => rebootConsole()
        },
        theme: {
            description: 'Change console theme',
            usage: 'theme <dark/light/matrix>',
            execute: (args) => changeTheme(args)
        },
        joke: {
            description: 'Tell a tank-related joke',
            usage: 'joke',
            execute: () => tellJoke()
        },
        music: {
            description: 'Play some 8-bit music',
            usage: 'music',
            execute: () => playMusic(),
            hidden: true
        },
        cheat: {
            description: 'Enable cheats (just kidding)',
            usage: 'cheat',
            execute: () => cheatCommand(),
            hidden: true
        },
        quit: {
            description: 'Closes the console',
            usage: 'quit',
            execute: () => closeConsole()
        }
    };

    // Initialize console
    function initConsole() {
        // Activation word listener
        document.addEventListener('keydown', function(e) {
            // Only track letters
            if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
                activationBuffer += e.key.toLowerCase();

                // Check if buffer contains any activation word
                for (const word of activationWords) {
                    if (activationBuffer.includes(word)) {
                        openConsole();
                        activationBuffer = '';
                        return;
                    }
                }

                // Keep buffer manageable
                if (activationBuffer.length > 20) {
                    activationBuffer = activationBuffer.slice(-20);
                }
            }
        });

        // Console input handler
        consoleInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                processCommand(consoleInput.value);
                consoleInput.value = '';
            } else if (e.key === 'ArrowUp') {
                // Navigate command history up
                if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    consoleInput.value = commandHistory[commandHistory.length - 1 - historyIndex];
                }
                e.preventDefault();
            } else if (e.key === 'ArrowDown') {
                // Navigate command history down
                if (historyIndex > 0) {
                    historyIndex--;
                    consoleInput.value = commandHistory[commandHistory.length - 1 - historyIndex];
                } else {
                    historyIndex = -1;
                    consoleInput.value = '';
                }
                e.preventDefault();
            } else if (e.key === 'Tab') {
                // Tab completion
                e.preventDefault();
                const input = consoleInput.value.trim();
                if (input) {
                    const matches = Object.keys(commands).filter(cmd =>
                        cmd.startsWith(input.toLowerCase()) &&
                        (!commands[cmd].hidden || sudoActive)
                    );

                    if (matches.length === 1) {
                        consoleInput.value = matches[0];
                    } else if (matches.length > 1) {
                        addOutputLine('Possible completions:', 'help-header');
                        matches.forEach(match => {
                            addOutputLine(`- ${match}`, 'help-line');
                        });
                    }
                }
            }
        });

        // Close modal handlers
        consoleOverlay.addEventListener('click', closeConsole);
    }

    // Open console with boot animation
    function openConsole() {
        consoleModal.classList.add('active');
        consoleOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Clear console and start boot sequence
        clearConsole();
        consoleOutput.innerHTML = '<div class="boot-line">Initializing HEAT Labs Console v1.1...</div>';

        // Simulate boot sequence
        setTimeout(() => {
            addOutputLine('Checking system resources...');
        }, 500);

        setTimeout(() => {
            addOutputLine('Loading tank database...');
        }, 1000);

        setTimeout(() => {
            addOutputLine('Connecting to HEAT Labs API...');
        }, 1500);

        setTimeout(() => {
            addOutputLine('Verifying user credentials...');
        }, 2000);

        setTimeout(() => {
            addOutputLine('<br>');
            addOutputLine(asciiArt);
            addOutputLine('Type "help" for a list of available commands');
            addOutputLine('--------------------------------------------');
            consoleInput.focus();
        }, 2500);
    }

    // Close console
    function closeConsole() {
        consoleModal.classList.remove('active');
        consoleOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Reboot console
    function rebootConsole() {
        addOutputLine('Rebooting console...', 'reboot-line');
        setTimeout(() => {
            consoleOutput.innerHTML = '';
            openConsole();
        }, 1000);
    }

    // Clear console
    function clearConsole() {
        consoleOutput.innerHTML = '';
        addOutputLine('HEAT Labs Console [Version 1.1]');
        addOutputLine('(c) 2025 HEAT LabsTeam. All rights reserved.');
        addOutputLine('');
    }

    // Add output line to console
    function addOutputLine(text, className = '', replaceLast = false) {
        if (replaceLast && consoleOutput.lastChild) {
            consoleOutput.removeChild(consoleOutput.lastChild);
        }

        const line = document.createElement('div');
        line.className = className;
        line.innerHTML = text;
        consoleOutput.appendChild(line);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    // Process command
    function processCommand(input) {
        if (!input.trim()) return;

        // Add to command history
        commandHistory.push(input);
        historyIndex = -1;

        // Display command
        addOutputLine(`<span class="prompt">${sudoActive ? 'root' : 'user'}@heatlabs:~$</span> ${input}`, 'command-line');

        // Parse command
        const parts = input.split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        // Handle sudo commands
        if (sudoActive && currentSudoCommand) {
            handleSudoPassword(input);
            return;
        }

        // Execute command
        if (commands[command]) {
            try {
                commands[command].execute(args);
            } catch (error) {
                addOutputLine(`Error executing command: ${error.message}`, 'error');
            }
        } else {
            addOutputLine(`'${command}' is not recognized as an internal or external command. Type 'help' for available commands.`, 'error');
        }
    }

    // Handle sudo password input
    function handleSudoPassword(input) {
        sudoAttempts++;

        // "Correct" password (just for fun)
        if (input === 'password' || input === '1234' || input === 'admin') {
            addOutputLine('Password accepted!', 'sudo-success');
            addOutputLine('Just kidding, you still have no privileges.', 'sudo-line');
            sudoActive = false;

            // Execute the original command with fake "admin" mode
            if (currentSudoCommand) {
                setTimeout(() => {
                    addOutputLine(`Executing: ${currentSudoCommand}`, 'sudo-line');
                    processCommand(currentSudoCommand);
                }, 500);
            }
        } else {
            if (sudoAttempts >= 3) {
                addOutputLine('Too many incorrect attempts. Sudo disabled.', 'sudo-error');
                sudoActive = false;
            } else {
                addOutputLine('Incorrect password. Try again.', 'sudo-error');
                addOutputLine(`[sudo] password for user: `, 'sudo-line');
            }
        }
    }

    // Show help
    function showHelp() {
        addOutputLine('Available commands:', 'help-header');
        addOutputLine('------------------', 'help-header');

        Object.keys(commands)
            .filter(cmd => !commands[cmd].hidden || sudoActive)
            .forEach(cmd => {
                addOutputLine(`<span class="command-name">${cmd}</span> - ${commands[cmd].description}`, 'help-line');
                addOutputLine(`   Usage: ${commands[cmd].usage}`, 'help-usage');
            });

        if (sudoActive) {
            addOutputLine('<br>Admin commands unlocked!', 'sudo-success');
        }
    }

    // List all tanks
    async function listTanks() {
        try {
            const response = await fetch('https://cdn.jsdelivr.net/gh/HEATLabs/HEAT-Labs-Database@main/tanks.json');
            if (!response.ok) throw new Error('Failed to load tank data');

            const data = await response.json();
            addOutputLine('Available tanks:', 'output-header');
            addOutputLine('---------------', 'output-header');

            data.forEach(tank => {
                addOutputLine(`- ${tank.name} (${tank.nation}, ${tank.type})`, 'tank-item');
            });

            addOutputLine(`<br>Total tanks: ${data.length}`, 'output-footer');
        } catch (error) {
            addOutputLine(`Error: ${error.message}`, 'error');
        }
    }

    // Show tank stats
    async function showTankStats(args) {
        if (!args || args.length === 0) {
            addOutputLine('Usage: stats <tank_name>', 'error');
            addOutputLine('Example: stats tiger', 'error');
            return;
        }

        const tankName = args.join(' ');

        try {
            const response = await fetch('https://cdn.jsdelivr.net/gh/HEATLabs/HEAT-Labs-Configs@main/tanks.json');
            if (!response.ok) throw new Error('Failed to load tank data');

            const data = await response.json();
            const tank = data.find(t => t.name.toLowerCase().includes(tankName.toLowerCase()));

            if (!tank) {
                addOutputLine(`Tank "${tankName}" not found.`, 'error');
                return;
            }

            addOutputLine(`Stats for ${tank.name}:`, 'output-header');
            addOutputLine('---------------------', 'output-header');
            addOutputLine(`Nation: ${tank.nation}`, 'tank-stat');
            addOutputLine(`Type: ${tank.type}`, 'tank-stat');
            addOutputLine(`Class: ${tank.class}`, 'tank-stat');

            // Try to get stock stats if available
            if (tank.stock) {
                try {
                    const stockResponse = await fetch(tank.stock);
                    if (stockResponse.ok) {
                        const stockData = await stockResponse.json();
                        const tankStats = stockData[tank.id] || stockData[tank.slug] || Object.values(stockData)[0];

                        if (tankStats) {
                            addOutputLine('<br>Firepower:', 'stat-category');
                            if (tankStats.FIREPOWER) {
                                addOutputLine(`- Damage: ${tankStats.FIREPOWER.DAMAGE}`, 'stat-item');
                                addOutputLine(`- Penetration: ${tankStats.FIREPOWER.PENETRATION}`, 'stat-item');
                            }

                            addOutputLine('<br>Survivability:', 'stat-category');
                            if (tankStats.SURVIVABILITY) {
                                addOutputLine(`- Hit Points: ${tankStats.SURVIVABILITY["HIT POINTS"]}`, 'stat-item');
                            }

                            addOutputLine('<br>Mobility:', 'stat-category');
                            if (tankStats.MOBILITY) {
                                addOutputLine(`- Speed: ${tankStats.MOBILITY["FORWARD SPEED, KM/H"]} km/h`, 'stat-item');
                            }
                        }
                    }
                } catch (error) {
                    addOutputLine('<br>Could not load detailed stats', 'warning');
                }
            }
        } catch (error) {
            addOutputLine(`Error: ${error.message}`, 'error');
        }
    }

    // Compare two tanks
    async function compareTanks(args) {
        if (!args || args.length < 2) {
            addOutputLine('Usage: compare <tank1> <tank2>', 'error');
            addOutputLine('Example: compare tiger panther', 'error');
            return;
        }

        const tank1Name = args[0];
        const tank2Name = args[1];

        try {
            const response = await fetch('https://cdn.jsdelivr.net/gh/HEATLabs/HEAT-Labs-Configs@main/tanks.json');
            if (!response.ok) throw new Error('Failed to load tank data');

            const data = await response.json();
            const tank1 = data.find(t => t.name.toLowerCase().includes(tank1Name.toLowerCase()));
            const tank2 = data.find(t => t.name.toLowerCase().includes(tank2Name.toLowerCase()));

            if (!tank1 || !tank2) {
                addOutputLine(`Could not find both tanks. Make sure names are correct.`, 'error');
                return;
            }

            addOutputLine(`Comparing ${tank1.name} vs ${tank2.name}:`, 'output-header');
            addOutputLine('------------------------------', 'output-header');

            // Basic comparison
            addOutputLine('<br>Basic Info:', 'stat-category');
            addOutputLine(`- Nation: ${tank1.nation} vs ${tank2.nation}`, 'stat-item');
            addOutputLine(`- Type: ${tank1.type} vs ${tank2.type}`, 'stat-item');
            addOutputLine(`- Class: ${tank1.class} vs ${tank2.class}`, 'stat-item');

            // Try to compare stats if available
            if (tank1.stock && tank2.stock) {
                try {
                    const [res1, res2] = await Promise.all([fetch(tank1.stock), fetch(tank2.stock)]);
                    if (res1.ok && res2.ok) {
                        const [data1, data2] = await Promise.all([res1.json(), res2.json()]);
                        const stats1 = data1[tank1.id] || data1[tank1.slug] || Object.values(data1)[0];
                        const stats2 = data2[tank2.id] || data2[tank2.slug] || Object.values(data2)[0];

                        if (stats1 && stats2) {
                            addOutputLine('<br>Firepower Comparison:', 'stat-category');
                            if (stats1.FIREPOWER && stats2.FIREPOWER) {
                                compareStat('Damage', stats1.FIREPOWER.DAMAGE, stats2.FIREPOWER.DAMAGE);
                                compareStat('Penetration', stats1.FIREPOWER.PENETRATION, stats2.FIREPOWER.PENETRATION);
                            }

                            addOutputLine('<br>Survivability Comparison:', 'stat-category');
                            if (stats1.SURVIVABILITY && stats2.SURVIVABILITY) {
                                compareStat('Hit Points', stats1.SURVIVABILITY["HIT POINTS"], stats2.SURVIVABILITY["HIT POINTS"]);
                            }

                            addOutputLine('<br>Mobility Comparison:', 'stat-category');
                            if (stats1.MOBILITY && stats2.MOBILITY) {
                                compareStat('Speed', stats1.MOBILITY["FORWARD SPEED, KM/H"], stats2.MOBILITY["FORWARD SPEED, KM/H"]);
                            }
                        }
                    }
                } catch (error) {
                    addOutputLine('<br>Could not load detailed comparison data', 'warning');
                }
            }
        } catch (error) {
            addOutputLine(`Error: ${error.message}`, 'error');
        }
    }

    // Helper function to compare and display stats
    function compareStat(name, val1, val2) {
        if (val1 && val2) {
            const diff = parseFloat(val1) - parseFloat(val2);
            let result = '';

            if (diff > 0) {
                result = `(+${diff.toFixed(1)})`;
            } else if (diff < 0) {
                result = `(${diff.toFixed(1)})`;
            } else {
                result = '(equal)';
            }

            addOutputLine(`- ${name}: ${val1} vs ${val2} ${result}`, 'stat-item');
        }
    }

    // List tournaments
    async function listTournaments() {
        try {
            const response = await fetch('https://cdn.jsdelivr.net/gh/HEATLabs/HEAT-Labs-Configs@main/tournaments.json');
            if (!response.ok) throw new Error('Failed to load tournament data');

            const data = await response.json();
            addOutputLine('Recent tournaments:', 'output-header');
            addOutputLine('------------------', 'output-header');

            data.slice(0, 5).forEach(tournament => {
                addOutputLine(`- ${tournament['tournament-name']} (${tournament.date})`, 'tournament-item');
            });
        } catch (error) {
            addOutputLine(`Error: ${error.message}`, 'error');
        }
    }

    // Show version info
    async function showVersion() {
        try {
            const response = await fetch('https://cdn.jsdelivr.net/gh/HEATLabs/HEAT-Labs-Configs@main/changelog.json');
            if (!response.ok) throw new Error('Failed to load version data');

            const data = await response.json();
            if (data.updates && data.updates.length > 0) {
                const latest = data.updates[0];
                addOutputLine('HEAT Labs Version Information:', 'output-header');
                addOutputLine('----------------------------', 'output-header');
                addOutputLine(`Version: v${latest.version}`, 'version-info');
                addOutputLine(`Release Date: ${formatDate(latest.date)}`, 'version-info');
                addOutputLine(`Description: ${latest.description}`, 'version-info');
            }
        } catch (error) {
            addOutputLine('HEAT Labs Console [Version 1.1]', 'version-info');
            addOutputLine('(Fallback version information)', 'warning');
        }
    }

    // Format date
    function formatDate(dateString) {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    // About project
    function aboutProject() {
        addOutputLine('HEAT Labs Project Information:', 'output-header');
        addOutputLine('---------------------------', 'output-header');
        addOutputLine('HEAT Labs is a community-driven project aimed at providing', 'about-line');
        addOutputLine('Project CW players with comprehensive and reliable tank', 'about-line');
        addOutputLine('statistics and gameplay information.', 'about-line');
        addOutputLine('', 'about-line');
        addOutputLine('Created by SINEWAVE and passionate players of Project CW.', 'about-line');
    }

    // Echo command
    function echo(args) {
        if (!args || args.length === 0) {
            addOutputLine('Usage: echo <text>', 'error');
            return;
        }
        addOutputLine(args.join(' '), 'echo-output');
    }

    // Matrix effect - full screen version
    function matrixEffect() {
        // Clear console and set matrix theme
        consoleOutput.innerHTML = '';
        consoleContent.style.backgroundColor = '#000011';

        // Create canvas for matrix effect
        const canvas = document.createElement('canvas');
        canvas.id = 'matrixCanvas';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '1';
        consoleOutput.appendChild(canvas);

        // Set canvas dimensions
        canvas.width = consoleOutput.clientWidth;
        canvas.height = consoleOutput.clientHeight;

        const ctx = canvas.getContext('2d');

        // Matrix characters
        const chars = "日ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍｦｲｸｺｿﾁﾄﾉﾌﾔﾖﾙﾚﾛﾝ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        // Columns and drops
        const fontSize = 14;
        const columns = Math.floor(canvas.width / fontSize);
        const drops = [];
        for (let i = 0; i < columns; i++) {
            drops[i] = Math.floor(Math.random() * -100);
        }

        // Draw function
        function draw() {
            // Black background with opacity for trail effect
            ctx.fillStyle = 'rgba(0, 0, 20, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Set font and color
            ctx.fillStyle = '#0f0';
            ctx.font = fontSize + 'px monospace';

            // Draw characters
            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                const x = i * fontSize;
                const y = drops[i] * fontSize;

                ctx.fillText(text, x, y);

                // Reset drop at bottom with random delay
                if (y > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }

                drops[i]++;
            }
        }

        // Start animation
        const interval = setInterval(draw, 33);

        // Add instructions to exit
        setTimeout(() => {
            const exitMsg = document.createElement('div');
            exitMsg.className = 'matrix-exit';
            exitMsg.style.position = 'absolute';
            exitMsg.style.bottom = '10px';
            exitMsg.style.left = '10px';
            exitMsg.style.zIndex = '2';
            exitMsg.style.color = '#0f0';
            exitMsg.innerHTML = 'Press any key to exit the Matrix...';
            consoleOutput.appendChild(exitMsg);
        }, 1000);

        // Exit handler
        function exitMatrix(e) {
            clearInterval(interval);
            consoleOutput.removeChild(canvas);
            const exitMsg = consoleOutput.querySelector('.matrix-exit');
            if (exitMsg) consoleOutput.removeChild(exitMsg);
            consoleContent.style.backgroundColor = '#000';
            addOutputLine('Exited the Matrix. Welcome back to reality.', 'matrix-line');
            document.removeEventListener('keydown', exitMatrix);
        }

        document.addEventListener('keydown', exitMatrix);
    }

    // Tank roulette
    async function tankRoulette() {
        try {
            const response = await fetch('https://cdn.jsdelivr.net/gh/HEATLabs/HEAT-Labs-Configs@main/tanks.json');
            if (!response.ok) throw new Error('Failed to load tank data');

            const data = await response.json();
            const randomIndex = Math.floor(Math.random() * data.length);
            const tank = data[randomIndex];

            addOutputLine('Spinning the tank roulette...', 'roulette-line');

            // Animation effect
            let spins = 0;
            const maxSpins = 10;
            const spinInterval = setInterval(() => {
                const tempIndex = Math.floor(Math.random() * data.length);
                const tempTank = data[tempIndex];
                addOutputLine(`> ${tempTank.name}`, 'roulette-spin', true);

                spins++;
                if (spins >= maxSpins) {
                    clearInterval(spinInterval);
                    addOutputLine('<br>Your random tank is:', 'roulette-result');
                    addOutputLine(`>> ${tank.name} (${tank.nation}, ${tank.type}) <<`, 'roulette-highlight');
                    addOutputLine(`Check stats: <span class="command-link" onclick="document.getElementById('consoleInput').value='stats ${tank.name}'; document.getElementById('consoleInput').dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}))">stats ${tank.name}</span>`, 'roulette-link');
                }
            }, 200);
        } catch (error) {
            addOutputLine(`Error: ${error.message}`, 'error');
        }
    }

    // Secret command
    function secretCommand() {
        addOutputLine('You found the secret command!', 'secret-line');
        addOutputLine('Here\'s a secret message from the devs:', 'secret-line');
        addOutputLine('', 'secret-line');
        addOutputLine('> The cake is a lie.', 'secret-message');
        addOutputLine('> But the stats are real.', 'secret-message');
        addOutputLine('', 'secret-line');
        addOutputLine('Thanks for exploring our console!', 'secret-line');

        // Easter egg - play music
        if (Math.random() > 0.7) {
            setTimeout(() => {
                playMusic();
            }, 2000);
        }
    }

    // Sudo command
    function sudoCommand(args) {
        if (!args || args.length === 0) {
            // Just "sudo" - joke response
            addOutputLine('Usage: sudo <command>', 'sudo-line');
            addOutputLine('Example: sudo hack', 'sudo-line');
            addOutputLine('', 'sudo-line');
            addOutputLine('$ sudo sudo', 'sudo-line');
            addOutputLine('I\'m sorry, user, I\'m afraid I can\'t do that.', 'sudo-error');
            return;
        }

        // Start sudo process
        sudoActive = true;
        sudoAttempts = 0;
        currentSudoCommand = args.join(' ');

        addOutputLine(`[sudo] password for user: `, 'sudo-line');
    }

    // Hack command - more realistic version
    function hackCommand() {
        // Clear console for hack effect
        consoleOutput.innerHTML = '';

        // Create hack lines
        const hackLines = [
            'Initializing hack sequence...',
            'Bypassing firewall...',
            'Accessing mainframe...',
            'Brute-forcing credentials...',
            'Injecting payload...',
            'Escalating privileges...',
            'Accessing root directory...',
            'Extracting sensitive data...',
            'Covering tracks...'
        ];

        let currentLine = 0;
        const hackInterval = setInterval(() => {
            if (currentLine < hackLines.length) {
                addOutputLine(hackLines[currentLine], 'hack-line');
                currentLine++;
            } else {
                clearInterval(hackInterval);

                // Final "hack complete" with fake data
                setTimeout(() => {
                    addOutputLine('Hack complete!', 'hack-success');
                    addOutputLine('', 'hack-line');
                    addOutputLine('Extracted data:', 'hack-line');
                    addOutputLine('- Admin credentials: root:password', 'hack-data');
                    addOutputLine('- Secret tank blueprints: 3 files', 'hack-data');
                    addOutputLine('- Upcoming tournament schedules', 'hack-data');
                    addOutputLine('', 'hack-line');
                    addOutputLine('Just kidding. This is a stats website.', 'hack-line');
                    addOutputLine('No actual hacking occurred.', 'hack-line');
                }, 1000);
            }
        }, 800);
    }

    // Change console theme
    function changeTheme(args) {
        if (!args || args.length === 0) {
            addOutputLine('Usage: theme <dark/light/matrix>', 'error');
            return;
        }

        const theme = args[0].toLowerCase();

        if (theme === 'dark') {
            consoleContent.style.backgroundColor = '#000';
            consoleContent.style.color = '#0f0';
            addOutputLine('Theme set to: Dark (default)', 'output-header');
        } else if (theme === 'light') {
            consoleContent.style.backgroundColor = '#fff';
            consoleContent.style.color = '#000';
            addOutputLine('Theme set to: Light', 'output-header');
        } else if (theme === 'matrix') {
            consoleContent.style.backgroundColor = '#000011';
            consoleContent.style.color = '#0f0';
            addOutputLine('Theme set to: Matrix', 'output-header');
        } else {
            addOutputLine('Invalid theme. Available: dark, light, matrix', 'error');
        }
    }

    // Tell a tank joke
    function tellJoke() {
        const jokes = [
            "Why did the tank break up with the artillery? It needed more space.",
            "What do you call a tank that's a musician? A heavy metal band!",
            "Why was the tank a bad student? It kept tanking its tests.",
            "How do tanks stay in touch? They use tank-you notes.",
            "Why don't tanks play hide and seek? Good luck hiding a 50-ton vehicle.",
            "What's a tank's favorite dance? The shell-shuffle!",
            "Why did the tank cross the road? To get to the other side... of the battlefield.",
            "What do you call a tank that tells jokes? A pun-isher!",
            "How does a tank answer the phone? 'Shell-o!'",
            "Why was the tank always calm? It had great armor control.",
            "What's the favorite drink of PCW? Jäger-meister"
        ];

        const joke = jokes[Math.floor(Math.random() * jokes.length)];
        addOutputLine(joke, 'joke-line');
    }

    // Play 8-bit music
    function playMusic() {
        addOutputLine('Playing epic 8-bit tank battle music...', 'music-line');
        addOutputLine('(Sound is imaginary in this console)', 'music-line');

        // Visualizer effect
        const visualizer = document.createElement('div');
        visualizer.className = 'music-visualizer';
        consoleOutput.appendChild(visualizer);

        let beats = 0;
        const beatInterval = setInterval(() => {
            const beat = document.createElement('div');
            beat.className = 'music-beat';
            beat.style.left = `${Math.random() * 100}%`;
            beat.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
            visualizer.appendChild(beat);

            beats++;
            if (beats >= 20) {
                clearInterval(beatInterval);
                setTimeout(() => {
                    consoleOutput.removeChild(visualizer);
                    addOutputLine('Music finished. Encore?', 'music-line');
                }, 1000);
            }
        }, 200);
    }

    // Cheat command (just for fun)
    function cheatCommand() {
        addOutputLine('Enabling cheats...', 'cheat-line');

        setTimeout(() => {
            addOutputLine('Searching for cheat codes...', 'cheat-line');
        }, 500);

        setTimeout(() => {
            addOutputLine('Cheat codes found:', 'cheat-line');
            addOutputLine('- IDDQD: God mode', 'cheat-data');
            addOutputLine('- IDKFA: All weapons', 'cheat-data');
            addOutputLine('- TANKUP: Instant win', 'cheat-data');
        }, 1000);

        setTimeout(() => {
            addOutputLine('Just kidding! No cheats here. Play fair!', 'cheat-line');
        }, 2000);
    }

    // Initialize the console
    initConsole();
});