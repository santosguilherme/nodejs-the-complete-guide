// const path = require("path");

const express = require("express");

// const rootDir = require("../util/path");
const adminRoutes = require("./admin");

const router = express.Router();

router.get('/', (req, res, next) => {
    const {products} = adminRoutes;
    // res.sendFile(path.join(rootDir, 'views', 'shop.html'));
    res.render('shop', {
        products,
        pageTitle: "My Shop List",
        path: "/",
        hasProducts: products.length > 0,
        renderProductStyles: true,
        isShopPageActive: true
    });
});

module.exports = router;
