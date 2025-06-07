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
const { Blob } = require("buffer") //for Buffer pinata
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
    const desc = req.body.desc; // Get the description
    // const fileName = req.file.filename.split('--')[1].replace('.csv', '');
    const fileName = req.file.filename.replace('.csv', '');

    // console.log(fileName); // "MOCK_DATA1"
    // console.log(req.body);
    // console.log(inputPath);
    // console.log(outputPath);
    // console.log('Wallet Address: ' + walletPK);
    // console.log('EncryptFile: ' + encryptFile);
    // console.log('Public Key: ' + pKey);


    res.json({ "message": "Upload successful", "status": "ok", "fileName": fileName, "walletPK": walletPK, "encryptFile": encryptFile, "pKey": pKey, "inputPath": inputPath, "outputPath": outputPath, "desc": desc });
    return
    // res.status(200).sendFile(path.join(__dirname, 'public', 'processing.html'));

    // !-----------------------------------------------------------------------------------------!

    const python = spawn('python', ['./python/algo.py', inputPath, outputPath]);

    python.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    python.on('close', (code) => {
        console.log(`Python exited with code ${code}`);

        // Check if output file exists
        if (fs.existsSync(outputPath)) {
            //delete the input file after processing (uploads folder)
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

                const filePath = outputPath; // anonymized file
                const encryptedFilePath = path.join(__dirname, 'encryptedFile', `${fileName}.enc`); // encrypted file path
                const encryptedKeyPath = path.join(__dirname, 'encryptedFile', 'encrypted_aes_key.bin'); // path to save encrypted key
                const ivPath = path.join(__dirname, 'encryptedFile', 'iv.bin'); // path to save IV

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
                        // fs.writeFileSync("aes_key.bin", aesKey);

                        const encrypted = pubKey.encrypt(aesKey.toString('binary'), 'RSAES-PKCS1-V1_5');
                        const encryptedKey = Buffer.from(encrypted, 'binary');

                        // Save encrypted key and IV
                        fs.writeFileSync(encryptedKeyPath, encryptedKey);
                        fs.writeFileSync(ivPath, iv);

                        console.log('File encrypted and AES key secured.');
                        // console.log("encryptedKey: " + encryptedKey);
                        // console.log("IV: " + iv);
                        console.log("Uploading to Pinata...");
                        pinataUploadEncrypted(encryptedKeyPath, ivPath, fileName, encryptedFilePath, walletPK)
                        // deleteFilesEnrypted(); // Delete files after upload
                        // uploadDirectory();
                    } catch (err) {
                        console.error('RSA encryption failed:', err.message);
                    }
                });
            } else {
                console.log('No encryption required');

                // pinataUpload(fileName, outputPath, walletPK)
                // deleteFilesOutput(); // Delete files after upload
            }



        } else {
            res.status(500).send("Processing failed or output not generated.");
        }
    });


});

app.post('/api/processing', async (req, res) => {

    // console.log(req.body);

    const inputPath = req.body.inputPath; // Get the input file path
    const outputPath = req.body.outputPath; // Get the output file path
    const walletPK = req.body.walletPK; // Get the wallet public key
    const encryptFile = req.body.encryptFile; // Get the encryption option
    const pKey = req.body.pKey; // Get the public key for encryption
    const desc = req.body.desc; // Get the description
    const fileName = req.body.fileName

    console.log(fileName); // "MOCK_DATA1"
    console.log(req.body);
    console.log(inputPath);
    console.log(outputPath);
    console.log('Wallet Address: ' + walletPK);
    console.log('EncryptFile: ' + encryptFile);
    console.log('Public Key: ' + pKey);
    console.log("Description: " + desc);


    const python = spawn('python', ['./python/algo.py', inputPath, outputPath]);

    python.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    python.on('close', async (code) => {
        console.log(`Python exited with code ${code}`);

        // Check if output file exists
        if (fs.existsSync(outputPath)) {
            //delete the input file after processing (uploads folder)
            fs.unlink(inputPath, (err) => {
                if (err) {
                    console.error(`Error deleting input file: ${err}`);
                } else {
                    console.log('Input file deleted successfully');
                }
            });
            // res.("File output Success")
            // res.json({ "message": "Upload successful", "status": "ok" })
            // Check if encryption is required
            if (encryptFile === '1') {

                // if (!isRSA2048(pKey)) {
                //     console.error("Invalid public key — must be RSA-2048.");
                //     res.status(400).json({ error: "Provided public key must be RSA-2048." });
                //     return;
                // }
                // Call the encryption function here
                console.log('Encryption is required');

                const filePath = outputPath; // anonymized file
                const encryptedFilePath = path.join(__dirname, 'encryptedFile', `${fileName}.enc`); // encrypted file path
                const encryptedKeyPath = path.join(__dirname, 'encryptedFile', 'encrypted_aes_key.bin'); // path to save encrypted key
                const ivPath = path.join(__dirname, 'encryptedFile', 'iv.bin'); // path to save IV

                const aesKey = crypto.randomBytes(32); // 256-bit AES key
                const iv = crypto.randomBytes(16);     // Initialization vector

                const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
                const input = fs.createReadStream(filePath);
                const output = fs.createWriteStream(encryptedFilePath);

                input.pipe(cipher).pipe(output);


                output.on('finish', async () => {
                    try {
                        // Convert public key and encrypt AES key using RSA
                        const pubKey = forge.pki.publicKeyFromPem(pKey);
                        // fs.writeFileSync("aes_key.bin", aesKey);

                        const encrypted = pubKey.encrypt(aesKey.toString('binary'), 'RSAES-PKCS1-V1_5');
                        const encryptedKey = Buffer.from(encrypted, 'binary');

                        // Save encrypted key and IV
                        fs.writeFileSync(encryptedKeyPath, encryptedKey);
                        fs.writeFileSync(ivPath, iv);

                        console.log('File encrypted and AES key secured.');
                        // console.log("encryptedKey: " + encryptedKey);
                        // console.log("IV: " + iv);
                        const result = await pinataUploadEncrypted(encryptedKeyPath, ivPath, fileName, encryptedFilePath, walletPK, desc)
                        console.log("Uploading to Pinata...");
                        console.log(result);
                        res.status(200).json(result);
                        return
                    } catch (err) {
                        console.error('RSA encryption failed:', err.message);
                    }
                });
            } else {
                console.log('No encryption required');

                const result = await pinataUpload(fileName, outputPath, walletPK, desc)
                console.log("Uploading to Pinata...");
                console.log(result);
                res.status(200).json(result);
                // res.json({ "message": "Upload successful", "status": "ok" })
                return
            }



        } else {
            res.status(500).send("Processing failed or output not generated.");
        }
    });


    // res.status(200).json({ "message": "Processing successful" });

})

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

