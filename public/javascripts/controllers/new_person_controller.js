var EditPersonController = require('./edit_person_controller');

// Inherit from edit controller
var NewPersonController = EditPersonController.extend();

module.exports = NewPersonController;
