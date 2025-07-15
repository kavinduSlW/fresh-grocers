// Fresh Grocers Admin Staff Management JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkAdminAuth();
    
    // Initialize staff management
    initializeStaffManagement();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Setup form handlers
    setupFormHandlers();
});

// Global variables
let staffMembers = [];
let editingStaffId = null;
let currentStaffForPasswordReset = null;

function checkAdminAuth() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    const user = JSON.parse(currentUser);
    if (user.userType !== 'admin') {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'login.html';
        return;
    }
}

function initializeStaffManagement() {
    loadStaffMembers();
    updateStaffStats();
}

function setupMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', function() {
            navLinks.classList.toggle('mobile-open');
        });
    }
}

function setupFormHandlers() {
    const staffForm = document.getElementById('staffForm');
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    
    staffForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addStaffMember();
    });
    
    resetPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        resetStaffPassword();
    });
}

function loadStaffMembers() {
    // Get existing staff accounts
    const existingStaff = JSON.parse(localStorage.getItem('staffAccounts') || '[]');
    
    // Add created date and status if not present
    staffMembers = existingStaff.map(staff => ({
        ...staff,
        createdDate: staff.createdDate || new Date().toISOString(),
        status: staff.status || 'active',
        notes: staff.notes || ''
    }));
    
    displayStaffMembers(staffMembers);
    saveStaffMembers();
}

