(() => {
    const secretCodes = ['devsonly', 'topsecret'];
    let inputBuffer = '';

    window.addEventListener('keydown', (event) => {
        const key = event.key.toLowerCase();

        // Only consider a-z characters
        if (key.length === 1 && key.match(/[a-z]/)) {
            inputBuffer += key;

            // Keep buffer length within the longest code
            const maxLength = Math.max(...secretCodes.map(code => code.length));
            if (inputBuffer.length > maxLength) {
                inputBuffer = inputBuffer.slice(-maxLength);
            }

            // If buffer ends with any of the secret codes, redirect
            if (secretCodes.some(code => inputBuffer.endsWith(code))) {
                window.location.href = '/devsonly.html';
            }
        }
    });
})();