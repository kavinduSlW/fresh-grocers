// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkAuth();
    
    // Initialize dashboard
    initializeDashboard();
    
    // Setup sidebar toggle
    setupSidebarToggle();
    
    // Update user info
    updateUserInfo();
    
    // Animate stats on load
    animateStats();
});

function checkAuth() {
    if (localStorage.getItem('userLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }
}

function initializeDashboard() {
    // Update stats with dynamic data
    updateDashboardStats();
    
    // Setup auto-refresh for stats
    setInterval(updateDashboardStats, 30000); // Update every 30 seconds
}

function updateDashboardStats() {
    // Simulate real-time data updates
    const stats = {
        totalProducts: Math.floor(Math.random() * 50) + 200,
        productsSold: Math.floor(Math.random() * 200) + 1000,
        lowStockItems: Math.floor(Math.random() * 20) + 5,
        totalRevenue: (Math.random() * 10000 + 40000).toFixed(0)
    };
    
    // Update DOM elements with animation
    updateStatWithAnimation('totalProducts', stats.totalProducts);
    updateStatWithAnimation('productsSold', stats.productsSold.toLocaleString());
    updateStatWithAnimation('lowStockItems', stats.lowStockItems);
    updateStatWithAnimation('totalRevenue', `$${parseInt(stats.totalRevenue).toLocaleString()}`);
}

function updateStatWithAnimation(elementId, newValue) {
    const element = document.getElementById(elementId);
    if (element) {
        // Add pulse animation
        element.style.transform = 'scale(1.1)';
        element.style.transition = 'transform 0.3s ease';
        
        setTimeout(() => {
            element.textContent = newValue;
            element.style.transform = 'scale(1)';
        }, 150);
    }
}

function animateStats() {
    const statCards = document.querySelectorAll('.stat-card');
    
    statCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
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
    // Show confirmation dialog
    if (confirm('Are you sure you want to logout?')) {
        // Clear session data
        localStorage.removeItem('userLoggedIn');
        localStorage.removeItem('username');
        
        // Redirect to home page
        window.location.href = 'index.html';
    }
}

// Activity simulation
function simulateActivity() {
    const activities = [
        {
            type: 'added',
            icon: 'fas fa-plus',
            message: 'Product Added: Fresh Organic Tomatoes',
            time: 'Just now'
        },
        {
            type: 'sold',
            icon: 'fas fa-shopping-cart',
            message: 'Sale: 25 units of Lettuce sold',
            time: '5 minutes ago'
        },
        {
            type: 'warning',
            icon: 'fas fa-exclamation-triangle',
            message: 'Low Stock Alert: Bread - 3 units left',
            time: '10 minutes ago'
        }
    ];
    
    // Add new activity every 15 seconds
    setInterval(() => {
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        addActivityItem(randomActivity);
    }, 15000);
}

function addActivityItem(activity) {
    const activityList = document.querySelector('.activity-list');
    const newActivity = document.createElement('div');
    newActivity.className = 'activity-item';
    newActivity.style.opacity = '0';
    newActivity.style.transform = 'translateX(-20px)';
    
    newActivity.innerHTML = `
        <div class="activity-icon ${activity.type}">
            <i class="${activity.icon}"></i>
        </div>
        <div class="activity-content">
            <p><strong>${activity.message}</strong></p>
            <span class="activity-time">${activity.time}</span>
        </div>
    `;
    
    // Insert at the beginning
    activityList.insertBefore(newActivity, activityList.firstChild);
    
    // Animate in
    setTimeout(() => {
        newActivity.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        newActivity.style.opacity = '1';
        newActivity.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove excess activities (keep only 5)
    const activities = activityList.querySelectorAll('.activity-item');
    if (activities.length > 5) {
        activities[activities.length - 1].remove();
    }
}

// Start activity simulation
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(simulateActivity, 5000);
});

// Quick action handlers
function navigateToAddProduct() {
    window.location.href = 'add-product.html';
}

function navigateToInventory() {
    window.location.href = 'inventory.html';
}

function navigateToReports() {
    window.location.href = 'reports.html';
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                window.location.href = 'dashboard.html';
                break;
            case '2':
                e.preventDefault();
                window.location.href = 'add-product.html';
                break;
            case '3':
                e.preventDefault();
                window.location.href = 'inventory.html';
                break;
            case '4':
                e.preventDefault();
                window.location.href = 'reports.html';
                break;
        }
    }
});