function displayStaffMembers(staffToShow) {
    const tableBody = document.getElementById('staffTableBody');
    
    if (staffToShow.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="no-data">
                    <i class="fas fa-users"></i>
                    <p>No staff members found</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = staffToShow.map(staff => `
        <tr>
            <td>
                <div class="staff-cell">
                    <div class="staff-avatar">
                        <i class="fas ${getRoleIcon(staff.role)}"></i>
                    </div>
                    <div class="staff-info">
                        <div class="staff-name">${staff.name}</div>
                        <div class="staff-id-small">ID: ${staff.staffId}</div>
                    </div>
                </div>
            </td>
            <td><span class="staff-id-badge">${staff.staffId}</span></td>
            <td>${staff.email}</td>
            <td><span class="role-badge ${staff.role}">${capitalizeFirst(staff.role)}</span></td>
            <td><span class="status-badge ${staff.status}">${capitalizeFirst(staff.status)}</span></td>
            <td>${formatDate(staff.createdDate)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="viewStaffDetails('${staff.staffId}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon warning" onclick="openResetPasswordModal('${staff.staffId}')" title="Reset Password">
                        <i class="fas fa-key"></i>
                    </button>
                    <button class="btn-icon ${staff.status === 'active' ? 'danger' : 'success'}" 
                            onclick="toggleStaffStatus('${staff.staffId}')" 
                            title="${staff.status === 'active' ? 'Deactivate' : 'Activate'}">
                        <i class="fas fa-${staff.status === 'active' ? 'user-slash' : 'user-check'}"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function updateStaffStats() {
    const totalStaff = staffMembers.length;
    const activeStaff = staffMembers.filter(s => s.status === 'active').length;
    const adminCount = staffMembers.filter(s => s.role === 'admin').length;
    const managerCount = staffMembers.filter(s => s.role === 'manager').length;
    
    document.getElementById('totalStaff').textContent = totalStaff;
    document.getElementById('activeStaff').textContent = activeStaff;
    document.getElementById('adminCount').textContent = adminCount;
    document.getElementById('managerCount').textContent = managerCount;
}

function getRoleIcon(role) {
    switch (role) {
        case 'admin': return 'fa-user-shield';
        case 'manager': return 'fa-user-tie';
        case 'staff': return 'fa-user';
        default: return 'fa-user';
    }
}

function searchStaff() {
    const searchTerm = document.getElementById('staffSearch').value.toLowerCase();
    const filteredStaff = staffMembers.filter(staff =>
        staff.name.toLowerCase().includes(searchTerm) ||
        staff.email.toLowerCase().includes(searchTerm) ||
        staff.staffId.toLowerCase().includes(searchTerm)
    );
    
    applyFilters(filteredStaff);
}

function filterStaff() {
    applyFilters(staffMembers);
}

function applyFilters(baseStaff) {
    const roleFilter = document.getElementById('roleFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    let filteredStaff = baseStaff;
    
    if (roleFilter) {
        filteredStaff = filteredStaff.filter(s => s.role === roleFilter);
    }
    
    if (statusFilter) {
        filteredStaff = filteredStaff.filter(s => s.status === statusFilter);
    }
    
    displayStaffMembers(filteredStaff);
}

function openAddStaffModal() {
    editingStaffId = null;
    document.getElementById('modalTitle').textContent = 'Add New Staff Member';
    document.getElementById('staffForm').reset();
    document.getElementById('staffModal').style.display = 'block';
}

function addStaffMember() {
    const name = document.getElementById('staffName').value.trim();
    const email = document.getElementById('staffEmail').value.trim();
    const role = document.getElementById('staffRole').value;
    const password = document.getElementById('staffPassword').value;
    const notes = document.getElementById('staffNotes').value.trim();
    
    // Validation
    if (!name || !email || !role || !password) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    // Check if email already exists
    if (staffMembers.find(s => s.email === email)) {
        showToast('Email address already exists', 'error');
        return;
    }
    
    // Generate staff ID
    const rolePrefix = role === 'admin' ? 'ADM' : role === 'manager' ? 'MGR' : 'STF';
    const roleCount = staffMembers.filter(s => s.role === role).length + 1;
    const staffId = `${rolePrefix}${roleCount.toString().padStart(3, '0')}`;
    
    // Create new staff member
    const newStaff = {
        email: email,
        password: password,
        staffId: staffId,
        role: role,
        name: name,
        notes: notes,
        createdDate: new Date().toISOString(),
        status: 'active'
    };
    
    staffMembers.push(newStaff);
    saveStaffMembers();
    displayStaffMembers(staffMembers);
    updateStaffStats();
    closeStaffModal();
    
    showToast(`Staff member ${name} added successfully with ID: ${staffId}`, 'success');
}

function viewStaffDetails(staffId) {
    const staff = staffMembers.find(s => s.staffId === staffId);
    if (!staff) return;
    
    const details = `
        Name: ${staff.name}
        Staff ID: ${staff.staffId}
        Email: ${staff.email}
        Role: ${capitalizeFirst(staff.role)}
        Status: ${capitalizeFirst(staff.status)}
        Created: ${formatDate(staff.createdDate)}
        ${staff.notes ? `Notes: ${staff.notes}` : ''}
    `;
    
    alert(details);
}

function openResetPasswordModal(staffId) {
    currentStaffForPasswordReset = staffId;
    document.getElementById('resetPasswordForm').reset();
    document.getElementById('resetPasswordModal').style.display = 'block';
}

function resetStaffPassword() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!newPassword || !confirmPassword) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showToast('Password must be at least 6 characters long', 'error');
        return;
    }
    
    // Update password
    const staffIndex = staffMembers.findIndex(s => s.staffId === currentStaffForPasswordReset);
    if (staffIndex !== -1) {
        staffMembers[staffIndex].password = newPassword;
        saveStaffMembers();
        closeResetPasswordModal();
        showToast('Password reset successfully', 'success');
    }
}

function toggleStaffStatus(staffId) {
    const staffIndex = staffMembers.findIndex(s => s.staffId === staffId);
    if (staffIndex !== -1) {
        const currentStatus = staffMembers[staffIndex].status;
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        
        if (confirm(`Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} this staff member?`)) {
            staffMembers[staffIndex].status = newStatus;
            saveStaffMembers();
            displayStaffMembers(staffMembers);
            updateStaffStats();
            
            showToast(`Staff member ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`, 'success');
        }
    }
}

function closeStaffModal() {
    document.getElementById('staffModal').style.display = 'none';
    editingStaffId = null;
}

function closeResetPasswordModal() {
    document.getElementById('resetPasswordModal').style.display = 'none';
    currentStaffForPasswordReset = null;
}

function saveStaffMembers() {
    localStorage.setItem('staffAccounts', JSON.stringify(staffMembers));
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 4000);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const staffModal = document.getElementById('staffModal');
    const resetPasswordModal = document.getElementById('resetPasswordModal');
    
    if (event.target === staffModal) {
        closeStaffModal();
    }
    if (event.target === resetPasswordModal) {
        closeResetPasswordModal();
    }
});

// Add CSS for staff management specific styles
const style = document.createElement('style');
style.textContent = `
    .staff-controls {
        display: flex;
        gap: 20px;
        align-items: center;
        margin-bottom: 20px;
        flex-wrap: wrap;
    }
    
    .search-box {
        position: relative;
        flex: 1;
        min-width: 200px;
    }
    
    .search-box i {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #9ca3af;
    }
    
    .search-box input {
        width: 100%;
        padding: 10px 10px 10px 40px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 14px;
    }
    
    .filter-controls {
        display: flex;
        gap: 12px;
    }
    
    .filter-controls select {
        padding: 10px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 14px;
        min-width: 120px;
    }
    
    .staff-cell {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .staff-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #f3f4f6;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #6b7280;
        font-size: 16px;
    }
    
    .staff-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    
    .staff-name {
        font-weight: 500;
        color: #333;
    }
    
    .staff-id-small {
        font-size: 12px;
        color: #666;
    }
    
    .staff-id-badge {
        background: #f3f4f6;
        color: #374151;
        padding: 4px 8px;
        border-radius: 6px;
        font-family: monospace;
        font-size: 12px;
        font-weight: 500;
    }
    
    .role-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        text-transform: capitalize;
    }
    
    .role-badge.admin { background: #fef3c7; color: #d97706; }
    .role-badge.manager { background: #dbeafe; color: #2563eb; }
    .role-badge.staff { background: #d1fae5; color: #059669; }
    
    .status-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
    }
    
    .status-badge.active { background: #d1fae5; color: #059669; }
    .status-badge.inactive { background: #fee2e2; color: #dc2626; }
    
    .action-buttons {
        display: flex;
        gap: 8px;
    }
    
    .btn-icon {
        padding: 8px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        background: #f3f4f6;
        color: #374151;
        transition: all 0.2s;
    }
    
    .btn-icon:hover {
        background: #e5e7eb;
    }
    
    .btn-icon.warning {
        background: #fef3c7;
        color: #d97706;
    }
    
    .btn-icon.warning:hover {
        background: #fde68a;
    }
    
    .btn-icon.danger {
        background: #fee2e2;
        color: #dc2626;
    }
    
    .btn-icon.danger:hover {
        background: #fecaca;
    }
    
    .btn-icon.success {
        background: #d1fae5;
        color: #059669;
    }
    
    .btn-icon.success:hover {
        background: #a7f3d0;
    }
    
    .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 20px;
    }
    
    .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        color: white;
        font-weight: 500;
    }
    
    .toast.show {
        opacity: 1;
        transform: translateX(0);
    }
    
    .toast-success {
        background: #10b981;
    }
    
    .toast-error {
        background: #ef4444;
    }
    
    .no-data {
        text-align: center;
        padding: 40px;
        color: #9ca3af;
    }
    
    .no-data i {
        font-size: 48px;
        margin-bottom: 12px;
        display: block;
    }
`;
document.head.appendChild(style);
