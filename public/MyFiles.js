

document.addEventListener("DOMContentLoaded", async () => {

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const walletAddress = accounts[0];

    fetch(`/api/pinataMyFiles/${walletAddress}`)
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById("project-grid");
            container.innerHTML = ""; // Clear any placeholder

            data.files.forEach(file => {
                const isEncrypted = file.keyvalues?.EncryptedFile === "1";
                const PublicView = file.keyvalues?.PublicView === "1";
                // const id = file.id;
                const fileName = file.name.split('--')[1]
                const card = document.createElement("div");
                card.className = "project-card";

                card.innerHTML = `
                            <h3>${fileName}</h3>
                            <p>${file.keyvalues?.Description || "N/A"}</p>
                            <p>Encrypted: ${isEncrypted ? "Yes" : "No"}</p>
                            <p>Publicly Visible: ${PublicView ? "Yes" : "No"}</p>
                            <p>Created at: ${new Date(file.created_at).toLocaleString()}</p>
                            <p >Owner: ${file.keyvalues?.WalletAddress}</p>
                        <div class="button-container">
                            <div class="button-row">
                                <button onclick="window.open('https://purple-wrong-ferret-861.mypinata.cloud/ipfs/${file.cid}', '_blank')" class="projectbtn">Share Data</button>
                                <button class="projectbtn2" onclick="makePublic('${file.id}', ${file.keyvalues?.PublicView})">Make Publicly Visible</button>
                            </div>
                            <div class="button-row">
                                <button class="projectbtn3" onclick="makePrivate('${file.id}', ${file.keyvalues?.PublicView})">Make Privately Visible</button>
                            </div>
                        </div>`;

                container.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Failed to load datasets:", error);
        });
})

function makePublic(id, PublicView) {

    // console.log("Test function called", cid, PublicView);
    console.log("id:", id);
    console.log("PublicView:", PublicView);

    if (PublicView === 1) {
        alert("This dataset is already publicly visible.");
        return;
    }

    if (PublicView === 0) {
        fetch(`/api/pinataFilePublic/${id}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Dataset is now publicly visible.");
                    window.location.reload(); // Reload the page to reflect changes
                } else {
                    alert("Failed to make dataset publicly visible.");
                }
            })
            .catch(error => {
                console.error("Error making dataset public:", error);
                alert("An error occurred while making the dataset public.");
            });
    }

}

function makePrivate(id, PublicView) {

    // console.log("Test function called", cid, PublicView);
    console.log("id:", id);
    console.log("PublicView:", PublicView);

    if (PublicView === 0) {
        alert("This dataset is already privately visible.");
        return;
    }

    if (PublicView === 1) {
        fetch(`/api/pinataFilePrivate/${id}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Dataset is now privately visible.");
                    window.location.reload(); // Reload the page to reflect changes
                } else {
                    alert("Failed to make dataset privately visible.");
                }
            })
            .catch(error => {
                console.error("Error making dataset private:", error);
                alert("An error occurred while making the dataset private.");
            });
    }

}