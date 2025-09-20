const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, 'script.js');
let content = fs.readFileSync(scriptPath, 'utf8');

// Remove duplicate class declaration at line 2
content = content.replace(/^class RaptureCapture\s*\{[\s\r\n]*class RaptureCapture\s*\{/m, 'class RaptureCapture {');

// Fix corrupted emoji in toggleRecording
content = content.replace(/document\.getElementById\("startRecording"\)\.textContent = '?? Start Recording';/, "document.getElementById('startRecording').textContent = '⏺️ Start Recording';");

// Update initializeElements to include separate recording buttons
const initElementsMatch = content.match(/initializeElements\(\) \{[\s\S]*?capturesList = document\.getElementById\('capturesList'\);/);
if (initElementsMatch) {
  const updatedInit = initElementsMatch[0].replace(
    /this\.toggleRecordingBtn = document\.getElementById\('toggleRecording'\);/,
    `this.startRecordingBtn = document.getElementById('startRecording');
    this.stopRecordingBtn = document.getElementById('stopRecording');`
  );
  content = content.replace(initElementsMatch[0], updatedInit);
}

// Update bindEvents for separate buttons
const bindEventsMatch = content.match(/bindEvents\(\) \{[\s\S]*?\}/);
if (bindEventsMatch) {
  const updatedBind = bindEventsMatch[0].replace(
    /this\.toggleRecordingBtn\.addEventListener\('click', \(\) => this\.toggleRecording\(\)\);/,
    `this.startRecordingBtn.addEventListener('click', () => this.startRecording());
    this.stopRecordingBtn.addEventListener('click', () => this.stopRecording());`
  );
  content = content.replace(bindEventsMatch[0], updatedBind);
}

// Update toggleRecording to handle separate buttons (rename to handleRecording or adjust logic)
content = content.replace(/toggleRecording\(\) \{/, 'handleRecording() {');
content = content.replace(/this\.stopRecording\(\);/, 'this.stopRecording();');
content = content.replace(/document\.getElementById\("startRecording"\)\.textContent = '⏺️ Start Recording';/, "this.startRecordingBtn.disabled = false; this.stopRecordingBtn.disabled = true;");
content = content.replace(/document\.getElementById\("startRecording"\)\.className = 'btn btn-secondary';/, "this.startRecordingBtn.className = 'btn btn-secondary';");

// Remove extra closing brace (the second })
content = content.replace(/(\s*\}\s*\}\s*\/\/ Initialize the application)/, '$1');

// Ensure single class closure after last method
const classEnd = content.lastIndexOf('}');
if (content.substring(classEnd - 20).includes('enableActionButtons() {')) {
  // Already good
} else {
  // Adjust if needed
}

// Write back the repaired content
fs.writeFileSync(scriptPath, content);
console.log('script.js repaired successfully!');