const mongodb = require("mongodb");
const {MongoClient} = mongodb;

const DB_CONFIG = {
    password: "pS6KZ76eetv0Q6YL",
};

let _db;
const mongoConnect = (callback) => {
    MongoClient
        .connect(`mongodb+srv://root:${DB_CONFIG.password}@cluster0.wjkaoqo.mongodb.net/?retryWrites=true&w=majority`)
        .then((client) => {
            console.log("MongoDB connected!");
            _db = client.db();
            callback();
        })
        .catch(error => {
            console.error(error);
            throw error;
        });
};

const getDb = () => {
    if (_db) {
        return _db;
    }

    throw 'No database found';
};


module.exports = {mongoConnect, getDb};
