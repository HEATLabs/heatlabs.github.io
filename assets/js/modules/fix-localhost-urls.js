function fixLocalLinks() {
    const isLocalhost = window.location.hostname === 'localhost'

    if (isLocalhost) {
        console.log('Local host detected');

        document.querySelectorAll('a[href]').forEach(link => {
            const href = link.getAttribute('href');

            // Only process internal links that don't have extensions and aren't anchors
            if (href &&
                href !== '/' &&
                href !== '#' &&
                !href.endsWith('/') &&
                !href.endsWith('.html') &&
                !href.endsWith('.net') &&
                !href.endsWith('.png') &&
                !href.endsWith('.webp') &&
                !href.includes('.com')) {

                link.setAttribute('href', href + '.html');
                console.log('Fixed link:', href, '→', href + '.html');
            }
        });
    }
}

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixLocalLinks);
} else {
    fixLocalLinks();
}