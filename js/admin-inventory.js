// Fresh Grocers Admin Inventory JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkAdminAuth();
    
    // Initialize inventory page
    initializeInventory();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Setup form handlers
    setupFormHandlers();
});

// Global variables
let products = [];
let editingProductId = null;

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

function initializeInventory() {
    loadProducts();
    updateInventoryStats();
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
    const productForm = document.getElementById('productForm');
    productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveProduct();
    });
}

function loadProducts() {
    // Load from localStorage or use mock data
    const savedProducts = localStorage.getItem('adminProducts');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    } else {
        // Initialize with mock data
        products = [
            {
                id: 1,
                name: 'Organic Bananas',
                category: 'fruits',
                price: 2.99,
                stock: 45,
                lowStockThreshold: 10,
                emoji: '🍌',
                description: 'Fresh organic bananas from local farms',
                lastUpdated: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Fresh Apples',
                category: 'fruits',
                price: 3.49,
                stock: 8,
                lowStockThreshold: 15,
                emoji: '🍎',
                description: 'Crisp red apples',
                lastUpdated: new Date().toISOString()
            },
            {
                id: 3,
                name: 'Carrots',
                category: 'vegetables',
                price: 1.99,
                stock: 30,
                lowStockThreshold: 10,
                emoji: '🥕',
                description: 'Fresh carrots',
                lastUpdated: new Date().toISOString()
            },
            {
                id: 4,
                name: 'Fresh Milk',
                category: 'dairy',
                price: 4.29,
                stock: 0,
                lowStockThreshold: 5,
                emoji: '🥛',
                description: 'Fresh whole milk',
                lastUpdated: new Date().toISOString()
            },
            {
                id: 5,
                name: 'Whole Wheat Bread',
                category: 'bakery',
                price: 2.49,
                stock: 25,
                lowStockThreshold: 8,
                emoji: '🍞',
                description: 'Freshly baked whole wheat bread',
                lastUpdated: new Date().toISOString()
            }
        ];
        saveProducts();
    }
    
    displayProducts(products);
}

