/**
 * Auto Capture Module for Rapture Accessible
 * Handles automatic screen capturing and processing
 */

class AutoCaptureManager {
    constructor() {
        this.autoCaptureInterval = null;
        this.isAutoCapturing = false;
        this.autoCaptureDelay = 5000; // 5 seconds default
        this.emergencyMode = false;
        this.captureHistory = [];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSettings();

        console.log('📸 Auto Capture Manager initialized');
    }

    setupEventListeners() {
        // Auto capture button
        const autoCaptureBtn = document.getElementById('autoCapture');
        if (autoCaptureBtn) {
            autoCaptureBtn.addEventListener('click', () => {
                this.toggleAutoCapture();
            });
        }

        // Emergency capture button
        const emergencyCaptureBtn = document.getElementById('emergencyCapture');
        if (emergencyCaptureBtn) {
            emergencyCaptureBtn.addEventListener('click', () => {
                this.emergencyCapture();
            });
        }

        // Auto analyze toggle
        const autoAnalyzeToggle = document.getElementById('autoAnalyzeToggle');
        if (autoAnalyzeToggle) {
            autoAnalyzeToggle.addEventListener('change', () => {
                this.toggleAutoAnalysis();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key.toLowerCase() === 'c') {
                e.preventDefault();
                if (e.ctrlKey) {
                    this.emergencyCapture();
                } else {
                    this.toggleAutoCapture();
                }
            }
        });
    }

    loadSettings() {
        // Load settings from localStorage
        const settings = JSON.parse(localStorage.getItem('raptureAccessibleSettings') || '{}');

        this.autoCaptureDelay = settings.autoCaptureDelay || 5000;
        this.emergencyMode = settings.emergencyMode || false;

        // Update UI
        const autoAnalyzeToggle = document.getElementById('autoAnalyzeToggle');
        if (autoAnalyzeToggle) {
            autoAnalyzeToggle.checked = settings.autoAnalyze !== false; // Default to true
        }
    }

    saveSettings() {
        const settings = {
            autoCaptureDelay: this.autoCaptureDelay,
            emergencyMode: this.emergencyMode,
            autoAnalyze: document.getElementById('autoAnalyzeToggle')?.checked ?? true
        };

        localStorage.setItem('raptureAccessibleSettings', JSON.stringify(settings));
    }

    toggleAutoCapture() {
        if (this.isAutoCapturing) {
            this.stopAutoCapture();
        } else {
            this.startAutoCapture();
        }
    }

    startAutoCapture() {
        if (this.isAutoCapturing) return;

        this.isAutoCapturing = true;

        // Update UI
        const autoCaptureBtn = document.getElementById('autoCapture');
        if (autoCaptureBtn) {
            autoCaptureBtn.textContent = 'Stop Auto Capture';
            autoCaptureBtn.classList.add('btn-danger');
            autoCaptureBtn.classList.remove('btn-primary');
        }

        // Start the capture loop
        this.performAutoCapture();
        this.autoCaptureInterval = setInterval(() => {
            this.performAutoCapture();
        }, this.autoCaptureDelay);

        window.accessibilityManager.announce(`Auto capture started. Capturing every ${this.autoCaptureDelay / 1000} seconds.`);

        console.log(`📸 Auto capture started - interval: ${this.autoCaptureDelay}ms`);
    }

    stopAutoCapture() {
        if (!this.isAutoCapturing) return;

        this.isAutoCapturing = false;

        // Update UI
        const autoCaptureBtn = document.getElementById('autoCapture');
        if (autoCaptureBtn) {
            autoCaptureBtn.textContent = 'Auto Capture Screen';
            autoCaptureBtn.classList.add('btn-primary');
            autoCaptureBtn.classList.remove('btn-danger');
        }

        // Stop the interval
        if (this.autoCaptureInterval) {
            clearInterval(this.autoCaptureInterval);
            this.autoCaptureInterval = null;
        }

        window.accessibilityManager.announce('Auto capture stopped.');

        console.log('📸 Auto capture stopped');
    }

    async performAutoCapture() {
        try {
            console.log('📸 Performing auto capture...');

            // Show processing indicator
            this.showProcessingStatus('Capturing screen...');

            // Perform the capture
            const captureResult = await this.captureScreen();

            if (captureResult.success) {
                // Add to history
                this.captureHistory.unshift({
                    timestamp: new Date().toISOString(),
                    type: 'auto',
                    filename: captureResult.filename
                });

                // Auto-analyze if enabled
                const autoAnalyzeEnabled = document.getElementById('autoAnalyzeToggle')?.checked ?? true;
                if (autoAnalyzeEnabled && window.aiAnalyzer) {
                    setTimeout(() => {
                        window.aiAnalyzer.analyzeWithAI();
                    }, 1000); // Delay to allow UI to update
                }

                window.accessibilityManager.announceCaptureSuccess(captureResult.filename, 'auto capture');
            } else {
                window.accessibilityManager.announceError('Auto capture failed: ' + captureResult.error);
            }

        } catch (error) {
            console.error('Auto capture error:', error);
            window.accessibilityManager.announceError('Auto capture failed: ' + error.message);
        } finally {
            this.hideProcessingStatus();
        }
    }

