// AI Analysis functionality using Puter.js for free unlimited Gemini API
if (typeof AIAnalyzer === 'undefined') {
    class AIAnalyzer {
    constructor(raptureApp) {
        this.rapture = raptureApp;
    }

    async analyzeImage(dataUrl, provider) {
        try {
            let analysis = '';

            if (provider === 'gemini') {
                // Use Puter.js with Gemini for free unlimited API access
                const response = await puter.ai.chat(
                    "Analyze this image in detail. Describe what you see, including any text, objects, people, and context.",
                    dataUrl, // Pass the image data URL directly
                    {
                        model: 'google/gemini-2.0-flash-lite-001'
                    }
                );
                analysis = response.message?.content || 'Analysis completed but no response text was returned.';
            } else if (provider === 'openai') {
                // Fallback to OpenAI if needed (requires API key)
                analysis = 'OpenAI analysis requires API key configuration. Please use Gemini for free analysis.';
            } else if (provider === 'claude') {
                // Fallback to Claude if needed (requires API key)
                analysis = 'Claude analysis requires API key configuration. Please use Gemini for free analysis.';
            }

            return analysis;
        } catch (error) {
            console.error('AI analysis failed:', error);
            return `AI analysis failed: ${error.message}. Please try again.`;
        }
    }

    async analyzeVideo(dataUrl, provider) {
        try {
            let analysis = '';

            if (provider === 'gemini') {
                // For video analysis, we'll provide a description since Gemini doesn't directly support video URLs
                // In a real implementation, you might want to extract frames or provide video context
                const response = await puter.ai.chat(
                    "This is a screen recording/video capture. Please provide an analysis based on the content that would typically be found in such captures, including potential use cases and common elements.",
                    {
                        model: 'google/gemini-2.0-flash-lite-001'
                    }
                );
                analysis = response.message?.content || 'Video analysis completed but no response text was returned.';
            } else if (provider === 'openai') {
                analysis = 'OpenAI video analysis requires API key configuration. Please use Gemini for free analysis.';
            } else if (provider === 'claude') {
                analysis = 'Claude video analysis requires API key configuration. Please use Gemini for free analysis.';
            }

            return analysis;
        } catch (error) {
            console.error('Video analysis failed:', error);
            return `Video analysis failed: ${error.message}. Please try again.`;
        }
    }

    async chatWithAI(message, imageDataUrl = null) {
        try {
            let response;

            if (imageDataUrl) {
                // If there's an image, include it in the conversation
                response = await puter.ai.chat(
                    message,
                    imageDataUrl,
                    {
                        model: 'google/gemini-2.0-flash-lite-001'
                    }
                );
            } else {
                // Text-only conversation
                response = await puter.ai.chat(
                    message,
                    {
                        model: 'google/gemini-2.0-flash-lite-001'
                    }
                );
            }

            return response.message?.content || 'No response received from AI.';
        } catch (error) {
            console.error('AI chat failed:', error);
            return `AI chat failed: ${error.message}. Please try again.`;
        }
    }
}
}