var Verification = require('../../fixtures/verification')
  , testSetup = require('../../fixtures/testSetup')
  , Extension = require('../../../lib/extension').Extension
  , should = require('chai').should()
  , path = require('path');

describe('GeoPackage Extension Dao tests', function() {
  var testGeoPackage;
  var testPath = path.join(__dirname, '..', 'tmp');
  var tableName = 'test_features.test';
  var geopackage;

  beforeEach(function(done) {
    testGeoPackage = path.join(testPath, testSetup.createTempName());
    testSetup.createGeoPackage(testGeoPackage, function(err, gp) {
      geopackage = gp;
      done();
    });
  });

  afterEach(function(done) {
    geopackage.close();
    testSetup.deleteGeoPackage(testGeoPackage, done);
  });

  it('should create an extensions table', function() {
    var extensionDao = geopackage.getExtensionDao();
    return extensionDao.createTable()
    .then(function(result) {
      var verified = Verification.verifyExtensions(geopackage);
      verified.should.be.equal(true);
    });
  });

  it('should return false for an extension which does not exist', function() {
    var extensionDao = geopackage.getExtensionDao();
    extensionDao.queryByExtensionAndTableName('no', 'nope').should.be.equal(false)
  });

  it('should set the extension name', () => {
    var e = new Extension()
    e.setExtensionName('author', 'name')
    e.extension_name.should.be.equal('author_name')
  })

});
