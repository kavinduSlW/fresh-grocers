// Reports functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkAuth();
    
    // Initialize reports
    initializeReports();
    
    // Setup sidebar toggle
    setupSidebarToggle();
    
    // Update user info
    updateUserInfo();
    
    // Initialize charts
    initializeCharts();
});

let salesChart = null;
let categoryChart = null;

function checkAuth() {
    if (localStorage.getItem('userLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }
}

function initializeReports() {
    // Setup filter controls
    setupFilterControls();
    
    // Load report data
    loadReportData();
    
    // Setup chart toggles
    setupChartToggles();
}

function setupFilterControls() {
    const dateRange = document.getElementById('dateRange');
    const categoryFilter = document.getElementById('categoryFilter');
    
    dateRange.addEventListener('change', updateReports);
    categoryFilter.addEventListener('change', updateReports);
}

function updateReports() {
    loadReportData();
    updateCharts();
}

function loadReportData() {
    // Generate sample data based on current filters
    const dateRange = document.getElementById('dateRange').value;
    const category = document.getElementById('categoryFilter').value;
    
    // Update summary stats
    updateSummaryStats(dateRange, category);
    
    // Update top products
    updateTopProducts(category);
    
    // Update low stock alerts
    updateLowStockAlerts();
}

function updateSummaryStats(dateRange, category) {
    // Generate realistic data based on filters
    const baseRevenue = 12450;
    const baseUnits = 1234;
    const baseOrders = 456;
    
    let multiplier = 1;
    switch(dateRange) {
        case '7': multiplier = 0.25; break;
        case '30': multiplier = 1; break;
        case '90': multiplier = 3; break;
        case '365': multiplier = 12; break;
    }
    
    const revenue = Math.floor(baseRevenue * multiplier);
    const units = Math.floor(baseUnits * multiplier);
    const orders = Math.floor(baseOrders * multiplier);
    const avgOrder = (revenue / orders).toFixed(2);
    
    // Update DOM
    document.querySelector('.summary-stats .stat-card:nth-child(1) h3').textContent = `$${revenue.toLocaleString()}`;
    document.querySelector('.summary-stats .stat-card:nth-child(2) h3').textContent = units.toLocaleString();
    document.querySelector('.summary-stats .stat-card:nth-child(3) h3').textContent = orders.toLocaleString();
    document.querySelector('.summary-stats .stat-card:nth-child(4) h3').textContent = `$${avgOrder}`;
    
    // Animate changes
    animateStatCards();
}

function animateStatCards() {
    const statCards = document.querySelectorAll('.summary-stats .stat-card');
    statCards.forEach((card, index) => {
        card.style.transform = 'scale(1.05)';
        card.style.transition = 'transform 0.3s ease';
        
        setTimeout(() => {
            card.style.transform = 'scale(1)';
        }, 150);
    });
}

function updateTopProducts(category) {
    // Sample top products data
    const allProducts = [
        { name: 'Fresh Organic Apples', category: 'Fruits', icon: 'fa-apple-alt', units: 245, revenue: 1225 },
        { name: 'Organic Milk (2% Fat)', category: 'Dairy Products', icon: 'fa-cheese', units: 189, revenue: 945 },
        { name: 'Whole Wheat Bread', category: 'Bakery', icon: 'fa-bread-slice', units: 156, revenue: 468 },
        { name: 'Fresh Carrots', category: 'Vegetables', icon: 'fa-carrot', units: 134, revenue: 402 },
        { name: 'Chicken Breast', category: 'Meat & Poultry', icon: 'fa-drumstick-bite', units: 98, revenue: 882 },
        { name: 'Greek Yogurt', category: 'Dairy Products', icon: 'fa-cheese', units: 87, revenue: 521 },
        { name: 'Fresh Bananas', category: 'Fruits', icon: 'fa-apple-alt', units: 76, revenue: 228 },
        { name: 'Orange Juice', category: 'Beverages', icon: 'fa-glass-whiskey', units: 65, revenue: 259 }
    ];
    
    let filteredProducts = allProducts;
    if (category) {
        filteredProducts = allProducts.filter(p => p.category.toLowerCase().includes(category));
    }
    
    const topProducts = filteredProducts.slice(0, 4);
    const productsList = document.querySelector('.products-list');
    
    productsList.innerHTML = '';
    
    topProducts.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'product-item';
        productItem.innerHTML = `
            <div class="product-info">
                <div class="product-image">
                    <i class="fas ${product.icon}"></i>
                </div>
                <div class="product-details">
                    <h4>${product.name}</h4>
                    <p>${product.category}</p>
                </div>
            </div>
            <div class="product-stats">
                <span class="units-sold">${product.units} units</span>
                <span class="revenue">$${product.revenue}</span>
            </div>
        `;
        
        productsList.appendChild(productItem);
    });
}

