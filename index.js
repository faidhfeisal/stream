const { StreamrClient } = require('@streamr/sdk')
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const ZKProof = require('./zkp.js');
const winston = require('winston');
const config = require('./config');
const {encrypt, decrypt} = require('./encryption');
const { log } = require('console');

const app = express();
const port = process.env.PORT || 3000;

// Configure Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console()
    ]
});

app.use(bodyParser.json());

const zkp = new ZKProof();

// In-memory storage for stream metadata and subscriptions
const streams = new Map();
const subscriptions = new Map();


app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

const serverStreamrClient = new StreamrClient({
    
    auth: {
        privateKey: config.STREAMR_PRIVATE_KEY
    },
    environment: "polygonAmoy"
    
})

app.post('/create', async (req, res) => {
    const { name, description, price, owner_address } = req.body;

    try {
        const stream = await serverStreamrClient.createStream({
            id: `/ownit/${crypto.randomUUID()}`,
            metadata: {
                name,
                description,
                price,
                owner: owner_address
            }
        });

        console.log('Stream created:', stream.id);
        res.status(200).json({ success: true, stream_id: stream.id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


app.post('/publish', async (req, res) => {
    const { stream_id, data } = req.body;

    logger.info(`Attempting to publish to stream: ${stream_id}`);

    logger.info(data)

    try {

        const dataString = JSON.stringify(data);
        logger.info(dataString)
        const encryptedData = encrypt(dataString);
        logger.info(`Encrypted data: ${JSON.stringify(encryptedData)}`);
        // await serverStreamrClient.publish(stream_id, encryptedData);
        logger.info(`Successfully published to stream: ${stream_id}`);
        res.status(200).json({ success: true });
    } catch (error) {
        logger.error(`Publish error: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/stream-subscribers/:streamId', async (req, res) => {
    const { streamId } = req.params;
    const { did } = req.query;

    logger.info(`Fetching subscribers for stream: ${streamId}`);

    try {
        const streamInfo = streams.get(streamId);
        if (!streamInfo) {
            logger.warn(`Attempt to fetch subscribers for non-existent stream: ${streamId}`);
            return res.status(404).json({ success: false, message: 'Stream not found' });
        }

        if (streamInfo.owner !== did) {
            logger.warn(`Unauthorized attempt to fetch subscribers for stream: ${streamId}`);
            return res.status(403).json({ success: false, message: 'Not authorized to view subscribers for this stream' });
        }

        const streamSubscribers = Array.from(subscriptions.entries())
            .filter(([_, subData]) => subData.streamId === streamId)
            .map(([subscriberId, _]) => subscriberId);

        res.status(200).json({ success: true, subscribers: streamSubscribers });
    } catch (error) {
        logger.error(`Error fetching stream subscribers: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/subscribe/:streamId', async (req, res) => {
    const { streamId } = req.params;
    const { did, proof } = req.body;

    logger.info(`Attempting to subscribe to stream: ${streamId}`);

    try {
        const isValid = zkp.verify(proof);
        if (!isValid) {
            logger.warn(`Invalid proof provided for subscribing to stream: ${streamId}`);
            return res.status(403).json({ success: false, message: 'Invalid proof' });
        }

        const streamInfo = streams.get(streamId);
        if (!streamInfo) {
            logger.warn(`Attempt to subscribe to non-existent stream: ${streamId}`);
            return res.status(404).json({ success: false, message: 'Stream not found' });
        }

        subscriptions.set(did, { streamId, subscribedAt: Date.now() });

        logger.info(`Successfully subscribed to stream: ${streamId}`);
        res.status(200).json({ success: true, message: 'Subscribed successfully' });
    } catch (error) {
        logger.error(`Subscribe error: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.listen(port, () => {
    logger.info(`Stream service listening on port ${port}`);
});// Export the app for testing

