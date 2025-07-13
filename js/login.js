// Login and Signup functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    // Initialize login form
    if (loginForm) {
        initializeLoginForm();
    }
    
    // Initialize signup form
    if (signupForm) {
        initializeSignupForm();
    }
});

function initializeLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = loginForm.querySelector('.login-btn');
    const btnText = loginBtn.querySelector('.btn-text');
    const loadingSpinner = loginBtn.querySelector('.loading-spinner');

    // Form validation
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Clear previous errors
        clearErrors();
        
        // Validate form
        let isValid = true;
        
        if (!usernameInput.value.trim()) {
            showError('usernameError', 'Username is required');
            isValid = false;
        }
        
        if (!passwordInput.value) {
            showError('passwordError', 'Password is required');
            isValid = false;
        } else if (passwordInput.value.length < 6) {
            showError('passwordError', 'Password must be at least 6 characters');
            isValid = false;
        }
        
        if (isValid) {
            performLogin();
        }
    });

    // Real-time validation
    usernameInput.addEventListener('blur', function() {
        if (!this.value.trim()) {
            showError('usernameError', 'Username is required');
        } else {
            clearError('usernameError');
        }
    });

    passwordInput.addEventListener('blur', function() {
        if (!this.value) {
            showError('passwordError', 'Password is required');
        } else if (this.value.length < 6) {
            showError('passwordError', 'Password must be at least 6 characters');
        } else {
            clearError('passwordError');
        }
    });

    function performLogin() {
        // Show loading state
        btnText.style.display = 'none';
        loadingSpinner.style.display = 'inline-block';
        loginBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            const username = usernameInput.value.trim();
            const password = passwordInput.value;

            // Check if user exists in registered users or use demo credentials
            const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const user = registeredUsers.find(u => u.username === username && u.password === password);
            
            if (user || (username && password.length >= 6)) {
                // Store user session
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('username', user ? user.firstName + ' ' + user.lastName : username);
                localStorage.setItem('userRole', user ? user.position : 'Admin');
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                // Reset button state
                btnText.style.display = 'inline';
                loadingSpinner.style.display = 'none';
                loginBtn.disabled = false;
                
                showError('passwordError', 'Invalid credentials');
            }
        }, 1500);
    }
}

function initializeSignupForm() {
    const signupForm = document.getElementById('signupForm');
    
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Clear previous errors
        clearAllSignupErrors();
        
        // Validate form
        if (validateSignupForm()) {
            performSignup();
        }
    });
    
    // Real-time validation for signup fields
    const inputs = signupForm.querySelectorAll('input[required], select[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateSignupField(this);
        });
    });
    
    // Password confirmation validation
    document.getElementById('confirmPassword').addEventListener('input', function() {
        validatePasswordMatch();
    });
    
    // Username availability check
    document.getElementById('signupUsername').addEventListener('blur', function() {
        checkUsernameAvailability(this.value);
    });
}

