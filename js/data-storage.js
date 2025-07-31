// Data Storage and Management System - FIXED VERSION
class DataStorage {
    constructor() {
        this.storageKey = 'supplement_project_data';
        this.multiProjectStorage = window.multiProjectStorage;
        console.log('DataStorage constructor called');
        this.initializeData();
    }

    // Initialize with default project data
    initializeData() {
        try {
            console.log('Initializing data storage...');
            
            // Get project ID from URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const projectId = urlParams.get('project');
            
            if (projectId && this.multiProjectStorage) {
                // Load specific project data
                const projectData = this.multiProjectStorage.getProject(projectId);
                if (projectData) {
                    console.log('Loaded project from multi-storage:', projectId);
                    this.setData(projectData);
                    return;
                }
            }
            
            // Fallback to default or first project
            const existingData = this.getData();
            if (!existingData) {
                console.log('No existing data, creating default project');
                const defaultData = this.getDefaultProjectData();
                this.setData(defaultData);
            } else {
                console.log('Using existing data');
            }
            
        } catch (error) {
            console.error('Error initializing data:', error);
            // Fallback to default data
            this.setData(this.getDefaultProjectData());
        }
    }

    // Save data to localStorage and multi-project storage
    saveData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            
            // Also update in multi-project storage if we have an ID
            if (data.id && this.multiProjectStorage) {
                this.multiProjectStorage.updateProject(data.id, data);
            }
            
