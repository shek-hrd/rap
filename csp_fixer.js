const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(htmlPath, 'utf8');

// Find the end of <head> section
const headEndIndex = content.indexOf('</head>');
if (headEndIndex !== -1) {
  const cspMeta = '\n    <meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data: blob:; media-src \'self\' blob:; connect-src \'self\';">';
  content = content.slice(0, headEndIndex) + cspMeta + content.slice(headEndIndex);
  fs.writeFileSync(htmlPath, content);
  console.log('CSP meta tag added to index.html successfully!');
} else {
  console.log('Could not find </head> tag.');
}