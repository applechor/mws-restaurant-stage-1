if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker
		.register('/sw.js')
		.then (registration => {
			// registration successed
			console.log('Service Worker Registered', registration.scope);
		})
		.catch (err => {
			// registration failed
			console.log(`Service Worker Failed: ${err}`);
		});
	});
}