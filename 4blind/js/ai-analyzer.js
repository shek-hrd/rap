/**
 * AI Analyzer Module for Rapture Accessible
 * Handles AI analysis with multiple providers including free alternatives
 */

class AIAnalyzer {
    constructor() {
        this.currentAnalysis = '';
        this.isAnalyzing = false;
        this.analysisHistory = [];
        this.apiKeys = new Map();

        this.init();
    }

    init() {
        this.loadAPIKeys();
        this.loadAnalysisHistory();
        this.setupEventListeners();

        console.log('🤖 AI Analyzer initialized');
    }

    loadAPIKeys() {
        try {
            const keys = JSON.parse(localStorage.getItem('raptureAPIKeys') || '{}');
            this.apiKeys = new Map(Object.entries(keys));
        } catch (error) {
            console.error('Error loading API keys:', error);
        }
    }

    loadAnalysisHistory() {
        try {
            this.analysisHistory = JSON.parse(localStorage.getItem('raptureAnalysisHistory') || '[]');
        } catch (error) {
            console.error('Error loading analysis history:', error);
            this.analysisHistory = [];
        }
    }

    saveAnalysisHistory() {
        localStorage.setItem('raptureAnalysisHistory', JSON.stringify(this.analysisHistory));
    }

    setupEventListeners() {
        // Listen for capture events
        document.addEventListener('capture:created', (e) => {
            if (e.detail && e.detail.capture) {
                this.currentCapture = e.detail.capture;
            }
        });
    }

    async analyzeWithAI(providerConfig = null) {
        if (this.isAnalyzing) {
            console.warn('⚠️ Analysis already in progress');
            return;
        }

        if (!this.currentCapture && !window.captureManager?.currentCapture) {
            window.accessibilityManager?.announceError('No capture available for analysis');
            return;
        }

        this.isAnalyzing = true;
        this.currentAnalysis = '';

        try {
            // Use provided provider or get available one
            const provider = providerConfig || await this.getAvailableProvider();

            if (!provider) {
                throw new Error('No available AI provider found');
            }

            console.log(`🤖 Starting analysis with ${provider.name}`);

            // Broadcast analysis started event
            window.dispatchEvent(new CustomEvent('analysis:started', {
                detail: { provider: provider.name }
            }));

            const analysis = await this.performAnalysis(provider);

            this.currentAnalysis = analysis;
            this.addToHistory(provider.name, analysis);

            // Broadcast completion event
            window.dispatchEvent(new CustomEvent('analysis:completed', {
                detail: { analysis, provider: provider.name }
            }));

            console.log(`✅ Analysis completed with ${provider.name}`);
            return analysis;

        } catch (error) {
            console.error('❌ Analysis failed:', error);

            // Try fallback provider
            const fallbackProvider = await this.getFallbackProvider();
            if (fallbackProvider) {
                console.log(`🔄 Retrying with fallback provider: ${fallbackProvider.name}`);
                try {
                    const analysis = await this.performAnalysis(fallbackProvider);
                    this.currentAnalysis = analysis;
                    this.addToHistory(fallbackProvider.name, analysis);

                    window.dispatchEvent(new CustomEvent('analysis:completed', {
                        detail: { analysis, provider: fallbackProvider.name }
                    }));

                    return analysis;
                } catch (fallbackError) {
                    console.error('❌ Fallback analysis also failed:', fallbackError);
                    throw fallbackError;
                }
            }

            throw error;
        } finally {
            this.isAnalyzing = false;
        }
    }

    async getAvailableProvider() {
        // Get provider configurations from main app
        const mainApp = window.raptureAccessible;
        if (!mainApp || !mainApp.aiProviders) {
            throw new Error('Main application not available');
        }

        // Try current provider first
        const currentProvider = mainApp.aiProviders.get(mainApp.currentAIProvider);
        if (currentProvider && await this.testProvider(currentProvider)) {
            return currentProvider;
        }

        // Try other providers
        for (const [key, provider] of mainApp.aiProviders) {
            if (key !== mainApp.currentAIProvider && await this.testProvider(provider)) {
                return provider;
            }
        }

        return null;
    }

    async getFallbackProvider() {
        const mainApp = window.raptureAccessible;
        if (!mainApp || !mainApp.aiProviders) return null;

        // Try free providers in order of preference
        const fallbackOrder = ['puter-gemini', 'axiom', 'aivision', 'huggingface'];

        for (const providerKey of fallbackOrder) {
            const provider = mainApp.aiProviders.get(providerKey);
            if (provider && await this.testProvider(provider)) {
                return provider;
            }
        }

        return null;
    }

