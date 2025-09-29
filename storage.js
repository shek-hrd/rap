// Storage and Cloud Upload functionality
class StorageManager {
    constructor(raptureApp) {
        this.rapture = raptureApp;
    }



    dataUrlToBlob(dataUrl) {
        const parts = dataUrl.split(';base64,');
        const mimeType = parts[0].split(':')[1];
        const base64 = parts[1];
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    }

    async uploadToCloudProvider(provider, dataUrl) {
        let url = '';
        if (provider === 'imgbb') {
            const apiKey = 'YOUR_IMGBB_API_KEY';
            const blob = this.dataUrlToBlob(dataUrl);
            const formData = new FormData();
            formData.append('image', blob);
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            url = result.data.url;
        } else if (provider === 'imgur') {
            // Direct Imgur upload without CORS proxy
            const blob = this.dataUrlToBlob(dataUrl);
            const formData = new FormData();
            formData.append('image', blob);

            try {
                // Try direct upload first
                const response = await fetch('https://api.imgur.com/3/image', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Client-ID 546c25a59c58ad7'
                    },
                    body: formData
                });

                const result = await response.json();
                if (result.success) {
                    url = result.data.link;
                } else {
                    throw new Error(result.data.error || 'Imgur upload failed');
                }
            } catch (directError) {
                console.warn('Direct upload failed, trying base64 method:', directError);
                // Fallback: try with base64 data
                try {
                    const base64Data = dataUrl.split(',')[1];
                    const base64Response = await fetch('https://api.imgur.com/3/image', {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Client-ID 546c25a59c58ad7',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            image: base64Data,
                            type: 'base64'
                        })
                    });

                    const result = await base64Response.json();
                    if (result.success) {
                        url = result.data.link;
                    } else {
                        throw new Error(result.data.error || 'Imgur upload failed');
                    }
                } catch (base64Error) {
                    console.error('All Imgur upload methods failed:', base64Error);
                    throw new Error('Imgur upload failed. Please try a different provider.');
                }
            }
        } else if (provider === 'fileio') {
            const blob = this.dataUrlToBlob(dataUrl);
            const formData = new FormData();
            formData.append('file', blob);
            const response = await fetch('https://file.io/', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            url = result.link;
        } else if (provider === 'anonfiles') {
            const blob = this.dataUrlToBlob(dataUrl);
            const formData = new FormData();
            formData.append('file', blob);
            const response = await fetch('https://api.anonfiles.com/upload', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            url = `https://${result.files[0].url.short}`;
        }
        return url;
    }
}