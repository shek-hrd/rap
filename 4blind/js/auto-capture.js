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
        this.autoCaptureCount = 3; // Default to 3 autocaptures
        this.currentAutoCaptureCount = 0; // Track current count
        this.manualCaptureMode = true; // Default to manual capture
        this.hardCodedSpeechRecognition = true; // Enable hard-coded speech recognition

        // New features
        this.countdownInterval = null;
        this.isCountdownActive = false;
        this.countdownTime = 10;
        this.currentCountdown = 0;
        this.isPaused = false;
        this.videoRecorder = null;
        this.isRecording = false;
        this.recordedChunks = [];

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

        // Manual screen capture button
        const manualScreenCaptureBtn = document.getElementById('manualScreenCapture');
        if (manualScreenCaptureBtn) {
            manualScreenCaptureBtn.addEventListener('click', () => {
                this.manualScreenCapture();
            });
        }

        // Manual video capture button
        const manualVideoCaptureBtn = document.getElementById('manualVideoCapture');
        if (manualVideoCaptureBtn) {
            manualVideoCaptureBtn.addEventListener('click', () => {
                this.manualVideoCapture();
            });
        }

        // Video recording controls
        const startRecordingBtn = document.getElementById('startRecording');
        const stopRecordingBtn = document.getElementById('stopRecording');
        if (startRecordingBtn) {
            startRecordingBtn.addEventListener('click', () => {
                this.startVideoRecording();
            });
        }
        if (stopRecordingBtn) {
            stopRecordingBtn.addEventListener('click', () => {
                this.stopVideoRecording();
            });
        }

        // Countdown controls
        const pauseCountdownBtn = document.getElementById('pauseCountdown');
        const stopCountdownBtn = document.getElementById('stopCountdown');
        const resumeCountdownBtn = document.getElementById('resumeCountdown');

        if (pauseCountdownBtn) {
            pauseCountdownBtn.addEventListener('click', () => {
                this.pauseCountdown();
            });
        }
        if (stopCountdownBtn) {
            stopCountdownBtn.addEventListener('click', () => {
                this.stopCountdown();
            });
        }
        if (resumeCountdownBtn) {
            resumeCountdownBtn.addEventListener('click', () => {
                this.resumeCountdown();
            });
        }

        // Auto analyze toggle
        const autoAnalyzeToggle = document.getElementById('autoAnalyzeToggle');
        if (autoAnalyzeToggle) {
            autoAnalyzeToggle.addEventListener('change', () => {
                this.toggleAutoAnalysis();
            });
        }

        // Manual capture mode toggle
        const manualCaptureModeToggle = document.getElementById('manualCaptureMode');
        if (manualCaptureModeToggle) {
            manualCaptureModeToggle.addEventListener('change', () => {
                this.toggleManualCaptureMode();
            });
        }

        // Auto capture count controls
        const autoCaptureCountInput = document.getElementById('autoCaptureCount');
        const updateAutoCaptureCountBtn = document.getElementById('updateAutoCaptureCount');
        if (autoCaptureCountInput && updateAutoCaptureCountBtn) {
            updateAutoCaptureCountBtn.addEventListener('click', () => {
                const count = parseInt(autoCaptureCountInput.value);
                this.setAutoCaptureCount(count);
                console.log(`🔘 Button pressed: Update Auto Capture Count - Set to ${count}`);
            });
        }

        // Auto capture delay controls
        const autoCaptureDelayInput = document.getElementById('autoCaptureDelay');
        const updateAutoCaptureDelayBtn = document.getElementById('updateAutoCaptureDelay');
        if (autoCaptureDelayInput && updateAutoCaptureDelayBtn) {
            updateAutoCaptureDelayBtn.addEventListener('click', () => {
                const delay = parseInt(autoCaptureDelayInput.value) * 1000; // Convert to milliseconds
                this.setAutoCaptureDelay(delay);
                console.log(`🔘 Button pressed: Update Auto Capture Delay - Set to ${delay}ms`);
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
        this.autoCaptureCount = settings.autoCaptureCount || 3;
        this.manualCaptureMode = settings.manualCaptureMode !== false; // Default to true

        // Update UI
        const autoAnalyzeToggle = document.getElementById('autoAnalyzeToggle');
        if (autoAnalyzeToggle) {
            autoAnalyzeToggle.checked = settings.autoAnalyze !== false; // Default to true
        }

        // Update autocapture count UI
        this.updateAutoCaptureCountUI();

        // Update manual capture mode UI
        const manualCaptureModeToggle = document.getElementById('manualCaptureMode');
        if (manualCaptureModeToggle) {
            manualCaptureModeToggle.checked = this.manualCaptureMode;
        }

        // Update delay UI
        const autoCaptureDelayInput = document.getElementById('autoCaptureDelay');
        if (autoCaptureDelayInput) {
            autoCaptureDelayInput.value = this.autoCaptureDelay / 1000; // Convert to seconds for display
        }

        // Update count UI
        const autoCaptureCountInput = document.getElementById('autoCaptureCount');
        if (autoCaptureCountInput) {
            autoCaptureCountInput.value = this.autoCaptureCount;
        }
    }

    saveSettings() {
        const settings = {
            autoCaptureDelay: this.autoCaptureDelay,
            emergencyMode: this.emergencyMode,
            autoAnalyze: document.getElementById('autoAnalyzeToggle')?.checked ?? true,
            autoCaptureCount: this.autoCaptureCount,
            manualCaptureMode: this.manualCaptureMode
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
        this.currentAutoCaptureCount = 0;

        // Update UI
        const autoCaptureBtn = document.getElementById('autoCapture');
        if (autoCaptureBtn) {
            autoCaptureBtn.textContent = `Stop Auto Capture (${this.autoCaptureCount} captures)`;
            autoCaptureBtn.classList.add('btn-danger');
            autoCaptureBtn.classList.remove('btn-primary');
        }

        // Log button press
        console.log(`🔘 Button pressed: Auto Capture - Starting ${this.autoCaptureCount} autocaptures`);

        // Start the capture loop
        this.performAutoCapture();
        this.autoCaptureInterval = setInterval(() => {
            this.performAutoCapture();
        }, this.autoCaptureDelay);

        window.accessibilityManager.announce(`Auto capture started. Will perform ${this.autoCaptureCount} captures every ${this.autoCaptureDelay / 1000} seconds.`);

        console.log(`📸 Auto capture started - interval: ${this.autoCaptureDelay}ms, count: ${this.autoCaptureCount}`);
    }

    stopAutoCapture() {
        if (!this.isAutoCapturing) return;

        this.isAutoCapturing = false;
        const completedCaptures = this.currentAutoCaptureCount;

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

        // Reset counter
        this.currentAutoCaptureCount = 0;

        const message = completedCaptures > 0 ?
            `Auto capture stopped after ${completedCaptures} captures.` :
            'Auto capture stopped.';

        window.accessibilityManager.announce(message);

        console.log(`🔘 Button pressed: Stop Auto Capture - Completed ${completedCaptures} captures`);
        console.log('📸 Auto capture stopped');
    }

    async performAutoCapture() {
        try {
            this.currentAutoCaptureCount++;
            console.log(`📸 Performing auto capture ${this.currentAutoCaptureCount}/${this.autoCaptureCount}...`);

            // Show processing indicator
            this.showProcessingStatus(`Capturing screen... (${this.currentAutoCaptureCount}/${this.autoCaptureCount})`);

            // Perform the capture
            const captureResult = await this.captureScreen();

            if (captureResult.success) {
                // Add to history
                this.captureHistory.unshift({
                    timestamp: new Date().toISOString(),
                    type: 'auto',
                    filename: captureResult.filename,
                    count: this.currentAutoCaptureCount
                });

                // Auto-analyze if enabled
                const autoAnalyzeEnabled = document.getElementById('autoAnalyzeToggle')?.checked ?? true;
                if (autoAnalyzeEnabled && window.aiAnalyzer) {
                    setTimeout(async () => {
                        try {
                            const analysisResult = await window.aiAnalyzer.analyzeWithAI();
                            // Print AI communication to console
                            if (analysisResult) {
                                console.log('🤖 AI Communication (Auto Capture):', analysisResult);
                                console.log(`📊 Analysis Details: Provider: ${document.getElementById('aiProviderSelect')?.value || 'gemini'}`);
                            } else {
                                console.log('🤖 AI Analysis failed or returned no results');
                            }
                        } catch (error) {
                            console.error('🤖 AI Analysis error:', error);
                        }
                    }, 1000); // Delay to allow UI to update
                }

                window.accessibilityManager.announceCaptureSuccess(captureResult.filename, `auto capture ${this.currentAutoCaptureCount} of ${this.autoCaptureCount}`);

                // Check if we've reached the autocapture count
                if (this.currentAutoCaptureCount >= this.autoCaptureCount) {
                    this.stopAutoCapture();
                    window.accessibilityManager.announce(`Auto capture completed. Performed ${this.autoCaptureCount} captures.`);
                    console.log(`📸 Auto capture completed after ${this.autoCaptureCount} captures`);
                }
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
            console.log('🔘 Button pressed: Emergency Capture');

            this.emergencyMode = true;

            // Show emergency processing indicator
            this.showProcessingStatus('EMERGENCY CAPTURE IN PROGRESS...', true);

            // Perform immediate capture
            const captureResult = await this.captureScreen();

            if (captureResult.success) {
                // Auto-analyze immediately
                if (window.aiAnalyzer) {
                    setTimeout(async () => {
                        try {
                            const analysisResult = await window.aiAnalyzer.analyzeWithAI();
                            // Print AI communication to console
                            if (analysisResult) {
                                console.log('🤖 AI Communication (Emergency):', analysisResult);
                                console.log(`🚨 Emergency Analysis Details: Provider: ${document.getElementById('aiProviderSelect')?.value || 'gemini'}`);
                            } else {
                                console.log('🤖 Emergency AI Analysis failed or returned no results');
                            }
                        } catch (error) {
                            console.error('🤖 Emergency AI Analysis error:', error);
                        }
                    }, 500); // Shorter delay for emergency captures
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
                            error: error?.message || error?.toString() || 'Failed to capture image'
                        });
                    });
                }).catch(error => {
                    resolve({
                        success: false,
                        error: error?.message || error?.toString() || 'Failed to access screen capture'
                    });
                });

            } catch (error) {
                resolve({
                    success: false,
                    error: error?.message || error?.toString() || 'Screen capture error'
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

    toggleManualCaptureMode() {
        const manualCaptureModeToggle = document.getElementById('manualCaptureMode');
        this.manualCaptureMode = manualCaptureModeToggle?.checked ?? true;

        this.saveSettings();

        const status = this.manualCaptureMode ? 'enabled' : 'disabled';
        window.accessibilityManager.announce(`Manual capture mode ${status}`);

        console.log(`🔘 Button pressed: Manual Capture Mode Toggle - ${status}`);
        console.log(`🔧 Manual capture mode ${status}`);
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

    setAutoCaptureCount(count) {
        this.autoCaptureCount = Math.max(1, Math.min(10, count)); // Between 1 and 10
        this.saveSettings();
        this.updateAutoCaptureCountUI();

        console.log(`📸 Auto capture count set to ${this.autoCaptureCount}`);
    }

    updateAutoCaptureCountUI() {
        const autoCaptureCountInput = document.getElementById('autoCaptureCount');
        if (autoCaptureCountInput) {
            autoCaptureCountInput.value = this.autoCaptureCount;
        }
    }

    // Manual screen capture
    async manualScreenCapture() {
        try {
            console.log('📸 Manual screen capture initiated');
            window.accessibilityManager.announce('Manual screen capture starting');

            const captureResult = await this.captureScreen();

            if (captureResult.success) {
                window.accessibilityManager.announceCaptureSuccess(captureResult.filename, 'manual screen capture');
                console.log('✅ Manual screen capture completed');
            } else {
                window.accessibilityManager.announceError('Manual screen capture failed: ' + captureResult.error);
            }
        } catch (error) {
            console.error('Manual screen capture error:', error);
            window.accessibilityManager.announceError('Manual screen capture failed');
        }
    }

    // Manual video capture (takes a screenshot and treats it as video frame)
    async manualVideoCapture() {
        try {
            console.log('🎥 Manual video capture initiated');
            window.accessibilityManager.announce('Manual video capture starting');

            const captureResult = await this.captureScreen();

            if (captureResult.success) {
                // Display as video preview
                this.displayVideoPreview(captureResult);
                window.accessibilityManager.announceCaptureSuccess(captureResult.filename, 'manual video frame');
                console.log('✅ Manual video capture completed');
            } else {
                window.accessibilityManager.announceError('Manual video capture failed: ' + captureResult.error);
            }
        } catch (error) {
            console.error('Manual video capture error:', error);
            window.accessibilityManager.announceError('Manual video capture failed');
        }
    }

    // Video recording functionality
    async startVideoRecording() {
        try {
            if (this.isRecording) return;

            console.log('🎥 Starting video recording');
            window.accessibilityManager.announce('Starting video recording');

            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { mediaSource: 'screen' },
                audio: false
            });

            this.isRecording = true;
            this.recordedChunks = [];

            // Update UI
            const startBtn = document.getElementById('startRecording');
            const stopBtn = document.getElementById('stopRecording');
            if (startBtn) startBtn.disabled = true;
            if (stopBtn) stopBtn.disabled = false;

            // Create MediaRecorder
            this.videoRecorder = new MediaRecorder(stream);

            this.videoRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.videoRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);

                // Display recorded video
                this.displayRecordedVideo(url);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());

                window.accessibilityManager.announce('Video recording completed');
                console.log('✅ Video recording completed');
            };

            this.videoRecorder.start();
            console.log('🎥 Video recording started');

        } catch (error) {
            console.error('Video recording error:', error);
            window.accessibilityManager.announceError('Video recording failed: ' + (error?.message || error));
        }
    }

    stopVideoRecording() {
        if (!this.isRecording || !this.videoRecorder) return;

        console.log('🎥 Stopping video recording');
        window.accessibilityManager.announce('Stopping video recording');

        this.videoRecorder.stop();
        this.isRecording = false;

        // Update UI
        const startBtn = document.getElementById('startRecording');
        const stopBtn = document.getElementById('stopRecording');
        if (startBtn) startBtn.disabled = false;
        if (stopBtn) stopBtn.disabled = true;
    }

    displayVideoPreview(captureResult) {
        // Similar to displayCapture but for video preview
        const canvas = document.createElement('canvas');
        canvas.width = 640; // Standard video preview size
        canvas.height = 480;
        const ctx = canvas.getContext('2d');

        // Create image from capture data
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
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
                type: 'video',
                subtype: 'manual',
                dataUrl: dataUrl,
                timestamp: new Date().toISOString(),
                filename: `video_frame_${Date.now()}.png`
            };

            // Enable action buttons
            this.enableActionButtons();
        };
        img.src = captureResult.dataUrl || captureResult;
    }

    displayRecordedVideo(url) {
        const previewVideo = document.getElementById('previewVideo');
        const previewPlaceholder = document.getElementById('previewPlaceholder');

        if (previewVideo) {
            previewVideo.src = url;
            previewVideo.style.display = 'block';
            previewVideo.controls = true;
        }

        if (previewPlaceholder) {
            previewPlaceholder.style.display = 'none';
        }

        // Store current capture
        window.currentCapture = {
            type: 'video',
            subtype: 'recording',
            videoUrl: url,
            timestamp: new Date().toISOString(),
            filename: `recording_${Date.now()}.webm`
        };

        // Enable action buttons
        this.enableActionButtons();
    }

    // Countdown functionality
    startCountdown(seconds = 10, callback = null) {
        this.countdownTime = seconds;
        this.currentCountdown = seconds;
        this.isCountdownActive = true;
        this.isPaused = false;

        // Show countdown section
        const countdownSection = document.getElementById('countdownSection');
        if (countdownSection) {
            countdownSection.style.display = 'block';
        }

        this.updateCountdownDisplay();

        this.countdownInterval = setInterval(() => {
            if (this.isPaused) return;

            this.currentCountdown--;
            this.updateCountdownDisplay();

            if (this.currentCountdown <= 0) {
                this.stopCountdown();
                if (callback) callback();
            }
        }, 1000);

        console.log(`⏰ Countdown started: ${seconds} seconds`);
    }

    pauseCountdown() {
        if (!this.isCountdownActive) return;

        this.isPaused = true;
        const resumeBtn = document.getElementById('resumeCountdown');
        const pauseBtn = document.getElementById('pauseCountdown');

        if (resumeBtn) resumeBtn.style.display = 'inline-flex';
        if (pauseBtn) pauseBtn.style.display = 'none';

        window.accessibilityManager.announce('Countdown paused');
        console.log('⏸️ Countdown paused');
    }

    resumeCountdown() {
        if (!this.isCountdownActive) return;

        this.isPaused = false;
        const resumeBtn = document.getElementById('resumeCountdown');
        const pauseBtn = document.getElementById('pauseCountdown');

        if (resumeBtn) resumeBtn.style.display = 'none';
        if (pauseBtn) pauseBtn.style.display = 'inline-flex';

        window.accessibilityManager.announce('Countdown resumed');
        console.log('▶️ Countdown resumed');
    }

    stopCountdown() {
        if (!this.isCountdownActive) return;

        this.isCountdownActive = false;
        this.isPaused = false;

        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }

        // Hide countdown section
        const countdownSection = document.getElementById('countdownSection');
        if (countdownSection) {
            countdownSection.style.display = 'none';
        }

        // Reset buttons
        const resumeBtn = document.getElementById('resumeCountdown');
        const pauseBtn = document.getElementById('pauseCountdown');
        if (resumeBtn) resumeBtn.style.display = 'none';
        if (pauseBtn) pauseBtn.style.display = 'inline-flex';

        window.accessibilityManager.announce('Countdown stopped');
        console.log('⏹️ Countdown stopped');
    }

    updateCountdownDisplay() {
        const countdownTimer = document.getElementById('countdownTimer');
        if (countdownTimer) {
            countdownTimer.textContent = this.currentCountdown;
        }
    }

    // Sequential actions system
    async performSequentialActions(actions) {
        for (let i = 0; i < actions.length; i++) {
            const action = actions[i];

            console.log(`🔄 Executing sequential action ${i + 1}/${actions.length}: ${action.name}`);

            // Start countdown before each action (except first)
            if (i > 0) {
                await new Promise((resolve) => {
                    this.startCountdown(5, resolve); // 5 second countdown between actions
                });
            }

            // Execute the action
            try {
                await action.execute();
                window.accessibilityManager.announce(`Action completed: ${action.name}`);
            } catch (error) {
                console.error(`Action failed: ${action.name}`, error);
                window.accessibilityManager.announceError(`Action failed: ${action.name}`);
            }
        }

        window.accessibilityManager.announce('All sequential actions completed');
        console.log('✅ All sequential actions completed');
    }
        // Update the button text if currently autocapturing
        if (this.isAutoCapturing) {
            const autoCaptureBtn = document.getElementById('autoCapture');
            if (autoCaptureBtn) {
                autoCaptureBtn.textContent = `Stop Auto Capture (${this.autoCaptureCount} captures)`;
            }
        }
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