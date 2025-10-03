/**
 * Accessibility Module for Rapture Accessible
 * Handles screen reader support, announcements, and keyboard navigation
 */

class AccessibilityManager {
    constructor() {
        this.speechSynthesis = window.speechSynthesis;
        this.announcementQueue = [];
        this.isAnnouncing = false;
        this.voiceStatusElement = null;
        this.statusAnnouncementsElement = null;
        this.hasUserActivated = false;

        this.init();
    }

    init() {
        // Get DOM elements
        this.voiceStatusElement = document.getElementById('voice-status');
        this.statusAnnouncementsElement = document.querySelector('.status-announcements');
        this.announcementsListElement = document.getElementById('announcementsList');

        // Initialize speech synthesis
        this.initSpeechSynthesis();

        // Add keyboard navigation
        this.initKeyboardNavigation();

        // Add focus management
        this.initFocusManagement();

        // Track user activation for speech synthesis
        this.trackUserActivation();

        // Setup announcements clear button
        this.setupAnnouncementsClearButton();

        console.log('🔧 Accessibility Manager initialized');
    }

    initSpeechSynthesis() {
        // Check if speech synthesis is available
        if (!this.speechSynthesis) {
            console.warn('Speech synthesis not available');
            return;
        }

        // Set up voice preferences
        this.speechSynthesis.onvoiceschanged = () => {
            this.updateVoices();
        };

        this.updateVoices();
    }

