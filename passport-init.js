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
		function(req, username, password, done) { 
            
            User.findOne({username: username},
                function(err, user){
                    if(err){
                        return done(err,false);
                    }

                    //no user with given username
                    if(!user){
                        return done('user' + username +'not found!',false);
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

	passport.use('signup', new LocalStrategy({
			passReqToCallback : true // allows us to pass back the entire request to the callback
		},
		function(req, username, password, done) {

            User.findOne({username: username},
                function(err,user){
                    if(err){
                        return done(err,false);
                    }
                    if(user){
                        // we have already signed user up (user found)
                        return done(null,false);
                    }
                    var user = new User();
                    
                    user.username = username;
                    user.password = createHash(password);
                    user.save(function(err,user){
                        if(err){
                            return done(err, false);
                        }
                        console.log("Successfully signed up user "+username);
                        return done(null,user);
                    });
            });
		})
	);
	
	var isValidPassword = function(user, password){
		return bCrypt.compareSync(password, user.password);
	};
	// Generates hash using bCrypt
	var createHash = function(password){
		return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
	};

};