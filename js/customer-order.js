// Fresh Grocers Customer Order JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated as customer
    checkCustomerAuth();
    
    // Initialize order page
    initializeOrderPage();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Load products
    loadProducts();
    
    // Load delivery agents
    loadDeliveryAgents();
});

// Global variables
let cart = [];
let products = [];
let deliveryAgents = [];

function checkCustomerAuth() {
    console.log('🔐 Checking customer authentication...');
    
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
        
        if (user.userType !== 'customer') {
            console.log('❌ User is not a customer - access denied');
            alert('Access denied. Customer account required.');
            window.location.href = 'login.html';
            return;
        }
        
        console.log('✅ Customer authentication successful');
        
        // Update welcome message if element exists
        const welcomeElement = document.querySelector('.welcome-user');
        if (welcomeElement) {
            welcomeElement.textContent = `Welcome, ${user.name}!`;
        }
        
    } catch (error) {
        console.error('❌ Error parsing user session:', error);
        sessionStorage.removeItem('currentUser'); // Clear corrupted session
        window.location.href = 'login.html';
        return;
    }
}

function initializeOrderPage() {
    // Load cart from localStorage if exists
    const savedCart = localStorage.getItem('customerCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
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

function loadProducts() {
    // Mock products data
    products = [
        {
            id: 1,
            name: 'Organic Bananas',
            category: 'fruits',
            price: 2.99,
            emoji: '🍌',
            inStock: true
        },
        {
            id: 2,
            name: 'Fresh Apples',
            category: 'fruits',
            price: 3.49,
            emoji: '🍎',
            inStock: true
        },
        {
            id: 3,
            name: 'Carrots',
            category: 'vegetables',
            price: 1.99,
            emoji: '🥕',
            inStock: true
        },
        {
            id: 4,
            name: 'Broccoli',
            category: 'vegetables',
            price: 2.79,
            emoji: '🥦',
            inStock: true
        },
        {
            id: 5,
            name: 'Fresh Milk',
            category: 'dairy',
            price: 4.29,
            emoji: '🥛',
            inStock: false
        },
        {
            id: 6,
            name: 'Cheddar Cheese',
            category: 'dairy',
            price: 5.99,
            emoji: '🧀',
            inStock: true
        },
        {
            id: 7,
            name: 'Whole Wheat Bread',
            category: 'bakery',
            price: 2.49,
            emoji: '🍞',
            inStock: true
        },
        {
            id: 8,
            name: 'Croissants',
            category: 'bakery',
            price: 3.99,
            emoji: '🥐',
            inStock: true
        },
        {
            id: 9,
            name: 'Chicken Breast',
            category: 'meat',
            price: 8.99,
            emoji: '🍗',
            inStock: true
        },
        {
            id: 10,
            name: 'Ground Beef',
            category: 'meat',
            price: 7.99,
            emoji: '🥩',
            inStock: true
        }
    ];
    
    displayProducts(products);
}

function displayProducts(productsToShow) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = productsToShow.map(product => `
        <div class="product-card ${!product.inStock ? 'out-of-stock' : ''}">
            <div class="product-image">
                <span style="font-size: 48px;">${product.emoji}</span>
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                ${product.inStock ? `
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="changeQuantity(${product.id}, -1)">-</button>
                        <input type="number" class="qty-input" id="qty-${product.id}" value="1" min="1" max="10">
                        <button class="qty-btn" onclick="changeQuantity(${product.id}, 1)">+</button>
                    </div>
                    <div class="product-actions">
                        <button class="add-to-cart" onclick="addToCart(${product.id})">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                        <button class="buy-now-btn" onclick="buyNow(${product.id})">
                            <i class="fas fa-bolt"></i> Buy Now
                        </button>
                    </div>
                ` : `
                    <button class="add-to-cart" disabled style="background: #ccc; cursor: not-allowed;">
                        <i class="fas fa-times-circle"></i> Out of Stock
                    </button>
                `}
            </div>
        </div>
    `).join('');
}

function filterProducts(category) {
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filter products
    const filteredProducts = category === 'all' ? products : products.filter(p => p.category === category);
    displayProducts(filteredProducts);
}

function searchProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm) || 
        p.category.toLowerCase().includes(searchTerm)
    );
    displayProducts(filteredProducts);
}

function changeQuantity(productId, change) {
    const qtyInput = document.getElementById(`qty-${productId}`);
    let newQty = parseInt(qtyInput.value) + change;
    newQty = Math.max(1, Math.min(10, newQty));
    qtyInput.value = newQty;
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const quantity = parseInt(document.getElementById(`qty-${productId}`).value);
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            quantity: quantity,
            emoji: product.emoji
        });
    }
    
    updateCartDisplay();
    saveCart();
    
    // Show success message
    showToast(`${product.name} added to cart!`);
}

