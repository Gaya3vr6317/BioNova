// Advanced animations for the Space Biology Dashboard
class DashboardAnimations {
    constructor() {
        this.init();
    }

    init() {
        this.createDNAAnimation();
        this.createOrbitAnimation();
        this.setupScrollAnimations();
        this.setupHoverEffects();
    }

    createDNAAnimation() {
        const dnaContainer = document.createElement('div');
        dnaContainer.className = 'dna-animation';
        dnaContainer.innerHTML = `
            <div class="dna-strand">
                ${Array.from({length: 12}, (_, i) => `<div class="dna-base"></div>`).join('')}
            </div>
        `;
        
        // Add DNA animation to dashboard header
        const header = document.querySelector('.dashboard-header');
        if (header) {
            header.appendChild(dnaContainer);
        }
    }

    createOrbitAnimation() {
        const orbitContainer = document.createElement('div');
        orbitContainer.className = 'orbit-system';
        orbitContainer.innerHTML = `
            <div class="central-body"></div>
            <div class="orbiting-body"></div>
        `;
        
        // Add orbit animation to stats section
        const stats = document.querySelector('.stats-cards');
        if (stats) {
            stats.insertAdjacentElement('beforebegin', orbitContainer);
        }
    }

    setupScrollAnimations() {
        // Add scroll-triggered animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        // Observe all experiment cards and charts
        document.querySelectorAll('.experiment-card, .chart-container, .stat-card').forEach(el => {
            observer.observe(el);
        });
    }

    setupHoverEffects() {
        // Add hover effects to interactive elements
        document.addEventListener('mouseover', (e) => {
            if (e.target.matches('.btn-primary, .btn-secondary, .experiment-card')) {
                e.target.classList.add('btn-ripple');
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.matches('.btn-primary, .btn-secondary, .experiment-card')) {
                e.target.classList.remove('btn-ripple');
            }
        });
    }

    // Method to trigger search animation
    highlightSearchResults(keyword) {
        const cards = document.querySelectorAll('.experiment-card');
        cards.forEach(card => {
            if (card.textContent.toLowerCase().includes(keyword.toLowerCase())) {
                card.classList.add('search-highlight');
                setTimeout(() => {
                    card.classList.remove('search-highlight');
                }, 2000);
            }
        });
    }

    // Method to animate stats counter
    animateStatCounter(element, targetValue, duration = 2000) {
        let start = 0;
        const increment = targetValue / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= targetValue) {
                element.textContent = targetValue.toLocaleString();
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(start).toLocaleString();
            }
        }, 16);
    }
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DashboardAnimations();
});

// Utility function for creating micro-interactions
const MicroInteractions = {
    // Button press effect
    pressButton(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
    },

    // Card hover effect
    hoverCard(card) {
        card.style.transform = 'translateY(-5px) rotateX(5deg)';
        card.style.boxShadow = '0 20px 40px rgba(0, 243, 255, 0.3)';
    },

    // Card leave effect
    leaveCard(card) {
        card.style.transform = 'translateY(0) rotateX(0)';
        card.style.boxShadow = '0 10px 20px rgba(0, 243, 255, 0.1)';
    },

    // Loading spinner
    showLoading(element) {
        element.innerHTML = '<div class="loading"></div>';
    },

    // Success checkmark
    showSuccess(element) {
        element.innerHTML = '✓';
        element.style.color = '#4caf50';
        setTimeout(() => {
            element.innerHTML = '';
        }, 1000);
    }
};