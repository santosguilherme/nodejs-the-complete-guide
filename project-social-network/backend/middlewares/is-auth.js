const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
        const error = new Error('Not authenticated!');
        error.statusCode = 500;
        throw error;
    }

    let decodedToken;

    try {
        const token = authHeader.split(' ')[1];
        decodedToken = jwt.verify(token, 'mysupersecredtkey');
    } catch (e) {
        e.statusCode = 500;
        throw e;
    }

    if (!decodedToken) {
        const error = new Error('Not authenticated!');
        error.statusCode = 500;
        throw error;
    }

    req.userId = decodedToken.userId;
    next();
};
