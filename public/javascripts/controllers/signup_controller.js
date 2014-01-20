var SignupController = Ember.Controller.extend({
  actions: {
    signup: function() {
      $.ajax({
        type: 'POST',
        url: '/signup',
        context: this,
        data: this.getProperties('username', 'email', 'password', 'confirmPassword')
      }).done(function() {
        this.transitionToRoute('login');
      }).fail(function(xhr) {
        this.set('errorMessage', xhr.responseText);
      });
    }
  }
});

module.exports = SignupController;
