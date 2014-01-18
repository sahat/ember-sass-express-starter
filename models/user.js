var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var crypto = require('crypto');

var userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  email: { type: String, unique: true },
  role: String,
  timeCreated: { type: Date, default: Date.now },
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
  user.token = crypto.createHash('sha1')
    .update(user.username)
    .digest('hex');
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if(err) return cb(err);
    cb(null, isMatch);
  });
};

module.exports = mongoose.model('User', userSchema);
