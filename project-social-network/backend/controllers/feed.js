const fs = require("fs");
const path = require("path");

const {validationResult} = require("express-validator");

const Post = require("../models/post");
const User = require("../models/user");
const tty = require("tty");

exports.getPosts = async (req, res, next) => {
    const {page = 1} = req.query;
    const perPage = 2;

    try {
        const totalItems = await Post.find().countDocuments();
        const posts = await Post.find()
            .populate('creator')
            .skip((page - 1) * perPage)
            .limit(perPage);

        res.status(200).json({posts, totalItems});
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }

        next(error);
    }
};

exports.getPost = async (req, res, next) => {
    const {postId} = req.params;

    try {
        const post = await Post.findById(postId);

        if (!post) {
            const error = new Error('Could not find the post!');
            error.statusCode = 404;

            throw error;
        }

        res.status(200).json({post});
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }

        next(error);
    }
};

exports.createPost = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is wrong!');
        error.statusCode = 422;
        throw error;
    }

    if (!req.file) {
        const error = new Error('Validation failed, no image provided!');
        error.statusCode = 422;
        throw error;
    }

    try {
        const {title, content} = req.body;

        const post = new Post({
            title,
            content,
            imageUrl: req.file.path,
            creator: req.userId
        });

        await post.save();

        const user = await User.findById(req.userId);
        user.posts.push(post);

        await user.save();

        const {_id, name} = user;

        res.status(201).json({
            message: 'Post created!',
            post,
            creator: {_id, name}
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }

        next(error);
    }
};


exports.updatePost = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is wrong!');
        error.statusCode = 422;
        throw error;
    }

    const {postId} = req.params;
    const {title, content, image} = req.body;
    let imageUrl = image;

    if (req.file) {
        imageUrl = req.file.path;
    }

    if (!imageUrl) {
        const error = new Error('Validation failed, no file picked!');
        error.statusCode = 422;
        throw error;
    }

    try {
        const post = await Post.findById(postId);

        if (!post) {
            const error = new Error('Could not find the post!');
            error.statusCode = 404;
            throw error;
        }

        if (post.creator._id.toString() !== req.userId) {
            const error = new Error('Not authorized!');
            error.statusCode = 403;
            throw error;
        }

        if (imageUrl !== post.imageUrl) {
            clearImage(post.imageUrl);
        }

        post.set({
            title,
            imageUrl,
            content
        });

        await post.save();

        res.status(200).json({post});
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }

        next(error);
    }
};

exports.deletePost = async (req, res, next) => {
    const {postId} = req.params;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            const error = new Error('Could not find the post!');
            error.statusCode = 404;

            throw error;
        }

        if (post.creator._id.toString() !== req.userId) {
            const error = new Error('Not authorized!');
            error.statusCode = 403;
            throw error;
        }

        clearImage(post.imageUrl);

        await Post.findByIdAndRemove(post._id);

        const user = await User.findById(req.userId);
        user.posts.pull(postId);

        await user.save();

        res.status(200).json({message: 'Post deleted!'});
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }

        next(error);
    }
};

const clearImage = filePath => {
    const newFilePath = path.join(__dirname, '..', filePath);

    fs.unlink(newFilePath, error => {
        if (error) {
            throw error;
        }
    });
};
