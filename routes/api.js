var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Product = mongoose.model('Product');
var User = mongoose.model('User');
var Cart = mongoose.model('Cart');
var Purchase = mongoose.model('PurchaseRecord');
var async = require('async');

mongoose.Promise = global.Promise;

//for add product using multer
var multer = require('multer');
var multerConf = {
    storage: multer.diskStorage({
        destination: function(req, file, next) {
            next(null, './public/images');
        },
        filename: function(req, file, next) {
            console.log(file);
            const ext = file.mimetype.split('/')[1];
            next(null, file.originalname.substring(0, file.originalname.lastIndexOf('.')) + '.' + ext);
            //next(null,req.body.imgname+'.'+ext);
        }
    }),
    fileFilter: function(req, file, next) {
        if (!file) {
            next();
        }
        const image = file.mimetype.startsWith('image/');
        if (image) {
            next(null, true);
        } else {
            next({ message: "file type not supported" }, false);
        }
    }
};


//Used for routes that must be authenticated.
function isAuthenticated(req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler 
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects

    if (req.isAuthenticated()) {
        return next();
    }

    // if the user is not authenticated then redirect him to the login page
    return res.redirect('/#login');
};

//Register the authentication middleware
// router.use('/', isAuthenticated);


router.route('/user')
    .get(function(req,res){
        if(req.user){
            return res.json({'name':req.user.name,'admin':req.user.admin,'userID':req.user._id});
        }
        return res.json({});
    });

// router.post('/products',upload.single('photoFile'),(req,res,next) => {
// 	console.log(req.body);
// 	console.log(req.file);  
// 	// Everything went fine 
//   });
//   // if(req.user.admin){
// 	  // console.log(req.body);
// 	  // console.log(req.file);
//   // }
//   // else{
// 	  // return res.json({'state': false, 'message':'You are not authorized to perform this operation!'});


router.route('/products')
    .get(function(req, res) {
        Product.find(function(err, products) {
            if (err) {
                return res.send(500, err);
            }
            return res.json(products);
        });
    });

//router.post('/',multer(multerConf).single('productImage'),productCrud.addData);
router.post('/products', multer(multerConf).single('productImage'), function(req, res) {
    //res.send("hello in api.js");
    var postBody = req.body;
    console.log("post:" + req.file.originalname);
    var data = {
        productName: postBody.productName,
        productCategory: postBody.productCategory,
        productPrice: postBody.productPrice,
        productImage: req.file.originalname,
        stockQuantity: postBody.stockQuantity
    }
    console.log(data);

    var saveData = new Product(data);

    saveData.save(function(err, data) {
        if (err) {
            res.send(err);
        } else {
            res.redirect('/#!manage_products');
        }
    });

});


router.post('/products/:id', multer(multerConf).single('productImage'), function(req, res) {
    var putBody = req.body;

    console.log("put:" + req.file);
    Product.findById(req.params.id, function(err, product) {
        if (err) {
            res.send(err);
        }
        product.productName = putBody.productName;
        product.productCategory = putBody.productCategory;
        product.productPrice = putBody.productPrice;
        product.stockQuantity = putBody.stockQuantity;
        req.file ? product.productImage = req.file.originalname : {};
        putBody.isDeleted ? product.isDeleted = putBody.isDeleted : {};

        console.log(product);
        console.log("hello from cart");
        Cart.find({},function(err,carts){
            for(var cart in carts){
                var prodArr = carts[cart].products;
                
                for(var i = 0; i < prodArr.length; i++){
                    console.log(prodArr[i].id);
                    console.log(product._id);
                    if(prodArr[i].id == req.params.id){
                        if(product.stockQuantity === 0){
                            prodArr.splice(i,1);
                        }else{
                            prodArr[i].quantity = product.stockQuantity;
                            prodArr[i].productName = product.productName;
                            prodArr[i].price =  product.productPrice;
                    }
                }
                carts[cart].products = prodArr;
                    carts[cart].save(function(err){
                        if(err){
                            res.send(err);
                        }
                    });
                }
            }
        });
        product.save(function(err) {
            if (err) {
                res.send(err);
            }
            res.redirect('/#!');
        });
    });
});

