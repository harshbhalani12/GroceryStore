var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userSchema = new mongoose.Schema({
    userID : Number,
    email : String,
    password: String,   // hash for password
    firstName: String,
    lastName: String,
    status: Boolean
});

var productSchema = new mongoose.Schema({
    productID: Number,
    
});

//declare a model called User which has schema userSchema
mongoose.model("User",userSchema);

//declare a model called Post which has schema postSchema
mongoose.model("Post",postSchema);