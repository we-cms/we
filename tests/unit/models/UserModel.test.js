/**
 * Model tests
 */

var should = require('should')
 , assert = require('assert')
 , uuid = require('node-uuid');

function userStub () {
  return {
    username: 'GNU/Linux'
    , name: uuid.v1()+'linux'
    , email: uuid.v1()+'@albertosouza.net'
    , password: '321'
    , sharedWithMe: []
  };
}

describe('UsersModel', function() {

  afterEach(function(done){
    // remove all users after each test block
    User.destroy(function (err) {
      if(err) {
        // console.log('error:', err);
        // return done(err);
      }
      done();
    });
  });

  describe('Create', function() {


    it('Should be able to create a user', function(done) {
      User.create(userStub(), function(err, user) {
        console.log('I>>>',err);
        if(err){ return done(err); }
        assert.notEqual(user, undefined);
        done();
      });
    });

    it('Should return error on create user with already registered email', function(done) {
      var newUser = userStub();

      // first create one user
      User.create(newUser, function(err) {
        if(err){ return done(err); }

        User.create(newUser, function(err, user) {
          err.should.not.be.empty;
          assert.equal(user, undefined);
          done();
        });

      });
    });

  });


  describe('Find', function() {
    var userSaved;

    before(function (done) {
      var newUser = userStub();
      // create one user
      User.create(newUser, function(err, user) {
        if(err) return done(err);

        userSaved = user;
        done();
      });
    });

    it("Should find by id and return one user object ", function(done) {
      var user;

      User.findOneById(userSaved.id).exec(function(err, user){
        if(err) return done(err);

        should.exist(user);
        user.should.be.an.instanceOf(Object);
        user.should.have.property('email', userSaved.email);
        user.should.have.property('id', userSaved.id);

        done();
      });
    });

  });

  describe('Update', function() {

    var userSaved;

    before(function (done) {
      var newUser = userStub();
      // create one user
      User.create(newUser, function(err, user) {
        if(err) return done(err);

        userSaved = user;
        done();
      });
    });


    it("Should update one user by id", function(done) {
      var userDataToUpdate = {
        name: uuid.v1()
      };

      User.update({
        id: userSaved.id
      }, userDataToUpdate ).exec(function (err, users) {
        if(err) return done(err);

        users.should.be.instanceof(Array);
        users.should.have.lengthOf(1);

        users[0].should.be.instanceof(Object);
        // check if are same user
        users[0].should.have.property('id', userSaved.id);

        done();

      });
    });

    it("Should update a user password");

    it("Should update a user config");


  });

  describe('Delete', function() {
    var userSaved;

    before(function (done) {
      var newUser = userStub();
      // create one user
      User.create(newUser, function(err, user) {
        if(err) return done(err);

        userSaved = user;
        done();
      });
    });

    it("Should delete user by id", function(done) {
      User.destroy({
        id: userSaved.id
      }).exec(function (err) {
        if(err) return done(err);

        User.findOneById(userSaved.id).exec(function(err, user){
          if(err) return done(err);

          should.not.exist(user);

          done();
        });

      });
    });

  });
});

