const Product = require("../models/product");
const Cart = require("../models/cart");

exports.getProducts = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render('shop/product-list', {
            products,
            pageTitle: "All products",
            path: "/products"
        });
    });
};

exports.getProduct = (req, res, next) => {
    const {productId} = req.params;

    Product.findById(productId, (product) => {

        res.render('shop/product-detail', {
            product,
            pageTitle: "Product Details | " + product.title,
            path: "/products"
        });
    });
};

exports.getIndex = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render('shop/index', {
            products,
            pageTitle: "Shop",
            path: "/"
        });
    });
};

exports.getCart = (req, res, next) => {
    Cart.getCart(cart => {
        Product.fetchAll(products => {
            const cartProducts = [];

            for (let product of products) {
                const cartProduct = cart.products.find(cartProd => cartProd.id === product.id);
                if (cartProduct) {
                    cartProducts.push({product, qty: cartProduct.qty});
                }
            }

            res.render('shop/cart', {
                pageTitle: "Your cart",
                path: "/cart",
                products: cartProducts
            });
        });
    });
};

exports.postCart = (req, res, next) => {
    const {productId} = req.body;

    Product.findById(productId, product => {
        Cart.addProduct(product.id, product.price);
        res.redirect("/cart");
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
    const {productId} = req.body;

    Product.findById(productId, product => {
        Cart.deleteProduct(product.id, product.price);
        res.redirect("/cart");
    });
};

exports.getOrders = (req, res, next) => {
    res.render('shop/orders', {
        pageTitle: "Your orders",
        path: "/orders"
    });
};

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        pageTitle: "Your cart",
        path: "/checkout"
    });
};
