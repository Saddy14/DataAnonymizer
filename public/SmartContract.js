
window.addEventListener("load", () => {
    // pew().catch(console.error);
    fetchFileEventsWithBlockData().catch(console.error);
});



async function pew() {

    // Initialize provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    // Initialize contract
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    // Call getAllFiles
    const files = await contract.getAllFiles();

    // Display the results
    const fileList = document.getElementById("file-list");
    fileList.innerHTML = ""; // Clear previous list

    files.forEach((file, index) => {
        const listItem = document.createElement("li");
        listItem.classList.add("file-item"); // style this
        listItem.innerHTML = `
    
    <span class="label">Name:</span> ${file.name}<br>
    <span class="label">CID:</span> <span class="hash">${file.cid}</span><br>
    <span class="label">Description:</span> ${file.description}<br>
    <span class="label">Encrypted:</span> ${file.EncryptedFile}<br>
    <span class="label">Public:</span> ${file.PublicView}<br>
    <span class="label">Owner:</span> <span class="address">${file.owner}</span><br>
    <span class="label">Timestamp:</span> ${new Date(file.timestamp * 1000).toLocaleString()}
`;

        fileList.appendChild(listItem);
    });

    const filter = contract.filters.FileAdded();
    const events = await contract.queryFilter(filter, 0, "latest");

    for (const event of events) {
        const txHash = event.transactionHash;
        const block = await provider.getBlock(event.blockNumber);

        console.log("File:", event.args.name);
        console.log("Tx Hash:", txHash);
        console.log("Block Number:", event.blockNumber);
        console.log("Block Hash:", block.hash); // 🎯
        console.log("Timestamp:", new Date(block.timestamp * 1000).toLocaleString());
    }


}

async function fetchFileEventsWithBlockData() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    const filter = contract.filters.FileAdded();
    const events = await contract.queryFilter(filter, 0, "latest");

    const fileList = document.getElementById("file-list");
    fileList.innerHTML = "";

    for (const event of events) {
        const txHash = event.transactionHash;
        const block = await provider.getBlock(event.blockNumber);

        const li = document.createElement("li");
        li.classList.add("file-item");
        li.innerHTML = `
            <span class="label">File:</span> ${event.args.name}<br>
            <span class="label">Tx Hash:</span> <a href="https://sepolia.etherscan.io/tx/${txHash}" target="_blank" class="hash">${txHash}</a><br>
            <span class="label">Block Number:</span> ${event.blockNumber}<br>
            <span class="label">Block Hash:</span> <span class="hash">${block.hash}</span><br>
            <span class="label">Timestamp:</span> ${new Date(block.timestamp * 1000).toLocaleString()}
        `;
        fileList.appendChild(li);
    }
}
