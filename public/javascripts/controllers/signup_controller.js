var SignupController = Ember.ObjectController.extend({
  actions: {
    signup: function() {
      alert('Fake Signup');
      this.transitionToRoute('index');
    }
  }
});

module.exports = SignupController;
