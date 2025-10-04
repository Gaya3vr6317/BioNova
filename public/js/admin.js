class AdminManager {
    constructor() {
        this.init();
    }

    async init() {
        await this.checkAdminAccess();
        this.loadContent();
        this.setupEventListeners();
    }

    async checkAdminAccess() {
        try {
            const response = await fetch('/api/auth/check');
            const result = await response.json();
            
            if (!result.loggedIn || !result.isAdmin) {
                window.location.href = '/dashboard';
                return;
            }
        } catch (error) {
            console.error('Admin check failed:', error);
            window.location.href = '/';
        }
    }

    setupEventListeners() {
        // Add content form
        const addForm = document.getElementById('addContentForm');
        if (addForm) {
            addForm.addEventListener('submit', (e) => this.handleAddContent(e));
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshContent');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadContent());
        }

        // Modal handlers
        const modal = document.getElementById('editModal');
        const closeBtn = document.querySelector('.modal-close');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal());
        }

        // Edit form
        const editForm = document.getElementById('editContentForm');
        if (editForm) {
            editForm.addEventListener('submit', (e) => this.handleEditContent(e));
        }

        // Delete button
        const deleteBtn = document.getElementById('deleteContent');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.handleDeleteContent());
        }

        // Close modal on outside click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal();
                }
            });
        }
    }

    async loadContent() {
        try {
            const response = await fetch('/api/admin/content');
            const contents = await response.json();
            this.displayContent(contents);
        } catch (error) {
            console.error('Error loading content:', error);
            this.showNotification('❌ Failed to load content', 'error');
        }
    }

    displayContent(contents) {
        const container = document.getElementById('contentList');
        if (!container) return;

        if (contents.length === 0) {
            container.innerHTML = `
                <div class="no-content">
                    <div class="no-content-icon">📝</div>
                    <h3>No content added yet</h3>
                    <p>Use the form above to add your first keyword content</p>
                </div>
            `;
            return;
        }

        container.innerHTML = contents.map(content => `
            <div class="content-card ${content.isActive ? 'active' : 'inactive'}" data-id="${content._id}">
                <div class="content-header">
                    <h3 class="content-keyword">#${content.keyword}</h3>
                    <span class="content-status ${content.isActive ? 'status-active' : 'status-inactive'}">
                        ${content.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
                <div class="content-meta">
                    <span class="content-category">${content.category}</span>
                    <span class="content-date">${new Date(content.createdAt).toLocaleDateString()}</span>
                </div>
                <h4 class="content-title">${content.title}</h4>
                <p class="content-preview">${content.content.substring(0, 150)}...</p>
                <div class="content-actions">
                    <button class="btn-edit" data-id="${content._id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </div>
            </div>
        `).join('');

        // Add edit event listeners
        container.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const contentId = e.target.closest('.btn-edit').dataset.id;
                this.editContent(contentId, contents);
            });
        });
    }

    async handleAddContent(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        const btn = e.target.querySelector('button');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<div class="loading"></div> Saving...';
        btn.disabled = true;

        try {
            const response = await fetch('/api/admin/content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('✅ Content added successfully!', 'success');
                e.target.reset();
                this.loadContent();
            } else {
                this.showNotification('❌ ' + (result.error || 'Failed to add content'), 'error');
            }
        } catch (error) {
            this.showNotification('🌐 Network error. Please try again.', 'error');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    editContent(contentId, contents) {
        const content = contents.find(c => c._id === contentId);
        if (!content) return;

        // Populate edit form
        document.getElementById('editId').value = content._id;
        document.getElementById('editKeyword').value = content.keyword;
        document.getElementById('editTitle').value = content.title;
        document.getElementById('editContent').value = content.content;
        document.getElementById('editCategory').value = content.category;
        document.getElementById('editIsActive').checked = content.isActive;

        this.showModal();
    }

    async handleEditContent(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        try {
            const response = await fetch(`/api/admin/content/${data.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('✅ Content updated successfully!', 'success');
                this.hideModal();
                this.loadContent();
            } else {
                this.showNotification('❌ ' + (result.error || 'Failed to update content'), 'error');
            }
        } catch (error) {
            this.showNotification('🌐 Network error. Please try again.', 'error');
        }
    }

    async handleDeleteContent() {
        const contentId = document.getElementById('editId').value;
        
        if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/content/${contentId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('✅ Content deleted successfully!', 'success');
                this.hideModal();
                this.loadContent();
            } else {
                this.showNotification('❌ ' + (result.error || 'Failed to delete content'), 'error');
            }
        } catch (error) {
            this.showNotification('🌐 Network error. Please try again.', 'error');
        }
    }

    showModal() {
        const modal = document.getElementById('editModal');
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    hideModal() {
        const modal = document.getElementById('editModal');
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
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
}

// Initialize admin manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdminManager();
});