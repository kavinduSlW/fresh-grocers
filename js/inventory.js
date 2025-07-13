// Inventory management functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkAuth();
    
    // Initialize inventory
    initializeInventory();
    
    // Setup sidebar toggle
    setupSidebarToggle();
    
    // Update user info
    updateUserInfo();
    
    // Load sample data if none exists
    loadSampleData();
});

let currentProducts = [];
let filteredProducts = [];

function checkAuth() {
    if (localStorage.getItem('userLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }
}

function initializeInventory() {
    // Load products from localStorage
    loadProducts();
    
    // Setup search functionality
    setupSearch();
    
    // Setup filters
    setupFilters();
    
    // Render initial table
    renderInventoryTable();
}

function loadProducts() {
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
        currentProducts = JSON.parse(storedProducts);
    } else {
        currentProducts = getSampleProducts();
        localStorage.setItem('products', JSON.stringify(currentProducts));
    }
    filteredProducts = [...currentProducts];
}

function getSampleProducts() {
    return [
        {
            id: 1,
            name: "Fresh Organic Apples",
            category: "fruits",
            sku: "FRU-APP-001",
            quantity: 45,
            price: 2.99,
            supplier: "Green Valley Farms",
            dateAdded: "2024-01-15"
        },
        {
            id: 2,
            name: "Organic Milk (2% Fat)",
            category: "dairy",
            sku: "DAI-MIL-002",
            quantity: 8,
            price: 4.99,
            supplier: "Sunshine Dairy",
            dateAdded: "2024-01-14"
        },
        {
            id: 3,
            name: "Whole Wheat Bread",
            category: "bakery",
            sku: "BAK-BRE-003",
            quantity: 25,
            price: 3.49,
            supplier: "Local Bakery",
            dateAdded: "2024-01-13"
        },
        {
            id: 4,
            name: "Fresh Carrots",
            category: "vegetables",
            sku: "VEG-CAR-004",
            quantity: 60,
            price: 1.99,
            supplier: "Garden Fresh",
            dateAdded: "2024-01-12"
        },
        {
            id: 5,
            name: "Chicken Breast",
            category: "meat",
            sku: "MEA-CHI-005",
            quantity: 15,
            price: 8.99,
            supplier: "Premium Meats",
            dateAdded: "2024-01-11"
        },
        {
            id: 6,
            name: "Fresh Bananas",
            category: "fruits",
            sku: "FRU-BAN-006",
            quantity: 12,
            price: 1.49,
            supplier: "Tropical Imports",
            dateAdded: "2024-01-10"
        },
        {
            id: 7,
            name: "Greek Yogurt",
            category: "dairy",
            sku: "DAI-YOG-007",
            quantity: 30,
            price: 5.99,
            supplier: "Mediterranean Dairy",
            dateAdded: "2024-01-09"
        },
        {
            id: 8,
            name: "Fresh Salmon Fillet",
            category: "seafood",
            sku: "SEA-SAL-008",
            quantity: 6,
            price: 12.99,
            supplier: "Ocean Fresh",
            dateAdded: "2024-01-08"
        },
        {
            id: 9,
            name: "Orange Juice",
            category: "beverages",
            sku: "BEV-ORA-009",
            quantity: 22,
            price: 3.99,
            supplier: "Citrus Co.",
            dateAdded: "2024-01-07"
        },
        {
            id: 10,
            name: "Mixed Nuts",
            category: "snacks",
            sku: "SNA-NUT-010",
            quantity: 18,
            price: 7.99,
            supplier: "Nut Paradise",
            dateAdded: "2024-01-06"
        }
    ];
}

function loadSampleData() {
    if (!localStorage.getItem('products')) {
        const sampleProducts = getSampleProducts();
        localStorage.setItem('products', JSON.stringify(sampleProducts));
        currentProducts = sampleProducts;
        filteredProducts = [...currentProducts];
        renderInventoryTable();
    }
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearch');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        if (searchTerm) {
            clearSearchBtn.style.display = 'block';
            filterProducts();
        } else {
            clearSearchBtn.style.display = 'none';
            filteredProducts = [...currentProducts];
            renderInventoryTable();
        }
    });
    
    clearSearchBtn.addEventListener('click', function() {
        searchInput.value = '';
        this.style.display = 'none';
        filteredProducts = [...currentProducts];
        renderInventoryTable();
    });
}

function setupFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const stockFilter = document.getElementById('stockFilter');
    
    categoryFilter.addEventListener('change', filterProducts);
    stockFilter.addEventListener('change', filterProducts);
}

