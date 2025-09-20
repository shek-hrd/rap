const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, 'script.js');
let content = fs.readFileSync(scriptPath, 'utf8');

// Find the end of the class (last } before the outer toggleRecording)
const classEndMatch = content.match(/(\s*downloadCapture\(id\) \{[\s\S]*?\}\s*)\}(\s*\/\/ Initialize the application)/);
if (classEndMatch) {
  const classBody = classEndMatch[1];
  const afterClass = classEndMatch[2];
  
  // Extract toggleRecording method
  const toggleMatch = content.match(/(\s*toggleRecording\(\) \{[\s\S]*?\}\s*)/);
  let toggleCode = '';
  if (toggleMatch) {
    toggleCode = toggleMatch[1].replace(/this\.toggleRecordingBtn/g, 'document.getElementById("startRecording")'); // Adapt for separate buttons if needed
  }
  
  // Extract and clean other methods
  const showAiMatch = content.match(/(\s*showAiConversation\(\) \{[\s\S]*?\}\s*)/);
  const showAiCode = showAiMatch ? showAiMatch[1] : '    showAiConversation() { console.log("AI conversation shown"); }\n';
  
  const showCloudMatch = content.match(/(\s*showCloudDownloadLink\(url\) \{[\s\S]*?\}\s*)/);
  const showCloudCode = showCloudMatch ? showCloudMatch[1] : '    showCloudDownloadLink(url) { console.log("Cloud link:", url); }\n';
  
  // Fixed console logs
  const fixedLogs = `// Initialize the application
const rapture = new RaptureCapture();

console.log('🎬 Rapture Screen Capture & AI Analysis Tool initialized!');
console.log('📸 Features: Screen capture, Video recording, AI analysis, Cloud upload');
console.log('🔧 Usage: Click capture buttons to start, then analyze with AI or save/upload');`;
  
  // Reconstruct: class up to downloadCapture, add new methods, close class, add fixed logs
  content = content.replace(/class RaptureCapture \{[\s\S]*?downloadCapture\(id\) \{[\s\S]*?\}\s*\}/, 
    `class RaptureCapture {
${content.match(/class RaptureCapture \{[\s\S]*?downloadCapture\(id\) \{[\s\S]*?\}/)[0]}
    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
    }

${toggleCode.trim()}

${showAiCode.trim()}

${showCloudCode.trim()}

    enableActionButtons() {
        this.analyzeBtn.disabled = false;
        this.uploadCloudBtn.disabled = false;
    }
}`);
  
  // Remove everything after the class and add fixed logs
  content = content.replace(/\/\/ Initialize the application[\s\S]*$/, fixedLogs);
  
  fs.writeFileSync(scriptPath, content);
  console.log('script.js fixed successfully!');
} else {
  console.log('Could not find class structure to fix.');
}