function displayProducts(productsToShow) {
    const tableBody = document.getElementById('inventoryTableBody');
    
    if (productsToShow.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="no-data">
                    <i class="fas fa-box"></i>
                    <p>No products found</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = productsToShow.map(product => {
        const stockStatus = getStockStatus(product);
        const statusClass = stockStatus.toLowerCase().replace(' ', '-');
        
        return `
            <tr>
                <td>
                    <div class="product-cell">
                        <span class="product-emoji">${product.emoji || '📦'}</span>
                        <div class="product-info">
                            <div class="product-name">${product.name}</div>
                            <div class="product-description">${product.description || ''}</div>
                        </div>
                    </div>
                </td>
                <td><span class="category-badge ${product.category}">${capitalizeFirst(product.category)}</span></td>
                <td>$${product.price.toFixed(2)}</td>
                <td>${product.stock}</td>
                <td><span class="status-badge ${statusClass}">${stockStatus}</span></td>
                <td>${formatDate(product.lastUpdated)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="editProduct(${product.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon warning" onclick="adjustStock(${product.id})" title="Adjust Stock">
                            <i class="fas fa-warehouse"></i>
                        </button>
                        <button class="btn-icon danger" onclick="deleteProduct(${product.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function updateInventoryStats() {
    const totalProducts = products.length;
    const lowStockItems = products.filter(p => p.stock <= p.lowStockThreshold && p.stock > 0).length;
    const outOfStockItems = products.filter(p => p.stock === 0).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    
    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('lowStockItems').textContent = lowStockItems;
    document.getElementById('outOfStockItems').textContent = outOfStockItems;
    document.getElementById('totalValue').textContent = `$${totalValue.toFixed(2)}`;
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

function searchProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
    
    applyFilters(filteredProducts);
}

function filterProducts() {
    applyFilters(products);
}

function applyFilters(baseProducts) {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const stockFilter = document.getElementById('stockFilter').value;
    
    let filteredProducts = baseProducts;
    
    if (categoryFilter) {
        filteredProducts = filteredProducts.filter(p => p.category === categoryFilter);
    }
    
    if (stockFilter) {
        switch (stockFilter) {
            case 'in-stock':
                filteredProducts = filteredProducts.filter(p => p.stock > p.lowStockThreshold);
                break;
            case 'low-stock':
                filteredProducts = filteredProducts.filter(p => p.stock <= p.lowStockThreshold && p.stock > 0);
                break;
            case 'out-of-stock':
                filteredProducts = filteredProducts.filter(p => p.stock === 0);
                break;
        }
    }
    
    displayProducts(filteredProducts);
}

function openAddProductModal() {
    editingProductId = null;
    document.getElementById('modalTitle').textContent = 'Add New Product';
    document.getElementById('productForm').reset();
    document.getElementById('productModal').style.display = 'block';
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    editingProductId = productId;
    document.getElementById('modalTitle').textContent = 'Edit Product';
    
    // Populate form
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productEmoji').value = product.emoji || '';
    document.getElementById('lowStockThreshold').value = product.lowStockThreshold;
    document.getElementById('productDescription').value = product.description || '';
    
    document.getElementById('productModal').style.display = 'block';
}

function saveProduct() {
    const formData = {
        name: document.getElementById('productName').value.trim(),
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        emoji: document.getElementById('productEmoji').value.trim(),
        lowStockThreshold: parseInt(document.getElementById('lowStockThreshold').value),
        description: document.getElementById('productDescription').value.trim(),
        lastUpdated: new Date().toISOString()
    };
    
    // Validation
    if (!formData.name || !formData.category || formData.price < 0 || formData.stock < 0) {
        alert('Please fill in all required fields with valid values.');
        return;
    }
    
    if (editingProductId) {
        // Update existing product
        const productIndex = products.findIndex(p => p.id === editingProductId);
        if (productIndex !== -1) {
            products[productIndex] = { ...products[productIndex], ...formData };
        }
    } else {
        // Add new product
        const newProduct = {
            id: Date.now(),
            ...formData
        };
        products.push(newProduct);
    }
    
    saveProducts();
    displayProducts(products);
    updateInventoryStats();
    closeProductModal();
    
    showToast(editingProductId ? 'Product updated successfully!' : 'Product added successfully!');
}

function adjustStock(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const newStock = prompt(`Adjust stock for ${product.name}\nCurrent stock: ${product.stock}`, product.stock);
    
    if (newStock !== null && !isNaN(newStock) && parseInt(newStock) >= 0) {
        product.stock = parseInt(newStock);
        product.lastUpdated = new Date().toISOString();
        
        saveProducts();
        displayProducts(products);
        updateInventoryStats();
        
        showToast('Stock updated successfully!');
    }
}

function deleteProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    document.getElementById('deleteProductName').textContent = product.name;
    window.productToDelete = productId;
    document.getElementById('deleteModal').style.display = 'block';
}

function confirmDelete() {
    if (window.productToDelete) {
        products = products.filter(p => p.id !== window.productToDelete);
        saveProducts();
        displayProducts(products);
        updateInventoryStats();
        closeDeleteModal();
        showToast('Product deleted successfully!');
    }
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
    editingProductId = null;
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    window.productToDelete = null;
}

function exportInventory() {
    const csv = [
        ['Name', 'Category', 'Price', 'Stock', 'Status', 'Last Updated'],
        ...products.map(p => [
            p.name,
            p.category,
            p.price,
            p.stock,
            getStockStatus(p),
            formatDate(p.lastUpdated)
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showToast('Inventory exported successfully!');
}

function saveProducts() {
    localStorage.setItem('adminProducts', JSON.stringify(products));
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

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const productModal = document.getElementById('productModal');
    const deleteModal = document.getElementById('deleteModal');
    
    if (event.target === productModal) {
        closeProductModal();
    }
    if (event.target === deleteModal) {
        closeDeleteModal();
    }
});

// Add CSS for toast notifications and other styles
const style = document.createElement('style');
style.textContent = `
    .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
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
    }
    
    .toast.show {
        opacity: 1;
        transform: translateX(0);
    }
    
    .product-cell {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .product-emoji {
        font-size: 24px;
    }
    
    .product-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    
    .product-name {
        font-weight: 500;
        color: #333;
    }
    
    .product-description {
        font-size: 12px;
        color: #666;
    }
    
    .category-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        text-transform: capitalize;
    }
    
    .category-badge.fruits { background: #fef3c7; color: #d97706; }
    .category-badge.vegetables { background: #d1fae5; color: #059669; }
    .category-badge.dairy { background: #dbeafe; color: #2563eb; }
    .category-badge.bakery { background: #fde2e8; color: #be185d; }
    .category-badge.meat { background: #fee2e2; color: #dc2626; }
    
    .status-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
    }
    
    .status-badge.in-stock { background: #d1fae5; color: #059669; }
    .status-badge.low-stock { background: #fef3c7; color: #d97706; }
    .status-badge.out-of-stock { background: #fee2e2; color: #dc2626; }
    
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
    
    .inventory-controls {
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
    
    .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 20px;
    }
    
    .warning-text {
        color: #ef4444;
        font-size: 14px;
        margin-top: 10px;
    }
`;
document.head.appendChild(style);
