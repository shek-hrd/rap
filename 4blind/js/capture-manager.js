/**
 * Capture Manager Module for Rapture Accessible
 * Handles saving, loading, and managing screen captures
 */

class CaptureManager {
    constructor() {
        this.captures = [];
        this.currentCapture = null;
        this.maxCaptures = 50;
        this.storageQuota = 0;
        this.storageUsed = 0;

        this.init();
    }

    init() {
        this.loadCaptures();
        this.setupEventListeners();
        this.startStorageMonitoring();

        console.log('💾 Capture Manager initialized');
    }

    setupEventListeners() {
        // Save capture button
        const saveCaptureBtn = document.getElementById('saveCapture');
        if (saveCaptureBtn) {
            saveCaptureBtn.addEventListener('click', () => {
                this.saveCurrentCapture();
            });
        }

        // Clear all button
        const clearAllBtn = document.getElementById('clearAll');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                this.clearAllCaptures();
            });
        }

        // Export all button
        const exportAllBtn = document.getElementById('exportAll');
        if (exportAllBtn) {
            exportAllBtn.addEventListener('click', () => {
                this.downloadAllAsHtml();
            });
        }

        // AI conversation send button
        const sendAiMessageBtn = document.getElementById('sendAiMessage');
        if (sendAiMessageBtn) {
            sendAiMessageBtn.addEventListener('click', () => {
                this.handleAIQuestion();
            });
        }

        // AI input enter key
        const aiInput = document.getElementById('aiInput');
        if (aiInput) {
            aiInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleAIQuestion();
                }
            });
        }
    }

    loadCaptures() {
        try {
            const savedCaptures = localStorage.getItem('raptureAccessibleCaptures');
            if (savedCaptures) {
                this.captures = JSON.parse(savedCaptures);
                console.log(`💾 Loaded ${this.captures.length} saved captures`);
            }
        } catch (error) {
            console.error('Error loading captures:', error);
            this.captures = [];
        }

        this.updateCapturesGallery();
        this.updateStats();
    }

    saveCaptures() {
        try {
            localStorage.setItem('raptureAccessibleCaptures', JSON.stringify(this.captures));
            console.log(`💾 Saved ${this.captures.length} captures to storage`);
        } catch (error) {
            console.error('Error saving captures:', error);
            window.accessibilityManager.announceError('Failed to save captures: ' + error.message);
        }
    }

    saveCurrentCapture() {
        if (!window.currentCapture) {
            window.accessibilityManager.announce('No capture available to save');
            return;
        }

        try {
            // Create capture object
            const capture = {
                ...window.currentCapture,
                id: Date.now(),
                savedAt: new Date().toISOString()
            };

            // Add to captures array
            this.captures.unshift(capture);

            // Enforce max captures limit
            if (this.captures.length > this.maxCaptures) {
                const removedCaptures = this.captures.splice(this.maxCaptures);
                console.log(`💾 Removed ${removedCaptures.length} old captures to stay within limit`);
            }

            // Save to storage
            this.saveCaptures();

            // Update UI
            this.updateCapturesGallery();
            this.updateStats();

            window.accessibilityManager.announceCaptureSuccess(capture.filename, 'saved');

            console.log('💾 Capture saved successfully:', capture.filename);

        } catch (error) {
            console.error('Error saving capture:', error);
            window.accessibilityManager.announceError('Failed to save capture: ' + error.message);
        }
    }

    updateCapturesGallery() {
        const capturesList = document.getElementById('capturesList');
        if (!capturesList) return;

        capturesList.innerHTML = '';

        if (this.captures.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'capture-item';
            emptyMessage.innerHTML = `
                <div class="capture-info" style="text-align: center; color: #00ff00;">
                    No captures saved yet. Use auto capture or emergency capture to begin.
                </div>
            `;
            capturesList.appendChild(emptyMessage);
            return;
        }

        // Add summary item
        const summaryItem = document.createElement('div');
        summaryItem.className = 'capture-item';
        summaryItem.innerHTML = `
            <div class="capture-info" style="text-align: center; color: #00ff00; font-weight: bold;">
                📋 ${this.captures.length} Saved Captures
            </div>
            <div class="capture-actions" style="justify-content: center;">
                <button class="btn btn-small btn-info" onclick="window.captureManager.speakCapturesSummary()">
                    🔊 Speak Summary
                </button>
            </div>
        `;
        capturesList.appendChild(summaryItem);

        // Add individual capture items
        this.captures.forEach((capture, index) => {
            const item = document.createElement('div');
            item.className = 'capture-item';
            item.setAttribute('role', 'article');
            item.setAttribute('aria-label', `Capture ${index + 1} of ${this.captures.length}`);

            const date = new Date(capture.timestamp || capture.savedAt).toLocaleString();
            const type = capture.type === 'image' ? (capture.subtype || 'screen') : 'video';

            if (capture.type === 'image' && capture.dataUrl) {
                item.innerHTML = `
                    <img src="${capture.dataUrl}" alt="Capture ${type}" aria-label="Screenshot of ${type}">
                    <div class="capture-info">
                        <strong>Type:</strong> ${type}<br>
                        <strong>Date:</strong> ${date}<br>
                        <strong>Filename:</strong> ${capture.filename}
                    </div>
                    <div class="capture-actions">
                        <button class="btn btn-small btn-info" onclick="event.stopPropagation(); window.captureManager.loadCaptureToPreview('${capture.id}')" aria-label="View this capture">
                            👁️ View
                        </button>
                        <button class="btn btn-small btn-info" onclick="event.stopPropagation(); window.captureManager.downloadCapture('${capture.id}')" aria-label="Download this capture">
                            💾 Download
                        </button>
                        <button class="btn btn-small btn-danger" onclick="event.stopPropagation(); window.captureManager.deleteCapture('${capture.id}')" aria-label="Delete this capture">
                            🗑️ Delete
                        </button>
                    </div>
                `;
            } else {
                item.innerHTML = `
                    <div class="capture-info">
                        <strong>Type:</strong> ${type}<br>
                        <strong>Date:</strong> ${date}<br>
                        <strong>Filename:</strong> ${capture.filename}
                    </div>
                    <div class="capture-actions">
                        <button class="btn btn-small btn-info" onclick="event.stopPropagation(); window.captureManager.downloadCapture('${capture.id}')" aria-label="Download this capture">
                            💾 Download
                        </button>
                        <button class="btn btn-small btn-danger" onclick="event.stopPropagation(); window.captureManager.deleteCapture('${capture.id}')" aria-label="Delete this capture">
                            🗑️ Delete
                        </button>
                    </div>
                `;
            }

            // Make item clickable for preview
            item.addEventListener('click', (e) => {
                if (!e.target.matches('button')) {
                    this.loadCaptureToPreview(capture.id);
                }
            });

            // Add keyboard navigation
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.loadCaptureToPreview(capture.id);
                }
            });

            capturesList.appendChild(item);
        });
    }

    loadCaptureToPreview(captureId) {
        const capture = this.captures.find(c => c.id == captureId);
        if (!capture) {
            window.accessibilityManager.announce('Capture not found');
            return;
        }

        // Set as current capture
        window.currentCapture = capture;

        // Update preview
        const previewImage = document.getElementById('previewImage');
        const previewPlaceholder = document.getElementById('previewPlaceholder');

        if (capture.type === 'image' && capture.dataUrl) {
            if (previewImage) {
                previewImage.src = capture.dataUrl;
                previewImage.style.display = 'block';
            }
            if (previewPlaceholder) {
                previewPlaceholder.style.display = 'none';
            }
        } else if (previewPlaceholder) {
            previewPlaceholder.textContent = `${capture.type} capture loaded: ${capture.filename}`;
        }

        // Update analysis if available
        if (capture.analysis) {
            const aiDescription = document.getElementById('aiDescription');
            if (aiDescription) {
                aiDescription.value = capture.analysis;
            }
        }

        // Enable buttons
        const readAloudBtn = document.getElementById('readAloud');
        const saveCaptureBtn = document.getElementById('saveCapture');

        if (readAloudBtn) readAloudBtn.disabled = false;
        if (saveCaptureBtn) saveCaptureBtn.disabled = true; // Already saved

        window.accessibilityManager.announce(`Loaded capture: ${capture.filename}`);

        console.log('💾 Loaded capture to preview:', capture.filename);
    }

    downloadCapture(captureId) {
        const capture = this.captures.find(c => c.id == captureId);
        if (!capture) {
            window.accessibilityManager.announce('Capture not found');
            return;
        }

        try {
            const link = document.createElement('a');
            link.download = capture.filename;
            link.href = capture.dataUrl;
            link.click();

            window.accessibilityManager.announce(`Downloading: ${capture.filename}`);

            console.log('💾 Download initiated:', capture.filename);
        } catch (error) {
            console.error('Download error:', error);
            window.accessibilityManager.announceError('Download failed: ' + error.message);
        }
    }

    deleteCapture(captureId) {
        const index = this.captures.findIndex(c => c.id == captureId);
        if (index === -1) {
            window.accessibilityManager.announce('Capture not found');
            return;
        }

        const capture = this.captures[index];

        // Remove from array
        this.captures.splice(index, 1);

        // Save to storage
        this.saveCaptures();

        // Update UI
        this.updateCapturesGallery();
        this.updateStats();

        window.accessibilityManager.announce(`Deleted capture: ${capture.filename}`);

        console.log('💾 Capture deleted:', capture.filename);
    }

    clearAllCaptures() {
        if (confirm('Are you sure you want to clear all captures? This action cannot be undone.')) {
            const count = this.captures.length;
            this.captures = [];
            this.saveCaptures();
            this.updateCapturesGallery();
            this.updateStats();

            window.accessibilityManager.announce(`Cleared ${count} captures`);

            console.log(`💾 Cleared all captures (${count} removed)`);
        }
    }

    speakCapturesSummary() {
        if (this.captures.length === 0) {
            window.accessibilityManager.announce('No captures saved');
            return;
        }

        const totalCaptures = this.captures.length;
        const imageCaptures = this.captures.filter(c => c.type === 'image').length;
        const videoCaptures = this.captures.filter(c => c.type === 'video').length;

        const summary = `Captures summary: ${totalCaptures} total, ${imageCaptures} images, ${videoCaptures} videos`;
        window.accessibilityManager.announce(summary);
    }

    async downloadAllAsHtml() {
        if (this.captures.length === 0) {
            window.accessibilityManager.announce('No captures to export');
            return;
        }

        try {
            console.log('💾 Creating HTML export...');

            let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapture Accessible Captures - ${new Date().toLocaleDateString()}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #0d1117;
            color: #00ff00;
            margin: 20px;
            line-height: 1.6;
        }
        .header {
            background: #161b22;
            color: #00ff00;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            border: 3px solid #8b0000;
            margin-bottom: 20px;
        }
        .capture-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        .capture-item {
            background: #161b22;
            border-radius: 8px;
            padding: 15px;
            border: 2px solid #30363d;
            page-break-inside: avoid;
        }
        .capture-image {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            margin-bottom: 10px;
        }
        .capture-info {
            margin-bottom: 10px;
            color: #00ff00;
        }
        .capture-info strong {
            color: #00ff00;
        }
        @media print {
            body { background: white; color: black; }
            .capture-item { border: 2px solid black; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎬 Rapture Accessible Captures</h1>
        <p>Exported on ${new Date().toLocaleString()}</p>
        <p>Total captures: ${this.captures.length}</p>
    </div>
    <div class="capture-grid">`;

            for (const capture of this.captures) {
                const date = new Date(capture.timestamp || capture.savedAt).toLocaleString();
                const type = capture.type === 'image' ? (capture.subtype || 'screen') : 'video';

                htmlContent += `
        <div class="capture-item">
            ${capture.type === 'image' && capture.dataUrl ? `<img src="${capture.dataUrl}" alt="Capture ${type}" class="capture-image">` : ''}
            <div class="capture-info">
                <strong>Type:</strong> ${type}<br>
                <strong>Date:</strong> ${date}<br>
                <strong>Filename:</strong> ${capture.filename}<br>
                ${capture.analysis ? `<strong>Analysis:</strong> ${capture.analysis.substring(0, 200)}...` : ''}
            </div>
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
            link.download = `rapture_accessible_captures_${new Date().toISOString().split('T')[0]}.html`;
            link.click();

            URL.revokeObjectURL(url);

            window.accessibilityManager.announce(`Exported ${this.captures.length} captures to HTML file`);

            console.log('💾 HTML export completed');

        } catch (error) {
            console.error('Error creating HTML export:', error);
            window.accessibilityManager.announceError('Export failed: ' + error.message);
        }
    }

    handleAIQuestion() {
        const aiInput = document.getElementById('aiInput');
        if (!aiInput || !aiInput.value.trim()) {
            window.accessibilityManager.announce('Please enter a question');
            return;
        }

        const question = aiInput.value.trim();
        aiInput.value = '';

        // Add user question to conversation
        this.addToConversation('user', question);

        // Get AI response
        this.askAIAboutCapture(question);
    }

    async askAIAboutCapture(question) {
        if (!window.currentCapture) {
            this.addToConversation('ai', 'No capture is currently loaded. Please load a capture first.');
            window.accessibilityManager.announce('No capture loaded for questions');
            return;
        }

        // Show typing indicator
        this.addToConversation('ai', 'AI is thinking...', 'typing');

        try {
            const provider = document.getElementById('aiProviderSelect')?.value || 'gemini';

            let response = '';

            if (window.currentCapture.type === 'image') {
                response = await this.askAIAboutImage(question, window.currentCapture.dataUrl, provider);
            } else {
                response = await this.askAIAboutVideo(question, provider);
            }

            // Remove typing indicator and add response
            this.updateLastMessage(response);

            window.accessibilityManager.announce('AI response received');

        } catch (error) {
            console.error('AI question error:', error);
            this.updateLastMessage(`Error: ${error.message}`, 'error');
            window.accessibilityManager.announceError('AI question failed: ' + error.message);
        }
    }

    async askAIAboutImage(question, dataUrl, provider) {
        switch (provider) {
            case 'gemini':
                if (window.aiAnalyzer?.aiProviders?.gemini?.isConfigured) {
                    const response = await puter.ai.chat(question, dataUrl, {
                        model: window.aiAnalyzer.aiProviders.gemini.model
                    });
                    return response.message?.content || 'No response received';
                }
                return 'Gemini not available. Please use Hugging Face for questions.';

            case 'huggingface':
                return await this.askHuggingFaceAboutImage(question, dataUrl);

            case 'openai':
                return await this.askOpenAIAboutImage(question, dataUrl);

            default:
                return 'Unsupported AI provider for questions.';
        }
    }

    async askHuggingFaceAboutImage(question, dataUrl) {
        try {
            const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: `Context: This is about a screen capture. Question: ${question}`,
                    parameters: {
                        max_new_tokens: 100,
                        temperature: 0.7
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const result = await response.json();
            return result[0]?.generated_text || 'No response received';
        } catch (error) {
            return `Hugging Face question failed: ${error.message}`;
        }
    }

    async askOpenAIAboutImage(question, dataUrl) {
        const apiKey = localStorage.getItem('openai_api_key');
        if (!apiKey) {
            return 'OpenAI API key required for questions.';
        }

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [{
                        role: 'user',
                        content: [{
                            type: 'text',
                            text: question
                        }, {
                            type: 'image_url',
                            image_url: { url: dataUrl }
                        }]
                    }],
                    max_tokens: 150
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const result = await response.json();
            return result.choices[0]?.message?.content || 'No response received';
        } catch (error) {
            return `OpenAI question failed: ${error.message}`;
        }
    }

    addToConversation(sender, message, type = 'normal') {
        const conversation = document.getElementById('conversationMessages');
        if (!conversation) return;

        // Remove typing indicator if present
        const typingMessage = conversation.querySelector('.ai-message.typing');
        if (typingMessage) {
            typingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${sender} ${type}`;
        messageDiv.textContent = `${sender === 'user' ? 'You' : 'AI'}: ${message}`;
        messageDiv.setAttribute('role', 'article');

        conversation.appendChild(messageDiv);
        conversation.scrollTop = conversation.scrollHeight;
    }

    updateLastMessage(message, type = 'normal') {
        const conversation = document.getElementById('conversationMessages');
        if (!conversation) return;

        const lastMessage = conversation.querySelector('.ai-message:last-child');
        if (lastMessage) {
            lastMessage.textContent = `AI: ${message}`;
            lastMessage.className = `ai-message ai ${type}`;
        }
    }

    updateStats() {
        this.updateStorageStats();
        this.updateCaptureCount();
    }

    async updateStorageStats() {
        try {
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                const estimate = await navigator.storage.estimate();
                this.storageQuota = estimate.quota || 0;
                this.storageUsed = estimate.usage || 0;

                // Update UI
                const storageUsedEl = document.getElementById('storageUsed');
                const storageQuotaEl = document.getElementById('storageQuota');

                if (storageUsedEl) {
                    storageUsedEl.textContent = this.formatBytes(this.storageUsed);
                }
                if (storageQuotaEl) {
                    storageQuotaEl.textContent = this.formatBytes(this.storageQuota);
                }
            }
        } catch (error) {
            console.error('Error updating storage stats:', error);
        }
    }

    updateCaptureCount() {
        const capturesCountEl = document.getElementById('capturesCount');
        if (capturesCountEl) {
            capturesCountEl.textContent = this.captures.length;
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    startStorageMonitoring() {
        // Update stats every 30 seconds
        setInterval(() => {
            this.updateStats();
        }, 30000);
    }

    getCaptures() {
        return this.captures;
    }

    getCurrentCapture() {
        return this.currentCapture;
    }
}

// Initialize capture manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.captureManager = new CaptureManager();
});

console.log('💾 Capture manager module loaded');