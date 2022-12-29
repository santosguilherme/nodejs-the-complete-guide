const {Schema, model} = require("mongoose");

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    cart: {
        items: [{
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }]
    }
});

userSchema.methods.addToCart = function (product) {
    const cartProductIndex = this.cart.items.findIndex(item => item.productId.toString() === product._id.toString());

    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
        const newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({productId: product._id, quantity: 1});
    }

    const cart = {
        items: updatedCartItems
    };

    this.cart = cart;

    return this.save();
};

userSchema.methods.deleteProductFromCart = function (productId) {
    this.cart.items = this.cart.items.filter(item => item.productId.toString() !== productId.toString());

    return this.save();
};

userSchema.methods.clearCart = function () {
    this.cart = {
        items: []
    };

    return this.save();
};

module.exports = model('User', userSchema);

// const {ObjectId} = require("mongodb");
//
// const {getDb} = require("../util/database");
//
// class User {
//     constructor(name, email, cart, _id) {
//         this.name = name;
//         this.email = email;
//         this.cart = cart;
//         this._id = _id ? new ObjectId(_id) : null;
//     }
//
//     save() {
//         const db = getDb();
//
//         return db.collection('users').insertOne(this);
//     }
//
//     addToCart(product) {
//         const cartProductIndex = this.cart.items.findIndex(item => item.productId.toString() === product._id.toString());
//
//         const updatedCartItems = [...this.cart.items];
//
//         if (cartProductIndex >= 0) {
//             const newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//             updatedCartItems[cartProductIndex].quantity = newQuantity;
//         } else {
//             updatedCartItems.push({productId: new ObjectId(product._id), quantity: 1});
//         }
//
//         const updatedCart = {
//             items: updatedCartItems
//         };
//
//         const db = getDb();
//
//         return db.collection('users').updateOne(
//             {_id: this._id},
//             {$set: {cart: updatedCart}}
//         );
//     }
//
//     getCart() {
//         const db = getDb();
//
//         const cartProductIds = this.cart.items.map(item => item.productId);
//
//         return db.collection('products')
//             .find({_id: {$in: cartProductIds}})
//             .toArray()
//             .then(products => {
//                 return products.map(product => {
//                     const {quantity} = this.cart.items.find(item => item.productId.toString() === product._id.toString());
//
//                     return {
//                         ...product,
//                         quantity
//                     };
//                 });
//             });
//     }
//
//     deleteProductFromCart(productId) {
//         const db = getDb();
//
//         const updatedCartItems = this.cart.items.filter(item => item.productId.toString() !== productId.toString());
//
//         return db.collection('users').updateOne(
//             {_id: this._id},
//             {$set: {cart: {items: updatedCartItems}}}
//         );
//     }
//
//     addOrder() {
//         const db = getDb();
//
//         return this.getCart()
//             .then(cartProducts => {
//                 const order = {
//                     items: cartProducts,
//                     user: {
//                         _id: this._id,
//                         name: this.name,
//                         email: this.email
//                     }
//                 };
//
//                 return db.collection('orders').insertOne(order);
//             })
//             .then(() => {
//                 this.cart = {items: []};
//
//                 return db.collection('users').updateOne(
//                     {_id: this._id},
//                     {$set: {cart: {items: []}}}
//                 );
//             });
//     }
//
//     getOrders() {
//         const db = getDb();
//
//         return db.collection('orders')
//             .find({'user._id': this._id})
//             .toArray();
//     }
//
//     static findById(id) {
//         const db = getDb();
//
//         return db.collection('users').findOne({_id: new ObjectId(id)});
//     }
// }
//
// module.exports = User;
