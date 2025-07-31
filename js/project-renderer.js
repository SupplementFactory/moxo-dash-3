// Project Renderer - FIXED VERSION with Enhanced Error Handling
class ProjectRenderer {
    constructor() {
        this.dataStorage = null;
        this.currentProject = null;
        console.log('ProjectRenderer constructor called');
        this.init();
    }

    // Initialize renderer
    init() {
        try {
            console.log('Initializing project renderer...');
            
            // Wait for data storage to be available
            if (window.dataStorage) {
                this.dataStorage = window.dataStorage;
                this.loadProjectData();
                this.renderProject();
            } else {
                console.warn('DataStorage not available, retrying...');
                setTimeout(() => this.init(), 100);
            }
            
        } catch (error) {
            console.error('Error initializing project renderer:', error);
            this.showError('Failed to initialize project renderer');
        }
    }

    // Load project data
    loadProjectData() {
        try {
            console.log('Loading project data...');
            this.currentProject = this.dataStorage.getData();
            
            if (!this.currentProject) {
                console.warn('No project data found, using default');
                this.currentProject = this.dataStorage.getDefaultProjectData();
            }
            
            console.log('Project data loaded:', this.currentProject.name);
            
        } catch (error) {
            console.error('Error loading project data:', error);
            this.showError('Failed to load project data');
        }
    }

    // Render complete project
    renderProject() {
        try {
            console.log('Rendering project...');
            
            if (!this.currentProject) {
                throw new Error('No project data available for rendering');
            }
            
            this.updateProjectHeader();
            this.updateTimeline();
            this.updateProgress();
            this.updateNotes();
            this.renderRoadmap();
            this.updateProjectInfo();
            this.updateMetrics();
            
            console.log('Project rendering complete');
            
        } catch (error) {
            console.error('Error rendering project:', error);
            this.showError('Failed to render project');
        }
    }

    // Update project header
    updateProjectHeader() {
        try {
            const nameElement = document.getElementById('project-name');
            const statusElement = document.getElementById('project-status');
            
            if (nameElement) {
                nameElement.textContent = this.currentProject.name || 'Unknown Project';
            }
            
            if (statusElement) {
                statusElement.textContent = this.currentProject.status || 'Unknown Status';
                statusElement.className = `status-badge status-${(this.currentProject.status || '').toLowerCase().replace(' ', '-')}`;
            }
            
        } catch (error) {
            console.error('Error updating project header:', error);
        }
    }

    // Update timeline section
    updateTimeline() {
        try {
            const startDateElement = document.getElementById('start-date');
            const completionElement = document.getElementById('estimated-completion');
            const currentStageElement = document.getElementById('current-stage');
            const progressTextElement = document.getElementById('progress-text');
            const automationStatusElement = document.getElementById('automation-status');
            
            // Start date logic
            if (startDateElement) {
                if (this.currentProject.briefApprovalDate) {
                    startDateElement.textContent = new Date(this.currentProject.briefApprovalDate).toLocaleDateString();
                } else {
                    startDateElement.textContent = 'Awaiting brief approval';
                }
            }
            
            // Estimated completion
            if (completionElement) {
                if (this.currentProject.briefApprovalDate) {
                    const startDate = new Date(this.currentProject.briefApprovalDate);
                    const completionDate = new Date(startDate);
                    completionDate.setDate(startDate.getDate() + 28);
                    completionElement.textContent = completionDate.toLocaleDateString();
                } else {
                    completionElement.textContent = 'TBD';
                }
            }
            
            // Current stage name
            if (currentStageElement) {
                const currentStage = this.getCurrentStage();
                currentStageElement.textContent = currentStage ? currentStage.title : 'Unknown Stage';
            }
            
            // Progress text
            if (progressTextElement) {
                progressTextElement.textContent = `${this.currentProject.progress || 0}%`;
            }
            
            // Automation status
            if (automationStatusElement) {
                const statusSpan = automationStatusElement.querySelector('span');
                const statusDot = automationStatusElement.querySelector('.status-dot');
                
                if (statusSpan) {
                    statusSpan.textContent = this.currentProject.automationStatus || 'Unknown';
                }
                
                if (statusDot) {
                    statusDot.className = `status-dot ${(this.currentProject.automationStatus || '').toLowerCase()}`;
                }
            }
            
        } catch (error) {
            console.error('Error updating timeline:', error);
        }
    }

