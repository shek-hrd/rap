// Main Rapture Application
class RaptureCapture {
    constructor() {
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.currentCapture = null;
        this.captures = JSON.parse(localStorage.getItem('raptureCaptures') || '[]');
        this.isRecording = false;
        this.storageQuota = 0;
        this.storageUsed = 0;

        // Initialize modules
        this.captureManager = new CaptureManager(this);
        this.aiAnalyzer = new AIAnalyzer(this);
        this.storageManager = new StorageManager(this);

        this.initializeElements();
        this.bindEvents();
        this.loadCaptures();
        this.initializeExplanationToggle();
        this.updateStats();
        this.startStatsMonitoring();
    }

    initializeElements() {
        // Capture buttons
        this.captureScreenBtn = document.getElementById('captureScreen');
        this.startRecordingBtn = document.getElementById('startRecording');
        this.stopRecordingBtn = document.getElementById('stopRecording');

        // Preview elements
        this.previewVideo = document.getElementById('previewVideo');
        this.previewCanvas = document.getElementById('previewCanvas');
        this.previewImage = document.getElementById('previewImage');

        // AI elements
        this.analyzeBtn = document.getElementById('analyzeCapture');
        this.readAloudBtn = document.getElementById('readAloud');
        this.aiDescription = document.getElementById('aiDescription');
        this.aiProvider = document.getElementById('aiProvider');

        // Storage elements
        this.saveLocalBtn = document.getElementById('saveLocal');
        this.uploadCloudBtn = document.getElementById('uploadCloud');
        this.cloudProvider = document.getElementById('cloudProvider');

        // Gallery
        this.capturesList = document.getElementById('capturesList');

        // Stats elements
        this.storageUsedEl = document.getElementById('storageUsed');
        this.storageQuotaEl = document.getElementById('storageQuota');
        this.memoryUsageEl = document.getElementById('memoryUsage');
        this.capturesCountEl = document.getElementById('capturesCount');

        // Download all elements
        this.downloadZipBtn = document.getElementById('downloadZip');
        this.downloadHtmlBtn = document.getElementById('downloadHtml');

        // Explanation elements
        this.explanationToggle = document.getElementById('explanationToggle');
        this.explanationContent = document.getElementById('explanationContent');
    }

    bindEvents() {
        this.captureScreenBtn.addEventListener('click', () => this.captureManager.captureScreen());
        this.startRecordingBtn.addEventListener('click', () => this.captureManager.startRecording());
        this.stopRecordingBtn.addEventListener('click', () => this.captureManager.stopRecording());

        this.analyzeBtn.addEventListener('click', () => this.aiAnalyzer.analyzeWithAI());
        this.readAloudBtn.addEventListener('click', () => this.aiAnalyzer.readDescriptionAloud());

        this.saveLocalBtn.addEventListener('click', () => this.storageManager.saveLocal());
        this.uploadCloudBtn.addEventListener('click', () => this.storageManager.uploadToCloud());

        this.downloadZipBtn.addEventListener('click', () => this.downloadAllAsZip());
        this.downloadHtmlBtn.addEventListener('click', () => this.downloadAllAsHtml());
    }

    initializeExplanationToggle() {
        this.explanationToggle.addEventListener('click', () => {
            const isExpanded = this.explanationContent.classList.contains('expanded');
            if (isExpanded) {
                this.explanationContent.classList.remove('expanded');
                this.explanationToggle.textContent = '[Click to expand]';
            } else {
                this.explanationContent.classList.add('expanded');
                this.explanationToggle.textContent = '[Click to collapse]';
            }
        });
    }

    showRecordingButtons(recording) {
        if (recording) {
            this.startRecordingBtn.style.display = 'none';
            this.stopRecordingBtn.style.display = 'inline-flex';
            this.stopRecordingBtn.classList.add('recording-indicator');
        } else {
            this.startRecordingBtn.style.display = 'inline-flex';
            this.stopRecordingBtn.style.display = 'none';
            this.stopRecordingBtn.classList.remove('recording-indicator');
        }
    }

    enableActionButtons() {
        this.analyzeBtn.disabled = false;
        this.saveLocalBtn.disabled = false;
        this.uploadCloudBtn.disabled = false;
    }

    showAiConversation() {
        // Show AI conversation interface
        const conversation = document.getElementById('aiConversation');
        const inputContainer = document.getElementById('aiInputContainer');

        if (conversation) conversation.style.display = 'block';
        if (inputContainer) inputContainer.style.display = 'flex';

        console.log('AI conversation interface activated');
    }

