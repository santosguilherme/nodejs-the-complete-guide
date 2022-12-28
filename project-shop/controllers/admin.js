const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: "Add Product",
        path: '/admin/add-product',
        editing: false
    });
};

exports.postAddProduct = (req, res, next) => {
    const {title, imageUrl, description, price} = req.body;

    req.user.createProduct({title, imageUrl, description, price})
        .then(() => {
            res.redirect('/');
        })
        .catch(console.error);
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit === "true";

    if (!editMode) {
        return res.redirect('/');
    }

    // req.user.getProducts({where: {id: req.params.productId}})
    Product.findByPk(req.params.productId)
        .then(product => {
            if (!product) {
                return res.redirect('/');
            }

            res.render('admin/edit-product', {
                pageTitle: "Edit Product",
                path: '/admin/edit-product',
                editing: editMode,
                product
            });
        })
        .catch(console.error);
};

exports.postEditProduct = (req, res, next) => {
    const {id, title, imageUrl, description, price} = req.body;

    Product.findByPk(id)
        .then(product => {
            product.update({title, imageUrl, description, price});

            return product.save();
        })
        .then((result) => {
            res.redirect('/admin/products');
        })
        .catch(console.error);
};

exports.getProducts = (req, res, next) => {
    req.user
        .getProducts()
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

    Product.findByPk(id)
        .then(product => {
            return product.destroy();
        })
        .then((result) => {
            res.redirect('/admin/products');
        })
        .catch(console.error);
};