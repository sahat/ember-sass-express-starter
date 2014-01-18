var App = Ember.Application.create();

App.ApplicationSerializer = DS.RESTSerializer.extend({
  primaryKey: '_id'
});

App.ApplicationAdapter = DS.RESTAdapter.extend({
  namespace: 'api'
});

Ember.Application.initializer({
  name: 'authentication',
  initialize: function(container, application) {
    Ember.SimpleAuth.setup(container, application);
  }
});

module.exports = App;
