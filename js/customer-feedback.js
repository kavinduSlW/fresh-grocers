// Fresh Grocers Customer Feedback JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated as customer
    checkCustomerAuth();
    
    // Setup star ratings
    setupStarRatings();
    
    // Load orders to rate
    loadOrdersToRate();
    
    // Load previous feedback
    loadPreviousFeedback();
    
    // Setup mobile menu
    setupMobileMenu();
});

// Global variables
let currentRating = 0;
let orders = [];
let feedbacks = [];

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

function setupStarRatings() {
    const stars = document.querySelectorAll('#overallRating .fas');
    const ratingText = document.getElementById('ratingText');
    
    const ratingTexts = [
        'Very Poor',
        'Poor', 
        'Average',
        'Good',
        'Excellent'
    ];
    
    stars.forEach((star, index) => {
        star.addEventListener('mouseover', function() {
            highlightStars(index + 1);
            ratingText.textContent = ratingTexts[index];
        });
        
        star.addEventListener('click', function() {
            currentRating = index + 1;
            highlightStars(currentRating);
            ratingText.textContent = ratingTexts[index];
            ratingText.style.color = '#10b981';
            ratingText.style.fontWeight = '600';
        });
    });
    
    document.getElementById('overallRating').addEventListener('mouseleave', function() {
        if (currentRating > 0) {
            highlightStars(currentRating);
            ratingText.textContent = ratingTexts[currentRating - 1];
        } else {
            highlightStars(0);
            ratingText.textContent = 'Click to rate';
            ratingText.style.color = '';
            ratingText.style.fontWeight = '';
        }
    });
}

function highlightStars(rating) {
    const stars = document.querySelectorAll('#overallRating .fas');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.style.color = '#fbbf24';
        } else {
            star.style.color = '#d1d5db';
        }
    });
}

