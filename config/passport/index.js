var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('mongoose').model('User');


module.exports = function(passport){

	passport.serializeUser(function(user, done) {
	  done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
	  User.findById(id, function(err, user) {
	    done(err, user);
	  });
	});



	passport.use('local-signup', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	}, function(req, email, password, done){

		process.nextTick(function(){

			User.findOne({'email': email}, function(err, user){
				if(err) {return done(err)}
				if(user){

					var error = new Error('That email is already taken.');
					error.name = 'IncorrectCredentialsError';
					return done(null, false, error);

				} else {

					var newUser = new User();
					newUser.email = email;
					newUser.password = newUser.generateHash(password);

					newUser.save(function(err){
						if(err) {return done(err);}
						return done(null, newUser);
					});
				}
			});

		});

	}));




	passport.use('local-signin', new LocalStrategy({

		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true

	}, function(req, email, password, done){

		if(email){
			email = email.toLowerCase();
		}

		process.nextTick(function(){

			User.findOne({'email': email}, function(err, user){
				if(err) {return done(err)}
				if(!user){

					var error = new Error('No user found.');
					error.name = 'IncorrectCredentialsError';
					return done(null, false, error);

				}
				if(!user.validPassword(password)){

					var error = new Error('Incorrect password.');
					error.name = 'IncorrectCredentialsError';
					return done(null, false, error);

				} 
				else {
					return done(null, user);	
				}
			});

		});

	}));

}