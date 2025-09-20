$content = Get-Content 'rap/script.js' -Raw

# Close the downloadCapture method after the if block
$content = $content -replace 'link\.click\(\);\s*(\s*)\}', 'link.click();$1\n    } // end downloadCapture method'

# Indent all methods after downloadCapture to 4 spaces (class level)
$content = $content -replace '(\s*)(stopRecording\(\) \{)', '    $2'  # Indent stopRecording
$content = $content -replace '(\s*)(handleRecording\(\) \{)', '    $2'  # Indent handleRecording
$content = $content -replace '(\s*)(showAiConversation\(\) \{)', '    $2'  # Indent showAiConversation
$content = $content -replace '(\s*)(showCloudDownloadLink\(url\) \{)', '    $2'  # Indent showCloudDownloadLink
$content = $content -replace '(\s*)(enableActionButtons\(\) \{)', '    $2'  # Indent enableActionButtons

# Fix emoji if still present
$content = $content -replace "'\?\? Start Recording'", "'⏺️ Start Recording'"

# Add class closing brace after the last method (enableActionButtons)
$content = $content -replace '(\s*enableActionButtons\(\) \{[\s\S]*?\}\s*)(\}\s*\/\/ Initialize)', '$1\n    } // end class RaptureCapture\n\n$2'

# Remove any extra closing braces before initialization
$content = $content -replace '(\s*\}\s*)\}\s*(\s*\/\/ Initialize)', '$1\n\n$2'

Set-Content 'rap/script.js' $content
Write-Host 'script.js method closure and structure fixed!'