/**
 * Main Application Module for Rapture Accessible
 * Simplified version focusing on manual capture and AI analysis
 */

class RaptureAccessible {
    constructor() {
        this.isInitialized = false;
        this.currentCapture = null;
        this.aiProviders = new Map();
        this.currentAIProvider = 'huggingface';
        this.apiKeys = new Map();

        this.init();
    }

    async init() {
        console.log('🚀 Initializing Rapture Accessible (Simplified)...');

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.performInitialization());
        } else {
            this.performInitialization();
        }
    }

    performInitialization() {
        try {
            this.initializeModules();
            this.setupErrorHandling();
            this.setupKeyboardShortcuts();
            this.setupSystemMonitoring();
            this.loadUserPreferences();
            this.setupAIProviders();
            this.setupAPIKeyManagement();
            this.setupButtons();

            this.isInitialized = true;
            console.log('✅ Rapture Accessible initialized successfully');
            this.announceInitialization();

        } catch (error) {
            console.error('❌ Initialization failed:', error);
            this.handleInitializationError(error);
        }
    }

    initializeModules() {
        if (window.accessibilityManager) {
            console.log('✅ Accessibility Manager loaded');
        }
        if (window.voiceCommandManager) {
            console.log('✅ Voice Command Manager loaded');
        }
        if (window.captureManager) {
            console.log('✅ Capture Manager loaded');
        }
        if (window.aiAnalyzer) {
            console.log('✅ AI Analyzer loaded');
        }
    }

    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            window.accessibilityManager?.announceError('An error occurred: ' + e.message);
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            const errorMessage = e.reason?.message || e.reason?.toString() || 'Unknown error occurred';
            window.accessibilityManager?.announceError(`System error: ${errorMessage}`);
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                switch (e.key.toLowerCase()) {
                    case '1':
                        e.preventDefault();
                        this.handleEmergencyCapture();
                        break;
                    case '2':
                        e.preventDefault();
                        this.handleSpeakStatus();
                        break;
                    case '3':
                        e.preventDefault();
                        this.handleAnalyzeCurrent();
                        break;
                    case '4':
                        e.preventDefault();
                        this.handleReadAloud();
                        break;
                    case 'h':
                        e.preventDefault();
                        this.showKeyboardShortcuts();
                        break;
                }
            }

            if (e.ctrlKey) {
                switch (e.key.toLowerCase()) {
                    case 's':
                        e.preventDefault();
                        this.handleSaveCapture();
                        break;
                }
            }
        });
    }

    setupSystemMonitoring() {
        if ('performance' in window) {
            setInterval(() => {
                this.updatePerformanceStats();
            }, 10000);
        }

        window.addEventListener('online', () => {
            window.accessibilityManager?.announce('Connection restored');
        });

        window.addEventListener('offline', () => {
            window.accessibilityManager?.announce('Connection lost - some features may not work');
        });
    }

    setupAIProviders() {
        // Define available AI providers with their configurations
        this.aiProviders.set('huggingface', {
            name: 'Hugging Face',
            type: 'free',
            requiresKey: false,
            model: 'microsoft/DialoGPT-medium',
            endpoint: 'https://api-inference.huggingface.co/models',
            description: 'Free conversational AI model. No API key required.',
            status: 'available'
        });

        this.aiProviders.set('openai', {
            name: 'OpenAI GPT-4o',
            type: 'free_tier',
            requiresKey: true,
            model: 'gpt-4o-mini',
            endpoint: 'https://api.openai.com/v1/chat/completions',
            description: 'Free tier available. Requires API key.',
            status: 'available'
        });

        this.aiProviders.set('anthropic', {
            name: 'Anthropic Claude',
            type: 'free_tier',
            requiresKey: true,
            model: 'claude-3-haiku-20240307',
            endpoint: 'https://api.anthropic.com/v1/messages',
            description: 'Free tier available. Requires API key.',
            status: 'available'
        });

        this.aiProviders.set('google', {
            name: 'Google Gemini',
            type: 'free_tier',
            requiresKey: true,
            model: 'gemini-pro',
            endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
            description: 'Free tier available. Requires API key.',
            status: 'available'
        });

        this.aiProviders.set('cohere', {
            name: 'Cohere',
            type: 'free_tier',
            requiresKey: true,
            model: 'command-light',
            endpoint: 'https://api.cohere.ai/v1/generate',
            description: 'Free tier available. Requires API key.',
            status: 'available'
        });

        // Load saved API keys
        this.loadAPIKeys();

        // Update UI with current AI status
        this.updateAIStatusDisplay();
    }

    setupAPIKeyManagement() {
        const aiSelect = document.getElementById('aiProviderSelect');
        const apiKeyGroup = document.getElementById('apiKeyGroup');
        const apiKeyInput = document.getElementById('apiKeyInput');
        const saveApiKeyBtn = document.getElementById('saveApiKey');
        const clearApiKeyBtn = document.getElementById('clearApiKey');

        if (aiSelect) {
            aiSelect.addEventListener('change', () => {
                this.currentAIProvider = aiSelect.value;
                this.updateAPIKeyVisibility();
                this.updateAIStatusDisplay();
                this.saveUserPreferences();
            });
        }

        if (saveApiKeyBtn) {
            saveApiKeyBtn.addEventListener('click', () => {
                this.saveCurrentAPIKey();
            });
        }

        if (clearApiKeyBtn) {
            clearApiKeyBtn.addEventListener('click', () => {
                this.clearCurrentAPIKey();
            });
        }

        // Setup dialog API key management
        this.setupDialogAPIKeyManagement();
    }

    setupDialogAPIKeyManagement() {
        const dialog = document.getElementById('apiKeyDialog');
        const dialogClose = document.getElementById('dialogClose');
        const dialogCancel = document.getElementById('dialogCancel');
        const dialogConfirm = document.getElementById('dialogConfirm');
        const testApiKeyBtn = document.getElementById('testApiKey');

        if (dialogClose) {
            dialogClose.addEventListener('click', () => {
                this.closeAPIKeyDialog();
            });
        }

        if (dialogCancel) {
            dialogCancel.addEventListener('click', () => {
                this.closeAPIKeyDialog();
            });
        }

        if (dialogConfirm) {
            dialogConfirm.addEventListener('click', () => {
                this.confirmDialogAPIKey();
            });
        }

        if (testApiKeyBtn) {
            testApiKeyBtn.addEventListener('click', () => {
                this.testDialogAPIKey();
            });
        }

        // Close dialog on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && dialog.style.display !== 'none') {
                this.closeAPIKeyDialog();
            }
        });
    }

    setupButtons() {
        // Manual screen capture
        const manualScreenBtn = document.getElementById('manualScreenCapture');
        if (manualScreenBtn) {
            manualScreenBtn.addEventListener('click', () => {
                this.handleManualScreenCapture();
            });
        }

        // Emergency capture
        const emergencyBtn = document.getElementById('emergencyCapture');
        if (emergencyBtn) {
            emergencyBtn.addEventListener('click', () => {
                this.handleEmergencyCapture();
            });
        }

        // Analyze current
        const analyzeBtn = document.getElementById('analyzeCapture');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => {
                this.handleAnalyzeCurrent();
            });
        }

        // Read aloud
        const readAloudBtn = document.getElementById('readAloud');
        if (readAloudBtn) {
            readAloudBtn.addEventListener('click', () => {
                this.handleReadAloud();
            });
        }

        // Save capture
        const saveBtn = document.getElementById('saveCapture');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.handleSaveCapture();
            });
        }

        // Quick help
        const quickHelpBtn = document.getElementById('quickHelp');
        if (quickHelpBtn) {
            quickHelpBtn.addEventListener('click', () => {
                this.showQuickHelp();
            });
        }
    }

    loadUserPreferences() {
        try {
            const preferences = JSON.parse(localStorage.getItem('raptureAccessiblePreferences') || '{}');

            if (preferences.aiProvider) {
                this.currentAIProvider = preferences.aiProvider;
                const aiSelect = document.getElementById('aiProviderSelect');
                if (aiSelect) {
                    aiSelect.value = preferences.aiProvider;
                }
            }

            console.log('✅ User preferences loaded');
        } catch (error) {
            console.error('Error loading preferences:', error);
        }
    }

    saveUserPreferences() {
        const preferences = {
            aiProvider: this.currentAIProvider,
            lastUsed: new Date().toISOString()
        };

        localStorage.setItem('raptureAccessiblePreferences', JSON.stringify(preferences));
    }

    loadAPIKeys() {
        try {
            const keys = JSON.parse(localStorage.getItem('raptureAPIKeys') || '{}');
            this.apiKeys = new Map(Object.entries(keys));
        } catch (error) {
            console.error('Error loading API keys:', error);
        }
    }

    saveAPIKeys() {
        const keys = Object.fromEntries(this.apiKeys);
        localStorage.setItem('raptureAPIKeys', JSON.stringify(keys));
    }

    updateAPIKeyVisibility() {
        const apiKeyGroup = document.getElementById('apiKeyGroup');
        const provider = this.aiProviders.get(this.currentAIProvider);

        if (provider && provider.requiresKey) {
            apiKeyGroup.style.display = 'block';
        } else {
            apiKeyGroup.style.display = 'none';
        }
    }

    saveCurrentAPIKey() {
        const apiKeyInput = document.getElementById('apiKeyInput');
        if (apiKeyInput && apiKeyInput.value.trim()) {
            this.apiKeys.set(this.currentAIProvider, apiKeyInput.value.trim());
            this.saveAPIKeys();
            this.updateAIStatusDisplay();
            window.accessibilityManager?.announce('API key saved successfully');
        }
    }

    clearCurrentAPIKey() {
        this.apiKeys.delete(this.currentAIProvider);
        this.saveAPIKeys();
        const apiKeyInput = document.getElementById('apiKeyInput');
        if (apiKeyInput) {
            apiKeyInput.value = '';
        }
        this.updateAIStatusDisplay();
        window.accessibilityManager?.announce('API key cleared');
    }

    updateAIStatusDisplay() {
        const currentAIEl = document.getElementById('currentAI');
        const statusEl = document.getElementById('aiConnectionStatus');

        if (currentAIEl) {
            const provider = this.aiProviders.get(this.currentAIProvider);
            currentAIEl.textContent = provider ? provider.name : 'Unknown';
        }

        if (statusEl) {
            const provider = this.aiProviders.get(this.currentAIProvider);
            if (provider) {
                if (provider.requiresKey && !this.apiKeys.has(this.currentAIProvider)) {
                    statusEl.textContent = 'API Key Required';
                    statusEl.className = 'status-value disconnected';
                } else {
                    statusEl.textContent = 'Ready';
                    statusEl.className = 'status-value connected';
                }
            }
        }
    }

    async handleManualScreenCapture() {
        try {
            if (window.autoCaptureManager && typeof window.autoCaptureManager.manualScreenCapture === 'function') {
                await window.autoCaptureManager.manualScreenCapture();
                window.accessibilityManager?.announce('Screen capture completed');
                this.enableAnalysisButtons();
            } else {
                console.error('Auto capture manager not available or manualScreenCapture method not found');
                window.accessibilityManager?.announceError('Screen capture not available - please refresh the page');
            }
        } catch (error) {
            console.error('Screen capture failed:', error);
            window.accessibilityManager?.announceError('Screen capture failed');
        }
    }

    async handleEmergencyCapture() {
        try {
            if (window.autoCaptureManager && typeof window.autoCaptureManager.emergencyCapture === 'function') {
                await window.autoCaptureManager.emergencyCapture();
                window.accessibilityManager?.announce('Emergency capture completed');
                this.enableAnalysisButtons();
            } else {
                console.error('Auto capture manager not available or emergencyCapture method not found');
                window.accessibilityManager?.announceError('Emergency capture not available - please refresh the page');
            }
        } catch (error) {
            console.error('Emergency capture failed:', error);
            window.accessibilityManager?.announceError('Emergency capture failed');
        }
    }

    enableAnalysisButtons() {
        const analyzeBtn = document.getElementById('analyzeCapture');
        const readAloudBtn = document.getElementById('readAloud');
        const saveBtn = document.getElementById('saveCapture');

        if (analyzeBtn) analyzeBtn.disabled = false;
        if (readAloudBtn) readAloudBtn.disabled = false;
        if (saveBtn) saveBtn.disabled = false;
    }

    async handleAnalyzeCurrent() {
        try {
            const provider = await this.getAvailableAIProvider();
            if (provider && window.aiAnalyzer) {
                await window.aiAnalyzer.analyzeWithAI(provider);
                window.accessibilityManager?.announce('Analysis completed');
            } else {
                window.accessibilityManager?.announceError('No AI provider available');
            }
        } catch (error) {
            console.error('Analysis failed:', error);
            window.accessibilityManager?.announceError('Analysis failed');
        }
    }

    async handleReadAloud() {
        try {
            if (window.aiAnalyzer) {
                await window.aiAnalyzer.readDescriptionAloud();
            }
        } catch (error) {
            console.error('Read aloud failed:', error);
            window.accessibilityManager?.announceError('Read aloud failed');
        }
    }

    async handleSaveCapture() {
        try {
            if (window.captureManager) {
                await window.captureManager.saveCurrentCapture();
                window.accessibilityManager?.announce('Capture saved');
            }
        } catch (error) {
            console.error('Save failed:', error);
            window.accessibilityManager?.announceError('Save failed');
        }
    }

    async handleSpeakStatus() {
        if (window.accessibilityManager) {
            window.accessibilityManager.handleSpeakStatus();
        }
    }

    async getAvailableAIProvider() {
        // First try current provider
        const currentProvider = this.aiProviders.get(this.currentAIProvider);
        if (currentProvider && await this.checkAIProviderStatus(currentProvider)) {
            return currentProvider;
        }

        // Fallback to other available providers
        for (const [key, provider] of this.aiProviders) {
            if (key !== this.currentAIProvider && await this.checkAIProviderStatus(provider)) {
                // Switch to this provider
                this.currentAIProvider = key;
                const aiSelect = document.getElementById('aiProviderSelect');
                if (aiSelect) {
                    aiSelect.value = key;
                }
                this.updateAIStatusDisplay();
                this.saveUserPreferences();
                return provider;
            }
        }

        return null;
    }

    async checkAIProviderStatus(provider) {
        try {
            if (provider.requiresKey && !this.apiKeys.has(this.currentAIProvider)) {
                return false;
            }

            // Test the provider with a simple request
            const testPayload = {
                model: provider.model,
                messages: [{ role: 'user', content: 'Hello' }],
                max_tokens: 10
            };

            const response = await fetch(`${provider.endpoint}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(provider.requiresKey ? { 'Authorization': `Bearer ${this.apiKeys.get(this.currentAIProvider)}` } : {})
                },
                body: JSON.stringify(testPayload)
            });

            return response.ok;
        } catch (error) {
            console.warn(`Provider ${provider.name} check failed:`, error);
            return false;
        }
    }

    showAPIKeyDialog(providerKey) {
        const dialog = document.getElementById('apiKeyDialog');
        const provider = this.aiProviders.get(providerKey);

        if (!dialog || !provider) return;

        // Update dialog content
        const providerName = dialog.querySelector('#providerName');
        const providerDescription = dialog.querySelector('#providerDescription');
        const alternativesGrid = dialog.querySelector('#alternativesGrid');

        if (providerName) providerName.textContent = provider.name;
        if (providerDescription) providerDescription.textContent = provider.description;

        // Populate alternatives
        if (alternativesGrid) {
            alternativesGrid.innerHTML = '';
            this.aiProviders.forEach((altProvider, key) => {
                if (key !== providerKey) {
                    const item = document.createElement('div');
                    item.className = `alternative-item ${altProvider.status}`;
                    item.innerHTML = `
                        <div class="alternative-name">${altProvider.name}</div>
                        <div class="alternative-description">${altProvider.description}</div>
                        <div class="alternative-status status-${altProvider.status}">
                            ${altProvider.status === 'available' ? 'Available' : 'Unavailable'}
                        </div>
                    `;
                    item.addEventListener('click', () => {
                        this.showAPIKeyDialog(key);
                    });
                    alternativesGrid.appendChild(item);
                }
            });
        }

        dialog.style.display = 'flex';
        dialog.querySelector('#dialogApiKey')?.focus();
    }

    closeAPIKeyDialog() {
        const dialog = document.getElementById('apiKeyDialog');
        if (dialog) {
            dialog.style.display = 'none';
        }
    }

    confirmDialogAPIKey() {
        const dialogApiKey = document.getElementById('dialogApiKey');
        if (dialogApiKey && dialogApiKey.value.trim()) {
            this.apiKeys.set(this.currentAIProvider, dialogApiKey.value.trim());
            this.saveAPIKeys();
            this.updateAIStatusDisplay();
            this.closeAPIKeyDialog();
            window.accessibilityManager?.announce('API key saved successfully');
        }
    }

    async testDialogAPIKey() {
        const dialogApiKey = document.getElementById('dialogApiKey');
        if (!dialogApiKey || !dialogApiKey.value.trim()) return;

        const testBtn = document.getElementById('testApiKey');
        const originalText = testBtn.textContent;

        testBtn.textContent = 'Testing...';
        testBtn.disabled = true;

        try {
            const provider = this.aiProviders.get(this.currentAIProvider);
            if (provider) {
                const isValid = await this.checkAIProviderStatus(provider);
                if (isValid) {
                    window.accessibilityManager?.announce('API key is valid');
                    testBtn.textContent = '✅ Valid';
                } else {
                    window.accessibilityManager?.announce('API key is invalid');
                    testBtn.textContent = '❌ Invalid';
                }
            }
        } catch (error) {
            window.accessibilityManager?.announce('API key test failed');
            testBtn.textContent = '❌ Error';
        }

        setTimeout(() => {
            testBtn.textContent = originalText;
            testBtn.disabled = false;
        }, 2000);
    }

    updatePerformanceStats() {
        if (performance.memory) {
            const memoryUsage = performance.memory.usedJSHeapSize;
            const memoryElement = document.getElementById('memoryUsage');
            if (memoryElement) {
                memoryElement.textContent = this.formatBytes(memoryUsage);
            }
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    announceInitialization() {
        setTimeout(() => {
            const announcement = `
                Rapture Accessible initialized.
                Use Alt+1 for emergency capture,
                Alt+2 to speak status,
                Alt+3 to analyze current capture,
                Alt+4 to read analysis aloud,
                Alt+H for help.
                Manual capture buttons are ready to use.
            `;
            if (window.accessibilityManager) {
                window.accessibilityManager.displayAnnouncement(announcement);
            }
        }, 1000);
    }

    handleInitializationError(error) {
        const errorMessage = `
            Initialization failed: ${error.message}.
            Basic functionality may still be available.
            Try refreshing the page or contact support.
        `;
        window.accessibilityManager?.announceError(errorMessage);
    }

    showKeyboardShortcuts() {
        const shortcuts = `
            Keyboard Shortcuts:
            Alt+1: Emergency capture
            Alt+2: Speak system status
            Alt+3: Analyze current capture
            Alt+4: Read description aloud
            Alt+H: Show this help
            Ctrl+S: Save current capture
            Escape: Cancel current operation
        `;
        window.accessibilityManager?.announce(shortcuts);
    }

    showQuickHelp() {
        const helpMessage = `
        🎯 Quick Help - Rapture Accessible (Simplified)

        📸 CAPTURE:
        • Manual Screen: Click "📸 Manual Screen Capture"
        • Emergency: Alt+1 or click "🚨 Emergency Capture"

        🤖 ANALYSIS:
        • Alt+3 or click "🤖 Analyze Current Capture"
        • Alt+4 or click "🔊 Read Analysis Aloud"
        • Choose AI provider in settings

        💾 MANAGEMENT:
        • Ctrl+S to save current capture
        • Click "🗑️ Clear All" to remove captures

        ⚙️ AI CONFIGURATION:
        • Default: Hugging Face (no API key needed)
        • Other providers require API keys
        • System automatically falls back to available providers

        🎤 VOICE COMMANDS:
        • "Capture screen", "Analyze capture"
        • "Read description", "Speak status"

        The system will automatically try multiple free AI providers if one fails.
        `;
        console.log(helpMessage);
        if (window.accessibilityManager) {
            window.accessibilityManager.announce('Quick help displayed in console');
        }
    }

    // Public API methods
    getSystemInfo() {
        return {
            isInitialized: this.isInitialized,
            currentCapture: !!this.currentCapture,
            currentAIProvider: this.currentAIProvider,
            availableProviders: Array.from(this.aiProviders.keys()),
            capturesCount: window.captureManager?.captures.length || 0
        };
    }
}

// Initialize the application
const raptureAccessible = new RaptureAccessible();
window.raptureAccessible = raptureAccessible;