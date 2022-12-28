const Product = require("../models/product");
const Cart = require("../models/cart");

exports.getProducts = (req, res, next) => {
    Product.fetchAll()
        .then(([rows, fieldsData]) => {
            res.render('shop/product-list', {
                products: rows,
                pageTitle: "All products",
                path: "/products"
            });
        })
        .catch(console.error);
};

exports.getProduct = (req, res, next) => {
    const {productId} = req.params;

    Product.findById(productId)
        .then(([products]) => {
            res.render('shop/product-detail', {
                product: products[0],
                pageTitle: "Product Details | " + product.title,
                path: "/products"
            });
        })
        .catch(console.error);
};

exports.getIndex = (req, res, next) => {
    Product.fetchAll()
        .then(([rows, fieldsData]) => {
            res.render('shop/index', {
                products: rows,
                pageTitle: "Shop",
                path: "/"
            });
        })
        .catch(console.error);

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
