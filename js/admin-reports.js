// Fresh Grocers Admin Reports JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkAdminAuth();
    
    // Initialize reports page
    initializeReports();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Set default date range
    setDefaultDateRange();
});

// Global variables
let reportsData = {
    sales: [],
    inventory: [],
    customers: [],
    deliveries: []
};
let currentChart = null;

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

function initializeReports() {
    generateMockData();
    updateMetrics();
    initializeSalesChart();
    updateCategoryStats();
    showReport('sales');
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

function setDefaultDateRange() {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    document.getElementById('startDate').value = thirtyDaysAgo.toISOString().split('T')[0];
    document.getElementById('endDate').value = today.toISOString().split('T')[0];
}

function generateMockData() {
    // Generate mock sales data
    reportsData.sales = [];
    for (let i = 0; i < 50; i++) {
        const date = new Date(Date.now() - (i * 24 * 60 * 60 * 1000));
        reportsData.sales.push({
            id: `ORD-${1000 + i}`,
            date: date.toISOString(),
            customer: `Customer ${i + 1}`,
            items: Math.floor(Math.random() * 8) + 1,
            total: (Math.random() * 100 + 20).toFixed(2),
            status: ['completed', 'pending', 'cancelled'][Math.floor(Math.random() * 3)]
        });
    }
    
    // Generate mock inventory data
    const products = JSON.parse(localStorage.getItem('adminProducts') || '[]');
    reportsData.inventory = products.map(product => ({
        ...product,
        soldThisPeriod: Math.floor(Math.random() * 50),
        revenue: (product.price * Math.floor(Math.random() * 50)).toFixed(2)
    }));
    
    // Generate mock customer data
    reportsData.customers = [];
    for (let i = 0; i < 25; i++) {
        reportsData.customers.push({
            id: `CUST-${i + 1}`,
            name: `Customer ${i + 1}`,
            email: `customer${i + 1}@email.com`,
            orders: Math.floor(Math.random() * 10) + 1,
            totalSpent: (Math.random() * 500 + 100).toFixed(2),
            lastOrder: new Date(Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
            status: 'active'
        });
    }
    
    // Generate mock delivery data
    reportsData.deliveries = [];
    for (let i = 0; i < 40; i++) {
        const date = new Date(Date.now() - (i * 24 * 60 * 60 * 1000));
        reportsData.deliveries.push({
            orderId: `ORD-${1000 + i}`,
            date: date.toISOString(),
            agent: ['Mike Davis', 'Lisa Chen', 'John Smith', 'Sarah Wilson'][Math.floor(Math.random() * 4)],
            deliveryTime: Math.floor(Math.random() * 60) + 15,
            status: ['delivered', 'in-transit', 'delayed'][Math.floor(Math.random() * 3)],
            rating: (Math.random() * 2 + 3).toFixed(1)
        });
    }
}

function updateMetrics() {
    const completedSales = reportsData.sales.filter(s => s.status === 'completed');
    const totalRevenue = completedSales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    const totalOrders = reportsData.sales.length;
    const activeCustomers = reportsData.customers.length;
    const averageOrder = totalRevenue / completedSales.length || 0;
    
    document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalCustomers').textContent = activeCustomers;
    document.getElementById('averageOrder').textContent = `$${averageOrder.toFixed(2)}`;
}

function initializeSalesChart() {
    const canvas = document.getElementById('salesChart');
    const ctx = canvas.getContext('2d');
    
    // Simple chart implementation (you could use Chart.js for more advanced charts)
    drawSalesChart(ctx, canvas.width, canvas.height);
}

function drawSalesChart(ctx, width, height) {
    ctx.clearRect(0, 0, width, height);
    
    // Generate sample data for the last 7 days
    const data = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - (i * 24 * 60 * 60 * 1000));
        const sales = reportsData.sales
            .filter(s => new Date(s.date).toDateString() === date.toDateString() && s.status === 'completed')
            .reduce((sum, sale) => sum + parseFloat(sale.total), 0);
        data.push(sales);
    }
    
    const maxValue = Math.max(...data) || 100;
    const padding = 40;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);
    
    // Draw axes
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Draw data line
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    data.forEach((value, index) => {
        const x = padding + (index * chartWidth / (data.length - 1));
        const y = height - padding - (value / maxValue * chartHeight);
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        // Draw data points
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    ctx.stroke();
    
    // Add labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    
    data.forEach((value, index) => {
        const x = padding + (index * chartWidth / (data.length - 1));
        const date = new Date(Date.now() - ((6 - index) * 24 * 60 * 60 * 1000));
        ctx.fillText(date.getDate().toString(), x, height - 10);
    });
}

function updateCategoryStats() {
    const categoryData = {};
    
    reportsData.inventory.forEach(item => {
        if (!categoryData[item.category]) {
            categoryData[item.category] = {
                name: item.category,
                sold: 0,
                revenue: 0
            };
        }
        categoryData[item.category].sold += parseInt(item.soldThisPeriod || 0);
        categoryData[item.category].revenue += parseFloat(item.revenue || 0);
    });
    
    const categories = Object.values(categoryData)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    
    const maxRevenue = Math.max(...categories.map(c => c.revenue));
    
    const categoryStatsHTML = categories.map(category => `
        <div class="category-stat-item">
            <div class="category-info">
                <div class="category-name">${capitalizeFirst(category.name)}</div>
                <div class="category-revenue">$${category.revenue.toFixed(2)}</div>
            </div>
            <div class="category-bar">
                <div class="category-bar-fill" style="width: ${(category.revenue / maxRevenue) * 100}%"></div>
            </div>
            <div class="category-sold">${category.sold} sold</div>
        </div>
    `).join('');
    
    document.getElementById('categoryStats').innerHTML = categoryStatsHTML;
}

function changeSalesChart(period) {
    // Update active filter button
    document.querySelectorAll('.chart-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Redraw chart with new period data
    initializeSalesChart();
}

function showReport(reportType) {
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Hide all report contents
    document.querySelectorAll('.report-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show selected report
    document.getElementById(`${reportType}Report`).classList.add('active');
    
    // Load report data
    switch (reportType) {
        case 'sales':
            loadSalesReport();
            break;
        case 'inventory':
            loadInventoryReport();
            break;
        case 'customer':
            loadCustomerReport();
            break;
        case 'delivery':
            loadDeliveryReport();
            break;
    }
}

function loadSalesReport() {
    const completedSales = reportsData.sales.filter(s => s.status === 'completed');
    const totalSales = completedSales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    const successRate = (completedSales.length / reportsData.sales.length * 100).toFixed(1);
    
    document.getElementById('reportTotalSales').textContent = `$${totalSales.toFixed(2)}`;
    document.getElementById('reportOrdersCompleted').textContent = completedSales.length;
    document.getElementById('reportSuccessRate').textContent = `${successRate}%`;
    
    const tableBody = document.getElementById('salesTableBody');
    tableBody.innerHTML = reportsData.sales.slice(0, 20).map(sale => `
        <tr>
            <td>${formatDate(sale.date)}</td>
            <td>${sale.id}</td>
            <td>${sale.customer}</td>
            <td>${sale.items}</td>
            <td>$${sale.total}</td>
            <td><span class="status-badge ${sale.status}">${capitalizeFirst(sale.status)}</span></td>
        </tr>
    `).join('');
}

function loadInventoryReport() {
    const totalProducts = reportsData.inventory.length;
    const lowStockItems = reportsData.inventory.filter(item => item.stock <= item.lowStockThreshold).length;
    const inventoryValue = reportsData.inventory.reduce((sum, item) => sum + (item.price * item.stock), 0);
    
    document.getElementById('reportTotalProducts').textContent = totalProducts;
    document.getElementById('reportLowStock').textContent = lowStockItems;
    document.getElementById('reportInventoryValue').textContent = `$${inventoryValue.toFixed(2)}`;
    
    const tableBody = document.getElementById('inventoryTableBody');
    tableBody.innerHTML = reportsData.inventory.map(item => `
        <tr>
            <td>
                <div class="product-cell">
                    <span class="product-emoji">${item.emoji || '📦'}</span>
                    <span>${item.name}</span>
                </div>
            </td>
            <td><span class="category-badge ${item.category}">${capitalizeFirst(item.category)}</span></td>
            <td>${item.stock}</td>
            <td>${item.soldThisPeriod || 0}</td>
            <td>$${item.revenue}</td>
            <td><span class="status-badge ${getStockStatus(item).toLowerCase().replace(' ', '-')}">${getStockStatus(item)}</span></td>
        </tr>
    `).join('');
}

function loadCustomerReport() {
    const newCustomers = Math.floor(reportsData.customers.length * 0.3);
    const returningCustomers = reportsData.customers.length - newCustomers;
    const retentionRate = (returningCustomers / reportsData.customers.length * 100).toFixed(1);
    
    document.getElementById('reportNewCustomers').textContent = newCustomers;
    document.getElementById('reportReturningCustomers').textContent = returningCustomers;
    document.getElementById('reportRetentionRate').textContent = `${retentionRate}%`;
    
    const tableBody = document.getElementById('customerTableBody');
    tableBody.innerHTML = reportsData.customers.slice(0, 20).map(customer => `
        <tr>
            <td>${customer.name}</td>
            <td>${customer.email}</td>
            <td>${customer.orders}</td>
            <td>$${customer.totalSpent}</td>
            <td>${formatDate(customer.lastOrder)}</td>
            <td><span class="status-badge ${customer.status}">${capitalizeFirst(customer.status)}</span></td>
        </tr>
    `).join('');
}

function loadDeliveryReport() {
    const onTimeDeliveries = reportsData.deliveries.filter(d => d.status === 'delivered').length;
    const onTimeRate = (onTimeDeliveries / reportsData.deliveries.length * 100).toFixed(1);
    const avgDeliveryTime = (reportsData.deliveries.reduce((sum, d) => sum + d.deliveryTime, 0) / reportsData.deliveries.length).toFixed(0);
    
    document.getElementById('reportOnTimeDeliveries').textContent = `${onTimeRate}%`;
    document.getElementById('reportAvgDeliveryTime').textContent = `${avgDeliveryTime} min`;
    document.getElementById('reportTotalDeliveries').textContent = reportsData.deliveries.length;
    
    const tableBody = document.getElementById('deliveryTableBody');
    tableBody.innerHTML = reportsData.deliveries.slice(0, 20).map(delivery => `
        <tr>
            <td>${formatDate(delivery.date)}</td>
            <td>${delivery.orderId}</td>
            <td>${delivery.agent}</td>
            <td>${delivery.deliveryTime} min</td>
            <td><span class="status-badge ${delivery.status}">${capitalizeFirst(delivery.status)}</span></td>
            <td>⭐ ${delivery.rating}</td>
        </tr>
    `).join('');
}

function applyDateFilter() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) {
        alert('Please select both start and end dates');
        return;
    }
    
    // Filter data based on date range
    // For demo purposes, we'll just regenerate the data
    generateMockData();
    updateMetrics();
    initializeSalesChart();
    updateCategoryStats();
    
    // Refresh current report
    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab) {
        const reportType = activeTab.textContent.toLowerCase().split(' ')[0];
        showReport(reportType);
    }
    
    showToast('Date filter applied successfully!');
}

