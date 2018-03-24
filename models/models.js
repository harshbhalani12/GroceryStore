var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userSchema = new mongoose.Schema({
    email: String,
    password: String, // hash for password
    firstName: String,
    lastName: String,
    status: Boolean
});

var productSchema = new mongoose.Schema({
    name: String,
    image: String,
    categoryID: { type: Schema.Types.ObjectId, ref: 'Category' }
});

var categorySchema = new mongoose.Schema({
    name: String,
});

var purchaseRecord = new mongoose.Schema({
    productID: { type: Schema.Types.ObjectId, ref: 'Product' },
    userID: { type: Schema.Types.ObjectId, ref: 'User' },
    quantity: Number,
    price: Number,
    timestamp: Date
});

var cart = new mongoose.Schema({
    productID: { type: Schema.Types.ObjectId, ref: 'Product' },
    userID: { type: Schema.Types.ObjectId, ref: 'User' },
    cartQuantity: Number
});

//declare a model called User which has schema userSchema
mongoose.model("User", userSchema);
mongoose.model("Category", categorySchema);
mongoose.model("Product", productSchema);
mongoose.model("PurchaseRecord", purchaseRecord);
mongoose.model("Cart", cart);
//declare a model called Post which has schema postSchema
//mongoose.model("Post",postSchema);