router.delete('/products/:id', function(req, res) {
    Product.findById(req.params.id, function(err, product) {
        if (err) {
            res.send(err);
        }
        product.isDeleted = true;
        product.save(function(err) {
            if (err) {
                res.send(err);
            }
            Cart.find({},function(err,carts){
                for(var cart in carts){
                    var prodArr = carts[cart].products;
                    
                    for(var i = 0; i < prodArr.length; i++){
                        console.log(prodArr[i].id);
                        console.log(product._id);
                        if(prodArr[i].id == req.params.id){
                            prodArr.splice(i,1);
                            carts[cart].products = prodArr;
                            carts[cart].save(function(err){
                                if(err){
                                    res.send(err);
                                }
                            });
                        }
                    }
                }
                res.json({'state':'Safe delete complete'});
            });
        });
    });
});

router.get('/cart/:userID',function(req,res){
    console.log("Inside api")
    Cart.find({'userID':req.params.userID},function(err,cart){
        if(err){
            res.send(err);
        }
        else{
            res.json(cart);
        }
    });
});

// router.put('/cart/:userID',function(req,res){
//     var putBody = req.body;
//     var data = {
//         userID: req.params.userID,
//         products: putBody.products
//     };
//     var cart = new Cart(data);
//     cart.update(function(err){
//         if(err){
//             res.send(err);
//         }
//         else{
//             res.json({'state':true});
//         }
//     });
// });

router.put('/cart',function(req,res){
    var putBody = req.body;
    var query = { userID: putBody.userID};
    var update = {products: putBody.products,userID: putBody.userID};
    Cart.findOneAndUpdate(query,update,{upsert: true},function(err,cart){
        if(err){
            res.send(err);
        }
        else{
            res.json({'state':'Updated cart successfully!'});
        }
    });
});

router.get('/purchase/user/:userID',function(req,res){
    Purchase.find({'userID':req.params.userID},function(err,purchases){
        if(err){
            res.send(err);
        }
        else{
            res.json(purchases);
        }
    });
});

router.get('/purchase/:purchaseID',function(req,res){
    Purchase.findById(req.params.purchaseID,function(err,purchase){
        if(err){
            res.send(err);
        }
        else{
            res.json(purchase);
        }
    });
});

router.post('/purchase',function(req,res){
    var purchaseData = new Purchase(req.body);
    purchaseData.save(function(err,purchase){
        if(err){
            res.send(err);
        }
        else{
            var products = req.body.products;
            products.forEach(function(product){
                Product.findById(product._id,function(err, dbProduct){
                    if(err){
                        res.send(err);
                    }
                    else{
                        if(dbProduct.stockQuantity == product.quantity){
                            dbProduct.isDeleted = true;
                            dbProduct.stockQuantity -= product.quantity;
                        }
                        else{
                            dbProduct.stockQuantity -= product.quantity;
                        }
                        dbProduct.save(function(err){
                            if(err){
                                res.send(err);
                            }
                        });
                    }
                });
            });
            Cart.findOneAndRemove({'userID':req.body.userID},function(err){
                if(err){
                    res.send(err);
                }
                else{
                    res.json({'state':true,'purchaseID':purchase._id});
                }
            });
        }
    });
    
});

	// }
// router.route('/posts')

//     // return all posts
//     .get(function(req,res){
//         Post.find(function(err,posts){
//             if(err){
//                 return res.send(500,err);
//             }
//             return res.send(posts);
//         });
//     })
//     .post(function(req,res){
//         var post = new Post();
//         post.text = req.body.text;
//         post.username = req.body.created_by;
//         post.save(function(err,post){
//             if(err){
//                 return res.send(500,err);
//             }
//             return res.json(post);
//         });
//     });

// router.route('/posts/:id')

//     // Return a particular post
//     .get(function(req,res){
//         Post.findById(req.params.id,function(err,post){
//             if(err){
//                 res.send(err);
//             }
//             res.json(post);
//         });
//     })

//     // Update existing post
//     .put(function(req,res){
//         Post.findById(req.params.id,function(err,post){
//             if(err){
//                 res.send(err);
//             }
//             post.username = req.body.created_by;
//             post.text = req.body.text;
//             post.save(function(err,post){
//                 if(err){
//                     res.send(err);
//                 }
//                 res.json(post);
//             });
//         });
//     })

//     // Delete existing post
//     .delete(function(req,res){
//         Post.remove({
//             _id: req.params.id
//         },function(err){
//             if(err){
//                 res.send(err);
//             }
//             res.json("deleted :(");
//         });
//     });

module.exports = router;