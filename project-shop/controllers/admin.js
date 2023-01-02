const {validationResult} = require('express-validator/check');

const Product = require("../models/product");

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
    const {title, imageUrl, description, price} = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: "Add Product",
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: {title, imageUrl, description, price},
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }

    new Product({title, price, description, imageUrl, userId: req.user})
        .save()
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch(console.error);
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
        .catch(console.error);
};

exports.postEditProduct = (req, res, next) => {
    const {_id, title, imageUrl, description, price} = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: "Edit Product",
            path: '/admin/edit-product',
            editing: true,
            hasError: true,
            product: {_id, title, imageUrl, description, price},
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
                title, imageUrl, description, price
            });

            return product.save()
                .then(() => {
                    res.redirect('/admin/products');
                });
        })
        .catch(console.error);
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
        .catch(console.error);
};

exports.postDeleteProduct = (req, res, next) => {
    const {id} = req.body;

    Product.deleteOne({_id: id, userId: req.user._id})
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch(console.error);
};
