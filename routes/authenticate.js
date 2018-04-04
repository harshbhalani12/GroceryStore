var express = require('express');
var bCrypt = require('bcrypt-nodejs');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = function(passport){

	//log in
	router.post('/login', function(req, res, next) {
		passport.authenticate('login', function(err, user, info) {
		  if (err) { return next(err); }
		  if (!user) { return res.json({'state':false,'message':'Username and Password do not match.'}); }
		  req.login(user, function(err) {
			if (err) { return next(err); }
			return res.json({'state':true,'name':user.name});
		  });
		})(req, res, next);
	});

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
					return res.json({"message":"Successfully signed up. Please login to start shopping!","state":true, name: name});
				});
		});
	});
	//log out
	router.post('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	// Creates hash of password using bCrypt
	var createHash = function(password){
		return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
	};

	return router;

}