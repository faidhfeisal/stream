# Stream Service

## Overview
The Stream Service handles the creation, management, and interaction with real-time data streams in the OwnIt Marketplace. It uses the Streamr network for decentralized pub/sub messaging.

## Features
- Stream creation
- Data publishing to streams
- Stream subscription management
- Zero-Knowledge Proof (ZKP) verification for secure interactions

## Setup

### 1. Streamr Wallet Setup
Before running the Stream Service, you need to set up a Streamr wallet:

1. Create an Ethereum wallet if you don't already have one. You can use tools like MetaMask or other Ethereum wallet providers.
2. Fund your wallet with some MATIC on the network you plan to use (Polygon, or a testnet).
3. Note down your wallet's private key. IMPORTANT: Keep this private key secure and never share it publicly.

### 2. Environment Variables
Create a `.env` file in the root directory and add the following:

```
PORT=3000
STREAMR_PRIVATE_KEY=<your_streamr_wallet_private_key>
ENCRYPTION_SECRET=<your_encryption_secret>
```

Replace `<your_streamr_wallet_private_key>` with the private key of the Ethereum wallet you'll use for Streamr interactions. 
Generate a strong, random string for `<your_encryption_secret>`.
Ensure these strings are in quotes as the streamr client requires this format

### 3. Install Dependencies
Install the required Node.js packages:

```
npm install
```

### 4. Run the Service
Start the Stream Service:

```
npm start
```

## API Endpoints

### Stream Management
- POST `/create`: Create a new stream
- POST `/publish`: Publish data to a stream
- GET `/stream-subscribers/{streamId}`: Get subscribers of a stream
- POST `/subscribe/{streamId}`: Subscribe to a stream

### Health Check
- GET `/health`: Check the health status of the service

## Key Components

### Streamr Client
The service uses the Streamr Client to interact with the Streamr network for creating streams and publishing data.

### Encryption
Data published to streams is encrypted using AES-256-CBC encryption for privacy and security.

### Zero-Knowledge Proofs (ZKP)
The service implements a basic ZKP system to verify the authenticity of subscription requests without revealing sensitive information.


## Security Considerations
- Protect the `PRIVATE_KEY` and `ENCRYPTION_SECRET` environment variables
- Implement proper access control for stream creation and management
- Regularly update the Streamr SDK and other dependencies
- Enhance the ZKP implementation for production use
- We should monitor the Streamr wallet's balance to ensure uninterrupted service
- In a production environment, we should consider using a secure key management system for handling the private key
