const fs = require("fs");
const path = require("path");

const {validationResult} = require("express-validator");

const Post = require("../models/post");
const User = require("../models/user");

exports.getPosts = (req, res, next) => {
    const {page = 1} = req.query;
    const perPage = 2;
    let total = 0;

    Post.find()
        .countDocuments()
        .then(count => {
            total = count;

            return Post.find()
                .skip((page - 1) * perPage)
                .limit(perPage)
                .then(posts => {
                    res.status(200).json({posts, totalItems: total});
                });
        })
        .catch(error => {
            if (!error.statusCode) {
                error.statusCode = 500;
            }

            next(error);
        });
};

exports.getPost = (req, res, next) => {
    const {postId} = req.params;

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Could not find the post!');
                error.statusCode = 404;

                throw error;
            }

            res.status(200).json({post});
        })
        .catch(error => {
            if (!error.statusCode) {
                error.statusCode = 500;
            }

            next(error);
        });
};

exports.createPost = (req, res, next) => {
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

    const {title, content} = req.body;

    const post = new Post({
        title,
        content,
        imageUrl: req.file.path,
        creator: req.userId
    });

    // console.log(req.userId, post)

    post.save()
        .then(() => {
            return User.findById(req.userId);
        })
        .then(user => {
            user.posts.push(post);
            return user.save();
        })
        .then(user => {
            const {_id, name} = user;

            res.status(201).json({
                message: 'Post created!',
                post,
                creator: {_id, name}
            });
        })
        .catch(error => {
            if (!error.statusCode) {
                error.statusCode = 500;
            }

            next(error);
        });
};


exports.updatePost = (req, res, next) => {
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

    Post.findById(postId)
        .then(post => {
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

            return post.save();
        })
        .then((result) => {
            res.status(200).json({post: result});
        })
        .catch(error => {
            if (!error.statusCode) {
                error.statusCode = 500;
            }

            next(error);
        });
};

exports.deletePost = (req, res, next) => {
    const {postId} = req.params;

    Post.findById(postId)
        .then(post => {
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

            return Post.findByIdAndRemove(post._id);
        })
        .then(() => {
            return User.findById(req.userId);
        })
        .then(user => {
            user.posts.pull(postId);

            return user.save();
        })
        .then(() => {
            res.status(200).json({message: 'Post deleted!'});
        })
        .catch(error => {
            if (!error.statusCode) {
                error.statusCode = 500;
            }

            next(error);
        });
};

const clearImage = filePath => {
    const newFilePath = path.join(__dirname, '..', filePath);

    fs.unlink(newFilePath, error => {
        if (error) {
            throw error;
        }
    });
};
