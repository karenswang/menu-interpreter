let currentPage = 1; // Current page number
const pageSize = 10; // Adjust the number of results per page


function searchMenus(page = 1) {
    const apigClient = apigClientFactory.newClient();
    currentPage = page;
    const searchInput = document.getElementById('searchInput').value;
    const searchType = document.querySelector('input[name="searchType"]:checked').value;
    const params = {
        keyword: searchInput,
        type: searchType,
        page: currentPage,
        limit: pageSize
    };
    console.log("params: ", params);

    apigClient.searchMenusGet(params, {}, {})
        .then(response => {
            console.log('Search results:', response);
            const results = response.data.results; // Extract results
            const totalPages = response.data.totalPages; 
            displaySearchResults(results, totalPages);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function changePage(delta) {
    searchMenus(currentPage + delta);
}

function displaySearchResults(data, totalResults) {
    const resultsContainer = document.getElementById('results');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    resultsContainer.innerHTML = ''; // Clear existing results

    data.forEach(result => {
        const resultItem = document.createElement('div');
        
        if (result.url) {
            const analyzeButton = document.createElement('button');
            analyzeButton.textContent = 'Analyze this menu';
            analyzeButton.className = 'analyze-button';
            analyzeButton.onclick = () => analyzeMenu(result.restaurant_name); // Assuming `menu_id` is part of the result
            resultItem.appendChild(analyzeButton);

            const imgElement = document.createElement('img');
            imgElement.alt = 'Menu Image';
            imgElement.className = 'result-image';
            // imgElement.src = 'data:image/jpeg;base64,' + result.url;
            // console.log('Fetching URL:', result.url);

            presignedUrl = result.url;
            fetch(presignedUrl)
            .then(response => {
                if (response.ok) {
                    return response.text(); // Use .json() if it's a JSON file
                }
                throw new Error('Network response was not ok.');
            })
            .then(data => {
                // console.log('Image data:', data);
                try {
                    // Parse the JSON string to get the base64 image data
                    const imageData = JSON.parse(data);
                    imgElement.src = imageData.base64Image;
                } catch (error) {
                    console.error('Error parsing image data:', error);
                    imgElement.alt = 'Error loading image';
                }        
            })
            .catch(error => {
                console.error('Fetch error:', error);
                imgElement.alt = 'Error loading image';
            });        
            resultItem.appendChild(imgElement);
        } else {
            const noImageText = document.createElement('p');
            noImageText.textContent = 'Image not available';
            resultItem.appendChild(noImageText);
        }

        const nameElement = document.createElement('p');
        nameElement.textContent = 'Restaurant: ' + result.restaurant_name;
        resultItem.appendChild(nameElement);

        const uploadedByElement = document.createElement('p');
        uploadedByElement.textContent = 'Uploaded By: ' + result.uploaded_by;
        resultItem.appendChild(uploadedByElement);

        resultsContainer.appendChild(resultItem);
    });

    const pageInfo = document.getElementById('pageInfo');
    const totalPages = Math.ceil(totalResults / pageSize);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    if (data.length > 0 && totalPages > 1) {
        // Show pagination buttons if there are results and more than one page
        prevButton.style.display = 'inline';
        nextButton.style.display = 'inline';
    } else {
        // Hide pagination buttons if no results or only one page of results
        prevButton.style.display = 'none';
        nextButton.style.display = 'none';
    }

    // Additional logic to enable/disable buttons based on the current page
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
}

function analyzeMenu(menuId) {
    displayMessage('Analysis initiated. Give me a second to read the menu and your profile...', true);
    const apigClient = apigClientFactory.newClient();
    const username = localStorage.getItem('username');
    if (!username) {
        alert('Username not found. Please log in.');
        return;
    }

    apigClient.analyzeMenuMenuIdPost({ 'menu_id': menuId }, {"username": username}, {})
        .then(response => {
            displayMessage(response.data, true); // Display the analysis result in a modal
        })
        .catch(error => {
            console.error('Error during menu analysis:', error);
            displayMessage('Error during menu analysis.', false);
        });
}

function displayMessage(message, isSuccess) {
    let modal = document.getElementById('myModal');
    let modalMessage = document.getElementById('modalMessage');

    modalMessage.innerHTML = ''; // Clear existing content
    modalMessage.className = isSuccess ? 'success' : 'error';

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
