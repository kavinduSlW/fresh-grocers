// Fresh Grocers Admin Delivery Management JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated as admin
    checkAdminAuth();
    
    // Initialize delivery management
    initializeDeliveryManagement();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Load delivery data
    loadDeliveryData();
});

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

function initializeDeliveryManagement() {
    // Update stats with real-time data
    updateDeliveryStats();
    
    // Setup search functionality
    setupSearchAndFilters();
    
    // Load delivery agents
    loadDeliveryAgents();
    
    // Start real-time updates
    startRealTimeUpdates();
}

function setupMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
}

function updateDeliveryStats() {
    // Get orders from localStorage
    const orders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    const deliveryAgents = JSON.parse(localStorage.getItem('deliveryAgents') || getDefaultAgents());
    
    // Calculate stats
    const activeDeliveries = orders.filter(order => 
        ['preparing', 'out-for-delivery'].includes(order.status)
    ).length;
    
    const availableAgents = deliveryAgents.filter(agent => 
        agent.status === 'available'
    ).length;
    
    const completedToday = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        const today = new Date();
        return orderDate.toDateString() === today.toDateString() && 
               order.status === 'delivered';
    }).length;
    
    // Update DOM elements
    const elements = {
        'activeDeliveries': activeDeliveries,
        'availableAgents': availableAgents,
        'avgDeliveryTime': '28',
        'completedToday': completedToday
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}

function loadDeliveryData() {
    const orders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    const deliveryAgents = JSON.parse(localStorage.getItem('deliveryAgents') || getDefaultAgents());
    
    // Load active deliveries
    loadActiveDeliveries(orders);
    
    // Load delivery agents
    loadAgentsTable(deliveryAgents);
}

