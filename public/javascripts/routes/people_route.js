var PersonRoute = Ember.Route.extend({
  model: function() {
    return this.store.find('person');
  }
});

module.exports = PersonRoute;
