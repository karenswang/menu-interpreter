document.addEventListener("DOMContentLoaded", function () {
    const apiClient = apigClientFactory.newClient();

    const signUpButton = document.getElementById('signUp');
    const loginButton = document.getElementById('login');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    // const messageDiv = document.getElementById('message');

    signUpButton.addEventListener('click', function (e) {
        e.preventDefault();
        const userDetails = {
            username: usernameInput.value,
            password: passwordInput.value
        };

        apiClient.userPost({}, userDetails, {}).then(response => {
            displayMessage(response.data, true);
        }).catch(error => {
            displayMessage(error.data || 'Error during sign up', false);
            console.log(error)
        });
    });

    loginButton.addEventListener('click', function (e) {
        e.preventDefault();
        const loginDetails = {
            username: usernameInput.value,
            password: passwordInput.value
        };

        apiClient.userLoginPost({}, loginDetails, {}).then(response => {
            displayMessage(response.data, true);
            localStorage.setItem('username', usernameInput.value); // Store username in local storage
            window.location.href = 'preference.html'; // Redirect to preference page
        }).catch(error => {
            displayMessage(error.data || 'Error during login', false);
            console.log(error)
        });
    });
});

function displayMessage(message, isSuccess) {
    let messageDiv = document.getElementById('message');
    messageDiv.innerHTML = message;
    messageDiv.className = isSuccess ? 'success' : 'error';
}