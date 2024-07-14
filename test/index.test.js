import request from 'supertest';
import { app } from '../index.js';
import { encrypt, decrypt } from '../encryption.js';
import ZKProof from '../zkp.js';
import { StreamrClient } from 'streamr-client';

jest.mock('streamr-client');

describe('Stream Service', () => {
    let clientStub;
    let verifySpy;

    beforeEach(() => {
        clientStub = jest.spyOn(StreamrClient.prototype, 'publish').mockResolvedValue(true);
        verifySpy = jest.spyOn(ZKProof.prototype, 'verify').mockReturnValue(true); // Ensuring the proof is valid for the positive test case
    });

    afterEach(() => {
        clientStub.mockRestore();
        verifySpy.mockRestore();
    });

    describe('Encryption', () => {
        test('should encrypt and decrypt data correctly', () => {
            const data = "Hello World";
            const encryptedData = encrypt(data);
            const decryptedData = decrypt(encryptedData);

            expect(decryptedData).toBe(data);
        });
    });

    describe('Publish Endpoint', () => {
        test('should publish encrypted data to a stream', async () => {
            const streamId = 'test-stream';
            const data = { message: 'test' };
            const did = 'did:example:123';
            const proof = 'test-proof';

            const res = await request(app)
                .post('/publish')
                .send({ streamId, data, did, proof });

            console.log('Publish response status:', res.status);
            console.log('Publish response body:', res.body);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(clientStub).toHaveBeenCalledTimes(1);
        });

        test('should return 403 if DID verification fails', async () => {
            const streamId = 'test-stream';
            const data = { message: 'test' };
            const did = 'did:example:123';
            const proof = 'test-proof';

            verifySpy.mockReturnValue(false);

            const res = await request(app)
                .post('/publish')
                .send({ streamId, data, did, proof });

            console.log('403 Test - Publish response status:', res.status);
            console.log('403 Test - Publish response body:', res.body);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        test('should return 500 on error', async () => {
            const streamId = 'test-stream';
            const data = { message: 'test' };
            const did = 'did:example:123';
            const proof = 'test-proof';

            clientStub.mockRejectedValue(new Error('Publish error'));

            const res = await request(app)
                .post('/publish')
                .send({ streamId, data, did, proof });

            console.log('500 Test - Publish response status:', res.status);
            console.log('500 Test - Publish response body:', res.body);

            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
        });
    });

    describe('Subscribe Endpoint', () => {
        let subscribeStub;

        beforeEach(() => {
            subscribeStub = jest.spyOn(StreamrClient.prototype, 'subscribe').mockResolvedValue(true);
        });

        afterEach(() => {
            subscribeStub.mockRestore();
        });

        test('should subscribe to a stream and decrypt messages', async () => {
            const streamId = 'test-stream';
            const did = 'did:example:123';
            const proof = 'test-proof';

            verifySpy.mockReturnValue(true);

            const res = await request(app)
                .post('/subscribe')
                .send({ streamId, did, proof });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        test('should return 403 if DID verification fails', async () => {
            const streamId = 'test-stream';
            const did = 'did:example:123';
            const proof = 'test-proof';

            verifySpy.mockReturnValue(false);

            const res = await request(app)
                .post('/subscribe')
                .send({ streamId, did, proof });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        test('should return 500 on error', async () => {
            const streamId = 'test-stream';
            const did = 'did:example:123';
            const proof = 'test-proof';

            subscribeStub.mockRejectedValue(new Error('Subscribe error'));

            const res = await request(app)
                .post('/subscribe')
                .send({ streamId, did, proof });

            console.log('500 Test - Subscribe response status:', res.status);
            console.log('500 Test - Subscribe response body:', res.body);

            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
        });
    });
});
