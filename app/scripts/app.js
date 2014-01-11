var App = Ember.Application.create();

App.ApplicationAdapter = DS.FixtureAdapter;

/* Order and include as you please. */
require('scripts/controllers/*');
require('scripts/store');
require('scripts/models/*');
require('scripts/routes/*');
require('scripts/views/*');
require('scripts/router');
