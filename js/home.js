// Home page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize home page
    initializeHomePage();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Setup smooth scrolling
    setupSmoothScrolling();
    
    // Setup animations
    setupScrollAnimations();
});

function initializeHomePage() {
    // Add scroll effect to navbar
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.home-navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

function setupMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            const icon = this.querySelector('i');
            
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Close mobile menu when clicking on a link
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                const icon = mobileToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }
}

function setupSmoothScrolling() {
    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function setupScrollAnimations() {
    // Observe elements for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        observer.observe(card);
    });
    
    // Observe sections
    const sections = document.querySelectorAll('.features-section, .about-section, .contact-section');
    sections.forEach(section => {
        observer.observe(section);
    });
}

// Navigation functions
function goToLogin() {
    window.location.href = 'login.html';
}

function goToCustomerLogin() {
    window.location.href = 'login.html?type=customer';
}

function goToStaffLogin() {
    window.location.href = 'login.html?type=staff';
}

function scrollToFeatures() {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
        const offsetTop = featuresSection.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Typing animation for hero text
function startTypingAnimation() {
    const heroTitle = document.querySelector('.hero-content h1');
    const text = heroTitle.textContent;
    heroTitle.textContent = '';
    
    let index = 0;
    const typingSpeed = 100;
    
    function typeCharacter() {
        if (index < text.length) {
            heroTitle.textContent += text.charAt(index);
            index++;
            setTimeout(typeCharacter, typingSpeed);
        }
    }
    
    typeCharacter();
}

// Counter animation for stats
function animateCounters() {
    const counters = document.querySelectorAll('.stat h3');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
        const increment = target / 50;
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.textContent = target + (counter.textContent.includes('+') ? '+' : '') + 
                                    (counter.textContent.includes('%') ? '%' : '');
                clearInterval(timer);
            } else {
                counter.textContent = Math.floor(current) + (counter.textContent.includes('+') ? '+' : '') + 
                                    (counter.textContent.includes('%') ? '%' : '');
            }
        }, 30);
    });
}

// Initialize animations when elements are visible
document.addEventListener('DOMContentLoaded', function() {
    // Start typing animation after a delay
    setTimeout(startTypingAnimation, 500);
    
    // Animate counters when about section is visible
    const aboutSection = document.querySelector('.about-section');
    const aboutObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                aboutObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    if (aboutSection) {
        aboutObserver.observe(aboutSection);
    }
});

// Add CSS for new CTA buttons
const style = document.createElement('style');
style.textContent = `
    .cta-buttons {
        display: flex;
        gap: 20px;
        justify-content: center;
        margin-top: 30px;
        flex-wrap: wrap;
    }
    
    .cta-buttons .btn-primary-large,
    .cta-buttons .btn-secondary-large {
        min-width: 180px;
        flex: 1;
        max-width: 250px;
    }
    
    @media (max-width: 768px) {
        .cta-buttons {
            flex-direction: column;
            align-items: center;
        }
        
        .cta-buttons .btn-primary-large,
        .cta-buttons .btn-secondary-large {
            width: 100%;
            max-width: 300px;
        }
    }
`;
document.head.appendChild(style);

// Login options modal
function showLoginOptions() {
    // Remove existing modal if any
    const existingModal = document.getElementById('loginOptionsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create login options modal
    const modal = document.createElement('div');
    modal.id = 'loginOptionsModal';
    modal.innerHTML = `
        <div class="login-options-overlay" onclick="closeLoginOptions()">
            <div class="login-options-modal" onclick="event.stopPropagation()">
                <div class="login-options-header">
                    <h3><i class="fas fa-sign-in-alt"></i> Choose Login Type</h3>
                    <button class="close-btn" onclick="closeLoginOptions()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="login-options-content">
                    <button class="login-option-btn customer-btn" onclick="goToCustomerLogin()">
                        <i class="fas fa-user"></i>
                        <div class="option-content">
                            <h4>Customer Login</h4>
                            <p>Shop for groceries and place orders</p>
                        </div>
                        <i class="fas fa-arrow-right"></i>
                    </button>
                    <button class="login-option-btn staff-btn" onclick="goToStaffLogin()">
                        <i class="fas fa-user-tie"></i>
                        <div class="option-content">
                            <h4>Staff Login</h4>
                            <p>Access admin dashboard and management tools</p>
                        </div>
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show with animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function closeLoginOptions() {
    const modal = document.getElementById('loginOptionsModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}
