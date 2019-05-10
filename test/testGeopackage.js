import { GeoPackage, BoundingBox, FeatureColumn, TileColumn, GeometryColumns, DataTypes } from '../lib/index'
import { connectWithDatabase } from '../lib/db/geoPackageConnection'

var testSetup = require('./fixtures/testSetup');

var path = require('path')
  , fs = require('fs')
  , nock = require('nock')
  , mock = require('xhr-mock').default
  , PureImage = require('pureimage')
  , should = require('chai').should();

describe('GeoPackageAPI tests', function() {

  this.timeout(5000);

  var existingPath = path.join(__dirname, 'fixtures', 'rivers.gpkg');
  var geopackageToCreate = path.join(__dirname, 'tmp', 'tmp.gpkg');
  var tilePath = path.join(__dirname, 'fixtures', 'tiles', '0', '0', '0.png');
  var indexedPath = path.join(__dirname, 'fixtures', 'rivers_indexed.gpkg');
  var countriesPath = path.join(__dirname, 'fixtures', 'countries_0.gpkg');
  var base = 'http://ngageoint.github.io';
  var urlPath = '/GeoPackage/examples/rivers.gpkg';
  var url = base + urlPath;
  var badUrl = base + '/bad';
  var errorUrl = base + '/error';
  var tileUrl = base + '/tile.gpkg';

  beforeEach(function() {
    nock(base)
    .log(console.log)
    .get('/tile.gpkg')
    .replyWithFile(200, tilePath);
    nock(base)
    .log(console.log)
    .get(urlPath)
    .replyWithFile(200, existingPath);
    nock(base)
    .log(console.log)
    .get('/bad')
    .reply(404);
    nock(base)
    .log(console.log)
    .get('/error')
    .reply(500);
    mock.setup();
    mock.get(tileUrl, {
      body: fs.readFileSync(tilePath).buffer
    });
    mock.get(url, {
      body: fs.readFileSync(existingPath).buffer
    });
    mock.get(badUrl, {
      status: 404
    });
    mock.get(errorUrl, function() {
      return Promise.reject(new Error());
    })
  });

  afterEach(function() {
    nock.cleanAll();
    mock.teardown();
  });

  it('should open the geopackage', async function() {
    try {
      let geopackage = await GeoPackage.open(existingPath)
      should.exist(geopackage);
      should.exist(geopackage.getTables);
    } catch (err) {
      should.fail();
    }
  });

  it('should open the geopackage from an existing db', async function() {
    try {
      let geopackage = await GeoPackage.open(existingPath)
      should.exist(geopackage);
      should.exist(geopackage.getTables);
      var db = geopackage.getDatabase().getDBConnection();
      var connection = connectWithDatabase(db)
      geopackage.connection = connection;
      should.exist(geopackage.getTables);
    } catch (err) {
      should.fail();
    }
  });

  it('should open the geopackage with a promise', function() {
    return GeoPackage.open(existingPath)
    .then(function(geopackage) {
      should.exist(geopackage);
      should.exist(geopackage.getTables);
    });
  });

  it('should open the geopackage from a URL', async function() {
    try {
      let geopackage = await GeoPackage.open(url)
      should.exist(geopackage);
      should.exist(geopackage.getTables);
    } catch (err) {
      false.should.be.equal(true)
    }
  });

  it('should fail to open a file which is not a geopackage from a URL', async function() {
    try {
      await GeoPackage.open(tileUrl);
      false.should.be.equal(true)
    } catch (e) {
      console.log('error', e)
      should.exist(e);
    }
  });

  it('should throw an error if the URL does not return 200', function() {
    return GeoPackage.open(badUrl)
    .then(function(geopackage) {
      should.fail();
    })
    .catch(function(err) {
      should.exist(err);
    });
  });

  it('should throw an error if the URL returns an error', function() {
    return GeoPackage.open(errorUrl)
    .then(function(geopackage) {
      should.fail();
    })
    .catch(function(err) {
      should.exist(err);
    });
  });

  it('should not open a file without the minimum tables', function(done) {
    testSetup.createBareGeoPackage(geopackageToCreate, async function(err, gp) {
      try {
        await GeoPackage.open(geopackageToCreate)
        should.fail()
      } catch (err) {
        should.exist(err);
        testSetup.deleteGeoPackage(geopackageToCreate, done);
      }
    });
  });

  it('should not open a file without the correct extension', async function() {
    try {
      await GeoPackage.open(tilePath)
      should.fail();
    } catch (err) {
      should.exist(err);
    }
  });

  it('should not open a file without the correct extension via promise', function() {
    GeoPackage.open(tilePath)
    .catch(function(error) {
      should.exist(error);
    });
  });

  it('should open the geopackage byte array', function() {
    fs.readFile(existingPath, async function(err, data) {
      try {
        let geopackage = await GeoPackage.open(data)
        should.exist(geopackage);
      } catch (err) {
        should.fail();
      }
    });
  });

  it('should not open a byte array that is not a geopackage', function() {
    fs.readFile(tilePath, async function(err, data) {
      try {
        await GeoPackage.open(data)
        should.fail()
      } catch (err) {
        should.exist(err);
      }
    });
  });

  it('should not create a geopackage without the correct extension', async function() {
    try {
      await GeoPackage.create(tilePath)
      should.fail()
    } catch (err) {
      should.exist(err);
    }
  });

  it('should not create a geopackage without the correct extension return promise', function(done) {
    GeoPackage.create(tilePath)
    .then(function(geopackage) {
      // should not get called
      false.should.be.equal(true);
    })
    .catch(function(error) {
      should.exist(error);
      done();
    });
  });

  it('should create a geopackage', async function() {
    let gp = await GeoPackage.create(geopackageToCreate)
    should.exist(gp);
    should.exist(gp.getTables);
  });

  it('should create a geopackage with a promise', function() {
    GeoPackage.create(geopackageToCreate)
    .then(function(geopackage) {
      should.exist(geopackage);
      should.exist(geopackage.getTables);
    });
  });

  it('should create a geopackage and export it', async function() {
    let gp = await GeoPackage.create(geopackageToCreate);
    should.exist(gp);
    let buffer = gp.export()
    should.exist(buffer);
  });

  it('should create a geopackage in memory', async function() {
    let gp = await GeoPackage.create()
    should.exist(gp);
  });

  describe('should operate on a GeoPacakge with lots of features', function() {

    var indexedGeopackage;
    var originalFilename = countriesPath;
    var filename;

    function copyGeopackage(orignal, copy, callback) {
      if (typeof(process) !== 'undefined' && process.version) {
        var fsExtra = require('fs-extra');
        fsExtra.copy(originalFilename, filename, callback);
      } else {
        filename = originalFilename;
        callback();
      }
    }

    beforeEach('should open the geopackage', function(done) {
      filename = path.join(__dirname, 'fixtures', 'tmp', testSetup.createTempName());
      copyGeopackage(originalFilename, filename, async function(err) {
        try {
          indexedGeopackage = await GeoPackage.open(filename)
          should.exist(indexedGeopackage);
          done()
        } catch (err) {
          should.fail(err);
        }
      });
    });

    afterEach('should close the geopackage', function(done) {
      indexedGeopackage.close();
      testSetup.deleteGeoPackage(filename, done);
    });

    it('should get a vector tile countries_0 pbf tile', function() {
      this.timeout(0);
      return GeoPackage.getVectorTile(indexedGeopackage, 'country', 1, 2, 3)
      .then(function(json) {
        should.exist(json.layers['country']);
        json.layers['country'].length.should.be.equal(14);
      });
    });

    it('should get a vector tile country-name pbf tile', function() {
      this.timeout(0);
      return GeoPackage.getVectorTile(indexedGeopackage, 'country-name', 1, 2, 3)
      .then(function(json) {
        should.exist(json.layers['country-name']);
        json.layers['country-name'].length.should.be.equal(1);
      });
    });
  })

  describe('should operate on an indexed geopackage', function() {

    var indexedGeopackage;
    var originalFilename = indexedPath;
    var filename;

    function copyGeopackage(orignal, copy, callback) {
      if (typeof(process) !== 'undefined' && process.version) {
        var fsExtra = require('fs-extra');
        fsExtra.copy(originalFilename, filename, callback);
      } else {
        filename = originalFilename;
        callback();
      }
    }

    beforeEach('should open the geopackage', function(done) {
      filename = path.join(__dirname, 'fixtures', 'tmp', testSetup.createTempName());
      copyGeopackage(originalFilename, filename, async function(err) {
        try {
          indexedGeopackage = await GeoPackage.open(filename);
        } catch (err) {
          should.not.exist(err);
        }
        should.exist(indexedGeopackage);
        done();
      });
    });

    afterEach('should close the geopackage', function(done) {
      indexedGeopackage.close();
      testSetup.deleteGeoPackage(filename, done);
    });

    it('should get the tables', function() {
      var tables = indexedGeopackage.getTables();
      tables.should.be.deep.equal({ attributes: [], features: [ 'rivers' ], tiles: [ 'rivers_tiles' ] });
    });

    it('should get the tile tables', function() {
      var tables = indexedGeopackage.getTileTables();
      tables.should.be.deep.equal([ 'rivers_tiles' ]);
    });

    it('should get the feature tables', function() {
      var tables = indexedGeopackage.getFeatureTables();
      tables.should.be.deep.equal([ 'rivers' ]);
    });

    it('should check if it has feature table', function() {
      var exists = indexedGeopackage.hasFeatureTable('rivers');
      exists.should.be.equal(true);
    });

    it('should check if does not have feature table', function() {
      var exists = indexedGeopackage.hasFeatureTable('rivers_no');
      exists.should.be.equal(false);
    });

    it('should check if it has tile table', function() {
      var exists = indexedGeopackage.hasTileTable('rivers_tiles');
      exists.should.be.equal(true);
    });

    it('should check if does not have tile table', function() {
      var exists = indexedGeopackage.hasTileTable('rivers_tiles_no');
      exists.should.be.equal(false);
    });

    it('should get the 0 0 0 tile', function() {
      return GeoPackage.getTileFromXYZ(indexedGeopackage, 'rivers_tiles', 0, 0, 0, 256, 256)
      .then(function(tile) {
        should.exist(tile);
      });
    });

    it('should get the 0 0 0 tile in a canvas', function() {
      var canvas;
      if (typeof(process) !== 'undefined' && process.version) {
        canvas = PureImage.make(256, 256);
      } else {
        canvas = document.createElement('canvas');
      }
      return GeoPackage.drawXYZTileInCanvas(indexedGeopackage, 'rivers_tiles', 0, 0, 0, 256, 256, canvas);
    });

    it('should get the 4326 tile in a canvas', function() {
      var canvas;
      if (typeof(process) !== 'undefined' && process.version) {
        canvas = PureImage.make(256, 256);
      } else {
        canvas = document.createElement('canvas');
      }
      return GeoPackage.draw4326TileInCanvas(indexedGeopackage, 'rivers_tiles', 0, 0, 45, 45, 1, 256, 256, canvas);
    });

    it('should not get the table type for a table that does not exist', () => {
      should.not.exist(indexedGeopackage.getTableType('nope'))
    });

    it('should get the 0 0 0 vector tile', function() {
      var vectorTile = GeoPackage.getVectorTile(indexedGeopackage, 'rivers', 0, 0, 0);
      should.exist(vectorTile);
    });

    it('should query for the tiles in the bounding box', function() {
      var tiles = GeoPackage.getTilesInBoundingBoxWebZoom(indexedGeopackage, 'rivers_tiles', 0, -180, 180, -80, 80);
      tiles.tiles.length.should.be.equal(1);
    });

    it('should query for the tiles in the bounding box bad zoom level', function() {
      var tiles = GeoPackage.getTilesInBoundingBoxWebZoom(indexedGeopackage, 'rivers_tiles', 100, -180, 180, -80, 80);
      tiles.tiles.length.should.be.equal(0);
    });

    it('should add geojson to the geopackage and keep it indexed', function() {
      var id = GeoPackage.addGeoJSONFeatureToGeoPackageAndIndex(indexedGeopackage, {
        "type": "Feature",
        "properties": {
          'property_0': 'test'
        },
        "geometry": {
          "type": "Point",
          "coordinates": [
            -99.84374999999999,
            40.17887331434696
          ]
        }
      }, 'rivers');
      // ensure the last indexed changed
      var db = indexedGeopackage.getDatabase();
      var index = db.get('SELECT * FROM nga_geometry_index where geom_id = ?', [id]);
      index.geom_id.should.be.equal(id);
    });

    it('should fail to add geojson to the geopackage where the table does not exist', function() {
      try {
        var id = GeoPackage.addGeoJSONFeatureToGeoPackageAndIndex(indexedGeopackage, {
          "type": "Feature",
          "properties": {
            'property_0': 'test'
          },
          "geometry": {
            "type": "Point",
            "coordinates": [
              -99.84374999999999,
              40.17887331434696
            ]
          }
        }, 'nope');
        false.should.be.equal(true)
      } catch (e) {
        should.exist(e)
      }
    });

    it('should add geojson to the geopackage and keep it indexed and query it', function() {
      var id = GeoPackage.addGeoJSONFeatureToGeoPackageAndIndex(indexedGeopackage, {
        "type": "Feature",
        "properties": {
          'property_0': 'test'
        },
        "geometry": {
          "type": "Point",
          "coordinates": [
            -99.84374999999999,
            40.17887331434696
          ]
        }
      }, 'rivers');
      var features = GeoPackage.queryForGeoJSONFeaturesInTable(indexedGeopackage, 'rivers', new BoundingBox(-99.9, -99.8, 40.16, 40.18));
      features.length.should.be.equal(1);
    });

    it('should add geojson to the geopackage and keep it indexed and iterate it', function() {
      var id = GeoPackage.addGeoJSONFeatureToGeoPackageAndIndex(indexedGeopackage, {
        "type": "Feature",
        "properties": {
          'property_0': 'test'
        },
        "geometry": {
          "type": "Point",
          "coordinates": [
            -99.84374999999999,
            40.17887331434696
          ]
        }
      }, 'rivers')
      var iterator = GeoPackage.iterateGeoJSONFeaturesInTableWithinBoundingBox(indexedGeopackage, 'rivers', new BoundingBox(-99.9, -99.8, 40.16, 40.18))
      for (var geoJson of iterator) {
        geoJson.properties.Scalerank.should.be.equal('test');
      }
    });

    it('should add geojson to the geopackage and keep it indexed and iterate it and pull the features', function() {
      var id = GeoPackage.addGeoJSONFeatureToGeoPackageAndIndex(indexedGeopackage, {
        "type": "Feature",
        "properties": {
          'property_0': 'test'
        },
        "geometry": {
          "type": "Point",
          "coordinates": [
            -99.84374999999999,
            40.17887331434696
          ]
        }
      }, 'rivers')
      var iterator = GeoPackage.iterateGeoJSONFeaturesFromTable(indexedGeopackage, 'rivers');
      for (var geoJson of iterator.results) {
        should.exist(geoJson.properties);
      }
    });

    it('should fail to pull the features from a table that does not exist', function() {
      try {
        GeoPackage.iterateGeoJSONFeaturesFromTable(indexedGeopackage, 'nope');
        false.should.be.equal(true)
      } catch (e) {
        should.exist(e)
      }
    });
  });

  describe('operating on a new geopackage', function() {
    var geopackage;

    beforeEach(function(done) {
      fs.unlink(geopackageToCreate, async function() {
        geopackage = await GeoPackage.create(geopackageToCreate)
        should.exist(geopackage)
        done();
      });
    });

    it('should create a feature table', function() {
      var columns = [];

      var tableName = 'features';

      var geometryColumns = new GeometryColumns();
      geometryColumns.table_name = tableName;
      geometryColumns.column_name = 'geometry';
      geometryColumns.geometry_type_name = 'GEOMETRY';
      geometryColumns.z = 0;
      geometryColumns.m = 0;

      columns.push(FeatureColumn.createPrimaryKeyColumnWithIndexAndName(0, 'id'));
      columns.push(FeatureColumn.createColumnWithIndexAndMax(7, 'test_text_limited.test', DataTypes.GPKGDataType.GPKG_DT_TEXT, 5, false, null));
      columns.push(FeatureColumn.createColumnWithIndexAndMax(8, 'test_blob_limited.test', DataTypes.GPKGDataType.GPKG_DT_BLOB, 7, false, null));
      columns.push(FeatureColumn.createGeometryColumn(1, 'geometry', 'GEOMETRY', false, null));
      columns.push(FeatureColumn.createColumnWithIndex(2, 'test_text.test', DataTypes.GPKGDataType.GPKG_DT_TEXT, false, ""));
      columns.push(FeatureColumn.createColumnWithIndex(3, 'test_real.test', DataTypes.GPKGDataType.GPKG_DT_REAL, false, null));
      columns.push(FeatureColumn.createColumnWithIndex(4, 'test_boolean.test', DataTypes.GPKGDataType.GPKG_DT_BOOLEAN, false, null));
      columns.push(FeatureColumn.createColumnWithIndex(5, 'test_blob.test', DataTypes.GPKGDataType.GPKG_DT_BLOB, false, null));
      columns.push(FeatureColumn.createColumnWithIndex(6, 'test_integer.test', DataTypes.GPKGDataType.GPKG_DT_INTEGER, false, ""));

      geopackage.getFeatureTables().length.should.be.equal(0)

      return GeoPackage.createFeatureTable(geopackage, tableName, geometryColumns, columns)
      .then(function(featureDao) {
        should.exist(featureDao);
        var exists = geopackage.hasFeatureTable(tableName);
        exists.should.be.equal(true);
        var results = geopackage.getFeatureTables();
        results.length.should.be.equal(1);
        results[0].should.be.equal(tableName);
        return GeoPackage.addGeoJSONFeatureToGeoPackage(geopackage, {
          "type": "Feature",
          "properties": {
            'test_text_limited.test': 'test'
          },
          "geometry": {
            "type": "Point",
            "coordinates": [
              -99.84374999999999,
              40.17887331434696
            ]
          }
        }, tableName)
      })
      .then(function(id) {
        id.should.be.equal(1);
        return GeoPackage.addGeoJSONFeatureToGeoPackage(geopackage, {
          "type": "Feature",
          "properties": {
            'test_text_limited.test': 'test'
          },
          "geometry": {
            "type": "Point",
            "coordinates": [
              -99.84374999999999,
              40.17887331434696
            ]
          }
        }, tableName);
      })
      .then(function(id) {
        id.should.be.equal(2);
        return GeoPackage.getFeature(geopackage, tableName, 2);
      })
      .then(function(feature) {
        should.exist(feature);
        feature.id.should.be.equal(2);
        should.exist(feature.geometry);
        return GeoPackage.iterateGeoJSONFeaturesFromTable(geopackage, tableName);
      })
      .then(function(each) {
        var count = 0;
        for (var row of each.results) {
          count++;
        }
        count.should.be.equal(2);
      });
    });

    it('should create a 3857 feature table', function() {
      var columns = [];

      var tableName = 'features';

      var geometryColumns = new GeometryColumns();
      geometryColumns.table_name = tableName;
      geometryColumns.column_name = 'geometry';
      geometryColumns.geometry_type_name = 'GEOMETRY';
      geometryColumns.z = 0;
      geometryColumns.m = 0;

      columns.push(FeatureColumn.createPrimaryKeyColumnWithIndexAndName(0, 'id'));
      columns.push(FeatureColumn.createColumnWithIndexAndMax(7, 'test_text_limited.test', DataTypes.GPKGDataType.GPKG_DT_TEXT, 5, false, null));
      columns.push(FeatureColumn.createColumnWithIndexAndMax(8, 'test_blob_limited.test', DataTypes.GPKGDataType.GPKG_DT_BLOB, 7, false, null));
      columns.push(FeatureColumn.createGeometryColumn(1, 'geometry', 'GEOMETRY', false, null));
      columns.push(FeatureColumn.createColumnWithIndex(2, 'test_text.test', DataTypes.GPKGDataType.GPKG_DT_TEXT, false, ""));
      columns.push(FeatureColumn.createColumnWithIndex(3, 'test_real.test', DataTypes.GPKGDataType.GPKG_DT_REAL, false, null));
      columns.push(FeatureColumn.createColumnWithIndex(4, 'test_boolean.test', DataTypes.GPKGDataType.GPKG_DT_BOOLEAN, false, null));
      columns.push(FeatureColumn.createColumnWithIndex(5, 'test_blob.test', DataTypes.GPKGDataType.GPKG_DT_BLOB, false, null));
      columns.push(FeatureColumn.createColumnWithIndex(6, 'test_integer.test', DataTypes.GPKGDataType.GPKG_DT_INTEGER, false, ""));

      var boundingBox = new BoundingBox(-20026376.39, 20026376.39, -20048966.10, 20048966.10);
      return GeoPackage.createFeatureTableWithDataColumnsAndBoundingBox(geopackage, tableName, geometryColumns, columns, null, boundingBox, 3857)
      .then(function(featureDao) {
        should.exist(featureDao);
        var exists = geopackage.hasFeatureTable(tableName);
        exists.should.be.equal(true);
        var results = geopackage.getFeatureTables();
        results.length.should.be.equal(1);
        results[0].should.be.equal(tableName);
        return GeoPackage.addGeoJSONFeatureToGeoPackage(geopackage, {
          "type": "Feature",
          "properties": {
            'test_text_limited.test': 'test'
          },
          "geometry": {
            "type": "Point",
            "coordinates": [
              -99.84374999999999,
              40.17887331434696
            ]
          }
        }, tableName)
      })
      .then(function(id) {
        id.should.be.equal(1);
        return GeoPackage.addGeoJSONFeatureToGeoPackage(geopackage, {
          "type": "Feature",
          "properties": {
            'test_text_limited.test': 'test'
          },
          "geometry": {
            "type": "Point",
            "coordinates": [
              -99.84374999999999,
              40.17887331434696
            ]
          }
        }, tableName);
      })
      .then(function(id) {
        id.should.be.equal(2);
        return GeoPackage.getFeature(geopackage, tableName, 2);
      })
      .then(function(feature) {
        should.exist(feature);
        feature.id.should.be.equal(2);
        should.exist(feature.geometry);
        return GeoPackage.iterateGeoJSONFeaturesFromTable(geopackage, tableName);
      })
      .then(function(each) {
        var count = 0;
        for (var row of each.results) {
          count++;
        }
        count.should.be.equal(2);
      });
    });

    it('should create a tile table', function() {
      var columns = [];

      var tableName = 'tiles';

      var contentsBoundingBox = new BoundingBox(-180, 180, -80, 80);
      var contentsSrsId = 4326;
      var tileMatrixSetBoundingBox = new BoundingBox(-180, 180, -80, 80);
      var tileMatrixSetSrsId = 4326;
      return geopackage.createTileTableWithTableName(tableName, contentsBoundingBox, contentsSrsId, tileMatrixSetBoundingBox, tileMatrixSetSrsId)
      .then(function(tileMatrixSet) {
        should.exist(tileMatrixSet);
        var exists = geopackage.hasTileTable('tiles');
        exists.should.be.equal(true);
        var tables = geopackage.getTileTables();
        tables.length.should.be.equal(1);
        tables[0].should.be.equal('tiles');
      });
    });

    it('should create a standard web mercator tile table with the default tile size', function() {

      const tableName = 'tiles_web_mercator';
      const contentsBounds = new BoundingBox(-20037508.342789244, 20037508.342789244, -20037508.342789244, 20037508.342789244);
      const contentsSrsId = 3857;
      const matrixSetBounds = new BoundingBox(-20037508.342789244, 20037508.342789244, -20037508.342789244, 20037508.342789244);
      const tileMatrixSetSrsId = 3857;

      return GeoPackage.createStandardWebMercatorTileTable(geopackage, tableName, contentsBounds, contentsSrsId, matrixSetBounds, tileMatrixSetSrsId, 0, 3)
      .then(function(matrixSet) {
        matrixSet.table_name.should.equal(tableName);
        matrixSet.srs_id.should.equal(3857);
        matrixSet.min_x.should.equal(matrixSetBounds.minLongitude);
        matrixSet.max_x.should.equal(matrixSetBounds.maxLongitude);
        matrixSet.min_y.should.equal(matrixSetBounds.minLatitude);
        matrixSet.max_y.should.equal(matrixSetBounds.maxLatitude);

        const dbMatrixSet = geopackage.getTileMatrixSetDao().queryForId(tableName);
        dbMatrixSet.should.deep.equal(matrixSet);

        const matrixDao = geopackage.getTileMatrixDao();
        const matrices = matrixDao.queryForAll();

        matrices.length.should.equal(4);
        matrices.forEach(matrix => {
          matrix.tile_width.should.equal(256);
          matrix.tile_height.should.equal(256);
        });
      });
    });

    it('should create a standard web mercator tile table with a custom tile size', function() {

      const tableName = 'custom_tile_size';
      const contentsBounds = new BoundingBox(-31644.9297, 6697565.2924, 4127.5995, 6723706.7561);
      const matrixSetBounds = new BoundingBox(-20037508.342789244, 20037508.342789244, -20037508.342789244, 20037508.342789244);
      const tileSize = 320;

      return GeoPackage.createStandardWebMercatorTileTable(geopackage, tableName, contentsBounds, 3857, matrixSetBounds, 3857, 9, 13, tileSize)
      .then(function(matrixSet) {
        matrixSet.table_name.should.equal(tableName);
        matrixSet.srs_id.should.equal(3857);
        matrixSet.min_x.should.equal(matrixSetBounds.minLongitude);
        matrixSet.max_x.should.equal(matrixSetBounds.maxLongitude);
        matrixSet.min_y.should.equal(matrixSetBounds.minLatitude);
        matrixSet.max_y.should.equal(matrixSetBounds.maxLatitude);

        const dbMatrixSet = geopackage.getTileMatrixSetDao().queryForId(tableName);
        dbMatrixSet.should.deep.equal(matrixSet);

        const matrixDao = geopackage.getTileMatrixDao();
        const matrices = matrixDao.queryForAll();

        matrices.length.should.equal(5);
        matrices.forEach(matrix => {
          matrix.tile_width.should.equal(tileSize);
          matrix.tile_height.should.equal(tileSize);
        });
      });
    });

    it('should add a tile to the tile table', function(done) {
      var tableName = 'tiles_web_mercator_2';
      var contentsBoundingBox = new BoundingBox(-20037508.342789244, 20037508.342789244, -20037508.342789244, 20037508.342789244);
      var contentsSrsId = 3857;
      var tileMatrixSetBoundingBox = new BoundingBox(-20037508.342789244, 20037508.342789244, -20037508.342789244, 20037508.342789244);
      var tileMatrixSetSrsId = 3857;

      GeoPackage.createStandardWebMercatorTileTable(geopackage, tableName, contentsBoundingBox, contentsSrsId, tileMatrixSetBoundingBox, tileMatrixSetSrsId, 0, 0)
      .then(function(tileMatrixSet) {
        should.exist(tileMatrixSet);
        testSetup.loadTile(tilePath, function(err, tileData) {
          var result = geopackage.addTile(tileData, tableName, 0, 0, 0);
          result.should.be.equal(1);
          var tileRow = GeoPackage.getTileFromTable(geopackage, tableName, 0, 0, 0);
          testSetup.diffImages(tileRow.getTileData(), tilePath, function(err, equal) {
            equal.should.be.equal(true);
            done();
          });
        });
      });
    });

    it('should add a tile to the tile table and get it via xyz', function(done) {
      var columns = [];

      var tableName = 'tiles_web_mercator_3';

      var contentsBoundingBox = new BoundingBox(-20037508.342789244, 20037508.342789244, -20037508.342789244, 20037508.342789244);
      var contentsSrsId = 3857;
      var tileMatrixSetBoundingBox = new BoundingBox(-20037508.342789244, 20037508.342789244, -20037508.342789244, 20037508.342789244);
      var tileMatrixSetSrsId = 3857;

      GeoPackage.createStandardWebMercatorTileTable(geopackage, tableName, contentsBoundingBox, contentsSrsId, tileMatrixSetBoundingBox, tileMatrixSetSrsId, 0, 0)
      .then(function(tileMatrixSet) {
        should.exist(tileMatrixSet);
        fs.readFile(tilePath, function(err, tile) {
          var result = geopackage.addTile(tile, tableName, 0, 0, 0);
          result.should.be.equal(1);
          GeoPackage.getTileFromXYZ(geopackage, tableName, 0, 0, 0, 256, 256)
          .then(function(tile) {
            testSetup.diffImages(tile, tilePath, function(err, equal) {
              equal.should.be.equal(true);
              done();
            });
          });
        });
      });
    });

    it('should add a tile to the tile table and get it into a canvas via xyz', function(done) {
      var columns = [];

      var tableName = 'tiles_web_mercator_4';

      var contentsBoundingBox = new BoundingBox(-20037508.342789244, 20037508.342789244, -20037508.342789244, 20037508.342789244);
      var contentsSrsId = 3857;
      var tileMatrixSetBoundingBox = new BoundingBox(-20037508.342789244, 20037508.342789244, -20037508.342789244, 20037508.342789244);
      var tileMatrixSetSrsId = 3857;

      GeoPackage.createStandardWebMercatorTileTable(geopackage, tableName, contentsBoundingBox, contentsSrsId, tileMatrixSetBoundingBox, tileMatrixSetSrsId, 0, 0)
      .then(function(tileMatrixSet) {
        should.exist(tileMatrixSet);
        fs.readFile(tilePath, function(err, tile) {
          var result = geopackage.addTile(tile, tableName, 0, 0, 0);
          result.should.be.equal(1);
          var canvas;
          if (typeof(process) !== 'undefined' && process.version) {
            canvas = PureImage.make(256, 256);
          } else {
            canvas = document.createElement('canvas');
          }
          GeoPackage.drawXYZTileInCanvas(geopackage, tableName, 0, 0, 0, 256, 256, canvas)
          .then(function(tile) {
            testSetup.diffCanvas(canvas, tilePath, function(err, equal) {
              equal.should.be.equal(true);
              done();
            });
          });
        });
      });
    });
  });
});
