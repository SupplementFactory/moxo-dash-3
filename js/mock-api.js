// Mock API for local testing without Supabase
class MockApi {
    constructor() {
        this.projects = [
            {
                id: '1',
                name: 'Heal - Greens Blend',
                description: 'Premium organic greens blend featuring spirulina, chlorella, wheatgrass, and barley grass. Formulated for maximum bioavailability and nutrient density with natural flavor enhancement.',
                status: 'In Progress',
                automation_status: 'Running',
                current_stage: 2,
                progress: 10,
                time_efficiency: 100,
                tests_completed: 2,
                total_tests: 19,
                quality_score: 85.0,
                budget_used: 1250.00,
                budget_total: 15000.00,
                project_manager: 'Dr. Sarah Chen, PhD - Senior Formulation Scientist',
                created_date: '2025-07-15',
                last_updated: '2025-07-24',
                delay_notes: 'Project initiated. Awaiting client approval of formulation brief to begin development timeline.',
                slug: 'heal-greens-blend',
                client_password: 'HealGreens2024',
                key_ingredients: 'Organic Spirulina (2000mg), Chlorella (1500mg), Wheatgrass (1000mg), Barley Grass (1000mg), Moringa Leaf (500mg), Natural Mint Flavor, Stevia Extract',
                target_specs: '30-serving container, 8g serving size, pH 6.5-7.5, moisture content <5%, particle size 80-120 mesh, green color index 85-95, 24-month shelf life',
                created_at: '2025-07-15T00:00:00Z',
                updated_at: '2025-07-24T00:00:00Z'
            },
            {
                id: '2',
                name: 'Immune Support Complex',
                description: 'Advanced immune system support formula combining vitamin C, zinc, elderberry, and echinacea with proprietary absorption enhancers.',
                status: 'In Progress',
                automation_status: 'Running',
                current_stage: 8,
                brief_approval_date: '2025-07-10',
                progress: 42,
                time_efficiency: 95,
                tests_completed: 8,
                total_tests: 19,
                quality_score: 92.5,
                budget_used: 6800.00,
                budget_total: 18000.00,
                project_manager: 'Dr. Michael Rodriguez, PhD - Lead Research Scientist',
                created_date: '2025-06-28',
                last_updated: '2025-07-24',
                delay_notes: 'On schedule. Currently in stability testing phase.',
                slug: 'immune-support-complex',
                client_password: 'Immune2024',
                key_ingredients: 'Vitamin C (1000mg), Zinc Gluconate (15mg), Elderberry Extract (500mg), Echinacea (400mg), Quercetin (250mg)',
                target_specs: '60-capsule bottle, 2-capsule serving size, enteric coating, 36-month shelf life',
                created_at: '2025-06-28T00:00:00Z',
                updated_at: '2025-07-24T00:00:00Z'
            }
        ];
        this.isLocalTesting = true;
    }

    // Mock authentication
    async authenticate(type, password, projectSlug) {
        await this.delay(500); // Simulate network delay

        if (type === 'company') {
            if (password === 'supplement2024') {
                return { success: true, type: 'company' };
            } else {
                return { success: false, message: 'Invalid company password' };
            }
        } else if (type === 'client') {
            const project = this.projects.find(p => p.slug === projectSlug);
            if (project && password === project.client_password) {
                return { 
                    success: true, 
                    type: 'client',
                    project: { id: project.id, name: project.name, slug: project.slug }
                };
            } else {
                return { success: false, message: 'Invalid project password' };
            }
        }

        return { success: false, message: 'Invalid auth type' };
    }

    // Mock project operations
    async getAllProjects() {
        await this.delay(300);
        return this.projects;
    }

    async getProject(id) {
        await this.delay(200);
        return this.projects.find(p => p.id === id) || null;
    }

    async getProjectBySlug(slug) {
        await this.delay(200);
        return this.projects.find(p => p.slug === slug) || null;
    }

    async createProject(projectData) {
        await this.delay(500);
        const newProject = {
            ...projectData,
            id: String(this.projects.length + 1),
            slug: this.generateSlug(projectData.name),
            client_password: this.generatePassword(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        this.projects.push(newProject);
        return newProject;
    }

    async updateProject(id, projectData) {
        await this.delay(300);
        const index = this.projects.findIndex(p => p.id === id);
        if (index !== -1) {
            this.projects[index] = {
                ...this.projects[index],
                ...projectData,
                updated_at: new Date().toISOString()
            };
            return this.projects[index];
        }
        throw new Error('Project not found');
    }

    async deleteProject(id) {
        await this.delay(300);
        const index = this.projects.findIndex(p => p.id === id);
        if (index !== -1) {
            this.projects.splice(index, 1);
            return { success: true };
        }
        throw new Error('Project not found');
    }

    // Utility methods
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    generateSlug(name) {
        return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    }

    generatePassword(length = 12) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }
}

// Override ApiClient for local testing
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('Using Mock API for local testing');
    
