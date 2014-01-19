var NewPersonRoute = Ember.Route.extend({
  renderTemplate: function() {
    this.render('edit_person', { controller: 'new_person' });
  },
  model: function() {
    return this.store.createRecord('person');
  },
  deactivate: function() {
    var model = this.get('controller.model');
    if (!model.get('isSaving')) {
      model.deleteRecord();
    }
  }
});

module.exports = NewPersonRoute;
