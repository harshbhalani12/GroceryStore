var express = require('express');
var bCrypt = require('bcrypt-nodejs');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = function(passport){

	//sends successful login state back to angular
	router.get('/success', function(req, res){
		res.send({state: 'success', user: req.user ? req.user : null});
	});

	//sends failure login state back to angular
	router.get('/failure', function(req, res){
		res.send({state: 'failure', user: null});
	});

	//log in
	router.post('/login', passport.authenticate('login', {
		successRedirect: '/auth/success',
		failureRedirect: '/auth/failure'
	}));

	//sign up
	router.post('/signup', function(req,res){
		var email = req.body.email;
		var name = req.body.name;
		var password = req.body.password;
		User.findOne({email: email},
			function(err,user){
				if(err){
					return res.json(err);
				}
				if(user){
					// we have already signed user up (user found)
					return res.json({"message":"User already exists! Please use a different email address.", "state": false});
				}
				var user = new User();
				
				user.name = name;
				user.email = email;
				user.password = createHash(password);
				user.save(function(err,user){
					if(err){
						return res.send(err);
					}
					req.login(user, function (err) {
						if ( ! err ){
							return res.json({"message":"Successfully signed up. Please login to start shopping!","state":true, email: email});
						} else {
							//handle error
							return res.send(err);
						}
					})
				});
		});
	});
	//log out
	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	// Creates hash of password using bCrypt
	var createHash = function(password){
		return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
	};

	return router;

}