var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Product = mongoose.model('Product');
var User = mongoose.model('User');

//Used for routes that must be authenticated.
function isAuthenticated (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects

	if (req.isAuthenticated()){
		return next();
	}

	// if the user is not authenticated then redirect him to the login page
	return res.redirect('/#login');
};

//Register the authentication middleware
// router.use('/', isAuthenticated);


router.route('/isAuthenticated')
    .get(function(req,res){
        return res.json({'authenticated':req.isAuthenticated()});
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
	.get(function(req,res){
		Product.find(function(err,products){
			if(err){
				return res.send(500,err);
			}
			return res.json(products);
		});	
	})
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
