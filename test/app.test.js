var request = require('supertest');
var should = require('chai').should();
var app  = require('../app');

describe('GET /api/v1/people', function() {
  it('should respond with a list of people', function(done) {
    request(app)
      .get('/api/v1/people')
      .expect(200)
      .end(function(err, res) {
        var response = res.body;
        response.should.have.property('person');
        response.person.should.be.instanceOf(Array);
        done();
      });
  });
});