    async testProvider(provider) {
        try {
            if (provider.requiresKey && !this.apiKeys.has(provider.name.toLowerCase().replace(/[^a-z0-9]/g, ''))) {
                return false;
            }

            // Special handling for Puter providers
            if (provider.endpoint.startsWith('puter://')) {
                return window.puter && window.puter.ai;
            }

            // Simple connectivity test
            const testPayload = {
                model: provider.model,
                messages: [{ role: 'user', content: 'test' }],
                max_tokens: 5
            };

            // Use appropriate endpoint based on provider
            let endpoint = provider.endpoint;
            if (provider.name.toLowerCase().includes('huggingface')) {
                endpoint = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';
            } else if (provider.name.toLowerCase().includes('axiom')) {
                endpoint = 'https://api.axiom.ai/v1/chat';
            } else if (provider.name.toLowerCase().includes('aivision')) {
                endpoint = 'https://api.aivision.com/v1/analyze';
            } else if (!endpoint.includes('/chat/completions') && !endpoint.includes('/generate')) {
                endpoint = `${endpoint}/chat/completions`;
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(provider.requiresKey ? {
                        'Authorization': `Bearer ${this.apiKeys.get(provider.name.toLowerCase().replace(/[^a-z0-9]/g, ''))}`
                    } : {})
                },
                body: JSON.stringify(testPayload)
            });

