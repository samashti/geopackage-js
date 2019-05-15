var FeatureDao = require('../../../../lib/features/user/featureDao').default
  , FeatureColumn = require('../../../../lib/features/user/featureColumn').default
  , DataTypes = require('../../../../lib/db/dataTypes').default
  , GeoPackageAPI = require('../../../../lib/index.js').GeoPackage
  , BoundingBox = require('../../../../lib/boundingBox.js').default
  , GeometryData = require('../../../../lib/geom/geometryData').default
  , testSetup = require('../../../fixtures/testSetup')
  , SetupFeatureTable = require('../../../fixtures/setupFeatureTable')
  , RelatedTablesUtils = require('../../extension/relatedTables/relatedTablesUtils')
  , MediaTable = require('../../../../lib/extension/relatedTables/mediaTable').default
  , SimpleAttributesTable = require('../../../../lib/extension/relatedTables/simpleAttributesTable').default
  , wkx = require('wkx')
  , fs = require('fs')
  , path = require('path')
  , should = require('chai').should();

describe('FeatureDao tests', function() {

  describe('Non indexed test', function() {
    var geoPackage;

    function copyGeopackage(orignal, copy, callback) {
      if (typeof(process) !== 'undefined' && process.version) {
        var fsExtra = require('fs-extra');
        fsExtra.copy(orignal, copy, callback);
      } else {
        filename = orignal;
        callback();
      }
    }
    var filename;
    beforeEach('create the GeoPackage connection', function(done) {
      var originalFilename = path.join(__dirname, '..', '..', '..', 'fixtures', 'rivers.gpkg');
      filename = path.join(__dirname, '..', '..', '..', 'fixtures', 'tmp', testSetup.createTempName());
      copyGeopackage(originalFilename, filename, async function() {
        geoPackage = await GeoPackageAPI.open(filename)
        should.exist(geoPackage);
        should.exist(geoPackage.getDatabase().getDBConnection());
        geoPackage.getPath().should.be.equal(filename);
        done();
      });
    });

    afterEach('close the geopackage connection', function(done) {
      geoPackage.close();
      testSetup.deleteGeoPackage(filename, done);
    });

    it('will not get a feature dao with a null geometry columns', () => {
      try {
        geoPackage.getFeatureDaoWithGeometryColumns()
        false.should.be.equal(true)
      } catch (e) {
        should.exist(e)
      }
    })

    it('will not get a feature dao that does not exist', () => {
      try {
        geoPackage.getFeatureDao('nope')
        false.should.be.equal(true)
      } catch (e) {
        should.exist(e)
      }
    })

    it('should read the geometry', function() {
      var featureDao = geoPackage.getFeatureDao('FEATURESriversds');
      should.exist(featureDao);
      var each = featureDao.queryForEach();
      var srs = featureDao.srs;
      for (var row of each) {
        var currentRow = featureDao.getRow(row);
        var geometry = currentRow.getGeometry();
        should.exist(geometry);
      }
    });

    it('should query for a row with property_1 equal to Gila', function() {
      var featureDao = geoPackage.getFeatureDao('FEATURESriversds');

      for (var row of featureDao.queryForEach('property_1', 'Gila')) {
        row.property_1.should.be.equal('Gila');
      }
    });
  });

  describe('Indexed test', function() {
    var geoPackage;
    var featureDao;

    var originalFilename = path.join(__dirname, '..', '..', '..', 'fixtures', 'rivers_indexed.gpkg');
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
      filename = path.join(__dirname, '..', '..', '..', 'fixtures', 'tmp', testSetup.createTempName());
      copyGeopackage(originalFilename, filename, async function(err) {
        geoPackage = await GeoPackageAPI.open(filename)
        should.exist(geoPackage);
        should.exist(geoPackage.getDatabase().getDBConnection());
        geoPackage.getPath().should.be.equal(filename);
        featureDao = geoPackage.getFeatureDao('rivers');
        done();
      });
    });

    afterEach('should close the geopackage', function(done) {
      geoPackage.close();
      testSetup.deleteGeoPackage(filename, done);
    });

    it.only('should query for indexed geometries', async function() {
      var count = 0;
      var bbox = new BoundingBox(-13189576.119, -13126488.564, 6637372.21, 6607360.178);
      var iterator = await featureDao.queryIndexedFeaturesWithWebMercatorBoundingBox(bbox);
      for (var row of iterator) {
        count++;
        row.values.property_1.should.be.equal('Columbia');
        should.exist(row.getValueWithColumnName('geom'));
        should.exist(row.getValueWithColumnName('id'));
        should.exist(row.getValueWithColumnName('property_0'));
        should.exist(row.getValueWithColumnName('property_1'));
        should.exist(row.getValueWithColumnName('property_2'));
      }
      count.should.be.equal(1);
    });
  });

  describe('Query For Shapes', function() {
    var geoPackage;
    var featureDao;

    var originalFilename = path.join(__dirname, '..', '..', '..', 'fixtures', 'test_shapes_two_points.gpkg');
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

    beforeEach('should copy the geopackage', function(done) {
      filename = path.join(__dirname, '..', '..', '..', 'fixtures', 'tmp', testSetup.createTempName());
      copyGeopackage(originalFilename, filename, done);
    });

    afterEach('should close the geopackage', function(done) {
      testSetup.deleteGeoPackage(filename, done);
    });

    it('should query for GeoJSON features', function() {
      var bb = new BoundingBox(-.4, -.6, 2.4, 2.6);
      GeoPackageAPI.queryForGeoJSONFeaturesInTableFromPath(filename, 'QueryTest', bb)
      .then(function(features) {
        features[0].properties.name.should.be.equal('box1');
      });
    });

    it('should iterate GeoJSON features', function() {
      var count = 0;
      var bb = new BoundingBox(-.4, -.6, 2.4, 2.6);
      GeoPackageAPI.iterateGeoJSONFeaturesFromPathInTableWithinBoundingBox(filename, 'QueryTest', bb)
      .then(function(iterator) {
        for (var feature of iterator) {
          feature.properties.name.should.be.equal('box1');
          count++;
        }
        count.should.be.equal(1);
      });
    });
  });

  describe('rivers 2 test', function() {
    var geoPackage;
    var featureDao;

    var originalFilename = path.join(__dirname, '..', '..', '..', 'fixtures', 'rivers2.gpkg');
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
      filename = path.join(__dirname, '..', '..', '..', 'fixtures', 'tmp', testSetup.createTempName());
      copyGeopackage(originalFilename, filename, async function(err) {
        geoPackage = await GeoPackageAPI.open(filename)
        should.exist(geoPackage);
        should.exist(geoPackage.getDatabase().getDBConnection());
        geoPackage.getPath().should.be.equal(filename);
        featureDao = geoPackage.getFeatureDao('FEATURESriversds');
        done();
      });
    });

    afterEach('should close the geopackage', function(done) {
      geoPackage.close();
      testSetup.deleteGeoPackage(filename, done);
    });

    it('should query for rivers and calculate distance from a center point', function() {
      var pointToLineDistance = require('@turf/point-to-line-distance').default;
      var polygonToLine = require('@turf/polygon-to-line').default;
      var booleanPointInPolygon = require('@turf/boolean-point-in-polygon').default;
      var pointDistance = require('@turf/distance').default;

      var bb = new BoundingBox(-179, 0, 0, 80);
      var centerPoint = { type: 'Feature',
       properties: {},
       geometry:
        { type: 'Point',
          coordinates: [ -105.92193603515625, 34.406906587428736 ] } };


      var iterator = featureDao.queryForGeoJSONIndexedFeaturesWithBoundingBox(bb);
      var foundFeatures = [];
      var closestDistance = 100000000000;
      var closest;

      for (var row of iterator) {
        foundFeatures.push(row);
        var geometry = row.geometry;

        if (geometry.type == 'Point') {
          var distance = pointDistance(centerPoint, geometry);
          if (distance < closestDistance) {
            closest = row;
            closestDistance = distance;
          } else if (distance == closestDistance && closest.type != 'Point') {
            closest = row;
            closestDistance = distance;
          }
        } else if (geometry.type == 'LineString') {
          var distance = pointToLineDistance(centerPoint, geometry);
          if (distance < closestDistance) {
            closest = row;
            closestDistance = distance;
          } else if (distance == closestDistance && closest.type != 'Point') {
            closest = row;
            closestDistance = distance;
          }
        } else if (geometry.type == 'Polygon') {
          if (booleanPointInPolygon(centerPoint, geometry)) {
            if (closestDistance != 0) {
              closest = row;
              closestDistance = 0;
            }
          } else {
            var line = polygonToLine(geometry);
            var distance = pointToLineDistance(centerPoint, line);
            if (distance < closestDistance) {
              closest = row;
              closestDistance = distance;
            }
          }
        }
      }
      closest.properties.Name.should.be.equal('Rio Grande');
    });
  });

  describe('Query tests', function() {
    var geopackage;
    var queryTestFeatureDao;
    var testPath = path.join(__dirname, '..', '..', '..', 'fixtures', 'tmp');
    var testGeoPackage;
    var tileBuffer;

    afterEach('should delete the geopackage', function(done) {
      testSetup.deleteGeoPackage(testGeoPackage, done);
    });

    beforeEach('get the tile buffer', function(done) {
      testSetup.loadTile(path.join(__dirname, '..', '..', '..', 'fixtures', 'tiles', '0', '0', '0.png'), function(err, buffer) {
        tileBuffer = buffer;
        done();
      });
    });

    beforeEach('should create the GeoPackage', async function() {
      testGeoPackage = path.join(testPath, testSetup.createTempName());
      geopackage = await testSetup.createGeoPackage(testGeoPackage)

      var geometryColumns = SetupFeatureTable.buildGeometryColumns('QueryTest', 'geom', wkx.wkt.GeometryCollection);
      var boundingBox = new BoundingBox(-180, 180, -80, 80);

      var columns = [];

      columns.push(FeatureColumn.createPrimaryKeyColumnWithIndexAndName(0, 'id'));
      columns.push(FeatureColumn.createGeometryColumn(1, 'geom', wkx.wkt.Point, false, null));
      columns.push(FeatureColumn.createColumnWithIndex(2, 'name', DataTypes.GPKGDataType.GPKG_DT_TEXT, false, ""));
      columns.push(FeatureColumn.createColumnWithIndex(3, '_feature_id', DataTypes.GPKGDataType.GPKG_DT_TEXT, false, ""));
      columns.push(FeatureColumn.createColumnWithIndex(4, '_properties_id', DataTypes.GPKGDataType.GPKG_DT_TEXT, false, ""));

      var box1 = {
        "type": "Polygon",
        "coordinates": [
          [
            [
              -1,
              1
            ],
            [
              1,
              1
            ],
            [
              1,
              3
            ],
            [
              -1,
              3
            ],
            [
              -1,
              1
            ]
          ]
        ]
      };

      var box2 = {
        "type": "Polygon",
        "coordinates": [
          [
            [
              0,
              0
            ],
            [
              2,
              0
            ],
            [
              2,
              2
            ],
            [
              0,
              2
            ],
            [
              0,
              0
            ]
          ]
        ]
      };

      var multiPoly = {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [
                40,
                40
              ],
              [
                42,
                40
              ],
              [
                42,
                42
              ],
              [
                40,
                42
              ],
              [
                40,
                40
              ]
            ]
          ],
          [
            [
              [
                39,
                41
              ],
              [
                41,
                41
              ],
              [
                41,
                43
              ],
              [
                39,
                43
              ],
              [
                39,
                41
              ]
            ]
          ]
        ]
      }

      var line = {
        "type": "LineString",
        "coordinates": [
          [
            2,
            3
          ],
          [
            -1,
            0
          ]
        ]
      };

      var multiLinestring = {
        "type": "MultiLineString",
        "coordinates": [[
          [
            12.0,
            12.5
          ],
          [
            10.5,
            10
          ]
        ],
        [
          [
            22.0,
            22.5
          ],
          [
            20.5,
            20
          ]
        ]]
      };

      var point = {
        "type": "Point",
        "coordinates": [
          0.5,
          1.5
        ]
      };

      var point2 = {
        "type": "Point",
        "coordinates": [
          1.5,
          .5
        ]
      };

      var createRow = function(geoJson, name, featureDao) {
        var srs = featureDao.getSrs();
        var featureRow = featureDao.newRow();
        var geometryData = new GeometryData();
        geometryData.setSrsId(srs.srs_id);
        var geometry = wkx.Geometry.parseGeoJSON(geoJson);
        geometryData.setGeometry(geometry);
        featureRow.setGeometry(geometryData);
        featureRow.setValueWithColumnName('name', name);
        featureRow.setValueWithColumnName('_feature_id', name);
        featureRow.setValueWithColumnName('_properties_id', 'properties' + name);
        return featureDao.create(featureRow);
      }

      var createWKTRow = function(wkt, name, featureDao) {
        var srs = featureDao.getSrs();
        var featureRow = featureDao.newRow();
        var geometryData = new GeometryData();
        geometryData.setSrsId(srs.srs_id);
        var geometry = wkx.Geometry._parseWkt(wkt)
        geometryData.setGeometry(geometry);
        featureRow.setGeometry(geometryData);
        featureRow.setValueWithColumnName('name', name);
        featureRow.setValueWithColumnName('_feature_id', name);
        featureRow.setValueWithColumnName('_properties_id', 'properties' + name);
        return featureDao.create(featureRow);
      }
      // create the features
      // Two intersecting boxes with a line going through the intersection and a point on the line
      // ---------- / 3
      // | 1  ____|/_____
      // |    |  /|  2  |
      // |____|_/_|     |
      //      |/        |
      //      /_________|
      //     /
      await geopackage.createFeatureTableWithGeometryColumns(geometryColumns, boundingBox, 4326, columns)
      var featureDao = geopackage.getFeatureDao('QueryTest');
      queryTestFeatureDao = featureDao;
      createRow(box1, 'box1', featureDao);
      createRow(box2, 'box2', featureDao);
      createRow(line, 'line', featureDao);
      createRow(point, 'point', featureDao);
      createRow(point2, 'point2', featureDao);
      createRow(multiLinestring, 'multilinestring', featureDao);
      createRow(multiPoly, 'multipolygon', featureDao)
      createWKTRow("LINESTRING ZM (2 3 1 2,-1 0 3 4)", 'linemz', featureDao);
      await featureDao.featureTableIndex.index()
    })

    it('should update a shape', function() {
      var line;
      for (var feature of queryTestFeatureDao.queryForEach('_feature_id', 'line')) {
        line = queryTestFeatureDao.getRow(feature);
      }
      line.setValueWithColumnName('name', 'UpdatedLine');
      line.setValueWithColumnName('_properties_id', 'properties_update')
      var newLine;
      queryTestFeatureDao.update(line);
      for (var feature of queryTestFeatureDao.queryForEach('_feature_id', 'line')) {
        newLine = queryTestFeatureDao.getRow(feature);
      }
      newLine.getValueWithColumnName('name').should.be.equal('UpdatedLine');
      newLine.getValueWithColumnName('_properties_id').should.be.equal('properties_update')
    });

    it('should count by a field', function(){
      var count = queryTestFeatureDao.count('name', 'line');
      count.should.be.equal(1);
    });

    it('should count by a field and return zero if no result comes back', function(){
      queryTestFeatureDao.gpkgTableName = 'nope'
      var count = queryTestFeatureDao.count('name', 'line');
      count.should.be.equal(0);
    });

    it('should query for _feature_id', function() {
      var row = GeoPackageAPI.getFeature(geopackage, 'QueryTest', 'line');
      row.properties.name.should.be.equal('line');
    });

    it('should query for _properties_id', function() {
      var row = GeoPackageAPI.getFeature(geopackage, 'QueryTest', 'propertiesline');
      row.properties.name.should.be.equal('line');
    });

    it('should get the bounding box', () => {
      let bb = queryTestFeatureDao.getBoundingBox()
      bb.minLongitude.should.be.equal(-180)
      bb.maxLongitude.should.be.equal(180)
      bb.minLatitude.should.be.equal(-80)
      bb.maxLatitude.should.be.equal(80)
    })

    it('should query for the bounding box', function() {
      var bb = new BoundingBox(-.4, -.6, 2.4, 2.6);
      var iterator = queryTestFeatureDao.queryForGeoJSONIndexedFeaturesWithBoundingBox(bb);
      for (var row of iterator) {
        row.properties.name.should.be.equal('box1');
      }
    });

    it('should get features in the bounding box', async function() {
      var bb = new BoundingBox(-.4, -.6, 2.4, 2.6);
      let iterator = await GeoPackageAPI.getFeaturesInBoundingBox(geopackage, 'QueryTest', -.4, -.6, 2.4, 2.6)
      for (var feature of iterator) {
        console.log('feature.getGeometryColumnIndex()', feature.getGeometryColumnIndex())
        feature.getGeometryColumnIndex().should.be.equal(1)
        feature.values.name.should.be.equal('box1');
      }
    });

    it('should not get features in the bounding box when the table does not exist', async function() {
      var bb = new BoundingBox(-.4, -.6, 2.4, 2.6);
      try {
        await GeoPackageAPI.getFeaturesInBoundingBox(geopackage, 'nope', -.4, -.6, 2.4, 2.6)
        false.should.be.equal(true)
      } catch (error) {
        should.exist(error)
      }
    });

    it('should query for multilinestring', function() {
      var bb = new BoundingBox(9, 20, 9, 20);
      var iterator = queryTestFeatureDao.queryIndexedFeaturesWithBoundingBox(bb)
      var found = false
      for (var row of iterator) {
        found = true
        console.log('row.values.name', row.values.name)
        row.values.name.should.be.equal('multilinestring');
      }
      found.should.be.equal(true)
    })
  
    it('should query for multilinestring intersect', function() {
      var bb = new BoundingBox(11, 20, 11, 20);
      var iterator = queryTestFeatureDao.queryIndexedFeaturesWithBoundingBox(bb)
      var found = false
      for (var row of iterator) {
        found = true
        console.log('row.values.name', row.values.name)
        row.values.name.should.be.equal('multilinestring');
      }
      found.should.be.equal(true)
    })

    it('should query for multipolygon', function() {
      var bb = new BoundingBox(40, 49, 40, 49);
      var iterator = queryTestFeatureDao.queryIndexedFeaturesWithBoundingBox(bb)
      var found = false
      for (var row of iterator) {
        found = true
        row.values.name.should.be.equal('multipolygon');
      }
      found.should.be.equal(true)
    })

    it('should query for multipolygon within', function() {
      var bb = new BoundingBox(30, 50, 30, 50);
      var iterator = queryTestFeatureDao.queryIndexedFeaturesWithBoundingBox(bb)
      var found = false
      for (var row of iterator) {
        found = true
        row.values.name.should.be.equal('multipolygon');
      }
      found.should.be.equal(true)
    })

    it('should query for box 1', function() {
      // var bb = new BoundingBox(minLongitudeOrBoundingBox, maxLongitude, minLatitude, maxLatitude)
      var bb = new BoundingBox(-.4, -.6, 2.4, 2.6);
      var iterator = queryTestFeatureDao.queryIndexedFeaturesWithBoundingBox(bb)
      var found = false
      for (var row of iterator) {
        found = true
        row.values.name.should.be.equal('box1');
      }
      found.should.be.equal(true)
    });

    it('should query for box 1 within the query', function() {
      // var bb = new BoundingBox(minLongitudeOrBoundingBox, maxLongitude, minLatitude, maxLatitude)
      var bb = new BoundingBox(-2, 4, -2, 4);
      var iterator = queryTestFeatureDao.queryIndexedFeaturesWithBoundingBox(bb)
      var found = false
      for (var row of iterator) {
        found = found || row.values.name === 'box1'
      }
      found.should.be.equal(true)
    });

    it('should query for box 2', function() {
      var bb = new BoundingBox(1.1, 1.3, .4, .6);
      var iterator = queryTestFeatureDao.queryIndexedFeaturesWithBoundingBox(bb);
      var found = false
      for (var row of iterator) {
        found = true
        row.values.name.should.be.equal('box2');
      };
      found.should.be.equal(true)
    });

    it('should query for box1, box 2 and line and linemz', function() {
      var bb = new BoundingBox(-.1, .1, .9, 1.1);
      var foundFeatures = [];
      var iterator = queryTestFeatureDao.queryIndexedFeaturesWithBoundingBox(bb);

      for (var row of iterator) {
        foundFeatures.push(row.values.name);
      }
      foundFeatures.should.be.deep.equal(['box1', 'box2', 'line', 'linemz']);
    });

    it('should query for box1, box 2, line, linemz, and point', function() {
      var bb = new BoundingBox(.4, .6, 1.4, 1.6);
      var foundFeatures = [];
      var iterator = queryTestFeatureDao.queryIndexedFeaturesWithBoundingBox(bb);
      for (var row of iterator) {
        foundFeatures.push(row.values.name);
      }
      foundFeatures.should.be.deep.equal(['box1', 'box2', 'line', 'point', 'linemz']);
    });

    it('should query using an envelope and find nothing', function() {
      var bb = new BoundingBox(.4, .6, 1.4, 1.6);
      var envelope = bb.buildEnvelope();
      envelope.minM = 0
      envelope.maxM = 1
      envelope.minZ = -1
      envelope.maxZ = 0
      envelope.hasZ = true;
      envelope.hasM = true;
      var foundFeatures = [];
      var iterator = queryTestFeatureDao.featureTableIndex.queryWithGeometryEnvelope(envelope);
      for (var row of iterator) {
        foundFeatures.push(row.name);
      }
      foundFeatures.should.be.deep.equal([]);
    });

    it('should query for box1, box 2, line, linemz, and point with envelope', function() {
      var bb = new BoundingBox(.4, .6, 1.4, 1.6);
      var envelope = bb.buildEnvelope();
      envelope.minM = 0
      envelope.maxM = 10
      envelope.minZ = 0
      envelope.maxZ = 10
      envelope.hasZ = true;
      envelope.hasM = true;
      var foundFeatures = [];
      var iterator = queryTestFeatureDao.featureTableIndex.queryWithGeometryEnvelope(envelope);
      for (var row of iterator) {
        foundFeatures.push(row.name);
      }
      foundFeatures.should.be.deep.equal(['linemz']);
    });

    it('should query for box1, box 2, line, and point and calculate distance from a center point', function() {
      var pointToLineDistance = require('@turf/point-to-line-distance').default;
      var polygonToLine = require('@turf/polygon-to-line').default;
      var booleanPointInPolygon = require('@turf/boolean-point-in-polygon').default;
      var pointDistance = require('@turf/distance').default;

      // var bb = new BoundingBox(-107.44354248046876, -104.69696044921876, 33.098444531367186, 35.36889537510477);
      var centerPoint = { type: 'Feature',
       properties: {},
       geometry:
        { type: 'Point',
          coordinates: [ -106.07025146484376, 34.233669953235975 ] } };

      var bb = new BoundingBox(.4, .6, 1.4, 1.6);
      var centerPoint = {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Point",
          "coordinates": [
            0.5,
            1.5
          ]
        }
      };
      var foundFeatures = [];
      var closestDistance = 100000000000;
      var closest;
      var closestType;

      var iterator = queryTestFeatureDao.queryIndexedFeaturesWithBoundingBox(bb);

      for (var row of iterator) {
        foundFeatures.push(row.values.name);
        // console.log('row.values.name', row)
        var geometry = row.getGeometry().toGeoJSON();
        if (geometry.type == 'Point') {
          var distance = pointDistance(centerPoint, geometry);
          if (distance < closestDistance) {
            closest = row;
            closestType = geometry.type
            closestDistance = distance;
          } else if (distance == closestDistance && closestType !== 'Point') {
            closest = row;
            closestType = geometry.type
            closestDistance = distance;
          }
        } else if (geometry.type == 'LineString') {
          var distance = pointToLineDistance(centerPoint, geometry);
          if (distance < closestDistance) {
            closest = row;
            closestType = geometry.type
            closestDistance = distance;
          } else if (distance == closestDistance && closestType !== 'Point') {
            closest = row;
            closestType = geometry.type
            closestDistance = distance;
          }
        } else if (geometry.type == 'Polygon') {
          if (booleanPointInPolygon(centerPoint, geometry)) {
            if (closestDistance != 0) {
              closest = row;
              closestType = geometry.type
              closestDistance = 0;
            }
          } else {
            var line = polygonToLine(geometry);
            var distance = pointToLineDistance(centerPoint, line);
            if (distance < closestDistance) {
              closest = row;
              closestType = geometry.type
              closestDistance = distance;
            }
          }
        }
      }
      foundFeatures.should.be.deep.equal(['box1', 'box2', 'line', 'point', 'linemz']);

      closest.values.name.should.be.equal('point');
    });

    it('should get the x: 1029, y: 1013, z: 11 tile from the GeoPackage api in a reasonable amount of time', function() {
      this.timeout(5000);
      console.time('generating indexed tile');
      return GeoPackageAPI.getFeatureTileFromXYZ(geopackage, 'QueryTest', 1029, 1013, 11, 256, 256)
      .then(function(data) {
        console.timeEnd('generating indexed tile');
        should.exist(data);
      });
    });

    it('should get the x: 1026, y: 1015, z: 11 tile from the GeoPackage api in a reasonable amount of time', function() {
      this.timeout(5000);
      console.time('generating indexed tile');
      return GeoPackageAPI.getFeatureTileFromXYZ(geopackage, 'QueryTest', 1026, 1015, 11, 256, 256)
      .then(function(data) {
        console.timeEnd('generating indexed tile');
        should.exist(data);
      });
    });

    it('should get the x: 64, y: 63, z: 7 features as geojson', function() {
      this.timeout(3000);
      console.time('generating indexed tile');
      return GeoPackageAPI.getGeoJSONFeaturesInTile(geopackage, 'QueryTest', 64, 63, 7)
      .then(function(geoJSON) {
        console.timeEnd('generating indexed tile');
        should.exist(geoJSON);
        geoJSON.length.should.be.equal(6);
      });
    });

    it('should get the x: 64, y: 63, z: 7 tile from the GeoPackage api in a reasonable amount of time', function() {
      this.timeout(3000);
      console.time('generating indexed tile');
      return GeoPackageAPI.getFeatureTileFromXYZ(geopackage, 'QueryTest', 64, 63, 7, 256, 256)
      .then(function(data) {
        console.timeEnd('generating indexed tile');
        should.exist(data);
      });
    });

    it('should create a media relationship between a feature and a media row', function() {
      var rte = geopackage.getRelatedTablesExtension();
      var additionalMediaColumns = RelatedTablesUtils.createAdditionalUserColumns(MediaTable.numRequiredColumns());
      var mediaTable = MediaTable.create('media_table', additionalMediaColumns);
      rte.createRelatedTable(mediaTable);

      var mediaDao = rte.getMediaDao(mediaTable);
      should.exist(mediaDao);
      mediaTable = mediaDao.mediaTable;
      should.exist(mediaTable);

      // Create media row
      var contentType = 'image/png';
      var mediaRow = mediaDao.newRow();
      mediaRow.setData(tileBuffer);
      mediaRow.setContentType(contentType);
      RelatedTablesUtils.populateRow(mediaTable, mediaRow, MediaTable.requiredColumns());
      var mediaRowId = mediaDao.create(mediaRow);
      mediaRowId.should.be.greaterThan(0);
      mediaRow = mediaDao.queryForId(mediaRowId);

      var featureRow = queryTestFeatureDao.getRow(queryTestFeatureDao.queryForAll()[0]);
      return queryTestFeatureDao.linkMediaRow(featureRow, mediaRow)
      .then(function() {
        var linkedMedia = queryTestFeatureDao.getLinkedMedia(featureRow);
        linkedMedia.length.should.be.equal(1);
        linkedMedia[0].id.should.be.equal(mediaRowId);
      });
    });

    it('should create a simple attributes relationship between a feature and a simple attributes row', function() {
      var rte = geopackage.getRelatedTablesExtension();
      var simpleUserColumns = RelatedTablesUtils.createSimpleUserColumns(SimpleAttributesTable.numRequiredColumns(), true);
      var simpleTable = SimpleAttributesTable.create('simple_table', simpleUserColumns);
      rte.createRelatedTable(simpleTable);

      var simpleDao = rte.getSimpleAttributesDao(simpleTable);
      should.exist(simpleDao);
      simpleTable = simpleDao.simpleAttributesTable;
      should.exist(simpleTable);

      // Create simple attributes row
      var simpleRow = simpleDao.newRow();
      RelatedTablesUtils.populateRow(simpleTable, simpleRow, SimpleAttributesTable.requiredColumns());
      var simpleRowId = simpleDao.create(simpleRow);
      simpleRowId.should.be.greaterThan(0);
      simpleRow = simpleDao.queryForId(simpleRowId);

      var featureRow = queryTestFeatureDao.getRow(queryTestFeatureDao.queryForAll()[0]);
      return queryTestFeatureDao.linkSimpleAttributesRow(featureRow, simpleRow)
      .then(function() {
        var linkedAttributes = queryTestFeatureDao.getLinkedSimpleAttributes(featureRow);
        linkedAttributes.length.should.be.equal(1);
        linkedAttributes[0].id.should.be.equal(simpleRowId);
      });
    });

    it('should create a feature relationship between a feature and another feature row', function() {
      var all = queryTestFeatureDao.queryForAll();
      var featureRow = queryTestFeatureDao.getRow(all[0]);
      var relatedFeatureRow = queryTestFeatureDao.getRow(all[1]);

      return queryTestFeatureDao.linkFeatureRow(featureRow, relatedFeatureRow)
      .then(function() {
        var linkedFeatures = queryTestFeatureDao.getLinkedFeatures(featureRow);
        linkedFeatures.length.should.be.equal(1);
        linkedFeatures[0].id.should.be.equal(relatedFeatureRow.getId());
      });
    });
  });

});
