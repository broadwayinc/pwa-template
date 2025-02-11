if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
        }).catch(error => {
            console.error('Service Worker registration failed:', error);
        });
    });
}

document.getElementById('subscribeButton').addEventListener('click', async () => {
    const registration = await navigator.serviceWorker.ready;

    // Check if the user has granted permission for notifications
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        console.error('Permission not granted for notifications');
        return;
    }

    let vapid = document.getElementById('public_vapid_key').value;
    if (!vapid) {
        alert('VAPID public key is required for push notifications');
        return;
    }
    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid)
    });

    console.log('Push subscription:', subscription);
    let subsEndpoint = document.getElementById('subscription_endpoint').value;

    if (!subsEndpoint) {
        alert('Subscription endpoint is required for push notifications');
        return;
    }

    let service_id = document.getElementById('serviceId').value;
    let owners_id = document.getElementById('ownersId').value;

    // Send the subscription object to your server
    let resp = await fetch(subsEndpoint, {
        method: 'POST',
        body: Object.assign({ service: service_id, owner: owners_id }, JSON.stringify(subscription)),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    console.log('-- server response --');
    console.log(await resp.json());
});

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}