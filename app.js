var express = require('express'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	methodOverride = require('method-override'),
	session = require('express-session'),
	User = require('./models/user'),
	LocalStrategy = require('passport-local'), //Can leave out
	passportLocalMongoose = require('passport-local-mongoose'),
	swig = require('swig'),
	SpotifyStrategy = require('./lib/passport-spotify/index').Strategy;
	consolidate = require('consolidate');

	mongoose.connect('mongodb://localhost/passport-tutorial');

var appKey = '4a86fb700d44486f9be0320ef79ea53b';
var appSecret = 'c74e086282a44f3295c65041d229539c';

var app = express();

const PORT = 3000;

app.set('view engine', 'ejs'); //Forgot to install ejs, doing now
app.use(bodyParser.urlencoded({extended: true}));

app.use(passport.initialize());
app.use(passport.session());



passport.use(new SpotifyStrategy({
	clientID: appKey,
	clientSecret: appSecret,
	callbackURL: 'http://localhost:3000/callback'
	},
	function(accessToken, refreshToken, expires_in, profile, done) {
	  // asynchronous verification, for effect...
	  process.nextTick(function () {
		// To keep the example simple, the user's spotify profile is returned to
		// represent the logged-in user. In a typical application, you would want
		// to associate the spotify account with a user record in your database,
		// and return that user instead.
		return done(null, profile);
	  });
	}));

// configure Express
app.set('views', __dirname + '/views');

app.use(cookieParser());
app.use(bodyParser());
app.use(methodOverride());
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).

app.use(express.static(__dirname + '/public'));

app.engine('html', consolidate.swig);

app.get('/', function(req, res){
	res.render('index.html', { user: req.user });
  });
  
  app.get('/account', ensureAuthenticated, function(req, res){
	res.render('account.html', { user: req.user });
  });
  
  app.get('/login', function(req, res){
	res.render('login.html', { user: req.user });
  });

passport.serializeUser(function(user, done) {
	done(null, user);
  });
  
  passport.deserializeUser(function(obj, done) {
	done(null, obj);
  });

// GET /auth/spotify
//   Use passport.authenticate() as route middleware to authenticate the
//   request. The first step in spotify authentication will involve redirecting
//   the user to spotify.com. After authorization, spotify will redirect the user
//   back to this application at /auth/spotify/callback
app.get('/auth/spotify',
  passport.authenticate('spotify', {scope: ['user-read-email', 'user-read-private'], showDialog: true}),
  function(req, res){
// The request will be redirected to spotify for authentication, so this
// function will not be called.
});

// GET /auth/spotify/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request. If authentication fails, the user will be redirected back to the
//   login page. Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/callback',
  passport.authenticate('spotify', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed. Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
	res.redirect('/login');
  }

app.listen(PORT, process.env.IP, function(){
	console.log('server started geah');
	// console.log(process.env.PORT);
	// console.log(process.env.IP);
})