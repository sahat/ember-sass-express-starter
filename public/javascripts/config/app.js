var App = Ember.Application.create();

App.ApplicationSerializer = DS.RESTSerializer.extend({
  primaryKey: '_id'
});

App.ApplicationAdapter = DS.RESTAdapter.extend({
  namespace: 'api'
});

module.exports = App;
