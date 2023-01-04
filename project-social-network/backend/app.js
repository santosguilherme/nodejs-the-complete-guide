require('dotenv').config();

const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");

const mongoConnection = require("./util/database");
const socket = require("./socket")
const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const fileFilter = (req, file, cb) => {
    const isImage = ['image/png', 'image/jpg', 'image/jpeg'].includes(file.mimetype);

    cb(null, isImage);
};

const app = express();

app.use(bodyParser.json());
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
    console.log(error);

    const {statusCode = 500, message, errors} = error;

    res.status(statusCode).json({message, data: errors});
});

mongoConnection
    .then(() => {
        const server = app.listen(8080);

        const io = socket.init(server);

        io.on('connection', () => {
            console.log('Client connected!');
        });
    })
    .catch(console.error);
