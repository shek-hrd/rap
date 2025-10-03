/**
 * Voice Commands Module for Rapture Accessible
 * Handles speech recognition and voice command processing
 */

class VoiceCommandManager {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.isSupported = false;
        this.commandHistory = [];
        this.maxHistorySize = 10;

        this.commands = {
            // Capture commands
            'capture screen': 'captureScreen',
            'take screenshot': 'captureScreen',
            'capture': 'captureScreen',

            // Recording commands
            'start recording': 'startRecording',
            'begin recording': 'startRecording',
            'record screen': 'startRecording',
            'stop recording': 'stopRecording',
            'end recording': 'stopRecording',

            // Analysis commands
            'analyze capture': 'analyzeCapture',
            'analyze': 'analyzeCapture',
            'ai analysis': 'analyzeCapture',
            'read description': 'readAloud',
            'speak description': 'readAloud',
            'read aloud': 'readAloud',

            // Save/storage commands
            'save capture': 'saveCapture',
            'save': 'saveCapture',
            'upload': 'uploadCloud',
            'upload capture': 'uploadCloud',

            // Status commands
            'speak status': 'speakStatus',
            'system status': 'speakStatus',
            'status': 'speakStatus',
            'what\'s my status': 'speakStatus',

            // Management commands
            'clear all': 'clearAllCaptures',
            'delete all': 'clearAllCaptures',
            'clear captures': 'clearAllCaptures',
            'export all': 'exportAll',
            'download all': 'exportAll',

            // Navigation commands
            'help': 'showHelp',
            'commands': 'showHelp',
            'what can you do': 'showHelp',

            // Conversation commands
            'ask question': 'askQuestion',
            'talk to ai': 'askQuestion',
            'ai chat': 'askQuestion'
        };

