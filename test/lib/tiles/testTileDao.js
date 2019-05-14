const GeoPackageAPI = require('../../../lib').GeoPackage
  , TileDao = require('../../../lib/tiles/user/tileDao').default
  , testSetup = require('../../fixtures/testSetup')
  , should = require('chai').should()
  , path = require('path')
  , fs = require('fs');

const fixturesDir = path.resolve(__dirname, '..', '..', 'fixtures');

describe('TileDao tests', function() {

  describe('Rivers GeoPackage tests', function() {

    var geoPackage;
    var tileDao;

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
      var originalFilename = path.join(fixturesDir, 'rivers.gpkg');
      filename = path.join(fixturesDir, 'tmp', testSetup.createTempName());
      copyGeopackage(originalFilename, filename, async function() {
        geoPackage = await GeoPackageAPI.open(filename)
        should.exist(geoPackage);
        should.exist(geoPackage.getDatabase().getDBConnection());
        geoPackage.getPath().should.be.equal(filename);
        tileDao = geoPackage.getTileDao('TILESosmds');
        done();
      });
    });

    afterEach('close the geopackage connection', function(done) {
      geoPackage.close();
      testSetup.deleteGeoPackage(filename, done);
    });

    it('should set the zoom levels to 0 if no matrices are passed in', () => {
      let td = new TileDao(geoPackage, tileDao.table, tileDao.tileMatrixSet, [])
      td.minZoom.should.be.equal(0)
      td.maxZoom.should.be.equal(0)
    })

    it('should return an empty array if no tile grid was passed in to query by', () => {
      let td = new TileDao(geoPackage, tileDao.table, tileDao.tileMatrixSet, [])
      let tiles = td.queryByTileGrid()
      tiles.length.should.be.equal(0)
    })

    it('should get the zoom levels', function() {
      tileDao.minZoom.should.be.equal(0);
      tileDao.maxZoom.should.be.equal(3);
    });

    it('should calculate the min/max web map zoom', function() {
      tileDao.minWebMapZoom.should.equal(0);
      tileDao.maxWebMapZoom.should.equal(3);
    });

    it('should get the bounding box for each zoom level', function() {
      [0, 1, 2, 3, 4].forEach(function(zoom) {
        var bb = tileDao.getBoundingBoxWithZoomLevel(zoom);
        if (zoom === 4) {
          should.not.exist(bb);
        } else {
          bb.minLongitude.should.be.equal(-20037508.342789244);
          bb.maxLongitude.should.be.equal(20037508.342789244);
          bb.minLatitude.should.be.equal(-20037508.342789244);
          bb.maxLatitude.should.be.equal(20037508.342789244);
        }
      })
    });

    it('should get the tile grid for each zoom level', function() {
      [0, 1, 2, 3, 4].forEach(function(zoom) {
        var grid = tileDao.getTileGridWithZoomLevel(zoom);
        if (zoom === 4) {
          should.not.exist(grid);
        } else {
          grid.min_x.should.be.equal(0);
          grid.min_y.should.be.equal(0);
          grid.max_x.should.be.equal(Math.pow(2, zoom)-1);
          grid.max_x.should.be.equal(Math.pow(2, zoom)-1);
        }
      });
    });

    it('should get the table', function() {
      var tileTable = tileDao.getTileTable();
      tileTable.table_name.should.be.equal('TILESosmds');
      should.exist(tileTable.getTileDataColumn);
    });

    it('should query for a tile', function() {
      var tileRow = tileDao.queryForTile(0, 0, 0);
      tileRow.getZoomLevel().should.be.equal(0);
      tileRow.getTileColumn().should.be.equal(0);
      tileRow.getRow().should.be.equal(0);
      tileRow.getTileColumnColumnIndex().should.be.equal(2)
      tileRow.getRowColumnIndex().should.be.equal(3)
      tileRow.getTileDataColumnIndex().should.be.equal(4)
      var data = tileRow.getTileData();
      should.exist(data);
    });

    it('should return null querying for a tile that does not exist', function() {
      const tile = tileDao.queryForTile(-1, -1, -1);
      should.not.exist(tile);
    });

    it('should query for tiles in the zoom level', function() {
      var count = 0;
      for (var tileRow of tileDao.queryForTilesWithZoomLevel(1)) {
        tileRow.getZoomLevel().should.be.equal(1);
        var data = tileRow.getTileData();
        should.exist(data);
        count++;
      }
      count.should.be.equal(4);
    });

    it('should query for tiles in the zoom level descending order', function() {
      var count = 0;
      for (var tileRow of tileDao.queryForTilesDescending(1)) {
        tileRow.getZoomLevel().should.be.equal(1);
        var data = tileRow.getTileData();
        should.exist(data);
        count++;
      }
      count.should.be.equal(4);
    });

    it('should query for tiles in the zoom level and column', function() {
      var count = 0;
      for (var tileRow of tileDao.queryForTilesInColumn(1, 1)) {
        tileRow.getZoomLevel().should.be.equal(1);
        tileRow.getTileColumn().should.be.equal(1);
        var data = tileRow.getTileData();
        should.exist(data);
        count++;
      }
      count.should.be.equal(2);
    });

    it('should query for tiles in the zoom level and row', function() {
      var count = 0;
      for (var tileRow of tileDao.queryForTilesInRow(1, 1)) {
        tileRow.getZoomLevel().should.be.equal(1);
        tileRow.getRow().should.be.equal(1);
        var data = tileRow.getTileData();
        should.exist(data);
        count++;
      }
      count.should.be.equal(2);
    });

    it('should query for tiles in the tile grid', function() {
      var tileGrid = {
        min_x: 0,
        max_x: 1,
        min_y: 0,
        max_y: 0
      };
      var iterator = tileDao.queryByTileGrid(tileGrid, 1);
      var count = 0;
      for (var tileRow of iterator) {
        tileRow.getZoomLevel().should.be.equal(1);
        tileRow.getRow().should.be.equal(0);
        var data = tileRow.getTileData();
        should.exist(data);
        count++;
      }
      count.should.be.equal(2);
    });

    it('should rename the tile table', function() {
      tileDao.rename('Tiles');
      tileDao.gpkgTableName.should.be.equal('Tiles');
      var tileTables = geoPackage.getTileTables();
      tileTables[0].should.be.equal('Tiles');
    })
  });

  describe('wgs84.gpkg', function() {

    let gpkg, tileDao;

    beforeEach('open the geopackage', function() {
      const gpkgPath = path.join(fixturesDir, 'wgs84.gpkg');
      return GeoPackageAPI.open(gpkgPath).then(openGpkg => {
        gpkg = openGpkg;
        tileDao = gpkg.getTileDao('imagery');
      });
    });

    it('caculates the min/max web map zoom', function() {
      tileDao.minWebMapZoom.should.equal(4);
      tileDao.maxWebMapZoom.should.equal(4);
    });

    it('should get the xyz tile in 3857 projection', async () => {
      let image = await GeoPackageAPI.getTileFromXYZ(gpkg, 'imagery', 1, 4, 4, 256, 256)
      try {
        let same = await testSetup.diffImages(image, path.join(fixturesDir, 'wgs84_414.png'), 'png')
        same.should.be.equal(true)
      } catch(e) {
        console.log('err', e)
      }
    });

    it('should get the xyz tile in 3857 projection as jpg', async () => {
      let image = await GeoPackageAPI.getTileFromXYZ(gpkg, 'imagery', 1, 4, 4, 256, 256, 'jpg')
      try {
        let same = await testSetup.diffImages(image, path.join(fixturesDir, 'wgs84_414.jpg'), 'jpg')
        same.should.be.equal(true)
      } catch(e) {
        console.log('err', e)
      }
    });
  });

  describe('super.gpkg', function() {

    let gpkg, tileDao;

    beforeEach('open the geopackage', function() {
      const gpkgPath = path.join(fixturesDir, 'super.gpkg');
      return GeoPackageAPI.open(gpkgPath).then(openGpkg => {
        gpkg = openGpkg;
        tileDao = gpkg.getTileDao('point1_tiles');
      });
    });

    it('caculates the min/max web map zoom', function() {

      tileDao.minWebMapZoom.should.equal(17);
      tileDao.maxWebMapZoom.should.equal(21);
    });
  });

  describe.skip('Alaska GeoPackage tests', function() {

    var geoPackage;
    var tileDao;

    beforeEach('should open the geopackage', async function() {
      var filename = path.join(__dirname, '..', '..', 'fixtures', 'private', 'alaska.gpkg');
      geoPackage = await GeoPackageAPI.open(filename)
      should.exist(geoPackage);
      should.exist(geoPackage.getDatabase().getDBConnection());
      geoPackage.getPath().should.be.equal(filename);
      tileDao = geoPackage.getTileDao('alaska');
    });

    it('should get the zoom levels', function() {
      tileDao.minZoom.should.be.equal(4);
      tileDao.maxZoom.should.be.equal(4);
    });

    it('should get the bounding box for each zoom level', function() {
      [4, 5].forEach(function(zoom) {
        var bb = tileDao.getBoundingBoxWithZoomLevel(zoom);
        if (zoom === 5) {
          should.not.exist(bb);
        } else {
          bb.minLongitude.should.be.equal(-180);
          bb.maxLongitude.should.be.equal(-157.5);
          bb.minLatitude.should.be.equal(45);
          bb.maxLatitude.should.be.equal(67.5);
        }
      });
    });

    it('should get the tile grid for each zoom level', function() {
      [4, 5].forEach(function(zoom) {
        var grid = tileDao.getTileGridWithZoomLevel(zoom);
        if (zoom === 5) {
          should.not.exist(grid);
        } else {
          grid.minX.should.be.equal(0);
          grid.minY.should.be.equal(0);
          grid.maxX.should.be.equal(3);
          grid.maxX.should.be.equal(3);
        }
      });
    });

    it('should get the table', function() {
      var tileTable = tileDao.getTileTable();
      tileTable.tableName.should.be.equal('alaska');
      should.exist(tileTable.getTileDataColumn);
    });

    it('should query for a tile', function() {
      return tileDao.queryForTile(1, 1, 4)
      .then(function(tileRow) {
        tileRow.getZoomLevel().should.be.equal(4);
        tileRow.getTileColumn().should.be.equal(1);
        tileRow.getRow().should.be.equal(1);
        var data = tileRow.getTileData();
        should.exist(data);
      });
    });

    it('should query for tiles in the zoom level', function() {
      return tileDao.queryForTilesWithZoomLevel(4, function(err, tileRow) {
        tileRow.getZoomLevel().should.be.equal(4);
        var data = tileRow.getTileData();
        should.exist(data);
      }).then(function(count) {
        count.should.be.equal(16);
      });
    });

    it('should query for tiles in the zoom level descending order', function() {
      tileDao.queryForTilesDescending(4, function(err, tileRow) {
        tileRow.getZoomLevel().should.be.equal(4);
        var data = tileRow.getTileData();
        should.exist(data);
      }).then(function(count) {
        count.should.be.equal(16);
      });
    });

    it('should query for tiles in the zoom level and column', function() {
      return tileDao.queryForTilesInColumn(1, 4, function(err, tileRow) {
        tileRow.getZoomLevel().should.be.equal(4);
        tileRow.getTileColumn().should.be.equal(1);
        var data = tileRow.getTileData();
        should.exist(data);
      }).then(function(count) {
        count.should.be.equal(4);
      });
    });

    it('should query for tiles in the zoom level and row', function() {
      return tileDao.queryForTilesInRow(1, 4, function(err, tileRow) {
        tileRow.getZoomLevel().should.be.equal(4);
        tileRow.getRow().should.be.equal(1);
        var data = tileRow.getTileData();
        should.exist(data);
      }).then(function(count) {
        count.should.be.equal(4);
      });
    });

    it('should query for tiles in the tile grid', function(done) {
      var tileGrid = {
        minX: 0,
        maxX: 1,
        minY: 0,
        maxY: 0
      };
      tileDao.queryByTileGrid(tileGrid, 4, function(err, tileRow) {
        tileRow.getZoomLevel().should.be.equal(4);
        tileRow.getRow().should.be.equal(0);
        var data = tileRow.getTileData();
        should.exist(data);
      })
      .then(function(count) {
        count.should.be.equal(2);
        done();
      });
    });
  });
});
