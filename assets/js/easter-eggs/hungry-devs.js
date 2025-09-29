function isLocalHost() {
    const isLocalhost = window.location.hostname === 'localhost' ||
        window.location.hostname.includes('localhost');

    if (isLocalhost) {
        console.log('You passed the test.....enjoy');

    } else {
        window.location.href = '../index';
    }
}

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', isLocalHost);
} else {
    isLocalHost();
}