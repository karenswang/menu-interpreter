document.getElementById('menuIcon').addEventListener('click', function() {
    var navbar = document.querySelector('.navbar');
    var navbarButtons = document.getElementById('navbarButtons');
    
    navbarButtons.style.display = (navbarButtons.style.display === 'none' || navbarButtons.style.display === '') ? 'flex' : 'none';
    navbar.classList.toggle('active', navbarButtons.style.display === 'flex');
});

function redirectToMenu() {
    window.location.href = "menu.html";
}

function redirectToMenuSearch(){
    /*window.location.href = */
}

function redirectToScanMenu(){
    window.location.href = "upload.html"
}

function redirectToMyProfile(){
    window.location.href = "preference.html"
}

// function redirectToSignup() {
//     window.location.href = 'signup.html';
// }