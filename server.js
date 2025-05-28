require('dotenv').config() //? For .env file
const fs = require('fs');
const crypto = require('crypto');
const forge = require('node-forge');
const { spawn } = require('child_process');
// const https = require('https');
const express = require("express");
const path = require('path');
// const mongoose = require('mongoose'); // DataBase
const { PinataSDK } = require('pinata'); // For Storage / DB
const cors = require('cors'); //? frontend acess to API
const multer = require('multer') //? Process client file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, Date.now() + '--' + file.originalname)
    }
})
const upload = multer({ storage: storage }) //? ^

const pinata = new PinataSDK({
    pinataJwt: process.env.JWT,
    pinataGateway: process.env.GATEWAY,
});

//? routes import from here
// const productRoute = require('./routes/productRoute');

// const errorMiddleware = require('./middleware/errorMiddleware');
const app = express();

//? Read SSL certificate files
// const privateKey = fs.readFileSync('ssl/private.key', 'utf8');
// const certificate = fs.readFileSync('ssl/certificate.crt', 'utf8');

// Set up SSL options
// const credentials = {
//     key: privateKey,
//     cert: certificate,
//     passphrase: 'hello'
// };

//? Mongo URL from dotenv
// const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT || 3000


//? Allow JSON data type for APP
app.use(express.json());

//? Allow Form URL Encoded. To Pass Values to update DB
app.use(express.urlencoded({ extended: false }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/images', express.static(path.join(__dirname, 'images')));


app.use(cors())
// app.use(errorMiddleware)

//! Routes

// app.use('/api/product', productRoute);

// app.post('/api/upload', upload.single('file') , (req, res)=> {

//     console.log(req.headers['content-type']);
//     console.log(req.file);
// res.send("File Upload Successfully")
//     console.log(req.file.filename);
//     // res.json(req.file)

//     const inputPath = path.join(__dirname, 'uploads', req.file.filename);
//     const outputPath = path.join(__dirname, 'outputs', `output_${req.file.filename}`);

// })

app.post('/api/upload', upload.single('file'), (req, res) => {

    const inputPath = path.join(__dirname, 'uploads', req.file.filename);
    const outputPath = path.join(__dirname, 'output', req.file.filename);
    const walletPK = req.body.walletPK; // Get the wallet public key
    const encryptFile = req.body.encryptFile; // Get the encryption option
    const pKey = req.body.pKey; // Get the public key for encryption
    const fileName = req.file.filename; // Get the original file name

    console.log(req.body);
    console.log(inputPath);
    console.log(outputPath);
    console.log('Wallet Address: ' + walletPK);
    console.log('EncryptFile: ' + encryptFile);
    console.log('Public Key: ' + pKey);

    const python = spawn('python', ['./python/algo.py', inputPath, outputPath]);

    python.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    python.on('close', (code) => {
        console.log(`Python exited with code ${code}`);

        // Check if output file exists
        if (fs.existsSync(outputPath)) {
            //delete the input file after processing
            fs.unlink(inputPath, (err) => {
                if (err) {
                    console.error(`Error deleting input file: ${err}`);
                } else {
                    console.log('Input file deleted successfully');
                }
            });
            // res.("File output Success")
            res.json({ "message": "Upload successful", "status": "ok" })
            // Check if encryption is required
            if (encryptFile === '1') {
                // Call the encryption function here
                console.log('Encryption is required');
                // or use a Node.js library for encryption.
                const filePath = outputPath; // anonymized file
                const encryptedFilePath = path.join(__dirname, 'encryptedFile', 'encryted_output.enc'); // encrypted file path
                const encryptedKeyPath = path.join(__dirname, 'output', 'encrypted_key.bin'); // path to save encrypted key
                const ivPath = path.join(__dirname, 'output', 'iv.bin'); // path to save IV

                const aesKey = crypto.randomBytes(32); // 256-bit AES key
                const iv = crypto.randomBytes(16);     // Initialization vector

                const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
                const input = fs.createReadStream(filePath);
                const output = fs.createWriteStream(encryptedFilePath);

                input.pipe(cipher).pipe(output);

                output.on('finish', () => {
                    try {
                        // Convert public key and encrypt AES key using RSA
                        const pubKey = forge.pki.publicKeyFromPem(pKey);
                        const encrypted = pubKey.encrypt(aesKey.toString('binary'), 'RSA-OAEP');
                        const encryptedKey = Buffer.from(encrypted, 'binary');

                        // Save encrypted key and IV
                        fs.writeFileSync(encryptedKeyPath, encryptedKey);
                        fs.writeFileSync(ivPath, iv);

                        console.log('File encrypted and AES key secured.');
                    } catch (err) {
                        console.error('RSA encryption failed:', err.message);
                    }
                });

            } else {
                console.log('No encryption required');
            }



        } else {
            res.status(500).send("Processing failed or output not generated.");
        }
    });


});

app.get('/', (req, res) => {

    // res.status(200).json("Hi")
    res.status(200).sendFile(path.join(__dirname, 'public', 'wallet.html'));
})

app.get('/home', (req, res) => {

    res.status(200).sendFile(path.join(__dirname, 'public', 'home.html'));
})

app.get('/uploadfile', (req, res) => {

    res.status(200).sendFile(path.join(__dirname, 'public', 'uploadfile.html'));
})



// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});


//! Start the HTTPS server
// mongoose.connect(MONGO_URL)
//     .then(() => {
//         console.log('Connected to MongoDB');

//         https.createServer(credentials, app).listen(443, () => {
//             console.log('HTTPS server is running on https://localhost:443');
//         });

//     }).catch((error) => {
//         console.log(error);
//     })

