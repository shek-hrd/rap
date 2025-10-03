/**
 * AI Analyzer Module for Rapture Accessible
 * Handles AI analysis with multiple providers including free alternatives
 */

class AIAnalyzer {
    constructor() {
        this.currentAnalysis = '';
        this.isAnalyzing = false;
        this.analysisHistory = [];
        this.aiProviders = {
            gemini: {
                name: 'Gemini (Google)',
                isFree: true,
                isConfigured: false,
                model: 'gemini-2.0-flash-lite-001'
            },
            huggingface: {
                name: 'Hugging Face (Free)',
                isFree: true,
                isConfigured: true, // No API key needed for basic models
                model: 'microsoft/DialoGPT-medium'
            },
            openai: {
                name: 'OpenAI GPT-4',
                isFree: false,
                isConfigured: false,
                model: 'gpt-4'
            }
        };

        this.init();
    }

    init() {
        this.checkPuterAvailability();
        this.setupEventListeners();
        this.loadAnalysisHistory();

        console.log('🤖 AI Analyzer initialized');
    }

    checkPuterAvailability() {
        // Check if Puter.js is available for Gemini access
        if (typeof puter !== 'undefined' && puter.ai && typeof puter.ai.chat === 'function') {
            this.aiProviders.gemini.isConfigured = true;
            console.log('✅ Puter.js available for Gemini access');
        } else {
            console.warn('❌ Puter.js not available for Gemini access');
        }
    }

