var LoginController = Ember.Controller.extend(Ember.SimpleAuth.LoginControllerMixin, {
  error: false,
  actions: {
    loginFailed: function(xhr) {
      this.set('error', true);
      this.set('errorMessage', xhr.responseText);
    },
    error: function(value) {
      console.log('error is now false');
      this.set('error', value);
    }
  }
});

module.exports = LoginController;
