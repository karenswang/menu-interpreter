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
    resultsContainer.innerHTML = ''; // Clear existing results

    data.forEach(result => {
        const resultItem = document.createElement('div');
        
        if (result.url) {
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
}
