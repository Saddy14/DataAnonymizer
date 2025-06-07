window.addEventListener('DOMContentLoaded', async () => {
    if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            console.log('Already connected:', accounts[0]);
        }

    }
});

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('uploadForm');
    const fileInput = document.getElementById('datafile');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const file = fileInput.files[0];

        if (!file) {
            alert("Please choose a file.");
            return;
        }

        // Check file type
        const isCSV = file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv';

        if (!isCSV) {
            alert("Only CSV files are allowed.");
            return;
        }

        if (typeof window.ethereum === 'undefined') {
            alert('MetaMask is not installed.');
            return;
        }

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const walletAddress = accounts[0];

        const formData = new FormData();

        const selected = document.querySelector('input[name="yesorno"]:checked'); // Get the selected radio button for encryption 1 or 0
        const encryptFile = selected.value;
        console.log('EncryptFile: ' + encryptFile);

        const pKey = document.getElementById('pKey').value;
        console.log('Public Key: ' + pKey);
        if (encryptFile === '1' && !isRSA2048(pKey)) {
            alert("Invalid Public Key \nMust be RSA-2048.");
            // res.status(400).json({ error: "Provided public key must be RSA-2048." });
            return;
        }

        const desc = document.getElementById('desc').value;
        console.log('Description: ' + desc);



        formData.append('file', file); //file
        formData.append('walletPK', walletAddress); // wallet address
        formData.append('encryptFile', encryptFile); // encryption option
        formData.append('pKey', pKey); // public key for encryption
        formData.append('desc', desc); // description

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json()
            console.log('Upload Result:', result);
            alert('File uploaded successfully!');
            localStorage.setItem('uploadResult', JSON.stringify(result));
            window.location.replace('/processing'); // Redirect to processing page

        } catch (error) {
            console.error('Upload failed:', error);
        }
    });
});

// const forge = require('node-forge')

function isRSA2048(publicKeyPem) {
    try {
        const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
        const bitLength = publicKey.n.bitLength();  // n is the modulus
        return bitLength === 2048;
    } catch (err) {
        console.error('Invalid public key:', err);
        return false;
    }
}

