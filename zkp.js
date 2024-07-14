import crypto from 'crypto';

class ZKProof {
    constructor() {
        this.N = 20;
        this.salt = crypto.randomBytes(16);
    }

    _hash(x) {
        return crypto.createHash('sha256').update(x + this.salt).digest('hex');
    }

    generateProof(secret) {
        this.secret = secret;
        this.v = this._hash(secret);
        const r = (Math.random() * this.N).toString();
        this.x = this._hash(r);
        return { x: this.x, secret: this.secret };
    }

    verify(proof, data) {
        const { x, secret } = proof;
        return this.v === this._hash(secret) && x === this._hash((Math.random() * this.N).toString());
    }
}

export default ZKProof;
