document.addEventListener("DOMContentLoaded", function() {
    loadPreferences();
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

function loadPreferences() {
    const savedPreferences = JSON.parse(localStorage.getItem('userPreferences'));
    if (savedPreferences) {
        const checkboxes = document.querySelectorAll('.restrictions-form input[type=checkbox]');
        
        // Update checkboxes and collect their labels
        let checkedLabels = [];
        checkboxes.forEach(checkbox => {
            const label = checkbox.nextSibling.textContent.trim();
            if (savedPreferences.dietaryRestrictions.includes(label)) {
                checkbox.checked = true;
                checkedLabels.push(label);
            } else {
                checkbox.checked = false;
            }
        });

        // Update text inputs: filter out items that are already checked
        const dietaryRestrictionsText = savedPreferences.dietaryRestrictions
            .filter(item => !checkedLabels.includes(item))
            .join(', ');
        document.getElementById('dietaryRestrictions').value = dietaryRestrictionsText;

        // Update food preferences text input
        document.getElementById('foodPreferences').value = savedPreferences.preferences.join(', ');
    }
}
