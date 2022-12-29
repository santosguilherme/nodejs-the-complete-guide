const {ObjectId} = require("mongodb");

const {getDb} = require("../util/database");

class Product {
    constructor(title, price, description, imageUrl, id, userId) {
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this._id = id ? new ObjectId(id) : null;
        this.userId = userId;
    }

    save() {
        const db = getDb();

        if (this._id) {
            return db.collection('products')
                .updateOne(
                    {_id: this._id},
                    {$set: this}
                );
        }

        return db.collection('products').insertOne(this);
    }

    static findAll() {
        const db = getDb();

        return db.collection('products').find().toArray();
    }

    static findById(id) {
        const db = getDb();

        return db.collection('products').find({_id: new ObjectId(id)}).next();
    }

    static deleteById(id) {
        const db = getDb();

        return db.collection('products').deleteOne({_id: new ObjectId(id)});
    }
}


module.exports = Product;
