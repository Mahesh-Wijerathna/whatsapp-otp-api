const { RemoteAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');

// Initialize MongoDB connection
mongoose.connect('mongodb+srv://SoftwareProject:SoftwareProject@cluster0.r0hwfhg.mongodb.net/');

const store = new MongoStore({ mongoose: mongoose });

const remoteAuthConfig = {
    store: store,
    backupSyncIntervalMs: 300000 // 5 minutes
};

module.exports = {
    RemoteAuth,
    remoteAuthConfig
};