function validateSignupForm() {
    let isValid = true;
    
    // First name validation
    const firstName = document.getElementById('firstName').value.trim();
    if (!firstName) {
        showError('firstNameError', 'First name is required');
        isValid = false;
    }
    
    // Last name validation
    const lastName = document.getElementById('lastName').value.trim();
    if (!lastName) {
        showError('lastNameError', 'Last name is required');
        isValid = false;
    }
    
    // Email validation
    const email = document.getElementById('email').value.trim();
    if (!email) {
        showError('emailError', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('emailError', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Username validation
    const username = document.getElementById('signupUsername').value.trim();
    if (!username) {
        showError('signupUsernameError', 'Username is required');
        isValid = false;
    } else if (username.length < 3) {
        showError('signupUsernameError', 'Username must be at least 3 characters');
        isValid = false;
    }
    
    // Password validation
    const password = document.getElementById('signupPassword').value;
    if (!password) {
        showError('signupPasswordError', 'Password is required');
        isValid = false;
    } else if (password.length < 6) {
        showError('signupPasswordError', 'Password must be at least 6 characters');
        isValid = false;
    }
    
    // Confirm password validation
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (password !== confirmPassword) {
        showError('confirmPasswordError', 'Passwords do not match');
        isValid = false;
    }
    
    // Position validation
    const position = document.getElementById('storePosition').value;
    if (!position) {
        showError('storePositionError', 'Please select your position');
        isValid = false;
    }
    
    // Terms validation
    const agreeTerms = document.getElementById('agreeTerms').checked;
    if (!agreeTerms) {
        showError('termsError', 'You must agree to the terms and conditions');
        isValid = false;
    }
    
    return isValid;
}

function validateSignupField(field) {
    const fieldName = field.name;
    const value = field.value.trim();
    
    switch(fieldName) {
        case 'firstName':
            if (!value) {
                showError('firstNameError', 'First name is required');
            } else {
                clearError('firstNameError');
            }
            break;
            
        case 'lastName':
            if (!value) {
                showError('lastNameError', 'Last name is required');
            } else {
                clearError('lastNameError');
            }
            break;
            
        case 'email':
            if (!value) {
                showError('emailError', 'Email is required');
            } else if (!isValidEmail(value)) {
                showError('emailError', 'Please enter a valid email address');
            } else {
                clearError('emailError');
            }
            break;
            
        case 'signupUsername':
            if (!value) {
                showError('signupUsernameError', 'Username is required');
            } else if (value.length < 3) {
                showError('signupUsernameError', 'Username must be at least 3 characters');
            } else {
                clearError('signupUsernameError');
                checkUsernameAvailability(value);
            }
            break;
            
        case 'signupPassword':
            if (!value) {
                showError('signupPasswordError', 'Password is required');
            } else if (value.length < 6) {
                showError('signupPasswordError', 'Password must be at least 6 characters');
            } else {
                clearError('signupPasswordError');
            }
            validatePasswordMatch();
            break;
            
        case 'storePosition':
            if (!value) {
                showError('storePositionError', 'Please select your position');
            } else {
                clearError('storePositionError');
            }
            break;
    }
}

function validatePasswordMatch() {
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (confirmPassword && password !== confirmPassword) {
        showError('confirmPasswordError', 'Passwords do not match');
    } else {
        clearError('confirmPasswordError');
    }
}

function checkUsernameAvailability(username) {
    if (username.length < 3) return;
    
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const userExists = registeredUsers.some(user => user.username.toLowerCase() === username.toLowerCase());
    
    if (userExists) {
        showError('signupUsernameError', 'Username is already taken');
    } else {
        clearError('signupUsernameError');
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function performSignup() {
    const signupBtn = document.querySelector('.signup-btn');
    const btnText = signupBtn.querySelector('.btn-text');
    const loadingSpinner = signupBtn.querySelector('.loading-spinner');
    
    // Show loading state
    btnText.style.display = 'none';
    loadingSpinner.style.display = 'inline-block';
    signupBtn.disabled = true;
    
    // Collect form data
    const userData = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        username: document.getElementById('signupUsername').value.trim(),
        password: document.getElementById('signupPassword').value,
        position: document.getElementById('storePosition').value,
        dateRegistered: new Date().toISOString()
    };
    
    // Simulate API call
    setTimeout(() => {
        // Save user to localStorage
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        registeredUsers.push(userData);
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        
        // Auto login the user
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('username', userData.firstName + ' ' + userData.lastName);
        localStorage.setItem('userRole', userData.position);
        
        // Show success and redirect
        showSuccessMessage('Account created successfully! Redirecting to dashboard...');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        
    }, 2000);
}

function showSuccessMessage(message) {
    const signupForm = document.getElementById('signupForm');
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    signupForm.insertBefore(successDiv, signupForm.firstChild);
}

// Form switching functions
function showSignupForm() {
    const loginCard = document.querySelector('.login-card');
    const signupCard = document.getElementById('signupCard');
    
    loginCard.style.display = 'none';
    signupCard.style.display = 'block';
}

function showLoginForm() {
    const loginCard = document.querySelector('.login-card');
    const signupCard = document.getElementById('signupCard');
    
    signupCard.style.display = 'none';
    loginCard.style.display = 'block';
}

// Toggle password visibility functions
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.toggle-password');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    }
}

function toggleSignupPassword() {
    const passwordInput = document.getElementById('signupPassword');
    const toggleIcon = passwordInput.parentElement.querySelector('.toggle-password');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    }
}

function toggleConfirmPassword() {
    const passwordInput = document.getElementById('confirmPassword');
    const toggleIcon = passwordInput.parentElement.querySelector('.toggle-password');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    }
}

function showTerms() {
    alert('Terms and Conditions:\n\n1. Users must provide accurate information\n2. Passwords must be kept secure\n3. The system is for authorized personnel only\n4. Data must be handled responsibly\n\nBy using this system, you agree to these terms.');
}

// Utility functions
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    const inputElement = errorElement.previousElementSibling;
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Add error styling
    if (inputElement.tagName === 'INPUT' || inputElement.tagName === 'SELECT') {
        inputElement.style.borderColor = 'var(--danger-color)';
    } else if (inputElement.classList.contains('input-group')) {
        const input = inputElement.querySelector('input, select');
        if (input) input.style.borderColor = 'var(--danger-color)';
    }
}

function clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    const inputElement = errorElement.previousElementSibling;
    
    errorElement.style.display = 'none';
    
    // Remove error styling
    if (inputElement.tagName === 'INPUT' || inputElement.tagName === 'SELECT') {
        inputElement.style.borderColor = 'var(--medium-gray)';
    } else if (inputElement.classList.contains('input-group')) {
        const input = inputElement.querySelector('input, select');
        if (input) input.style.borderColor = 'var(--medium-gray)';
    }
}

function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.style.display = 'none';
    });
    
    // Reset input styling
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.style.borderColor = 'var(--medium-gray)';
    });
}

function clearAllSignupErrors() {
    const signupErrors = ['firstNameError', 'lastNameError', 'emailError', 'signupUsernameError', 'signupPasswordError', 'confirmPasswordError', 'storePositionError', 'termsError'];
    signupErrors.forEach(errorId => {
        clearError(errorId);
    });
}
