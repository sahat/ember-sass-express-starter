require('../vendor/jquery');
require('../vendor/handlebars');
require('../vendor/ember');
require('../vendor/ember-data');

var App = Ember.Application.create();

App.ApplicationSerializer = DS.RESTSerializer.extend({
  primaryKey: '_id'
});

App.ApplicationAdapter = DS.RESTAdapter.extend({
  namespace: 'api/v1'
});

module.exports = App;
