const express = require("express");
const {body} = require("express-validator/check");

const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

const validationRulesProduct = [
    body('title', 'Insert a valid title')
        .isString()
        .isLength({min: 3})
        .trim(),
    // body('imageUrl', 'Insert a valid image URL')
    //     .isURL()
    //     .trim(),
    body('price', 'Insert a valid price')
        .isFloat(),
    body('description', 'Insert a valid description')
        .isLength({min: 5, max: 400})
        .trim()
];

router.get('/add-product', isAuth, adminController.getAddProduct);

router.get('/products', isAuth, adminController.getProducts);

router.post('/add-product', validationRulesProduct, isAuth, adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product', validationRulesProduct, isAuth, adminController.postEditProduct);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;
