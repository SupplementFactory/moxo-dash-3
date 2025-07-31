// Project Card Renderer for Backend Dashboard
class ProjectCardRenderer {
    constructor(storage) {
        this.storage = storage;
        this.container = null;
    }

    // Initialize renderer
    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container with ID '${containerId}' not found`);
            return;
        }
    }

    // Render all projects
    renderProjects(projects = null) {
        if (!this.container) {
            console.error('Renderer not initialized');
            return;
        }

        const projectsToRender = projects || this.storage.getAllProjects();
        
        if (projectsToRender.length === 0) {
            this.renderEmptyState();
            return;
        }

        this.container.innerHTML = '';
        
        projectsToRender.forEach(project => {
            const projectCard = this.createProjectCard(project);
            this.container.appendChild(projectCard);
        });
    }

    // Create individual project card
    createProjectCard(project) {
        const card = document.createElement('div');
        card.className = `project-card status-${project.status.toLowerCase().replace(' ', '-')}`;
        card.setAttribute('data-project-id', project.id);

        const dates = this.storage.calculateProjectDates(project);
        
        card.innerHTML = `
            <div class="project-card-header">
                <div>
                    <h3 class="project-title">${this.escapeHtml(project.name)}</h3>
                    <div class="project-meta">
                        <span class="project-manager">${this.escapeHtml(project.projectManager.split(',')[0])}</span>
                        <span class="project-date">Created ${this.formatDate(project.createdDate)}</span>
                    </div>
                </div>
                <span class="project-status ${project.status.toLowerCase().replace(' ', '-')}">${project.status}</span>
            </div>
            
            <p class="project-description">${this.escapeHtml(project.description)}</p>
            
            <div class="project-progress">
                <div class="project-progress-header">
                    <span class="project-progress-label">Progress</span>
                    <span class="project-progress-value">${project.progress}%</span>
                </div>
                <div class="project-progress-bar">
                    <div class="project-progress-fill" style="width: ${project.progress}%"></div>
                </div>
            </div>
            
            <div class="project-timeline-info">
                <div class="timeline-item">
                    <span class="timeline-label">Current Stage:</span>
                    <span class="timeline-value">${dates.currentStageName}</span>
                </div>
                <div class="timeline-item">
                    <span class="timeline-label">Start Date:</span>
                    <span class="timeline-value">${dates.startDate}</span>
                </div>
                <div class="timeline-item">
                    <span class="timeline-label">Est. Completion:</span>
                    <span class="timeline-value">${dates.estimatedCompletion}</span>
                </div>
            </div>
            
            <div class="project-metrics">
                <div class="metric-item">
                    <span class="metric-label">Quality Score</span>
                    <span class="metric-value">${project.qualityScore}%</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Budget Used</span>
                    <span class="metric-value">$${project.budgetUsed.toLocaleString()}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Time Efficiency</span>
                    <span class="metric-value">${project.timeEfficiency}%</span>
                </div>
            </div>
            
            <div class="project-actions">
                <a href="index.html?project=${project.slug}" class="project-btn primary">View Dashboard</a>
                <a href="edit.html?project=${project.slug}" class="project-btn">Edit Project</a>
            </div>
        `;

        // Add click handler for card
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking on buttons
            if (e.target.closest('.project-actions')) {
                return;
            }
            
            // Navigate to project dashboard
            window.location.href = `index.html?project=${project.slug}`;
        });

        return card;
    }

    // Render empty state
    renderEmptyState() {
        this.container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <h3>No Projects Found</h3>
                <p>Create your first supplement formulation project to get started.</p>
                <button class="btn btn-primary" onclick="document.getElementById('create-project-btn').click()">
                    Create New Project
                </button>
            </div>
        `;
    }

    // Update project statistics
    updateStatistics() {
        const stats = this.storage.getProjectStatistics();
        
        // Update stat values
        this.updateElement('total-projects', stats.total);
        this.updateElement('active-projects', stats.active);
        this.updateElement('completed-projects', stats.completed);
        this.updateElement('delayed-projects', stats.delayed);
        
        // Update progress bars
        const avgProgressBar = document.querySelector('.progress-summary .progress-fill');
        if (avgProgressBar) {
            avgProgressBar.style.width = `${stats.averageProgress}%`;
            const progressValue = avgProgressBar.parentElement.parentElement.querySelector('.progress-value');
            if (progressValue) {
                progressValue.textContent = `${stats.averageProgress}%`;
            }
        }
        
        const scheduleProgressBar = document.querySelectorAll('.progress-summary .progress-fill')[1];
        if (scheduleProgressBar) {
            scheduleProgressBar.style.width = `${stats.onSchedulePercentage}%`;
            const scheduleValue = scheduleProgressBar.parentElement.parentElement.querySelector('.progress-value');
            if (scheduleValue) {
                scheduleValue.textContent = `${stats.onSchedulePercentage}%`;
            }
        }
    }

    // Update recent activity
    updateActivity() {
        const activities = this.storage.getRecentActivity();
        const activityContainer = document.getElementById('activity-list');
        
        if (!activityContainer) return;
        
        activityContainer.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-content">
                    <div class="activity-title">${this.escapeHtml(activity.name)} ${activity.action}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }

    // Filter and sort projects
    filterProjects(filters) {
        const filteredProjects = this.storage.filterProjects(filters);
        this.renderProjects(filteredProjects);
    }

    // Utility methods
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    // Refresh all data
    refresh() {
        this.renderProjects();
        this.updateStatistics();
        this.updateActivity();
    }
}

// Initialize global renderer instance
window.projectCardRenderer = new ProjectCardRenderer(window.multiProjectStorage);

