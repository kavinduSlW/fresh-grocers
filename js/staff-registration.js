// Fresh Grocers Staff Registration System
document.addEventListener('DOMContentLoaded', function() {
    setupFormValidation();
    setupPasswordToggles();
    setupPasswordRequirements();
});

function setupFormValidation() {
    const form = document.getElementById('staffRegistrationForm');
    
    if (form) {
        form.addEventListener('submit', handleStaffRegistration);
    }
}

function setupPasswordToggles() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetInput = document.getElementById(targetId);
            const icon = this.querySelector('i');
            
            if (targetInput.type === 'password') {
                targetInput.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                targetInput.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
    });
}

function setupPasswordRequirements() {
    const passwordInput = document.getElementById('staffPassword');
    
    if (passwordInput) {
        passwordInput.addEventListener('input', validatePasswordRequirements);
    }
}

function validatePasswordRequirements() {
    const password = document.getElementById('staffPassword').value;
    
    const requirements = {
        'length-req': password.length >= 8,
        'uppercase-req': /[A-Z]/.test(password),
        'lowercase-req': /[a-z]/.test(password),
        'number-req': /\d/.test(password)
    };
    
    Object.entries(requirements).forEach(([reqId, met]) => {
        const element = document.getElementById(reqId);
        if (element) {
            element.className = met ? 'met' : 'unmet';
            element.innerHTML = met ? 
                `<i class="fas fa-check"></i> ${element.textContent.replace(/[✓✗]\s*/, '')}` :
                `<i class="fas fa-times"></i> ${element.textContent.replace(/[✓✗]\s*/, '')}`;
        }
    });
    
    return Object.values(requirements).every(Boolean);
}

async function handleStaffRegistration(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    // Validate form
    const validation = validateStaffRegistrationForm(data);
    if (!validation.isValid) {
        showError(validation.message);
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('.register-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const loadingSpinner = submitBtn.querySelector('.loading-spinner');
    
    btnText.style.display = 'none';
    loadingSpinner.style.display = 'inline-block';
    submitBtn.disabled = true;
    
    try {
        // Simulate registration process
        await simulateRegistrationProcess(data);
        
        // Show success modal
        document.getElementById('successModal').style.display = 'block';
        
    } catch (error) {
        showError('Registration failed. Please try again.');
        console.error('Registration error:', error);
    } finally {
        // Reset button state
        btnText.style.display = 'inline-block';
        loadingSpinner.style.display = 'none';
        submitBtn.disabled = false;
    }
}

function validateStaffRegistrationForm(data) {
    // Check required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'requestedRole', 'department', 'supervisorEmail', 'password', 'confirmPassword'];
    
    for (const field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            return {
                isValid: false,
                message: `Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`
            };
        }
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        return {
            isValid: false,
            message: 'Please enter a valid email address.'
        };
    }
    
    if (!emailRegex.test(data.supervisorEmail)) {
        return {
            isValid: false,
            message: 'Please enter a valid supervisor email address.'
        };
    }
    
    // Validate password
    if (!validatePasswordRequirements()) {
        return {
            isValid: false,
            message: 'Password does not meet the requirements.'
        };
    }
    
    // Check password confirmation
    if (data.password !== data.confirmPassword) {
        return {
            isValid: false,
            message: 'Passwords do not match.'
        };
    }
    
    // Validate phone number
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(data.phone.replace(/[\s\-\(\)]/g, ''))) {
        return {
            isValid: false,
            message: 'Please enter a valid phone number.'
        };
    }
    
    // Check terms agreement
    if (!document.getElementById('agreeTerms').checked) {
        return {
            isValid: false,
            message: 'Please agree to the terms and conditions.'
        };
    }
    
    if (!document.getElementById('agreeBackground').checked) {
        return {
            isValid: false,
            message: 'Please consent to background verification.'
        };
    }
    
    return { isValid: true };
}

async function simulateRegistrationProcess(data) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate staff ID if not provided
    if (!data.employeeId) {
        data.employeeId = generateStaffId(data.requestedRole);
    }
    
    // Create pending staff application
    const application = {
        id: Date.now(),
        ...data,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        approvedBy: null,
        approvedAt: null
    };
    
    // Store in localStorage (in real app, this would go to server)
    const pendingApplications = JSON.parse(localStorage.getItem('pendingStaffApplications') || '[]');
    pendingApplications.push(application);
    localStorage.setItem('pendingStaffApplications', JSON.stringify(pendingApplications));
    
    // Send notification email simulation
    simulateEmailNotification(data);
    
    return application;
}

function generateStaffId(role) {
    const rolePrefix = {
        'staff': 'STF',
        'cashier': 'CSH',
        'stockkeeper': 'STK',
        'delivery': 'DEL',
        'supervisor': 'SUP'
    };
    
    const prefix = rolePrefix[role] || 'STF';
    const number = Math.floor(Math.random() * 900) + 100; // 3-digit number
    return `${prefix}${number}`;
}

function simulateEmailNotification(data) {
    // In a real application, this would send actual emails
    console.log(`Email sent to supervisor: ${data.supervisorEmail}`);
    console.log(`Email sent to applicant: ${data.email}`);
    
    // Store notification log
    const notifications = JSON.parse(localStorage.getItem('emailNotifications') || '[]');
    notifications.push({
        to: data.supervisorEmail,
        subject: 'New Staff Registration - Approval Required',
        message: `${data.firstName} ${data.lastName} has applied for ${data.requestedRole} position.`,
        sentAt: new Date().toISOString()
    });
    notifications.push({
        to: data.email,
        subject: 'Staff Registration Received - Fresh Grocers',
        message: 'Your staff registration has been received and is under review.',
        sentAt: new Date().toISOString()
    });
    localStorage.setItem('emailNotifications', JSON.stringify(notifications));
}

function showError(message) {
    // Remove existing error if any
    const existingError = document.querySelector('.error-toast');
    if (existingError) {
        existingError.remove();
    }
    
    const errorToast = document.createElement('div');
    errorToast.className = 'error-toast';
    errorToast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    document.body.appendChild(errorToast);
    
    setTimeout(() => errorToast.classList.add('show'), 100);
    setTimeout(() => {
        if (errorToast.parentNode) {
            errorToast.classList.remove('show');
            setTimeout(() => errorToast.remove(), 300);
        }
    }, 5000);
}

function showTerms() {
    alert('Terms and Conditions:\n\n1. Employment is subject to background verification\n2. You must follow all company policies\n3. Confidentiality must be maintained\n4. Professional conduct is required at all times\n\n(In a real application, this would show a proper modal with full terms)');
}

function showPrivacy() {
    alert('Privacy Policy:\n\nWe collect and use your personal information solely for employment purposes. Your data is protected and will not be shared with third parties without consent.\n\n(In a real application, this would show a proper modal with full privacy policy)');
}

function redirectToLogin() {
    window.location.href = 'login.html';
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('successModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});
