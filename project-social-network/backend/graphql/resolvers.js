const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Post = require("../models/post");
const {clearImage} = require("../util/images");

module.exports = {
    createUser: async ({userInput}, req) => {
        const {email, name, password} = userInput;
        const errors = [];

        if (!validator.isEmail(email)) {
            errors.push({message: "E-mail is invalid"});
        }

        if (validator.isEmpty(password) || !validator.isLength(password, {min: 5})) {
            errors.push({message: "Password too short"});
        }

        if (validator.isEmpty(name) || !validator.isLength(name, {min: 5})) {
            errors.push({message: "Name too short"});
        }

        if (errors.length > 0) {
            const error = new Error('Validation failed');
            error.data = errors;
            error.code = 422;
            throw error;
        }

        const existingUser = await User.findOne({email});

        if (existingUser) {
            const error = new Error('User already exists');
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            email,
            password: hashedPassword,
            name
        });

        await user.save();

        return {
            ...user._doc,
            _id: user._id.toString()
        };
    },
    login: async ({email, password},) => {
        const user = await User.findOne({email});
        if (!user) {
            const error = new Error('User not found!');
            error.code = 401;
            throw error;
        }

        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error('Password is incorrect!');
            error.code = 401;
            throw error;
        }

        const token = jwt.sign(
            {
                userId: user._id.toString(),
                email
            }, 'mysupersecredtkey',
            {expiresIn: '1h'}
        );

        return {
            token,
            userId: user._id.toString()
        };
    },
    createPost: async ({postInput}, req) => {
        if (!req.isAuth) {
            const error = new Error("Not authenticated!");
            error.code = 401;
            throw error;
        }

        const {title, content, imageUrl} = postInput;
        const errors = [];

        if (validator.isEmpty(title) || !validator.isLength(title, {min: 5})) {
            errors.push({message: "Title too short"});
        }

        if (validator.isEmpty(content) || !validator.isLength(content, {min: 5})) {
            errors.push({message: "Content too short"});
        }

        if (errors.length > 0) {
            const error = new Error('Validation failed');
            error.data = errors;
            error.code = 422;
            throw error;
        }

        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('Invalid user');
            error.code = 401;
            throw error;
        }

        const post = new Post({
            title,
            content,
            imageUrl,
            creator: user
        });

        await post.save();

        user.posts.push(post);
        await user.save();

        return {
            ...post._doc,
            _id: post._id.toString(),
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString()
        };
    },
    updatePost: async ({id, postInput}, req) => {
        if (!req.isAuth) {
            const error = new Error("Not authenticated!");
            error.code = 401;
            throw error;
        }

        const {title, content, imageUrl} = postInput;
        const errors = [];

        if (validator.isEmpty(title) || !validator.isLength(title, {min: 5})) {
            errors.push({message: "Title too short"});
        }

        if (validator.isEmpty(content) || !validator.isLength(content, {min: 5})) {
            errors.push({message: "Content too short"});
        }

        if (errors.length > 0) {
            const error = new Error('Validation failed');
            error.data = errors;
            error.code = 422;
            throw error;
        }

        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('Invalid user');
            error.code = 401;
            throw error;
        }

        const post = await Post.findById(id).populate('creator');
        if (!post) {
            const error = new Error('Post not found');
            error.code = 404;
            throw error;
        }

        if (post.creator._id.toString() !== req.userId.toString()) {
            const error = new Error('Not authorized');
            error.code = 403;
            throw error;
        }

        post.title = title;
        post.content = content;

        if (imageUrl !== 'undefined') {
            post.imageUrl = imageUrl;
        }

        await post.save();

        return {
            ...post._doc,
            _id: post._id.toString(),
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString()
        };
    },
    deletePost: async ({id}, req) => {
        if (!req.isAuth) {
            const error = new Error("Not authenticated!");
            error.code = 401;
            throw error;
        }

        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('Invalid user');
            error.code = 401;
            throw error;
        }

        const post = await Post.findById(id);
        if (!post) {
            const error = new Error('Post not found');
            error.code = 404;
            throw error;
        }

        if (post.creator.toString() !== req.userId.toString()) {
            const error = new Error('Not authorized');
            error.code = 403;
            throw error;
        }

        clearImage(post.imageUrl);
        await Post.findByIdAndRemove(id);

        user.posts.pull(id);
        await user.save();

        return true;
    },
    posts: async ({page = 1}, req) => {
        if (!req.isAuth) {
            const error = new Error("Not authenticated!");
            error.code = 401;
            throw error;
        }

        const totalItems = await Post.find().countDocuments();
        const posts = await Post.find()
            .populate('creator')
            .sort({createdAt: -1})
            .skip((page - 1) * 2)
            .limit(2);

        return {
            posts: posts.map(post => ({
                ...post._doc,
                _id: post._id.toString(),
                createdAt: post.createdAt.toISOString(),
                updatedAt: post.updatedAt.toISOString()
            })),
            totalPosts: totalItems
        };
    },
    post: async ({id}, req) => {
        if (!req.isAuth) {
            const error = new Error("Not authenticated!");
            error.code = 401;
            throw error;
        }

        const post = await Post.findById(id).populate('creator');
        if (!post) {
            const error = new Error("Post not found");
            error.code = 404;
            throw error;
        }

        return {
            ...post._doc,
            _id: post._id.toString(),
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString()
        };
    },
    user: async (args, req) => {
        if (!req.isAuth) {
            const error = new Error("Not authenticated!");
            error.code = 401;
            throw error;
        }

        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('Invalid user');
            error.code = 401;
            throw error;
        }

        return {
            ...user._doc,
            _id: user._id.toString()
        };
    },
    updateStatus: async ({status}, req) => {
        if (!req.isAuth) {
            const error = new Error("Not authenticated!");
            error.code = 401;
            throw error;
        }

        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('Invalid user');
            error.code = 401;
            throw error;
        }

        user.status = status;

        await user.save();

        return {
            ...user._doc,
            _id: user._id.toString()
        };
    }
};
