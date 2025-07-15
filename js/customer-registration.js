// Fresh Grocers Customer Registration JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize form validation
    initializeFormValidation();
    
    // Setup password toggle
    setupPasswordToggle();
    
    // Setup form submission
    setupFormSubmission();
});

function initializeFormValidation() {
    const form = document.getElementById('registrationForm');
    const inputs = form.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(input);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(input);
        });
    });
    
    // Special validation for confirm password
    const confirmPassword = document.getElementById('confirmPassword');
    confirmPassword.addEventListener('input', function() {
        validatePasswordMatch();
    });
    
    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', function(e) {
        formatPhoneNumber(e.target);
    });
}

function setupPasswordToggle() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

function setupFormSubmission() {
    const form = document.getElementById('registrationForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            registerCustomer();
        }
    });
}

function validateForm() {
    let isValid = true;
    const form = document.getElementById('registrationForm');
    const inputs = form.querySelectorAll('input[required]');
    
    // Clear all previous errors
    clearAllErrors();
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    // Additional validations
    if (!validateEmail()) isValid = false;
    if (!validatePasswordStrength()) isValid = false;
    if (!validatePasswordMatch()) isValid = false;
    if (!validatePhoneNumber()) isValid = false;
    if (!validateTerms()) isValid = false;
    
    return isValid;
}

function validateField(input) {
    const value = input.value.trim();
    
    if (!value) {
        showFieldError(input, `${getFieldLabel(input)} is required`);
        return false;
    }
    
    return true;
}

function validateEmail() {
    const emailInput = document.getElementById('email');
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
        showFieldError(emailInput, 'Please enter a valid email address');
        return false;
    }
    
    // Check if email already exists
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    if (existingUsers.some(user => user.email === email)) {
        showFieldError(emailInput, 'This email is already registered');
        return false;
    }
    
    return true;
}

function validatePasswordStrength() {
    const passwordInput = document.getElementById('password');
    const password = passwordInput.value;
    
    if (password.length < 8) {
        showFieldError(passwordInput, 'Password must be at least 8 characters long');
        return false;
    }
    
    // Check for at least one uppercase, one lowercase, one number
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    if (!hasUpper || !hasLower || !hasNumber) {
        showFieldError(passwordInput, 'Password must contain uppercase, lowercase, and number');
        return false;
    }
    
    return true;
}

function validatePasswordMatch() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    if (passwordInput.value !== confirmPasswordInput.value) {
        showFieldError(confirmPasswordInput, 'Passwords do not match');
        return false;
    }
    
    return true;
}

function validatePhoneNumber() {
    const phoneInput = document.getElementById('phone');
    const phone = phoneInput.value.replace(/\D/g, '');
    
    if (phone.length !== 10) {
        showFieldError(phoneInput, 'Please enter a valid 10-digit phone number');
        return false;
    }
    
    return true;
}

function validateTerms() {
    const termsCheckbox = document.getElementById('agreeTerms');
    
    if (!termsCheckbox.checked) {
        showFieldError(termsCheckbox, 'You must accept the terms and conditions');
        return false;
    }
    
    return true;
}

function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length >= 6) {
        value = value.substring(0, 3) + '-' + value.substring(3, 6) + '-' + value.substring(6, 10);
    } else if (value.length >= 3) {
        value = value.substring(0, 3) + '-' + value.substring(3);
    }
    
    input.value = value;
}

