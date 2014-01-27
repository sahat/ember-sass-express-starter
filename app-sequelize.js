/**
 * Module dependencies.
 */

var express = require('express');
var path = require('path');
var sass = require('node-sass');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var crypto = require('crypto');
var bcrypt = require('bcrypt');
var Sequelize = require('sequelize');

/**
 * Sequelize configuration
 */

var sequelize = new Sequelize('test', null, null, {
  dialect: 'sqlite'
});


/**
 * Person Schema.
 */

var Person = sequelize.define('Person', {
  name: { type: Sequelize.STRING },
  age: { type: Sequelize.INTEGER },
});

/**
 * User Schema.
 */

var User = sequelize.define('User', {
  username: { type: Sequelize.STRING, unique: true },
  email: { type: Sequelize.STRING, unique: true },
  password: { type: Sequelize.STRING },
  token: { type: Sequelize.STRING },
});

/**
 * User Schema pre-save hooks.
 * It is used for hashing and salting user's password and token.
 */

userSchema.pre('save', function(next) {
  var user = this;

  var hashContent = user.username + user.password + Date.now() + Math.random();
  user.token = crypto.createHash('sha1').update(hashContent).digest('hex');

  if (!user.isModified('password')) return next();
  bcrypt.genSalt(5, function(err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

/**
 * Helper method for comparing user's password input with a
 * hashed and salted password stored in the database.
 */

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if(err) return cb(err);
    cb(null, isMatch);
  });
};


/**
 * Passport setup.
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
  User.findOne({ username: username }, function(err, user) {
    if (err) return done(err);
    if (!user) return done(null, false);
    user.comparePassword(password, function(err, isMatch) {
      if (err) return done(err);
      if (isMatch) return done(null, user);
      return done(null, false);
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
app.use(sass.middleware({ src: path.join(__dirname, 'public') }));
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
  Person
    .sync()
    .on('success', function() {
      Person.findAll()
        .success(function(people) {
          res.send({ person: people });
        });
        .error(function(err) {
          next(err);
        });
    })
    .on('error', function(err) {
      res.send(500, err);
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
  Person
    .sync()
    .on('success', function() {
      Person.create(req.body.person)
        .success(function(person) {
          res.send({ person: person });
        })
        .error(function(err) {
          next(err);
        });
    })
    .on('error', function(err) {
      next(err);
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
 * POST /token
 * Sign in using email and password.
 * @param {string} username
 * @param {string} password
 */

app.post('/token', function(req, res, next) {
  passport.authenticate('local', function(err, user) {
    if (err) return next(err);
    if (user) res.send({ access_token: user.token });
    else res.send(404, 'Incorrect username or password.');
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
  if (!req.body.username) {
    return res.send(400, 'Username cannot be blank.');
  }

  if (!req.body.email) {
    return res.send(400, 'Email cannot be blank.');
  }

  if (!req.body.password) {
    return res.send(400, 'Password cannot be blank.');
  }

  if (req.body.password !== req.body.confirmPassword) {
    return res.send(400, 'Passwords do not match.');
  }

  var user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  });

  user.save(function(err) {
    if (err) return res.send(500, err.message);
    res.send(200);
  });
});

app.listen(app.get('port'), function() {
  console.log('Express server running on port ' + app.get('port'));
});
