const crypto = require("crypto");
const bcryptjs = require("bcryptjs");

const User = require("../models/user");
const sendEmail = require("../util/email");

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

                    return sendEmail({
                        to: email,
                        subject: 'Signup succeeded!',
                        html: `<h1>You successfully signed up!</h1>`
                    });
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
            .catch(console.error);
    });
};

exports.getNewPassword = (req, res, next) => {
    const {token} = req.params;

    User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
        .then(user => {
            console.log("user", user)
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
        .catch(console.error);

    const errorMessages = req.flash('error');
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
        .catch(console.error);
};