function showFieldError(input, message) {
    clearFieldError(input);
    
    input.classList.add('error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    input.parentNode.appendChild(errorDiv);
}

function clearFieldError(input) {
    input.classList.remove('error');
    
    const existingError = input.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

function clearAllErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(error => error.remove());
    
    const errorInputs = document.querySelectorAll('.error');
    errorInputs.forEach(input => input.classList.remove('error'));
}

function getFieldLabel(input) {
    const label = document.querySelector(`label[for="${input.id}"]`);
    return label ? label.textContent.replace('*', '').trim() : input.placeholder || input.name;
}

function registerCustomer() {
    const formData = new FormData(document.getElementById('registrationForm'));
    
    const customerData = {
        id: `CUST-${Date.now()}`,
        userType: 'customer',
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        password: formData.get('password'),
        phone: formData.get('phone'),
        address: {
            street: formData.get('address'),
            city: formData.get('city'),
            state: formData.get('state'),
            zipCode: formData.get('zipCode')
        },
        registrationDate: new Date().toISOString(),
        isActive: true
    };
    
    // Save to localStorage
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push(customerData);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Show success message
    showSuccessModal();
}

function showSuccessModal() {
    // Show loading button state
    const submitBtn = document.querySelector('.signup-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const loadingSpinner = submitBtn.querySelector('.loading-spinner');
    
    btnText.style.display = 'none';
    loadingSpinner.style.display = 'inline-block';
    submitBtn.disabled = true;
    
    // Simulate processing time
    setTimeout(() => {
        // Hide loading
        btnText.style.display = 'inline-block';
        loadingSpinner.style.display = 'none';
        submitBtn.disabled = false;
        
        // Create and show success modal
        const modal = document.createElement('div');
        modal.className = 'success-modal';
        modal.innerHTML = `
            <div class="success-modal-content">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2>Registration Successful!</h2>
                <p><strong>Your account has been created successfully!</strong></p>
                <p>✅ Account details saved securely</p>
                <p>✅ Welcome email sent to your inbox</p>
                <p>You can now login to start ordering fresh groceries.</p>
                <div class="success-buttons">
                    <button onclick="redirectToLogin()" class="success-btn primary">
                        <i class="fas fa-sign-in-alt"></i>
                        Login Now
                    </button>
                    <button onclick="closeSuccessModal()" class="success-btn secondary">
                        <i class="fas fa-user-plus"></i>
                        Register Another
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Show success notification
        showNotification('Account created successfully! Redirecting to login...', 'success');
        
        // Auto redirect after 5 seconds
        setTimeout(() => {
            redirectToLogin();
        }, 5000);
    }, 1500); // Show loading for 1.5 seconds
}

function redirectToLogin() {
    window.location.href = 'login.html';
}

function closeSuccessModal() {
    const modal = document.querySelector('.success-modal');
    if (modal) {
        modal.remove();
    }
    // Reset form for another registration
    document.getElementById('registrationForm').reset();
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

function goBackToLogin() {
    if (confirm('Are you sure you want to go back? Any entered information will be lost.')) {
        window.location.href = 'login.html';
    }
}

// Add CSS for success modal and error states
const style = document.createElement('style');
style.textContent = `
    .success-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    }
    
    .success-modal-content {
        background: white;
        padding: 40px;
        border-radius: 20px;
        text-align: center;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        animation: slideUp 0.3s ease;
    }
    
    .success-icon {
        margin-bottom: 20px;
    }
    
    .success-icon i {
        font-size: 64px;
        color: #10b981;
        animation: checkmark 0.6s ease 0.3s both;
    }
    
    .success-modal-content h2 {
        color: #1f2937;
        margin-bottom: 15px;
        font-size: 28px;
    }
    
    .success-modal-content p {
        color: #6b7280;
        margin-bottom: 10px;
        line-height: 1.6;
    }
    
    .success-buttons {
        display: flex;
        gap: 15px;
        justify-content: center;
        margin-top: 25px;
        flex-wrap: wrap;
    }
    
    .success-btn {
        padding: 12px 24px;
        border: none;
        border-radius: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        min-width: 140px;
        justify-content: center;
    }
    
    .success-btn.primary {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
    }
    
    .success-btn.primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
    }
    
    .success-btn.secondary {
        background: #f3f4f6;
        color: #374151;
        border: 2px solid #e5e7eb;
    }
    
    .success-btn.secondary:hover {
        background: #e5e7eb;
        transform: translateY(-2px);
    }
    
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 15px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 10001;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    }
    
    .notification.success {
        border-left: 4px solid #10b981;
        color: #065f46;
    }
    
    .notification.success i {
        color: #10b981;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes checkmark {
        0% { transform: scale(0); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .error-message {
        color: #ef4444;
        font-size: 14px;
        margin-top: 5px;
        display: block;
    }
    
    .error {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
    }
    
    @media (max-width: 768px) {
        .success-buttons {
            flex-direction: column;
        }
        
        .success-btn {
            width: 100%;
        }
    }
    }
`;
document.head.appendChild(style);

// Password toggle functions
function toggleCustomerPassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = passwordInput.parentNode.querySelector('.toggle-password i');
    
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
    const toggleIcon = passwordInput.parentNode.querySelector('.toggle-password i');
    
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
