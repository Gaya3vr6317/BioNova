class AuthManager {
    constructor() {
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.setupEventListeners();
        this.createParticles();
    }

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const showRegister = document.getElementById('showRegister');
        const showLogin = document.getElementById('showLogin');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        if (showRegister) {
            showRegister.addEventListener('click', (e) => this.showRegisterForm(e));
        }

        if (showLogin) {
            showLogin.addEventListener('click', (e) => this.showLoginForm(e));
        }
    }

    async checkAuthStatus() {
        try {
            const response = await fetch('/api/auth/check');
            const result = await response.json();
            
            if (result.loggedIn && window.location.pathname === '/') {
                window.location.href = '/dashboard';
            }
        } catch (error) {
            console.log('User not logged in');
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        const btn = e.target.querySelector('button');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<div class="loading"></div> Launching...';
        btn.disabled = true;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('🚀 Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            } else {
                this.showNotification('❌ ' + (result.error || 'Login failed'), 'error');
            }
        } catch (error) {
            this.showNotification('🌐 Network error. Please try again.', 'error');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        if (data.password.length < 6) {
            this.showNotification('🔒 Password must be at least 6 characters', 'error');
            return;
        }

        const btn = e.target.querySelector('button');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<div class="loading"></div> Creating Account...';
        btn.disabled = true;

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('✅ Account created successfully!', 'success');
                setTimeout(() => {
                    this.showLoginForm();
                }, 1500);
            } else {
                this.showNotification('❌ ' + (result.error || 'Registration failed'), 'error');
            }
        } catch (error) {
            this.showNotification('🌐 Network error. Please try again.', 'error');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    showRegisterForm(e) {
        if (e) e.preventDefault();
        document.querySelector('.login-card').classList.add('hidden');
        document.querySelector('.register-card').classList.remove('hidden');
    }

    showLoginForm(e) {
        if (e) e.preventDefault();
        document.querySelector('.register-card').classList.add('hidden');
        document.querySelector('.login-card').classList.remove('hidden');
    }

    showNotification(message, type = 'info') {
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-message">${message}</span>
            </div>
        `;

        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    createParticles() {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles';
        document.body.appendChild(particlesContainer);

        for (let i = 0; i < 50; i++) {
            this.createParticle(particlesContainer);
        }
    }

    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 3 + 1;
        const posX = Math.random() * 100;
        const duration = Math.random() * 10 + 5;
        const delay = Math.random() * 5;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}vw`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;
        
        container.appendChild(particle);
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});