// Dashboard Controller - FIXED VERSION
class DashboardController {
    constructor() {
        this.dataStorage = null;
        this.projectRenderer = null;
        this.currentProject = null;
        this.automationInterval = null;
        console.log('DashboardController constructor called');
    }

    // Initialize dashboard
    initialize() {
        try {
            console.log('Initializing dashboard...');
            
            // Wait for dependencies to be available
            if (!window.dataStorage) {
                console.log('Waiting for DataStorage...');
                setTimeout(() => this.initialize(), 100);
                return;
            }
            
            if (!window.projectRenderer) {
                console.log('Waiting for ProjectRenderer...');
                setTimeout(() => this.initialize(), 100);
                return;
            }
            
            // Set up references
            this.dataStorage = window.dataStorage;
            this.projectRenderer = window.projectRenderer;
            
            // Load project data
            this.loadProject();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Start automation if enabled
            this.startAutomation();
            
            console.log('Dashboard initialization complete');
            
        } catch (error) {
            console.error('Error initializing dashboard:', error);
            this.showError('Failed to initialize dashboard: ' + error.message);
        }
    }

    // Load project data
    loadProject() {
        try {
            this.currentProject = this.dataStorage.getData();
            
            if (!this.currentProject) {
                console.log('No project data found, creating default');
                this.currentProject = this.dataStorage.getDefaultProjectData();
                this.dataStorage.setData(this.currentProject);
            }
            
            console.log('Project loaded:', this.currentProject.name);
            
        } catch (error) {
            console.error('Error loading project:', error);
            this.showError('Failed to load project data');
        }
    }

    // Set up event listeners
    setupEventListeners() {
        try {
            // Edit project button
            const editBtn = document.getElementById('edit-project-btn');
            if (editBtn) {
                editBtn.addEventListener('click', () => {
                    this.navigateToEdit();
                });
            }
            
            // Storage change listener for real-time updates
            window.addEventListener('storage', (e) => {
                if (e.key === 'supplement_project_data') {
                    this.handleDataUpdate();
                }
            });
            
            // Custom event listener for data updates
            window.addEventListener('projectDataUpdated', () => {
                this.handleDataUpdate();
            });
            
            console.log('Event listeners set up');
            
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }

    // Navigate to edit page
    navigateToEdit() {
        try {
            const projectId = this.currentProject.id || this.currentProject.slug || 'default';
            window.location.href = `edit.html?project=${projectId}`;
        } catch (error) {
            console.error('Error navigating to edit:', error);
        }
    }

    // Handle data updates
    handleDataUpdate() {
        try {
            console.log('Handling data update...');
            this.loadProject();
            
            if (this.projectRenderer) {
                this.projectRenderer.refresh();
            }
            
        } catch (error) {
            console.error('Error handling data update:', error);
        }
    }

    // Start automation
    startAutomation() {
        try {
            if (this.currentProject.automationStatus === 'Running') {
                console.log('Starting automation...');
                
                // Update every 30 seconds
                this.automationInterval = setInterval(() => {
                    this.updateAutomatedProgress();
                }, 30000);
                
                // Initial update
                this.updateAutomatedProgress();
            }
            
        } catch (error) {
            console.error('Error starting automation:', error);
        }
    }

    // Stop automation
    stopAutomation() {
        if (this.automationInterval) {
            clearInterval(this.automationInterval);
            this.automationInterval = null;
            console.log('Automation stopped');
        }
    }

    // Update automated progress
    updateAutomatedProgress() {
        try {
            if (!this.currentProject.briefApprovalDate) {
                return; // Can't calculate progress without start date
            }
            
            const startDate = new Date(this.currentProject.briefApprovalDate);
            const currentDate = new Date();
            const daysPassed = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
            
            // Calculate which stage we should be in
            const stages = this.currentProject.roadmapStages || [];
            let currentStageId = 3; // Default to brief approved
            let progress = 15; // Default progress
            
            // Find the appropriate stage based on days passed
            for (let i = 0; i < stages.length; i++) {
                const stage = stages[i];
                if (stage.dayOffset && daysPassed >= stage.dayOffset) {
                    // Ensure we don't exceed stage 19
                    currentStageId = Math.min(stage.id, 19);
                    progress = Math.min(95, (daysPassed / 28) * 100); // Max 95% until completion
                }
            }
            
            // If we've reached stage 19, set progress to 100%
            if (currentStageId === 19) {
                progress = 100;
            }
            
            // Validate stage limits (must be between 1 and 19)
            currentStageId = Math.max(1, Math.min(19, currentStageId));
            progress = Math.max(0, Math.min(100, progress));
            
            // Update project data if changed
            if (this.currentProject.currentStage !== currentStageId || 
                Math.abs(this.currentProject.progress - progress) > 1) {
                
                this.currentProject.currentStage = currentStageId;
                this.currentProject.progress = Math.round(progress);
                
                // Update tests completed based on stage
                this.currentProject.testsCompleted = Math.min(currentStageId, 19);
                
                // Update last updated timestamp
                this.currentProject.lastUpdated = new Date().toISOString().split('T')[0];
                
                this.dataStorage.setData(this.currentProject);
                
                // Trigger re-render
                if (this.projectRenderer) {
                    this.projectRenderer.refresh();
                }
                
                console.log(`Automated update: Stage ${currentStageId}, Progress ${progress}%`);
                
                // Stop automation if project is complete
                if (currentStageId === 19 && progress === 100) {
                    this.currentProject.automationStatus = 'Completed';
                    this.currentProject.status = 'Completed';
                    this.stopAutomation();
                    console.log('Project completed - automation stopped');
                }
            }
            
        } catch (error) {
            console.error('Error updating automated progress:', error);
        }
    }

    // Update project status theme
    updateStatusTheme(status) {
        try {
            const body = document.body;
            
            // Remove existing status classes
            body.classList.remove('status-in-progress', 'status-delayed', 'status-on-hold', 'status-cancelled');
            
            // Add new status class
            const statusClass = `status-${status.toLowerCase().replace(' ', '-')}`;
            body.classList.add(statusClass);
            
            console.log('Status theme updated:', statusClass);
            
        } catch (error) {
            console.error('Error updating status theme:', error);
        }
    }

    // Show error message
    showError(message) {
        console.error('Dashboard error:', message);
        
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            const errorContent = errorElement.querySelector('.error-content h2');
            if (errorContent) {
                errorContent.textContent = `⚠️ ${message}`;
            }
            errorElement.style.display = 'block';
        }
    }

