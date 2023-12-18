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
        const restaurantName = document.getElementById('restaurantName').value;
        if (!base64Image || !restaurantName) {
            alert('Please fill all required fields.');
            return;
        }

        const username = localStorage.getItem('username');
        console.log('Username:', username)
        if (!username) {
            alert('Username not found. Please log in.');
            return;
        }

        // Check if the menu already exists
        checkExistingMenu(restaurantName, username, () => {
            // If confirmed or no existing menu, proceed with upload
            uploadMenu(restaurantName, fileInput.files[0], username);
        });
    });
});

function checkExistingMenu(restaurantName, username, callback) {
    const apigClient = apigClientFactory.newClient();
    const params = {
        keyword: restaurantName,
        type: 'restaurant',
        username: username
    };
    console.log('Checking existing menu:', params);

    apigClient.searchMenusGet(params, {}, {})
        .then(response => {
            console.log('Existing menu check:', response);
            const results = response.data.results;
            if (results.length > 0) {
                // Menu already exists, ask for confirmation to overwrite
                if (confirm("You have already uploaded a menu for this restaurant. Do you want to overwrite it?")) {
                    callback(); // Proceed with upload
                }
                // If user does not confirm, do not proceed
            } else {
                callback(); // No existing menu, proceed with upload
            }
        })
        .catch(error => {
            console.error('Error checking existing menu:', error);
        });
}

function uploadMenu(restaurantName, file, username) {
    const apigClient = apigClientFactory.newClient();
    const filename = file.name;
    const payload = {
        base64Image: base64Image,
        filename: filename
    };

    apigClient.uploadObjectKeyPut({ 'objectKey': restaurantName, 'x-amz-meta-username': username }, payload, {})
        .then(response => {
            console.log('File uploaded successfully:', response);
            displayMessage('Analysis initiated. Give me a second to read the menu and your profile...', true);
            setTimeout(() => {
                callAnalyzeMenuEndpoint(restaurantName, apigClient);
            }, 5000);
        })
        .catch(error => {
            console.error('Error uploading file:', error);
            displayMessage('An error occurred during file upload.', false);
        });
}

function callAnalyzeMenuEndpoint(menuId, apigClient) {
    const username = localStorage.getItem('username');
    const body = { username: username };
    return apigClient.analyzeMenuMenuIdPost({ 'menu_id': menuId }, body, {})
        .then(response => {
            console.log('Menu analysis initiated:', response);
            displayMessage(response.data, true);
        })
        .catch(error => {
            console.error('Error during menu analysis:', error);
            displayMessage('Error during menu analysis.', false);
        });
}

// Other functions (readImage, displayMessage) remain unchanged


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




function displayMessage(message, isSuccess) {
    let modal = document.getElementById('myModal');
    let modalMessage = document.getElementById('modalMessage');
    
    modalMessage.innerHTML = ''; // Clear existing content
    // modalMessage.className = isSuccess ? 'success' : 'error';

   // Split the message by newlines and create paragraphs
   const paragraphs = message.split('\n');
   paragraphs.forEach(paragraph => {
       if (paragraph.trim() !== '') {
           const p = document.createElement('p');
           p.textContent = paragraph;
           modalMessage.appendChild(p);
       }
   });

   modal.style.display = "block"; // Show the modal
    }

    // Close Modal Function
    let span = document.getElementsByClassName("close")[0];
    span.onclick = function() {
    let modal = document.getElementById('myModal');
    modal.style.display = "none";
    }

    // Close Modal When Clicking Outside of It
    window.onclick = function(event) {
    let modal = document.getElementById('myModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
    }