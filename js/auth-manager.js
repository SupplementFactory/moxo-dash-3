// Authentication Manager - Handles login/logout and access control
class AuthManager {
    constructor() {
        this.apiClient = window.apiClient;
        this.init();
    }

    init() {
        this.createAuthModal();
        this.checkAuthStatus();
    }

    // Create authentication modal
    createAuthModal() {
        const modalHtml = `
            <div id="auth-modal" class="auth-modal" style="display: none;">
                <div class="auth-modal-content">
                    <div class="auth-modal-header">
                        <h2 id="auth-modal-title">Authentication Required</h2>
                        <button class="auth-modal-close" onclick="authManager.hideAuthModal()">&times;</button>
                    </div>
                    <div class="auth-modal-body">
                        <div id="company-auth" class="auth-form">
                            <h3>Company Dashboard Access</h3>
                            <p>Enter the company password to access the dashboard:</p>
                            <input type="password" id="company-password" placeholder="Company Password">
                            <button onclick="authManager.authenticateCompany()" class="auth-btn">Access Dashboard</button>
                        </div>
                        <div id="client-auth" class="auth-form" style="display: none;">
                            <h3>Project Access</h3>
                            <p>Enter your project password to view your project:</p>
                            <input type="password" id="client-password" placeholder="Project Password">
                            <button onclick="authManager.authenticateClient()" class="auth-btn">View Project</button>
                        </div>
                        <div id="auth-error" class="auth-error" style="display: none;"></div>
                        <div id="auth-loading" class="auth-loading" style="display: none;">
                            <div class="loading-spinner-small"></div>
                            <span>Authenticating...</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.addAuthStyles();
    }

    // Add authentication styles
    addAuthStyles() {
        const styles = `
            <style>
                .auth-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                }

                .auth-modal-content {
                    background: white;
                    padding: 0;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 400px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                }

                .auth-modal-header {
                    padding: 24px 24px 0 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #eee;
                    margin-bottom: 24px;
                }

                .auth-modal-header h2 {
                    margin: 0;
                    color: #333;
                    font-size: 20px;
                }

                .auth-modal-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #666;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .auth-modal-body {
                    padding: 0 24px 24px 24px;
                }

                .auth-form h3 {
                    margin: 0 0 12px 0;
                    color: #333;
                    font-size: 18px;
                }

                .auth-form p {
                    margin: 0 0 16px 0;
                    color: #666;
                    font-size: 14px;
                }

                .auth-form input {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #ddd;
                    border-radius: 8px;
                    font-size: 16px;
                    margin-bottom: 16px;
                    box-sizing: border-box;
                }

                .auth-form input:focus {
                    outline: none;
                    border-color: #007bff;
                }

                .auth-btn {
                    width: 100%;
                    padding: 12px;
                    background: #007bff;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .auth-btn:hover {
                    background: #0056b3;
                }

                .auth-error {
                    background: #f8d7da;
                    color: #721c24;
                    padding: 12px;
                    border-radius: 8px;
                    margin-top: 16px;
                    font-size: 14px;
                }

                .auth-loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    margin-top: 16px;
                    color: #666;
                }

                .loading-spinner-small {
                    width: 20px;
                    height: 20px;
                    border: 2px solid #f3f3f3;
                    border-top: 2px solid #007bff;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    // Check current authentication status
    checkAuthStatus() {
        const currentPath = window.location.pathname;
        const currentUser = this.apiClient.currentUser;

        // Check if we're on a client project page
        if (currentPath.startsWith('/projects/')) {
            const slug = currentPath.split('/projects/')[1];
            if (!currentUser || currentUser.type !== 'client' || currentUser.project?.slug !== slug) {
                this.showClientAuth(slug);
                return false;
            }
        }
        // Check if we're on company dashboard
        else if (currentPath.includes('dashboard.html') || currentPath === '/dashboard') {
            if (!currentUser || currentUser.type !== 'company') {
                this.showCompanyAuth();
                return false;
            }
        }

        return true;
    }

    // Show company authentication
    showCompanyAuth() {
        document.getElementById('company-auth').style.display = 'block';
        document.getElementById('client-auth').style.display = 'none';
        document.getElementById('auth-modal-title').textContent = 'Company Dashboard Access';
        this.showAuthModal();
    }

    // Show client authentication
    showClientAuth(projectSlug) {
        this.currentProjectSlug = projectSlug;
        document.getElementById('company-auth').style.display = 'none';
        document.getElementById('client-auth').style.display = 'block';
        document.getElementById('auth-modal-title').textContent = 'Project Access Required';
        this.showAuthModal();
    }

    // Show authentication modal
    showAuthModal() {
        document.getElementById('auth-modal').style.display = 'flex';
        this.hideError();
        this.hideLoading();
    }

    // Hide authentication modal
    hideAuthModal() {
        document.getElementById('auth-modal').style.display = 'none';
    }

    // Authenticate company user
    async authenticateCompany() {
        const password = document.getElementById('company-password').value;
        
        if (!password) {
            this.showError('Please enter the company password');
            return;
        }

        this.showLoading();

        try {
            const result = await this.apiClient.authenticateCompany(password);
            
            if (result.success) {
                this.hideAuthModal();
                window.location.reload(); // Refresh to load authenticated content
            } else {
                this.showError(result.message || 'Authentication failed');
            }
        } catch (error) {
            this.showError('Authentication failed. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    // Authenticate client user
    async authenticateClient() {
        const password = document.getElementById('client-password').value;
        
        if (!password) {
            this.showError('Please enter your project password');
            return;
        }

        this.showLoading();

        try {
            const result = await this.apiClient.authenticateClient(this.currentProjectSlug, password);
            
            if (result.success) {
                this.hideAuthModal();
                window.location.reload(); // Refresh to load authenticated content
            } else {
                this.showError(result.message || 'Authentication failed');
            }
        } catch (error) {
            this.showError('Authentication failed. Please check your password and try again.');
        } finally {
            this.hideLoading();
        }
    }

    // Show error message
    showError(message) {
        const errorDiv = document.getElementById('auth-error');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    // Hide error message
    hideError() {
        document.getElementById('auth-error').style.display = 'none';
    }

    // Show loading state
    showLoading() {
        document.getElementById('auth-loading').style.display = 'flex';
    }

    // Hide loading state
    hideLoading() {
        document.getElementById('auth-loading').style.display = 'none';
    }

    // Logout user
    logout() {
        this.apiClient.logout();
        window.location.href = '/';
    }

    // Add logout button to pages
    addLogoutButton() {
        const currentUser = this.apiClient.currentUser;
        if (!currentUser) return;

        const logoutHtml = `
            <button onclick="authManager.logout()" class="logout-btn" style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #dc3545;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                z-index: 1000;
            ">
                Logout (${currentUser.type === 'company' ? 'Company' : 'Client'})
            </button>
        `;

        document.body.insertAdjacentHTML('beforeend', logoutHtml);
    }
}

// Initialize authentication manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.authManager = new AuthManager();
    window.authManager.addLogoutButton();
});