function exportReports() {
    const reportData = {
        metrics: {
            totalRevenue: document.getElementById('totalRevenue').textContent,
            totalOrders: document.getElementById('totalOrders').textContent,
            totalCustomers: document.getElementById('totalCustomers').textContent,
            averageOrder: document.getElementById('averageOrder').textContent
        },
        exportDate: new Date().toISOString(),
        dateRange: {
            start: document.getElementById('startDate').value,
            end: document.getElementById('endDate').value
        }
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fresh-grocers-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showToast('Report exported successfully!');
}

function getStockStatus(product) {
    if (product.stock === 0) {
        return 'Out of Stock';
    } else if (product.stock <= product.lowStockThreshold) {
        return 'Low Stock';
    } else {
        return 'In Stock';
    }
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
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
    }, 3000);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

// Add CSS for reports-specific styles
const style = document.createElement('style');
style.textContent = `
    .date-range-picker {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-right: 15px;
    }
    
    .date-range-picker input {
        padding: 8px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
    }
    
    .metrics-section {
        margin-bottom: 30px;
    }
    
    .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }
    
    .metric-card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 20px;
    }
    
    .metric-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: white;
    }
    
    .metric-card.revenue .metric-icon { background: linear-gradient(135deg, #10b981, #059669); }
    .metric-card.orders .metric-icon { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
    .metric-card.customers .metric-icon { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
    .metric-card.average-order .metric-icon { background: linear-gradient(135deg, #f59e0b, #d97706); }
    
    .metric-content {
        flex: 1;
    }
    
    .metric-value {
        font-size: 28px;
        font-weight: 700;
        color: #111827;
        margin-bottom: 4px;
    }
    
    .metric-label {
        font-size: 14px;
        color: #6b7280;
        margin-bottom: 8px;
    }
    
    .metric-change {
        font-size: 12px;
        font-weight: 500;
        padding: 2px 6px;
        border-radius: 4px;
    }
    
    .metric-change.positive {
        background: #d1fae5;
        color: #059669;
    }
    
    .charts-section {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 20px;
        margin-bottom: 30px;
    }
    
    .chart-container {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }
    
    .chart-filters {
        display: flex;
        gap: 8px;
    }
    
    .chart-filter-btn {
        padding: 6px 12px;
        border: 1px solid #d1d5db;
        background: white;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .chart-filter-btn.active {
        background: #10b981;
        color: white;
        border-color: #10b981;
    }
    
    .category-stat-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 12px 0;
        border-bottom: 1px solid #f3f4f6;
    }
    
    .category-stat-item:last-child {
        border-bottom: none;
    }
    
    .category-info {
        min-width: 100px;
    }
    
    .category-name {
        font-weight: 500;
        color: #374151;
        font-size: 14px;
    }
    
    .category-revenue {
        font-size: 12px;
        color: #6b7280;
    }
    
    .category-bar {
        flex: 1;
        height: 8px;
        background: #f3f4f6;
        border-radius: 4px;
        overflow: hidden;
    }
    
    .category-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #10b981, #059669);
        transition: width 0.3s ease;
    }
    
    .category-sold {
        font-size: 12px;
        color: #6b7280;
        min-width: 60px;
        text-align: right;
    }
    
    .report-tabs {
        display: flex;
        gap: 8px;
        margin-bottom: 20px;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .tab-btn {
        padding: 12px 20px;
        border: none;
        background: none;
        color: #6b7280;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        transition: all 0.2s;
    }
    
    .tab-btn.active {
        color: #10b981;
        border-bottom-color: #10b981;
    }
    
    .report-content {
        display: none;
    }
    
    .report-content.active {
        display: block;
    }
    
    .report-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;
    }
    
    .report-summary {
        display: flex;
        gap: 30px;
    }
    
    .summary-item {
        text-align: right;
    }
    
    .summary-label {
        display: block;
        font-size: 12px;
        color: #6b7280;
        margin-bottom: 4px;
    }
    
    .summary-value {
        font-size: 18px;
        font-weight: 600;
        color: #111827;
    }
    
    @media (max-width: 768px) {
        .charts-section {
            grid-template-columns: 1fr;
        }
        
        .date-range-picker {
            flex-direction: column;
            align-items: stretch;
        }
        
        .report-summary {
            flex-direction: column;
            gap: 15px;
        }
        
        .summary-item {
            text-align: left;
        }
    }
`;
document.head.appendChild(style);