function updateLowStockAlerts() {
    // Get actual low stock items from inventory
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const lowStockItems = products.filter(p => p.quantity <= 20 && p.quantity > 0);
    
    // Add some sample items if none exist
    if (lowStockItems.length === 0) {
        lowStockItems.push(
            { name: 'Organic Milk (2% Fat)', quantity: 5, reorderThreshold: 10 },
            { name: 'Fresh Bananas', quantity: 8, reorderThreshold: 15 },
            { name: 'Chicken Breast', quantity: 12, reorderThreshold: 20 }
        );
    }
    
    const alertsList = document.querySelector('.alerts-list');
    alertsList.innerHTML = '';
    
    lowStockItems.slice(0, 3).forEach(item => {
        const alertType = item.quantity <= 5 ? 'critical' : 'warning';
        const alertItem = document.createElement('div');
        alertItem.className = `alert-item ${alertType}`;
        alertItem.innerHTML = `
            <div class="alert-icon">
                <i class="fas ${alertType === 'critical' ? 'fa-exclamation-triangle' : 'fa-exclamation-circle'}"></i>
            </div>
            <div class="alert-info">
                <h4>${item.name}</h4>
                <p><strong>${item.quantity} units left</strong> - Reorder threshold: ${item.reorderThreshold || 10} units</p>
            </div>
            <div class="alert-actions">
                <button class="btn-primary btn-sm" onclick="reorderProduct('${item.name}')">Reorder</button>
            </div>
        `;
        
        alertsList.appendChild(alertItem);
    });
}

function reorderProduct(productName) {
    // Show reorder confirmation
    if (confirm(`Reorder ${productName}?`)) {
        // In a real app, this would trigger a reorder process
        showNotification(`Reorder request submitted for ${productName}`, 'success');
    }
}

function initializeCharts() {
    initializeSalesChart();
    initializeCategoryChart();
}

function initializeSalesChart() {
    const ctx = document.getElementById('salesChart').getContext('2d');
    
    const salesData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [{
            label: 'Revenue ($)',
            data: [3200, 3800, 4200, 3900, 4600, 5100, 4800],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
        }]
    };
    
    salesChart = new Chart(ctx, {
        type: 'line',
        data: salesData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#e5e7eb'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                },
                x: {
                    grid: {
                        color: '#e5e7eb'
                    }
                }
            },
            elements: {
                point: {
                    radius: 6,
                    hoverRadius: 8
                }
            }
        }
    });
}

function initializeCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    const categoryData = {
        labels: ['Fruits', 'Vegetables', 'Dairy', 'Meat', 'Bakery', 'Beverages'],
        datasets: [{
            data: [25, 20, 18, 15, 12, 10],
            backgroundColor: [
                '#10b981',
                '#3b82f6',
                '#f59e0b',
                '#ef4444',
                '#8b5cf6',
                '#06b6d4'
            ],
            borderWidth: 0
        }]
    };
    
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: categoryData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            },
            cutout: '70%'
        }
    });
}

function setupChartToggles() {
    const chartToggles = document.querySelectorAll('.chart-toggle');
    
    chartToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            // Remove active class from all toggles
            chartToggles.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked toggle
            this.classList.add('active');
            
            // Update chart based on selection
            const chartType = this.dataset.chart;
            updateSalesChart(chartType);
        });
    });
}

function updateSalesChart(type) {
    if (!salesChart) return;
    
    let newData, label, color;
    
    if (type === 'revenue') {
        newData = [3200, 3800, 4200, 3900, 4600, 5100, 4800];
        label = 'Revenue ($)';
        color = '#10b981';
    } else {
        newData = [320, 380, 420, 390, 460, 510, 480];
        label = 'Units Sold';
        color = '#3b82f6';
    }
    
    salesChart.data.datasets[0].data = newData;
    salesChart.data.datasets[0].label = label;
    salesChart.data.datasets[0].borderColor = color;
    salesChart.data.datasets[0].backgroundColor = color + '20';
    
    salesChart.update('active');
}

function updateCharts() {
    if (salesChart) {
        salesChart.update();
    }
    if (categoryChart) {
        categoryChart.update();
    }
}

function generateReport() {
    const dateRange = document.getElementById('dateRange').value;
    const category = document.getElementById('categoryFilter').value;
    
    // Show loading state
    const generateBtn = document.querySelector('.reports-controls .btn-primary');
    const originalText = generateBtn.innerHTML;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    generateBtn.disabled = true;
    
    // Simulate report generation
    setTimeout(() => {
        updateReports();
        
        // Reset button
        generateBtn.innerHTML = originalText;
        generateBtn.disabled = false;
        
        // Show success message
        showNotification('Report generated successfully!', 'success');
    }, 2000);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    const bgColor = type === 'success' ? 'var(--success-color)' : 'var(--info-color)';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function setupSidebarToggle() {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });
        
        // Close sidebar when clicking outside
        document.addEventListener('click', function(e) {
            if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                sidebar.classList.remove('show');
            }
        });
    }
}

function updateUserInfo() {
    const username = localStorage.getItem('username') || 'Admin';
    const userInfoElements = document.querySelectorAll('.user-info span');
    
    userInfoElements.forEach(element => {
        element.textContent = `Welcome, ${username}`;
    });
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('userLoggedIn');
        localStorage.removeItem('username');
        window.location.href = 'index.html';
    }
}