function buyNow(productId) {
    // Clear current cart
    cart = [];
    
    // Add the selected product to cart
    const product = products.find(p => p.id === productId);
    const quantity = parseInt(document.getElementById(`qty-${productId}`).value);
    
    cart.push({
        id: productId,
        name: product.name,
        price: product.price,
        quantity: quantity,
        emoji: product.emoji
    });
    
    updateCartDisplay();
    saveCart();
    
    // Scroll to cart section
    document.querySelector('.cart-section').scrollIntoView({ 
        behavior: 'smooth' 
    });
    
    // Show success message
    showToast(`${product.name} ready for checkout! Complete your order below.`, 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
    saveCart();
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartSummary = document.getElementById('cartSummary');
    const deliverySection = document.getElementById('deliverySection');
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Add some fresh products to get started</p>
                <a href="#products" class="shop-now-btn" onclick="document.getElementById('productsGrid').scrollIntoView({behavior: 'smooth'})">
                    <i class="fas fa-leaf"></i>
                    Start Shopping
                </a>
            </div>
        `;
        cartSummary.style.display = 'none';
        deliverySection.style.display = 'none';
        cartCount.textContent = '0 items';
    } else {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`;
        
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-info">
                    <div class="cart-item-emoji">${item.emoji}</div>
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
                    </div>
                </div>
                <div class="cart-item-quantity">
                    <button class="cart-qty-btn" onclick="updateCartQuantity(${item.id}, -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" class="cart-qty-input" value="${item.quantity}" 
                           onchange="setCartQuantity(${item.id}, this.value)" min="1" max="10">
                    <button class="cart-qty-btn" onclick="updateCartQuantity(${item.id}, 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <button class="remove-item" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                    Remove
                </button>
            </div>
        `).join('');
        
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = subtotal >= 50 ? 0 : 3.99; // Free delivery over $50
        const total = subtotal + deliveryFee;
        
        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('deliveryFee').textContent = deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`;
        document.getElementById('total').textContent = `$${total.toFixed(2)}`;
        
        cartSummary.style.display = 'block';
        deliverySection.style.display = 'block';
        
        // Add free delivery notification
        if (subtotal >= 45 && subtotal < 50) {
            showToast(`🎉 Add $${(50 - subtotal).toFixed(2)} more for FREE delivery!`, 'info');
        } else if (deliveryFee === 0 && subtotal >= 50) {
            const freeDeliveryNote = document.querySelector('.free-delivery-note');
            if (!freeDeliveryNote) {
                const note = document.createElement('div');
                note.className = 'free-delivery-note';
                note.innerHTML = `
                    <div style="background: #ecfdf5; border: 2px solid #10b981; border-radius: 12px; padding: 15px; margin: 15px 0; text-align: center;">
                        <i class="fas fa-truck" style="color: #10b981; margin-right: 8px;"></i>
                        <strong style="color: #065f46;">Congratulations! You qualify for FREE delivery!</strong>
                    </div>
                `;
                cartSummary.appendChild(note);
            }
        }
    }
}

function loadDeliveryAgents() {
    // Mock delivery agents
    deliveryAgents = [
        { id: 1, name: 'Mike Davis', status: 'available', rating: 4.8 },
        { id: 2, name: 'Lisa Chen', status: 'available', rating: 4.9 },
        { id: 3, name: 'John Smith', status: 'busy', rating: 4.7 },
        { id: 4, name: 'Sarah Wilson', status: 'available', rating: 4.6 }
    ];
    
    const agentSelect = document.getElementById('deliveryAgent');
    if (agentSelect) {
        agentSelect.innerHTML = '<option value="">Choose available agent</option>' +
            deliveryAgents
                .filter(agent => agent.status === 'available')
                .map(agent => `<option value="${agent.id}">${agent.name} (⭐ ${agent.rating})</option>`)
                .join('');
    }
}

