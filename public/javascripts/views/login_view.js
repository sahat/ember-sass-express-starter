var LoginView = Ember.View.extend({
  didInsertElement: function() {
    if (this.get('controller.error')) {
      this.$('#password').focus();
    }
  },
  willDestroyElement: function() {
    this.get('controller').send('error', false);
    this.get('context').set('errorMessage', null);
  }
});

module.exports = LoginView;

