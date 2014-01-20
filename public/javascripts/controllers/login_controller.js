var LoginController = Ember.Controller.extend(Ember.SimpleAuth.LoginControllerMixin, {
  actions: {
    loginFailed: function(xhr) {
      this.set('errorMessage', xhr.responseText);
    }
  }
});

module.exports = LoginController;