    displayCapture(bitmap, type) {
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0);

        const dataUrl = canvas.toDataURL('image/png');

        this.previewImage.src = dataUrl;
        this.previewImage.style.display = 'block';
        this.previewVideo.style.display = 'none';
        this.previewCanvas.style.display = 'none';

        this.currentCapture = {
            type: 'image',
            subtype: type,
            dataUrl: dataUrl,
            timestamp: new Date().toISOString(),
            filename: `capture_${type}_${Date.now()}.png`
        };

        this.enableActionButtons();
        this.saveToHistory();
    }

    async updateStats() {
        try {
            // Get storage quota information
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                const estimate = await navigator.storage.estimate();
                this.storageQuota = estimate.quota || 0;
                this.storageUsed = estimate.usage || 0;

                if (this.storageQuotaEl) {
                    this.storageQuotaEl.textContent = this.formatBytes(this.storageQuota);
                }
                if (this.storageUsedEl) {
                    this.storageUsedEl.textContent = this.formatBytes(this.storageUsed);
                }
            }

            // Get memory usage (approximate)
            if (performance.memory) {
                const memoryUsage = performance.memory.usedJSHeapSize;
                if (this.memoryUsageEl) {
                    this.memoryUsageEl.textContent = this.formatBytes(memoryUsage);
                }
            } else {
                if (this.memoryUsageEl) {
                    this.memoryUsageEl.textContent = 'N/A';
                }
            }

            // Update captures count
            if (this.capturesCountEl) {
                this.capturesCountEl.textContent = this.captures.length;
            }

            // Check quota and cleanup if needed
            this.checkQuotaAndCleanup();

        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    checkQuotaAndCleanup() {
        if (!this.storageQuota || !this.storageUsed) return;

        const usagePercent = (this.storageUsed / this.storageQuota) * 100;

        // If usage is over 80%, remove oldest captures
        if (usagePercent > 80 && this.captures.length > 0) {
            console.log('Storage quota exceeded 80%, removing oldest captures...');

            // Remove oldest captures until we're under 70%
            while (this.captures.length > 1 && (this.storageUsed / this.storageQuota) > 0.7) {
                const removedCapture = this.captures.pop();
                console.log('Removed old capture:', removedCapture.filename);

                // Update localStorage
                localStorage.setItem('raptureCaptures', JSON.stringify(this.captures));
                this.loadCaptures();
            }

            alert('Old captures were automatically removed to free up storage space.');
        }
    }

    startStatsMonitoring() {
        // Update stats every 30 seconds
        setInterval(() => {
            this.updateStats();
        }, 30000);

        // Also update when localStorage changes (alternative to storage API)
        window.addEventListener('storage', (e) => {
            if (e.key === 'raptureCaptures') {
                this.loadCaptures();
                this.updateStats();
            }
        });
    }

    saveToHistory() {
        if (!this.currentCapture) return;

        const capture = {
            ...this.currentCapture,
            id: Date.now(),
            thumbnail: this.currentCapture.type === 'image' ? this.currentCapture.dataUrl : null,
            uploadUrl: this.currentCapture.uploadUrl || null,
            uploadProvider: this.currentCapture.uploadProvider || null
        };

        this.captures.unshift(capture);
        this.captures = this.captures.slice(0, 50); // Keep only last 50 captures

        localStorage.setItem('raptureCaptures', JSON.stringify(this.captures));
        this.loadCaptures();
    }

    loadCaptures() {
        this.capturesList.innerHTML = '';

        this.captures.forEach(capture => {
            const item = document.createElement('div');
            item.className = 'capture-item';

            const date = new Date(capture.timestamp).toLocaleString();
            const type = capture.type === 'image' ? capture.subtype : 'video';

            if (capture.type === 'image' && capture.thumbnail) {
                item.innerHTML = `
                    <img src="${capture.thumbnail}" alt="Capture ${type}">
                    <div class="capture-info">${type} - ${date}</div>
                    ${capture.uploadUrl ? `<a href="${capture.uploadUrl}" target="_blank" class="capture-link">${capture.uploadProvider.toUpperCase()}: ${capture.uploadUrl}</a>` : ''}
                    <div class="capture-actions">
                        <button class="btn btn-small btn-info" onclick="rapture.downloadCapture('${capture.id}')">Download</button>
                    </div>
                `;
            } else {
                item.innerHTML = `
                    <div class="capture-info">${type} - ${date}</div>
                    ${capture.uploadUrl ? `<a href="${capture.uploadUrl}" target="_blank" class="capture-link">${capture.uploadProvider.toUpperCase()}: ${capture.uploadUrl}</a>` : ''}
                    <div class="capture-actions">
                        <button class="btn btn-small btn-info" onclick="rapture.downloadCapture('${capture.id}')">Download</button>
                    </div>
                `;
            }

            this.capturesList.appendChild(item);
        });
    }

    downloadCapture(captureId) {
        const capture = this.captures.find(c => c.id == captureId);
        if (!capture) return;

        const link = document.createElement('a');
        link.download = capture.filename;
        link.href = capture.dataUrl;
        link.click();
    }

    async downloadAllAsZip() {
        if (this.captures.length === 0) {
            alert('No captures to download.');
            return;
        }

        this.downloadZipBtn.disabled = true;
        this.downloadZipBtn.textContent = '📦 Creating ZIP...';

        try {
            // Create JSZip instance
            const zip = new JSZip();

            // Add each capture to the zip
            for (let i = 0; i < this.captures.length; i++) {
                const capture = this.captures[i];

                if (capture.type === 'image' && capture.dataUrl) {
                    // Convert data URL to blob for images
                    const response = await fetch(capture.dataUrl);
                    const blob = await response.blob();
                    zip.file(capture.filename, blob);
                } else if (capture.type === 'video' && capture.blob) {
                    // Use the stored blob for videos
                    zip.file(capture.filename, capture.blob);
                }
            }

            // Generate and download the zip
            const content = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(content);

            const link = document.createElement('a');
            link.href = url;
            link.download = `rapture_captures_${new Date().toISOString().split('T')[0]}.zip`;
            link.click();

            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error creating ZIP:', error);
            alert('Error creating ZIP file. Please try again.');
        } finally {
            this.downloadZipBtn.disabled = false;
            this.downloadZipBtn.textContent = '📦 Download ZIP';
        }
    }

    async downloadAllAsHtml() {
        if (this.captures.length === 0) {
            alert('No captures to download.');
            return;
        }

        this.downloadHtmlBtn.disabled = true;
        this.downloadHtmlBtn.textContent = '🌐 Creating HTML...';

        try {
            let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapture Captures - ${new Date().toLocaleDateString()}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .header { background: #2a3a2a; color: white; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
        .capture-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .capture-item { background: white; border-radius: 8px; padding: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .capture-image { max-width: 100%; height: auto; border-radius: 4px; margin-bottom: 10px; }
        .capture-info { margin-bottom: 10px; color: #666; }
        .capture-link { color: #0066cc; text-decoration: none; display: inline-block; margin-top: 5px; }
        .capture-link:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎬 Rapture Captures</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
        <p>Total captures: ${this.captures.length}</p>
    </div>
    <div class="capture-grid">`;

            for (const capture of this.captures) {
                const date = new Date(capture.timestamp).toLocaleString();
                const type = capture.type === 'image' ? capture.subtype : 'video';

                htmlContent += `
    <div class="capture-item">
        ${capture.type === 'image' && capture.dataUrl ? `<img src="${capture.dataUrl}" alt="Capture ${type}" class="capture-image">` : ''}
        <div class="capture-info">
            <strong>Type:</strong> ${type}<br>
            <strong>Date:</strong> ${date}<br>
            <strong>Filename:</strong> ${capture.filename}
        </div>
        ${capture.uploadUrl ? `<a href="${capture.uploadUrl}" target="_blank" class="capture-link">${capture.uploadProvider.toUpperCase()}: View Online</a>` : ''}
    </div>`;
            }

            htmlContent += `
    </div>
</body>
</html>`;

            // Download the HTML file
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `rapture_captures_${new Date().toISOString().split('T')[0]}.html`;
            link.click();

            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error creating HTML file:', error);
            alert('Error creating HTML file. Please try again.');
        } finally {
            this.downloadHtmlBtn.disabled = false;
            this.downloadHtmlBtn.textContent = '🌐 Download HTML';
        }
    }
}

// Initialize the application
const rapture = new RaptureCapture();

console.log('🎬 Rapture Screen Capture & AI Analysis Tool initialized!');
console.log('📸 Features: Screen capture, Video recording, AI analysis, Cloud upload');
console.log('🔧 Usage: Click capture buttons to start, then analyze with AI or save/upload');