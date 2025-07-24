// Fresh Grocers Secure Login System
document.addEventListener('DOMContentLoaded', function() {
    // Initialize pre-defined staff accounts
    initializeStaffAccounts();
    
    // Create demo registered staff for testing
    createDemoRegisteredStaff();
    
    // Check URL parameters for login type
    checkLoginTypeFromURL();
    
    // Setup form handlers
    setupFormHandlers();
    
    // Setup password toggles
    setupPasswordToggles();
});

// Pre-defined staff accounts (in real application, this would be in secure database)
const staffAccounts = [
    {
        email: 'admin@freshgrocers.com',
        password: 'admin123', // In real app, this would be hashed
        staffId: 'ADM001',
        role: 'admin',
        name: 'System Administrator'
    },
    {
        email: 'manager@freshgrocers.com',
        password: 'manager123',
        staffId: 'MGR001',
        role: 'manager',
        name: 'Store Manager'
    },
    {
        email: 'staff1@freshgrocers.com',
        password: 'staff123',
        staffId: 'STF001',
        role: 'staff',
        name: 'Staff Member 1'
    },
    {
        email: 'staff2@freshgrocers.com',
        password: 'staff123',
        staffId: 'STF002',
        role: 'staff',
        name: 'Staff Member 2'
    }
];

function initializeStaffAccounts() {
    // Store staff accounts in localStorage (in real app, this would be server-side)
    localStorage.setItem('staffAccounts', JSON.stringify(staffAccounts));
}

function setupFormHandlers() {
    const customerForm = document.getElementById('customerLoginForm');
    const staffForm = document.getElementById('staffLoginForm');
    
    console.log('🔧 Setting up form handlers...');
    console.log('Customer form found:', !!customerForm);
    console.log('Staff form found:', !!staffForm);
    
    if (customerForm) {
        console.log('📝 Adding customer form event listener');
        customerForm.addEventListener('submit', function(e) {
            console.log('🚫 Preventing default form submission - CUSTOMER');
            e.preventDefault();
            e.stopPropagation();
            console.log('📝 Customer form submitted - calling handleCustomerLogin()');
            handleCustomerLogin();
            return false; // Extra prevention
        });
        
        // Also add to the button directly as backup
        const customerLoginBtn = customerForm.querySelector('button[type="submit"]');
        if (customerLoginBtn) {
            customerLoginBtn.addEventListener('click', function(e) {
                console.log('🚫 Button click prevented - CUSTOMER');
                e.preventDefault();
                e.stopPropagation();
                handleCustomerLogin();
                return false;
            });
        }
    } else {
        console.error('❌ Customer form not found!');
    }
    
    if (staffForm) {
        console.log('📝 Adding staff form event listener');
        staffForm.addEventListener('submit', function(e) {
            console.log('🚫 Preventing default form submission - STAFF');
            e.preventDefault();
            e.stopPropagation();
            console.log('📝 Staff form submitted - calling handleStaffLogin()');
            handleStaffLogin();
            return false; // Extra prevention
        });
        
        // Also add to the button directly as backup
        const staffLoginBtn = staffForm.querySelector('button[type="submit"]');
        if (staffLoginBtn) {
            staffLoginBtn.addEventListener('click', function(e) {
                console.log('🚫 Button click prevented - STAFF');
                e.preventDefault();
                e.stopPropagation();
                handleStaffLogin();
                return false;
            });
        }
    } else {
        console.error('❌ Staff form not found!');
    }
}