        this.init();
    }

    init() {
        this.checkSupport();
        this.initSpeechRecognition();
        this.setupEventListeners();

        console.log('🎤 Voice Command Manager initialized');
    }

    checkSupport() {
        // Check for Web Speech API support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            this.isSupported = true;
            console.log('✅ Speech recognition supported');
        } else {
            console.warn('❌ Speech recognition not supported in this browser');
            // Don't show message during initialization to avoid speech synthesis errors
            // this.showNotSupportedMessage();
        }
    }

    initSpeechRecognition() {
        if (!this.isSupported) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
            this.onRecognitionStart();
        };

        this.recognition.onresult = (event) => {
            this.onRecognitionResult(event);
        };

        this.recognition.onerror = (event) => {
            this.onRecognitionError(event);
        };

        this.recognition.onend = () => {
            this.onRecognitionEnd();
        };
    }

    setupEventListeners() {
        // Add keyboard shortcut for voice commands (Alt+V)
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key.toLowerCase() === 'v') {
                e.preventDefault();
                this.toggleListening();
            }
        });

        // Add button for manual voice command activation
        this.createVoiceCommandButton();
    }

    createVoiceCommandButton() {
        const button = document.createElement('button');
        button.id = 'voiceCommandBtn';
        button.className = 'btn btn-info';
        button.innerHTML = '🎤 Voice Commands';
        button.setAttribute('aria-label', 'Toggle voice command listening');
        button.setAttribute('title', 'Press Alt+V or click to toggle voice commands');

        button.addEventListener('click', () => {
            this.toggleListening();
        });

        // Add to quick actions section
        const quickActionsSection = document.querySelector('.quick-actions-section');
        if (quickActionsSection) {
            const container = document.createElement('div');
            container.className = 'voice-command-container';
            container.appendChild(button);
            quickActionsSection.appendChild(container);
        }
    }

    toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    startListening() {
        if (!this.isSupported || !this.recognition) {
            this.showNotSupportedMessage();
            return;
        }

        try {
            this.recognition.start();
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            window.accessibilityManager.announce('Error starting voice commands. Please try again.');
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    onRecognitionStart() {
        this.isListening = true;
        window.accessibilityManager.updateVoiceStatus('Listening for commands...', true);
        window.accessibilityManager.announce('Voice commands active. Say a command or say "help" for available commands.');

        console.log('🎤 Started listening for voice commands');
    }

    onRecognitionResult(event) {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript.toLowerCase().trim();

        console.log('🎤 Heard:', transcript);

        // Add to history
        this.addToHistory(transcript);

        // Process the command
        this.processCommand(transcript);
    }

    onRecognitionError(event) {
        console.error('Speech recognition error:', event.error);

        let errorMessage = 'Voice command error. ';
        switch (event.error) {
            case 'no-speech':
                errorMessage += 'No speech detected.';
                break;
            case 'audio-capture':
                errorMessage += 'Audio capture failed.';
                break;
            case 'not-allowed':
                errorMessage += 'Microphone permission denied.';
                break;
            case 'network':
                errorMessage += 'Network error occurred.';
                break;
            default:
                errorMessage += 'Please try again.';
        }

        window.accessibilityManager.announce(errorMessage);
        window.accessibilityManager.updateVoiceStatus('Voice commands ready');
    }

    onRecognitionEnd() {
        this.isListening = false;
        window.accessibilityManager.updateVoiceStatus('Voice commands ready');
        console.log('🎤 Stopped listening for voice commands');
    }

    processCommand(transcript) {
        // Find matching command
        let action = null;
        let confidence = 0;

        for (const [command, commandAction] of Object.entries(this.commands)) {
            const similarity = this.calculateSimilarity(transcript, command);
            if (similarity > 0.8 && similarity > confidence) {
                action = commandAction;
                confidence = similarity;
            }
        }

        if (action) {
            this.executeCommand(action, transcript);
        } else {
            // No matching command found
            window.accessibilityManager.announce(`Command not recognized: ${transcript}. Say "help" for available commands.`);
        }
    }

    calculateSimilarity(text1, text2) {
        // Simple similarity calculation using Levenshtein distance
        const longer = text1.length > text2.length ? text1 : text2;
        const shorter = text1.length > text2.length ? text2 : text1;

        if (longer.length === 0) return 1.0;

        const distance = this.levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length;
    }

    levenshteinDistance(str1, str2) {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    executeCommand(action, originalTranscript) {
        console.log(`🎤 Executing voice command: ${action}`);

        // Announce the action
        window.accessibilityManager.announce(`Executing: ${originalTranscript}`);

        // Execute the appropriate action by triggering the corresponding function
        switch (action) {
            case 'captureScreen':
                if (window.captureManager) {
                    window.captureManager.captureScreen();
                } else {
                    window.accessibilityManager.announce('Capture manager not ready');
                }
                break;

            case 'startRecording':
                if (window.autoCaptureManager) {
                    window.autoCaptureManager.toggleVideoRecording();
                } else {
                    window.accessibilityManager.announce('Capture manager not ready');
                }
                break;

            case 'stopRecording':
                if (window.autoCaptureManager) {
                    window.autoCaptureManager.toggleVideoRecording();
                } else {
                    window.accessibilityManager.announce('Capture manager not ready');
                }
                break;

            case 'analyzeCapture':
                if (window.aiAnalyzer) {
                    window.aiAnalyzer.analyzeWithAI();
                } else {
                    window.accessibilityManager.announce('AI analyzer not ready');
                }
                break;

            case 'readAloud':
                if (window.accessibilityManager) {
                    window.accessibilityManager.handleReadAloud();
                }
                break;

            case 'saveCapture':
                if (window.captureManager) {
                    window.captureManager.saveCurrentCapture();
                } else {
                    window.accessibilityManager.announce('Capture manager not ready');
                }
                break;

            case 'speakStatus':
                if (window.accessibilityManager) {
                    window.accessibilityManager.handleSpeakStatus();
                }
                break;

            case 'clearAllCaptures':
                if (window.captureManager && confirm('Are you sure you want to clear all captures?')) {
                    window.captureManager.clearAllCaptures();
                }
                break;

            case 'exportAll':
                if (window.captureManager) {
                    window.captureManager.downloadAllAsHtml();
                } else {
                    window.accessibilityManager.announce('Capture manager not ready');
                }
                break;

            case 'showHelp':
                this.showAvailableCommands();
                break;

            case 'askQuestion':
                this.openAIConversation();
                break;

            default:
                window.accessibilityManager.announce(`Unknown action: ${action}`);
        }
    }

    addToHistory(command) {
        this.commandHistory.unshift({
            command,
            timestamp: new Date().toISOString()
        });

        if (this.commandHistory.length > this.maxHistorySize) {
            this.commandHistory.pop();
        }
    }

    showAvailableCommands() {
        const commands = Object.keys(this.commands);
        const commandList = commands.join(', ');

        window.accessibilityManager.announce(`Available commands: ${commandList}`);

        console.log('🎤 Available voice commands:', commands);
    }

    openAIConversation() {
        const aiConversation = document.getElementById('aiConversation');
        if (aiConversation) {
            aiConversation.style.display = 'block';
            const aiInput = document.getElementById('aiInput');
            if (aiInput) {
                aiInput.focus();
            }
            window.accessibilityManager.announce('AI conversation opened');
        }
    }

    showNotSupportedMessage() {
        // Only announce if user has activated speech synthesis
        if (window.accessibilityManager?.hasUserActivated) {
            window.accessibilityManager.announce('Voice commands not supported in this browser. Please use keyboard shortcuts or button clicks.');
        }

        const message = document.createElement('div');
        message.className = 'error';
        message.innerHTML = `
            <strong>Voice Commands Not Supported</strong><br>
            Your browser doesn't support speech recognition. You can still use:<br>
            • Alt+V: Toggle voice commands (when supported)<br>
            • Alt+R: Read description aloud<br>
            • Alt+S: Speak system status<br>
            • Tab: Navigate through interface
        `;

        const helpSection = document.querySelector('.help-section');
        if (helpSection) {
            helpSection.appendChild(message);
        }
    }

    getCommandHistory() {
        return this.commandHistory;
    }

    clearCommandHistory() {
        this.commandHistory = [];
        console.log('🎤 Command history cleared');
    }

    // Method to add new commands dynamically
    addCommand(phrase, action) {
        this.commands[phrase.toLowerCase()] = action;
        console.log(`🎤 Added voice command: "${phrase}" -> ${action}`);
    }

    // Method to remove commands
    removeCommand(phrase) {
        delete this.commands[phrase.toLowerCase()];
        console.log(`🎤 Removed voice command: "${phrase}"`);
    }
}

// Initialize voice command manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.voiceCommandManager = new VoiceCommandManager();
});

console.log('🎤 Voice commands module loaded');