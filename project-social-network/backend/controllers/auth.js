const {validationResult} = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.signup = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Validation failed!');
        error.statusCode = 422;
        error.errors = errors.array();

        throw error;
    }

    const {email, name, password} = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            email,
            password: hashedPassword,
            name
        });

        await user.save();

        res.status(201).json({
            userId: user._id
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }

        next(error);
    }
};

exports.login = async (req, res, next) => {
    const {email, password} = req.body;

    try {
        const user = await User.findOne({email});
        if (!user) {
            const error = new Error('Could not find an user with this email!');
            error.statusCode = 401;
            throw error;
        }

        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) {
            const error = new Error('Your password is wrong!');
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign({
                email: user.email,
                userId: user._id.toString()
            },
            'mysupersecredtkey',
            {expiresIn: '1h'}
        );

        res.status(200).json({
            token,
            userId: user._id.toString()
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }

        next(error);
    }
};

exports.getUserStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            status: user.status
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }

        next(error);
    }
};

exports.updateUserStatus = async (req, res, next) => {
    const {status} = req.body;

    try {
        const user = await User.findById(req.userId);

        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        user.set({status});

        await user.save();

        res.status(200).json({
            status: user.status
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }

        next(error);
    }
};
