// Fresh Grocers Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated as admin
    checkAdminAuth();
    
    // Initialize dashboard
    initializeDashboard();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Load dashboard data
    loadDashboardData();
});

function checkAdminAuth() {
    console.log('🔐 Checking admin authentication...');
    
    const currentUser = sessionStorage.getItem('currentUser');
    console.log('👤 Current user session:', currentUser);
    
    if (!currentUser) {
        console.log('❌ No session found - redirecting to login');
        // Add a small delay to handle race conditions with login redirect
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 100);
        return;
    }
    
    try {
        const user = JSON.parse(currentUser);
        console.log('✅ Parsed user:', user);
        
        if (user.userType !== 'admin') {
            console.log('❌ User is not an admin - access denied');
            alert('Access denied. Admin privileges required.');
            window.location.href = 'login.html';
            return;
        }
        
        console.log('✅ Admin authentication successful');
        
    } catch (error) {
        console.error('❌ Error parsing user session:', error);
        sessionStorage.removeItem('currentUser'); // Clear corrupted session
        window.location.href = 'login.html';
        return;
    }
}

function initializeDashboard() {
    // Update user welcome message
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const pageHeader = document.querySelector('.page-header p');
    if (pageHeader && currentUser) {
        pageHeader.textContent = `Welcome back, ${currentUser.username}! Here's what's happening with your store today.`;
    }
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

function loadDashboardData() {
    // Simulate loading dashboard data
    updateSummaryCards();
    loadRecentOrders();
    loadLowStockAlerts();
}

function updateSummaryCards() {
    // Simulate real-time data updates
    const data = getDashboardData();
    
    document.getElementById('totalOrders').textContent = data.totalOrders;
    document.getElementById('lowStockAlerts').textContent = data.lowStockAlerts;
    document.getElementById('activeAgents').textContent = data.activeAgents;
    document.getElementById('todayRevenue').textContent = `$${data.todayRevenue.toLocaleString()}`;
}

function getDashboardData() {
    // Mock data - replace with real API calls
    return {
        totalOrders: Math.floor(Math.random() * 100) + 200,
        lowStockAlerts: Math.floor(Math.random() * 10) + 3,
        activeAgents: Math.floor(Math.random() * 5) + 10,
        todayRevenue: Math.floor(Math.random() * 1000) + 2000
    };
}

function loadRecentOrders() {
    // Mock recent orders data
    const orders = [
        {
            id: 'ORD-001',
            customer: 'John Smith',
            items: 5,
            total: 45.99,
            status: 'pending',
            agent: null
        },
        {
            id: 'ORD-002',
            customer: 'Sarah Johnson',
            items: 8,
            total: 72.50,
            status: 'assigned',
            agent: 'Mike Davis'
        },
        {
            id: 'ORD-003',
            customer: 'Robert Wilson',
            items: 3,
            total: 28.75,
            status: 'delivered',
            agent: 'Lisa Chen'
        },
        {
            id: 'ORD-004',
            customer: 'Emily Brown',
            items: 6,
            total: 56.30,
            status: 'pending',
            agent: null
        }
    ];
    
    const tableBody = document.getElementById('recentOrdersTable');
    if (tableBody) {
        tableBody.innerHTML = orders.map(order => `
            <tr>
                <td>${order.id}</td>
                <td>${order.customer}</td>
                <td>${order.items} items</td>
                <td>$${order.total}</td>
                <td><span class="status ${order.status}">${capitalizeFirst(order.status)}</span></td>
                <td>${order.agent || '-'}</td>
                <td>
                    ${order.status === 'pending' ? 
                        `<button class="btn-small" onclick="assignAgent('${order.id}')">Assign</button>` :
                        `<button class="btn-small" onclick="viewOrder('${order.id}')">View</button>`
                    }
                </td>
            </tr>
        `).join('');
    }
}

function loadLowStockAlerts() {
    // Mock low stock data
    const lowStockItems = [
        {
            name: 'Organic Bananas',
            quantity: 2,
            level: 'critical',
            id: 'bananas'
        },
        {
            name: 'Fresh Milk',
            quantity: 8,
            level: 'warning',
            id: 'milk'
        },
        {
            name: 'Whole Wheat Bread',
            quantity: 5,
            level: 'warning',
            id: 'bread'
        },
        {
            name: 'Chicken Breast',
            quantity: 3,
            level: 'critical',
            id: 'chicken'
        }
    ];
    
    const alertContainer = document.getElementById('lowStockItems');
    if (alertContainer) {
        alertContainer.innerHTML = lowStockItems.map(item => `
            <div class="alert-item ${item.level}">
                <i class="fas ${item.level === 'critical' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle'}"></i>
                <div class="alert-content">
                    <h4>${item.name}</h4>
                    <p>${item.quantity} units left - ${capitalizeFirst(item.level)}</p>
                </div>
                <button class="btn-small" onclick="restockItem('${item.id}')">Restock</button>
            </div>
        `).join('');
    }
}

// Action functions
function assignAgent(orderId) {
    alert(`Assigning agent to order ${orderId}...`);
    // In a real app, this would open a modal or redirect to delivery management
    window.location.href = `admin-delivery.html?order=${orderId}`;
}

function trackOrder(orderId) {
    alert(`Tracking order ${orderId}...`);
    // Implementation for order tracking
}

function viewOrder(orderId) {
    alert(`Viewing details for order ${orderId}...`);
    // Implementation for viewing order details
}

function restockItem(itemId) {
    if (confirm(`Do you want to restock ${itemId}?`)) {
        alert(`Restock request sent for ${itemId}`);
        // Implementation for restocking
        loadLowStockAlerts(); // Refresh the alerts
    }
}

function showNotifications() {
    alert('Showing all notifications...');
    // Implementation for notifications view
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

// Utility functions
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Auto-refresh dashboard data every 30 seconds
setInterval(updateSummaryCards, 30000);
