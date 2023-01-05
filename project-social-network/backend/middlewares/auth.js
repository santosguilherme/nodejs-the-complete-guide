const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
        req.isAuth = false;
        return next();
    }

    let decodedToken;

    try {
        const token = authHeader.split(' ')[1];
        decodedToken = jwt.verify(token, 'mysupersecredtkey');
    } catch (e) {
        req.isAuth = false;
        return next();
    }

    if (!decodedToken) {
        req.isAuth = false;
        return next();
    }

    req.userId = decodedToken.userId;
    req.isAuth = true;

    next();
};
