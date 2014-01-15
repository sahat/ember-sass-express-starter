var LoginController = Ember.ObjectController.extend({
  actions: {
    login: function() {
      alert('Fake Login');
      this.transitionToRoute('index');
    }
  }
});

module.exports = LoginController;
