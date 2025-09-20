const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(htmlPath, 'utf8');

// Find the position before </main>
const mainEndIndex = content.indexOf('</main>');
if (mainEndIndex !== -1) {
  // Extract the extra malformed content after </html>
  const htmlEndIndex = content.indexOf('</html>');
  let extraContent = '';
  if (htmlEndIndex !== -1) {
    extraContent = content.substring(htmlEndIndex + 7).trim();
    // Clean up extraContent: fix emojis and structure
    extraContent = extraContent.replace(/<div class="explanation-section">[\s\S]*?<\/div>/, (match) => {
      return match.replace(/\?\? /g, '🎬 ').replace('?? ', '🎯 ');
    });
    extraContent = extraContent.replace(/<div class="processing-details"[\s\S]*?<\/div>/, (match) => match);
    extraContent = extraContent.replace(/<div class="ai-conversation"[\s\S]*?<\/div>/, (match) => match);
    extraContent = extraContent.replace(/<div class="ai-input-container"[\s\S]*?<\/div>/, (match) => match);
  }

  // Insert extraContent before </main>
  const beforeMainEnd = content.substring(0, mainEndIndex);
  const afterMainEnd = content.substring(mainEndIndex);
  content = beforeMainEnd + extraContent + afterMainEnd;

  // Remove the trailing extra content after </html>
  content = content.substring(0, content.indexOf('</html>') + 7);

  // Ensure </body> and </html> are properly placed
  if (content.includes('<script src="script.js"></script>')) {
    // Already good
  } else {
    content = content.replace('</body>', '    <script src="script.js"></script>\n</body>');
  }

  fs.writeFileSync(htmlPath, content);
  console.log('index.html fixed successfully!');
} else {
  console.log('Could not find </main> tag to insert content.');
}