# 🎬 Rapture - Screen Capture & AI Analysis Tool

RAP is an advanced web-based screen capture and recording tool featuring AI analysis, full-screen design, detailed processing information, and interactive AI conversation capabilities.

## ✨ Features

### 📸 Screen Capture
- **Screen Capture**: Capture your entire screen
- **Window Capture**: Capture specific application windows
- **Tab Capture**: Capture browser tabs
- **High Quality**: PNG format for crisp images

### 🎥 Video Recording
- **Screen Recording**: Record your screen with audio
- **Real-time Preview**: See what you're recording
- **WebM Format**: Modern, web-optimized video format
- **Start/Stop Controls**: Easy recording management

### 🤖 AI Analysis
- **Image Analysis**: AI-powered description of captured images
- **Video Analysis**: Intelligent video content analysis
- **Multiple Providers**: Support for Gemini, OpenAI, Claude (mock implementation)
- **Text-to-Speech**: Read AI descriptions aloud

### ☁️ Storage & Sharing
- **Local Storage**: Save captures to your device
- **Cloud Upload**: Upload to free cloud providers
- **Recent Captures Gallery**: Browse your capture history
- **Download Management**: Easy file management

### 🎨 User Interface
- **Modern Design**: Clean, responsive interface
- **Gradient Backgrounds**: Beautiful visual design
- **Mobile Responsive**: Works on all devices
- **Intuitive Controls**: Easy-to-use interface

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Screen recording permissions (for capture features)
- Internet connection (for AI analysis and cloud upload)

### Installation
1. Clone or download this repository
2. Open `index.html` in your web browser
3. Grant screen recording permissions when prompted
4. Start capturing!

### Local Development
To run with a local server (recommended for full functionality):

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server . -p 8000

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## 📖 Usage Guide

### Screen Capture
1. Click **"Capture Screen"**, **"Capture Window"**, or **"Capture Tab"**
2. Select the screen/window/tab you want to capture
3. The capture will appear in the preview area
4. Use AI analysis or save/upload as needed

### Video Recording
1. Click **"Start Recording"**
2. Select what you want to record (screen/window/tab)
3. Click **"Stop Recording"** when finished
4. The video will appear in the preview area

### AI Analysis
1. Capture or record something
2. Click **"Analyze with AI"**
3. Wait for the analysis to complete
4. Read the AI-generated description
5. Optionally click **"Read Description Aloud"** to hear it

### Storage Options
- **Save Locally**: Downloads the capture to your device
- **Upload to Cloud**: Uploads to a free cloud provider
- **Recent Captures**: View and manage your capture history

## 🔧 Technical Details

### Browser APIs Used
- **getDisplayMedia()**: Screen capture and recording
- **MediaRecorder**: Video recording functionality
- **ImageCapture**: Frame grabbing from video streams
- **Canvas API**: Image processing and conversion
- **Web Speech API**: Text-to-speech functionality
- **localStorage**: Local data persistence

### File Formats
- **Images**: PNG format for high quality
- **Videos**: WebM format for web optimization
- **Data URLs**: Base64 encoded for easy handling

### AI Integration (Mock)
The current implementation includes mock AI analysis. For production use, integrate with:
- **Google Gemini API**: Free tier available
- **OpenAI GPT-4**: Requires API key
- **Anthropic Claude**: Requires API key

### Cloud Storage (Mock)
Mock cloud upload functionality. For production, integrate with:
- **ImgBB**: Free image hosting
- **File.io**: Temporary file sharing
- **AnonFiles**: Anonymous file hosting

## 🛠️ Customization

### Adding Real AI APIs
To add real AI analysis, modify the `analyzeImage()` and `analyzeVideo()` methods in `script.js`:

```javascript
async analyzeImage(dataUrl, provider) {
    // Replace with actual API calls
    const response = await fetch(`https://api.example.com/analyze`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer YOUR_API_KEY',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: dataUrl })
    });
    return response.json();
}
```

### Adding Real Cloud Storage
To add real cloud upload, modify the `uploadImageToCloud()` and `uploadVideoToCloud()` methods:

```javascript
async uploadImageToCloud(dataUrl, provider) {
    // Replace with actual API calls
    const formData = new FormData();
    formData.append('image', dataUrl);
    
    const response = await fetch(`https://api.example.com/upload`, {
        method: 'POST',
        body: formData
    });
    return response.json();
}
```

## 🌟 Advanced Features

### Keyboard Shortcuts
- **Ctrl+S**: Save current capture
- **Ctrl+A**: Analyze with AI
- **Space**: Start/stop recording (when focused)

### Batch Processing
- Process multiple captures at once
- Bulk upload to cloud storage
- Export capture history

### Custom Themes
- Dark mode support
- Custom color schemes
- Responsive breakpoints

## 🔒 Privacy & Security

### Local Processing
- All captures are processed locally
- No data is sent to external servers without your permission
- Local storage is used for capture history

### Permissions
- Screen recording permissions are required
- Microphone permissions for audio recording
- No persistent permissions stored

### Data Handling
- Captures are stored locally in your browser
- Cloud uploads are optional and require your action
- No tracking or analytics

## 🐛 Troubleshooting

### Common Issues

**Screen capture not working:**
- Ensure you've granted screen recording permissions
- Try using HTTPS (required for some browsers)
- Check browser console for error messages

**AI analysis not working:**
- Check internet connection
- Verify API configuration (if using real APIs)
- Try refreshing the page

**Video recording issues:**
- Ensure sufficient disk space
- Check browser compatibility
- Try reducing recording quality

**Upload failures:**
- Check file size limits
- Verify internet connection
- Try different cloud provider

### Browser Compatibility
- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Limited support (no audio recording)
- **Edge**: Full support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style
- Use consistent indentation (2 spaces)
- Follow JavaScript best practices
- Add comments for complex logic
- Test across multiple browsers

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Browser vendors for implementing Screen Capture API
- Web standards community for HTML5 APIs
- Open source community for inspiration

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check the troubleshooting section
- Review browser console for errors

---

**Enjoy capturing and analyzing with Rapture!** 🎬✨
## ? New in Version 2.0.0  
  
### ?? Enhanced User Interface  
- **Full-Screen Design**: Optimized for complete viewport utilization  
- **Minimal Color Palette**: Reduced visual complexity for better focus  
- **Small Font Sizes**: Compact information density for detailed displays  
  
### ?? Advanced AI Features  
- **AI Conversation Mode**: Continue detailed conversations with AI about captures  
- **Thinking Indicators**: Visual feedback during AI processing  
- **Interactive Dialogue**: Ask follow-up questions about analysis results 
