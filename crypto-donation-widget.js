const wallets = {
    '0x6f602be9fccf656c8c3e9f36d2064d580264b393': {
        name: 'Main Wallet',
        networks: {
            'ethereum': { name: 'Ethereum', symbol: 'ETH', address: '0x6f602be9fccf656c8c3e9f36d2064d580264b393' },
            'polygon': { name: 'Polygon', symbol: 'MATIC', address: '0x6f602be9fccf656c8c3e9f36d2064d580264b393' },
            'bsc': { name: 'BSC', symbol: 'BNB', address: '0x6f602be9fccf656c8c3e9f36d2064d580264b393' },
            'arbitrum': { name: 'Arbitrum', symbol: 'ETH', address: '0x6f602be9fccf656c8c3e9f36d2064d580264b393' }
        }
    },
    '0x61e7081E11BBA442781f8676C78533441C52f075': {
        name: 'Secondary Wallet',
        networks: {
            'ethereum': { name: 'Ethereum', symbol: 'ETH', address: '0x61e7081E11BBA442781f8676C78533441C52f075' },
            'polygon': { name: 'Polygon', symbol: 'MATIC', address: '0x61e7081E11BBA442781f8676C78533441C52f075' },
            'bsc': { name: 'BSC', symbol: 'BNB', address: '0x61e7081E11BBA442781f8676C78533441C52f075' },
            'arbitrum': { name: 'Arbitrum', symbol: 'ETH', address: '0x61e7081E11BBA442781f8676C78533441C52f075' }
        }
    }
};

let currentAmount = 0;
let selectedWallet = '';

function donate(amount) {
    currentAmount = amount;
    const walletKeys = Object.keys(wallets);
    selectedWallet = walletKeys[0]; // Default to first wallet

    showWalletInfo();
}

function showWalletInfo() {
    const widget = document.getElementById('wallet-info');
    const networksDiv = document.getElementById('networks');
    const addressDiv = document.getElementById('wallet-address');

    widget.style.display = 'block';
    networksDiv.innerHTML = '';

    // Create network buttons
    Object.keys(wallets[selectedWallet].networks).forEach(network => {
        const btn = document.createElement('button');
        btn.textContent = wallets[selectedWallet].networks[network].symbol;
        btn.className = 'network-btn';
        btn.onclick = () => selectNetwork(network);
        networksDiv.appendChild(btn);
    });

    // Show first network by default
    selectNetwork(Object.keys(wallets[selectedWallet].networks)[0]);
}

function selectNetwork(network) {
    const address = wallets[selectedWallet].networks[network].address;
    document.getElementById('wallet-address').textContent = address;

    // Update button styles
    const buttons = document.querySelectorAll('#networks .network-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

function selectWallet(walletKey) {
    selectedWallet = walletKey;
    showWalletInfo();
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const original = event.target.textContent;
        event.target.textContent = 'Copied!';
        event.target.classList.add('copied');
        setTimeout(() => {
            event.target.textContent = original;
            event.target.classList.remove('copied');
        }, 1000);
    });
}

function toggleWidget() {
    const widget = document.getElementById('crypto-donation-widget');
    if (widget.style.display === 'none') {
        widget.style.display = 'block';
        document.getElementById('toggle-btn').textContent = '✕';
    } else {
        widget.style.display = 'none';
        document.getElementById('toggle-btn').textContent = '💝';
    }
}

// Initialize widget when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add toggle functionality to the close button
    const toggleBtn = document.getElementById('toggle-btn');
    if (toggleBtn) {
        toggleBtn.onclick = toggleWidget;
    }
});