function placeOrder() {
    const deliveryAddress = document.getElementById('deliveryAddress').value;
    const selectedAgent = document.getElementById('deliveryAgent').value;
    const deliveryNotes = document.getElementById('deliveryNotes').value;
    
    if (!deliveryAddress.trim()) {
        showToast('Please enter delivery address', 'warning');
        return;
    }
    
    if (!selectedAgent) {
        showToast('Please select a delivery agent', 'warning');
        return;
    }
    
    if (cart.length === 0) {
        showToast('Your cart is empty', 'warning');
        return;
    }
    
    // Show processing state
    const placeOrderBtn = document.querySelector('.place-order-btn');
    const originalText = placeOrderBtn.innerHTML;
    placeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Order...';
    placeOrderBtn.disabled = true;
    
    // Simulate processing time (like real e-commerce)
    setTimeout(() => {
        // Generate realistic order ID
        const orderId = `ORD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
        
        // Create order with realistic data
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = subtotal > 50 ? 0 : 3.99; // Free delivery over $50
        const tax = subtotal * 0.08; // 8% tax
        const total = subtotal + deliveryFee + tax;
        
        const order = {
            id: orderId,
            items: [...cart], // Deep copy
            deliveryAddress: deliveryAddress,
            agentId: selectedAgent,
            agentName: deliveryAgents.find(a => a.id == selectedAgent).name,
            deliveryNotes: deliveryNotes,
            subtotal: subtotal,
            deliveryFee: deliveryFee,
            tax: tax,
            total: total,
            status: 'pending',
            orderTime: new Date().toISOString(),
            estimatedDelivery: new Date(Date.now() + 45 * 60 * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            paymentMethod: 'Cash on Delivery', // Simulate payment method
            orderNumber: Math.floor(Math.random() * 1000000) // 6-digit order number for customer reference
        };
        
        // Save order to localStorage
        let orders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
        orders.push(order);
        localStorage.setItem('customerOrders', JSON.stringify(orders));
        
        // Reset button
        placeOrderBtn.innerHTML = originalText;
        placeOrderBtn.disabled = false;
        
        // Show enhanced success modal
        showOrderModal(order);
        
        // Clear cart
        cart = [];
        updateCartDisplay();
        saveCart();
        
        // Send confirmation (simulate)
        simulateOrderConfirmation(order);
        
    }, 2000); // 2 second processing time
}

function showOrderModal(order) {
    document.getElementById('modalOrderId').textContent = order.id;
    document.getElementById('modalDeliveryTime').textContent = order.estimatedDelivery;
    document.getElementById('modalTotal').textContent = `$${order.total.toFixed(2)}`;
    
    // Add more details to the modal
    const modalBody = document.querySelector('#orderModal .modal-body');
    modalBody.innerHTML = `
        <div class="order-success-details">
            <div class="success-header">
                <i class="fas fa-check-circle success-icon"></i>
                <h2>Order Placed Successfully!</h2>
                <p>Your order has been confirmed and is being processed</p>
            </div>
            
            <div class="order-info-grid">
                <div class="info-item">
                    <span class="info-label">Order ID:</span>
                    <span class="info-value" id="modalOrderId">${order.id}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Order Number:</span>
                    <span class="info-value">#${order.orderNumber}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Estimated Delivery:</span>
                    <span class="info-value" id="modalDeliveryTime">${order.estimatedDelivery}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Delivery Agent:</span>
                    <span class="info-value">${order.agentName}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Payment Method:</span>
                    <span class="info-value">${order.paymentMethod}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Total Amount:</span>
                    <span class="info-value total" id="modalTotal">$${order.total.toFixed(2)}</span>
                </div>
            </div>
            
            <div class="order-breakdown">
                <h3>Order Breakdown</h3>
                <div class="breakdown-row">
                    <span>Subtotal:</span>
                    <span>$${order.subtotal.toFixed(2)}</span>
                </div>
                <div class="breakdown-row">
                    <span>Tax (8%):</span>
                    <span>$${order.tax.toFixed(2)}</span>
                </div>
                <div class="breakdown-row">
                    <span>Delivery Fee:</span>
                    <span>${order.deliveryFee === 0 ? 'FREE' : '$' + order.deliveryFee.toFixed(2)}</span>
                </div>
                <div class="breakdown-row total">
                    <span>Total:</span>
                    <span>$${order.total.toFixed(2)}</span>
                </div>
            </div>
            
            <div class="confirmation-notes">
                <div class="note-item">
                    <i class="fas fa-sms"></i>
                    <span>SMS confirmation sent to your registered phone number</span>
                </div>
                <div class="note-item">
                    <i class="fas fa-envelope"></i>
                    <span>Order receipt emailed to your account</span>
                </div>
                <div class="note-item">
                    <i class="fas fa-bell"></i>
                    <span>You'll receive updates about your order status</span>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('orderModal').style.display = 'block';
}

function simulateOrderConfirmation(order) {
    // Simulate sending SMS and email confirmations
    setTimeout(() => {
        showToast(`📱 SMS sent: Order ${order.id} confirmed. Track at freshgrocers.com`, 'info');
    }, 1000);
    
    setTimeout(() => {
        showToast(`📧 Email receipt sent to your inbox`, 'info');
    }, 2000);
}

function closeOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
}

function viewOrderStatus() {
    closeOrderModal();
    window.location.href = 'customer-status.html';
}

function saveCart() {
    localStorage.setItem('customerCart', JSON.stringify(cart));
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

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('orderModal');
    if (event.target === modal) {
        closeOrderModal();
    }
});