function loadOrdersToRate() {
    // Get delivered orders that haven't been rated
    orders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    feedbacks = JSON.parse(localStorage.getItem('customerFeedbacks') || '[]');
    
    const deliveredOrders = orders.filter(order => {
        const orderTime = new Date(order.orderTime);
        const timeDiff = (new Date() - orderTime) / (1000 * 60); // minutes
        const isDelivered = timeDiff >= 45; // Consider delivered after 45 minutes
        const hasRating = feedbacks.some(feedback => feedback.orderId === order.id);
        return isDelivered && !hasRating;
    });
    
    const ordersContainer = document.getElementById('ordersToRate');
    
    if (deliveredOrders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="no-orders">
                <i class="fas fa-check-circle"></i>
                <h3>All caught up!</h3>
                <p>You've rated all your recent orders. Thank you for your feedback!</p>
            </div>
        `;
        return;
    }
    
    ordersContainer.innerHTML = deliveredOrders.map(order => `
        <div class="order-to-rate">
            <div class="order-info">
                <h3>Order #${order.id}</h3>
                <p class="order-date">${new Date(order.orderTime).toLocaleDateString()}</p>
                <div class="order-items-preview">
                    ${order.items.slice(0, 3).map(item => `
                        <span class="item-emoji">${item.emoji}</span>
                    `).join('')}
                    ${order.items.length > 3 ? `<span class="more-items">+${order.items.length - 3}</span>` : ''}
                </div>
                <p class="order-total">Total: $${order.total.toFixed(2)}</p>
            </div>
            <div class="rate-actions">
                <button class="rate-btn" onclick="openOrderRating('${order.id}')">
                    <i class="fas fa-star"></i>
                    Rate Order
                </button>
            </div>
        </div>
    `).join('');
}

function loadPreviousFeedback() {
    feedbacks = JSON.parse(localStorage.getItem('customerFeedbacks') || '[]');
    
    // Sort by date (newest first)
    feedbacks.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const feedbackContainer = document.getElementById('feedbackList');
    
    if (feedbacks.length === 0) {
        feedbackContainer.innerHTML = `
            <div class="no-feedback">
                <i class="fas fa-comment-alt"></i>
                <h3>No feedback yet</h3>
                <p>Your feedback and reviews will appear here once you start rating your orders.</p>
            </div>
        `;
        return;
    }
    
    feedbackContainer.innerHTML = feedbacks.map(feedback => `
        <div class="feedback-item">
            <div class="feedback-header">
                <div class="feedback-info">
                    ${feedback.orderId ? `<h3>Order #${feedback.orderId}</h3>` : '<h3>General Feedback</h3>'}
                    <p class="feedback-date">${new Date(feedback.date).toLocaleDateString()}</p>
                </div>
                <div class="feedback-rating">
                    ${generateStarDisplay(feedback.rating)}
                    <span class="rating-value">${feedback.rating}/5</span>
                </div>
            </div>
            ${feedback.comment ? `
                <div class="feedback-comment">
                    <p>"${feedback.comment}"</p>
                </div>
            ` : ''}
            ${feedback.orderRating ? `
                <div class="detailed-ratings">
                    <div class="rating-item">
                        <span>Product Quality:</span>
                        <div class="mini-stars">${generateStarDisplay(feedback.orderRating.quality)}</div>
                    </div>
                    <div class="rating-item">
                        <span>Delivery Speed:</span>
                        <div class="mini-stars">${generateStarDisplay(feedback.orderRating.delivery)}</div>
                    </div>
                    <div class="rating-item">
                        <span>Service:</span>
                        <div class="mini-stars">${generateStarDisplay(feedback.orderRating.service)}</div>
                    </div>
                </div>
            ` : ''}
        </div>
    `).join('');
}

function generateStarDisplay(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star filled"></i>';
        } else {
            stars += '<i class="fas fa-star"></i>';
        }
    }
    return stars;
}

function submitQuickFeedback() {
    if (currentRating === 0) {
        showToast('Please select a rating before submitting', 'warning');
        return;
    }
    
    const comment = document.getElementById('quickComment').value.trim();
    
    const feedback = {
        id: `FB-${Date.now()}`,
        type: 'general',
        rating: currentRating,
        comment: comment,
        date: new Date().toISOString()
    };
    
    // Save feedback
    let feedbacks = JSON.parse(localStorage.getItem('customerFeedbacks') || '[]');
    feedbacks.push(feedback);
    localStorage.setItem('customerFeedbacks', JSON.stringify(feedbacks));
    
    // Reset form
    currentRating = 0;
    highlightStars(0);
    document.getElementById('ratingText').textContent = 'Click to rate';
    document.getElementById('ratingText').style.color = '';
    document.getElementById('ratingText').style.fontWeight = '';
    document.getElementById('quickComment').value = '';
    
    // Reload feedback list
    loadPreviousFeedback();
    
    showToast('Thank you for your feedback!', 'success');
}

function openOrderRating(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const content = `
        <div class="order-rating-content">
            <div class="order-summary">
                <h3>Order #${order.id}</h3>
                <p>Delivered on ${new Date(order.orderTime).toLocaleDateString()}</p>
                <p>Total: $${order.total.toFixed(2)}</p>
            </div>
            
            <div class="rating-categories">
                <div class="rating-category">
                    <h4>Product Quality</h4>
                    <p>How fresh and good were the products?</p>
                    <div class="star-rating" id="qualityRating">
                        <i class="fas fa-star" data-rating="1"></i>
                        <i class="fas fa-star" data-rating="2"></i>
                        <i class="fas fa-star" data-rating="3"></i>
                        <i class="fas fa-star" data-rating="4"></i>
                        <i class="fas fa-star" data-rating="5"></i>
                    </div>
                </div>
                
                <div class="rating-category">
                    <h4>Delivery Speed</h4>
                    <p>How fast was the delivery?</p>
                    <div class="star-rating" id="deliveryRating">
                        <i class="fas fa-star" data-rating="1"></i>
                        <i class="fas fa-star" data-rating="2"></i>
                        <i class="fas fa-star" data-rating="3"></i>
                        <i class="fas fa-star" data-rating="4"></i>
                        <i class="fas fa-star" data-rating="5"></i>
                    </div>
                </div>
                
                <div class="rating-category">
                    <h4>Service Quality</h4>
                    <p>How was the overall service experience?</p>
                    <div class="star-rating" id="serviceRating">
                        <i class="fas fa-star" data-rating="1"></i>
                        <i class="fas fa-star" data-rating="2"></i>
                        <i class="fas fa-star" data-rating="3"></i>
                        <i class="fas fa-star" data-rating="4"></i>
                        <i class="fas fa-star" data-rating="5"></i>
                    </div>
                </div>
            </div>
            
            <div class="order-comment">
                <h4>Additional Comments (Optional)</h4>
                <textarea id="orderComment" placeholder="Tell us more about your experience with this order..." rows="4"></textarea>
            </div>
            
            <div class="rating-actions">
                <button class="btn-secondary" onclick="closeOrderRating()">Cancel</button>
                <button class="btn-primary" onclick="submitOrderRating('${orderId}')">Submit Rating</button>
            </div>
        </div>
    `;
    
    document.getElementById('orderRatingContent').innerHTML = content;
    document.getElementById('orderRatingModal').style.display = 'block';
    
    // Setup individual star ratings
    setupModalStarRatings();
}

function setupModalStarRatings() {
    const ratingIds = ['qualityRating', 'deliveryRating', 'serviceRating'];
    
    ratingIds.forEach(ratingId => {
        const stars = document.querySelectorAll(`#${ratingId} .fas`);
        let currentModalRating = 0;
        
        stars.forEach((star, index) => {
            star.addEventListener('mouseover', function() {
                highlightModalStars(ratingId, index + 1);
            });
            
            star.addEventListener('click', function() {
                currentModalRating = index + 1;
                star.parentElement.setAttribute('data-rating', currentModalRating);
                highlightModalStars(ratingId, currentModalRating);
            });
        });
        
        document.getElementById(ratingId).addEventListener('mouseleave', function() {
            const savedRating = this.getAttribute('data-rating') || 0;
            highlightModalStars(ratingId, savedRating);
        });
    });
}

