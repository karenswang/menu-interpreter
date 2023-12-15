document.addEventListener("DOMContentLoaded", function() {
    const username = localStorage.getItem('username');
    loadPreferences(username);
    const form = document.getElementById('preferenceForm')
    
    form.addEventListener('submit', function(event) {
    event.preventDefault();

    // Collect checked checkboxes
    const checkboxes = Array.from(document.querySelectorAll('.restrictions-form input[type=checkbox]:checked'));
    const dietaryRestrictionsChecked = checkboxes.map(checkbox => checkbox.nextSibling.textContent.trim());

    // Get values from text inputs
    const foodPreferencesText = document.getElementById('foodPreferences').value.split(',').map(item => item.trim());
    const dietaryRestrictionsText = document.getElementById('dietaryRestrictions').value.split(',').map(item => item.trim());

    // Combine and remove empty entries
    const dietaryRestrictions = [...dietaryRestrictionsChecked, ...dietaryRestrictionsText].filter(Boolean);
    const preferences = [...foodPreferencesText].filter(Boolean);

    // Prepare JSON structure
    const payload = {
        "dietary restriction": dietaryRestrictions,
        "preference": preferences
    };

    // Retrieve username from local storage or other means
    const username = localStorage.getItem('username'); 

    // Call API endpoint
    const apigClient = apigClientFactory.newClient();
    apigClient.preferenceUsernamePut({ username }, payload, {})
        .then(response => {
            console.log('Preferences updated:', response);
            displayMessage(response.data, true);
            savePreferences(dietaryRestrictions, preferences);
        })
        .catch(error => {
            // console.error('Error updating preferences:', error);
            displayMessage(error.data, false);
        });
});
});

function displayMessage(message, isSuccess) {
    let messageDiv = document.getElementById('message');
    messageDiv.innerHTML = message;
    messageDiv.className = isSuccess ? 'success' : 'error';
}

function savePreferences(dietaryRestrictions, preferences) {
    const preferencesData = {
        dietaryRestrictions: dietaryRestrictions,
        preferences: preferences
    };
    localStorage.setItem('userPreferences', JSON.stringify(preferencesData));
}

function loadPreferences(username) {
    const apigClient = apigClientFactory.newClient();
    apigClient.preferenceUsernameGet({ username })
        .then(response => {
            const preferencesData = JSON.parse(response.data.preferences);
            updateFormWithPreferences(preferencesData);
        })
        .catch(error => {
            console.error('Error fetching preferences:', error);
            // Handle error appropriately
        });
}

function updateFormWithPreferences(preferencesData) {
    const dietaryRestrictions = preferencesData['dietary restriction'];
    const preferences = preferencesData['preference'];

    const checkboxes = document.querySelectorAll('.restrictions-form input[type=checkbox]');

    // Collect the labels of all checkboxes for comparison
    const checkboxLabels = Array.from(checkboxes).map(checkbox => checkbox.nextSibling.textContent.trim());

    // Update checkboxes
    checkboxes.forEach(checkbox => {
        if (dietaryRestrictions.includes(checkbox.nextSibling.textContent.trim())) {
            checkbox.checked = true;
        } else {
            checkbox.checked = false;
        }
    });

    // Filter out the dietary restrictions that are already covered by checkboxes
    const dietaryRestrictionsForTextField = dietaryRestrictions.filter(item => !checkboxLabels.includes(item));

    // Update text inputs
    document.getElementById('dietaryRestrictions').value = dietaryRestrictionsForTextField.join(', ');
    document.getElementById('foodPreferences').value = preferences.join(', ');
}
