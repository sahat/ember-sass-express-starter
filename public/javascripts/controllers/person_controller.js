var PersonController = Ember.ObjectController.extend({
  actions: {
    destroy: function() {
      if (!confirm('Are you sure?')) return;
      this.get('model').deleteRecord();
      this.get('model').save();
      this.get('target.router').transitionTo('people');
    }
  }
});

module.exports = PersonController;
