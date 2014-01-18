var LoginController = Ember.Controller.extend({
  loginFailed: false,
  isProcessing: false,

  actions: {
    login: function() {
      this.auth.signIn({
        data: this.getProperties('username', 'password')
      });

//  this.setProperties({
//        loginFailed: false,
//        isProcessing: true
//      });
//      $.post('/login', {
//        username: this.get('username'),
//        password: this.get('password')
//      }).done(function(data) {
//          console.log(data);
//          //this.reset();
//          this.set('token', data.token);
//          this.transitionToRoute('index');
//      }).fail(function(error) {
//        this.set('isProcessing', false);
//        this.set('loginFailed', true);
//      }.bind(this));
    }
  }
});

module.exports = LoginController;