    window.mockApi = new MockApi();
    
    // Override the ApiClient class completely
    window.ApiClient = class MockApiClient {
        constructor() {
            this.baseUrl = window.location.origin;
            this.authToken = localStorage.getItem('auth_token');
            this.currentUser = JSON.parse(localStorage.getItem('current_user') || 'null');
            this.mockApi = window.mockApi;
        }

        async request(endpoint, options = {}) {
            // Simulate API calls with mock data
            const method = options.method || 'GET';
            const url = endpoint;

            console.log(`Mock API: ${method} ${url}`);

            if (url === '/auth') {
                const body = JSON.parse(options.body);
                return await this.mockApi.authenticate(body.type, body.password, body.projectSlug);
            } else if (url === '/projects') {
                if (method === 'GET') {
                    return await this.mockApi.getAllProjects();
                } else if (method === 'POST') {
                    const body = JSON.parse(options.body);
                    return await this.mockApi.createProject(body);
                }
            } else if (url.startsWith('/projects?id=')) {
                const id = url.split('id=')[1];
                if (method === 'GET') {
                    return await this.mockApi.getProject(id);
                } else if (method === 'PUT') {
                    const body = JSON.parse(options.body);
                    return await this.mockApi.updateProject(id, body);
                } else if (method === 'DELETE') {
                    return await this.mockApi.deleteProject(id);
                }
            } else if (url.startsWith('/projects?slug=')) {
                const slug = url.split('slug=')[1];
                return await this.mockApi.getProjectBySlug(slug);
            } else if (url === '/init-db') {
                return { success: true, message: 'Mock database initialized' };
            }

            throw new Error(`Mock API: Unhandled endpoint ${method} ${url}`);
        }

        // Authentication methods
        async authenticateCompany(password) {
            const data = await this.request('/auth', {
                method: 'POST',
                body: JSON.stringify({
                    type: 'company',
                    password
                })
            });

            if (data.success) {
                this.currentUser = { type: 'company' };
                localStorage.setItem('current_user', JSON.stringify(this.currentUser));
                localStorage.setItem('company_auth', 'true');
            }

            return data;
        }

        async authenticateClient(projectSlug, password) {
            const data = await this.request('/auth', {
                method: 'POST',
                body: JSON.stringify({
                    type: 'client',
                    projectSlug,
                    password
                })
            });

            if (data.success) {
                this.currentUser = { 
                    type: 'client', 
                    project: data.project 
                };
                localStorage.setItem('current_user', JSON.stringify(this.currentUser));
                localStorage.setItem('client_auth', projectSlug);
            }

            return data;
        }

        // Check if user is authenticated
        isAuthenticated() {
            return this.currentUser !== null;
        }

        isCompanyUser() {
            return this.currentUser?.type === 'company';
        }

        isClientUser() {
            return this.currentUser?.type === 'client';
        }

        // Get current project for client users
        getCurrentProject() {
            return this.currentUser?.project || null;
        }

        // Logout
        logout() {
            this.authToken = null;
            this.currentUser = null;
            localStorage.removeItem('auth_token');
            localStorage.removeItem('current_user');
            localStorage.removeItem('company_auth');
            localStorage.removeItem('client_auth');
        }

        // Project methods
        async getAllProjects() {
            return await this.request('/projects');
        }

        async getProject(id) {
            return await this.request(`/projects?id=${id}`);
        }

        async getProjectBySlug(slug) {
            return await this.request(`/projects?slug=${slug}`);
        }

        async createProject(projectData) {
            return await this.request('/projects', {
                method: 'POST',
                body: JSON.stringify(projectData)
            });
        }

        async updateProject(id, projectData) {
            return await this.request(`/projects?id=${id}`, {
                method: 'PUT',
                body: JSON.stringify(projectData)
            });
        }

        async deleteProject(id) {
            return await this.request(`/projects?id=${id}`, {
                method: 'DELETE'
            });
        }

        // Initialize database (for first-time setup)
        async initializeDatabase() {
            return await this.request('/init-db', {
                method: 'POST'
            });
        }

        // Real-time updates using Server-Sent Events (fallback for Supabase realtime)
        subscribeToProjectUpdates(projectId, callback) {
            // For now, we'll use polling as a simple real-time solution
            const pollInterval = 5000; // 5 seconds
            
            const poll = async () => {
                try {
                    const project = await this.getProject(projectId);
                    callback(project);
                } catch (error) {
                    console.error('Error polling project updates:', error);
                }
            };

            const intervalId = setInterval(poll, pollInterval);
            
            // Return unsubscribe function
            return () => clearInterval(intervalId);
        }
    };

    // Replace the global ApiClient instance
    window.apiClient = new window.ApiClient();
}

