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
                product
            });
        })
        .catch(console.error);
};

exports.postEditProduct = (req, res, next) => {
    const {_id, title, imageUrl, description, price} = req.body;

    Product.findById(_id)
        .then(product => {
            product.set({
                title, imageUrl, description, price
            });

            return product.save();
        })
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch(console.error);
};

exports.getProducts = (req, res, next) => {
    Product.find()
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

    Product.findByIdAndRemove(id)
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch(console.error);
};
