let provider;
let currentBlock;

window.onload = async function () {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    currentBlock = await provider.getBlockNumber();
    loadBlock(currentBlock);
};

async function loadBlock(blockNumber) {
    const block = await provider.getBlockWithTransactions(blockNumber);

    document.getElementById("block-number").textContent = `Block: ${block.number}`;
    document.getElementById("parent-hash").textContent = block.parentHash;

    document.getElementById("block-hash").textContent = block.hash;
    document.getElementById("timestamp").textContent = new Date(block.timestamp * 1000).toLocaleString();

    const txList = document.getElementById("tx-list");
    txList.innerHTML = "";

    if (block.transactions.length === 0) {
        txList.innerHTML = "<li>No transactions in this block</li>";
    } else {
        block.transactions.forEach(tx => {
            const li = document.createElement("li");
            li.innerHTML = `
              <span class="label">From:</span> <span class="address">${tx.from}</span><br>
              <span class="label">To:</span> <span class="address">${tx.to || "Contract Creation"}</span><br>
              <span class="label">Transaction Hash:</span> <span class="hash">${tx.hash}</span>
            `;
            txList.appendChild(li);
        });
    }
}

async function prevBlock() {
    if (currentBlock > 0) {
        currentBlock--;
        loadBlock(currentBlock);
    }
}

async function nextBlock() {
    const latest = await provider.getBlockNumber();
    if (currentBlock < latest) {
        currentBlock++;
        loadBlock(currentBlock);
    }
}