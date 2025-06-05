
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
        
        }
};
