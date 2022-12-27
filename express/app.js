const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
// const expressHandlebars = require("express-handlebars");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const app = express();

// app.engine('hbs', expressHandlebars({
//     layoutsDir: 'views/layouts',
//     defaultLayout: 'main-layout',
//     extname: 'hbs'
// }));
// app.set('view engine', 'hbs'); // handlebars
// app.set('view engine', 'pug');
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes.routes);
app.use(shopRoutes);

app.use((req, res, next) => {
    res
        .status(404)
        // .sendFile(path.join(__dirname, 'views', '404.html'));
        .render('404', {pageTitle: 'Page not found', path: ''});
});

app.listen(3000);
