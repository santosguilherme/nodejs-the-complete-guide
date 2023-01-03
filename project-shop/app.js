require('dotenv').config();

const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");

const errorController = require("./controllers/error");
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const shopRoutes = require("./routes/shop");
const {mongooseConnection, DB_URI} = require("./util/database");
const User = require("./models/user");

const app = express();
const sessionStore = new MongoDBStore({
    uri: DB_URI,
    collection: 'sessions'
});
const csrfProtection = csrf();
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

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false}));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(session({secret: 'my secret', resave: false, saveUninitialized: false, store: sessionStore}));
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }

    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch(error => {
            next(new Error(error));
        });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
    console.error(error);

    res.redirect('/500');
});

mongooseConnection
    .then(() => {
        app.listen(3000);
    })
    .catch(console.error);
