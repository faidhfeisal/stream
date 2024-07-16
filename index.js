const StreamrClient = require("streamr-client")
const express = require('express');
const bodyParser = require('body-parser');
const { encrypt, decrypt } = require('./src/encryption.js');
require('dotenv').config();
import ZKProof from './src/zkp.js';

const zkp = new ZKProof();

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());

const client = new StreamrClient({
    auth: {
        privateKey: process.env.STREAMR_API_KEY,
    }
});

// Mock function to simulate DID verification with the core service
async function verifyDID(did, proof) {
    // Implement actual logic to verify DID with the core service
    return true;
}

app.post('/publish', async (req, res) => {
    const { streamId, data, did, proof } = req.body;

    try {
        const zkProof = new ZKProof();
        const isValid = zkProof.verify(proof);

        if (!isValid) {
            return res.status(403).json({ success: false, message: 'Invalid proof' });
        }

        const dataString = JSON.stringify(data); // Ensure data is a string
        const encryptedData = encrypt(dataString);
        await client.publish(streamId, encryptedData);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Publish error:', error.message, error.stack);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/subscribe', async (req, res) => {
    const { streamId, did, proof } = req.body;

    try {
        const zkProof = new ZKProof();
        const isValid = zkProof.verify(proof);

        if (!isValid) {
            return res.status(403).json({ success: false, message: 'Invalid proof' });
        }

        await client.subscribe({
            stream: streamId,
            async onMessage(msg) {
                const decryptedData = decrypt(msg);
                console.log('Received message:', decryptedData);
            },
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Subscribe error:', error.message, error.stack);
        res.status(500).json({ success: false, message: error.message });
    }
});


export { app, port };

// Only start the server if this file is being run directly
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}
