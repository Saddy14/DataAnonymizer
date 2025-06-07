// const { response } = require("express");

window.onload = () => {
    // your code here
    const uploadResult = JSON.parse(localStorage.getItem('uploadResult'));
    if (uploadResult) {
        console.log('Message:', uploadResult.message);
        console.log('Status:', uploadResult.status);
        // console.log(uploadResult);
        localStorage.removeItem('uploadResult'); // cleanup

        let uploadedId = null;

        fetch('/api/processing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(uploadResult)
        })
            .then(response => response.json())
            .then(data => {
                uploadedId = data.id;
                const kv = data.keyvalues;
                return callAddFile(
                    data.name,
                    data.cid,
                    kv?.Description,
                    parseInt(kv?.EncryptedFile),
                    parseInt(kv?.PublicView)
                );
            })
            .then((result) => {
                if (result === -1) {
                    console.log("Transaction was cancelled");
                    console.log(uploadedId);
                    // Optional: show custom UI or return silently
                    fetch(`/api/pinataFileDel/${uploadedId}`)
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                    })
                } else {
                    showAlert(); // Only show alert if successful
                }
            });
            // .then(() => { showAlert() })

    }

    // loadFiles();
    // callAddFile();


};

function showAlert() {

    alert("File Processing Successful! \n\n" +
        "You can now view your file in the 'My Files' section. \n\n" +
        "Thank you for using our service!");

    window.location.replace('/MyDatasets'); // Redirect to home page
}

// const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
// const signer = provider.getSigner(); 
// const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

// async function loadFiles() {
//     const files = await contract.getAllFiles();
//     console.log(files);
// }

// async function callAddFile(name, cid, description, encryptedFile, publicView) {
//     // MetaMask
//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     await provider.send("eth_requestAccounts", []);
//     const signer = provider.getSigner();

//     // Initialize contract
//     const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

//     // Send transaction to smart contract
//     const tx = await contract.addFile(name, cid, description, encryptedFile, publicView);

//     console.log("Transaction Hash:", tx.hash);
//     console.log('File name:', name);

//     await tx.wait(); // Wait for confirmation
//     console.log("File added successfully!");
// }

async function callAddFile(name, cid, description, encryptedFile, publicView) {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

        const tx = await contract.addFile(name, cid, description, encryptedFile, publicView);

        console.log("Transaction Hash:", tx.hash);
        console.log('File name:', name);

        await tx.wait();
        console.log("File added successfully!");

    } catch (err) {
        console.error("Transaction failed:", err);

        // Handle MetaMask rejection
        if (
            err.code === 4001 ||
            err.message?.includes("User denied transaction") ||
            err.message?.includes("user rejected transaction")
        ) {
            alert("Transaction was rejected by the user.");
            return -1;
            window.location.replace('/home'); // <- prevents falling into the generic alert
        }

        // alert("An error occurred while sending the transaction.");
    }


}


