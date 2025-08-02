

document.addEventListener("DOMContentLoaded", async () => {

    // const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    // const walletAddress = accounts[0];

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const walletAddress = ethers.utils.getAddress(accounts[0]); // checksummed format

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
                                <button onclick="showTimedAlert('${file.cid}')" class="projectbtn">Share Dataset</button>
                                <button class="projectbtn2" onclick="makePublic('${file.id}', ${file.keyvalues?.PublicView})">Make Visibility Public</button>
                            </div>
                            <div class="button-row">
                                <button class="projectbtn3" onclick="makePrivate('${file.id}', ${file.keyvalues?.PublicView})">Make Visibility Private</button>
                            </div>
                            <div class="button-row1">
                                <button class="projectbtn4" onclick="deleteFile('${file.id}')">Delete Dataset</button>
                                
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

function deleteFile(id) {

    console.log("Delete function called with id:", id);

    if (confirm("Are you sure you want to delete this dataset? This action cannot be undone.")) {
        fetch(`/api/pinataFileDel/${id}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Dataset deleted successfully.");
                    window.location.reload(); // Reload the page to reflect changes
                } else {
                    alert("Failed to delete dataset.");
                }
            })
            .catch(error => {
                console.error("Error deleting dataset:", error);
                alert("An error occurred while deleting the dataset.");
            });
    }
}

async function copyText(cid) {
    try {
        // Use the Clipboard API to copy the passed text to the clipboard
        await navigator.clipboard.writeText(`https://purple-wrong-ferret-861.mypinata.cloud/ipfs/${cid}`);

    } catch (err) {
        console.error("Failed to copy text: ", err);
    }
}

function showTimedAlert(cid) {

    copyText(cid); // Call copyText function with the id

    const alertBox = document.getElementById("timedAlert");

    // Show the alert box
    alertBox.style.display = "block";

    // Hide the alert box after 1 second (1000ms)
    setTimeout(() => {
        alertBox.style.display = "none";
        window.open(`https://purple-wrong-ferret-861.mypinata.cloud/ipfs/${cid}`, '_blank');
    }, 1000); // 1 seconds

}