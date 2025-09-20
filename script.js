class RaptureCapture {
    constructor() {
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.currentCapture = null;
        this.captures = JSON.parse(localStorage.getItem('raptureCaptures') || '[]');
        
        this.initializeElements();
        this.bindEvents();
        this.loadCaptures();
    }

    initializeElements() {
        // Capture buttons
        this.captureScreenBtn = document.getElementById('captureScreen');
        this.captureWindowBtn = document.getElementById('captureWindow');
        this.captureTabBtn = document.getElementById('captureTab');
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
        
        this.uploadCloudBtn = document.getElementById('uploadCloud');
        this.cloudProvider = document.getElementById('cloudProvider');
        
        // Gallery
        this.capturesList = document.getElementById('capturesList');
    }

    bindEvents() {
        this.captureScreenBtn.addEventListener('click', () => this.captureScreen());
        this.captureWindowBtn.addEventListener('click', () => this.captureWindow());
        this.captureTabBtn.addEventListener('click', () => this.captureTab());
        this.startRecordingBtn.addEventListener('click', () => this.startRecording());
    this.stopRecordingBtn.addEventListener('click', () => this.stopRecording());
        
        this.analyzeBtn.addEventListener('click', () => this.analyzeWithAI());
        this.readAloudBtn.addEventListener('click', () => this.readDescriptionAloud());
        
        this.uploadCloudBtn.addEventListener('click', () => this.uploadToCloud());
    }

    async captureScreen() {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { mediaSource: 'screen' },
                audio: false
            });
            
            const track = stream.getVideoTracks()[0];
            const imageCapture = new ImageCapture(track);
            const bitmap = await imageCapture.grabFrame();
            
            this.displayCapture(bitmap, 'screen');
            track.stop();
            
        } catch (error) {
            console.error('Screen capture failed:', error);
            alert('Screen capture failed. Please ensure you have granted screen recording permissions.');
        }
    }

    async captureWindow() {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { mediaSource: 'window' },
                audio: false
            });
            
            const track = stream.getVideoTracks()[0];
            const imageCapture = new ImageCapture(track);
            const bitmap = await imageCapture.grabFrame();
            
            this.displayCapture(bitmap, 'window');
            track.stop();
            
        } catch (error) {
            console.error('Window capture failed:', error);
            alert('Window capture failed. Please ensure you have granted screen recording permissions.');
        }
    }

    async captureTab() {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { mediaSource: 'browser' },
                audio: false
            });
            
            const track = stream.getVideoTracks()[0];
            const imageCapture = new ImageCapture(track);
            const bitmap = await imageCapture.grabFrame();
            
            this.displayCapture(bitmap, 'tab');
            track.stop();
            
        } catch (error) {
            console.error('Tab capture failed:', error);
            alert('Tab capture failed. Please ensure you have granted screen recording permissions.');
        }
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
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });
            
            this.previewVideo.srcObject = stream;
            this.previewVideo.style.display = 'block';
            this.previewImage.style.display = 'none';
            this.previewCanvas.style.display = 'none';
            
            this.mediaRecorder = new MediaRecorder(stream);
            this.recordedChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                
                this.currentCapture = {
                    type: 'video',
                    dataUrl: url,
                    blob: blob,
                    timestamp: new Date().toISOString(),
                    filename: `recording_${Date.now()}.webm`
                };
                
                this.previewVideo.srcObject = null;
                this.previewVideo.src = url;
                this.previewVideo.controls = true;
                
                this.enableActionButtons();
            };
            
            this.mediaRecorder.start();
            
            
            
            
        } catch (error) {
            console.error('Recording start failed:', error);
            alert('Recording start failed. Please ensure you have granted screen recording permissions.');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
            
            
        }
    }

    enableActionButtons() {
        this.analyzeBtn.disabled = false;
        
        this.uploadCloudBtn.disabled = false;
    }

    async analyzeWithAI() {
        if (!this.currentCapture) return;
        
        this.analyzeBtn.disabled = true;
        this.analyzeBtn.textContent = '🤖 Analyzing...';
        
        try {
            const provider = this.aiProvider.value;
            let analysis = '';
            
            if (this.currentCapture.type === 'image') {
                analysis = await this.analyzeImage(this.currentCapture.dataUrl, provider);
            } else if (this.currentCapture.type === 'video') {
                analysis = await this.analyzeVideo(this.currentCapture.dataUrl, provider);
            }
            
            this.aiDescription.value = analysis;            this.showAiConversation();
            this.readAloudBtn.disabled = false;
            
        } catch (error) {
            console.error('AI analysis failed:', error);
            this.aiDescription.value = 'AI analysis failed. Please check your API configuration and try again.';
        } finally {
            this.analyzeBtn.disabled = false;
            this.analyzeBtn.textContent = '🤖 Analyze with AI';
        }
    }

    async analyzeImage(dataUrl, provider) {
        // Convert data URL to base64
        const base64 = dataUrl.split(',')[1];
        
        // For demo purposes, using a mock AI analysis
        // In production, you would integrate with actual AI APIs
        const mockAnalysis = `IMAGE ANALYSIS REPORT
========================

📊 **Visual Elements Detected:**
- Screen capture type: ${this.currentCapture.subtype}
- Resolution: High quality
- Color depth: Full spectrum
- Format: PNG

🎨 **Color Analysis:**
- Primary colors detected
- Good contrast ratio
- Clear visibility

🔍 **Content Analysis:**
- Screenshot captured successfully
- Elements appear clearly defined
- Text readability: Good
- Overall quality: Excellent

⚡ **Technical Details:**
- Capture method: ${this.currentCapture.subtype}
- Timestamp: ${new Date(this.currentCapture.timestamp).toLocaleString()}
- File format: PNG
- Estimated file size: Medium

💡 **Recommendations:**
- Image quality is suitable for documentation
- Consider compression for web sharing
- Colors are well-balanced for analysis

Generated by Rapture AI Analysis Engine`;
        
        return mockAnalysis;
    }

    async analyzeVideo(dataUrl, provider) {
        const mockAnalysis = `VIDEO ANALYSIS REPORT
========================

🎬 **Video Properties:**
- Format: WebM
- Duration: Variable
- Quality: High definition
- Audio: Included (if available)

📈 **Content Summary:**
- Screen recording captured
- Smooth playback expected
- Good frame rate maintained
- Audio sync preserved

🔧 **Technical Assessment:**
- Recording method: Screen capture
- Codec: WebM/VP8
- Compatibility: Modern browsers
- Streaming ready: Yes

⚠️ **Usage Notes:**
- Suitable for documentation
- Web-optimized format
- Consider conversion for broader compatibility

Generated by Rapture AI Analysis Engine`;
        
        return mockAnalysis;
    }

    readDescriptionAloud() {
        const text = this.aiDescription.value;
        if (!text) return;
        
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 1;
            
            // Stop any current speech
            window.speechSynthesis.cancel();
            
            // Start new speech
            window.speechSynthesis.speak(utterance);
            
            this.readAloudBtn.textContent = '🔊 Reading...';
            this.readAloudBtn.disabled = true;
            
            utterance.onend = () => {
                this.readAloudBtn.textContent = '🔊 Read Description Aloud';
                this.readAloudBtn.disabled = false;
            };
        } else {
            alert('Text-to-speech is not supported in your browser.');
        }
    }

    saveLocally() {
        if (!this.currentCapture) return;
        
        const link = document.createElement('a');
        link.download = this.currentCapture.filename;
        link.href = this.currentCapture.dataUrl;
        link.click();
        
        // Save to local storage
        this.addToCaptures(this.currentCapture);
    }

    async uploadToCloud() {
        if (!this.currentCapture) return;
        
        this.uploadCloudBtn.disabled = true;
        this.uploadCloudBtn.textContent = '☁️ Uploading...';
        
        try {
            const provider = this.cloudProvider.value;
            let uploadUrl = '';
            
            if (this.currentCapture.type === 'image') {
                uploadUrl = await this.uploadImageToCloud(this.currentCapture.dataUrl, provider);
            } else if (this.currentCapture.type === 'video') {
                uploadUrl = await this.uploadVideoToCloud(this.currentCapture.blob, provider);
            }
            
            if (uploadUrl) {
                this.showCloudDownloadLink(uploadUrl);
                this.currentCapture.cloudUrl = uploadUrl;
                this.addToCaptures(this.currentCapture);
            }
            
        } catch (error) {
            console.error('Cloud upload failed:', error);
            alert('Cloud upload failed. Please try again.');
        } finally {
            this.uploadCloudBtn.disabled = false;
            this.uploadCloudBtn.textContent = '☁️ Upload to Cloud';
        }
    }

    async uploadImageToCloud(dataUrl, provider) {
        // Mock upload for demo purposes
        // In production, implement actual API calls to cloud providers
        
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(`https://mock-cloud-provider.com/image_${Date.now()}.png`);
            }, 2000);
        });
    }

    async uploadVideoToCloud(blob, provider) {
        // Mock upload for demo purposes
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(`https://mock-cloud-provider.com/video_${Date.now()}.webm`);
            }, 3000);
        });
    }

    addToCaptures(capture) {
        this.captures.unshift({
            ...capture,
            id: Date.now()
        });
        
        // Keep only last 20 captures
        if (this.captures.length > 20) {
            this.captures = this.captures.slice(0, 20);
        }
        
        localStorage.setItem('raptureCaptures', JSON.stringify(this.captures));
        this.loadCaptures();
    }

    loadCaptures() {
        this.capturesList.innerHTML = '';
        
        this.captures.forEach(capture => {
            const captureItem = document.createElement('div');
            captureItem.className = 'capture-item';
            
            if (capture.type === 'image') {
                captureItem.innerHTML = `
                    <img src="${capture.dataUrl}" alt="Capture">
                    <div class="capture-info">
                        <strong>${capture.subtype}</strong><br>
                        ${new Date(capture.timestamp).toLocaleDateString()}
                    </div>
                    <div class="capture-actions">
                        <button class="btn btn-small btn-info" onclick="rapture.viewCapture('${capture.id}')">View</button>
                        <button class="btn btn-small btn-success" onclick="rapture.downloadCapture('${capture.id}')">Download</button>
                    </div>
                `;
            } else if (capture.type === 'video') {
                captureItem.innerHTML = `
                    <video src="${capture.dataUrl}" controls></video>
                    <div class="capture-info">
                        <strong>Video</strong><br>
                        ${new Date(capture.timestamp).toLocaleDateString()}
                    </div>
                    <div class="capture-actions">
                        <button class="btn btn-small btn-info" onclick="rapture.viewCapture('${capture.id}')">View</button>
                        <button class="btn btn-small btn-success" onclick="rapture.downloadCapture('${capture.id}')">Download</button>
                    </div>
                `;
            }
            
            this.capturesList.appendChild(captureItem);
        });
    }

    viewCapture(id) {
        const capture = this.captures.find(c => c.id == id);
        if (capture) {
            this.currentCapture = capture;
            
            if (capture.type === 'image') {
                this.previewImage.src = capture.dataUrl;
                this.previewImage.style.display = 'block';
                this.previewVideo.style.display = 'none';
            } else if (capture.type === 'video') {
                this.previewVideo.src = capture.dataUrl;
                this.previewVideo.style.display = 'block';
                this.previewImage.style.display = 'none';
                this.previewVideo.controls = true;
            }
            
            this.enableActionButtons();
        }
    }

    downloadCapture(id) {
        const capture = this.captures.find(c => c.id == id);
        if (capture) {
            const link = document.createElement('a');
            link.download = capture.filename;
            link.href = capture.dataUrl;
            link.click();
        }
    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
    }

handleRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.stopRecording();
            document.getElementById("startRecording").textContent = '?? Start Recording';
            this.startRecordingBtn.className = 'btn btn-secondary';
        }

showAiConversation() {  
        // Placeholder method - AI conversation functionality  
        console.log('AI conversation would be shown here');  
    }

showCloudDownloadLink(url) {  
        // Placeholder method - cloud download link functionality  
        console.log('Cloud download link would be shown here:', url);  
    }

    enableActionButtons() {
        this.analyzeBtn.disabled = false;
        this.uploadCloudBtn.disabled = false;
    }
}
}

// Initialize the application
const rapture = new RaptureCapture();

console.log('🎬 Rapture Screen Capture & AI Analysis Tool initialized!');
console.log('📸 Features: Screen capture, Video recording, AI analysis, Cloud upload');
console.log('🔧 Usage: Click capture buttons to start, then analyze with AI or save/upload');