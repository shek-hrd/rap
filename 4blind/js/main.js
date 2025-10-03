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

            // Setup auto-capture on first load
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
console.log('   • Configure autocapture count in the settings section');
console.log('   • All AI communication is logged to the console');
console.log('   • All button presses are logged to the console');
console.log('   • Use Alt+3 to hear current system status anytime');
console.log('   • Use countdown timers to control action timing');
console.log('   • Sequential actions help automate workflows');