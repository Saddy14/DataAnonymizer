
window.onload = () => {
    // your code here
    const uploadResult = JSON.parse(localStorage.getItem('uploadResult'));
        if (uploadResult) {
            console.log('Message:', uploadResult.message);
            console.log('Status:', uploadResult.status);
            // console.log(uploadResult);
            localStorage.removeItem('uploadResult'); // cleanup

            fetch('/api/processing', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(uploadResult)
            })
            .then(response => response.json())
            .then(data => console.log(data))
            .then(() => {showAlert()})
        
        }

        // loadFiles();
        callAddFile();

    
};

function showAlert() {

    alert("File Processing Successful! \n\n" +
          "You can now view your file in the 'My Files' section. \n\n" +
          "Thank you for using our service!");
}

// const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
// const signer = provider.getSigner(); 
// const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

// async function loadFiles() {
//     const files = await contract.getAllFiles();
//     console.log(files);
// }

async function callAddFile() {
    // Connect to Ethereum wallet (MetaMask + Ganache)
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    // Initialize contract
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    // Prepare your values
    const name = "MyFile.txt";
    const cid = "Qm123abc..."; // IPFS CID
    const description = "Encrypted project file";
    const encryptedFile = 1; // or any uint8 value you assign
    const publicView = 0; // 0 = private, 1 = public

    // Send transaction to smart contract
    const tx = await contract.addFile(name, cid, description, encryptedFile, publicView);

    console.log("Transaction sent:", tx.hash);

    await tx.wait(); // Wait for confirmation
    console.log("File added successfully!");
}

