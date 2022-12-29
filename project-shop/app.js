const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const mongooseConnection = require("./util/database");
const User = require("./models/user");

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');


app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
    User
        .findById('63ad732e5e37255d046c260c')
        .then(user => {
            req.user = user;
            next();
        })
        .catch(console.error);
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongooseConnection
    .then(() => {
        return User.findOne().then(user => {
            if (user) {
                return user;
            }

            const newUser = new User({
                name: "Guilherme",
                email: "sntguilherme@gmail.com",
                cart: {
                    items: []
                }
            });

            return newUser.save();
        });
    })
    .then(() => {
        app.listen(3000);
    })
    .catch(console.error);
