var LocalStrategy   = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var User = mongoose.model('User');


module.exports = function(passport){

	// Passport needs to be able to serialize and deserialize users to support persistent login sessions
	passport.serializeUser(function(user, done) {
        
        // tell passport which id to use for user
        console.log('serializing user:',user._id);
		return done(null, user._id);
	});

	passport.deserializeUser(function(id, done) {

        // return user object
        User.findById(id, function(err, user){
            if(err){
                return done(err,false);
            }
            if(!user){
                return done('user not found', false);
            }

            //we found the user object, provide it back to passport
            return done(null,user);
        });
	});

	passport.use('login', new LocalStrategy({
			passReqToCallback : true
		},
		function(req, email, password, done) { 
            User.findOne({email: email},
                function(err, user){
                    if(err){
                        return done(err,false);
                    }

                    //no user with given username
                    if(!user){
                        return done('user' + email +'not found!',false);
                    }
                    
                    if(!isValidPassword(user,password)){
                        console.log('Invalid password');
                        return done(null,false);
                    }
                    // successfully logged in
                    console.log('successfully logged in');
                    return done(null,user);
                    
            });
    }));
	
	var isValidPassword = function(user, password){
		return bCrypt.compareSync(password, user.password);
	};

};