    setupEventListeners() {
        // Analyze button
        const analyzeBtn = document.getElementById('analyzeCapture');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => {
                this.analyzeWithAI();
            });
        }

        // Read aloud button
        const readAloudBtn = document.getElementById('readAloud');
        if (readAloudBtn) {
            readAloudBtn.addEventListener('click', () => {
                this.readDescriptionAloud();
            });
        }

        // Re-analyze button
        const reanalyzeBtn = document.getElementById('reanalyze');
        if (reanalyzeBtn) {
            reanalyzeBtn.addEventListener('click', () => {
                this.reanalyzeWithDifferentAI();
            });
        }

        // AI provider selection
        const aiProviderSelect = document.getElementById('aiProviderSelect');
        if (aiProviderSelect) {
            aiProviderSelect.addEventListener('change', () => {
                this.onAIProviderChanged();
            });
        }
    }

    async analyzeWithAI() {
        if (!window.currentCapture) {
            window.accessibilityManager.announce('No capture available for analysis');
            return;
        }

        if (this.isAnalyzing) {
            window.accessibilityManager.announce('Analysis already in progress');
            return;
        }

        this.isAnalyzing = true;

        // Update UI
        const analyzeBtn = document.getElementById('analyzeCapture');
        if (analyzeBtn) {
            analyzeBtn.disabled = true;
            analyzeBtn.textContent = '🤖 Analyzing...';
        }

        // Show processing status
        window.accessibilityManager.announceAnalysisStart();

        try {
            const provider = document.getElementById('aiProviderSelect')?.value || 'gemini';
            let analysis = '';

            if (window.currentCapture.type === 'image') {
                analysis = await this.analyzeImage(window.currentCapture.dataUrl, provider);
            } else if (window.currentCapture.type === 'video') {
                analysis = await this.analyzeVideo(window.currentCapture.dataUrl, provider);
            }

            if (analysis) {
                this.displayAnalysis(analysis, provider);
                this.addToHistory(provider, analysis);
                window.accessibilityManager.announceAnalysisComplete(provider);

                // Return the analysis for console logging
                return analysis;
            } else {
                window.accessibilityManager.announceError('Analysis failed - no results returned');
                return null;
            }

        } catch (error) {
            console.error('AI analysis error:', error);
            window.accessibilityManager.announceError('Analysis failed: ' + error.message);
        } finally {
            this.isAnalyzing = false;

            // Reset UI
            if (analyzeBtn) {
                analyzeBtn.disabled = false;
                analyzeBtn.textContent = '🤖 Analyze with AI';
            }
        }
    }

    async analyzeImage(dataUrl, provider) {
        const providerConfig = this.aiProviders[provider];
        if (!providerConfig) {
            throw new Error(`Unknown AI provider: ${provider}`);
        }

        console.log(`🤖 Analyzing image with ${providerConfig.name}`);

        switch (provider) {
            case 'gemini':
                return await this.analyzeWithGemini(dataUrl);

            case 'huggingface':
                return await this.analyzeWithHuggingFace(dataUrl);

            case 'openai':
                return await this.analyzeWithOpenAI(dataUrl);

            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
    }

    async analyzeVideo(dataUrl, provider) {
        // For video analysis, we'll provide a general description
        // In a full implementation, you might extract frames or use video-capable AI
        const providerConfig = this.aiProviders[provider];

        console.log(`🤖 Analyzing video with ${providerConfig.name}`);

        const prompt = "This is a screen recording. Please provide an analysis of what might be shown in such a capture, including potential use cases and common elements.";

        switch (provider) {
            case 'gemini':
                return await this.analyzeWithGeminiText(prompt);

            case 'huggingface':
                return await this.analyzeWithHuggingFaceText(prompt);

            case 'openai':
                return await this.analyzeWithOpenAIText(prompt);

            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
    }

    async analyzeWithGemini(dataUrl) {
        if (!this.aiProviders.gemini.isConfigured) {
            return 'Gemini analysis requires Puter.js authentication. Please ensure Puter.js is loaded and try again.';
        }

        try {
            const response = await puter.ai.chat(
                "Analyze this image in detail for a blind user. Describe what you see, including any text, objects, people, colors, and context. Be thorough and specific.",
                dataUrl,
                {
                    model: this.aiProviders.gemini.model
                }
            );

            return response.message?.content || 'Analysis completed but no response text was returned.';
        } catch (error) {
            console.error('Gemini analysis failed:', error);
            return `Gemini analysis failed: ${error.message}. Please try a different AI provider.`;
        }
    }

    async analyzeWithHuggingFace(dataUrl) {
        try {
            // For image analysis with Hugging Face, we'll use their free inference API
            // Convert data URL to blob for upload
            const blob = this.dataUrlToBlob(dataUrl);

            // Use a free vision model
            const response = await fetch('https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Free anonymous access
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    image: dataUrl.split(',')[1], // Base64 data
                    max_new_tokens: 100
                })
            });

            if (!response.ok) {
                throw new Error(`Hugging Face API error: ${response.status}`);
            }

            const result = await response.json();

            // Enhance the basic caption with more detail
            const caption = result[0]?.generated_text || 'Image analysis completed but no description available.';
            return `Hugging Face analysis: ${caption}. This is a screen capture that may contain text, buttons, images, and other interface elements.`;
        } catch (error) {
            console.error('Hugging Face analysis failed:', error);
            return `Hugging Face analysis failed: ${error.message}. This may be due to API limits or network issues.`;
        }
    }

    async analyzeWithOpenAI(dataUrl) {
        const apiKey = localStorage.getItem('openai_api_key');
        if (!apiKey) {
            return 'OpenAI analysis requires an API key. Please set your OpenAI API key in the settings or use a free provider like Gemini or Hugging Face.';
        }

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.aiProviders.openai.model,
                    messages: [{
                        role: 'user',
                        content: [{
                            type: 'text',
                            text: "Analyze this image in detail for a blind user. Describe what you see, including any text, objects, people, colors, and context. Be thorough and specific."
                        }, {
                            type: 'image_url',
                            image_url: { url: dataUrl }
                        }]
                    }],
                    max_tokens: 300
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }

            const result = await response.json();
            return result.choices[0]?.message?.content || 'Analysis completed but no response text was returned.';
        } catch (error) {
            console.error('OpenAI analysis failed:', error);
            return `OpenAI analysis failed: ${error.message}. Please check your API key and try again.`;
        }
    }

    async analyzeWithGeminiText(prompt) {
        if (!this.aiProviders.gemini.isConfigured) {
            return 'Gemini analysis requires Puter.js authentication.';
        }

        try {
            const response = await puter.ai.chat(prompt, {
                model: this.aiProviders.gemini.model
            });

            return response.message?.content || 'Analysis completed but no response text was returned.';
        } catch (error) {
            console.error('Gemini text analysis failed:', error);
            return `Gemini analysis failed: ${error.message}`;
        }
    }

    async analyzeWithHuggingFaceText(prompt) {
        try {
            const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 150,
                        temperature: 0.7
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Hugging Face API error: ${response.status}`);
            }

            const result = await response.json();
            return result[0]?.generated_text || 'Analysis completed but no response text was returned.';
        } catch (error) {
            console.error('Hugging Face text analysis failed:', error);
            return `Hugging Face analysis failed: ${error.message}`;
        }
    }

    async analyzeWithOpenAIText(prompt) {
        const apiKey = localStorage.getItem('openai_api_key');
        if (!apiKey) {
            return 'OpenAI analysis requires an API key.';
        }

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.aiProviders.openai.model,
                    messages: [{
                        role: 'user',
                        content: prompt
                    }],
                    max_tokens: 200
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }

            const result = await response.json();
            return result.choices[0]?.message?.content || 'Analysis completed but no response text was returned.';
        } catch (error) {
            console.error('OpenAI text analysis failed:', error);
            return `OpenAI analysis failed: ${error.message}`;
        }
    }

    displayAnalysis(analysis, provider) {
        const aiDescription = document.getElementById('aiDescription');
        if (aiDescription) {
            aiDescription.value = analysis;
            this.currentAnalysis = analysis;
        }

        // Show AI conversation interface
        this.showAIConversation();

        // Enable read aloud button
        const readAloudBtn = document.getElementById('readAloud');
        if (readAloudBtn) {
            readAloudBtn.disabled = false;
        }

        console.log(`🤖 Analysis displayed from ${provider}`);
    }

    showAIConversation() {
        const aiConversation = document.getElementById('aiConversation');
        if (aiConversation) {
            aiConversation.style.display = 'block';
        }
    }

    getCurrentAnalysis() {
        return this.currentAnalysis;
    }

    getAnalysisHistory() {
        return this.analysisHistory;
    }

    readDescriptionAloud() {
        if (!this.currentAnalysis) {
            window.accessibilityManager.announce('No analysis available to read');
            return;
        }

        window.accessibilityManager.announce('Reading AI analysis: ' + this.currentAnalysis);
    }

    async reanalyzeWithDifferentAI() {
        const aiProviderSelect = document.getElementById('aiProviderSelect');
        if (!aiProviderSelect) return;

        // Cycle to next provider
        const providers = Object.keys(this.aiProviders);
        const currentIndex = providers.indexOf(aiProviderSelect.value);
        const nextIndex = (currentIndex + 1) % providers.length;
        aiProviderSelect.value = providers[nextIndex];

        // Trigger new analysis
        this.analyzeWithAI();
    }

    onAIProviderChanged() {
        const provider = document.getElementById('aiProviderSelect')?.value;
        if (provider && this.aiProviders[provider]) {
            const providerConfig = this.aiProviders[provider];
            let message = `Switched to ${providerConfig.name}`;

            if (!providerConfig.isConfigured) {
                message += '. Note: This provider may require additional configuration.';
            }

            window.accessibilityManager.announce(message);
            console.log(`🤖 AI provider changed to: ${provider}`);
        }
    }

    addToHistory(provider, analysis) {
        this.analysisHistory.unshift({
            provider,
            analysis: analysis.substring(0, 200) + '...', // Truncate for storage
            timestamp: new Date().toISOString(),
            fullAnalysis: analysis
        });

        // Keep only last 20 analyses
        if (this.analysisHistory.length > 20) {
            this.analysisHistory.pop();
        }

        this.saveAnalysisHistory();
    }

    saveAnalysisHistory() {
        localStorage.setItem('raptureAnalysisHistory', JSON.stringify(this.analysisHistory));
    }

    loadAnalysisHistory() {
        const history = localStorage.getItem('raptureAnalysisHistory');
        if (history) {
            try {
                this.analysisHistory = JSON.parse(history);
                console.log(`📚 Loaded ${this.analysisHistory.length} previous analyses`);
            } catch (error) {
                console.error('Error loading analysis history:', error);
            }
        }
    }

    dataUrlToBlob(dataUrl) {
        const parts = dataUrl.split(';base64,');
        const mimeType = parts[0].split(':')[1];
        const base64 = parts[1];
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    }

    getAvailableProviders() {
        return Object.entries(this.aiProviders)
            .filter(([key, config]) => config.isConfigured || config.isFree)
            .map(([key, config]) => ({
                key,
                name: config.name,
                isFree: config.isFree
            }));
    }

    getAnalysisHistory() {
        return this.analysisHistory;
    }
}

// Initialize AI analyzer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aiAnalyzer = new AIAnalyzer();
});

console.log('🤖 AI analyzer module loaded');