function highlightModalStars(ratingId, rating) {
    const stars = document.querySelectorAll(`#${ratingId} .fas`);
    stars.forEach((star, index) => {
        if (index < rating) {
            star.style.color = '#fbbf24';
        } else {
            star.style.color = '#d1d5db';
        }
    });
}

function submitOrderRating(orderId) {
    const qualityRating = parseInt(document.getElementById('qualityRating').getAttribute('data-rating') || 0);
    const deliveryRating = parseInt(document.getElementById('deliveryRating').getAttribute('data-rating') || 0);
    const serviceRating = parseInt(document.getElementById('serviceRating').getAttribute('data-rating') || 0);
    
    if (qualityRating === 0 || deliveryRating === 0 || serviceRating === 0) {
        showToast('Please rate all categories', 'warning');
        return;
    }
    
    const comment = document.getElementById('orderComment').value.trim();
    const overallRating = Math.round((qualityRating + deliveryRating + serviceRating) / 3);
    
    const feedback = {
        id: `FB-${Date.now()}`,
        type: 'order',
        orderId: orderId,
        rating: overallRating,
        orderRating: {
            quality: qualityRating,
            delivery: deliveryRating,
            service: serviceRating
        },
        comment: comment,
        date: new Date().toISOString()
    };
    
    // Save feedback
    let feedbacks = JSON.parse(localStorage.getItem('customerFeedbacks') || '[]');
    feedbacks.push(feedback);
    localStorage.setItem('customerFeedbacks', JSON.stringify(feedbacks));
    
    // Close modal
    closeOrderRating();
    
    // Reload sections
    loadOrdersToRate();
    loadPreviousFeedback();
    
    showToast('Thank you for rating your order!', 'success');
}

function closeOrderRating() {
    document.getElementById('orderRatingModal').style.display = 'none';
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
    const modal = document.getElementById('orderRatingModal');
    if (event.target === modal) {
        closeOrderRating();
    }
});