function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const stockFilter = document.getElementById('stockFilter').value;
    
    filteredProducts = currentProducts.filter(product => {
        // Search filter
        const matchesSearch = !searchTerm || 
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm) ||
            product.sku.toLowerCase().includes(searchTerm);
        
        // Category filter
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        
        // Stock filter
        let matchesStock = true;
        if (stockFilter === 'in-stock') {
            matchesStock = product.quantity > 20;
        } else if (stockFilter === 'low-stock') {
            matchesStock = product.quantity > 0 && product.quantity <= 20;
        } else if (stockFilter === 'out-of-stock') {
            matchesStock = product.quantity === 0;
        }
        
        return matchesSearch && matchesCategory && matchesStock;
    });
    
    renderInventoryTable();
}

function renderInventoryTable() {
    const tableBody = document.getElementById('inventoryTableBody');
    const resultsCount = document.getElementById('resultsCount');
    const noResults = document.getElementById('noResults');
    const tableContainer = document.querySelector('.table-container');
    
    if (filteredProducts.length === 0) {
        tableContainer.style.display = 'none';
        noResults.style.display = 'block';
        resultsCount.textContent = 'No products found';
        return;
    }
    
    tableContainer.style.display = 'block';
    noResults.style.display = 'none';
    resultsCount.textContent = `Showing ${filteredProducts.length} of ${currentProducts.length} products`;
    
    tableBody.innerHTML = '';
    
    filteredProducts.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="product-image-cell">
                    <i class="fas fa-image"></i>
                </div>
            </td>
            <td>
                <strong>${product.name}</strong>
            </td>
            <td>
                <span class="category-badge">${formatCategory(product.category)}</span>
            </td>
            <td>${product.sku}</td>
            <td>${product.quantity}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>
                <span class="status-badge ${getStockStatus(product.quantity)}">${getStockStatusText(product.quantity)}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="editProduct(${product.id})" title="Edit Product">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="confirmDeleteProduct(${product.id})" title="Delete Product">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

function formatCategory(category) {
    return category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1');
}

function getStockStatus(quantity) {
    if (quantity === 0) return 'out-of-stock';
    if (quantity <= 10) return 'low-stock';
    return 'in-stock';
}

function getStockStatusText(quantity) {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= 10) return 'Low Stock';
    return 'In Stock';
}

// Modal functionality
let currentEditingId = null;

function editProduct(id) {
    const product = currentProducts.find(p => p.id === id);
    if (!product) return;
    
    currentEditingId = id;
    
    // Populate form
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editCategory').value = product.category;
    document.getElementById('editQuantity').value = product.quantity;
    document.getElementById('editPrice').value = product.price;
    
    // Show modal
    showModal('editModal');
}

function confirmDeleteProduct(id) {
    const product = currentProducts.find(p => p.id === id);
    if (!product) return;
    
    currentEditingId = id;
    document.getElementById('deleteProductName').textContent = product.name;
    
    showModal('deleteModal');
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('show');
    modal.style.display = 'flex';
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    modal.style.display = 'none';
    
    // Restore body scrolling
    document.body.style.overflow = 'auto';
    
    currentEditingId = null;
}

function closeEditModal() {
    closeModal('editModal');
}

function closeDeleteModal() {
    closeModal('deleteModal');
}

function saveProductChanges() {
    if (!currentEditingId) return;
    
    const productIndex = currentProducts.findIndex(p => p.id === currentEditingId);
    if (productIndex === -1) return;
    
    // Get form data
    const name = document.getElementById('editProductName').value.trim();
    const category = document.getElementById('editCategory').value;
    const quantity = parseInt(document.getElementById('editQuantity').value);
    const price = parseFloat(document.getElementById('editPrice').value);
    
    // Validate
    if (!name || !category || quantity < 0 || price <= 0) {
        alert('Please fill in all required fields with valid values');
        return;
    }
    
    // Update product
    currentProducts[productIndex] = {
        ...currentProducts[productIndex],
        name,
        category,
        quantity,
        price
    };
    
    // Save to localStorage
    localStorage.setItem('products', JSON.stringify(currentProducts));
    
    // Update filtered products
    filterProducts();
    
    // Close modal
    closeEditModal();
    
    // Show success message
    showNotification('Product updated successfully!', 'success');
}

function confirmDelete() {
    if (!currentEditingId) return;
    
    const productIndex = currentProducts.findIndex(p => p.id === currentEditingId);
    if (productIndex === -1) return;
    
    // Remove product
    currentProducts.splice(productIndex, 1);
    
    // Save to localStorage
    localStorage.setItem('products', JSON.stringify(currentProducts));
    
    // Update filtered products
    filterProducts();
    
    // Close modal
    closeDeleteModal();
    
    // Show success message
    showNotification('Product deleted successfully!', 'success');
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

function addNewProduct() {
    window.location.href = 'add-product.html';
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

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        const modalId = e.target.id;
        closeModal(modalId);
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
            closeModal(openModal.id);
        }
    }
});
