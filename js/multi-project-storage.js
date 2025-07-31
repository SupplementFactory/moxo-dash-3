// Multi-Project Data Storage and Management System
class MultiProjectStorage {
    constructor() {
        this.storageKey = 'supplement_projects';
        this.currentProjectKey = 'current_project_id';
        this.initializeStorage();
    }

    // Initialize storage with sample data if empty
    initializeStorage() {
        const existingProjects = this.getAllProjects();
        if (existingProjects.length === 0) {
            this.createSampleProjects();
        }
    }

    // Create sample projects for demonstration
    createSampleProjects() {
        const sampleProjects = [
            {
                id: 'heal-greens-blend',
                name: 'Heal - Greens Blend',
                description: 'Premium organic greens blend featuring spirulina, chlorella, wheatgrass, and barley grass. Formulated for maximum bioavailability and nutrient density with natural flavor enhancement.',
                status: 'In Progress',
                automationStatus: 'Running',
                currentStage: 2,
                briefApprovalDate: null,
                progress: 10,
                timeEfficiency: 100,
                testsCompleted: 2,
                totalTests: 19,
                qualityScore: 85.0,
                budgetUsed: 1250,
                budgetTotal: 15000,
                projectManager: 'Dr. Sarah Chen, PhD - Senior Formulation Scientist',
                createdDate: '2025-07-15',
                lastUpdated: '2025-07-24',
                delayNotes: 'Project initiated. Awaiting client approval of formulation brief to begin development timeline.',
                slug: 'heal-greens-blend'
            },
            {
                id: 'immune-support-complex',
                name: 'Immune Support Complex',
                description: 'Advanced immune system support formula combining vitamin C, zinc, elderberry, and echinacea with proprietary absorption enhancers.',
                status: 'In Progress',
                automationStatus: 'Running',
                currentStage: 8,
                briefApprovalDate: '2025-07-10',
                progress: 42,
                timeEfficiency: 95,
                testsCompleted: 8,
                totalTests: 19,
                qualityScore: 92.5,
                budgetUsed: 6300,
                budgetTotal: 18000,
                projectManager: 'Dr. Michael Rodriguez, PhD - Lead Researcher',
                createdDate: '2025-07-10',
                lastUpdated: '2025-07-24',
                delayNotes: '',
                slug: 'immune-support-complex'
            },
            {
                id: 'energy-boost-formula',
                name: 'Energy Boost Formula',
                description: 'Natural energy enhancement supplement with B-vitamins, adaptogens, and caffeine from green coffee beans for sustained energy without crashes.',
                status: 'Completed',
                automationStatus: 'Paused',
                currentStage: 19,
                briefApprovalDate: '2025-06-20',
                progress: 100,
                timeEfficiency: 105,
                testsCompleted: 19,
                totalTests: 19,
                qualityScore: 96.8,
                budgetUsed: 14500,
                budgetTotal: 16000,
                projectManager: 'Dr. Emily Watson, PhD - Regulatory Specialist',
                createdDate: '2025-06-20',
                lastUpdated: '2025-07-21',
                delayNotes: '',
                slug: 'energy-boost-formula'
            }
        ];

        localStorage.setItem(this.storageKey, JSON.stringify(sampleProjects));
    }

    // Get all projects
    getAllProjects() {
        const projects = localStorage.getItem(this.storageKey);
        return projects ? JSON.parse(projects) : [];
    }

    // Get project by ID
    getProject(projectId) {
        const projects = this.getAllProjects();
        return projects.find(project => project.id === projectId || project.slug === projectId);
    }

    // Create new project
    createProject(projectData) {
        const projects = this.getAllProjects();
        
        // Generate unique ID and slug
        const id = this.generateProjectId(projectData.name);
        const slug = this.generateSlug(projectData.name);
        
        const newProject = {
            id: id,
            slug: slug,
            name: projectData.name,
            description: projectData.description || '',
            status: 'In Progress',
            automationStatus: 'Running',
            currentStage: projectData.briefApprovalDate ? 3 : 1,
            briefApprovalDate: projectData.briefApprovalDate || null,
            progress: projectData.briefApprovalDate ? 15 : 5,
            timeEfficiency: 100,
            testsCompleted: projectData.briefApprovalDate ? 3 : 1,
            totalTests: 19,
            qualityScore: 85.0,
            budgetUsed: 0,
            budgetTotal: 15000,
            projectManager: projectData.projectManager || 'Dr. Sarah Chen, PhD - Senior Formulation Scientist',
            createdDate: new Date().toISOString().split('T')[0],
            lastUpdated: new Date().toISOString().split('T')[0],
            delayNotes: projectData.briefApprovalDate ? 'Project started. Brief approved and development timeline initiated.' : 'Project created. Awaiting brief approval to begin development timeline.',
            ...projectData
        };

        projects.push(newProject);
        localStorage.setItem(this.storageKey, JSON.stringify(projects));
        
        return newProject;
    }

