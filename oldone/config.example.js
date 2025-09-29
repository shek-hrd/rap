// Rapture AI API Configuration Example
// Copy this file to config.js and add your actual API keys

const AI_CONFIG = {
    // Google Gemini API (Free tier available)
    gemini: {
        apiKey: 'YOUR_GEMINI_API_KEY_HERE',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        model: 'gemini-pro'
    },
    
    // OpenAI GPT-4 API (Requires API key)
    openai: {
        apiKey: 'YOUR_OPENAI_API_KEY_HERE',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-4-vision-preview'
    },
    
    // Anthropic Claude API (Requires API key)
    claude: {
        apiKey: 'YOUR_CLAUDE_API_KEY_HERE',
        endpoint: 'https://api.anthropic.com/v1/messages',
        model: 'claude-3-sonnet-20240229'
    }
};

const CLOUD_CONFIG = {
    // ImgBB - Free image hosting
    imgbb: {
        apiKey: 'YOUR_IMGBB_API_KEY_HERE',
        endpoint: 'https://api.imgbb.com/1/upload'
    },
    
    // File.io - Temporary file sharing
    fileio: {
        endpoint: 'https://file.io'
    },
    
    // AnonFiles - Anonymous file hosting
    anonfiles: {
        endpoint: 'https://api.anonfiles.com/upload'
    }
};

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AI_CONFIG, CLOUD_CONFIG };
}