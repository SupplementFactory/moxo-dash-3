// API Client for communicating with backend
class ApiClient {
    constructor() {
        this.baseUrl = window.location.origin;
        this.authToken = localStorage.getItem('auth_token');
        this.currentUser = JSON.parse(localStorage.getItem('current_user') || 'null');
    }

    // Generic API request method
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}/api${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (this.authToken) {
            config.headers['Authorization'] = `Bearer ${this.authToken}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
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
}

// Create global instance
window.apiClient = new ApiClient();

