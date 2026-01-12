require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// Initialize WhatsApp client
app.get('/test', (req, res) => {
    res.json({ message: 'WhatsApp OTP API is running' });
});
// API endpoint to send OTP
app.post('/send_otp', async (req, res) => {
    // console.log('Received /send_otp request:', req.body);
    
    
    const { phoneNumber, otp } = req.body;
    
    if (!phoneNumber || !otp) {
        return res.status(400).json({ success: false, message: 'Phone number and OTP are required' });
    }

    console.log(`Sending OTP ${otp} to phone number ${phoneNumber}`);

            try {
                    const options = {
            method: 'POST',
            url: 'https://gate.whapi.cloud/messages/text',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                authorization: 'Bearer ' + process.env.WHAPI_TOKEN
            },
            data: {
                typing_time: 0,
                to: phoneNumber, // International format (e.g., 15550109999)
                body: `${otp}`
            }
            };
        

            const response = await axios.request(options);
                // console.log(response.data);
            

            } catch (error) {

                // console.error('Error sending OTP:', error);

                res.status(500).json({ success: false, message: 'Failed to send OTP', error: error.message });
            }

    res.json({ success: true, message: 'OTP sent successfully' });

});

// Start server
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});