app.get('/processing', (req, res) => {

    res.status(200).sendFile(path.join(__dirname, 'public', 'processing.html'));
})

app.get('/MyDatasets', (req, res) => {

    res.status(200).sendFile(path.join(__dirname, 'public', 'MyFiles.html'));
})

app.get('/api/pinataMyFiles/:WalletAddress', async (req, res) => {

    const walletAddress = req.params.WalletAddress;

    try {
        const files = await pinata.files.public
        .list()
        .keyvalues({
			"WalletAddress": `${walletAddress}` // Filter file by wallet address
		})
        res.status(200).send(files);

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to fetch files from Pinata' });
    }
})

app.get('/api/pinataFiles', async (req, res) => {

    try {
        const files = await pinata.files.public.list()
        res.status(200).send(files);

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to fetch files from Pinata' });
    }
})

app.get('/api/pinataFileDel/:id', async (req, res) => {

    const fileId = req.params.id;

    try {
        // const files = await pinata.files.public.list()
        const deletedFiles = await pinata.files.public.delete([fileId])
        res.status(200).json(deletedFiles);

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to delete file from Pinata' });
    }
})


async function pinataUploadEncrypted(encryptedKey, iv, fileName, encryptedFilePath, walletPK, desc) {

    console.log("encryptedFilePath: " + encryptedFilePath);
    console.log("fileName: " + fileName);

    try {
        const blob = new Blob([fs.readFileSync(encryptedFilePath)]);
        const file = new File([blob], `${fileName}.enc`, { type: "application/octet-stream" })

        const encryptedKeyBlob = new Blob([fs.readFileSync(encryptedKey)], { type: "application/octet-stream" });
        const ivBlob = new Blob([fs.readFileSync(iv)], { type: "application/octet-stream" });

        const encryptedKeyFile = new File([encryptedKeyBlob], "encrypted_aes_key.bin", { type: "application/octet-stream" });
        const ivFile = new File([ivBlob], "iv.bin", { type: "application/octet-stream" });

        const upload = await pinata.upload.public.fileArray([file, encryptedKeyFile, ivFile])
            .name(fileName) // Set the name of the folder in Pinata
            .keyvalues({
                "WalletAddress": `${walletPK}`, // Example key-value pair
                "Description": `${desc}`, // Add description to metadata
                "EncryptedFile": "1", // Indicate that this is an encrypted file
                "PublicView": "1" // Indicate that if this file is publicly viewable
            })
            // .then(response => {
                console.log("Upload successful:", upload);
                deleteFilesEnrypted(); // Delete files after upload
                return upload;
            // })
        // console.log(upload)
        // return upload;
    } catch (error) {
        console.log(error)
    }
}

async function pinataUpload(fileName, outputPath, walletPK, desc) {

    console.log("fileName: " + fileName);

    try {
        const blob = new Blob([fs.readFileSync(outputPath)]);
        const file = new File([blob], `${fileName}.csv`, { type: "text/csv" })

        const upload = await pinata.upload.public.fileArray([file])
            .name(fileName) // Set the name of the folder in Pinata
            .keyvalues({
                "WalletAddress": `${walletPK}`, // Example key-value pair
                "Description": `${desc}`, // Add description to metadata
                "EncryptedFile": "0", // Indicate that this is not an encrypted file
                "PublicView": "1" // Indicate that if this file is publicly viewable
            })
        // .then(response => {
        console.log("Upload successful:", upload);
        deleteFilesOutput(); // Delete files after upload
        // console.log(object);
        return upload;
        // })
        // console.log(upload)
        // return upload;
    } catch (error) {
        console.log(error)
    }
}

function deleteFilesEnrypted() {

    const directory = path.join(__dirname, 'encryptedFile');

    fs.readdirSync(directory).forEach(file => {
        const filePath = path.join(directory, file);
        if (fs.statSync(filePath).isFile()) {
            fs.unlinkSync(filePath);
        }
    });

    console.log('All files deleted successfully from encryptedFile folder');
}

function deleteFilesOutput() {

    const directory = path.join(__dirname, 'output');

    fs.readdirSync(directory).forEach(file => {
        const filePath = path.join(directory, file);
        if (fs.statSync(filePath).isFile()) {
            fs.unlinkSync(filePath);
        }
    });

    console.log('All files deleted successfully from output folder');
}

// not used just to test
async function uploadDirectory() {
    const file1 = new File(["hello world!"], "hello.txt", { type: "text/plain" })
    const file2 = new File(["hello world again!"], "hello2.txt", { type: "text/plain" })
    const upload = await pinata.upload.public
        .fileArray([file1, file2])
        .name("my-directory") // Set the name of the directory in Pinata
}


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

