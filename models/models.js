var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userSchema = new mongoose.Schema({
    email: String,
    password: String, // hash for password
    name : String,
    admin: {
        type: Boolean,
        default: false
    }
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
        type:Number,
        required : true
    },
    productImage:{
        type:String
    },
    stockQuantity:{
        type: Number,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
},{collection:'products'});

var categorySchema = new mongoose.Schema({
    categoryNumber: Number,
    name: String
});

var purchaseRecord = new mongoose.Schema({
    userID: { type: Schema.Types.ObjectId },
    products: [{
        _id: Schema.Types.ObjectId,
        productName: String,
        quantity: Number,
        price: Number
    }],
    timestamp: Date
});

var cart = new mongoose.Schema({
    userID: Schema.Types.ObjectId,
    products: [{
        _id: Schema.Types.ObjectId,
        productName: String,
        quantity: Number,
        price: Number
    }],
});

//declare a model called User which has schema userSchema
mongoose.model("User", userSchema);
mongoose.model("Category", categorySchema);
mongoose.model("Product", productSchema);
mongoose.model("PurchaseRecord", purchaseRecord);
mongoose.model("Cart", cart);
//declare a model called Post which has schema postSchema
//mongoose.model("Post",postSchema);