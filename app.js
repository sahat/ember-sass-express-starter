/**
 * Module dependencies.
 */

var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var sass = require('node-sass');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var crypto = require('crypto');
var bcrypt = require('bcrypt');

/**
 * Mongoose configuration
 */

mongoose.connect('localhost');
mongoose.connection.on('error', function() {
  console.log('← MongoDB Connection Error →');
});

var personSchema = new mongoose.Schema({
  name:  String,
  age: Number
});

var Person = mongoose.model('Person', personSchema);

var userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  token: String
});

userSchema.pre('save', function(next) {
  var user = this;
  var SALT_FACTOR = 5;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if(err) return cb(err);
    cb(null, isMatch);
  });
};

var User = mongoose.model('User', userSchema);

/**
 * Passport configuration
 */

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(function(username, password, done) {
  console.log(username, password);
  User.findOne({ username: username }, function(err, user) {
    if (err) return done(err);
    if (!user) return done(null, false, { message: 'No match found for user: ' + username });
    user.comparePassword(password, function(err, isMatch) {
      if (err) return done(err);
      if(isMatch) {
        console.log('match')
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid username or password.' });
      }
    });
  });
}));

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.send(500, { message: 'Internal Server Error'});
});
app.use(sass.middleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Find person by id.
 *
 * @param {string} id
 * @returns {object} person
 */

app.get('/api/people/:id', function(req, res, next) {
  Person.findById(req.params.id, function(err, person) {
    if (err) return next(err);
    res.send({ person: person });
  });
});

/**
 * Find all people.
 *
 * @returns {object} person
 */

app.get('/api/people', function(req, res, next) {
  Person.find(function(err, people) {
    if (err) return next(err);
    res.send({ person: people });
  });
});

/**
 * Update person by id.
 *
 * @param {string} id
 * @returns {object} person
 */

app.put('/api/people/:id', function(req, res, next) {
  Person.findByIdAndUpdate(req.params.id, req.body.person, function(err, person) {
    if (err) return next(err);
    res.send({ person: person });
  });
});

/**
 * Create new person.
 *
 * @param {object} person
 * @returns {object} person
 */

app.post('/api/people', function(req, res, next) {
  var person = new Person(req.body.person);
  person.save(function(err) {
    if (err) return next(err);
    res.send({ person: person });
  });
});

/**
 * Delete person by id.
 *
 * @param {string} id
 * @returns 200 OK
 */

app.del('/api/people/:id', function(req, res, next) {
  Person.findById(req.params.id).remove(function(err) {
    if (err) return next(err);
    res.send(200);
  });
});

/**
 * Token
 */
app.post('/token', function(req, res, next) {
  if (req.body.grant_type === 'password') {
    passport.authenticate('local', function(err, user) {
      if (err) return next(err);
      if (!user) {
        console.log('no user');
        return res.send({ error: 'Invalid Grant' });
      }
      console.log(user.token);
      res.send({ access_token: user.token });
    })(req, res, next);
  } else {
    res.send(400, { 'error': 'Unsupported Grant Type' });
  }
});

/**
 * POST /login
 * Sign in using email and password.
 * @param {string} username|email
 * @param {string} password
 */

app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user) {
    if (err) return next(err);
    if (!user) {
      return res.send(404, { message: 'User not found' });
    }
    res.send({
      success: true,
      token: user.token
    });
  })(req, res, next);
});

/**
 * POST /signup
 * Create a new local account.
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @param {string} confirmPassword
 */

app.post('/signup', function(req, res, next) {
//  if (!req.body.email) {
//    return res.send(500, 'Email cannot be blank.');
//  }
//
//  if (!req.body.password) {
//    return res.send(500, 'Password cannot be blank.');
//  }
//
//  if (req.body.password !== req.body.confirmPassword) {
//    return res.send(500, 'Passwords do not match.');
//  }

  var user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    token: crypto.createHash('sha1').update(req.body.username + Date.now().toString()).digest('hex')
  });

  user.save(function(err) {
    if (err) return res.send(500, err.message);
    req.logIn(user, function(err) {
      if (err) return next(err);
      res.redirect('/');
    });
  });
});

function isValidToken(req, res, next) {
  var userToken = req.body.token || req.param('token') || req.headers.token;
  if (req.user.token || userToken != req.user.token) {
    res.send(401, { error: 'Invalid token. You provided: ' + userToken });
    return false;
  }
  return true;
}

app.listen(app.get('port'), function() {
  console.log('Express server running on port ' + app.get('port'));
});
