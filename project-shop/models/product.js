const fs = require("fs");
const path = require("path");

const rootDir = require("../util/path");
const Cart = require("./cart");

const productsFile = path.join(rootDir, 'data', 'products.json');

const getProductsFromFile = callback => {
    fs.readFile(productsFile, (error, fileContent) => {
        if (error) {
            callback([]);
        } else {
            callback(JSON.parse(fileContent));
        }
    });
};
module.exports = class Product {
    constructor(id, title, imageUrl, description, price) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save() {
        getProductsFromFile(products => {
            if (this.id) {
                const existingProductIndex = products.findIndex(product => product.id === this.id);
                const updatedProducts = [...products];
                updatedProducts[existingProductIndex] = this;

                fs.writeFile(productsFile, JSON.stringify(updatedProducts), error => {
                    if (error) {
                        console.error("Error when updating the product", error);
                    }
                });
            } else {
                this.id = Date.now().toString();
                products.push(this);

                fs.writeFile(productsFile, JSON.stringify(products), error => {
                    if (error) {
                        console.error("Error when saving the product", error);
                    }
                });
            }
        });
    }

    static fetchAll(callback) {
        getProductsFromFile(callback);
    }

    static findById(id, callback) {
        getProductsFromFile((products) => {
            const product = products.find(product => product.id === id);

            callback(product);
        });
    }

    static deleteById(id) {
        getProductsFromFile((products) => {
            const product = products.find(product => product.id === id);
            const updatedProducts = products.filter(product => product.id !== id);

            fs.writeFile(productsFile, JSON.stringify(updatedProducts), error => {
                if (error) {
                    console.error("Error when delete the product", error);
                } else {
                    Cart.deleteProduct(id, product.price);
                }
            });
        });
    }
};
