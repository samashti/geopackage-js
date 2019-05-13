var GeoPackageAPI = require('../lib/index').GeoPackage
  , GeoPackageUtils = require('./geopackageUtils');

var path = require('path')
  , fs = require('fs');

describe('Create GeoPackage samples', function() {

  describe('Create a GeoPackage for OGC Certification', function() {
    var testGeoPackage = path.join(__dirname, 'fixtures', 'tmp', 'js-example.gpkg');
    var geopackage;

    before(function(done) {
      // remove the created geopackage
      if (typeof(process) !== 'undefined' && process.version) {
        fs.unlink(testGeoPackage, function() {
          fs.mkdir(path.dirname(testGeoPackage), function() {
            fs.open(testGeoPackage, 'w', done);
          });
        });
      } else {
        done();
      }
    });

    it('output a 1.2 compliant GeoPackage', async function() {
      this.timeout(60000);
      console.log('Create GeoPackage');
      try {
        let geopackage = await GeoPackageAPI.create(testGeoPackage)
        GeoPackageUtils.createCRSWKTExtension(geopackage)
        await GeoPackageUtils.createFeatures(geopackage)
        await GeoPackageUtils.createSchemaExtension(geopackage)
        await GeoPackageUtils.createGeometryIndexExtension(geopackage)
        GeoPackageUtils.createFeatureTileLinkExtension(geopackage)
        GeoPackageUtils.createNonLinearGeometryTypesExtension(geopackage)
        await GeoPackageUtils.createRTreeSpatialIndexExtension(geopackage)
        await GeoPackageUtils.createRelatedTablesMediaExtension(geopackage)
        await GeoPackageUtils.createRelatedTablesFeaturesExtension(geopackage)
        await GeoPackageUtils.insertExtraFeatures(geopackage)
        await GeoPackageUtils.createTiles(geopackage)
        await GeoPackageUtils.createWebPExtension(geopackage)
        await GeoPackageUtils.createAttributes(geopackage)
        GeoPackageUtils.createRelatedTablesSimpleAttributesExtension(geopackage)
        await GeoPackageUtils.createMetadataExtension(geopackage)
        await GeoPackageUtils.createCoverageDataExtension(geopackage)
        GeoPackageUtils.createPropertiesExtension(geopackage)
        geopackage.close();
      } catch (e) {
        console.log('error', e)
        should.fail(e)
      }
    });
  });

  describe('Create a GeoPackage with an attributes table', function() {

    var testGeoPackage = path.join(__dirname, 'fixtures', 'tmp', 'attributes.gpkg');
    var geopackage;

    before(function(done) {
      // remove the created geopackage
      if (typeof(process) !== 'undefined' && process.version) {
        fs.unlink(testGeoPackage, function() {
          fs.mkdir(path.dirname(testGeoPackage), function() {
            fs.open(testGeoPackage, 'w', done);
          });
        });
      } else {
        done();
      }
    });

    it('output an attributes GeoPackage', function() {
      this.timeout(60000);
      console.log('Create GeoPackage');

      return GeoPackageAPI.create(testGeoPackage)
      .then(function(gp) {
        console.log('Created GeoPackage');
        return geopackage = gp;
      })
      .then(GeoPackageUtils.createCRSWKTExtension)
      .then(GeoPackageUtils.createAttributes)
      .then(function() {
        geopackage.close();
      })
      .catch(function(error) {
        console.log('error', error);
        false.should.be.equal(true);
      });
    });
  });

});