function loadActiveDeliveries(orders) {
    const activeOrders = orders.filter(order => 
        ['preparing', 'out-for-delivery', 'delivered'].includes(order.status)
    );
    
    const tableBody = document.getElementById('deliveriesTableBody');
    if (!tableBody) return;
    
    if (activeOrders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #6b7280;">
                    <i class="fas fa-truck" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                    No active deliveries at the moment
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = activeOrders.map(order => {
        const statusClass = getStatusClass(order.status);
        const timeAgo = getTimeAgo(order.createdAt);
        
        return `
            <tr>
                <td><strong>${order.orderId}</strong></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 32px; height: 32px; background: #e0f2fe; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-user" style="color: #0369a1; font-size: 14px;"></i>
                        </div>
                        <div>
                            <div style="font-weight: 600;">${order.customer?.name || 'Customer'}</div>
                            <div style="font-size: 12px; color: #6b7280;">${order.customer?.email || 'No email'}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 32px; height: 32px; background: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-motorcycle" style="color: #166534; font-size: 14px;"></i>
                        </div>
                        <div>
                            <div style="font-weight: 600;">${order.deliveryAgent?.name || 'Not Assigned'}</div>
                            <div style="font-size: 12px; color: #6b7280;">Agent ID: ${order.deliveryAgent?.id || 'N/A'}</div>
                        </div>
                    </div>
                </td>
                <td>${order.deliveryAddress || 'Not specified'}</td>
                <td><span class="status-badge ${statusClass}">${formatStatus(order.status)}</span></td>
                <td>
                    <div style="font-weight: 600; color: #1f2937;">${timeAgo}</div>
                    <div style="font-size: 12px; color: #6b7280;">Est: ${getEstimatedTime(order.status)}</div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-view" title="Track Delivery" onclick="trackDelivery('${order.orderId}')">
                            <i class="fas fa-map-marker-alt"></i>
                        </button>
                        <button class="btn-icon btn-edit" title="Update Status" onclick="updateDeliveryStatus('${order.orderId}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function loadAgentsTable(agents) {
    const tableBody = document.getElementById('agentsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = agents.map(agent => {
        const statusClass = getAgentStatusClass(agent.status);
        
        return `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 40px; height: 40px; background: ${getAgentIconBg(agent.vehicle)}; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-${agent.vehicle === 'motorcycle' ? 'motorcycle' : 'truck'}" style="color: ${getAgentIconColor(agent.vehicle)}; font-size: 16px;"></i>
                        </div>
                        <div>
                            <div style="font-weight: 600; color: #1f2937;">${agent.name}</div>
                            <div style="font-size: 12px; color: #6b7280;">Agent ID: ${agent.id}</div>
                        </div>
                    </div>
                </td>
                <td><span class="status-badge ${statusClass}">${formatStatus(agent.status)}</span></td>
                <td>${agent.currentDeliveries || 0}</td>
                <td>${agent.completedToday || 0}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <span style="font-weight: 600;">${agent.rating || '4.5'}</span>
                        <div style="color: #fbbf24;">${getStarRating(agent.rating || 4.5)}</div>
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-view" title="View Details" onclick="viewAgentDetails('${agent.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon btn-edit" title="Assign Delivery" onclick="assignDeliveryToAgent('${agent.id}')" ${agent.status === 'available' ? '' : 'disabled'}>
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function setupSearchAndFilters() {
    // Setup delivery search
    const searchDeliveries = document.getElementById('searchDeliveries');
    if (searchDeliveries) {
        searchDeliveries.addEventListener('input', filterDeliveries);
    }
    
    // Setup status filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterDeliveries);
    }
    
    // Setup agent search
    const searchAgents = document.getElementById('searchAgents');
    if (searchAgents) {
        searchAgents.addEventListener('input', filterAgents);
    }
    
    // Setup agent status filter
    const agentStatusFilter = document.getElementById('agentStatusFilter');
    if (agentStatusFilter) {
        agentStatusFilter.addEventListener('change', filterAgents);
    }
}

function filterDeliveries() {
    const searchTerm = document.getElementById('searchDeliveries')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    
    const rows = document.querySelectorAll('#deliveriesTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const status = row.querySelector('.status-badge')?.textContent.toLowerCase() || '';
        
        const matchesSearch = text.includes(searchTerm);
        const matchesStatus = !statusFilter || status.includes(statusFilter.toLowerCase());
        
        row.style.display = matchesSearch && matchesStatus ? '' : 'none';
    });
}

function filterAgents() {
    const searchTerm = document.getElementById('searchAgents')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('agentStatusFilter')?.value || '';
    
    const rows = document.querySelectorAll('#agentsTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const status = row.querySelector('.status-badge')?.textContent.toLowerCase() || '';
        
        const matchesSearch = text.includes(searchTerm);
        const matchesStatus = !statusFilter || status.includes(statusFilter.toLowerCase());
        
        row.style.display = matchesSearch && matchesStatus ? '' : 'none';
    });
}

function startRealTimeUpdates() {
    // Update stats every 30 seconds
    setInterval(updateDeliveryStats, 30000);
    
    // Refresh delivery data every 2 minutes
    setInterval(loadDeliveryData, 120000);
}

// Utility functions
function getDefaultAgents() {
    return [
        {
            id: 'AG001',
            name: 'Mike Johnson',
            status: 'available',
            vehicle: 'motorcycle',
            currentDeliveries: 0,
            completedToday: 12,
            rating: 4.8
        },
        {
            id: 'AG002',
            name: 'David Lee',
            status: 'busy',
            vehicle: 'truck',
            currentDeliveries: 1,
            completedToday: 8,
            rating: 4.6
        },
        {
            id: 'AG003',
            name: 'Sarah Wilson',
            status: 'available',
            vehicle: 'motorcycle',
            currentDeliveries: 0,
            completedToday: 15,
            rating: 4.9
        }
    ];
}

function getStatusClass(status) {
    const statusMap = {
        'preparing': 'status-pending',
        'out-for-delivery': 'status-active',
        'delivered': 'status-in-stock'
    };
    return statusMap[status] || 'status-pending';
}

function getAgentStatusClass(status) {
    const statusMap = {
        'available': 'status-active',
        'busy': 'status-pending',
        'offline': 'status-out-of-stock'
    };
    return statusMap[status] || 'status-pending';
}

function formatStatus(status) {
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ');
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
}

function getEstimatedTime(status) {
    const estimates = {
        'preparing': '25 min',
        'out-for-delivery': '10 min',
        'delivered': 'Completed'
    };
    return estimates[status] || '30 min';
}

function getAgentIconBg(vehicle) {
    return vehicle === 'motorcycle' ? '#dcfce7' : '#e0f2fe';
}

function getAgentIconColor(vehicle) {
    return vehicle === 'motorcycle' ? '#166534' : '#0369a1';
}

function getStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars);
}

// Action functions
function assignDelivery() {
    alert('Assign Delivery feature - Coming soon!');
}

function refreshDeliveries() {
    showToast('Refreshing delivery data...', 'info');
    loadDeliveryData();
    updateDeliveryStats();
}

function trackDelivery(orderId) {
    alert(`Tracking delivery for order: ${orderId}`);
}

function updateDeliveryStatus(orderId) {
    alert(`Update status for order: ${orderId}`);
}

function viewAgentDetails(agentId) {
    alert(`View details for agent: ${agentId}`);
}

function assignDeliveryToAgent(agentId) {
    alert(`Assign delivery to agent: ${agentId}`);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

// Toast notification function
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} show`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}
