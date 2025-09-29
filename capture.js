// Screen Capture and Recording functionality
class CaptureManager {
    constructor(raptureApp) {
        this.rapture = raptureApp;
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

            this.rapture.captureManager.displayCapture(bitmap, 'screen');
            track.stop();

        } catch (error) {
            console.error('Screen capture failed:', error);
            alert('Screen capture failed. Please ensure you have granted screen recording permissions.');
        }
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });

            this.rapture.previewVideo.srcObject = stream;
            this.rapture.previewVideo.style.display = 'block';
            this.rapture.previewImage.style.display = 'none';
            this.rapture.previewCanvas.style.display = 'none';

            this.rapture.mediaRecorder = new MediaRecorder(stream);
            this.rapture.recordedChunks = [];

            this.rapture.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.rapture.recordedChunks.push(event.data);
                }
            };

            this.rapture.mediaRecorder.onstop = () => {
                const blob = new Blob(this.rapture.recordedChunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);

                this.rapture.currentCapture = {
                    type: 'video',
                    dataUrl: url,
                    blob: blob,
                    timestamp: new Date().toISOString(),
                    filename: `recording_${Date.now()}.webm`
                };

                this.rapture.previewVideo.srcObject = null;
                this.rapture.previewVideo.src = url;
                this.rapture.previewVideo.controls = true;

                this.rapture.enableActionButtons();
                this.rapture.saveToHistory();
                this.rapture.showRecordingButtons(false);
            };

            this.rapture.mediaRecorder.start();
            this.rapture.isRecording = true;
            this.rapture.showRecordingButtons(true);

        } catch (error) {
            console.error('Recording start failed:', error);
            alert('Recording start failed. Please ensure you have granted screen recording permissions.');
        }
    }

    stopRecording() {
        if (this.rapture.mediaRecorder && this.rapture.mediaRecorder.state !== 'inactive') {
            this.rapture.mediaRecorder.stop();
            this.rapture.isRecording = false;
        }

        // Stop screen sharing by stopping all tracks
        if (this.rapture.previewVideo && this.rapture.previewVideo.srcObject) {
            const stream = this.rapture.previewVideo.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            this.rapture.previewVideo.srcObject = null;
        }
    }

}