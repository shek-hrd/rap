/**
 * Main Application Module for Rapture Accessible
 * Coordinates all modules and provides overall application logic
 */

class RaptureAccessible {
    constructor() {
        this.isInitialized = false;
        this.currentCapture = null;
        this.autoCaptureInterval = null;

        this.init();
    }

    async init() {
        console.log('🚀 Initializing Rapture Accessible...');

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.performInitialization());
        } else {
            this.performInitialization();
        }
    }

    performInitialization() {
        try {
            // Initialize all modules
            this.initializeModules();

            // Setup global error handling
            this.setupErrorHandling();

            // Setup keyboard shortcuts
            this.setupKeyboardShortcuts();

            // Setup system monitoring
            this.setupSystemMonitoring();

            // Load user preferences
            this.loadUserPreferences();

            // Setup autoCapture on first load
            this.setupFirstLoadAutoCapture();

            // Setup sequential actions
            this.setupSequentialActions();

            this.isInitialized = true;

            console.log('✅ Rapture Accessible initialized successfully');
            this.announceInitialization();

        } catch (error) {
            console.error('❌ Initialization failed:', error);
            this.handleInitializationError(error);
        }
    }

    initializeModules() {
        // Modules are initialized automatically when their scripts load
        // This method can be used for any additional setup

        // Make modules globally accessible
        if (window.accessibilityManager) {
            console.log('✅ Accessibility Manager loaded');
        }
        if (window.voiceCommandManager) {
            console.log('✅ Voice Command Manager loaded');
        }
        if (window.autoCaptureManager) {
            console.log('✅ Auto Capture Manager loaded');
        }
        if (window.aiAnalyzer) {
            console.log('✅ AI Analyzer loaded');
        }
        if (window.captureManager) {
            console.log('✅ Capture Manager loaded');
        }

        // Setup global button press logging
        this.setupButtonPressLogging();
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
            // Alt key combinations
            if (e.altKey) {
                switch (e.key.toLowerCase()) {
                    case '1':
                        e.preventDefault();
                        this.handleQuickAction('autoCapture');
                        break;
                    case '2':
                        e.preventDefault();
                        this.handleQuickAction('emergencyCapture');
                        break;
                    case '3':
                        e.preventDefault();
                        this.handleQuickAction('speakStatus');
                        break;
                    case '4':
                        e.preventDefault();
                        this.handleQuickAction('analyzeCurrent');
                        break;
                    case '5':
                        e.preventDefault();
                        this.handleQuickAction('readAloud');
                        break;
                    case 'h':
                        e.preventDefault();
                        this.showKeyboardShortcuts();
                        break;
                }
            }

            // Ctrl key combinations
            if (e.ctrlKey) {
                switch (e.key.toLowerCase()) {
                    case 's':
                        e.preventDefault();
                        this.handleQuickAction('saveCapture');
                        break;
                    case 'e':
                        e.preventDefault();
                        this.handleQuickAction('exportAll');
                        break;
                }
            }
        });
    }

    handleQuickAction(action) {
        switch (action) {
            case 'autoCapture':
                if (window.autoCaptureManager) {
                    window.autoCaptureManager.toggleAutoCapture();
                }
                break;
            case 'emergencyCapture':
                if (window.autoCaptureManager) {
                    window.autoCaptureManager.emergencyCapture();
                }
                break;
            case 'speakStatus':
                if (window.accessibilityManager) {
                    window.accessibilityManager.handleSpeakStatus();
                }
                break;
            case 'readAloud':
                if (window.aiAnalyzer) {
                    window.aiAnalyzer.readDescriptionAloud();
                }
                break;
            case 'saveCapture':
                if (window.captureManager) {
                    window.captureManager.saveCurrentCapture();
                }
                break;
            case 'exportAll':
                if (window.captureManager) {
                    window.captureManager.downloadAllAsHtml();
                }
                break;
            case 'analyzeCurrent':
                if (window.aiAnalyzer) {
                    window.aiAnalyzer.analyzeWithAI();
                }
                break;
        }
    }

    setupSystemMonitoring() {
        // Monitor system resources
        if ('performance' in window) {
            setInterval(() => {
                this.updatePerformanceStats();
            }, 10000); // Every 10 seconds
        }

        // Monitor online status
        window.addEventListener('online', () => {
            window.accessibilityManager?.announce('Connection restored');
        });

        window.addEventListener('offline', () => {
            window.accessibilityManager?.announce('Connection lost - some features may not work');
        });
    }

    setupButtonPressLogging() {
        // Add logging to all buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            if (!button.hasAttribute('data-logged')) {
                button.addEventListener('click', (e) => {
                    const buttonText = e.target.textContent.trim() || e.target.id || 'Unknown Button';
                    console.log(`🔘 Button pressed: ${buttonText}`);
                });
                button.setAttribute('data-logged', 'true');
            }
        });

        // Monitor for dynamically added buttons
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const newButtons = node.querySelectorAll ?
                            node.querySelectorAll('button:not([data-logged])') :
                            (node.tagName === 'BUTTON' ? [node] : []);

                        newButtons.forEach(button => {
                            button.addEventListener('click', (e) => {
                                const buttonText = e.target.textContent.trim() || e.target.id || 'Unknown Button';
                                console.log(`🔘 Button pressed: ${buttonText}`);
                            });
                            button.setAttribute('data-logged', 'true');
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('✅ Button press logging initialized');
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

    loadUserPreferences() {
        try {
            const preferences = JSON.parse(localStorage.getItem('raptureAccessiblePreferences') || '{}');

            // Apply preferences
            if (preferences.autoCaptureEnabled) {
                setTimeout(() => {
                    if (window.autoCaptureManager) {
                        window.autoCaptureManager.startAutoCapture();
                    }
                }, 2000); // Delay to allow full initialization
            }

            if (preferences.aiProvider) {
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
            autoCaptureEnabled: window.autoCaptureManager?.isAutoCapturing || false,
            aiProvider: document.getElementById('aiProviderSelect')?.value || 'gemini',
            lastUsed: new Date().toISOString()
        };

        localStorage.setItem('raptureAccessiblePreferences', JSON.stringify(preferences));
    }

    setupFirstLoadAutoCapture() {
        // Only perform initial capture if manual capture mode is disabled
        setTimeout(() => {
            if (window.autoCaptureManager && !this.currentCapture) {
                const manualMode = window.autoCaptureManager.manualCaptureMode;
                if (!manualMode) {
                    console.log('🚀 Performing first-load auto capture...');
                    window.autoCaptureManager.performAutoCapture();
                } else {
                    console.log('🚀 Manual capture mode enabled - skipping first-load auto capture');
                    window.accessibilityManager?.announce('Manual capture mode is enabled. Use the Auto Capture button to begin capturing.');
                }
            }
        }, 3000); // 3 second delay to allow everything to load
    }

    announceInitialization() {
        setTimeout(() => {
            // Only display visually, don't speak automatically
            const announcement = `
                Rapture Accessible initialized.
                Use Alt+1 for auto capture,
                Alt+2 for emergency capture,
                Alt+3 to speak status,
                Alt+4 to analyze current capture,
                Alt+5 to read analysis aloud,
                Alt+H for help.
                Manual capture buttons are ready to use.
            `;
            // Just display, don't announce via speech synthesis
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
            Alt+1: Toggle auto capture
            Alt+2: Emergency capture
            Alt+3: Speak system status
            Alt+4: Analyze current capture
            Alt+5: Read description aloud
            Alt+C: Auto capture (alternative)
            Alt+V: Voice commands (when supported)
            Alt+R: Read aloud (alternative)
            Alt+S: Speak status (alternative)
            Alt+H: Show this help
            Ctrl+S: Save current capture
            Ctrl+E: Export all captures
            Escape: Cancel current operation
        `;
        window.accessibilityManager?.announce(shortcuts);
    }

    // Sequential actions system
    async performSequentialActions(actionSequence) {
        if (window.autoCaptureManager) {
            await window.autoCaptureManager.performSequentialActions(actionSequence);
        }
    }

    // Predefined action sequences
    startQuickSequence() {
        const actions = [
            {
                name: "Screen Capture",
                execute: async () => {
                    if (window.autoCaptureManager) {
                        await window.autoCaptureManager.manualScreenCapture();
                    }
                }
            },
            {
                name: "AI Analysis",
                execute: async () => {
                    if (window.aiAnalyzer) {
                        await window.aiAnalyzer.analyzeWithAI();
                    }
                }
            },
            {
                name: "Save Capture",
                execute: async () => {
                    if (window.captureManager) {
                        window.captureManager.saveCurrentCapture();
                    }
                }
            }
        ];

        this.performSequentialActions(actions);
    }

    startFullSequence() {
        const actions = [
            {
                name: "Screen Capture",
                execute: async () => {
                    if (window.autoCaptureManager) {
                        await window.autoCaptureManager.manualScreenCapture();
                    }
                }
            },
            {
                name: "Video Frame Capture",
                execute: async () => {
                    if (window.autoCaptureManager) {
                        await window.autoCaptureManager.manualVideoCapture();
                    }
                }
            },
            {
                name: "AI Analysis",
                execute: async () => {
                    if (window.aiAnalyzer) {
                        await window.aiAnalyzer.analyzeWithAI();
                    }
                }
            },
            {
                name: "Read Analysis Aloud",
                execute: async () => {
                    if (window.aiAnalyzer) {
                        window.aiAnalyzer.readDescriptionAloud();
                    }
                }
            },
            {
                name: "Save All Captures",
                execute: async () => {
                    if (window.captureManager) {
                        window.captureManager.saveCurrentCapture();
                    }
                }
            }
        ];

        this.performSequentialActions(actions);
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // Public API methods
    getSystemInfo() {
        return {
            isInitialized: this.isInitialized,
            currentCapture: !!this.currentCapture,
            autoCapturing: window.autoCaptureManager?.isAutoCapturing || false,
            capturesCount: window.captureManager?.captures.length || 0,
            aiProviders: window.aiAnalyzer?.getAvailableProviders() || []
        };
    }

    // Method to handle module communication
    broadcast(event, data) {
        // Broadcast events between modules
        switch (event) {
            case 'capture:created':
                if (data.capture) {
                    this.currentCapture = data.capture;

                    // Auto-save capture
                    if (window.captureManager) {
                        setTimeout(() => {
                            window.captureManager.saveCurrentCapture();
                            this.addMiniAnnouncement(`Capture saved: ${data.capture.name || 'Untitled'}`);
                        }, 100);
                    }

                    // Auto-analyze if enabled
                    const autoAnalyzeEnabled = document.getElementById('autoAnalyzeToggle')?.checked ?? true;
                    if (autoAnalyzeEnabled && window.aiAnalyzer) {
                        setTimeout(() => {
                            window.aiAnalyzer.analyzeWithAI();
                        }, 500);
                    }
                }
                break;

            case 'analysis:completed':
                if (data.analysis) {
                    // Save analysis with capture
                    if (this.currentCapture && window.captureManager) {
                        this.currentCapture.analysis = data.analysis;

                        // Auto-save after analysis
                        setTimeout(() => {
                            window.captureManager.saveCurrentCapture();
                            this.addMiniAnnouncement('Analysis completed and saved');
                        }, 100);
                    }
                }
                break;
        }
    }

    // Setup sequential action buttons
    setupSequentialActions() {
        const quickSequenceBtn = document.getElementById('quickSequence');
        const fullSequenceBtn = document.getElementById('fullSequence');

        if (quickSequenceBtn) {
            quickSequenceBtn.addEventListener('click', () => {
                this.startQuickSequence();
            });
        }

        if (fullSequenceBtn) {
            fullSequenceBtn.addEventListener('click', () => {
                this.startFullSequence();
            });
        }

        // Setup Quick Help button
        const quickHelpBtn = document.getElementById('quickHelp');
        if (quickHelpBtn) {
            quickHelpBtn.addEventListener('click', () => {
                this.showQuickHelp();
            });
        }
    }

    // ===== NEW FUNCTIONALITY FOR CONSOLE MONITORING AND PROGRESS TRACKING =====

    setupConsoleMonitoring() {
        this.consoleMonitor = {
            isPaused: false,
            logs: [],
            maxLogs: 1000,
            errorCount: 0,
            warningCount: 0,
            infoCount: 0
        };

        // Override console methods to capture output
        const originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info
        };

        // Create console log container
        this.createConsoleLogContainer();

        // Override console methods
        console.log = (...args) => {
            originalConsole.log(...args);
            this.addConsoleEntry('log', args.join(' '));
        };

        console.error = (...args) => {
            originalConsole.error(...args);
            this.addConsoleEntry('error', args.join(' '));
            this.consoleMonitor.errorCount++;
            this.updateConsoleStats();
        };

        console.warn = (...args) => {
            originalConsole.warn(...args);
            this.addConsoleEntry('warning', args.join(' '));
            this.consoleMonitor.warningCount++;
            this.updateConsoleStats();
        };

        console.info = (...args) => {
            originalConsole.info(...args);
            this.addConsoleEntry('info', args.join(' '));
            this.consoleMonitor.infoCount++;
            this.updateConsoleStats();
        };

        // Setup console control buttons
        this.setupConsoleControls();
    }

    createConsoleLogContainer() {
        const consoleLog = document.getElementById('consoleLog');
        if (consoleLog) {
            consoleLog.innerHTML = '<div class="console-entry info">🖥️ Console monitoring started...</div>';
        }
    }

    addConsoleEntry(type, message) {
        if (this.consoleMonitor.isPaused) return;

        const consoleLog = document.getElementById('consoleLog');
        if (!consoleLog) return;

        const entry = document.createElement('div');
        entry.className = `console-entry ${type}`;
        entry.innerHTML = `<span class="timestamp">[${new Date().toLocaleTimeString()}]</span> ${this.escapeHtml(message)}`;

        // Add to logs array
        this.consoleMonitor.logs.push({
            type,
            message,
            timestamp: new Date()
        });

        // Keep only recent logs
        if (this.consoleMonitor.logs.length > this.consoleMonitor.maxLogs) {
            this.consoleMonitor.logs.shift();
        }

        // Add to DOM
        consoleLog.appendChild(entry);
        consoleLog.scrollTop = consoleLog.scrollHeight;
    }

    updateConsoleStats() {
        const errorCountEl = document.getElementById('errorCount');
        const warningCountEl = document.getElementById('warningCount');
        const infoCountEl = document.getElementById('infoCount');

        if (errorCountEl) errorCountEl.textContent = `Errors: ${this.consoleMonitor.errorCount}`;
        if (warningCountEl) warningCountEl.textContent = `Warnings: ${this.consoleMonitor.warningCount}`;
        if (infoCountEl) infoCountEl.textContent = `Info: ${this.consoleMonitor.infoCount}`;
    }

    setupConsoleControls() {
        const clearConsoleBtn = document.getElementById('clearConsole');
        const toggleConsoleBtn = document.getElementById('toggleConsole');
        const exportConsoleBtn = document.getElementById('exportConsole');

        if (clearConsoleBtn) {
            clearConsoleBtn.addEventListener('click', () => {
                this.clearConsole();
            });
        }

        if (toggleConsoleBtn) {
            toggleConsoleBtn.addEventListener('click', () => {
                this.toggleConsoleMonitoring();
            });
        }

        if (exportConsoleBtn) {
            exportConsoleBtn.addEventListener('click', () => {
                this.exportConsoleLogs();
            });
        }
    }

    clearConsole() {
        const consoleLog = document.getElementById('consoleLog');
        if (consoleLog) {
            consoleLog.innerHTML = '<div class="console-entry info">📝 Console cleared</div>';
        }
        this.consoleMonitor.errorCount = 0;
        this.consoleMonitor.warningCount = 0;
        this.consoleMonitor.infoCount = 0;
        this.updateConsoleStats();
    }

    toggleConsoleMonitoring() {
        this.consoleMonitor.isPaused = !this.consoleMonitor.isPaused;
        const toggleBtn = document.getElementById('toggleConsole');
        if (toggleBtn) {
            toggleBtn.textContent = this.consoleMonitor.isPaused ? '▶️ Resume Monitoring' : '⏸️ Pause Monitoring';
            toggleBtn.className = `btn btn-small ${this.consoleMonitor.isPaused ? 'btn-success' : 'btn-info'}`;
        }
        this.addConsoleEntry('info', `Console monitoring ${this.consoleMonitor.isPaused ? 'paused' : 'resumed'}`);
    }

    exportConsoleLogs() {
        const logsData = this.consoleMonitor.logs.map(log =>
            `[${log.timestamp.toISOString()}] ${log.type.toUpperCase()}: ${log.message}`
        ).join('\n');

        const blob = new Blob([logsData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `console-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ===== ANALYSIS PROGRESS TRACKING =====

    setupAnalysisProgress() {
        this.analysisProgress = {
            currentStep: 0,
            totalSteps: 3,
            isActive: false,
            startTime: null,
            steps: [
                { name: 'Image Processing', status: 'pending' },
                { name: 'AI Analysis', status: 'pending' },
                { name: 'Result Processing', status: 'pending' }
            ]
        };

        this.updateProgressDisplay();
    }

    startAnalysisProgress() {
        this.analysisProgress.isActive = true;
        this.analysisProgress.currentStep = 0;
        this.analysisProgress.startTime = Date.now();
        
        // Update all steps to pending
        this.analysisProgress.steps.forEach((step, index) => {
            step.status = index === 0 ? 'active' : 'pending';
        });

        this.updateProgressDisplay();
        this.addConsoleEntry('info', '🔄 Analysis started');
    }

    updateAnalysisStep(stepIndex, status, message = '') {
        if (!this.analysisProgress.isActive) return;

        this.analysisProgress.steps[stepIndex].status = status;
        
        if (status === 'completed' && stepIndex < this.analysisProgress.steps.length - 1) {
            this.analysisProgress.steps[stepIndex + 1].status = 'active';
            this.analysisProgress.currentStep = stepIndex + 1;
        }

        this.updateProgressDisplay();

        if (message) {
            this.addConsoleEntry('info', `📊 ${this.analysisProgress.steps[stepIndex].name}: ${message}`);
        }
    }

    completeAnalysisProgress() {
        this.analysisProgress.isActive = false;
        this.analysisProgress.steps.forEach(step => {
            step.status = 'completed';
        });
        this.analysisProgress.currentStep = this.analysisProgress.totalSteps;

        this.updateProgressDisplay();
        this.addConsoleEntry('info', '✅ Analysis completed');
    }

    updateProgressDisplay() {
        const progressBar = document.getElementById('analysisProgressBar');
        const progressText = document.getElementById('progressText');
        const progressPercentage = document.getElementById('progressPercentage');

        if (!progressBar || !progressText || !progressPercentage) return;

        const percentage = Math.round((this.analysisProgress.currentStep / this.analysisProgress.totalSteps) * 100);
        progressBar.style.width = `${percentage}%`;
        progressBar.setAttribute('aria-valuenow', percentage);

        progressText.textContent = this.analysisProgress.isActive
            ? `Step ${this.analysisProgress.currentStep + 1}: ${this.analysisProgress.steps[this.analysisProgress.currentStep].name}`
            : 'Ready to analyze';
        progressPercentage.textContent = `${percentage}%`;

        // Update mini progress bar
        this.updateMiniProgress(percentage, this.analysisProgress.isActive ? 'Analyzing...' : 'Ready');

        // Update step indicators
        this.analysisProgress.steps.forEach((step, index) => {
            const stepEl = document.getElementById(`step${index + 1}`);
            const statusEl = document.getElementById(`step${index + 1}Status`);

            if (stepEl && statusEl) {
                stepEl.className = `progress-step ${step.status}`;
                statusEl.textContent = step.status === 'completed' ? '✅ Completed' :
                                     step.status === 'active' ? '🔄 Active' : '⏳ Pending';
            }
        });
    }

    // ===== AI REQUESTS SUMMARY =====

    setupAIRequestLogging() {
        this.aiRequests = {
            total: 0,
            successful: 0,
            failed: 0,
            logs: [],
            maxLogs: 50
        };

        this.updateAIStatsDisplay();
        this.setupAIRequestControls();
    }

    logAIRequest(provider, success, duration, error = null) {
        this.aiRequests.total++;
        if (success) {
            this.aiRequests.successful++;
        } else {
            this.aiRequests.failed++;
        }

        // Add to logs
        this.aiRequests.logs.push({
            provider,
            success,
            duration,
            error,
            timestamp: new Date()
        });

        // Keep only recent logs
        if (this.aiRequests.logs.length > this.aiRequests.maxLogs) {
            this.aiRequests.logs.shift();
        }

        this.updateAIStatsDisplay();
        this.updateAIRequestLogDisplay();

        // Log to console
        const status = success ? '✅' : '❌';
        this.addConsoleEntry(success ? 'info' : 'error',
            `${status} AI Request (${provider}): ${duration}ms ${error ? '- ' + error : ''}`);
    }

    updateAIStatsDisplay() {
        const totalEl = document.getElementById('totalRequests');
        const successEl = document.getElementById('successRate');
        const avgTimeEl = document.getElementById('avgResponseTime');
        const lastRequestEl = document.getElementById('lastRequestTime');

        if (totalEl) totalEl.textContent = this.aiRequests.total;

        const rate = this.aiRequests.total > 0
            ? Math.round((this.aiRequests.successful / this.aiRequests.total) * 100)
            : 100;

        if (successEl) {
            successEl.textContent = `${rate}%`;
        }

        if (avgTimeEl) {
            const validRequests = this.aiRequests.logs.filter(log => log.duration);
            const avgTime = validRequests.length > 0
                ? Math.round(validRequests.reduce((sum, log) => sum + log.duration, 0) / validRequests.length)
                : 0;
            avgTimeEl.textContent = `${avgTime}ms`;
        }

        if (lastRequestEl) {
            const lastRequest = this.aiRequests.logs[this.aiRequests.logs.length - 1];
            lastRequestEl.textContent = lastRequest
                ? lastRequest.timestamp.toLocaleTimeString()
                : 'Never';
        }

        // Update mini status bar
        this.updateMiniAIStats(this.aiRequests.total, rate);
    }

    updateAIRequestLogDisplay() {
        const logContainer = document.getElementById('aiRequestLog');
        if (!logContainer) return;

        logContainer.innerHTML = '';

        this.aiRequests.logs.slice(-10).reverse().forEach(log => {
            const entry = document.createElement('div');
            entry.className = `request-entry ${log.success ? 'success' : 'error'}`;
            entry.innerHTML = `
                <div class="timestamp">${log.timestamp.toLocaleTimeString()}</div>
                <div><strong>${log.provider}</strong> - ${log.duration}ms</div>
                ${log.error ? `<div class="error-text">${log.error}</div>` : ''}
            `;
            logContainer.appendChild(entry);
        });
    }

    setupAIRequestControls() {
        // AI request logging is automatic, no controls needed
        // But we could add export functionality here if needed
    }

    // ===== SOLUTIONS GUIDE =====

    setupSolutionsGuide() {
        const tabs = document.querySelectorAll('.solution-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchSolutionTab(tab.dataset.tab);
            });
        });
    }

    switchSolutionTab(tabName) {
        // Hide all tab contents
        const contents = document.querySelectorAll('.solution-tab-content');
        contents.forEach(content => {
            content.classList.remove('active');
        });

        // Remove active class from all tabs
        const tabs = document.querySelectorAll('.solution-tab');
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });

        // Show selected tab content
        const selectedContent = document.getElementById(tabName);
        const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);

        if (selectedContent && selectedTab) {
            selectedContent.classList.add('active');
            selectedTab.classList.add('active');
        }
    }

    // ===== BOTTOM STATUS BAR =====

    setupBottomStatusBar() {
        this.statusBar = {
            currentActivity: 'Ready',
            updateInterval: null
        };

        this.updateStatusBar();
        this.startStatusBarUpdates();
    }

    updateStatusBar(activity = null) {
        if (activity) {
            this.statusBar.currentActivity = activity;
        }

        const activityEl = document.getElementById('currentActivity');
        if (activityEl) {
            activityEl.textContent = this.statusBar.currentActivity;
        }

        // Update storage and memory info
        this.updateSystemStats();
    }

    startStatusBarUpdates() {
        // Update every 5 seconds
        this.statusBar.updateInterval = setInterval(() => {
            this.updateSystemStats();
        }, 5000);
    }

    updateSystemStats() {
        // Update storage usage
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            navigator.storage.estimate().then(estimate => {
                const storageEl = document.getElementById('storageUsed');
                if (storageEl && estimate.usage) {
                    storageEl.textContent = this.formatBytes(estimate.usage);
                }
            });
        }

        // Update memory usage (if available)
        if ('memory' in performance) {
            const memoryEl = document.getElementById('memoryUsage');
            if (memoryEl) {
                const memInfo = performance.memory;
                const usedMB = Math.round(memInfo.usedJSHeapSize / 1048576);
                memoryEl.textContent = `${usedMB} MB`;
            }
        }

        // Update captures count
        const capturesEl = document.getElementById('capturesCount');
        if (capturesEl && window.captureManager) {
            capturesEl.textContent = window.captureManager.captures.length;
        }
    }

    showQuickHelp() {
        const helpMessage = `
🎯 Quick Help - Rapture Accessible

📸 CAPTURE:
• Manual Screen: Click "📸 Manual Screen Capture" or press Alt+1 for auto
• Manual Video: Click "🎥 Manual Video Capture"
• Emergency: Alt+2 for immediate capture
• Recording: "⏺️ Start Recording" / "⏹️ Stop Recording"

🤖 ANALYSIS:
• Alt+4 or click "🤖 Analyze Current Capture"
• Alt+5 or click "🔊 Read Analysis Aloud"
• Choose AI provider in settings

💾 MANAGEMENT:
• Ctrl+S to save current capture
• Ctrl+E to export all captures
• Click "🗑️ Clear All" to remove captures

⚙️ SETTINGS:
• Auto-analyze toggle
• AI provider selection
• Auto capture count and delay

🎤 VOICE COMMANDS:
• "Capture screen", "Start recording"
• "Analyze capture", "Read description"
• "Save capture", "Speak status"

📊 MONITORING:
• Console output with error tracking
• Analysis progress indicator
• AI request summary and timing
• Solutions guide for troubleshooting

For detailed help, check the "Voice Commands" section below.
        `;

        // Show in console
        console.log(helpMessage);

        // Announce via accessibility manager
        if (window.accessibilityManager) {
            window.accessibilityManager.announce('Quick help displayed in console');
        }

        // Also show in a temporary popup for visual users
        this.showHelpPopup(helpMessage);
    }

    showHelpPopup(message) {
        // Create a temporary popup
        const popup = document.createElement('div');
        popup.className = 'help-popup';
        popup.innerHTML = `
            <div class="help-content">
                <button class="help-close">&times;</button>
                <pre>${message}</pre>
            </div>
        `;

        // Add popup styles
        popup.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;

        const content = popup.querySelector('.help-content');
        content.style.cssText = `
            background: #1a2332;
            border: 3px solid #00ff00;
            border-radius: 8px;
            padding: 20px;
            max-width: 800px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
            color: #00ff00;
            font-family: 'Courier New', monospace;
        `;

        const closeBtn = popup.querySelector('.help-close');
        closeBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 15px;
            background: none;
            border: none;
            color: #00ff00;
            font-size: 24px;
            cursor: pointer;
        `;

        document.body.appendChild(popup);

        // Close on button click or Escape key
        const closePopup = () => {
            document.body.removeChild(popup);
        };

        closeBtn.addEventListener('click', closePopup);
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closePopup();
                document.removeEventListener('keydown', escHandler);
            }
        });

        // Auto-close after 30 seconds
        setTimeout(closePopup, 30000);
    }

    // ===== COLLAPSIBLE SECTIONS FUNCTIONALITY =====

    setupCollapsibleSections() {
        const collapsibleHeaders = document.querySelectorAll('.collapsible-header');

        collapsibleHeaders.forEach(header => {
            // Initialize aria-expanded state if not set
            if (!header.hasAttribute('aria-expanded')) {
                header.setAttribute('aria-expanded', 'false');
            }

            // Ensure content is properly hidden initially
            const content = header.parentElement.querySelector('.collapsible-content');
            const toggle = header.querySelector('.collapse-toggle');

            if (header.getAttribute('aria-expanded') === 'false' && content) {
                content.style.display = 'none';
            } else if (header.getAttribute('aria-expanded') === 'true' && content) {
                content.style.display = 'block';
            }

            // Update toggle indicator
            if (toggle) {
                const isExpanded = header.getAttribute('aria-expanded') === 'true';
                toggle.textContent = isExpanded ? '▲' : '▼';
            }

            header.addEventListener('click', () => {
                this.toggleCollapsibleSection(header);
            });

            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleCollapsibleSection(header);
                }
            });
        });
    }

    toggleCollapsibleSection(header) {
        const isExpanded = header.getAttribute('aria-expanded') === 'true';
        const content = header.parentElement.querySelector('.collapsible-content');
        const toggle = header.querySelector('.collapse-toggle');

        if (isExpanded) {
            header.setAttribute('aria-expanded', 'false');
            if (content) content.style.display = 'none';
        } else {
            header.setAttribute('aria-expanded', 'true');
            if (content) content.style.display = 'block';
        }

        // Update toggle indicator
        if (toggle) {
            toggle.textContent = isExpanded ? '▼' : '▲';
        }

        // Announce state change for screen readers
        if (window.accessibilityManager) {
            const sectionName = header.querySelector('h3').textContent;
            window.accessibilityManager.announce(`${sectionName} ${isExpanded ? 'collapsed' : 'expanded'}`);
        }
    }

    // ===== MINI STATUS BAR COMPONENTS =====

    setupMiniStatusBar() {
        this.miniProgress = {
            bar: document.getElementById('miniAnalysisProgressBar'),
            text: document.getElementById('miniProgressText')
        };

        this.miniAIStats = {
            totalRequests: document.getElementById('miniTotalRequests'),
            successRate: document.getElementById('miniSuccessRate')
        };

        this.miniAnnouncements = {
            count: document.getElementById('announcementsCount'),
            list: document.getElementById('miniAnnouncementsList'),
            announcements: []
        };

        this.setupMiniAnnouncements();

        // Add initial announcements after a short delay to ensure everything is loaded
        setTimeout(() => {
            this.addMiniAnnouncement('System initialized and ready');
        }, 500);

        setTimeout(() => {
            this.addMiniAnnouncement('Mini status bar active');
        }, 1000);
    }

    setupMiniAnnouncements() {
        // Override the accessibility manager's announce method to capture announcements
        if (window.accessibilityManager && window.accessibilityManager.announce) {
            const originalAnnounce = window.accessibilityManager.announce.bind(window.accessibilityManager);

            window.accessibilityManager.announce = (message) => {
                originalAnnounce(message);
                this.addMiniAnnouncement(message);
            };
        }

        // Also listen for custom events that might be dispatched
        this.announcementListener = (message) => {
            this.addMiniAnnouncement(message);
        };

        // Listen for system events
        window.addEventListener('systemAnnouncement', (event) => {
            if (event.detail && event.detail.message) {
                this.addMiniAnnouncement(event.detail.message);
            }
        });
    }

        // Also listen for custom announcements from the main app
        this.announcementListener = (message) => {
            this.addMiniAnnouncement(message);
        };

        // Add initial system ready announcement
        setTimeout(() => {
            this.addMiniAnnouncement('System initialized');
        }, 1000);

        // Test announcements for visibility
        setTimeout(() => {
            this.addMiniAnnouncement('Console monitoring active');
        }, 2000);
        setTimeout(() => {
            this.addMiniAnnouncement('AI analysis ready');
        }, 3000);
    }

    addMiniAnnouncement(message) {
        this.miniAnnouncements.announcements.unshift(message);

        // Keep only last 3 announcements
        if (this.miniAnnouncements.announcements.length > 3) {
            this.miniAnnouncements.announcements = this.miniAnnouncements.announcements.slice(0, 3);
        }

        this.updateMiniAnnouncementsDisplay();
    }

    updateMiniAnnouncementsDisplay() {
        if (!this.miniAnnouncements.list || !this.miniAnnouncements.count) return;

        this.miniAnnouncements.count.textContent = this.miniAnnouncements.announcements.length;

        // Clear existing items
        this.miniAnnouncements.list.innerHTML = '';

        // Show placeholder if no announcements
        if (this.miniAnnouncements.announcements.length === 0) {
            const item = document.createElement('div');
            item.className = 'mini-announcement-item';
            item.textContent = 'System ready';
            this.miniAnnouncements.list.appendChild(item);
        } else {
            // Add announcements (show last 2)
            const announcementsToShow = this.miniAnnouncements.announcements.slice(0, 2);
            announcementsToShow.forEach((announcement) => {
                const item = document.createElement('div');
                item.className = 'mini-announcement-item';
                item.textContent = announcement.length > 25 ? announcement.substring(0, 25) + '...' : announcement;
                item.title = announcement; // Show full text on hover
                this.miniAnnouncements.list.appendChild(item);
            });
        }
    }

    updateMiniProgress(percentage, text) {
        if (this.miniProgress.bar) {
            this.miniProgress.bar.style.width = `${percentage}%`;
        }
        if (this.miniProgress.text) {
            this.miniProgress.text.textContent = text;
        }
    }

    updateMiniAIStats(total, rate) {
        // Check if miniAIStats is initialized before accessing properties
        if (!this.miniAIStats) {
            console.warn('Mini AI stats not initialized yet');
            return;
        }

        if (this.miniAIStats.totalRequests) {
            this.miniAIStats.totalRequests.textContent = `AI: ${total}`;
        }
        if (this.miniAIStats.successRate) {
            this.miniAIStats.successRate.textContent = `${rate}%`;
        }
    }

    // ===== INITIALIZATION INTEGRATION =====

    performInitialization() {
        try {
            // Initialize all modules (existing code)
            this.initializeModules();
            this.setupErrorHandling();
            this.setupKeyboardShortcuts();
            this.setupSystemMonitoring();
            this.loadUserPreferences();
            this.setupFirstLoadAutoCapture();
            this.setupSequentialActions();

            // Initialize new features
            this.setupConsoleMonitoring();
            this.setupAnalysisProgress();
            this.setupAIRequestLogging();
            this.setupSolutionsGuide();
            this.setupBottomStatusBar();
            this.setupCollapsibleSections();
            this.setupMiniStatusBar();

            this.isInitialized = true;
            console.log('✅ Rapture Accessible initialized successfully');
            this.announceInitialization();

        } catch (error) {
            console.error('❌ Initialization failed:', error);
            this.handleInitializationError(error);
        }
    }
}

// Initialize the application
const raptureAccessible = new RaptureAccessible();

// Make globally accessible for debugging
window.raptureAccessible = raptureAccessible;

// Enhanced console output
console.log(`
🎬 Rapture Accessible - Screen Capture for Blind Users
══════════════════════════════════════════════════════
✅ Features:
   • Manual screen and video capture buttons
   • Auto screen capture with configurable count and countdown
   • Video recording with start/stop controls
   • Real-time countdown timers with pause/resume/stop
   • Sequential action system (Quick & Full sequences)
   • Multiple AI providers (Gemini, Hugging Face, OpenAI)
   • High contrast interface optimized for accessibility
   • Keyboard shortcuts and screen reader support
   • Manual capture mode by default
   • AI communication logging to console
   • Complete button press logging

🎯 Quick Start:
   • Manual screen capture: Click "📸 Manual Screen Capture"
   • Manual video capture: Click "🎥 Manual Video Capture"
   • Auto capture: Alt+1 or click "🔄 Auto Capture"
   • Emergency capture: Alt+2 or click "🚨 Emergency Capture"
   • Video recording: Click "⏺️ Start Recording" / "⏹️ Stop Recording"
   • Analyze capture: Alt+4 or click "🤖 Analyze Current Capture"
   • Speak status: Alt+3 or click "Speak System Status"
   • Read analysis: Alt+5 or click "🔊 Read Analysis Aloud"
   • Quick sequence: Click "⚡ Quick Sequence"
   • Full sequence: Click "🔄 Full Sequence"

🔧 Keyboard Shortcuts:
   • Alt+1: Toggle auto capture
   • Alt+2: Emergency capture
   • Alt+3: Speak system status
   • Alt+4: Analyze current capture
   • Alt+5: Read description aloud
   • Alt+H: Show all shortcuts
   • Ctrl+S: Save current capture
   • Ctrl+E: Export all captures

📊 System Status:
   • Initialized: ${raptureAccessible.isInitialized}
   • Online: ${navigator.onLine}
   • Screen Reader: ${window.accessibilityManager?.detectScreenReader() || 'Not detected'}
   • Manual Mode: ${window.autoCaptureManager?.manualCaptureMode ? 'Enabled' : 'Disabled'}
   • Auto Count: ${window.autoCaptureManager?.autoCaptureCount || 3}

🚀 Ready to use!
`);

console.log('💡 Tips:');
console.log('   • Manual capture mode is enabled by default');
console.log('   • Configure autoCapture count in the settings section');
console.log('   • All AI communication is logged to the console');
console.log('   • All button presses are logged to the console');
console.log('   • Use Alt+3 to hear current system status anytime');
console.log('   • Use countdown timers to control action timing');
console.log('   • Sequential actions help automate workflows');