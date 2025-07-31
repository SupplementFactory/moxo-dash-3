// Enhanced Data Storage - Uses API instead of localStorage
class DataStorageEnhanced {
    constructor() {
        this.apiClient = window.apiClient;
        this.currentProject = null;
        this.isInitialized = false;
        console.log('DataStorageEnhanced constructor called');
    }

    // Initialize data storage
    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('Initializing enhanced data storage...');

            // Check authentication first
            if (!this.apiClient.isAuthenticated()) {
                console.warn('User not authenticated');
                return;
            }

            // Initialize database if needed (first-time setup)
            try {
                await this.apiClient.initializeDatabase();
            } catch (error) {
                console.warn('Database initialization skipped (may already exist):', error.message);
            }

            // Load project data based on user type and current page
            await this.loadProjectData();
            
            this.isInitialized = true;
            console.log('Enhanced data storage initialized successfully');

        } catch (error) {
            console.error('Error initializing enhanced data storage:', error);
            throw error;
        }
    }

    // Load project data based on context
    async loadProjectData() {
        try {
            const currentUser = this.apiClient.currentUser;
            const currentPath = window.location.pathname;

            if (currentUser.type === 'client') {
                // Client user - load their specific project
                const projectSlug = currentUser.project.slug;
                this.currentProject = await this.apiClient.getProjectBySlug(projectSlug);
                console.log('Loaded client project:', this.currentProject.name);
            } else if (currentUser.type === 'company') {
                // Company user - load project based on URL or default to first project
                if (currentPath.startsWith('/projects/')) {
                    const slug = currentPath.split('/projects/')[1];
                    this.currentProject = await this.apiClient.getProjectBySlug(slug);
                } else {
                    // On dashboard - load first project as default
                    const projects = await this.apiClient.getAllProjects();
                    this.currentProject = projects.length > 0 ? projects[0] : null;
                }
                
                if (this.currentProject) {
                    console.log('Loaded company project:', this.currentProject.name);
                }
            }

            if (!this.currentProject) {
                console.warn('No project data loaded');
            }

        } catch (error) {
            console.error('Error loading project data:', error);
            throw error;
        }
    }

    // Get current project data
    getData() {
        return this.currentProject;
    }

    // Save project data
    async saveData(data) {
        try {
            if (!this.currentProject || !this.currentProject.id) {
                throw new Error('No current project to save');
            }

            // Only company users can save data
            if (!this.apiClient.isCompanyUser()) {
                throw new Error('Only company users can modify project data');
            }

            const updatedProject = await this.apiClient.updateProject(this.currentProject.id, data);
            this.currentProject = updatedProject;
            
            console.log('Project data saved successfully');
            return updatedProject;

        } catch (error) {
            console.error('Error saving project data:', error);
            throw error;
        }
    }

    // Get all projects (company users only)
    async getAllProjects() {
        try {
            if (!this.apiClient.isCompanyUser()) {
                throw new Error('Only company users can access all projects');
            }

            return await this.apiClient.getAllProjects();
        } catch (error) {
            console.error('Error fetching all projects:', error);
            throw error;
        }
    }

    // Create new project (company users only)
    async createProject(projectData) {
        try {
            if (!this.apiClient.isCompanyUser()) {
                throw new Error('Only company users can create projects');
            }

            const newProject = await this.apiClient.createProject(projectData);
            console.log('New project created:', newProject.name);
            return newProject;

        } catch (error) {
            console.error('Error creating project:', error);
            throw error;
        }
    }

    // Delete project (company users only)
    async deleteProject(projectId) {
        try {
            if (!this.apiClient.isCompanyUser()) {
                throw new Error('Only company users can delete projects');
            }

            await this.apiClient.deleteProject(projectId);
            console.log('Project deleted successfully');

        } catch (error) {
            console.error('Error deleting project:', error);
            throw error;
        }
    }

    // Subscribe to real-time updates
    subscribeToUpdates(callback) {
        if (!this.currentProject) {
            console.warn('No current project to subscribe to');
            return () => {};
        }

        return this.apiClient.subscribeToProjectUpdates(this.currentProject.id, (updatedProject) => {
            this.currentProject = updatedProject;
            callback(updatedProject);
        });
    }

    // Get default project data structure (for compatibility)
    getDefaultProjectData() {
        return {
            id: null,
            name: 'New Project',
            description: 'Project description',
            status: 'In Progress',
            automation_status: 'Running',
            current_stage: 1,
            progress: 0,
            time_efficiency: 100,
            tests_completed: 0,
            total_tests: 19,
            quality_score: 0.0,
            budget_used: 0.0,
            budget_total: 0.0,
            project_manager: 'Project Manager',
            created_date: new Date().toISOString().split('T')[0],
            last_updated: new Date().toISOString().split('T')[0],
            delay_notes: '',
            key_ingredients: '',
            target_specs: ''
        };
    }

    // Convert database format to frontend format (for compatibility)
    formatProjectForFrontend(project) {
        if (!project) return null;

        return {
            ...project,
            // Map database fields to frontend expectations
            projectName: project.name,
            currentStage: project.current_stage,
            briefApprovalDate: project.brief_approval_date,
            timeEfficiency: project.time_efficiency,
            testsCompleted: project.tests_completed,
            totalTests: project.total_tests,
            qualityScore: project.quality_score,
            budgetUsed: project.budget_used,
            budgetTotal: project.budget_total,
            projectManager: project.project_manager,
            createdDate: project.created_date,
            lastUpdated: project.last_updated,
            delayNotes: project.delay_notes,
            keyIngredients: project.key_ingredients,
            targetSpecs: project.target_specs,
            automationStatus: project.automation_status
        };
    }
}

// Create global instance (will be initialized by auth manager)
window.dataStorageEnhanced = new DataStorageEnhanced();