function setupPasswordToggles() {
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

function showCustomerLogin() {
    // Switch to customer login
    document.querySelectorAll('.login-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.login-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Find and activate customer login button
    const customerBtn = document.querySelector('.login-type-btn:first-child');
    if (customerBtn) {
        customerBtn.classList.add('active');
    }
    
    const customerLogin = document.getElementById('customerLogin');
    if (customerLogin) {
        customerLogin.classList.add('active');
    }
}

function showStaffLogin() {
    // Switch to staff login
    document.querySelectorAll('.login-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.login-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Find and activate staff login button
    const staffBtn = document.querySelector('.login-type-btn:last-child');
    if (staffBtn) {
        staffBtn.classList.add('active');
    }
    
    const staffLogin = document.getElementById('staffLogin');
    if (staffLogin) {
        staffLogin.classList.add('active');
    }
}

function handleCustomerLogin() {
    const email = document.getElementById('customerEmail').value.trim();
    const password = document.getElementById('customerPassword').value;
    
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    // Get registered customers
    const customers = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Debug: Log what we're looking for and what we have
    console.log('=== CUSTOMER LOGIN DEBUG ===');
    console.log('Looking for customer with email:', email);
    console.log('Looking for customer with password:', password);
    console.log('Total users in storage:', customers.length);
    console.log('All registered users:', customers);
    
    // More detailed search with debugging
    let foundUser = null;
    let emailMatch = false;
    let passwordMatch = false;
    let typeMatch = false;
    
    for (let user of customers) {
        console.log(`Checking user: ${user.email}`);
        console.log(`- Email match: ${user.email} === ${email} = ${user.email === email}`);
        console.log(`- Password match: ${user.password} === ${password} = ${user.password === password}`);
        console.log(`- User type: ${user.userType}`);
        console.log(`- User type match: ${user.userType} === 'customer' = ${user.userType === 'customer'}`);
        
        if (user.email === email) {
            emailMatch = true;
            if (user.password === password) {
                passwordMatch = true;
                if (user.userType === 'customer') {
                    typeMatch = true;
                    foundUser = user;
                    break;
                }
            }
        }
    }
    
    console.log('Search results:');
    console.log(`- Email found: ${emailMatch}`);
    console.log(`- Password correct: ${passwordMatch}`);
    console.log(`- Type is customer: ${typeMatch}`);
    console.log(`- Found user:`, foundUser);
    console.log('=== END DEBUG ===');
    
    if (foundUser) {
        console.log('🎉 LOGIN SUCCESS - Creating session and redirecting...');
        
        // Create session
        const sessionData = {
            id: foundUser.id,
            email: foundUser.email,
            name: `${foundUser.firstName} ${foundUser.lastName}`,
            userType: 'customer',
            loginTime: new Date().toISOString()
        };
        
        console.log('💾 Session data to store:', sessionData);
        
        try {
            sessionStorage.setItem('currentUser', JSON.stringify(sessionData));
            console.log('✅ Session stored successfully');
            
            // Verify session was stored
            const storedSession = sessionStorage.getItem('currentUser');
            console.log('✅ Verification - stored session:', storedSession);
            
            showSuccess('Login successful! Redirecting...');
            
            console.log('⏰ Setting redirect timer...');
            setTimeout(() => {
                console.log('🚀 Executing redirect to customer-order.html');
                console.log('📍 Current location before redirect:', window.location.href);
                window.location.href = 'customer-order.html';
                console.log('📍 Redirect command executed');
            }, 800);
            
        } catch (error) {
            console.error('❌ Session storage error:', error);
            showError('Session creation failed. Please try again.');
        }
    } else {
        // More specific error messages with debugging
        if (!emailMatch) {
            showError('No account found with this email address. Please register first.');
        } else if (!passwordMatch) {
            showError('Incorrect password. Please try again.');
        } else if (!typeMatch) {
            showError('This email is registered as staff. Please use staff login.');
        } else {
            showError('Login failed. Please try again or contact support.');
        }
    }
}

function handleStaffLogin() {
    const email = document.getElementById('staffEmail').value.trim();
    const password = document.getElementById('staffPassword').value;
    const staffId = document.getElementById('staffId').value.trim();
    
    console.log('🔐 Staff Login Attempt:', { email, password: password ? '***' : 'empty', staffId });
    
    if (!email || !password || !staffId) {
        showError('Please fill in all fields');
        return;
    }
    
    // Get pre-defined staff accounts
    const predefinedStaff = JSON.parse(localStorage.getItem('staffAccounts') || '[]');
    console.log('📋 Pre-defined Staff Accounts:', predefinedStaff);
    
    // Get approved registered staff accounts
    const approvedStaff = JSON.parse(localStorage.getItem('approvedStaffApplications') || '[]');
    console.log('✅ Approved Staff Applications:', approvedStaff);
    
    // Combine both sources
    const allStaffAccounts = [...predefinedStaff, ...approvedStaff];
    console.log('🔍 All Staff Accounts:', allStaffAccounts);
    
    // Verify credentials
    const staffMember = allStaffAccounts.find(staff => 
        staff.email === email && 
        staff.password === password && 
        staff.staffId === staffId
    );
    
    console.log('🎯 Found Staff Member:', staffMember);
    
    if (staffMember) {
        // Create session
        const sessionData = {
            id: staffMember.staffId,
            email: staffMember.email,
            name: staffMember.name || `${staffMember.firstName} ${staffMember.lastName}`,
            userType: 'admin', // All staff get admin access
            role: staffMember.role || staffMember.requestedRole,
            department: staffMember.department,
            loginTime: new Date().toISOString()
        };
        
        console.log('💾 Creating Session:', sessionData);
        sessionStorage.setItem('currentUser', JSON.stringify(sessionData));
        
        showSuccess('Staff login successful! Redirecting...');
        setTimeout(() => {
            console.log('🚀 Redirecting to admin dashboard...');
            window.location.href = 'admin-dashboard.html';
        }, 800);
    } else {
        // Check if there's a pending application
        const pendingApplications = JSON.parse(localStorage.getItem('pendingStaffApplications') || '[]');
        const pendingApp = pendingApplications.find(app => app.email === email);
        
        if (pendingApp) {
            showError('Your registration is still pending approval. Please contact your supervisor.');
        } else {
            showError('Invalid credentials or staff ID. Please check your details and try again.');
        }
    }
}

function showError(message) {
    removeExistingAlerts();
    
    const alert = document.createElement('div');
    alert.className = 'alert alert-error';
    alert.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        ${message}
    `;
    
    document.querySelector('.login-container').prepend(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

function showSuccess(message) {
    removeExistingAlerts();
    
    const alert = document.createElement('div');
    alert.className = 'alert alert-success';
    alert.innerHTML = `
        <i class="fas fa-check-circle"></i>
        ${message}
    `;
    
    document.querySelector('.login-container').prepend(alert);
}

function removeExistingAlerts() {
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
}

// Demo data creation for testing
function createDemoCustomer() {
    const demoCustomer = {
        id: 'CUST-DEMO',
        userType: 'customer',
        firstName: 'Demo',
        lastName: 'Customer',
        email: 'demo@customer.com',
        password: 'demo123',
        phone: '555-0123',
        address: {
            street: '123 Demo Street',
            city: 'Demo City',
            state: 'DC',
            zipCode: '12345'
        },
        registrationDate: new Date().toISOString(),
        isActive: true
    };
    
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    if (!users.find(u => u.email === demoCustomer.email)) {
        users.push(demoCustomer);
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Auto-approve demo registration for testing (remove in production)
function createDemoRegisteredStaff() {
    const demoStaff = {
        id: Date.now(),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@freshgrocers.com',
        password: 'demo123',
        phone: '+1234567890',
        requestedRole: 'staff',
        department: 'sales',
        employeeId: 'STF999',
        supervisorEmail: 'admin@freshgrocers.com',
        submittedAt: new Date().toISOString(),
        status: 'pending'
    };
    
    // Check if already exists
    const existing = JSON.parse(localStorage.getItem('approvedStaffApplications') || '[]');
    const alreadyExists = existing.find(staff => staff.email === demoStaff.email);
    
    if (!alreadyExists) {
        // Add to pending applications
        const pendingApplications = JSON.parse(localStorage.getItem('pendingStaffApplications') || '[]');
        const alreadyPending = pendingApplications.find(app => app.email === demoStaff.email);
        
        if (!alreadyPending) {
            pendingApplications.push(demoStaff);
            localStorage.setItem('pendingStaffApplications', JSON.stringify(pendingApplications));
            
            // Auto-approve it immediately
            setTimeout(() => {
                const result = approveStaffRegistration(demoStaff.id);
                if (result.success) {
                    console.log('✅ Demo staff registration auto-approved: john.doe@freshgrocers.com / demo123 / STF999');
                }
            }, 100);
        }
    }
}

// Create demo customer on page load for testing
createDemoCustomer();

// Add CSS for alerts and improved styling
const style = document.createElement('style');
style.textContent = `
    .login-page {
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    }
    
    .login-container {
        width: 100%;
        max-width: 450px;
    }
    
    .login-type-selector {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        margin-bottom: 30px;
    }
    
    .login-type-btn {
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 15px;
        padding: 20px;
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: center;
        backdrop-filter: blur(10px);
    }
    
    .login-type-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.5);
        transform: translateY(-2px);
    }
    
    .login-type-btn.active {
        background: rgba(255, 255, 255, 0.9);
        color: #333;
        border-color: white;
    }
    
    .login-type-btn i {
        font-size: 24px;
        margin-bottom: 10px;
        display: block;
    }
    
    .login-type-btn span {
        font-weight: 600;
        font-size: 16px;
        display: block;
        margin-bottom: 5px;
    }
    
    .login-type-btn small {
        font-size: 12px;
        opacity: 0.8;
    }
    
    .login-card {
        background: rgba(255, 255, 255, 0.95);
        border-radius: 20px;
        padding: 40px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(20px);
        display: none;
        animation: fadeIn 0.3s ease;
    }
    
    .login-card.active {
        display: block;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .back-to-home {
        margin-bottom: 20px;
    }
    
    .back-link {
        color: #6b7280;
        text-decoration: none;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: color 0.2s;
    }
    
    .back-link:hover {
        color: #10b981;
    }
    
    .logo-section {
        text-align: center;
        margin-bottom: 30px;
    }
    
    .logo-icon {
        font-size: 48px;
        color: #10b981;
        margin-bottom: 15px;
    }
    
    .logo-section h1 {
        color: #333;
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 8px;
    }
    
    .logo-section p {
        color: #6b7280;
        font-size: 16px;
    }
    
    .form-group {
        margin-bottom: 20px;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 8px;
        color: #374151;
        font-weight: 500;
        font-size: 14px;
    }
    
    .input-group {
        position: relative;
    }
    
    .input-group input {
        width: 100%;
        padding: 15px 45px 15px 15px;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        font-size: 16px;
        transition: all 0.3s ease;
        background: white;
    }
    
    .input-group input:focus {
        outline: none;
        border-color: #10b981;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }
    
    .input-group i {
        position: absolute;
        right: 15px;
        top: 50%;
        transform: translateY(-50%);
        color: #9ca3af;
    }
    
    .toggle-password {
        background: none;
        border: none;
        cursor: pointer;
        color: #9ca3af;
        transition: color 0.2s;
    }
    
    .toggle-password:hover {
        color: #10b981;
    }
    
    .login-btn {
        width: 100%;
        padding: 15px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-bottom: 20px;
    }
    
    .login-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
    }
    
    .staff-btn {
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    }
    
    .staff-btn:hover {
        box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
    }
    
    .login-footer {
        text-align: center;
    }
    
    .forgot-password {
        margin-bottom: 15px;
    }
    
    .forgot-password a {
        color: #10b981;
        text-decoration: none;
        font-size: 14px;
    }
    
    .signup-option p {
        color: #6b7280;
        font-size: 14px;
    }
    
    .signup-option a {
        color: #10b981;
        text-decoration: none;
        font-weight: 500;
    }
    
    .staff-note {
        background: #f3f4f6;
        padding: 15px;
        border-radius: 10px;
        margin-top: 15px;
    }
    
    .staff-note i {
        color: #3b82f6;
        margin-right: 8px;
    }
    
    .staff-note p {
        color: #374151;
        font-size: 13px;
        margin: 0;
        line-height: 1.4;
    }
    
    .alert {
        padding: 15px 20px;
        border-radius: 12px;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        font-weight: 500;
        animation: slideDown 0.3s ease;
    }
    
    .alert-error {
        background: #fee2e2;
        color: #dc2626;
        border: 1px solid #fecaca;
    }
    
    .alert-success {
        background: #d1fae5;
        color: #059669;
        border: 1px solid #a7f3d0;
    }
    
    @keyframes slideDown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @media (max-width: 768px) {
        .login-page {
            padding: 15px;
        }
        
        .login-type-selector {
            grid-template-columns: 1fr;
        }
        
        .login-card {
            padding: 30px 20px;
        }
        
        .logo-section h1 {
            font-size: 24px;
        }
    }
`;
document.head.appendChild(style);

// Debug function to show registered users
function showRegisteredUsers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    console.log('=== REGISTERED USERS DEBUG ===');
    console.log('Raw localStorage data:', localStorage.getItem('users'));
    console.log('Parsed users array:', users);
    console.log('Number of users:', users.length);
    
    if (users.length === 0) {
        alert('No users registered yet.\n\nTry registering a customer first at customer-registration.html');
        return;
    }
    
    let userList = 'Registered Users:\n\n';
    users.forEach((user, index) => {
        userList += `${index + 1}. Email: ${user.email}\n`;
        userList += `   Name: ${user.firstName || 'N/A'} ${user.lastName || 'N/A'}\n`;
        userList += `   Type: ${user.userType || 'undefined'}\n`;
        userList += `   Password: ${user.password || 'N/A'}\n`;
        userList += `   Active: ${user.isActive !== undefined ? user.isActive : 'undefined'}\n\n`;
    });
    
    alert(userList);
    
    // Also log to console for detailed debugging
    users.forEach((user, index) => {
        console.log(`User ${index + 1}:`, user);
    });
    console.log('=== END DEBUG ===');
}

// Debug function to clear all user data
function clearUserData() {
    if (confirm('This will delete ALL registered users and staff data. Are you sure?')) {
        localStorage.removeItem('users');
        localStorage.removeItem('staffAccounts');
        sessionStorage.clear();
        alert('All user data cleared. You can now start fresh.');
        // Reinitialize staff accounts
        initializeStaffAccounts();
        createDemoCustomer();
        console.log('User data cleared and demo accounts recreated.');
    }
}

// Function to approve pending staff registrations (for admin use)
function approveStaffRegistration(applicationId) {
    const pendingApplications = JSON.parse(localStorage.getItem('pendingStaffApplications') || '[]');
    const approvedApplications = JSON.parse(localStorage.getItem('approvedStaffApplications') || '[]');
    
    const applicationIndex = pendingApplications.findIndex(app => app.id === applicationId);
    
    if (applicationIndex !== -1) {
        const application = pendingApplications[applicationIndex];
        
        // Create approved staff account
        const approvedStaff = {
            email: application.email,
            password: application.password,
            staffId: application.employeeId || generateStaffId(application.requestedRole),
            role: application.requestedRole,
            name: `${application.firstName} ${application.lastName}`,
            firstName: application.firstName,
            lastName: application.lastName,
            phone: application.phone,
            department: application.department,
            approvedAt: new Date().toISOString(),
            approvedBy: getCurrentUser()?.name || 'Admin'
        };
        
        // Add to approved staff
        approvedApplications.push(approvedStaff);
        localStorage.setItem('approvedStaffApplications', JSON.stringify(approvedApplications));
        
        // Remove from pending
        pendingApplications.splice(applicationIndex, 1);
        localStorage.setItem('pendingStaffApplications', JSON.stringify(pendingApplications));
        
        // Send approval notification (simulation)
        console.log(`Staff approved: ${approvedStaff.email} with ID: ${approvedStaff.staffId}`);
        
        return {
            success: true,
            message: `${application.firstName} ${application.lastName} has been approved as ${application.requestedRole}`,
            staffId: approvedStaff.staffId
        };
    }
    
    return {
        success: false,
        message: 'Application not found'
    };
}

function getCurrentUser() {
    const userData = sessionStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
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
    const number = Math.floor(Math.random() * 900) + 100;
    return `${prefix}${number}`;
}

// Quick admin function to approve all pending registrations (for testing)
function approveAllPendingRegistrations() {
    const pendingApplications = JSON.parse(localStorage.getItem('pendingStaffApplications') || '[]');
    let approvedCount = 0;
    
    pendingApplications.forEach(application => {
        const result = approveStaffRegistration(application.id);
        if (result.success) {
            approvedCount++;
            console.log(`✅ Approved: ${application.firstName} ${application.lastName} - Staff ID: ${result.staffId}`);
        }
    });
    
    console.log(`🎉 Approved ${approvedCount} staff registrations`);
    return approvedCount;
}

function checkLoginTypeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const loginType = urlParams.get('type');
    
    if (loginType === 'staff') {
        // Automatically switch to staff login
        showStaffLogin();
    } else if (loginType === 'customer') {
        // Automatically switch to customer login (already default)
        showCustomerLogin();
    }
}

// Test functions for debugging
function testDirectLogin() {
    console.log('🧪 Testing direct customer login...');
    
    // Fill the form with demo credentials
    document.getElementById('customerEmail').value = 'demo@customer.com';
    document.getElementById('customerPassword').value = 'demo123';
    
    // Call the login handler directly
    handleCustomerLogin();
}

function testStaffLogin() {
    console.log('🧪 Testing staff login directly...');
    
    // Switch to staff login first
    showStaffLogin();
    
    setTimeout(() => {
        // Fill the form with demo credentials
        document.getElementById('staffEmail').value = 'admin@freshgrocers.com';
        document.getElementById('staffPassword').value = 'admin123';
        document.getElementById('staffId').value = 'ADM001';
        
        // Call the login handler directly
        handleStaffLogin();
    }, 100);
}

function checkStaffAccounts() {
    console.log('📋 Checking all staff accounts...');
    console.log('Pre-defined staff:', JSON.parse(localStorage.getItem('staffAccounts') || '[]'));
    console.log('Approved staff:', JSON.parse(localStorage.getItem('approvedStaffApplications') || '[]'));
    console.log('Pending staff:', JSON.parse(localStorage.getItem('pendingStaffApplications') || '[]'));
}

function showRegisteredUsers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    console.log('👥 All registered users:');
    console.table(users);
    
    alert(`Registered Users (${users.length}):\n\n` + 
          users.map(u => `${u.firstName} ${u.lastName}\nEmail: ${u.email}\nType: ${u.userType}`).join('\n\n'));
}

function clearUserData() {
    if (confirm('Clear ALL user data? This will remove all registered users and staff.')) {
        localStorage.removeItem('users');
        localStorage.removeItem('staffAccounts');
        localStorage.removeItem('approvedStaffApplications');
        localStorage.removeItem('pendingStaffApplications');
        
        // Recreate demo data
        initializeStaffAccounts();
        createDemoCustomer();
        createDemoRegisteredStaff();
        
        alert('All data cleared and demo accounts recreated!');
    }
}
