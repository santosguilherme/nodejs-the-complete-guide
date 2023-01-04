const {validationResult} = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.signup = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Validation failed!');
        error.statusCode = 422;
        error.errors = errors.array();

        throw error;
    }

    const {email, name, password} = req.body;

    bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
            const user = new User({
                email,
                password: hashedPassword,
                name
            });

            return user.save();
        })
        .then(user => {
            res.status(201).json({
                userId: user._id
            });
        })
        .catch(error => {
            if (!error.statusCode) {
                error.statusCode = 500;
            }

            next(error);
        });
};

exports.login = (req, res, next) => {
    const {email, password} = req.body;
    let loadedUser;

    User.findOne({email})
        .then(user => {
            if (!user) {
                const error = new Error('Could not find an user with this email!');
                error.statusCode = 401;
                throw error;
            }

            loadedUser = user;

            return bcrypt.compare(password, user.password);
        })
        .then(passwordMatches => {
            if (!passwordMatches) {
                const error = new Error('Your password is wrong!');
                error.statusCode = 401;
                throw error;
            }

            const token = jwt.sign({
                    email: loadedUser.email,
                    userId: loadedUser._id.toString()
                },
                'mysupersecredtkey',
                {expiresIn: '1h'}
            );

            res.status(200).json({
                token,
                userId: loadedUser._id.toString()
            });
        })
        .catch(error => {
            if (!error.statusCode) {
                error.statusCode = 500;
            }

            next(error);
        });
};

exports.getUserStatus = (req, res, next) => {
    User.findById(req.userId)
        .then(user => {
            if (!user) {
                const error = new Error('User not found');
                error.statusCode = 404;
                throw error;
            }

            res.status(200).json({
                status: user.status
            });
        })
        .catch(error => {
            if (!error.statusCode) {
                error.statusCode = 500;
            }

            next(error);
        });
};

exports.updateUserStatus = (req, res, next) => {
    const { status } = req.body;

    User.findById(req.userId)
        .then(user => {
            if (!user) {
                const error = new Error('User not found');
                error.statusCode = 404;
                throw error;
            }

            user.set({ status })

            return user.save();
        })
        .then(user => {
            res.status(200).json({
                status: user.status
            });
        })
        .catch(error => {
            if (!error.statusCode) {
                error.statusCode = 500;
            }

            next(error);
        });
};
