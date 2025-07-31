// Form Validation System - Handles validation for the project edit form

class FormValidator {
    constructor() {
        this.rules = {};
        this.errors = {};
        this.isValid = true;
    }

    // Add validation rule
    addRule(fieldName, validator, message) {
        if (!this.rules[fieldName]) {
            this.rules[fieldName] = [];
        }
        this.rules[fieldName].push({ validator, message });
    }

    // Validate single field
    validateField(fieldName, value) {
        const fieldRules = this.rules[fieldName];
        if (!fieldRules) return true;

        this.errors[fieldName] = [];

        for (const rule of fieldRules) {
            if (!rule.validator(value)) {
                this.errors[fieldName].push(rule.message);
            }
        }

        return this.errors[fieldName].length === 0;
    }

    // Validate all fields
    validateAll(formData) {
        this.errors = {};
        this.isValid = true;

        for (const [fieldName, value] of Object.entries(formData)) {
            if (!this.validateField(fieldName, value)) {
                this.isValid = false;
            }
        }

        return this.isValid;
    }

    // Get errors for a field
    getFieldErrors(fieldName) {
        return this.errors[fieldName] || [];
    }

    // Get all errors
    getAllErrors() {
        return this.errors;
    }

    // Clear errors
    clearErrors() {
        this.errors = {};
        this.isValid = true;
    }

    // Setup default validation rules
    setupDefaultRules() {
        // Project Name
        this.addRule('projectName', 
            value => value && value.trim().length >= 3,
            'Project name must be at least 3 characters long'
        );

        this.addRule('projectName',
            value => value && value.trim().length <= 100,
            'Project name must be less than 100 characters'
        );

        // Start Date
        this.addRule('startDate',
            value => value && !isNaN(Date.parse(value)),
            'Please enter a valid start date'
        );

        this.addRule('startDate',
            value => {
                if (!value) return false;
                const date = new Date(value);
                const today = new Date();
                const oneYearAgo = new Date();
                oneYearAgo.setFullYear(today.getFullYear() - 1);
                return date >= oneYearAgo && date <= today;
            },
            'Start date must be within the last year and not in the future'
        );

        // Description
        this.addRule('description',
            value => value && value.trim().length >= 10,
            'Description must be at least 10 characters long'
        );

        this.addRule('description',
            value => value && value.trim().length <= 1000,
            'Description must be less than 1000 characters'
        );

        // Status
        this.addRule('status',
            value => ['In Progress', 'Delayed', 'On Hold', 'Cancelled', 'Completed'].includes(value),
            'Please select a valid status'
        );

        // Current Stage
        this.addRule('currentStage',
            value => {
                const num = parseInt(value);
                return !isNaN(num) && num >= 1 && num <= 19;
            },
            'Current stage must be between 1 and 19'
        );

        // Automation Status
        this.addRule('automationStatus',
            value => ['Running', 'Paused'].includes(value),
            'Please select a valid automation status'
        );

        // Progress
        this.addRule('progress',
            value => {
                const num = parseFloat(value);
                return !isNaN(num) && num >= 0 && num <= 100;
            },
            'Progress must be between 0 and 100'
        );

        // Stage Progress
        this.addRule('stage6Progress',
            value => {
                const num = parseFloat(value);
                return !isNaN(num) && num >= 0 && num <= 100;
            },
            'Stage progress must be between 0 and 100'
        );

        // Days Elapsed
        this.addRule('daysElapsed',
            value => {
                const num = parseInt(value);
                return !isNaN(num) && num >= 0 && num <= 365;
            },
            'Days elapsed must be between 0 and 365'
        );

        // Estimated Completion
        this.addRule('estimatedCompletion',
            value => value && !isNaN(Date.parse(value)),
            'Please enter a valid completion date'
        );

        this.addRule('estimatedCompletion',
            value => {
                if (!value) return false;
                const date = new Date(value);
                const today = new Date();
                return date >= today;
            },
            'Estimated completion must be in the future'
        );

        // Time Efficiency
        this.addRule('timeEfficiency',
            value => {
                const num = parseFloat(value);
                return !isNaN(num) && num >= 0 && num <= 200;
            },
            'Time efficiency must be between 0 and 200'
        );

        // Tests Completed
        this.addRule('testsCompleted',
            value => {
                const num = parseInt(value);
                return !isNaN(num) && num >= 0;
            },
            'Tests completed must be a positive number'
        );

        // Total Tests
        this.addRule('totalTests',
            value => {
                const num = parseInt(value);
                return !isNaN(num) && num >= 1;
            },
            'Total tests must be at least 1'
        );

        // Quality Score
        this.addRule('qualityScore',
            value => {
                const num = parseFloat(value);
                return !isNaN(num) && num >= 0 && num <= 100;
            },
            'Quality score must be between 0 and 100'
        );

        // Budget Used
        this.addRule('budgetUsed',
            value => {
                const num = parseFloat(value);
                return !isNaN(num) && num >= 0;
            },
            'Budget used must be a positive number'
        );

        // Budget Total
        this.addRule('budgetTotal',
            value => {
                const num = parseFloat(value);
                return !isNaN(num) && num >= 1;
            },
            'Total budget must be at least $1'
        );

        // Project Manager
        this.addRule('projectManager',
            value => value && value.trim().length >= 3,
            'Project manager name must be at least 3 characters long'
        );

        // Cross-field validations
        this.addCrossFieldRules();
    }

