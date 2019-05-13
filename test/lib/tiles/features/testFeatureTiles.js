var FeatureTiles = require('../../../../lib/tiles/features').default
  , GeoPackageAPI = require('../../../../lib').GeoPackage
  , testSetup = require('../../../fixtures/testSetup')
  , fs = require('fs')
  , should = require('chai').should()
  , path = require('path');

describe('GeoPackage FeatureTiles tests', function() {

  describe('Rivers GeoPackage tests', function() {

    var geoPackage;
    var featureDao;
    var filename;

    function copyGeopackage(orignal, copy, callback) {
      if (typeof(process) !== 'undefined' && process.version) {
        var fsExtra = require('fs-extra');
        fsExtra.copy(orignal, copy, callback);
      } else {
        filename = orignal;
        callback();
      }
    }

    beforeEach('should open the geopackage', function(done) {
      var originalFilename = path.join(__dirname, '..', '..', '..', 'fixtures', 'rivers.gpkg');
      filename = path.join(__dirname, '..', '..', '..', 'fixtures', 'tmp', testSetup.createTempName());
      copyGeopackage(originalFilename, filename, function() {
        GeoPackageAPI.open(filename)
        .then(function(gp) {
          geoPackage = gp;
          should.exist(gp);
          should.exist(gp.getDatabase().getDBConnection());
          gp.getPath().should.be.equal(filename);
          featureDao = geoPackage.getFeatureDao('FEATURESriversds');
          done();
        });
      });
    });

    afterEach('should close the geopackage', function(done) {
      geoPackage.close();
      testSetup.deleteGeoPackage(filename, done);
    });

    it('should get the x: 1, y: 0, z: 1 tile', function(done) {
      this.timeout(30000);
      var ft = new FeatureTiles(featureDao);
      ft.drawTile(1, 0, 1)
      .then(function(image) {
        // fs.writeFileSync(path.join(__dirname, '..','..','..', 'fixtures','featuretiles','1_1_0.png'), image)
        testSetup.diffImages(image, path.join(__dirname, '..','..','..', 'fixtures','featuretiles','1_1_0.png'), 'png', function(err, equal) {
          equal.should.be.equal(true);
          done();
        });
      });
    });

    it('should return nothing from a feature table which does not exist', async function() {
      try {
        await GeoPackageAPI.getFeatureTileFromXYZ(geoPackage, 'nope', 1, 0, 1, 256, 256)
        false.should.be.equal(true);
      } catch (e) {
        should.exist(e)
      }
    });

    it('should get the x: 1, y: 0, z: 1 tile from the GeoPackage api', function(done) {
      this.timeout(30000);
      console.time('Generating non indexed tiles');
      GeoPackageAPI.getFeatureTileFromXYZ(geoPackage, 'FEATURESriversds', 1, 0, 1, 256, 256)
      .then(function(data) {
        should.exist(data);
        console.timeEnd('Generating non indexed tiles');
        testSetup.diffImages(data, path.join(__dirname, '..','..','..','fixtures','featuretiles','1_1_0.png'), 'png', function(err, equal) {
          equal.should.be.equal(true);
          done();
        });
      });
    });

    it('should get the x: 8, y: 12, z: 5 tile from the GeoPackage api', function(done) {
      this.timeout(30000);
      console.time('Generating non indexed tiles');
      GeoPackageAPI.getFeatureTileFromXYZ(geoPackage, 'FEATURESriversds', 8, 12, 5, 256, 256)
      .then(function(data) {
        should.exist(data);
        console.timeEnd('Generating non indexed tiles');
        // fs.writeFileSync(path.join(__dirname, '..','..','..', 'fixtures','featuretiles','5_8_12.png'), data)
        testSetup.diffImages(data, path.join(__dirname, '..','..','..','fixtures','featuretiles','5_8_12.png'), 'png', function(err, equal) {
          equal.should.be.equal(true);
          done();
        });
      });
    });
  });

  describe('Indexed Rivers GeoPackage tests', function() {

    var geoPackage;
    var featureDao;

    beforeEach('should open the geopackage', async function() {
      var filename = path.join(__dirname, '..', '..', '..', 'fixtures', 'rivers_indexed.gpkg');
      geoPackage = await GeoPackageAPI.open(filename)
      should.exist(geoPackage);
      should.exist(geoPackage.getDatabase().getDBConnection());
      geoPackage.getPath().should.be.equal(filename);
      featureDao = geoPackage.getFeatureDao('rivers');
    });

    afterEach('should close the geopackage', function() {
      geoPackage.close();
    });

    it('should get the x: 1, y: 0, z: 1 tile', function(done) {
      this.timeout(30000);
      var ft = new FeatureTiles(featureDao);
      ft.drawTile(1, 0, 1)
      .then(function(imageStream) {
        // fs.writeFileSync(path.join(__dirname, '..','..','..', 'fixtures','featuretiles','1_1_0_indexed.png'), imageStream)
        testSetup.diffImages(imageStream, path.join(__dirname, '..','..','..','fixtures','featuretiles','1_1_0_indexed.png'), 'png', function(err, equal) {
          equal.should.be.equal(true);
          done();
        });
      });
    });

    it('should get the x: 1, y: 0, z: 1 tile from the GeoPackage api', function(done) {
      this.timeout(30000);
      console.time('generating indexed tile');
      GeoPackageAPI.getFeatureTileFromXYZ(geoPackage, 'rivers', 1, 0, 1, 256, 256)
      .then(function(data) {
        console.timeEnd('generating indexed tile');
        should.exist(data);
        testSetup.diffImages(data, path.join(__dirname, '..','..','..','fixtures','featuretiles','1_1_0_indexed.png'), 'png', function(err, equal) {
          equal.should.be.equal(true);
          done();
        });
      });
    });

    it('should get the x: 0, y: 0, z: 0 tile from the GeoPackage api', function(done) {
      this.timeout(30000);
      console.time('generating indexed tile');
      GeoPackageAPI.getFeatureTileFromXYZ(geoPackage, 'rivers', 0, 0, 0, 256, 256)
      .then(function(data) {
        should.exist(data);
        console.timeEnd('generating indexed tile');
        // fs.writeFileSync(path.join(__dirname, '..','..','..', 'fixtures','featuretiles','0_0_0_indexed.png'), data)
        testSetup.diffImages(data, path.join(__dirname, '..','..','..','fixtures','featuretiles','0_0_0_indexed.png'), 'png', function(err, equal) {
          equal.should.be.equal(true);
          done();
        });
      });
    });

    it('should get the x: 8, y: 12, z: 5 tile from the GeoPackage api', function(done) {
      this.timeout(30000);
      console.time('generating indexed tile');
      GeoPackageAPI.getFeatureTileFromXYZ(geoPackage, 'rivers', 8, 12, 5, 256, 256)
      .then(function(data) {
        should.exist(data);
        console.timeEnd('generating indexed tile');
        // fs.writeFileSync(path.join(__dirname, '..','..','..', 'fixtures','featuretiles','5_8_12_indexed.png'), data)
        testSetup.diffImages(data, path.join(__dirname, '..','..','..','fixtures','featuretiles','5_8_12_indexed.png'), 'png', function(err, equal) {
          equal.should.be.equal(true);
          done();
        });
      });
    });

  });
});
