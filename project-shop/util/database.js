const mongoose = require("mongoose");

const DB_PASSWORD = "pS6KZ76eetv0Q6YL";
const DB_URI = `mongodb+srv://root:${DB_PASSWORD}@cluster0.wjkaoqo.mongodb.net/nodejs-project-shop?retryWrites=true&w=majority`;

const mongooseConnection = mongoose.connect(DB_URI);


module.exports = {mongooseConnection, DB_URI};