    // Add cross-field validation rules
    addCrossFieldRules() {
        // Tests completed should not exceed total tests
        this.addRule('testsCompleted',
            (value, formData) => {
                const completed = parseInt(value);
                const total = parseInt(formData.totalTests);
                return isNaN(completed) || isNaN(total) || completed <= total;
            },
            'Tests completed cannot exceed total tests'
        );

        // Budget used should not exceed total budget
        this.addRule('budgetUsed',
            (value, formData) => {
                const used = parseFloat(value);
                const total = parseFloat(formData.budgetTotal);
                return isNaN(used) || isNaN(total) || used <= total;
            },
            'Budget used cannot exceed total budget'
        );

        // Estimated completion should be after start date
        this.addRule('estimatedCompletion',
            (value, formData) => {
                if (!value || !formData.startDate) return true;
                const completion = new Date(value);
                const start = new Date(formData.startDate);
                return completion > start;
            },
            'Estimated completion must be after start date'
        );
    }

    // Validate with cross-field rules
    validateWithCrossFields(formData) {
        this.errors = {};
        this.isValid = true;

        for (const [fieldName, value] of Object.entries(formData)) {
            const fieldRules = this.rules[fieldName];
            if (!fieldRules) continue;

            this.errors[fieldName] = [];

            for (const rule of fieldRules) {
                // Pass formData for cross-field validation
                const isValid = rule.validator.length > 1 ? 
                    rule.validator(value, formData) : 
                    rule.validator(value);

                if (!isValid) {
                    this.errors[fieldName].push(rule.message);
                }
            }

            if (this.errors[fieldName].length === 0) {
                delete this.errors[fieldName];
            } else {
                this.isValid = false;
            }
        }

        return this.isValid;
    }

    // Real-time validation for a field
    validateFieldRealTime(fieldName, value, formData = {}) {
        const isValid = this.validateField(fieldName, value);
        
        // Also check cross-field rules
        const fieldRules = this.rules[fieldName];
        if (fieldRules) {
            for (const rule of fieldRules) {
                if (rule.validator.length > 1) {
                    const crossFieldValid = rule.validator(value, formData);
                    if (!crossFieldValid) {
                        if (!this.errors[fieldName]) {
                            this.errors[fieldName] = [];
                        }
                        if (!this.errors[fieldName].includes(rule.message)) {
                            this.errors[fieldName].push(rule.message);
                        }
                        return false;
                    }
                }
            }
        }

        return isValid;
    }

    // Get validation summary
    getValidationSummary() {
        const errorCount = Object.keys(this.errors).length;
        const totalErrors = Object.values(this.errors).reduce((sum, errors) => sum + errors.length, 0);

        return {
            isValid: this.isValid,
            errorCount,
            totalErrors,
            errors: this.errors
        };
    }

    // Format errors for display
    formatErrorsForDisplay() {
        const formatted = {};
        
        for (const [fieldName, errors] of Object.entries(this.errors)) {
            formatted[fieldName] = errors.join(', ');
        }

        return formatted;
    }

    // Check if specific field has errors
    hasFieldError(fieldName) {
        return this.errors[fieldName] && this.errors[fieldName].length > 0;
    }

    // Get first error for a field
    getFirstFieldError(fieldName) {
        const errors = this.errors[fieldName];
        return errors && errors.length > 0 ? errors[0] : null;
    }

    // Custom validation for business rules
    addBusinessRules() {
        // If status is "Completed", progress should be 100%
        this.addRule('progress',
            (value, formData) => {
                if (formData.status === 'Completed') {
                    return parseFloat(value) === 100;
                }
                return true;
            },
            'Progress must be 100% when status is Completed'
        );

        // If status is "Cancelled", automation should be paused
        this.addRule('automationStatus',
            (value, formData) => {
                if (formData.status === 'Cancelled') {
                    return value === 'Paused';
                }
                return true;
            },
            'Automation must be paused when project is cancelled'
        );

        // Quality score should be reasonable for the current stage
        this.addRule('qualityScore',
            (value, formData) => {
                const score = parseFloat(value);
                const stage = parseInt(formData.currentStage);
                
                // Early stages shouldn't have very high quality scores
                if (stage <= 3 && score > 95) {
                    return false;
                }
                
                return true;
            },
            'Quality score seems too high for early project stages'
        );
    }
}

// Export for global use
window.FormValidator = FormValidator;

