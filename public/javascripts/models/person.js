var Person = DS.Model.extend({
  name: DS.attr('string'),
  age: DS.attr('number')
});

module.exports = Person;
