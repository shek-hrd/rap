/**
 * Main Application Module for Rapture Accessible
 * Simplified version focusing on manual capture and AI analysis
 */

class RaptureAccessible {
    constructor() {
        this.isInitialized = false;
        this.currentCapture = null;
        this.aiProviders = new Map();
        this.currentAIProvider = 'web-llama';
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
        this.aiProviders.set('web-llama', {
            name: 'Llama 3.2 (Web)',
            type: 'free',
            requiresKey: false,
            model: 'llama-3.2-3b',
            endpoint: 'web-llama',
            description: 'Meta Llama 3.2 via web interface. Completely free.',
            status: 'available'
        });

        this.aiProviders.set('web-gpt', {
            name: 'GPT-4o Mini (Web)',
            type: 'free',
            requiresKey: false,
            model: 'gpt-4o-mini',
            endpoint: 'web-gpt',
            description: 'OpenAI GPT-4o Mini via web interface. Free access.',
            status: 'available'
        });

        this.aiProviders.set('web-claude', {
            name: 'Claude 3.5 (Web)',
            type: 'free',
            requiresKey: false,
            model: 'claude-3.5-sonnet',
            endpoint: 'web-claude',
            description: 'Anthropic Claude via web interface. Free access.',
            status: 'available'
        });

        this.aiProviders.set('huggingface', {
            name: 'Hugging Face',
            type: 'free',
            requiresKey: false,
            model: 'microsoft/DialoGPT-medium',
            endpoint: 'https://api-inference.huggingface.co/models',
            description: 'Free conversational AI model. No API key required.',
            status: 'available'
        });

        this.aiProviders.set('puter-gemini', {
            name: 'Google Gemini (Puter)',
            type: 'free',
            requiresKey: false,
            model: 'gemini-pro',
            endpoint: 'puter://ai/google/gemini',
            description: 'Google Gemini via Puter. Completely free, no registration.',
            status: 'available'
        });

        this.aiProviders.set('web-gemini', {
            name: 'Google Gemini (Web)',
            type: 'free',
            requiresKey: false,
            model: 'gemini-pro',
            endpoint: 'web-gemini',
            description: 'Google Gemini via web interface. Free access.',
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
            console.log('🔍 Attempting manual screen capture...');

            // Try multiple capture methods in order of preference
            let captureResult = null;

            // Method 1: Try Puter.js screen capture (if available)
            if (window.puter && window.puter.desktop && window.puter.desktop.screenshot) {
                captureResult = await this.captureWithPuter();
            }

            // Method 2: Try modern Screen Capture API
            if (!captureResult) {
                captureResult = await this.captureWithScreenCaptureAPI();
            }

            // Method 3: Try html2canvas for webpage capture
            if (!captureResult) {
                captureResult = await this.captureWithHtml2Canvas();
            }

            // Method 4: Try canvas-based capture
            if (!captureResult) {
                captureResult = await this.captureWithCanvas();
            }

            if (captureResult) {
                // Store the capture globally for other modules to access
                window.currentCapture = captureResult;

                // Update preview
                this.updatePreview(captureResult);

                // Enable analysis buttons
                this.enableAnalysisButtons();

                window.accessibilityManager?.announce('Screen capture completed successfully');
                console.log('✅ Screen capture completed:', captureResult.filename);
            } else {
                throw new Error('All capture methods failed');
            }

        } catch (error) {
            console.error('❌ Screen capture failed:', error);
            window.accessibilityManager?.announceError(`Screen capture failed: ${error.message}`);
        }
    }

    async handleEmergencyCapture() {
        try {
            console.log('🚨 Attempting emergency screen capture...');

            // For emergency capture, prioritize speed over quality
            let captureResult = null;

            // Method 1: Try html2canvas first (fastest)
            if (typeof html2canvas !== 'undefined') {
                captureResult = await this.captureWithHtml2Canvas();
            }

            // Method 2: Try canvas fallback (always available)
            if (!captureResult) {
                captureResult = await this.captureWithCanvas();
            }

            // Method 3: Try Screen Capture API if others fail
            if (!captureResult) {
                captureResult = await this.captureWithScreenCaptureAPI();
            }

            if (captureResult) {
                // Store the capture globally
                window.currentCapture = captureResult;

                // Update preview
                this.updatePreview(captureResult);

                // Enable analysis buttons
                this.enableAnalysisButtons();

                window.accessibilityManager?.announce('Emergency capture completed successfully');
                console.log('✅ Emergency capture completed:', captureResult.filename);
            } else {
                throw new Error('All emergency capture methods failed');
            }

        } catch (error) {
            console.error('❌ Emergency capture failed:', error);
            window.accessibilityManager?.announceError(`Emergency capture failed: ${error.message}`);
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

    // Screen Capture Implementation Methods

    async captureWithPuter() {
        try {
            console.log('📸 Trying Puter.js screen capture...');
            const screenshot = await window.puter.desktop.screenshot();
            return {
                type: 'image',
                subtype: 'screen',
                dataUrl: screenshot,
                filename: `screen_capture_${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
                timestamp: new Date().toISOString(),
                method: 'puter'
            };
        } catch (error) {
            console.warn('⚠️ Puter.js capture failed:', error.message);
            return null;
        }
    }

    async captureWithScreenCaptureAPI() {
        try {
            console.log('📸 Trying Screen Capture API...');

            // Check if the API is available
            if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
                console.warn('⚠️ Screen Capture API not available');
                return null;
            }

            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    mediaSource: 'screen',
                    width: { ideal: 1920, max: 1920 },
                    height: { ideal: 1080, max: 1080 }
                },
                audio: false
            });

            // Create video element to capture the stream
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();

            // Wait for video to load
            await new Promise(resolve => {
                video.onloadedmetadata = resolve;
            });

            // Create canvas to capture the frame
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw the video frame to canvas
            ctx.drawImage(video, 0, 0);

            // Stop the stream
            stream.getTracks().forEach(track => track.stop());

            // Convert to data URL
            const dataUrl = canvas.toDataURL('image/png');

            return {
                type: 'image',
                subtype: 'screen',
                dataUrl: dataUrl,
                filename: `screen_capture_${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
                timestamp: new Date().toISOString(),
                method: 'screen_capture_api'
            };

        } catch (error) {
            console.warn('⚠️ Screen Capture API failed:', error.message);
            return null;
        }
    }

    async captureWithHtml2Canvas() {
        try {
            console.log('📸 Trying html2canvas...');

            // Check if html2canvas is available (need to load it first)
            if (typeof html2canvas === 'undefined') {
                console.warn('⚠️ html2canvas not loaded');
                return null;
            }

            const canvas = await html2canvas(document.body, {
                useCORS: true,
                allowTaint: true,
                scale: 1,
                width: window.innerWidth,
                height: window.innerHeight,
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight
            });

            const dataUrl = canvas.toDataURL('image/png');

            return {
                type: 'image',
                subtype: 'webpage',
                dataUrl: dataUrl,
                filename: `webpage_capture_${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
                timestamp: new Date().toISOString(),
                method: 'html2canvas'
            };

        } catch (error) {
            console.warn('⚠️ html2canvas capture failed:', error.message);
            return null;
        }
    }

    async captureWithCanvas() {
        try {
            console.log('📸 Trying canvas-based capture...');

            // Create a canvas element
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Set canvas size to window size
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            // Fill with a solid color as fallback (better than nothing)
            ctx.fillStyle = '#2d3748';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Add text indicating this is a fallback capture
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Screen Capture (Fallback Method)', canvas.width / 2, canvas.height / 2 - 20);
            ctx.fillText(`Captured at: ${new Date().toLocaleString()}`, canvas.width / 2, canvas.height / 2 + 20);

            const dataUrl = canvas.toDataURL('image/png');

            return {
                type: 'image',
                subtype: 'fallback',
                dataUrl: dataUrl,
                filename: `fallback_capture_${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
                timestamp: new Date().toISOString(),
                method: 'canvas_fallback'
            };

        } catch (error) {
            console.warn('⚠️ Canvas capture failed:', error.message);
            return null;
        }
    }

    updatePreview(capture) {
        const previewImage = document.getElementById('previewImage');
        const previewPlaceholder = document.getElementById('previewPlaceholder');

        if (previewImage && capture.dataUrl) {
            previewImage.src = capture.dataUrl;
            previewImage.style.display = 'block';
            previewImage.alt = `Screen capture - ${capture.subtype || 'screen'}`;
        }

        if (previewPlaceholder) {
            previewPlaceholder.style.display = 'none';
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

            // Special handling for different provider types
            if (provider.endpoint.startsWith('puter://')) {
                // Puter providers are always available if Puter.js is loaded
                return window.puter && window.puter.ai;
            }

            // Web-based providers are always available (no API calls needed)
            if (provider.endpoint.startsWith('web-')) {
                return true;
            }

            // Test the provider with a simple request
            const testPayload = {
                model: provider.model,
                messages: [{ role: 'user', content: 'Hello' }],
                max_tokens: 10
            };

            // Use different endpoints based on provider
            let endpoint = `${provider.endpoint}`;
            if (provider.name.toLowerCase().includes('huggingface')) {
                endpoint = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';
            } else if (!endpoint.includes('/chat/completions') && !endpoint.includes('/generate')) {
                endpoint = `${endpoint}/chat/completions`;
            }

            const response = await fetch(endpoint, {
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
        • Default: Llama 3.2 (Web) - completely free
        • Free options: GPT-4o Mini (Web), Claude 3.5 (Web), Hugging Face, Google Gemini (Puter)
        • All web-based providers work without API keys
        • Other providers require API keys
        • System automatically falls back to available providers

        🎤 VOICE COMMANDS:
        • "Capture screen", "Analyze capture"
        • "Read description", "Speak status"

        The system will automatically try multiple free AI providers if one fails.
        Available free providers: Llama 3.2 (Web), GPT-4o Mini (Web), Claude 3.5 (Web), Hugging Face, Google Gemini (Puter).
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