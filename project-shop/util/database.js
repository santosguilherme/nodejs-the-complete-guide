const mongoose = require("mongoose");

const DB_URI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.wjkaoqo.mongodb.net/nodejs-project-shop?retryWrites=true&w=majority`;

const mongooseConnection = mongoose.connect(DB_URI);

module.exports = {mongooseConnection, DB_URI};