// Add CSS for feedback page
const style = document.createElement('style');
style.textContent = `
    .feedback-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 24px;
    }
    
    .quick-feedback-section,
    .order-feedback-section,
    .previous-feedback-section {
        background: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .section-header {
        margin-bottom: 24px;
        text-align: center;
    }
    
    .section-header h2 {
        font-size: 24px;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 8px;
    }
    
    .section-header p {
        color: #6b7280;
        font-size: 16px;
    }
    
    .quick-rating {
        max-width: 500px;
        margin: 0 auto;
    }
    
    .rating-question {
        text-align: center;
        margin-bottom: 24px;
    }
    
    .rating-question h3 {
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 16px;
    }
    
    .star-rating {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-bottom: 8px;
    }
    
    .star-rating i {
        font-size: 24px;
        color: #d1d5db;
        cursor: pointer;
        transition: color 0.2s ease;
    }
    
    .star-rating i:hover {
        color: #fbbf24;
    }
    
    .rating-text {
        font-size: 14px;
        color: #6b7280;
        font-weight: 500;
    }
    
    .quick-comment {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }
    
    .quick-comment textarea {
        width: 100%;
        padding: 16px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        font-size: 16px;
        resize: vertical;
        transition: border-color 0.3s ease;
    }
    
    .quick-comment textarea:focus {
        outline: none;
        border-color: #10b981;
    }
    
    .submit-quick-btn {
        padding: 12px 24px;
        background: #10b981;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: background 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        align-self: center;
    }
    
    .submit-quick-btn:hover {
        background: #059669;
    }
    
    .orders-to-rate {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
    }
    
    .order-to-rate {
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        padding: 20px;
        transition: all 0.3s ease;
    }
    
    .order-to-rate:hover {
        border-color: #10b981;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }
    
    .order-info h3 {
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 8px;
    }
    
    .order-date {
        color: #6b7280;
        font-size: 14px;
        margin-bottom: 12px;
    }
    
    .order-items-preview {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
    }
    
    .item-emoji {
        font-size: 20px;
    }
    
    .more-items {
        background: #f3f4f6;
        color: #6b7280;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
    }
    
    .order-total {
        font-weight: 600;
        color: #10b981;
        margin-bottom: 16px;
    }
    
    .rate-btn {
        width: 100%;
        padding: 10px 16px;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: background 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }
    
    .rate-btn:hover {
        background: #2563eb;
    }
    
    .feedback-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }
    
    .feedback-item {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 20px;
        background: #f9fafb;
    }
    
    .feedback-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;
    }
    
    .feedback-info h3 {
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 4px;
    }
    
    .feedback-date {
        color: #6b7280;
        font-size: 14px;
    }
    
    .feedback-rating {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .feedback-rating .fas.filled {
        color: #fbbf24;
    }
    
    .feedback-rating .fas {
        color: #d1d5db;
        font-size: 16px;
    }
    
    .rating-value {
        color: #6b7280;
        font-size: 14px;
        font-weight: 500;
    }
    
    .feedback-comment {
        margin-bottom: 12px;
    }
    
    .feedback-comment p {
        font-style: italic;
        color: #4b5563;
        line-height: 1.6;
    }
    
    .detailed-ratings {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;
    }
    
    .rating-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    
    .rating-item span {
        font-size: 12px;
        font-weight: 500;
        color: #6b7280;
    }
    
    .mini-stars .fas {
        font-size: 12px;
        margin-right: 2px;
    }
    
    .mini-stars .fas.filled {
        color: #fbbf24;
    }
    
    .mini-stars .fas {
        color: #d1d5db;
    }
    
    .no-orders,
    .no-feedback {
        text-align: center;
        padding: 60px 20px;
        color: #6b7280;
    }
    
    .no-orders i,
    .no-feedback i {
        font-size: 48px;
        margin-bottom: 16px;
        color: #d1d5db;
    }
    
    .no-orders h3,
    .no-feedback h3 {
        font-size: 20px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 8px;
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
    
    .order-rating-content {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }
    
    .order-summary {
        text-align: center;
        padding: 16px;
        background: #f9fafb;
        border-radius: 8px;
    }
    
    .order-summary h3 {
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 8px;
    }
    
    .order-summary p {
        color: #6b7280;
        margin-bottom: 4px;
    }
    
    .rating-categories {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    
    .rating-category {
        padding: 16px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
    }
    
    .rating-category h4 {
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 4px;
    }
    
    .rating-category p {
        color: #6b7280;
        font-size: 14px;
        margin-bottom: 12px;
    }
    
    .order-comment h4 {
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 8px;
    }
    
    .order-comment textarea {
        width: 100%;
        padding: 16px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        font-size: 14px;
        resize: vertical;
        transition: border-color 0.3s ease;
    }
    
    .order-comment textarea:focus {
        outline: none;
        border-color: #10b981;
    }
    
    .rating-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
    }
    
    .btn-primary {
        padding: 12px 24px;
        background: #10b981;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: background 0.3s ease;
    }
    
    .btn-primary:hover {
        background: #059669;
    }
    
    .btn-secondary {
        padding: 12px 24px;
        background: #6b7280;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: background 0.3s ease;
    }
    
    .btn-secondary:hover {
        background: #4b5563;
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
        .feedback-content {
            padding: 15px;
        }
        
        .orders-to-rate {
            grid-template-columns: 1fr;
        }
        
        .rating-actions {
            flex-direction: column;
        }
        
        .feedback-header {
            flex-direction: column;
            gap: 8px;
            align-items: flex-start;
        }
        
        .detailed-ratings {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(style);
