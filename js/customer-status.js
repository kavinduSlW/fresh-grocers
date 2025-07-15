// Fresh Grocers Customer Status JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated as customer
    checkCustomerAuth();
    
    // Load orders
    loadOrders();
    
    // Setup mobile menu
    setupMobileMenu();
});

// Global variables
let orders = [];
let filteredOrders = [];

function checkCustomerAuth() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    const user = JSON.parse(currentUser);
    if (user.userType !== 'customer') {
        alert('Access denied. Customer account required.');
        window.location.href = 'login.html';
        return;
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

function loadOrders() {
    // Get orders from localStorage
    orders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    
    // Sort orders by date (newest first)
    orders.sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));
    
    // Update order statuses (simulate real-time updates)
    updateOrderStatuses();
    
    // Display orders
    filteredOrders = orders;
    displayOrders();
}

function updateOrderStatuses() {
    const now = new Date();
    
    orders.forEach(order => {
        const orderTime = new Date(order.orderTime);
        const timeDiff = (now - orderTime) / (1000 * 60); // minutes
        
        if (timeDiff < 5) {
            order.status = 'pending';
            order.statusText = 'Order Received';
            order.statusColor = '#f59e0b';
            order.statusIcon = 'fa-clock';
        } else if (timeDiff < 15) {
            order.status = 'confirmed';
            order.statusText = 'Confirmed & Preparing';
            order.statusColor = '#3b82f6';
            order.statusIcon = 'fa-check-circle';
        } else if (timeDiff < 45) {
            order.status = 'in_transit';
            order.statusText = 'Out for Delivery';
            order.statusColor = '#8b5cf6';
            order.statusIcon = 'fa-truck';
        } else {
            order.status = 'delivered';
            order.statusText = 'Delivered';
            order.statusColor = '#10b981';
            order.statusIcon = 'fa-check-double';
        }
        
        // Update estimated delivery time
        if (order.status !== 'delivered') {
            const estimatedTime = new Date(orderTime.getTime() + 45 * 60 * 1000);
            order.estimatedDelivery = estimatedTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        } else {
            order.deliveredTime = new Date(orderTime.getTime() + 45 * 60 * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }
    });
    
    // Save updated orders
    localStorage.setItem('customerOrders', JSON.stringify(orders));
}

function displayOrders() {
    const ordersList = document.getElementById('ordersList');
    const ordersCount = document.getElementById('ordersCount');
    
    if (filteredOrders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-orders">
                <i class="fas fa-shopping-bag"></i>
                <h3>No Orders Found</h3>
                <p>You haven't placed any orders yet.</p>
                <a href="customer-order.html" class="btn-primary">
                    <i class="fas fa-plus"></i>
                    Place Your First Order
                </a>
            </div>
        `;
        ordersCount.textContent = '0 orders';
        return;
    }
    
    ordersList.innerHTML = filteredOrders.map(order => `
        <div class="order-card" data-status="${order.status}">
            <div class="order-header">
                <div class="order-id-section">
                    <h3>Order #${order.id}</h3>
                    <span class="order-date">${new Date(order.orderTime).toLocaleDateString()} at ${new Date(order.orderTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div class="order-status">
                    <span class="status-badge" style="background: ${order.statusColor}">
                        <i class="fas ${order.statusIcon}"></i>
                        ${order.statusText}
                    </span>
                </div>
            </div>
            
            <div class="order-body">
                <div class="order-items">
                    <h4>Items (${order.items.length})</h4>
                    <div class="items-preview">
                        ${order.items.slice(0, 3).map(item => `
                            <div class="item-preview">
                                <span class="item-emoji">${item.emoji}</span>
                                <span class="item-name">${item.name}</span>
                                <span class="item-qty">x${item.quantity}</span>
                            </div>
                        `).join('')}
                        ${order.items.length > 3 ? `<div class="more-items">+${order.items.length - 3} more items</div>` : ''}
                    </div>
                </div>
                
                <div class="order-details">
                    <div class="detail-row">
                        <span class="detail-label">Total Amount:</span>
                        <span class="detail-value">$${order.total.toFixed(2)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Delivery Agent:</span>
                        <span class="detail-value">${order.agentName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">${order.status === 'delivered' ? 'Delivered at:' : 'Estimated Delivery:'}</span>
                        <span class="detail-value">${order.status === 'delivered' ? order.deliveredTime : order.estimatedDelivery}</span>
                    </div>
                </div>
            </div>
            
            <div class="order-actions">
                <button class="btn-outline" onclick="showOrderDetails('${order.id}')">
                    <i class="fas fa-eye"></i>
                    View Details
                </button>
                ${order.status !== 'delivered' ? `
                    <button class="btn-primary" onclick="trackOrder('${order.id}')">
                        <i class="fas fa-map-marker-alt"></i>
                        Track Order
                    </button>
                ` : `
                    <button class="btn-success" onclick="showOrderDetails('${order.id}')">
                        <i class="fas fa-receipt"></i>
                        View Receipt
                    </button>
                `}
                ${order.status === 'delivered' ? `
                    <button class="btn-secondary" onclick="reorderItems('${order.id}')">
                        <i class="fas fa-redo"></i>
                        Reorder
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
    
    ordersCount.textContent = `${filteredOrders.length} order${filteredOrders.length !== 1 ? 's' : ''}`;
}

function filterOrders(status) {
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filter orders
    if (status === 'all') {
        filteredOrders = orders;
    } else {
        filteredOrders = orders.filter(order => order.status === status);
    }
    
    displayOrders();
}

function searchOrders() {
    const searchTerm = document.getElementById('orderSearch').value.toLowerCase();
    
    if (searchTerm === '') {
        filteredOrders = orders;
    } else {
        filteredOrders = orders.filter(order => 
            order.id.toLowerCase().includes(searchTerm) ||
            order.items.some(item => item.name.toLowerCase().includes(searchTerm)) ||
            order.agentName.toLowerCase().includes(searchTerm)
        );
    }
    
    displayOrders();
}

function showOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const content = `
        <div class="order-details-content">
            <div class="order-summary">
                <h3>Order Summary</h3>
                <div class="summary-row">
                    <span>Order ID:</span>
                    <span>${order.id}</span>
                </div>
                <div class="summary-row">
                    <span>Order Date:</span>
                    <span>${new Date(order.orderTime).toLocaleString()}</span>
                </div>
                <div class="summary-row">
                    <span>Status:</span>
                    <span class="status-badge" style="background: ${order.statusColor}">
                        <i class="fas ${order.statusIcon}"></i>
                        ${order.statusText}
                    </span>
                </div>
                <div class="summary-row">
                    <span>Delivery Agent:</span>
                    <span>${order.agentName}</span>
                </div>
                <div class="summary-row">
                    <span>Delivery Address:</span>
                    <span>${order.deliveryAddress}</span>
                </div>
                ${order.deliveryNotes ? `
                    <div class="summary-row">
                        <span>Special Instructions:</span>
                        <span>${order.deliveryNotes}</span>
                    </div>
                ` : ''}
            </div>
            
            <div class="order-items-details">
                <h3>Items Ordered</h3>
                <div class="items-table">
                    ${order.items.map(item => `
                        <div class="item-row">
                            <div class="item-info">
                                <span class="item-emoji">${item.emoji}</span>
                                <span class="item-name">${item.name}</span>
                            </div>
                            <div class="item-price">$${item.price.toFixed(2)}</div>
                            <div class="item-quantity">x${item.quantity}</div>
                            <div class="item-total">$${(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="order-billing">
                <h3>Billing Details</h3>
                <div class="billing-row">
                    <span>Subtotal:</span>
                    <span>$${order.subtotal.toFixed(2)}</span>
                </div>
                <div class="billing-row">
                    <span>Delivery Fee:</span>
                    <span>$${order.deliveryFee.toFixed(2)}</span>
                </div>
                <div class="billing-row total">
                    <span>Total Amount:</span>
                    <span>$${order.total.toFixed(2)}</span>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('orderDetailsContent').innerHTML = content;
    document.getElementById('orderDetailsModal').style.display = 'block';
}

function trackOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const trackingSteps = [
        { 
            status: 'pending', 
            title: 'Order Received', 
            description: 'Your order has been received and is being processed',
            completed: true,
            time: new Date(order.orderTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        },
        { 
            status: 'confirmed', 
            title: 'Order Confirmed', 
            description: 'Your order has been confirmed and items are being prepared',
            completed: ['confirmed', 'in_transit', 'delivered'].includes(order.status),
            time: ['confirmed', 'in_transit', 'delivered'].includes(order.status) ? 
                new Date(new Date(order.orderTime).getTime() + 5 * 60 * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''
        },
        { 
            status: 'in_transit', 
            title: 'Out for Delivery', 
            description: `${order.agentName} is on the way to deliver your order`,
            completed: ['in_transit', 'delivered'].includes(order.status),
            time: ['in_transit', 'delivered'].includes(order.status) ? 
                new Date(new Date(order.orderTime).getTime() + 15 * 60 * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''
        },
        { 
            status: 'delivered', 
            title: 'Delivered', 
            description: 'Your order has been successfully delivered',
            completed: order.status === 'delivered',
            time: order.status === 'delivered' ? order.deliveredTime : ''
        }
    ];
    
    const content = `
        <div class="tracking-content">
            <div class="tracking-header">
                <h3>Order #${order.id}</h3>
                <p>Track your order in real-time</p>
            </div>
            
            <div class="tracking-timeline">
                ${trackingSteps.map((step, index) => `
                    <div class="timeline-step ${step.completed ? 'completed' : ''} ${order.status === step.status ? 'current' : ''}">
                        <div class="step-indicator">
                            <i class="fas ${step.completed ? 'fa-check' : 'fa-circle'}"></i>
                        </div>
                        <div class="step-content">
                            <h4>${step.title}</h4>
                            <p>${step.description}</p>
                            ${step.time ? `<span class="step-time">${step.time}</span>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="tracking-info">
                <div class="info-card">
                    <i class="fas fa-user"></i>
                    <div>
                        <h4>Delivery Agent</h4>
                        <p>${order.agentName}</p>
                    </div>
                </div>
                <div class="info-card">
                    <i class="fas fa-map-marker-alt"></i>
                    <div>
                        <h4>Delivery Address</h4>
                        <p>${order.deliveryAddress}</p>
                    </div>
                </div>
                <div class="info-card">
                    <i class="fas fa-clock"></i>
                    <div>
                        <h4>Estimated Delivery</h4>
                        <p>${order.status === 'delivered' ? 'Delivered' : order.estimatedDelivery}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('trackOrderContent').innerHTML = content;
    document.getElementById('trackOrderModal').style.display = 'block';
}

function reorderItems(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    // Clear current cart and add items from this order
    localStorage.setItem('customerCart', JSON.stringify(order.items));
    
    showToast('Items added to cart! Redirecting to order page...', 'success');
    
    setTimeout(() => {
        window.location.href = 'customer-order.html';
    }, 1500);
}

function closeOrderDetails() {
    document.getElementById('orderDetailsModal').style.display = 'none';
}

function closeTrackOrder() {
    document.getElementById('trackOrderModal').style.display = 'none';
}

function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    const colors = {
        success: '#10b981',
        info: '#3b82f6',
        warning: '#f59e0b',
        error: '#ef4444'
    };
    
    const icons = {
        success: 'fa-check-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle',
        error: 'fa-times-circle'
    };
    
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 15px 20px;
        border-radius: 12px;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        animation: slideInRight 0.3s ease;
        max-width: 350px;
        font-weight: 500;
    `;
    
    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 4000);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('customerCart');
        window.location.href = 'login.html';
    }
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const orderModal = document.getElementById('orderDetailsModal');
    const trackModal = document.getElementById('trackOrderModal');
    
    if (event.target === orderModal) {
        closeOrderDetails();
    }
    if (event.target === trackModal) {
        closeTrackOrder();
    }
});

// Add CSS for order status page
const style = document.createElement('style');
style.textContent = `
    .status-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    }
    
    .search-section {
        background: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        margin-bottom: 24px;
    }
    
    .search-bar {
        position: relative;
        margin-bottom: 20px;
    }
    
    .search-bar input {
        width: 100%;
        padding: 15px 50px 15px 20px;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        font-size: 16px;
        transition: border-color 0.3s ease;
    }
    
    .search-bar input:focus {
        outline: none;
        border-color: #10b981;
    }
    
    .search-bar i {
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        color: #9ca3af;
    }
    
    .filter-buttons {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
    }
    
    .filter-btn {
        padding: 10px 20px;
        border: 2px solid #e5e7eb;
        background: white;
        color: #6b7280;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 500;
    }
    
    .filter-btn.active,
    .filter-btn:hover {
        border-color: #10b981;
        background: #10b981;
        color: white;
    }
    
    .orders-section {
        background: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .orders-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .orders-count {
        color: #6b7280;
        font-weight: 500;
    }
    
    .order-card {
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 20px;
        transition: all 0.3s ease;
    }
    
    .order-card:hover {
        border-color: #10b981;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }
    
    .order-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;
    }
    
    .order-id-section h3 {
        font-size: 20px;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 4px;
    }
    
    .order-date {
        color: #6b7280;
        font-size: 14px;
    }
    
    .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        font-size: 14px;
    }
    
    .order-body {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        margin-bottom: 20px;
    }
    
    .order-items h4,
    .order-details h4 {
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 12px;
    }
    
    .items-preview {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .item-preview {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px;
        background: #f9fafb;
        border-radius: 6px;
    }
    
    .item-emoji {
        font-size: 20px;
    }
    
    .item-name {
        flex: 1;
        font-weight: 500;
    }
    
    .item-qty {
        color: #6b7280;
        font-size: 14px;
    }
    
    .more-items {
        color: #10b981;
        font-weight: 500;
        font-size: 14px;
        text-align: center;
        padding: 4px;
    }
    
    .detail-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
    }
    
    .detail-label {
        color: #6b7280;
    }
    
    .detail-value {
        font-weight: 600;
        color: #1f2937;
    }
    
    .order-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
    }
    
    .btn-outline {
        padding: 10px 20px;
        border: 2px solid #e5e7eb;
        background: white;
        color: #6b7280;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 6px;
        text-decoration: none;
    }
    
    .btn-outline:hover {
        border-color: #10b981;
        color: #10b981;
    }
    
    .btn-primary {
        padding: 10px 20px;
        background: #10b981;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 6px;
        text-decoration: none;
    }
    
    .btn-primary:hover {
        background: #059669;
    }
    
    .btn-success {
        padding: 10px 20px;
        background: #059669;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 6px;
        text-decoration: none;
    }
    
    .btn-success:hover {
        background: #047857;
    }
    
    .btn-secondary {
        padding: 10px 20px;
        background: #6b7280;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 6px;
        text-decoration: none;
    }
    
    .btn-secondary:hover {
        background: #4b5563;
    }
    
    .empty-orders {
        text-align: center;
        padding: 60px 20px;
        color: #6b7280;
    }
    
    .empty-orders i {
        font-size: 64px;
        margin-bottom: 20px;
        color: #d1d5db;
    }
    
    .empty-orders h3 {
        font-size: 24px;
        margin-bottom: 12px;
        color: #1f2937;
    }
    
    .empty-orders p {
        font-size: 16px;
        margin-bottom: 24px;
    }
    
    /* Modal Styles */
    .modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
    }
    
    .modal-content {
        background-color: white;
        margin: 5% auto;
        padding: 0;
        border-radius: 12px;
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
    }
    
    .modal-content.large {
        max-width: 800px;
    }
    
    .modal-header {
        padding: 24px 24px 0 24px;
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
    }
    
    .modal-header i {
        font-size: 24px;
        color: #10b981;
    }
    
    .modal-header h2 {
        font-size: 24px;
        font-weight: 700;
        color: #1f2937;
    }
    
    .modal-body {
        padding: 0 24px 24px 24px;
    }
    
    .close {
        position: absolute;
        right: 20px;
        top: 20px;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
        color: #6b7280;
    }
    
    .close:hover {
        color: #1f2937;
    }
    
    /* Order Details Styles */
    .order-details-content {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }
    
    .order-summary,
    .order-items-details,
    .order-billing {
        padding: 20px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
    }
    
    .summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        align-items: center;
    }
    
    .items-table {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    
    .item-row {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr;
        gap: 12px;
        align-items: center;
        padding: 12px;
        background: #f9fafb;
        border-radius: 6px;
    }
    
    .item-info {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .billing-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
    }
    
    .billing-row.total {
        border-top: 1px solid #e5e7eb;
        padding-top: 8px;
        font-weight: 700;
        font-size: 18px;
        color: #10b981;
    }
    
    /* Tracking Styles */
    .tracking-content {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }
    
    .tracking-header {
        text-align: center;
    }
    
    .tracking-header h3 {
        font-size: 20px;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 4px;
    }
    
    .tracking-timeline {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    
    .timeline-step {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        position: relative;
    }
    
    .timeline-step:not(:last-child)::after {
        content: '';
        position: absolute;
        left: 15px;
        top: 40px;
        bottom: -20px;
        width: 2px;
        background: #e5e7eb;
    }
    
    .timeline-step.completed::after {
        background: #10b981;
    }
    
    .step-indicator {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #e5e7eb;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 14px;
        position: relative;
        z-index: 1;
    }
    
    .timeline-step.completed .step-indicator {
        background: #10b981;
    }
    
    .timeline-step.current .step-indicator {
        background: #3b82f6;
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
        100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
    }
    
    .step-content h4 {
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 4px;
    }
    
    .step-content p {
        color: #6b7280;
        margin-bottom: 4px;
    }
    
    .step-time {
        font-size: 12px;
        color: #10b981;
        font-weight: 500;
    }
    
    .tracking-info {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
    }
    
    .info-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: #f9fafb;
        border-radius: 8px;
    }
    
    .info-card i {
        font-size: 20px;
        color: #10b981;
    }
    
    .info-card h4 {
        font-size: 14px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 2px;
    }
    
    .info-card p {
        font-size: 14px;
        color: #6b7280;
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @media (max-width: 768px) {
        .filter-buttons {
            gap: 8px;
        }
        
        .filter-btn {
            padding: 8px 16px;
            font-size: 14px;
        }
        
        .order-body {
            grid-template-columns: 1fr;
            gap: 16px;
        }
        
        .order-actions {
            flex-direction: column;
        }
        
        .item-row {
            grid-template-columns: 2fr 1fr;
            gap: 8px;
        }
        
        .tracking-info {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(style);
