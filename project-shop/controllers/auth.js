const crypto = require("crypto");
const bcryptjs = require("bcryptjs");
const {validationResult} = require("express-validator/check");

const User = require("../models/user");
const sendEmail = require("../util/email");

exports.getLogin = (req, res, next) => {
    const errorMessages = req.flash('error');

    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: Array.isArray(errorMessages) ? errorMessages[0] : null,
        inputValues: {email: "", password: ""},
        validationErrors: []
    });
};

exports.getSignup = (req, res, next) => {
    const errorMessages = req.flash('error');

    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: Array.isArray(errorMessages) ? errorMessages[0] : null,
        inputValues: {email: "", password: "", confirmPassword: ""},
        validationErrors: []
    });
};

exports.postLogin = (req, res, next) => {
    const {email, password} = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: errors.array()[0].msg,
            inputValues: {email, password},
            validationErrors: errors.array()
        });
    }

    User
        .findOne({email})
        .then(user => {
            if (!user) {
                return res.status(422).render('auth/login', {
                    path: '/login',
                    pageTitle: 'Login',
                    errorMessage: 'Invalid email or password.',
                    inputValues: {email, password},
                    validationErrors: []
                });
            }

            return bcryptjs
                .compare(password, user.password)
                .then(doMatch => {
                    if (!doMatch) {
                        return res.status(422).render('auth/login', {
                            path: '/login',
                            pageTitle: 'Login',
                            errorMessage: 'Invalid email or password.',
                            inputValues: {email, password},
                            validationErrors: []
                        });
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
                    console.error(error);

                    res.redirect("/login");
                });
        })
        .catch((error) => {
            const err = new Error(error);
            err.statusCode = 500;

            return next(err);
        });
};

exports.postSignup = (req, res, next) => {
    const {email, password, confirmPassword} = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage: errors.array()[0].msg,
            inputValues: {email, password, confirmPassword},
            validationErrors: errors.array()
        });
    }

    bcryptjs
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

            return sendEmail({
                to: email,
                subject: 'Signup succeeded!',
                html: `<h1>You successfully signed up!</h1>`
            });
        })
        .catch((error) => {
            const err = new Error(error);
            err.statusCode = 500;

            return next(err);
        });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(error => {
        if (error) {
            console.error(error);
        }

        res.redirect("/login");
    });
};

exports.getReset = (req, res, next) => {
    const errorMessages = req.flash('error');

    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: Array.isArray(errorMessages) ? errorMessages[0] : null
    });
};

exports.postReset = (req, res, next) => {
    const {email} = req.body;

    crypto.randomBytes(32, (error, buffer) => {
        if (error) {
            console.error(error);
            return res.redirect('/reset');
        }

        const token = buffer.toString('hex');

        User.findOne({email})
            .then(user => {
                if (!user) {
                    req.flash('error', 'No account found with this email');
                    return res.redirect('/reset');
                }

                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;

                user.save()
                    .then(() => {
                        return sendEmail({
                            to: email,
                            subject: 'Password Reset Request',
                            html: `
                        <p>You requested a password request.</p>
                        <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to reset your password.</p>   
                    `
                        });
                    })
                    .then(() => {
                        res.redirect('/');
                    });
            })
            .catch((error) => {
                const err = new Error(error);
                err.statusCode = 500;

                return next(err);
            });
    });
};

exports.getNewPassword = (req, res, next) => {
    const {token} = req.params;
    const errorMessages = req.flash('error');

    User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
        .then(user => {
            if (!user) {
                req.flash('error', 'An issue happened with the password reset');
                return res.redirect('/reset');
            }

            res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'New Password',
                passwordToken: token,
                userId: user._id.toString(),
                errorMessage: Array.isArray(errorMessages) ? errorMessages[0] : null
            });
        })
        .catch((error) => {
            const err = new Error(error);
            err.statusCode = 500;

            return next(err);
        });
};

exports.postNewPassword = (req, res, next) => {
    const {password, userId, passwordToken} = req.body;
    let resetUser;

    User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: {$gt: Date.now()},
        _id: userId
    })
        .then(user => {
            resetUser = user;

            return bcryptjs.hash(password, 12);
        })
        .then(hashedPassword => {
            resetUser.set({
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiration: null
            });

            return resetUser.save();
        })
        .then(() => {
            res.redirect("/login");
        })
        .catch((error) => {
            const err = new Error(error);
            err.statusCode = 500;

            return next(err);
        });
};
