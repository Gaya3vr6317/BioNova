class Dashboard {
    constructor() {
        this.currentPage = 1;
        this.filters = {
            category: 'all',
            organism: 'all',
            yearFrom: '',
            yearTo: ''
        };
        this.stats = null;
        this.init();
    }

    async init() {
        await this.checkAuth();
        // Only initialize minimal data; stats/charts/experiments removed from UI
        this.setupEventListeners();
    }

    async checkAuth() {
        try {
            const response = await fetch('/api/auth/check');
            const result = await response.json();
            
            if (!result.loggedIn) {
                window.location.href = '/';
                return;
            }
            
            // Show welcome message
            this.showNotification(`👨‍🚀 Welcome back, ${result.user.username}!`, 'success');
        } catch (error) {
            console.error('Auth check failed:', error);
            window.location.href = '/';
        }
    }

    async loadDashboardData() {
        // No-op: stats, charts, experiments grid removed from the dashboard UI
        return;
    }

    updateStatsCards() {
        // Removed UI: no stats cards to update
    }

    animateValue(elementId, start, end, duration) {
        const element = document.getElementById(elementId);
        if (!element) return;

        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.textContent = value.toLocaleString();
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Experiments section removed from UI; keep methods no-op to avoid errors
    displayAdminContent(adminContent) { /* no-op */ }
    async loadExperiments(page = 1, searchTerm = '') { return; }

    setupChartTemplates() { /* charts removed */ }

    createPieChart() { return '<div></div>'; }

    createTimelineChart() { return '<div></div>'; }

    updateCharts() { /* no charts */ }

    
    displayExperiments(experiments) { /* removed experiments section */ }

    updatePagination(totalPages, currentPage) { /* no-op */ }

    setupEventListeners() {
        // All removed UI elements are not wired anymore.
    }

    async handleSearch() { /* removed */ }

    applyFilters() { /* removed */ }

    resetFilters() { /* removed */ }

    updateOrganismFilter() { /* removed */ }

    previousPage() { /* removed */ }

    nextPage() { /* removed */ }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `toast ${type}`;
        notification.innerHTML = `
            <div class="toast-content">
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    showError(message) {
        this.showNotification(message, 'error');
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});