    // Update project
    updateProject(projectId, updates) {
        const projects = this.getAllProjects();
        const projectIndex = projects.findIndex(project => project.id === projectId || project.slug === projectId);
        
        if (projectIndex !== -1) {
            projects[projectIndex] = {
                ...projects[projectIndex],
                ...updates,
                lastUpdated: new Date().toISOString().split('T')[0]
            };
            
            localStorage.setItem(this.storageKey, JSON.stringify(projects));
            return projects[projectIndex];
        }
        
        return null;
    }

    // Delete project
    deleteProject(projectId) {
        const projects = this.getAllProjects();
        const filteredProjects = projects.filter(project => 
            project.id !== projectId && project.slug !== projectId
        );
        
        localStorage.setItem(this.storageKey, JSON.stringify(filteredProjects));
        return filteredProjects;
    }

    // Generate unique project ID
    generateProjectId(name) {
        const baseId = name.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        
        const projects = this.getAllProjects();
        let counter = 1;
        let uniqueId = baseId;
        
        while (projects.some(project => project.id === uniqueId)) {
            uniqueId = `${baseId}-${counter}`;
            counter++;
        }
        
        return uniqueId;
    }

    // Generate URL slug
    generateSlug(name) {
        return name.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    // Get project statistics
    getProjectStatistics() {
        const projects = this.getAllProjects();
        
        const stats = {
            total: projects.length,
            active: projects.filter(p => p.status === 'In Progress').length,
            completed: projects.filter(p => p.status === 'Completed').length,
            delayed: projects.filter(p => p.status === 'Delayed').length,
            onHold: projects.filter(p => p.status === 'On Hold').length,
            cancelled: projects.filter(p => p.status === 'Cancelled').length,
            averageProgress: projects.length > 0 ? 
                Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0,
            onSchedule: projects.filter(p => p.timeEfficiency >= 90).length
        };
        
        stats.onSchedulePercentage = stats.total > 0 ? 
            Math.round((stats.onSchedule / stats.total) * 100) : 0;
        
        return stats;
    }

    // Get recent activity
    getRecentActivity() {
        const projects = this.getAllProjects();
        
        // Sort by last updated date
        const sortedProjects = projects.sort((a, b) => 
            new Date(b.lastUpdated) - new Date(a.lastUpdated)
        );
        
        return sortedProjects.slice(0, 5).map(project => ({
            id: project.id,
            name: project.name,
            action: this.getActivityAction(project),
            time: this.getRelativeTime(project.lastUpdated),
            icon: this.getActivityIcon(project)
        }));
    }

    // Get activity action text
    getActivityAction(project) {
        if (project.status === 'Completed') {
            return 'completed';
        } else if (project.status === 'Delayed') {
            return 'marked as delayed';
        } else if (project.status === 'On Hold') {
            return 'put on hold';
        } else if (project.currentStage === 1) {
            return 'created';
        } else if (project.briefApprovalDate) {
            return 'brief approved';
        } else {
            return 'updated';
        }
    }

    // Get activity icon
    getActivityIcon(project) {
        if (project.status === 'Completed') {
            return '✅';
        } else if (project.status === 'Delayed') {
            return '⚠️';
        } else if (project.status === 'On Hold') {
            return '⏸️';
        } else if (project.currentStage === 1) {
            return '🚀';
        } else {
            return '📝';
        }
    }

    // Get relative time
    getRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        }
    }

    // Set current project
    setCurrentProject(projectId) {
        localStorage.setItem(this.currentProjectKey, projectId);
    }

    // Get current project
    getCurrentProject() {
        const projectId = localStorage.getItem(this.currentProjectKey);
        return projectId ? this.getProject(projectId) : null;
    }

    // Filter projects
    filterProjects(filters = {}) {
        let projects = this.getAllProjects();
        
        if (filters.status && filters.status !== 'all') {
            projects = projects.filter(project => project.status === filters.status);
        }
        
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            projects = projects.filter(project => 
                project.name.toLowerCase().includes(searchTerm) ||
                project.description.toLowerCase().includes(searchTerm) ||
                project.projectManager.toLowerCase().includes(searchTerm)
            );
        }
        
        // Sort projects
        if (filters.sort) {
            switch (filters.sort) {
                case 'name':
                    projects.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'progress':
                    projects.sort((a, b) => b.progress - a.progress);
                    break;
                case 'status':
                    projects.sort((a, b) => a.status.localeCompare(b.status));
                    break;
                case 'recent':
                default:
                    projects.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
                    break;
            }
        }
        
        return projects;
    }

    // Get stage information
    getStageInfo(stageNumber) {
        const stages = [
            { id: 1, name: 'Book a kick-off call', description: 'Initial consultation to understand project requirements, timeline, and client expectations.', daysFromStart: null },
            { id: 2, name: 'Formulation brief awaiting approval', description: 'Detailed project brief prepared and submitted for client review and approval.', daysFromStart: null },
            { id: 3, name: 'Brief approved', description: 'Client approval received for formulation brief. This marks the official project start date.', daysFromStart: 0 },
            { id: 4, name: 'Market research', description: 'Comprehensive market analysis including competitor products, consumer trends, and regulatory landscape.', daysFromStart: 1 },
            { id: 5, name: 'Ingredient selection', description: 'Selection of optimal ingredients based on efficacy, safety, regulatory compliance, and cost considerations.', daysFromStart: 4 },
            { id: 6, name: 'Ingredient specifications requested', description: 'Detailed technical specifications requested from ingredient suppliers including certificates of analysis.', daysFromStart: 7 },
            { id: 7, name: 'Ingredient samples requested', description: 'Physical samples obtained from suppliers for testing and formulation development.', daysFromStart: 9 },
            { id: 8, name: 'Ingredient interaction testing', description: 'Laboratory testing to identify potential interactions between ingredients and optimize compatibility.', daysFromStart: 11 },
            { id: 9, name: 'Organoleptic trials', description: 'Sensory evaluation including taste, smell, texture, and appearance testing with focus groups.', daysFromStart: 14 },
            { id: 10, name: 'Excipient research', description: 'Research and selection of appropriate excipients for optimal product stability and bioavailability.', daysFromStart: 17 },
            { id: 11, name: 'Regulatory compliance research', description: 'Comprehensive review of regulatory requirements for target markets including EFSA, FDA guidelines.', daysFromStart: 19 },
            { id: 12, name: 'Compiling mandatory label information', description: 'Preparation of all required label information including ingredients list, nutritional information, and warnings.', daysFromStart: 21 },
            { id: 13, name: 'Nutritional table calculation', description: 'Precise calculation of nutritional values per serving including vitamins, minerals, and active compounds.', daysFromStart: 23 },
            { id: 14, name: 'Researching compliant label claims', description: 'Research and validation of permissible health claims and marketing statements for the product.', daysFromStart: 25 },
            { id: 15, name: 'Compiling scientific studies and ingredient justifications', description: 'Compilation of scientific evidence supporting ingredient selection and claimed benefits.', daysFromStart: 26 },
            { id: 16, name: 'Deliver first draft', description: 'Delivery of complete first draft formulation document including all specifications and documentation.', daysFromStart: 27 },
            { id: 17, name: 'Revision one', description: 'First round of revisions based on client feedback and any additional requirements.', daysFromStart: 28 },
            { id: 18, name: 'Revision two', description: 'Second round of revisions to finalize all aspects of the formulation and documentation.', daysFromStart: 29 },
            { id: 19, name: 'Draft approval', description: 'Final client approval of the completed formulation document and project deliverables.', daysFromStart: 30 }
        ];
        
        return stages.find(stage => stage.id === stageNumber) || stages[0];
    }

    // Calculate project dates
    calculateProjectDates(project) {
        if (!project.briefApprovalDate) {
            return {
                startDate: 'Awaiting brief approval',
                estimatedCompletion: 'TBD',
                currentStageName: this.getStageInfo(project.currentStage).name
            };
        }
        
        const startDate = new Date(project.briefApprovalDate);
        const estimatedCompletion = new Date(startDate);
        estimatedCompletion.setDate(estimatedCompletion.getDate() + 28);
        
        return {
            startDate: startDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            }),
            estimatedCompletion: estimatedCompletion.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            }),
            currentStageName: this.getStageInfo(project.currentStage).name
        };
    }
}

// Initialize global storage instance
window.multiProjectStorage = new MultiProjectStorage();

