const {validationResult} = require('express-validator/check');

const Product = require("../models/product");
const fileUtils = require("../util/file");

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: "Add Product",
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    });
};

exports.postAddProduct = (req, res, next) => {
    const {title, description, price} = req.body;
    const image = req.file;

    if (!image) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: "Add Product",
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: {title, description, price},
            errorMessage: 'Attached file is not an image',
            validationErrors: []
        });
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: "Add Product",
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: {title, description, price},
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }

    new Product({title, price, description, imageUrl: image.path, userId: req.user})
        .save()
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch((error) => {
            const err = new Error(error);
            err.statusCode = 500;

            return next(err);
        });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit === "true";

    if (!editMode) {
        return res.redirect('/');
    }

    Product.findById(req.params.productId)
        .then(product => {
            if (!product) {
                return res.redirect('/');
            }

            res.render('admin/edit-product', {
                pageTitle: "Edit Product",
                path: '/admin/edit-product',
                editing: editMode,
                product,
                hasError: false,
                errorMessage: null,
                validationErrors: []
            });
        })
        .catch((error) => {
            const err = new Error(error);
            err.statusCode = 500;

            return next(err);
        });
};

exports.postEditProduct = (req, res, next) => {
    const {_id, title, description, price} = req.body;
    const image = req.file;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: "Edit Product",
            path: '/admin/edit-product',
            editing: true,
            hasError: true,
            product: {_id, title, description, price},
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }

    Product.findById(_id)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/admin/products');
            }

            product.set({
                title, description, price
            });

            if (image) {
                fileUtils.deleteFile(product.imageUrl);

                product.imageUrl = image.path;
            }

            return product.save()
                .then(() => {
                    res.redirect('/admin/products');
                });
        })
        .catch((error) => {
            const err = new Error(error);
            err.statusCode = 500;

            return next(err);
        });
};

exports.getProducts = (req, res, next) => {
    Product.find({userId: req.user._id})
        // .select('title price -_id') // Return the selected fields
        // .populate('userId', 'name') // Populate the embedded objects
        .then((products) => {
            res.render('admin/products', {
                products,
                pageTitle: "Admin products",
                path: "/admin/products"
            });
        })
        .catch((error) => {
            const err = new Error(error);
            err.statusCode = 500;

            return next(err);
        });
};

exports.deleteProduct = (req, res, next) => {
    const {productId: id} = req.params;

    Product.findById(id)
        .then(product => {
            if (!product) {
                // return next(new Error('Product not found!'));
                return res.status(404).json({ message: 'Product not found!'});
            }

            fileUtils.deleteFile(product.imageUrl);

            return Product.deleteOne({_id: id, userId: req.user._id});
        })
        .then(() => {
            res.status(200).json({ message: 'Success!'});
        })
        .catch((error) => {
            res.status(500).json({ message: 'Deleting product failed!', error});
        });
};