            console.log('Data saved successfully');
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    // Get data from localStorage
    getData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting data:', error);
            return null;
        }
    }

    // Set data (alias for saveData)
    setData(data) {
        this.saveData(data);
    }

    // Get default project data structure with complete roadmap
    getDefaultProjectData() {
        console.log('Creating default project data with roadmap...');
        
        return {
            id: 'heal-greens-blend',
            slug: 'heal-greens-blend',
            name: 'Heal - Greens Blend',
            description: 'Premium organic greens blend featuring spirulina, chlorella, wheatgrass, and barley grass. Formulated for maximum bioavailability and nutrient density with natural flavor enhancement. Target market: health-conscious consumers seeking convenient superfood nutrition.',
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
            totalBudget: 15000,
            projectManager: 'Dr. Sarah Chen, PhD - Senior Formulation Scientist',
            keyIngredients: 'Organic Spirulina (2000mg), Chlorella (1500mg), Wheatgrass (1000mg), Barley Grass (1000mg), Moringa Leaf (500mg), Natural Mint Flavor, Stevia Extract',
            targetSpecs: '30-serving container, 8g serving size, pH 6.5-7.5, moisture content <5%, particle size 80-120 mesh, green color index 85-95, 24-month shelf life',
            createdDate: 'Tuesday, July 15, 2025',
            lastUpdated: 'Thursday, July 24, 2025',
            notes: 'Project initiated. Awaiting client approval of formulation brief to begin development timeline.',
            delayNotes: '',
            
            // COMPLETE 19-STAGE ROADMAP
            roadmapStages: [
                {
                    id: 1,
                    title: 'Book a kick-off call',
                    description: 'Initial consultation and project scoping session',
                    status: 'completed',
                    startDate: null,
                    endDate: null,
                    duration: 0,
                    showDates: false
                },
                {
                    id: 2,
                    title: 'Formulation brief awaiting approval',
                    description: 'Comprehensive brief preparation and client review',
                    status: 'active',
                    startDate: null,
                    endDate: null,
                    duration: 0,
                    showDates: false
                },
                {
                    id: 3,
                    title: 'Brief approved',
                    description: 'Official project start - brief approval triggers timeline',
                    status: 'pending',
                    startDate: null,
                    endDate: null,
                    duration: 1,
                    showDates: true,
                    isStartTrigger: true
                },
                {
                    id: 4,
                    title: 'Market research',
                    description: 'Comprehensive market analysis and competitive landscape review',
                    status: 'pending',
                    startDate: null,
                    endDate: null,
                    duration: 3,
                    showDates: true,
                    dayOffset: 1
                },
                {
                    id: 5,
                    title: 'Ingredient selection',
                    description: 'Scientific evaluation and selection of optimal ingredients',
                    status: 'pending',
                    startDate: null,
                    endDate: null,
                    duration: 3,
                    showDates: true,
                    dayOffset: 4
                },
                {
                    id: 6,
                    title: 'Ingredient specifications requested',
                    description: 'Detailed technical specifications and quality parameters',
                    status: 'pending',
                    startDate: null,
                    endDate: null,
                    duration: 2,
                    showDates: true,
                    dayOffset: 7
                },
                {
                    id: 7,
                    title: 'Ingredient samples requested',
                    description: 'Procurement of ingredient samples for testing and analysis',
                    status: 'pending',
                    startDate: null,
                    endDate: null,
                    duration: 2,
                    showDates: true,
                    dayOffset: 9
                },
                {
                    id: 8,
                    title: 'Ingredient interaction testing',
                    description: 'Compatibility and synergy analysis between ingredients',
                    status: 'pending',
                    startDate: null,
                    endDate: null,
                    duration: 2,
                    showDates: true,
                    dayOffset: 11
                },
                {
                    id: 9,
                    title: 'Organoleptic trials',
                    description: 'Sensory evaluation including taste, texture, and appearance',
                    status: 'pending',
                    startDate: null,
                    endDate: null,
                    duration: 2,
                    showDates: true,
                    dayOffset: 13
                },
                {
                    id: 10,
                    title: 'Excipient research',
                    description: 'Selection of optimal excipients and processing aids',
                    status: 'pending',
                    startDate: null,
                    endDate: null,
                    duration: 2,
                    showDates: true,
                    dayOffset: 15
                },
                {
                    id: 11,
                    title: 'Regulatory compliance research',
                    description: 'Comprehensive regulatory analysis and compliance verification',
                    status: 'pending',
                    startDate: null,
                    endDate: null,
                    duration: 2,
                    showDates: true,
                    dayOffset: 17
                },
                {
                    id: 12,
                    title: 'Compiling mandatory label information',
                    description: 'Preparation of all required labeling and regulatory information',
                    status: 'pending',
                    startDate: null,
                    endDate: null,
                    duration: 2,
                    showDates: true,
                    dayOffset: 19
                },
                {
                    id: 13,
                    title: 'Nutritional table calculation',
                    description: 'Precise nutritional analysis and table preparation',
                    status: 'pending',
                    startDate: null,
                    endDate: null,
                    duration: 2,
                    showDates: true,
                    dayOffset: 21
                },
                {
                    id: 14,
                    title: 'Researching compliant label claims',
                    description: 'Development of legally compliant health and marketing claims',
                    status: 'pending',
                    startDate: null,
                    endDate: null,
                    duration: 2,
                    showDates: true,
                    dayOffset: 23
                },
                {
                    id: 15,
                    title: 'Compiling scientific studies and ingredient justifications',
                    description: 'Comprehensive scientific documentation and evidence compilation',
                    status: 'pending',
                    startDate: null,
                    endDate: null,
                    duration: 2,
                    showDates: true,
                    dayOffset: 25
                },
                {
                    id: 16,
                    title: 'Deliver first draft',
                    description: 'Complete formulation package delivery for initial review',
                    status: 'pending',
                    startDate: null,
                    endDate: null,
                    duration: 1,
                    showDates: true,
                    dayOffset: 27
                },
                {
                    id: 17,
                    title: 'Revision one',
                    description: 'First round of revisions based on client feedback',
                    status: 'pending',
                    startDate: null,
                    endDate: null,
                    duration: 1,
                    showDates: true,
                    dayOffset: 28
                },
                {
                    id: 18,
                    title: 'Revision two',
                    description: 'Second round of revisions and final adjustments',
                    status: 'pending',
                    startDate: null,
                    endDate: null,
                    duration: 1,
                    showDates: true,
                    dayOffset: 29
                },
                {
                    id: 19,
                    title: 'Draft approval',
                    description: 'Final approval and project completion',
                    status: 'pending',
                    startDate: null,
                    endDate: null,
                    duration: 1,
                    showDates: true,
                    dayOffset: 30
                }
            ]
        };
    }

    // Update project data
    updateProject(updates) {
        try {
            const currentData = this.getData();
            if (currentData) {
                const updatedData = { ...currentData, ...updates };
                this.setData(updatedData);
                console.log('Project updated successfully');
                return updatedData;
            }
        } catch (error) {
            console.error('Error updating project:', error);
        }
        return null;
    }

    // Get roadmap stages
    getRoadmapStages() {
        try {
            const data = this.getData();
            return data && data.roadmapStages ? data.roadmapStages : [];
        } catch (error) {
            console.error('Error getting roadmap stages:', error);
            return [];
        }
    }

    // Calculate timeline dates
    calculateTimelineDates(briefApprovalDate) {
        try {
            if (!briefApprovalDate) return null;
            
            const startDate = new Date(briefApprovalDate);
            const stages = this.getRoadmapStages();
            
            stages.forEach(stage => {
                if (stage.showDates && stage.dayOffset) {
                    const stageStartDate = new Date(startDate);
                    stageStartDate.setDate(startDate.getDate() + stage.dayOffset - 1);
                    
                    const stageEndDate = new Date(stageStartDate);
                    stageEndDate.setDate(stageStartDate.getDate() + stage.duration - 1);
                    
                    stage.startDate = stageStartDate.toISOString().split('T')[0];
                    stage.endDate = stageEndDate.toISOString().split('T')[0];
                }
            });
            
            return stages;
        } catch (error) {
            console.error('Error calculating timeline dates:', error);
            return null;
        }
    }
}

// Make DataStorage available globally
window.DataStorage = DataStorage;
console.log('DataStorage class defined and available globally');

