require('dotenv').config();

const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const {graphqlHTTP} = require("express-graphql");

const mongoConnection = require("./util/database");
const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolvers");
const authMiddleware = require("./middlewares/auth");
const {clearImage} = require("./util/images");

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

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

app.use(authMiddleware);

app.put('/post-image', (req, res, next) => {
    if (!req.isAuth) {
        throw new Error('Not authenticated!');
    }

    if (!req.file) {
        return res.status(200).json({message: 'No file provided'});
    }

    if (req.body.oldPath) {
        clearImage(req.body.oldPath);
    }

    res.status(201).json({message: 'File stored!', filePath: req.file.path});
});

app.use('/graphql', graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn: error => ({
        message: error.message || 'An error occurred.',
        code: error.originalError && error.originalError.code ? error.originalError.code : 500,
        data: error.originalError && error.originalError.data ? error.originalError.data : {}
    })
}));

app.use((error, req, res, next) => {
    console.log(error);

    const {statusCode = 500, message, errors} = error;

    res.status(statusCode).json({message, data: errors});
});

mongoConnection
    .then(() => {
        app.listen(8080);
    })
    .catch(console.error);