            return response.ok;
        } catch (error) {
            console.warn(`Provider ${provider.name} test failed:`, error);
            return false;
        }
    }

    async performAnalysis(provider) {
        const captureData = this.getCaptureData();
        const prompt = this.buildAnalysisPrompt(captureData);

        switch (provider.name.toLowerCase().replace(/[^a-z0-9]/g, '')) {
            case 'huggingface':
                return await this.analyzeWithHuggingFace(prompt);
            case 'axiom':
            case 'axiomai':
                return await this.analyzeWithAxiom(prompt);
            case 'aivision':
                return await this.analyzeWithAIVision(prompt);
            case 'putergemini':
            case 'googlegeminiputer':
                return await this.analyzeWithPuterGemini(prompt);
            case 'openai':
                return await this.analyzeWithOpenAI(prompt, provider);
            case 'anthropic':
                return await this.analyzeWithAnthropic(prompt, provider);
            case 'google':
                return await this.analyzeWithGoogle(prompt, provider);
            case 'cohere':
                return await this.analyzeWithCohere(prompt, provider);
            default:
                throw new Error(`Unsupported provider: ${provider.name}`);
        }
    }

    getCaptureData() {
        const capture = this.currentCapture || window.captureManager?.currentCapture;
        if (!capture) {
            throw new Error('No capture data available');
        }

        return {
            image: capture.dataUrl || capture.imageData,
            type: capture.type || 'screenshot',
            timestamp: capture.timestamp || new Date().toISOString(),
            name: capture.name || 'Untitled Capture'
        };
    }

    buildAnalysisPrompt(captureData) {
        return `Please analyze this ${captureData.type} and provide a detailed description of what you see. Describe:

1. The overall layout and structure
2. Any text content you can identify
3. Visual elements like buttons, images, or icons
4. The purpose or function this interface appears to serve
5. Any important information or actions available

Please be specific and thorough in your analysis, as this is for accessibility purposes to help blind users understand the content.`;
    }

    async analyzeWithHuggingFace(prompt) {
        // Use a simpler approach for Hugging Face free inference
        const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_length: 200,
                    temperature: 0.7,
                    return_full_text: false
                }
            })
        });

        if (!response.ok) {
            // If rate limited or unauthorized, return a fallback response
            if (response.status === 401 || response.status === 429) {
                console.warn('Hugging Face API rate limited or unauthorized, using fallback');
                return 'I can see this is a screen capture, but I\'m unable to provide a detailed analysis right now due to API limitations. Please try again later or use a different AI provider.';
            }
            throw new Error(`Hugging Face API error: ${response.status}`);
        }

        const data = await response.json();
        return data[0]?.generated_text || 'Analysis could not be completed';
    }

    async analyzeWithOpenAI(prompt, provider) {
        const apiKey = this.apiKeys.get('openai');
        if (!apiKey) {
            throw new Error('OpenAI API key not configured');
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: provider.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an accessibility assistant helping blind users understand screen content. Provide detailed, descriptive analysis of images and interfaces.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 300,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`OpenAI API error: ${error.error?.message || response.status}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || 'Analysis could not be completed';
    }

    async analyzeWithAnthropic(prompt, provider) {
        const apiKey = this.apiKeys.get('anthropic');
        if (!apiKey) {
            throw new Error('Anthropic API key not configured');
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: provider.model,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 300
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Anthropic API error: ${error.error?.message || response.status}`);
        }

        const data = await response.json();
        return data.content[0]?.text || 'Analysis could not be completed';
    }

    async analyzeWithGoogle(prompt, provider) {
        const apiKey = this.apiKeys.get('google');
        if (!apiKey) {
            throw new Error('Google API key not configured');
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${provider.model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ]
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Google API error: ${error.error?.message || response.status}`);
        }

        const data = await response.json();
        return data.candidates[0]?.content?.parts[0]?.text || 'Analysis could not be completed';
    }

    async analyzeWithCohere(prompt, provider) {
        const apiKey = this.apiKeys.get('cohere');
        if (!apiKey) {
            throw new Error('Cohere API key not configured');
        }

        const response = await fetch('https://api.cohere.ai/v1/generate', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: provider.model,
                prompt: prompt,
                max_tokens: 300,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Cohere API error: ${error.message || response.status}`);
        }

        const data = await response.json();
        return data.generations[0]?.text || 'Analysis could not be completed';
    }

    async analyzeWithAxiom(prompt) {
        try {
            const response = await fetch('https://api.axiom.ai/v1/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: prompt,
                    model: 'free-chat',
                    max_tokens: 300,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 429) {
                    return 'I can see this is a screen capture, but I\'m unable to provide a detailed analysis right now. Please try again later or use a different AI provider.';
                }
                throw new Error(`Axiom.ai API error: ${response.status}`);
            }

            const data = await response.json();
            return data.response || data.message || 'Analysis could not be completed';
        } catch (error) {
            console.warn('Axiom.ai analysis failed:', error);
            return 'I can see this is a screen capture, but I\'m unable to provide a detailed analysis right now. Please try again later or use a different AI provider.';
        }
    }

    async analyzeWithAIVision(prompt) {
        try {
            const response = await fetch('https://api.aivision.com/v1/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: prompt,
                    model: 'vision-model',
                    max_tokens: 300,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 429) {
                    return 'I can see this is a screen capture, but I\'m unable to provide a detailed analysis right now. Please try again later or use a different AI provider.';
                }
                throw new Error(`AI Vision API error: ${response.status}`);
            }

            const data = await response.json();
            return data.analysis || data.response || 'Analysis could not be completed';
        } catch (error) {
            console.warn('AI Vision analysis failed:', error);
            return 'I can see this is a screen capture, but I\'m unable to provide a detailed analysis right now. Please try again later or use a different AI provider.';
        }
    }

    async analyzeWithPuterGemini(prompt) {
        try {
            // Use Puter.js AI integration for free Gemini access
            if (window.puter && window.puter.ai) {
                const result = await window.puter.ai.chat({
                    model: 'gemini-pro',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an accessibility assistant helping blind users understand screen content. Provide detailed, descriptive analysis of images and interfaces.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 300,
                    temperature: 0.7
                });

                return result.text || result.message || 'Analysis could not be completed';
            } else {
                throw new Error('Puter.js AI not available');
            }
        } catch (error) {
            console.warn('Puter Gemini analysis failed:', error);
            return 'I can see this is a screen capture, but I\'m unable to provide a detailed analysis right now. Please try again later or use a different AI provider.';
        }
    }

    addToHistory(provider, analysis) {
        this.analysisHistory.unshift({
            provider,
            analysis,
            timestamp: new Date().toISOString(),
            captureName: this.currentCapture?.name || 'Unknown'
        });

        // Keep only last 50 analyses
        if (this.analysisHistory.length > 50) {
            this.analysisHistory = this.analysisHistory.slice(0, 50);
        }

        this.saveAnalysisHistory();
    }

    async readDescriptionAloud() {
        if (!this.currentAnalysis) {
            window.accessibilityManager?.announceError('No analysis available to read');
            return;
        }

        try {
            // Use Web Speech API for text-to-speech
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(this.currentAnalysis);
                utterance.rate = 0.9;
                utterance.pitch = 1;
                utterance.volume = 0.8;

                // Try to find a good voice
                const voices = speechSynthesis.getVoices();
                const preferredVoice = voices.find(voice =>
                    voice.lang.startsWith('en') && voice.name.includes('Female')
                ) || voices.find(voice => voice.lang.startsWith('en'));

                if (preferredVoice) {
                    utterance.voice = preferredVoice;
                }

                speechSynthesis.speak(utterance);
                console.log('🔊 Reading analysis aloud');
            } else {
                window.accessibilityManager?.announceError('Speech synthesis not supported');
            }
        } catch (error) {
            console.error('Read aloud failed:', error);
            window.accessibilityManager?.announceError('Failed to read analysis aloud');
        }
    }

    getAvailableProviders() {
        const mainApp = window.raptureAccessible;
        if (!mainApp || !mainApp.aiProviders) return [];

        return Array.from(mainApp.aiProviders.values()).filter(provider => {
            if (provider.requiresKey) {
                return this.apiKeys.has(provider.name.toLowerCase().replace(' ', ''));
            }
            return true;
        });
    }

    getAnalysisHistory() {
        return this.analysisHistory;
    }

    clearHistory() {
        this.analysisHistory = [];
        this.saveAnalysisHistory();
        console.log('🗑️ Analysis history cleared');
    }
}

// Initialize the AI analyzer
const aiAnalyzer = new AIAnalyzer();
window.aiAnalyzer = aiAnalyzer;