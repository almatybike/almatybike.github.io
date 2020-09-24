if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(function(registration) {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
            console.log('ServiceWorker registration failed: ', err);
        });
}

window.addEventListener("load", () => {

    const offline = document.getElementById('offline');

    function handleNetworkChange(event) {
        if (navigator.onLine) {
            offline.classList.add('hidden');
        } else {
            offline.classList.remove('hidden');
        }
    }

    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
});