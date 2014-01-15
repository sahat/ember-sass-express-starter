var SignupController = Ember.ObjectController.extend({
  actions: {
    signup: function() {
      console.log('signup');
      this.transitionToRoute('index');
    }
  }
});

module.exports = SignupController;

