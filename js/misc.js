// Miscellaneous Scripts
// Social media redirect easter Egg
(() => {
    const secretCodes = {
        'youtube': 'https://www.youtube.com/@PCWStats',
        'yt': 'https://www.youtube.com/@PCWStats',
        'twitter': 'https://x.com/PCWStats',
        'twt': 'https://x.com/PCWStats',
        'github': 'https://github.com/PCWStats',
        'gh': 'https://github.com/PCWStats',
        'discord': 'https://discord.com/invite/2nHHHBWNDw',
        'dc': 'https://discord.com/invite/2nHHHBWNDw'
    };

    let inputBuffer = '';

    window.addEventListener('keydown', (event) => {
        const key = event.key.toLowerCase();

        // Only consider a-z characters
        if (key.length === 1 && key.match(/[a-z]/)) {
            inputBuffer += key;

            // Keep buffer length within the longest code
            const maxLength = Math.max(...Object.keys(secretCodes).map(code => code.length));
            if (inputBuffer.length > maxLength) {
                inputBuffer = inputBuffer.slice(-maxLength);
            }

            // Check if buffer ends with any of the secret codes
            for (const code in secretCodes) {
                if (inputBuffer.endsWith(code)) {
                    window.location.href = secretCodes[code];
                    return;
                }
            }
        }
    });
})();