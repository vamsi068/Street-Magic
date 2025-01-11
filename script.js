function showForm(formType) {
    // Tabs
    const loginTab = document.getElementById('login-tab');
    const signupTab = document.getElementById('signup-tab');

    // Forms
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    // Footer text
    const footerText = document.getElementById('footer-text');

    if (formType === 'login') {
        // Activate Login
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
        footerText.innerHTML = 'Not a member? <a href="#" onclick="showForm(\'signup\')">Signup now</a>';
    } else {
        // Activate Signup
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        signupForm.classList.add('active');
        loginForm.classList.remove('active');
        footerText.innerHTML = 'Already a member? <a href="#" onclick="showForm(\'login\')">Login now</a>';
    }
}