// Edit Form Controller - Handles all edit form functionality

class EditForm {
    constructor() {
        // Ensure multi-project and data storage instances exist. If they
        // haven't been created elsewhere (like on the dashboard page),
        // create new instances here. Also assign them back to the window
        // object so other scripts can reference the same instances.
        if (!window.multiProjectStorage) {
            try {
                window.multiProjectStorage = new MultiProjectStorage();
            } catch (e) {
                console.warn('Could not instantiate MultiProjectStorage:', e);
            }
        }
        this.multiProjectStorage = window.multiProjectStorage;

        if (!window.dataStorage) {
            try {
                window.dataStorage = new DataStorage();
            } catch (e) {
                console.warn('Could not instantiate DataStorage:', e);
            }
        }
        this.dataStorage = window.dataStorage;

        this.validator = new FormValidator();
        this.form = null;
        this.isDirty = false;
        this.autoSaveEnabled = true;
        this.autoSaveTimeout = null;
        this.previewPanel = null;
        this.isInitialized = false;
        this.currentProject = null;
    }

    // Initialize the edit form
    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('Initializing edit form...');

            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Get form element
            this.form = document.getElementById('project-edit-form');
            this.previewPanel = document.getElementById('preview-panel');

            if (!this.form) {
                throw new Error('Edit form not found');
            }

            // Load project data from URL
            this.loadProjectFromURL();

            // Setup validation rules
            this.validator.setupDefaultRules();
            this.validator.addBusinessRules();

            // Load current data into form
            this.loadFormData();

            // Setup event listeners
            this.setupEventListeners();

            // Setup auto-save
            this.setupAutoSave();

            // Setup form validation
            this.setupFormValidation();

            // Mark as initialized
            this.isInitialized = true;

            console.log('Edit form initialized successfully');

