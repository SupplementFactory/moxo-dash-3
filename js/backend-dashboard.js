// Backend Dashboard Controller
class BackendDashboard {
    constructor() {
        this.storage = window.multiProjectStorage;
        this.renderer = window.projectCardRenderer;
        this.currentFilters = {
            status: 'all',
            sort: 'recent'
        };
        this.init();
    }

    // Initialize dashboard
    init() {
        this.setupEventListeners();
        this.initializeRenderer();
        this.loadDashboard();
        this.startAutoRefresh();
    }

    // Setup event listeners
    setupEventListeners() {
        // Create project button
        const createBtn = document.getElementById('create-project-btn');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.showCreateModal());
        }

        // Modal controls
        const modal = document.getElementById('create-project-modal');
        const closeBtn = document.getElementById('modal-close');
        const cancelBtn = document.getElementById('cancel-create');
        
        if (closeBtn) closeBtn.addEventListener('click', () => this.hideCreateModal());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.hideCreateModal());
        
        // Close modal on backdrop click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideCreateModal();
                }
            });
        }

        // Create project form
        const createForm = document.getElementById('create-project-form');
        if (createForm) {
            createForm.addEventListener('submit', (e) => this.handleCreateProject(e));
        }

        // Filter controls
        const statusFilter = document.getElementById('status-filter');
        const sortFilter = document.getElementById('sort-filter');
        
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentFilters.status = e.target.value;
                this.applyFilters();
            });
        }
        
        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.currentFilters.sort = e.target.value;
                this.applyFilters();
            });
        }

        // View controls
        const viewBtns = document.querySelectorAll('.view-btn');
        viewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                viewBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                // View switching logic can be added here
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'n':
                        e.preventDefault();
                        this.showCreateModal();
                        break;
                    case 'r':
                        e.preventDefault();
                        this.refreshDashboard();
                        break;
                }
            }
        });
    }

    // Initialize renderer
    initializeRenderer() {
        this.renderer.init('projects-grid');
    }

    // Load dashboard data
    loadDashboard() {
        this.showLoadingScreen();
        
        // Simulate loading delay for better UX
        setTimeout(() => {
            this.renderer.refresh();
            this.hideLoadingScreen();
            this.updateSyncIndicator('synced');
        }, 1500);
    }

    // Show create project modal
    showCreateModal() {
        const modal = document.getElementById('create-project-modal');
        if (modal) {
            modal.classList.add('active');
            
            // Focus on first input
            const firstInput = modal.querySelector('input[type="text"]');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    // Hide create project modal
    hideCreateModal() {
        const modal = document.getElementById('create-project-modal');
        if (modal) {
            modal.classList.remove('active');
            
            // Reset form
            const form = document.getElementById('create-project-form');
            if (form) {
                form.reset();
            }
        }
    }

    // Handle create project form submission
    handleCreateProject(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const projectData = {
            name: formData.get('projectName'),
            description: formData.get('description'),
            projectManager: formData.get('projectManager'),
            briefApprovalDate: formData.get('briefApprovalDate') || null
        };

        // Validate required fields
        if (!projectData.name || !projectData.projectManager) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        try {
            // Create project
            const newProject = this.storage.createProject(projectData);
            
            // Hide modal
            this.hideCreateModal();
            
            // Refresh dashboard
            this.renderer.refresh();
            
            // Show success notification
            this.showNotification(`Project "${newProject.name}" created successfully!`, 'success');
            
            // Optionally navigate to new project
            setTimeout(() => {
                window.location.href = `index.html?project=${newProject.slug}`;
            }, 1500);
            
        } catch (error) {
            console.error('Error creating project:', error);
            this.showNotification('Error creating project. Please try again.', 'error');
        }
    }

    // Apply filters
    applyFilters() {
        this.updateSyncIndicator('syncing');
        this.renderer.filterProjects(this.currentFilters);
        this.updateSyncIndicator('synced');
    }

    // Refresh dashboard
    refreshDashboard() {
        this.updateSyncIndicator('syncing');
        this.renderer.refresh();
        this.updateSyncIndicator('synced');
        this.showNotification('Dashboard refreshed', 'info');
    }

    // Show loading screen
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            
            // Animate progress bar
            const progressBar = loadingScreen.querySelector('.loading-progress');
            if (progressBar) {
                progressBar.style.width = '0%';
                setTimeout(() => {
                    progressBar.style.width = '100%';
                }, 100);
            }
        }
    }

    // Hide loading screen
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }

    // Update sync indicator
    updateSyncIndicator(status) {
        const indicator = document.getElementById('sync-indicator');
        if (!indicator) return;
        
        const dot = indicator.querySelector('.sync-dot');
        if (!dot) return;
        
        // Remove existing classes
        dot.classList.remove('syncing', 'synced', 'error');
        
        // Add new status class
        dot.classList.add(status);
        
        // Update title
        const titles = {
            syncing: 'Syncing data...',
            synced: 'Data synchronized',
            error: 'Sync error'
        };
        
        indicator.title = titles[status] || 'Unknown status';
    }

    // Show notification
    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">×</button>
            </div>
        `;
        
        // Add close handler
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });
        
        // Add to container
        container.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
    }

    // Start auto refresh
    startAutoRefresh() {
        // Refresh every 30 seconds
        setInterval(() => {
            this.renderer.updateStatistics();
            this.renderer.updateActivity();
        }, 30000);
    }

    // Handle project navigation
    navigateToProject(projectSlug, page = 'dashboard') {
        const urls = {
            dashboard: `index.html?project=${projectSlug}`,
            edit: `edit.html?project=${projectSlug}`
        };
        
        window.location.href = urls[page] || urls.dashboard;
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.backendDashboard = new BackendDashboard();
});

// Add notification styles
const notificationStyles = `
<style>
.notification-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.notification {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 400px;
}

