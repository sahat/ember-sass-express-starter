var express = require('express');
var path = require('path');
var sass = require('node-sass');

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(sass.middleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  debug: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/users', function(req, res) {
  res.end(200)
});

app.get('/users/:id', function(req, res) {
  res.send(200);
});

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
