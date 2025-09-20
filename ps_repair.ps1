$content = Get-Content 'rap/script.js' -Raw

# Add semicolon after downloadCapture
$content = $content -replace 'link\.click\(\);\s*(\s*if \(capture\) \{)', 'link.click(); } // end downloadCapture\n$1'

# Fix emoji
$content = $content -replace "'\?\? Start Recording'", "'⏺️ Start Recording'"

# Indent the outer methods to make them class members (add 4 spaces)
$content = $content -replace '(\s*)stopRecording\(\) \{', '    $1stopRecording() {'

$content = $content -replace '(\s*)handleRecording\(\) \{', '    $1handleRecording() {'

$content = $content -replace '(\s*)showAiConversation\(\) \{', '    $1showAiConversation() {'

$content = $content -replace '(\s*)showCloudDownloadLink\(url\) \{', '    $1showCloudDownloadLink(url) {'

$content = $content -replace '(\s*)enableActionButtons\(\) \{', '    $1enableActionButtons() {'

# Add class closing brace after the last method before initialization
$content = $content -replace '(\s*enableActionButtons\(\) \{[\s\S]*?\}\s*)(\}\s*\/\/ Initialize)', '$1}\n} // class end\n\n$2'

# Remove extra closing brace
$content = $content -replace '\}\s*(\}\s*\/\/ Initialize)', '} // class end\n\n$1'

Set-Content 'rap/script.js' $content
Write-Host 'script.js repaired with PowerShell!'