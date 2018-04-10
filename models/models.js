var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userSchema = new mongoose.Schema({
    email: String,
    password: String, // hash for password
    name : String,
    admin: Boolean
});

var productSchema = mongoose.Schema({
    productName:{
        type:String,
        required : true
    },
    productCategory:{
        type:String,
        required : true
    },
    productPrice:{
        type:String,
        required : true
    },
    productImage:{
        type:String,
        required : true
    }
},{collection:'products'});

var categorySchema = new mongoose.Schema({
    categoryNumber: Number,
    name: String
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