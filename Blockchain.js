const sha256 = require('crypto-js/sha256');
const crypto = require('crypto-js');

class Block {
    constructor(index, timestamp, data, previousHash = '', dataHashOnly) {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.dataHashOnly = dataHashOnly;
        this.hash = this.calculateHash();

        // this.test = this.calculateHash();
        // console.log(this.hash);
    }

    calculateHash() {
        // console.log(sha256('hello').toString());
        return sha256(this.index + this.timestamp + JSON.stringify(this.data) + this.previousHash).toString();
        // return sha256('hello').toString()
    }
}

class Blockchain {

    latestBlock() {

    }

    addBlock() {

    }
}

console.log(crypto.AES.encrypt("hello", ));