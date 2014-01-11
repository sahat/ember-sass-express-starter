// TODO: If development load templates folder
// TODO: if production point to dist folder and load from there

/**
 * Module dependencies.
 */
var express = require('express');
var fs = require('fs');
var flash = require('connect-flash');
var less = require('less-middleware');
var path = require('path');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(express);
var passport = require('passport');
var cluster = require('cluster');

/**
 * API keys and Passport configuration.
 */
var secrets = require('./config/secrets');
var passportConf = require('./config/passport');

if (cluster.isMaster) {
  var numCPUs = require('os').cpus().length;

  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('disconnect', function(worker, code, signal) {
    console.error('worker ' + worker.process.pid + ' died');
    cluster.fork();
  });
} else {

  /**
   * Connect to MongoDB.
   */
  var opts = { server: { auto_reconnect: true } };
  mongoose.connect(secrets.db, opts);

  var app = express();

  /**
   * Express configuration.
   */
  app.set('port', process.env.PORT || 3000);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.methodOverride());
  app.use(express.session({
    secret: '0000',
    store: new MongoStore({ db: secrets.db })
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(function(req, res, next) {
    res.locals.user = req.user;
    next();
  });
  app.use(flash());
  app.use(less({ src: __dirname + '/public', compress: true }));
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(function(req, res) {
    res.status(404);
    res.render('404');
  });
  app.use(express.errorHandler());

  /**
   * Routes.
   */
  app.get('/', function(req, res) {

  });

  app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
  });
}
