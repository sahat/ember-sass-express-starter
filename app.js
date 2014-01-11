var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var sass = require('node-sass');

mongoose.connect('localhost');

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

app.get('/api/v1/people', function(req, res) {
  res.send({ person: [
    {
      name: 'Sahat',
      age: 25
    },
    {
      name: 'Olsen',
      age: 18
    }
  ]});
});

app.get('/api/v1/people/:id', function(req, res) {
  res.send(200);
});

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
