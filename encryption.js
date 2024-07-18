// src/encryption.js
const crypto = require('crypto');
const ZKProof = require('./zkp.js');

const algorithm = 'aes-256-cbc';
const secretKey = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

const zkp = new ZKProof();

function encrypt(text) {
    // const proof = zkp.generateProof(text); // will need to revisit
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return { iv: iv.toString('hex'), proof, encryptedData: encrypted };
}

function decrypt(encryptedData) {
    const { iv, proof, encryptedData: data } = encryptedData;

    const isValid = zkp.verify(proof, data);
    if (!isValid) {
        throw new Error('Invalid proof');
    }

    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

module.exports = {encrypt, decrypt};


