const fs = require("fs");
const path = require("path");

const rootDir = require("../util/path");

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
    constructor(title) {
        this.title = title;
    }

    save() {
        getProductsFromFile(products => {
            products.push(this);

            fs.writeFile(productsFile, JSON.stringify(products), error => {
                console.error(error);
            });
        });
    }

    static fetchAll(callback) {
        getProductsFromFile(callback);
    }
};
