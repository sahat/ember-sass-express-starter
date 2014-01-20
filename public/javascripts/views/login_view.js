var LoginView = Ember.View.extend({
  willDestroyElement: function() {
    this.get('context').set('errorMessage', null);
  }
});

module.exports = LoginView;

