const Product = require("../models/product");

exports.getProducts = (req, res, next) => {
    Product.findAll()
        .then((products) => {
            res.render('shop/product-list', {
                products,
                pageTitle: "All products",
                path: "/products"
            });
        })
        .catch(console.error);
};

exports.getProduct = (req, res, next) => {
    const {productId} = req.params;

    Product.findById(productId)
        .then((product) => {
            res.render('shop/product-detail', {
                product,
                pageTitle: "Product Details | " + product.title,
                path: "/products"
            });
        })
        .catch(console.error);
};

exports.getIndex = (req, res, next) => {
    Product.findAll()
        .then((products) => {
            res.render('shop/index', {
                products,
                pageTitle: "Shop",
                path: "/"
            });
        })
        .catch(console.error);

};

exports.getCart = (req, res, next) => {
    req.user
        .getCart()
        .then(products => {
            res.render('shop/cart', {
                pageTitle: "Your cart",
                path: "/cart",
                products
            });
        })
        .catch(console.error);
};

exports.postCart = (req, res, next) => {
    const {productId} = req.body;

    Product.findById(productId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(() => {
            res.redirect("/cart");
        })
        .catch(console.error);
};

exports.postCartDeleteProduct = (req, res, next) => {
    const {productId} = req.body;

    req.user
        .deleteProductFromCart(productId)
        .then(() => {
            res.redirect("/cart");
        })
        .catch(console.error);
};

exports.getOrders = (req, res, next) => {
    req.user
        .getOrders()
        .then(orders => {
            res.render('shop/orders', {
                pageTitle: "Your orders",
                path: "/orders",
                orders
            });
        })
        .catch(console.error);

};

exports.postOrder = (req, res, next) => {
    req.user
        .addOrder()
        .then(() => {
            res.redirect('/orders');
        })
        .catch(console.error);
};

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        pageTitle: "Your cart",
        path: "/checkout"
    });
};
