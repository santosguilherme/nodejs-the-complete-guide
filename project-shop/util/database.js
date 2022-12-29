const mongoose = require("mongoose");

const DB_CONFIG = {
    password: "pS6KZ76eetv0Q6YL",
};

const mongooseConnection = mongoose.connect(
    `mongodb+srv://root:${DB_CONFIG.password}@cluster0.wjkaoqo.mongodb.net/nodejs-project-shop?retryWrites=true&w=majority`
);


module.exports = mongooseConnection;
