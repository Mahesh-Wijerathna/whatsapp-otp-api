require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Client, RemoteAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(bodyParser.json());

let client;
let isWhatsAppReady = false;

// Initialize MongoDB and WhatsApp client
async function initializeApp() {
    try {
        // MongoDB connection
        await mongoose.connect('mongodb+srv://SoftwareProject:SoftwareProject@cluster0.r0hwfhg.mongodb.net/');
        console.log('Connected to MongoDB');

        const store = new MongoStore({ mongoose: mongoose });

        // WhatsApp client initialization
        client = new Client({
            authStrategy: new RemoteAuth({
                store: store,
                backupSyncIntervalMs: 300000
            }),
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

        client.on('remote_session_saved', () => {
            console.log('Remote session saved');
        });

        client.initialize();
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
        await client.sendMessage(chatId, `Your OTP is: ${otp}`);
        
        res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending OTP:', error);

        res.status(500).json({ success: false, message: 'Failed to send OTP', error: error.message });
    }
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    initializeApp();
});