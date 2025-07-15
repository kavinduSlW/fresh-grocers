// Fresh Grocers Delivery System - Login functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        initializeLoginForm();
    }
});

function initializeLoginForm() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const userType = document.querySelector('input[name="userType"]:checked')?.value;
        
        // Clear previous errors
        clearErrors();
        
        // Validation
        let isValid = true;
        
        if (!userType) {
            showError('userTypeError', 'Please select user type');
            isValid = false;
        }
        
        if (!username.trim()) {
            showError('usernameError', 'Username is required');
            isValid = false;
        }
        
        if (!password.trim()) {
            showError('passwordError', 'Password is required');
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Show loading
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const loadingSpinner = submitBtn.querySelector('.loading-spinner');
        
        btnText.textContent = 'Signing in...';
        loadingSpinner.style.display = 'inline-block';
        submitBtn.disabled = true;
        
        // Simulate authentication
        setTimeout(() => {
            if (authenticateUser(username, password, userType)) {
                // Store user session
                sessionStorage.setItem('currentUser', JSON.stringify({
                    username: username,
                    userType: userType,
                    loginTime: new Date().toISOString()
                }));
                
                // Redirect based on user type
                if (userType === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                } else if (userType === 'customer') {
                    window.location.href = 'customer-order.html';
                }
            } else {
                showError('passwordError', 'Invalid credentials');
                btnText.textContent = 'Sign In';
                loadingSpinner.style.display = 'none';
                submitBtn.disabled = false;
            }
        }, 1500);
    });
}

// Authentication function with demo credentials
function authenticateUser(username, password, userType) {
    const users = {
        admin: {
            'admin': 'admin123',
            'manager': 'manager123',
            'staff': 'staff123'
        },
        customer: {
            'customer': 'customer123',
            'john': 'john123',
            'sarah': 'sarah123',
            'mike': 'mike123'
        }
    };
    
    return users[userType] && users[userType][username] === password;
}

// Show customer registration form
function showCustomerRegistration() {
    window.location.href = 'customer-registration.html';
}

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('#loginForm .toggle-password');
    
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

// Utility functions
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Add error styling to parent form group
        const formGroup = errorElement.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('error');
        }
    }
}

function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
        element.style.display = 'none';
    });
    
    // Remove error styling
    const formGroups = document.querySelectorAll('.form-group.error');
    formGroups.forEach(group => {
        group.classList.remove('error');
    });
}

// Check if user is already logged in
function checkExistingSession() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        // Redirect to appropriate dashboard
        if (user.userType === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else if (user.userType === 'customer') {
            window.location.href = 'customer-order.html';
        }
    }
}

// Call on page load
checkExistingSession();