.notification.show {
    transform: translateX(0);
}

.notification-success {
    border-left: 4px solid var(--success-color);
}

.notification-error {
    border-left: 4px solid var(--danger-color);
}

.notification-info {
    border-left: 4px solid var(--primary-color);
}

.notification-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.notification-message {
    color: var(--text-primary);
    font-size: 0.875rem;
}

.notification-close {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 0;
    line-height: 1;
}

.notification-close:hover {
    color: var(--text-primary);
}

.sync-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 6px;
    background: var(--bg-secondary);
}

.sync-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--secondary-color);
    transition: all 0.3s ease;
}

.sync-dot.syncing {
    background: var(--warning-color);
    animation: pulse 1s infinite;
}

.sync-dot.synced {
    background: var(--success-color);
}

.sync-dot.error {
    background: var(--danger-color);
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

.empty-state {
    text-align: center;
    padding: 3rem;
    color: var(--text-secondary);
}

.empty-state-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.empty-state h3 {
    color: var(--text-primary);
    margin-bottom: 0.5rem;
}

.empty-state p {
    margin-bottom: 1.5rem;
}

.timeline-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.25rem 0;
    font-size: 0.875rem;
}

.timeline-label {
    color: var(--text-secondary);
    font-weight: 500;
}

.timeline-value {
    color: var(--text-primary);
    font-weight: 600;
}

.project-timeline-info {
    margin: 1rem 0;
    padding: 1rem;
    background: var(--bg-secondary);
    border-radius: 8px;
    border: 1px solid var(--border-color);
}

.project-metrics {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    margin: 1rem 0;
}

.metric-item {
    text-align: center;
    padding: 0.5rem;
    background: var(--bg-secondary);
    border-radius: 6px;
    border: 1px solid var(--border-color);
}

.metric-label {
    display: block;
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-bottom: 0.25rem;
}

.metric-value {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
}
</style>
`;

// Inject notification styles
document.head.insertAdjacentHTML('beforeend', notificationStyles);

