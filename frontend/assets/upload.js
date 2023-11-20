let base64Image = '';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('menuUploadForm');
    const fileInput = document.getElementById('menuFile');

    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        readImage(file);
    });

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        // const fileInput = document.getElementById('menuFile');
        // const file = fileInput.files[0];
        const restaurantName = document.getElementById('restaurantName').value;
        if (!base64Image || !restaurantName) {
            alert('Please fill all required fields.');
            return;
        }

        // Initialize API client
        const apigClient = apigClientFactory.newClient();
        const filename = fileInput.files[0].name;
        const payload = {
            base64Image: base64Image,
            filename: filename
        };

        // const formData = new FormData();
        // formData.append('file', file);

        // const headers = {
        //     'Content-Type': file.type
        // };

        // Retrieve the username from local storage or other means
        const username = localStorage.getItem('username');
        // const objectKey = username + '/' + file.name;

        // Initialize API client
        // const apigClient = apigClientFactory.newClient();

        // Make the API call
        apigClient.uploadObjectKeyPut({ 'objectKey': restaurantName }, payload, {})
            .then(response => {
                console.log('File uploaded successfully:', response);
                // displayMessage('File uploaded successfully', true);
                displayMessage('Analysis initiated. Give me a second to read the menu and your profile...', true);

                return callAnalyzeMenuEndpoint(restaurantName, apigClient);
            })
            .then(response => {
                console.log('Menu analysis initiated:', response);
                displayMessage(response.data, true);
            })
            .catch(error => {
                console.error('Error uploading file:', error);
                displayMessage(error.data || 'An error occured', false);
            });
    });
});

function readImage(file) {
    if (file.type && !file.type.startsWith('image/')) {
        console.log('File is not an image.', file.type, file);
        displayMessage('File is not an image.', false);
        return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
        base64Image = event.target.result; // Store the base64-encoded image
    });
    reader.readAsDataURL(file);
}

function callAnalyzeMenuEndpoint(menuId, apigClient) {
    const username = localStorage.getItem('username'); 
    const body = {
        username: username
    };

    return apigClient.analyzeMenuMenuIdPost({ 'menu_id': menuId }, body, {});
}


function displayMessage(message, isSuccess) {
    let messageDiv = document.getElementById('message');
    messageDiv.innerHTML = message;
    messageDiv.className = isSuccess ? 'success' : 'error';
}