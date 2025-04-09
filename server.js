require('dotenv').config() //? For .env file
const fs = require('fs');
const https = require('https');
const express = require("express");
const path = require('path');
// const mongoose = require('mongoose'); // DataBase
// const cors = require('cors'); //? frontend acess to API
const multer  = require('multer') //? Process client file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.originalname)
    }
})
const upload = multer({ storage: storage }) //? ^

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
app.use(express.urlencoded({extended: false}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/images', express.static(path.join(__dirname, 'images')));


// app.use(cors())
// app.use(errorMiddleware)

//! Routes

// app.use('/api/product', productRoute);

app.post('/api/upload', upload.single('file') , (req, res)=> {
    
    // console.log(req.headers['content-type']);
    // res.send("File Upload Successfully")
    res.json(req.file)
})

app.get('/', (req, res)=> {

    // res.status(200).json("Hi")
    res.status(200).sendFile(path.join(__dirname, 'public', 'wallet.html'));
})

app.get('/home', (req, res)=> {

    res.status(200).sendFile(path.join(__dirname, 'public', 'home.html'));
})

app.get('/uploadfile', (req, res)=> {

    res.status(200).sendFile(path.join(__dirname, 'public', 'uploadfile.html'));
})


//? Connection to PORT & DB
// mongoose.connect(MONGO_URL)
// .then(()=> {
//     console.log('Connected to MongoDB');

//     app.listen(PORT, (()=> {
//         console.log("Node App is running at PORT:", PORT);
//     }))
// }).catch((error)=> {
//     console.log(error);
// })

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

