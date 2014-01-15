var LoginController = Ember.ObjectController.extend({
  actions: {
    login: function() {
      console.log('login');
      this.transitionToRoute('index');
    }
  }
});

module.exports = LoginController;

