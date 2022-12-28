const fs = require("fs");
const path = require("path");

const rootDir = require("../util/path");

const cartFile = path.join(rootDir, 'data', 'cart.json');

module.exports = class Cart {
    static addProduct(id, productPrice) {
        fs.readFile(cartFile, (error, fileContent) => {
            let cart = {
                products: [],
                totalPrice: 0
            };

            if (!error) {
                cart = JSON.parse(fileContent);
            }

            const existingProductIndex = cart.products.findIndex(product => product.id === id);
            const existingProduct = cart.products[existingProductIndex];

            let updatedProduct;

            if (existingProduct) {
                updatedProduct = {
                    ...existingProduct,
                    qty: existingProduct.qty + 1
                };

                cart.products = [...cart.products];
                cart.products[existingProductIndex] = updatedProduct;
            } else {
                updatedProduct = {
                    id,
                    qty: 1
                };
                cart.products = [...cart.products, updatedProduct];
            }

            cart.totalPrice = cart.totalPrice + +productPrice;

            fs.writeFile(cartFile, JSON.stringify(cart), error => {
                if (error) {
                    console.error("Error when adding a product to the cart", error);
                }
            });
        });
    }

    static deleteProduct(id, productPrice) {
        fs.readFile(cartFile, (error, fileContent) => {
            if (error) {
                return;
            }

            const updatedCart = {...JSON.parse(fileContent)};
            const product = updatedCart.products.find(product => product.id === id);

            if (!product) {
                return;
            }

            updatedCart.products = updatedCart.products.filter(product => product.id !== id);
            updatedCart.totalPrice = updatedCart.totalPrice - productPrice * product.qty;

            fs.writeFile(cartFile, JSON.stringify(updatedCart), error => {
                if (error) {
                    console.error("Error when deleting a product from the cart", error);
                }
            });
        });
    }

    static getCart(callback) {
        fs.readFile(cartFile, (error, fileContent) => {
            callback(error ? null : JSON.parse(fileContent));
        });
    }
};
