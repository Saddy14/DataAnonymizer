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

        const selected = document.querySelector('input[name="yesorno"]:checked');
        const encryptFile = selected.value;
        console.log('EncryptFile: '+encryptFile);

        const pKey = document.getElementById('pKey').value;
        console.log('Public Key: ' + pKey);

        

        formData.append('file', file);
        formData.append('walletPK', walletAddress); // wallet public key
        formData.append('encryptFile', encryptFile); // encryption option
        formData.append('pKey', pKey); // public key for encryption

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            console.log('Upload successful:', result);
            alert('File uploaded successfully!');
        } catch (error) {
            console.error('Upload failed:', error);
        }
    });
});



