document.getElementById('connect').addEventListener('click', async function (e) {
    e.preventDefault();

    if (typeof window.ethereum !== 'undefined') {
        try {
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

            console.log('Connected account:', accounts[0]);
            alert('Connected with MetaMask: ' + accounts[0] + ' \nShortly you will be redirected to home page');


            window.location.replace('/home')


            // Optional: display on page
            document.body.insertAdjacentHTML('beforeend', `<p>Wallet: ${accounts[0]}</p>`);

        } catch (error) {
            console.error('User denied connection', error);
            alert('Connection denied');
        }
    } else {
        alert('MetaMask not detected. Please install MetaMask.');
    }
});
