var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Product = mongoose.model('Product');
var User = mongoose.model('User');

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
    .get(function(req, res) {
        if (req.user) {
            return res.json({ 'name': req.user.name, 'admin': req.user.admin });
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


router.put('/products/:id', multer(multerConf).single('productImage'), function(req, res) {
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
        product.save(function(err) {
            if (err) {
                res.send(err);
            }
            res.json({ state: 'Updated Successfully!' });
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
            res.json({ state: 'Safe delete complete' });
        });

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