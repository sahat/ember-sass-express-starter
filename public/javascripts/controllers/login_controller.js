var LoginController = Ember.ObjectController.extend({
  loginFailed: false,
  isProcessing: false,

  actions: {
    login: function() {
      this.setProperties({
        loginFailed: false,
        isProcessing: true
      });
      $.post('/login', {
        username: this.get('username'),
        password: this.get('password')
      }).done(function() {
        console.log('Login success');
      }).fail(function() {
        this.set('isProcessing', false);
        this.set('loginFailed', true);
      }.bind(this));
    }
  }
});

module.exports = LoginController;
