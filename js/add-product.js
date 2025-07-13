// Add Product functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkAuth();
    
    // Initialize form
    initializeForm();
    
    // Setup sidebar toggle
    setupSidebarToggle();
    
    // Update user info
    updateUserInfo();
});

function checkAuth() {
    if (localStorage.getItem('userLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }
}

function initializeForm() {
    const form = document.getElementById('addProductForm');
    const imageInput = document.getElementById('productImage');
    
    // Form submission
    form.addEventListener('submit', handleFormSubmit);
    
    // Image upload handling
    imageInput.addEventListener('change', handleImageUpload);
    
    // Real-time validation
    setupFormValidation();
    
    // Auto-generate SKU
    document.getElementById('productName').addEventListener('input', generateSKU);
    document.getElementById('category').addEventListener('change', generateSKU);
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    // Clear previous errors
    clearAllErrors();
    
    // Validate form
    if (validateForm()) {
        submitProduct();
    }
}

function validateForm() {
    let isValid = true;
    
    // Product name validation
    const productName = document.getElementById('productName').value.trim();
    if (!productName) {
        showError('productNameError', 'Product name is required');
        isValid = false;
    } else if (productName.length < 2) {
        showError('productNameError', 'Product name must be at least 2 characters');
        isValid = false;
    }
    
    // Category validation
    const category = document.getElementById('category').value;
    if (!category) {
        showError('categoryError', 'Please select a category');
        isValid = false;
    }
    
    // Quantity validation
    const quantity = document.getElementById('quantity').value;
    if (!quantity || quantity < 0) {
        showError('quantityError', 'Please enter a valid quantity');
        isValid = false;
    }
    
    // Price validation
    const price = document.getElementById('price').value;
    if (!price || price <= 0) {
        showError('priceError', 'Please enter a valid price');
        isValid = false;
    }
    
    return isValid;
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    const inputElement = errorElement.previousElementSibling;
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Add error styling
    if (inputElement.tagName === 'INPUT' || inputElement.tagName === 'SELECT') {
        inputElement.style.borderColor = 'var(--danger-color)';
    } else if (inputElement.classList.contains('price-input')) {
        inputElement.querySelector('input').style.borderColor = 'var(--danger-color)';
    }
}

function clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    const inputElement = errorElement.previousElementSibling;
    
    errorElement.style.display = 'none';
    
    // Remove error styling
    if (inputElement.tagName === 'INPUT' || inputElement.tagName === 'SELECT') {
        inputElement.style.borderColor = 'var(--medium-gray)';
    } else if (inputElement.classList.contains('price-input')) {
        inputElement.querySelector('input').style.borderColor = 'var(--medium-gray)';
    }
}

function clearAllErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.style.display = 'none';
    });
    
    // Reset input styling
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.style.borderColor = 'var(--medium-gray)';
    });
}

function setupFormValidation() {
    const inputs = document.querySelectorAll('input[required], select[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            if (this.style.borderColor === 'var(--danger-color)') {
                validateField(this);
            }
        });
    });
}

function validateField(field) {
    const fieldName = field.name;
    const value = field.value.trim();
    
    switch(fieldName) {
        case 'productName':
            if (!value) {
                showError('productNameError', 'Product name is required');
            } else if (value.length < 2) {
                showError('productNameError', 'Product name must be at least 2 characters');
            } else {
                clearError('productNameError');
            }
            break;
            
        case 'category':
            if (!value) {
                showError('categoryError', 'Please select a category');
            } else {
                clearError('categoryError');
            }
            break;
            
        case 'quantity':
            if (!value || value < 0) {
                showError('quantityError', 'Please enter a valid quantity');
            } else {
                clearError('quantityError');
            }
            break;
            
        case 'price':
            if (!value || value <= 0) {
                showError('priceError', 'Please enter a valid price');
            } else {
                clearError('priceError');
            }
            break;
    }
}

function generateSKU() {
    const productName = document.getElementById('productName').value.trim();
    const category = document.getElementById('category').value;
    const skuInput = document.getElementById('sku');
    
    if (productName && category && !skuInput.value) {
        const categoryCode = category.substring(0, 3).toUpperCase();
        const nameCode = productName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        
        skuInput.value = `${categoryCode}-${nameCode}-${randomNum}`;
    }
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    const uploadDisplay = document.querySelector('.file-upload-display');
    const imagePreview = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');
    
    if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file');
            e.target.value = '';
            return;
        }
        
        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            e.target.value = '';
            return;
        }
        
        // Show image preview
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            uploadDisplay.style.display = 'none';
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function removeImage() {
    const imageInput = document.getElementById('productImage');
    const uploadDisplay = document.querySelector('.file-upload-display');
    const imagePreview = document.getElementById('imagePreview');
    
    imageInput.value = '';
    uploadDisplay.style.display = 'block';
    imagePreview.style.display = 'none';
}

function submitProduct() {
    const submitBtn = document.querySelector('.btn-primary');
    const btnText = submitBtn.querySelector('.btn-text');
    const loadingSpinner = submitBtn.querySelector('.loading-spinner');
    
    // Show loading state
    btnText.style.display = 'none';
    loadingSpinner.style.display = 'inline-block';
    submitBtn.disabled = true;
    
    // Collect form data
    const formData = new FormData(document.getElementById('addProductForm'));
    const productData = {
        name: formData.get('productName'),
        category: formData.get('category'),
        quantity: parseInt(formData.get('quantity')),
        price: parseFloat(formData.get('price')),
        sku: formData.get('sku'),
        supplier: formData.get('supplier'),
        description: formData.get('description'),
        image: formData.get('productImage')
    };
    
    // Simulate API call
    setTimeout(() => {
        // Save to localStorage (in real app, send to server)
        let products = JSON.parse(localStorage.getItem('products') || '[]');
        productData.id = Date.now();
        productData.dateAdded = new Date().toISOString();
        products.push(productData);
        localStorage.setItem('products', JSON.stringify(products));
        
        // Show success message
        showSuccessMessage();
        
        // Reset form
        setTimeout(() => {
            resetForm();
        }, 2000);
        
    }, 2000);
}

function showSuccessMessage() {
    // Create success notification
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <span>Product added successfully!</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success-color);
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
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function resetForm() {
    const form = document.getElementById('addProductForm');
    const submitBtn = document.querySelector('.btn-primary');
    const btnText = submitBtn.querySelector('.btn-text');
    const loadingSpinner = submitBtn.querySelector('.loading-spinner');
    
    // Reset form
    form.reset();
    
    // Reset button state
    btnText.style.display = 'inline';
    loadingSpinner.style.display = 'none';
    submitBtn.disabled = false;
    
    // Reset image upload
    removeImage();
    
    // Clear errors
    clearAllErrors();
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
