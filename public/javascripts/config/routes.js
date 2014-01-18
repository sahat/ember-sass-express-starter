var App = require('./app');

App.Router.map(function() {
  this.route('login');
  this.route('signup');
  this.route('people');
  this.resource('person', { path: '/people/:person_id' });
  this.route('edit_person', { path: '/people/:person_id/edit' });
  this.route('new_person', { path: '/people/new' });
});
