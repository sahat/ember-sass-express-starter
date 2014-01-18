var LogoutController = Ember.Controller.extend({
  init: function() {
    this.auth.signOut({
      data: {
        'username': this.auth.get('username')
      }
    });
  }
});

module.exports = LogoutController;
