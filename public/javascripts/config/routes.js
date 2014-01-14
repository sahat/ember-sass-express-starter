var App = require('./app');

App.Router.map(function() {
  this.resource('login');
  this.resource('signup');
  this.resource('people');
  this.resource('person', { path: '/people/:person_id' });
  this.route('edit_person', { path: '/people/:person_id/edit' });
  this.route('new_person', { path: '/people/new' });
});