    // Update progress circle
    updateProgress() {
        try {
            const progressPercentage = document.getElementById('progress-percentage');
            const progressCircle = document.querySelector('.progress-ring-circle');
            
            const progress = this.currentProject.progress || 0;
            
            if (progressPercentage) {
                progressPercentage.textContent = `${progress}%`;
            }
            
            if (progressCircle) {
                const circumference = 2 * Math.PI * 54; // radius = 54
                const offset = circumference - (progress / 100) * circumference;
                
                progressCircle.style.strokeDasharray = circumference;
                progressCircle.style.strokeDashoffset = offset;
            }
            
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    }

    // Update project notes
    updateNotes() {
        try {
            const notesElement = document.getElementById('project-notes');
            
            if (notesElement) {
                notesElement.innerHTML = `<p>${this.currentProject.notes || 'No notes available.'}</p>`;
            }
            
        } catch (error) {
            console.error('Error updating notes:', error);
        }
    }

    // Render development roadmap
    renderRoadmap() {
        try {
            console.log('Rendering roadmap...');
            
            const roadmapContainer = document.getElementById('roadmap-container');
            
            if (!roadmapContainer) {
                throw new Error('Roadmap container not found');
            }
            
            // Clear loading message
            roadmapContainer.innerHTML = '';
            
            const stages = this.currentProject.roadmapStages || [];
            
            if (stages.length === 0) {
                roadmapContainer.innerHTML = '<div class="roadmap-error">No roadmap stages available</div>';
                return;
            }
            
            console.log(`Rendering ${stages.length} roadmap stages`);
            
            // Update stage statuses based on current stage
            this.updateStageStatuses(stages);
            
            // Create roadmap timeline
            const roadmapTimeline = document.createElement('div');
            roadmapTimeline.className = 'roadmap-timeline';
            
            stages.forEach((stage, index) => {
                const stageElement = this.createStageElement(stage, index);
                roadmapTimeline.appendChild(stageElement);
            });
            
            roadmapContainer.appendChild(roadmapTimeline);
            
            console.log('Roadmap rendering complete');
            
        } catch (error) {
            console.error('Error rendering roadmap:', error);
            const roadmapContainer = document.getElementById('roadmap-container');
            if (roadmapContainer) {
                roadmapContainer.innerHTML = '<div class="roadmap-error">Failed to load roadmap stages</div>';
            }
        }
    }

    // Update stage statuses based on current stage
    updateStageStatuses(stages) {
        try {
            const currentStageId = this.currentProject.currentStage || 1;
            
            stages.forEach(stage => {
                if (stage.id < currentStageId) {
                    stage.status = 'completed';
                } else if (stage.id === currentStageId) {
                    stage.status = 'active';
                } else {
                    stage.status = 'pending';
                }
            });
            
            console.log(`Updated stage statuses for current stage: ${currentStageId}`);
            
        } catch (error) {
            console.error('Error updating stage statuses:', error);
        }
    }

    // Create individual stage element
    createStageElement(stage, index) {
        const stageDiv = document.createElement('div');
        stageDiv.className = `roadmap-stage stage-${stage.status}`;
        stageDiv.setAttribute('data-stage-id', stage.id);
        
        // Stage number
        const stageNumber = document.createElement('div');
        stageNumber.className = 'stage-number';
        stageNumber.textContent = stage.id;
        
        // Stage content
        const stageContent = document.createElement('div');
        stageContent.className = 'stage-content';
        
        // Stage header
        const stageHeader = document.createElement('div');
        stageHeader.className = 'stage-header';
        
        const stageTitle = document.createElement('h4');
        stageTitle.className = 'stage-title';
        stageTitle.textContent = stage.title;
        
        const stageStatus = document.createElement('span');
        stageStatus.className = `stage-status status-${stage.status}`;
        stageStatus.textContent = stage.status.charAt(0).toUpperCase() + stage.status.slice(1);
        
        stageHeader.appendChild(stageTitle);
        stageHeader.appendChild(stageStatus);
        
        // Stage description
        const stageDescription = document.createElement('p');
        stageDescription.className = 'stage-description';
        stageDescription.textContent = stage.description;
        
        // Stage dates (if applicable)
        const stageDates = document.createElement('div');
        stageDates.className = 'stage-dates';
        
        if (stage.showDates) {
            if (stage.startDate && stage.endDate) {
                const startDate = new Date(stage.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const endDate = new Date(stage.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                stageDates.textContent = `${startDate} - ${endDate}`;
            } else if (this.currentProject.briefApprovalDate) {
                // Calculate dates if brief is approved
                const briefDate = new Date(this.currentProject.briefApprovalDate);
                const stageStart = new Date(briefDate);
                stageStart.setDate(briefDate.getDate() + (stage.dayOffset || 0) - 1);
                
                const stageEnd = new Date(stageStart);
                stageEnd.setDate(stageStart.getDate() + stage.duration - 1);
                
                const startStr = stageStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const endStr = stageEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                stageDates.textContent = `${startStr} - ${endStr}`;
            } else {
                stageDates.textContent = 'Dates TBD';
            }
        } else {
            stageDates.textContent = 'No dates assigned';
        }
        
        // Assemble stage content
        stageContent.appendChild(stageHeader);
        stageContent.appendChild(stageDescription);
        stageContent.appendChild(stageDates);
        
        // Assemble complete stage
        stageDiv.appendChild(stageNumber);
        stageDiv.appendChild(stageContent);
        
        return stageDiv;
    }

    // Update project information
    updateProjectInfo() {
        try {
            const descriptionElement = document.getElementById('project-description');
            const ingredientsElement = document.getElementById('key-ingredients');
            const specsElement = document.getElementById('target-specs');
            const createdElement = document.getElementById('created-date');
            const updatedElement = document.getElementById('last-updated');
            const managerElement = document.getElementById('project-manager');
            
            if (descriptionElement) {
                descriptionElement.textContent = this.currentProject.description || 'No description available';
            }
            
            if (ingredientsElement) {
                ingredientsElement.textContent = this.currentProject.keyIngredients || 'No ingredients specified';
            }
            
            if (specsElement) {
                specsElement.textContent = this.currentProject.targetSpecs || 'No specifications available';
            }
            
            if (createdElement) {
                createdElement.textContent = this.currentProject.createdDate || 'Unknown';
            }
            
            if (updatedElement) {
                updatedElement.textContent = this.currentProject.lastUpdated || 'Unknown';
            }
            
            if (managerElement) {
                managerElement.textContent = this.currentProject.projectManager || 'Unknown';
            }
            
        } catch (error) {
            console.error('Error updating project info:', error);
        }
    }

    // Update metrics
    updateMetrics() {
        try {
            const testsElement = document.getElementById('tests-completed');
            const qualityElement = document.getElementById('quality-score');
            const efficiencyElement = document.getElementById('time-efficiency');
            const budgetElement = document.getElementById('budget-used');
            const remainingElement = document.getElementById('budget-remaining');
            
            if (testsElement) {
                testsElement.textContent = `${this.currentProject.testsCompleted || 0}/${this.currentProject.totalTests || 19}`;
            }
            
            if (qualityElement) {
                qualityElement.textContent = `${this.currentProject.qualityScore || 0}%`;
            }
            
            if (efficiencyElement) {
                efficiencyElement.textContent = `${this.currentProject.timeEfficiency || 0}%`;
            }
            
            if (budgetElement) {
                budgetElement.textContent = `$${(this.currentProject.budgetUsed || 0).toLocaleString()}`;
            }
            
            if (remainingElement) {
                const remaining = (this.currentProject.totalBudget || 0) - (this.currentProject.budgetUsed || 0);
                remainingElement.textContent = `$${remaining.toLocaleString()} remaining`;
            }
            
        } catch (error) {
            console.error('Error updating metrics:', error);
        }
    }

    // Get current stage
    getCurrentStage() {
        try {
            const stages = this.currentProject.roadmapStages || [];
            const currentStageId = this.currentProject.currentStage || 1;
            return stages.find(stage => stage.id === currentStageId) || stages[0];
        } catch (error) {
            console.error('Error getting current stage:', error);
            return null;
        }
    }

    // Show error message
    showError(message) {
        console.error('ProjectRenderer error:', message);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'renderer-error';
        errorDiv.innerHTML = `
            <h3>⚠️ Rendering Error</h3>
            <p>${message}</p>
            <button onclick="location.reload()">Reload Page</button>
        `;
        
        // Try to insert error into main content
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.insertBefore(errorDiv, mainContent.firstChild);
        }
    }

    // Refresh project data and re-render
    refresh() {
        try {
            console.log('Refreshing project renderer...');
            this.loadProjectData();
            this.renderProject();
        } catch (error) {
            console.error('Error refreshing project renderer:', error);
            this.showError('Failed to refresh project data');
        }
    }
}

// Make ProjectRenderer available globally
window.ProjectRenderer = ProjectRenderer;
console.log('ProjectRenderer class defined and available globally');

