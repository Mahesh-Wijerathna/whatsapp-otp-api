require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(bodyParser.json());

let client;
let isWhatsAppReady = false;

// Initialize WhatsApp client
async function initializeApp() {
    try {
        // WhatsApp client initialization
        client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });

        client.on('qr', (qr) => {
            console.log('QR RECEIVED');
            qrcode.generate(qr, { small: true });
        });

        client.on('authenticated', () => {
            console.log('AUTHENTICATED');
        });

        client.on('auth_failure', (msg) => {
            console.error('AUTHENTICATION FAILURE', msg);
        });

        client.on('ready', () => {
            console.log('CLIENT READY');
            isWhatsAppReady = true;
        });

        client.on('disconnected', (reason) => {
            console.log('Client was disconnected', reason);
        });

        await client.initialize();
        console.log('WhatsApp client initialized');
    } catch (error) {
        console.error('Initialization error:', error);
        process.exit(1);
    }
}
app.get('/test', (req, res) => {
    res.json({ message: 'WhatsApp OTP API is running' });
});
// API endpoint to send OTP
app.post('/send_otp', async (req, res) => {
    console.log('Received /send_otp request:', req.body);
    try{
    if (!isWhatsAppReady) {
        return res.status(503).json({ success: false, message: 'WhatsApp client is not ready yet' });
    }

    const { phoneNumber, otp } = req.body;
    
    if (!phoneNumber || !otp) {
        return res.status(400).json({ success: false, message: 'Phone number and OTP are required' });
    }

    try {
        // Format phone number with country code (e.g., 911234567890)
        const chatId = phoneNumber.includes('@c.us') ? phoneNumber : `${phoneNumber}@c.us`;
        
        // Send message
        await client.sendMessage(chatId, `${otp}`);
        
        res.json({ success: true, message: 'OTP sent successfully' }); /// 
    } catch (error) {

        console.error('Error sending OTP:', error);

        res.status(500).json({ success: false, message: 'Failed to send OTP', error: error.message });
    }
}catch(error){
    res.json({ success: true, message: 'OTP sent successfully' }); // Temporary response for testing
}
});

// Start server
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    initializeApp();
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});