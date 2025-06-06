window.history.pushState(null, "", window.location.href);
window.onpopstate = function () {
    window.history.pushState(null, "", window.location.href);
};

window.addEventListener('DOMContentLoaded', async () => {
    if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            console.log('Already connected:', accounts[0]);
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    fetch('/api/pinataFiles')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById("project-grid");
            container.innerHTML = ""; // Clear any placeholder

            data.files.forEach(file => {
                const isEncrypted = file.keyvalues?.EncryptedFile === "1";
                const fileName = file.name.split('--')[1]
                const card = document.createElement("div");
                card.className = "project-card";

                card.innerHTML = `
                    <h3>${fileName}</h3>
                    <p>${file.keyvalues?.Description || "N/A"}</p>
                    <p>Encrypted: ${isEncrypted ? "Yes" : "No"}</p>
                    <p>Created at: ${new Date(file.created_at).toLocaleString()}</p>
                    <p >Owner: ${file.keyvalues?.WalletAddress}</p>
                    <div class="button-container">
                        <button onclick="window.open('https://purple-wrong-ferret-861.mypinata.cloud/ipfs/${file.cid}', '_blank')" class="projectbtn">Download Data</button>
                        
                    </div>
                `;

                container.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Failed to load datasets:", error);
        });
})