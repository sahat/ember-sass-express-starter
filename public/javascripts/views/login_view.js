var LoginView = Ember.View.extend({
  submit: function() {
    this.get('controller').send('error', false);
  },

  focusPassword: function() {
    if (this.get('controller.error')) {
      this.$('#password').focus();
    }
  }.observes('controller.error')
});

module.exports = LoginView;