            // Show form ready status
            this.updateFormStatus('Ready', 'ready');

        } catch (error) {
            console.error('Error initializing edit form:', error);
            this.showErrorMessage('Failed to initialize edit form');
        }
    }

    // Load project data from URL parameter
    loadProjectFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('project');
        
        if (projectId && this.multiProjectStorage) {
            this.currentProject = this.multiProjectStorage.getProject(projectId);
            if (this.currentProject) {
                // Update page title
                document.title = `Edit Project - ${this.currentProject.name} | Supplement Factory`;
                return;
            }
        }
        
        // Fallback to first project or default
        const projects = this.multiProjectStorage?.getAllProjects() || [];
        if (projects.length > 0) {
            this.currentProject = projects[0];
        }
    }

    // Load form data from current project
    loadFormData() {
        const data = this.currentProject || this.dataStorage.getData();

        if (!data) {
            console.warn('No project data found');
            return;
        }

        // Populate all form fields. Many of the fields in the form use
        // different name attributes than the underlying data keys, so handle
        // those mappings explicitly.
        Object.keys(data).forEach(key => {
            let field = this.form.querySelector(`[name="${key}"]`);

            // Map data keys to form field names when necessary
            if (!field) {
                if (key === 'name') {
                    field = this.form.querySelector('[name="projectName"]');
                } else if (key === 'totalBudget') {
                    field = this.form.querySelector('[name="budgetTotal"]');
                }
            }

            if (field) {
                field.value = data[key];
            }
        });

        // Mark form as clean
        this.isDirty = false;
        this.updateSaveStatus();
    }

    // Setup all event listeners
    setupEventListeners() {
        // Handle form submission
        this.form.addEventListener("submit", (e) => {
            e.preventDefault();
            // Call saveForm() directly instead of an undefined saveChanges() method
            // to persist the form data. If saveChanges() exists in future, it can
            // delegate to saveForm(), but for now this ensures the form saves correctly.
            this.saveForm();
        });

        // Handle navigation buttons
        const backLink = document.querySelector(".back-link");
        if (backLink) {
            backLink.addEventListener("click", (e) => {
                e.preventDefault();
                window.location.href = "index.html";
            });
        }

        const viewDashboardBtn = document.getElementById("view-dashboard-btn");
        if (viewDashboardBtn) {
            viewDashboardBtn.addEventListener("click", () => {
                this.hideModal();
                window.location.href = "index.html";
            });
        }

        // Form field changes
        this.form.addEventListener("input", (e) => {
            this.handleFieldChange(e.target);
        });

        this.form.addEventListener("change", (e) => {
            this.handleFieldChange(e.target);
        });

        // Button handlers
        this.setupButtonHandlers();

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Before unload warning
        this.setupUnloadWarning();
    }

    // Setup button event handlers
    setupButtonHandlers() {
        // Save button
        const saveBtn = document.getElementById('save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveForm());
        }

        // Reset button
        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetForm());
        }

        // Preview button
        const previewBtn = document.getElementById('preview-btn');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => this.togglePreview());
        }

        // Close preview button
        const closePreviewBtn = document.getElementById('close-preview');
        if (closePreviewBtn) {
            closePreviewBtn.addEventListener('click', () => this.hidePreview());
        }

        // Modal close buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-modal]')) {
                this.closeModal(e.target.getAttribute('data-modal'));
            }
        });
    }

    // Setup keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S = Save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveForm();
            }

            // Ctrl/Cmd + R = Reset
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.resetForm();
            }

            // Ctrl/Cmd + P = Preview
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                this.togglePreview();
            }

            // Escape = Close preview/modals
            if (e.key === 'Escape') {
                this.hidePreview();
                const modals = document.querySelectorAll('.modal.active');
                modals.forEach(modal => modal.remove());
            }
        });
    }

    // Setup unload warning for unsaved changes
    setupUnloadWarning() {
        window.addEventListener('beforeunload', (e) => {
            if (this.isDirty) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        });
    }

    // Handle field changes
    handleFieldChange(field) {
        // Mark form as dirty
        this.isDirty = true;
        this.updateSaveStatus();

        // Real-time validation
        this.validateField(field);

        // Trigger auto-save
        this.triggerAutoSave();

        // Update preview if visible
        if (this.previewPanel && this.previewPanel.classList.contains('active')) {
            this.updatePreview();
        }
    }

    // Validate individual field
    validateField(field) {
        const fieldName = field.name;
        const value = field.value;
        const formData = this.getFormData();

        // Clear previous validation state
        this.clearFieldValidation(field);

        // Validate field
        const isValid = this.validator.validateFieldRealTime(fieldName, value, formData);

        // Update field appearance
        if (isValid) {
            this.showFieldSuccess(field);
        } else {
            this.showFieldError(field, this.validator.getFirstFieldError(fieldName));
        }

        return isValid;
    }

    // Setup form validation
    setupFormValidation() {
        // Add validation to all form fields
        const fields = this.form.querySelectorAll('input, select, textarea');
        
        fields.forEach(field => {
            // Validate on blur
            field.addEventListener('blur', () => {
                this.validateField(field);
            });

            // Clear validation on focus
            field.addEventListener('focus', () => {
                this.clearFieldValidation(field);
            });
        });
    }

    // Get all form data
    getFormData() {
        const formData = new FormData(this.form);
        const data = {};

        // Convert FormData entries into a plain object
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Map form field names to data storage keys. Some form fields use
        // different names than the underlying data model (e.g. projectName vs name,
        // budgetTotal vs totalBudget). Normalize these here so saving works as expected.
        if (data.projectName !== undefined) {
            data.name = data.projectName;
            delete data.projectName;
        }
        if (data.budgetTotal !== undefined) {
            data.totalBudget = data.budgetTotal;
            delete data.budgetTotal;
        }

        return data;
    }

    // Save form data
    async saveForm() {
        try {
            this.updateFormStatus('Saving...', 'saving');
            
            const formData = this.getFormData();
            
            // Validate all fields
            const isValid = this.validator.validateWithCrossFields(formData);
            
            if (!isValid) {
                this.showValidationErrors();
                this.updateFormStatus('Validation Error', 'error');
                return false;
            }

            // Persist the updated data. Instead of relying on DataStorage.updateProject()
            // (which may not be defined or may fail if no existing data is present),
            // merge the existing data with the form values and save it directly.
            let currentData = this.currentProject || this.dataStorage.getData() || {};
            // Ensure we preserve the project ID and slug if they exist
            const updatedData = { ...currentData, ...formData };
            if (!updatedData.id && currentData.id) {
                updatedData.id = currentData.id;
            }
            if (!updatedData.slug && currentData.slug) {
                updatedData.slug = currentData.slug;
            }
            // Save the merged data
            this.dataStorage.setData(updatedData);
            const updated = updatedData;

            if (updated) {
                // mark form clean and update UI statuses
                this.isDirty = false;
                this.updateSaveStatus();
                this.updateFormStatus('Saved', 'ready');
                this.showSuccessModal();

                // Clear any pending auto-save
                if (this.autoSaveTimeout) {
                    clearTimeout(this.autoSaveTimeout);
                    this.autoSaveTimeout = null;
                }

                return true;
            } else {
                throw new Error('Failed to save data');
            }
            
        } catch (error) {
            console.error('Error saving form:', error);
            this.updateFormStatus('Save Error', 'error');
            // Include the error message in the notification to aid debugging
            const message = error && error.message ? error.message : 'Unknown error';
            this.showErrorMessage(`Failed to save changes: ${message}`);
            return false;
        }
    }

    // Reset form to original data
    resetForm() {
        if (this.isDirty) {
            const confirmed = confirm('Are you sure you want to reset all changes?');
            if (!confirmed) return;
        }

        this.loadFormData();
        this.clearAllValidation();
        this.hidePreview();
        this.updateFormStatus('Reset', 'ready');
        
        // Show notification
        this.showNotification('Form reset to original values');
    }

    // Setup auto-save functionality
    setupAutoSave() {
        const autoSaveStatus = document.getElementById('auto-save-status');
        if (autoSaveStatus) {
            autoSaveStatus.textContent = this.autoSaveEnabled ? 'Auto-save: Enabled' : 'Auto-save: Disabled';
        }
    }

    // Trigger auto-save
    triggerAutoSave() {
        if (!this.autoSaveEnabled) return;

        // Clear existing timeout
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }

        // Set new timeout for 3 seconds
        this.autoSaveTimeout = setTimeout(() => {
            if (this.isDirty) {
                this.autoSave();
            }
        }, 3000);
    }

    // Perform auto-save
    async autoSave() {
        try {
            const formData = this.getFormData();
            
            // Quick validation (no UI updates)
            const isValid = this.validator.validateWithCrossFields(formData);
            
            if (isValid) {
                // Persist by merging with existing data and saving directly. This
                // mirrors the behaviour of saveForm() but without showing modals.
                let currentData = this.currentProject || this.dataStorage.getData() || {};
                const updatedData = { ...currentData, ...formData };
                if (!updatedData.id && currentData.id) {
                    updatedData.id = currentData.id;
                }
                if (!updatedData.slug && currentData.slug) {
                    updatedData.slug = currentData.slug;
                }
                this.dataStorage.setData(updatedData);
                this.isDirty = false;
                this.updateSaveStatus();
                this.showAutoSaveIndicator();
            }
        } catch (error) {
            console.error('Auto-save error:', error);
        }
    }

    // Show auto-save indicator
    showAutoSaveIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'auto-save-indicator active';
        indicator.textContent = 'Auto-saved';
        
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--success-color);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
            font-size: 0.875rem;
            z-index: 1000;
        `;

        document.body.appendChild(indicator);

        setTimeout(() => {
            indicator.remove();
        }, 2000);
    }

    // Toggle preview panel
    togglePreview() {
        if (this.previewPanel.classList.contains('active')) {
            this.hidePreview();
        } else {
            this.showPreview();
        }
    }

    // Show preview panel
    showPreview() {
        this.previewPanel.classList.add('active');
        this.updatePreview();
    }

    // Hide preview panel
    hidePreview() {
        this.previewPanel.classList.remove('active');
    }

    // Update preview content
    updatePreview() {
        const formData = this.getFormData();
        const previewContent = document.getElementById('preview-content');
        
        if (!previewContent) return;

        previewContent.innerHTML = `
            <div class="preview-card">
                <h4>Project Name</h4>
                <p>${formData.projectName || 'Untitled Project'}</p>
            </div>
            
            <div class="preview-card">
                <h4>Status</h4>
                <div class="preview-status">${formData.status || 'Unknown'}</div>
            </div>
            
            <div class="preview-card">
                <h4>Progress</h4>
                <p>${formData.progress || 0}% Complete</p>
                <div class="preview-progress">
                    <div class="preview-progress-fill" style="width: ${formData.progress || 0}%"></div>
                </div>
            </div>
            
            <div class="preview-card">
                <h4>Current Stage</h4>
                <p>Stage ${formData.currentStage || 1} of 10</p>
            </div>
            
            <div class="preview-card">
                <h4>Tests Completed</h4>
                <p>${formData.testsCompleted || 0} / ${formData.totalTests || 0}</p>
            </div>
            
            <div class="preview-card">
                <h4>Quality Score</h4>
                <p>${formData.qualityScore || 0}%</p>
            </div>
            
            <div class="preview-card">
                <h4>Budget Status</h4>
                <p>$${parseFloat(formData.budgetUsed || 0).toLocaleString()} / $${parseFloat(formData.budgetTotal || 0).toLocaleString()}</p>
            </div>
        `;
    }

    // Update form status indicator
    updateFormStatus(text, type) {
        const statusEl = document.getElementById('form-status');
        const statusText = statusEl?.querySelector('.status-text');
        
        if (statusText) {
            statusText.textContent = text;
        }
        
        if (statusEl) {
            statusEl.className = `form-status ${type}`;
        }
    }

    // Update save status
    updateSaveStatus() {
        const lastSaved = document.getElementById('last-saved');
        if (lastSaved) {
            if (this.isDirty) {
                lastSaved.textContent = 'Unsaved changes';
                lastSaved.style.color = 'var(--warning-color)';
            } else {
                lastSaved.textContent = `Last saved: ${new Date().toLocaleTimeString()}`;
                lastSaved.style.color = 'var(--gray-600)';
            }
        }
    }

    // Show validation errors
    showValidationErrors() {
        const errors = this.validator.getAllErrors();
        
        Object.keys(errors).forEach(fieldName => {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                this.showFieldError(field, errors[fieldName][0]);
            }
        });

        // Scroll to first error
        const firstErrorField = this.form.querySelector('.form-group.error input, .form-group.error select, .form-group.error textarea');
        if (firstErrorField) {
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstErrorField.focus();
        }
    }

    // Show field error
    showFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        formGroup.classList.remove('success');
        formGroup.classList.add('error');

        // Remove existing error message
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add new error message
        if (message) {
            const errorEl = document.createElement('div');
            errorEl.className = 'error-message';
            errorEl.textContent = message;
            formGroup.appendChild(errorEl);
        }
    }

    // Show field success
    showFieldSuccess(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        formGroup.classList.remove('error');
        formGroup.classList.add('success');

        // Remove error message
        const errorMessage = formGroup.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    // Clear field validation
    clearFieldValidation(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        formGroup.classList.remove('error', 'success');

        // Remove error message
        const errorMessage = formGroup.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    // Clear all validation
    clearAllValidation() {
        const formGroups = this.form.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            group.classList.remove('error', 'success');
            const errorMessage = group.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        });
    }

    // Show success modal
    showSuccessModal() {
        const modal = document.getElementById('success-modal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    // Close modal
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-text">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        });

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }

    // Show error message
    showErrorMessage(message) {
        this.showNotification(message, 'error');
    }

    // Cleanup
    cleanup() {
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }
        
        console.log('Edit form cleanup completed');
    }
}

// Initialize edit form when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.editForm = new EditForm();
    window.editForm.initialize();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.editForm) {
        window.editForm.cleanup();
    }
});

// Export for global access
window.EditForm = EditForm;