    // Hide error message
    hideError() {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    // Refresh dashboard
    refresh() {
        try {
            console.log('Refreshing dashboard...');
            this.loadProject();
            
            if (this.projectRenderer) {
                this.projectRenderer.refresh();
            }
            
            this.updateStatusTheme(this.currentProject.status);
            
        } catch (error) {
            console.error('Error refreshing dashboard:', error);
            this.showError('Failed to refresh dashboard');
        }
    }

    // Destroy dashboard (cleanup)
    destroy() {
        this.stopAutomation();
        
        // Remove event listeners
        window.removeEventListener('storage', this.handleDataUpdate);
        window.removeEventListener('projectDataUpdated', this.handleDataUpdate);
        
        console.log('Dashboard destroyed');
    }
}

// Legacy Dashboard class for compatibility
class Dashboard {
    constructor() {
        this.controller = new DashboardController();
        this.renderer = {
            initialize: () => {
                console.log('Legacy renderer.initialize called - delegating to controller');
                this.controller.initialize();
            }
        };
        console.log('Legacy Dashboard wrapper created');
    }

    initialize() {
        console.log('Legacy Dashboard.initialize called - delegating to controller');
        this.controller.initialize();
    }
}

// Make both classes available globally
window.DashboardController = DashboardController;
window.Dashboard = Dashboard;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM ready, creating dashboard...');
    
    // Create global dashboard instance
    window.dashboardController = new DashboardController();
    
    // Initialize after a short delay to ensure all scripts are loaded
    setTimeout(() => {
        window.dashboardController.initialize();
    }, 100);
});

console.log('Dashboard classes defined and available globally');

