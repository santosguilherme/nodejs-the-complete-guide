const bcryptjs = require("bcryptjs");

const User = require("../models/user");

exports.getLogin = (req, res, next) => {
    const errorMessages = req.flash('error');

    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: Array.isArray(errorMessages) ? errorMessages[0] : null
    });
};

exports.getSignup = (req, res, next) => {
    const errorMessages = req.flash('error');

    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: Array.isArray(errorMessages) ? errorMessages[0] : null
    });
};

exports.postLogin = (req, res, next) => {
    const {email, password} = req.body;

    User
        .findOne({email})
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid email or password.');
                return res.redirect("/login");
            }

            return bcryptjs
                .compare(password, user.password)
                .then(doMatch => {
                    if (!doMatch) {
                        req.flash('error', 'Invalid email or password.');
                        return res.redirect('/login');
                    }

                    req.session.user = user;
                    req.session.isLoggedIn = true;

                    return req.session.save(error => {
                        // waits the update of the session on the DB
                        if (error) {
                            console.error(error);
                        }

                        res.redirect('/');
                    });
                })
                .catch(error => {
                    console.log(error);

                    res.redirect("/login");
                });
        })
        .catch(console.error);
};

exports.postSignup = (req, res, next) => {
    const {email, password, confirmPassword} = req.body;

    if (!email || !password || password !== confirmPassword) {
        // return res.redirect('/signup');
        console.error({email, password, confirmPassword});
    }

    User.findOne({email})
        .then(existingUser => {
            if (existingUser) {
                req.flash('error', 'E-mail already exists, please use a different one.');
                return res.redirect('/signup');
            }

            return bcryptjs
                .hash(password, 12)
                .then(hashedPassword => {
                    const user = new User({
                        email,
                        password: hashedPassword,
                        cart: {items: []}
                    });

                    return user.save();
                })
                .then(() => {
                    res.redirect("/login");
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