    updateVoices() {
        const voices = this.speechSynthesis.getVoices();
        // Prefer female voices for better clarity
        this.preferredVoice = voices.find(voice =>
            voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female')
        ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
    }

    initKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Handle keyboard shortcuts
            if (e.ctrlKey || e.altKey) {
                switch (e.key.toLowerCase()) {
                    case 'c':
                        if (e.ctrlKey) {
                            e.preventDefault();
                            this.announce('Use Alt+C for capture, Ctrl+C is for copy');
                        }
                        break;
                    case 'r':
                        if (e.altKey) {
                            e.preventDefault();
                            this.handleReadAloud();
                        }
                        break;
                    case 's':
                        if (e.altKey) {
                            e.preventDefault();
                            this.handleSpeakStatus();
                        }
                        break;
                }
            }

            // Handle escape key
            if (e.key === 'Escape') {
                this.handleEscape();
            }
        });
    }

    initFocusManagement() {
        // Ensure focus is visible
        document.addEventListener('focusin', (e) => {
            if (e.target.matches('button, input, select, textarea')) {
                this.announceElementFocused(e.target);
            }
        });

        // Trap focus in modal-like elements
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
        });
    }

    handleTabNavigation(e) {
        const focusableElements = document.querySelectorAll(
            'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    announce(message, priority = 'medium') {
        const announcement = {
            message,
            priority,
            timestamp: Date.now()
        };

        this.announcementQueue.push(announcement);
        this.processAnnouncementQueue();
    }

    processAnnouncementQueue() {
        if (this.isAnnouncing || this.announcementQueue.length === 0) {
            return;
        }

        const announcement = this.announcementQueue.shift();
        this.speakAnnouncement(announcement);
    }

    speakAnnouncement(announcement) {
        // Always display visually first
        this.displayAnnouncement(announcement.message);

        if (!this.speechSynthesis) {
            return;
        }

        this.isAnnouncing = true;

        const utterance = new SpeechSynthesisUtterance(announcement.message);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;

        if (this.preferredVoice) {
            utterance.voice = this.preferredVoice;
        }

        utterance.onend = () => {
            this.isAnnouncing = false;
            setTimeout(() => this.processAnnouncementQueue(), 100);
        };

        utterance.onerror = (error) => {
            console.error('Speech synthesis error:', error);
            this.isAnnouncing = false;
            setTimeout(() => this.processAnnouncementQueue(), 100);
        };

        // Only speak if user has interacted with the page
        if (this.hasUserActivated) {
            if (this.speechSynthesis.speaking) {
                this.speechSynthesis.cancel();
            }

            try {
                this.speechSynthesis.speak(utterance);
            } catch (error) {
                console.error('Speech synthesis failed:', error);
            }
        }
    }

    displayAnnouncement(message) {
        // Add to screen reader announcements (hidden)
        if (this.statusAnnouncementsElement) {
            const announcementDiv = document.createElement('div');
            announcementDiv.className = 'announcement';
            announcementDiv.textContent = message;
            announcementDiv.setAttribute('aria-live', 'polite');

            this.statusAnnouncementsElement.appendChild(announcementDiv);

            // Remove after 5 seconds
            setTimeout(() => {
                if (announcementDiv.parentNode) {
                    announcementDiv.parentNode.removeChild(announcementDiv);
                }
            }, 5000);
        }

        // Add to visible announcements list at bottom
        if (this.announcementsListElement) {
            const announcementItem = document.createElement('div');
            announcementItem.className = 'announcement-item';
            announcementItem.textContent = message;
            announcementItem.setAttribute('role', 'listitem');

            // Add timestamp
            const timestamp = document.createElement('small');
            timestamp.style.opacity = '0.7';
            timestamp.textContent = ` (${new Date().toLocaleTimeString()})`;
            announcementItem.appendChild(timestamp);

            this.announcementsListElement.appendChild(announcementItem);

            // Auto-scroll to bottom
            this.announcementsListElement.scrollTop = this.announcementsListElement.scrollHeight;

            // Limit to 50 announcements
            while (this.announcementsListElement.children.length > 50) {
                this.announcementsListElement.removeChild(this.announcementsListElement.firstChild);
            }
        }
    }

    announceElementFocused(element) {
        const label = element.getAttribute('aria-label') ||
                     element.textContent ||
                     element.placeholder ||
                     'Element focused';

        if (element.matches('button')) {
            this.announce(`Button focused: ${label}`);
        } else if (element.matches('input[type="text"]')) {
            this.announce(`Text input focused: ${label}`);
        } else if (element.matches('select')) {
            this.announce(`Dropdown focused: ${label}`);
        }
    }

    handleReadAloud() {
        const aiDescription = document.getElementById('aiDescription');
        if (aiDescription && aiDescription.value) {
            this.announce('Reading AI analysis: ' + aiDescription.value);
        } else {
            this.announce('No analysis available to read');
        }
    }

    handleSpeakStatus() {
        const storageUsed = document.getElementById('storageUsed').textContent;
        const storageQuota = document.getElementById('storageQuota').textContent;
        const memoryUsage = document.getElementById('memoryUsage').textContent;
        const capturesCount = document.getElementById('capturesCount').textContent;

        const status = `System Status: Storage used: ${storageUsed}, Quota: ${storageQuota}, Memory: ${memoryUsage}, Captures: ${capturesCount}`;
        this.announce(status);
    }

    handleEscape() {
        // Cancel current speech
        if (this.speechSynthesis) {
            this.speechSynthesis.cancel();
        }

        // Close any open modals or dialogs
        const aiConversation = document.getElementById('aiConversation');
        if (aiConversation && aiConversation.style.display !== 'none') {
            aiConversation.style.display = 'none';
            this.announce('AI conversation closed');
        }
    }

    updateVoiceStatus(message, isListening = false) {
        if (this.voiceStatusElement) {
            this.voiceStatusElement.textContent = message;
            this.voiceStatusElement.classList.toggle('listening', isListening);
            this.voiceStatusElement.setAttribute('aria-label', `Voice status: ${message}`);
        }
    }

    announceCaptureSuccess(filename, type) {
        this.announce(`Capture successful: ${type} saved as ${filename}`);
    }

    announceAnalysisStart() {
        this.announce('Starting AI analysis of capture');
    }

    announceAnalysisComplete(provider) {
        this.announce(`AI analysis complete using ${provider}`);
    }

    announceError(error) {
        this.announce(`Error: ${error}`);
    }

    announceButtonAction(buttonText) {
        this.announce(`Activated: ${buttonText}`);
    }

    // High contrast mode detection and handling
    detectHighContrastMode() {
        return window.matchMedia('(prefers-contrast: high)').matches;
    }

    // Reduced motion detection and handling
    detectReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // Screen reader detection
    detectScreenReader() {
        return window.navigator.userAgent.includes('NVDA') ||
               window.navigator.userAgent.includes('JAWS') ||
               window.navigator.userAgent.includes('VoiceOver') ||
               window.navigator.userAgent.includes('TalkBack');
    }

    // Update UI based on accessibility preferences
    updateAccessibilityPreferences() {
        const isHighContrast = this.detectHighContrastMode();
        const isReducedMotion = this.detectReducedMotion();
        const usesScreenReader = this.detectScreenReader();

        document.body.classList.toggle('high-contrast', isHighContrast);
        document.body.classList.toggle('reduced-motion', isReducedMotion);
        document.body.classList.toggle('screen-reader', usesScreenReader);

        if (usesScreenReader) {
            this.announce('Screen reader detected. Enhanced accessibility mode enabled.');
        }
    }

    // Track user activation for speech synthesis
    trackUserActivation() {
        const userActivationEvents = ['click', 'keydown', 'touchstart'];

        userActivationEvents.forEach(event => {
            document.addEventListener(event, () => {
                this.hasUserActivated = true;
            }, { once: true });
        });
    }

    // Setup announcements clear button
    setupAnnouncementsClearButton() {
        const clearBtn = document.getElementById('clearAnnouncements');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearAnnouncements();
            });
        }
    }

    // Clear all announcements
    clearAnnouncements() {
        if (this.announcementsListElement) {
            this.announcementsListElement.innerHTML = '';
            this.announce('Announcements cleared');
        }
    }
}

// Initialize accessibility manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.accessibilityManager = new AccessibilityManager();
});

console.log('🔧 Accessibility module loaded');