const User = require("../models/user");

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: false
    });
};

exports.postLogin = (req, res, next) => {
    User
        .findById('63ad732e5e37255d046c260c')
        .then(user => {
            req.session.user = user;
            req.session.isLoggedIn = true;

            req.session.save(error => {
                // waits the update of the session on the DB
                if (error) {
                    console.error(error);
                }

                res.redirect('/');
            });
        })
        .catch(console.error);
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(error => {
        if (error) {
            console.error(error);
        }

        res.redirect("/login");
    });
};
