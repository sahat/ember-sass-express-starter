var EditPersonController = Ember.ObjectController.extend({
  actions: {
    save: function() {
      this.get('model').save();
      this.redirectToModel();
    },
    cancel: function() {
      this.transitionToRoute('people');
    }
  },
  redirectToModel: function() {
    var router = this.get('target');
    var model = this.get('model');
    router.transitionTo('person', model);
  }
});

module.exports = EditPersonController;
