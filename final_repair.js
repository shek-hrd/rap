const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, 'script.js');
let content = fs.readFileSync(scriptPath, 'utf8');

// Find the position after downloadCapture and before the first outer method
const downloadEnd = content.indexOf('}', content.indexOf('downloadCapture(id) {'));
const outerMethodsStart = content.indexOf('stopRecording() {', downloadEnd);

// Extract outer methods
let outerMethods = '';
if (outerMethodsStart !== -1) {
  const classEnd = content.indexOf('}', outerMethodsStart);
  outerMethods = content.substring(outerMethodsStart, classEnd);
  // Fix emoji
  outerMethods = outerMethods.replace(/textContent = '?? Start Recording'/, "textContent = '⏺️ Start Recording'");
  // Fix indentation for class methods
  outerMethods = outerMethods.replace(/^ {4}/gm, '    ');
}

// Insert outerMethods before the class closing brace
const classClosing = content.indexOf('}', downloadEnd);
content = content.substring(0, classClosing) + '\n' + outerMethods + '\n' + content.substring(classClosing);

// Remove the outer methods section
content = content.substring(0, outerMethodsStart) + content.substring(classEnd);

// Remove duplicate closing brace (the second })
content = content.replace(/(\s*\}\s*\}\s*\/\/ Initialize the application)/, '} // class end\n\n// Initialize the application');

// Ensure enableActionButtons is inside and properly closed
content = content.replace(/enableActionButtons\(\) \{[\s\S]*?\}\s*\}\s*(\}\s*\/\/ Initialize)/, 'enableActionButtons() {\n        this.analyzeBtn.disabled = false;\n        this.uploadCloudBtn.disabled = false;\n    }\n} // class end\n\n$1');

// Write back
fs.writeFileSync(scriptPath, content);
console.log('script.js final repair completed!');