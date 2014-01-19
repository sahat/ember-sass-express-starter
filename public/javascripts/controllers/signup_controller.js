var SignupController = Ember.Controller.extend({
  actions: {
    signup: function() {
      $.post('/signup', {
        username: this.get('username'),
        email: this.get('email'),
        password: this.get('password')
      }).done(function(data) {
          this.transitionToRoute('login');
      }).fail(function(error) {
          console.log(error);
      }.bind(this));
    }
  }
});

module.exports = SignupController;
