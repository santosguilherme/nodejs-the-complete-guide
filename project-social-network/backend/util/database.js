const mongoose = require("mongoose");

const DB_URI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.wjkaoqo.mongodb.net/project-social-network?retryWrites=true&w=majority`;

module.exports = mongoose.connect(DB_URI);