    async emergencyCapture() {
        try {
            console.log('🚨 Performing emergency capture...');

            this.emergencyMode = true;

            // Show emergency processing indicator
            this.showProcessingStatus('EMERGENCY CAPTURE IN PROGRESS...', true);

            // Perform immediate capture
            const captureResult = await this.captureScreen();

            if (captureResult.success) {
                // Auto-analyze immediately
                if (window.aiAnalyzer) {
                    window.aiAnalyzer.analyzeWithAI();
                }

                // Auto-save
                if (window.captureManager) {
                    window.captureManager.saveCurrentCapture();
                }

                window.accessibilityManager.announce('Emergency capture completed and saved!', 'high');
            } else {
                window.accessibilityManager.announceError('Emergency capture failed: ' + captureResult.error);
            }

        } catch (error) {
            console.error('Emergency capture error:', error);
            window.accessibilityManager.announceError('Emergency capture failed: ' + error.message);
        } finally {
            this.emergencyMode = false;
            this.hideProcessingStatus();
        }
    }

    async captureScreen() {
        return new Promise((resolve) => {
            try {
                // Check if screen capture is available
                if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
                    resolve({
                        success: false,
                        error: 'Screen capture not supported'
                    });
                    return;
                }

                // Request screen capture
                navigator.mediaDevices.getDisplayMedia({
                    video: { mediaSource: 'screen' },
                    audio: false
                }).then(stream => {
                    const tracks = stream.getVideoTracks();
                    if (!tracks || tracks.length === 0) {
                        resolve({
                            success: false,
                            error: 'No video track found'
                        });
                        return;
                    }

                    const track = tracks[0];
                    const imageCapture = new ImageCapture(track);
                    const bitmap = imageCapture.grabFrame();

                    bitmap.then(bitmap => {
                        this.displayCapture(bitmap);
                        track.stop();

                        resolve({
                            success: true,
                            filename: `capture_${Date.now()}.png`
                        });
                    }).catch(error => {
                        resolve({
                            success: false,
                            error: error.message
                        });
                    });
                }).catch(error => {
                    resolve({
                        success: false,
                        error: error.message
                    });
                });

            } catch (error) {
                resolve({
                    success: false,
                    error: error.message
                });
            }
        });
    }

    displayCapture(bitmap) {
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0);

        const dataUrl = canvas.toDataURL('image/png');

        // Update preview
        const previewImage = document.getElementById('previewImage');
        const previewPlaceholder = document.getElementById('previewPlaceholder');

        if (previewImage) {
            previewImage.src = dataUrl;
            previewImage.style.display = 'block';
        }

        if (previewPlaceholder) {
            previewPlaceholder.style.display = 'none';
        }

        // Store current capture
        window.currentCapture = {
            type: 'image',
            subtype: 'auto',
            dataUrl: dataUrl,
            timestamp: new Date().toISOString(),
            filename: `capture_${Date.now()}.png`
        };

        // Enable action buttons
        this.enableActionButtons();

        console.log('📸 Capture displayed successfully');
    }

    enableActionButtons() {
        const readAloudBtn = document.getElementById('readAloud');
        const saveCaptureBtn = document.getElementById('saveCapture');

        if (readAloudBtn) readAloudBtn.disabled = false;
        if (saveCaptureBtn) saveCaptureBtn.disabled = false;
    }

    showProcessingStatus(message, isEmergency = false) {
        const processingStatus = document.getElementById('processingStatus');
        if (processingStatus) {
            processingStatus.textContent = message;
            processingStatus.style.display = 'block';
            processingStatus.classList.toggle('emergency', isEmergency);
        }
    }

    hideProcessingStatus() {
        const processingStatus = document.getElementById('processingStatus');
        if (processingStatus) {
            processingStatus.style.display = 'none';
        }
    }

    toggleAutoAnalysis() {
        const autoAnalyzeToggle = document.getElementById('autoAnalyzeToggle');
        const isEnabled = autoAnalyzeToggle?.checked ?? true;

        this.saveSettings();

        const status = isEnabled ? 'enabled' : 'disabled';
        window.accessibilityManager.announce(`Auto analysis ${status}`);

        console.log(`🔧 Auto analysis ${status}`);
    }

    getCaptureHistory() {
        return this.captureHistory;
    }

    clearCaptureHistory() {
        this.captureHistory = [];
        console.log('📸 Capture history cleared');
    }

    setAutoCaptureDelay(delay) {
        this.autoCaptureDelay = Math.max(1000, delay); // Minimum 1 second
        this.saveSettings();

        if (this.isAutoCapturing) {
            // Restart with new delay
            this.stopAutoCapture();
            setTimeout(() => this.startAutoCapture(), 100);
        }

        console.log(`📸 Auto capture delay set to ${this.autoCaptureDelay}ms`);
    }

    // Method to handle keyboard shortcuts
    handleKeyboardShortcut(key) {
        switch (key) {
            case 'auto':
                this.toggleAutoCapture();
                break;
            case 'emergency':
                this.emergencyCapture();
                break;
        }
    }
}

// Initialize auto capture manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.autoCaptureManager = new AutoCaptureManager();
});

console.log('📸 Auto capture module loaded');