// ========================================
// CanWeGet.com - Main JavaScript
// Vanilla JS - No frameworks
// Features: Theme toggle, nav mobile, localStorage deals, timers, forms
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    
    // Core elements
    const themeToggle = document.getElementById('themeToggle');
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    const currentYearSpan = document.getElementById('currentYear');
    
    // Initialize
    initTheme();
    initNavigation();
    initCurrentYear();
    initDeals();
    initForms();
    initPreview();
    
    /**
     * Dark/Light Theme Toggle
     */
    function initTheme() {
        if (!themeToggle) return;
        
        // Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.body.classList.toggle('dark-mode', savedTheme === 'dark');
        
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            document.body.classList.toggle('dark-mode', newTheme === 'dark');
            localStorage.setItem('theme', newTheme);
        });
    }
    
    /**
     * Mobile Navigation
     */
    function initNavigation() {
        if (!navToggle || !mainNav) return;
        
        navToggle.addEventListener('click', function() {
            mainNav.classList.toggle('nav-open');
            const isOpen = mainNav.classList.contains('nav-open');
            
            navToggle.setAttribute('aria-expanded', isOpen);
            document.body.classList.toggle('no-scroll', isOpen);
        });
        
        // Close on escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                mainNav.classList.remove('nav-open');
                document.body.classList.remove('no-scroll');
            }
        });
        
        // Close on outside click
        document.addEventListener('click', function(e) {
            if (!mainNav.contains(e.target) && !navToggle.contains(e.target)) {
                mainNav.classList.remove('nav-open');
                document.body.classList.remove('no-scroll');
            }
        });
    }
    
    /**
     * Current Year
     */
    function initCurrentYear() {
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }
    }
    
    /**
     * Deals Functionality (deals.html)
     */
    function initDeals() {
        const joinButtons = document.querySelectorAll('.btn-join');
        const joinedCounters = document.querySelectorAll('.deal-joined');
        const searchInput = document.getElementById('dealSearch');
        const categoryFilter = document.getElementById('dealCategory');
        const deals = document.querySelectorAll('.deal-card');
        const loadMoreBtn = document.getElementById('loadMoreDeals');
        
        // Load saved join counts
        joinedCounters.forEach(counter => {
            const dealId = counter.dataset.joined;
            const savedCount = localStorage.getItem(`deal-${dealId}`);
            if (savedCount) {
                counter.textContent = savedCount;
            }
        });
        
        // Join buttons
        joinButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const dealId = this.dataset.join;
                const counter = document.querySelector(`[data-joined="${dealId}"]`);
                const target = document.querySelector(`[data-deal-id="${dealId}"] .deal-target`).textContent;
                
                let currentCount = parseInt(counter.textContent);
                const maxCount = parseInt(target);
                
                if (currentCount < maxCount) {
                    currentCount++;
                    counter.textContent = currentCount;
                    localStorage.setItem(`deal-${dealId}`, currentCount);
                    
                    // Visual feedback
                    this.textContent = 'Joined ✓';
                    this.classList.add('btn-secondary');
                    setTimeout(() => {
                        this.disabled = true;
                    }, 300);
                    
                    showNotification(`Joined! ${currentCount}/${maxCount} participants`, 'success');
                }
            });
        });
        
        // Save buttons
        document.querySelectorAll('.btn-save').forEach(btn => {
            btn.addEventListener('click', function() {
                const dealId = this.dataset.save;
                // Toggle save state (localStorage)
                const savedDeals = JSON.parse(localStorage.getItem('savedDeals') || '[]');
                const index = savedDeals.indexOf(dealId);
                
                if (index > -1) {
                    savedDeals.splice(index, 1);
                    this.textContent = 'Save for later';
                    showNotification('Removed from saved', 'neutral');
                } else {
                    savedDeals.push(dealId);
                    this.textContent = 'Saved ✓';
                    showNotification('Saved for later', 'success');
                }
                
                localStorage.setItem('savedDeals', JSON.stringify(savedDeals));
            });
        });
        
        // Search & Filter
        function filterDeals() {
            const searchTerm = searchInput.value.toLowerCase();
            const category = categoryFilter.value;
            
            deals.forEach(deal => {
                const title = deal.querySelector('.deal-title')?.textContent.toLowerCase() || '';
                const dealCategory = deal.dataset.category || '';
                
                const matchesSearch = title.includes(searchTerm);
                const matchesCategory = !category || dealCategory === category;
                
                deal.style.display = (matchesSearch && matchesCategory) ? 'block' : 'none';
            });
        }
        
        if (searchInput) {
            searchInput.addEventListener('input', filterDeals);
        }
        if (categoryFilter) {
            categoryFilter.addEventListener('change', filterDeals);
        }
        
        // Load more (demo)
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', function() {
                this.textContent = 'Loading...';
                setTimeout(() => {
                    this.textContent = 'No more deals';
                    this.disabled = true;
                }, 1000);
            });
        }
    }
    
    /**
     * Countdown Timers (deals.html)
     */
    function initCountdowns() {
        const timers = document.querySelectorAll('.deal-timer[data-deadline]');
        
        timers.forEach(timer => {
            const deadline = new Date(timer.dataset.deadline).getTime();
            const timerValue = timer.querySelector('.timer-value');
            
            function updateTimer() {
                const now = Date.now();
                const distance = deadline - now;
                
                if (distance < 0) {
                    timerValue.textContent = 'EXPIRED';
                    timer.classList.add('expired');
                    return;
                }
                
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                
                timerValue.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
            }
            
            updateTimer();
            setInterval(updateTimer, 1000);
        });
    }
    
    /**
     * Create Deal Form (create.html)
     */
    function initPreview() {
        const form = document.getElementById('createDealForm');
        const previewBtn = document.getElementById('previewDeal');
        const preview = document.getElementById('dealPreview');
        const closePreview = document.getElementById('closePreview');
        
        if (!form || !previewBtn) return;
        
        previewBtn.addEventListener('click', function() {
            populatePreview();
            preview.style.display = 'block';
            document.body.classList.add('no-scroll');
        });
        
        if (closePreview) {
            closePreview.addEventListener('click', function() {
                preview.style.display = 'none';
                document.body.classList.remove('no-scroll');
            });
        }
        
        preview.addEventListener('click', function(e) {
            if (e.target === preview) {
                preview.style.display = 'none';
                document.body.classList.remove('no-scroll');
            }
        });
    }
    
    function populatePreview() {
        const title = document.getElementById('dealTitle')?.value || 'Untitled Deal';
        const category = document.getElementById('dealCategory')?.value || 'other';
        const image = document.getElementById('dealImage')?.value;
        const description = document.getElementById('dealDescription')?.value || 'No description';
        const price = document.getElementById('dealPrice')?.value || '-';
        const target = document.getElementById('dealTarget')?.value || '-';
        const deadline = document.getElementById('dealDeadline')?.value;
        const link = document.getElementById('dealLink')?.value || '#';
        
        document.getElementById('previewTitle').textContent = title;
        document.getElementById('previewCategory').textContent = category.toUpperCase();
        
        const img = document.getElementById('previewImage');
        if (image) {
            img.src = image;
            img.style.display = 'block';
        } else {
            img.style.display = 'none';
        }
        
        document.getElementById('previewDescription').textContent = description;
        document.getElementById('previewTarget').textContent = target;
        document.getElementById('previewPrice').textContent = `Target: $${price}`;
        document.getElementById('previewLink').href = link;
        
        // Preview timer
        if (deadline) {
            const previewTimer = document.querySelector('#previewTimer .timer-value');
            const deadlineTime = new Date(deadline).getTime();
            const updatePreviewTimer = () => {
                const distance = deadlineTime - Date.now();
                if (distance < 0) {
                    previewTimer.textContent = 'EXPIRED';
                    return;
                }
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                previewTimer.textContent = `${days}d ${hours}h`;
            };
            updatePreviewTimer();
        }
    }
    
    /**
     * Form Handling
     */
    function initForms() {
        // Newsletter forms
        document.querySelectorAll('.newsletter-form').forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const btn = form.querySelector('button[type="submit"]');
                const originalText = btn.textContent;
                
                btn.textContent = 'Sending...';
                btn.disabled = true;
                
                // Simulate send (frontend only)
                setTimeout(() => {
                    btn.textContent = 'Thank you!';
                    setTimeout(() => {
                        form.reset();
                        btn.textContent = originalText;
                        btn.disabled = false;
                    }, 2000);
                }, 1500);
            });
        });
        
        // Contact form (Formspree handles submission)
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', function() {
                // Formspree handles via action attribute
                showNotification('Message sent! We\'ll reply within 24 hours.', 'success');
            });
        }
    }
    
    /**
     * Utility Functions
     */
    function showNotification(message, type = 'neutral') {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#6b7280'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
            z-index: 1000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
        });
        
        // Auto remove
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }
    
    /**
     * Intersection Observer for animations
     */
    function initAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.card, .how-step, .testimonial-card').forEach(el => {
            el.classList.add('animate-out');
            observer.observe(el);
        });
    }
    
    // Initialize animations after short delay
    setTimeout(initAnimations, 100);
    
    // Init timers if present
    initCountdowns();
    
});

// Polyfill for older browsers
if (!window.IntersectionObserver) {
    console.warn('IntersectionObserver not supported');
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