// Add CSS for product actions and animations
const style = document.createElement('style');
style.textContent = `
    .product-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 12px;
    }
    
    .buy-now-btn {
        width: 100%;
        background: linear-gradient(135deg, #f59e0b, #d97706) !important;
        color: white !important;
        border: none !important;
        padding: 12px 16px !important;
        border-radius: 8px !important;
        cursor: pointer !important;
        font-weight: 600 !important;
        font-size: 14px !important;
        transition: all 0.3s ease !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 8px !important;
        text-decoration: none !important;
    }
    
    .buy-now-btn:hover {
        background: linear-gradient(135deg, #d97706, #b45309) !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 8px 15px rgba(245, 158, 11, 0.3) !important;
    }
    
    .add-to-cart {
        width: 100% !important;
        background: linear-gradient(135deg, #10b981, #059669) !important;
        color: white !important;
        border: none !important;
        padding: 12px 16px !important;
        border-radius: 8px !important;
        cursor: pointer !important;
        font-weight: 600 !important;
        font-size: 14px !important;
        transition: all 0.3s ease !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 8px !important;
        text-decoration: none !important;
    }
    
    .add-to-cart:hover {
        background: linear-gradient(135deg, #059669, #047857) !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 8px 15px rgba(16, 185, 129, 0.3) !important;
    }
    
    .product-card {
        background: white !important;
        border-radius: 12px !important;
        padding: 20px !important;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
        transition: transform 0.2s ease, box-shadow 0.2s ease !important;
        border: 1px solid #e5e7eb !important;
    }
    
    .product-card:hover {
        transform: translateY(-4px) !important;
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15) !important;
    }
    
    .product-image {
        text-align: center !important;
        margin-bottom: 15px !important;
    }
    
    .product-info h3 {
        font-size: 18px !important;
        font-weight: 600 !important;
        color: #1f2937 !important;
        margin-bottom: 8px !important;
    }
    
    .product-price {
        font-size: 20px !important;
        font-weight: 700 !important;
        color: #10b981 !important;
        margin-bottom: 12px !important;
    }
    
    .quantity-controls {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 10px !important;
        margin-bottom: 12px !important;
    }
    
    .qty-btn {
        width: 32px !important;
        height: 32px !important;
        border: 2px solid #10b981 !important;
        background: white !important;
        color: #10b981 !important;
        border-radius: 6px !important;
        cursor: pointer !important;
        font-weight: 600 !important;
        transition: all 0.2s ease !important;
    }
    
    .qty-btn:hover {
        background: #10b981 !important;
        color: white !important;
    }
    
    .qty-input {
        width: 60px !important;
        text-align: center !important;
        border: 2px solid #e5e7eb !important;
        border-radius: 6px !important;
        padding: 6px !important;
        font-weight: 600 !important;
    }
    
    .products-grid {
        display: grid !important;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
        gap: 20px !important;
        margin-top: 20px !important;
    }
    
    .out-of-stock {
        opacity: 0.6 !important;
    }
    
    .out-of-stock .add-to-cart {
        background: #9ca3af !important;
        cursor: not-allowed !important;
    }
    
    .out-of-stock .add-to-cart:hover {
        background: #9ca3af !important;
        transform: none !important;
        box-shadow: none !important;
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .toast {
        animation: slideInRight 0.3s ease;
    }
    
    @media (max-width: 768px) {
        .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)) !important;
            gap: 15px !important;
        }
        
        .product-actions {
            gap: 6px !important;
        }
        
        .add-to-cart, .buy-now-btn {
            padding: 10px 12px !important;
            font-size: 13px !important;
        }
    }
`;
document.head.appendChild(style);

// Cart quantity management functions
function updateCartQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        const newQuantity = item.quantity + change;
        if (newQuantity > 0 && newQuantity <= 10) {
            item.quantity = newQuantity;
            updateCartDisplay();
            saveCart();
            
            if (change > 0) {
                showToast(`Added one more ${item.name}`, 'success');
            } else {
                showToast(`Removed one ${item.name}`, 'info');
            }
        } else if (newQuantity <= 0) {
            removeFromCart(productId);
        }
    }
}

function setCartQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        const newQty = parseInt(quantity);
        if (newQty > 0 && newQty <= 10) {
            item.quantity = newQty;
            updateCartDisplay();
            saveCart();
            showToast(`Updated ${item.name} quantity to ${newQty}`, 'success');
        } else if (newQty <= 0) {
            removeFromCart(productId);
        } else {
            showToast('Maximum quantity is 10 per item', 'warning');
            updateCartDisplay(); // Reset the input
        }
    }
}
