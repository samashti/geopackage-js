var GeoPackageAPI = require('../../../../lib').GeoPackage
  , GeoPackage = require('../../../../lib/geoPackage').default
  , FeatureTableIndex = require('../../../../lib/extension/index/featureTableIndex').default
  , GeometryIndexDao = require('../../../../lib/extension/index/geometryIndex').GeometryIndexDao
  , sqliteQueryBuilder = require('../../../../lib/db/sqliteQueryBuilder').default
  , Verification = require('../../../fixtures/verification')
  , testSetup = require('../../../fixtures/testSetup')
  , should = require('chai').should()
  , fs = require('fs')
  , path = require('path');

describe('GeoPackage Feature Table Index Extension tests', function() {

  describe('Create new index', function() {
    var geoPackage;
    var featureDao;

    var originalFilename = path.join(__dirname, '..', '..', '..', 'fixtures', 'rivers.gpkg');
    var filename;

    async function copyGeopackage(originalFilename, filename, callback) {
      if (typeof(process) !== 'undefined' && process.version) {
        var fsExtra = require('fs-extra')
        fsExtra.copySync(originalFilename, filename);
        if (callback) callback()
      } else {
        filename = originalFilename;
        if (callback) callback();
      }
    }

    beforeEach('should open the geopackage', async function() {
      filename = path.join(__dirname, '..', '..', '..', 'fixtures', 'tmp', testSetup.createTempName());
      copyGeopackage(originalFilename, filename)

      geoPackage = await GeoPackageAPI.open(filename)
      should.exist(geoPackage);
      should.exist(geoPackage.getDatabase().getDBConnection());
      geoPackage.getPath().should.be.equal(filename);
      featureDao = geoPackage.getFeatureDao('FEATURESriversds');
    });

    afterEach('should close the geopackage', function(done) {
      geoPackage.close();
      testSetup.deleteGeoPackage(filename, done);
    });

    it('should return the index status of false', function() {
      var fti = new FeatureTableIndex(geoPackage, featureDao);
      var indexed = fti.isIndexed();
      indexed.should.be.equal(false);
    });

    it('should return the index status of false because the table index does not exist', async function() {
      var fti = new FeatureTableIndex(geoPackage, featureDao);
      let e = await fti.getOrCreateExtension()
      fti.tableIndexDao.createTable();
      var indexed = fti.isIndexed();
      indexed.should.be.equal(false);
    });

    it('should return the index status of false because the contents do not exist', async function() {
      featureDao.table_name = 'nope'
      var fti = new FeatureTableIndex(geoPackage, featureDao);
      let e = await fti.getOrCreateExtension()
      fti.tableIndexDao.createTable();
      var indexed = fti.isIndexed();
      indexed.should.be.equal(false);
    });

    it('should check the index extension', function() {
      this.timeout(10000);
      var fti = featureDao.featureTableIndex;
      var tableIndex = fti.getTableIndex();
      should.not.exist(tableIndex);
      return fti.index(function(message) {
        console.log('message', message);
      })
      .then(function(indexed) {
        console.log('indexed', indexed);
        indexed.should.be.equal(true);
        // ensure it was created
        var fti2 = new FeatureTableIndex(geoPackage, featureDao);
        tableIndex = fti2.getTableIndex();
        should.exist(tableIndex);
        should.exist(tableIndex.last_indexed);
      })
      .then(function() {
        var exists = fti.hasExtension(fti.extensionName, fti.tableName, fti.columnName)
        exists.should.be.equal(true);
      })
      .then(function() {
        var extensionDao = fti.extensionsDao;
        var extension = extensionDao.queryByExtension(fti.extensionName);
        extension.getAuthor().should.be.equal('nga');
        extension.getExtensionNameNoAuthor().should.be.equal('geometry_index');
        extension.definition.should.be.equal('http://ngageoint.github.io/GeoPackage/docs/extensions/geometry-index.html');
        extension.column_name.should.be.equal('geom');
        extension.table_name.should.be.equal('FEATURESriversds');
        extension.scope.should.be.equal('read-write');
        extension.extension_name.should.be.equal('nga_geometry_index');
      })
      .then(function() {
        var extensionDao = fti.extensionsDao;
        var extensions = extensionDao.queryByExtensionAndTableName(fti.extensionName, fti.tableName);
        var extension = extensions[0];
        extension.getAuthor().should.be.equal('nga');
        extension.getExtensionNameNoAuthor().should.be.equal('geometry_index');
        extension.definition.should.be.equal('http://ngageoint.github.io/GeoPackage/docs/extensions/geometry-index.html');
        extension.column_name.should.be.equal('geom');
        extension.table_name.should.be.equal('FEATURESriversds');
        extension.scope.should.be.equal('read-write');
        extension.extension_name.should.be.equal('nga_geometry_index');
      })
      .then(function() {
        var extensionDao = fti.extensionsDao;
        var extensions = extensionDao.queryByExtensionAndTableNameAndColumnName(fti.extensionName, fti.tableName, fti.columnName);
        var extension = extensions[0];
        extension.getAuthor().should.be.equal('nga');
        extension.getExtensionNameNoAuthor().should.be.equal('geometry_index');
        extension.definition.should.be.equal('http://ngageoint.github.io/GeoPackage/docs/extensions/geometry-index.html');
        extension.column_name.should.be.equal('geom');
        extension.table_name.should.be.equal('FEATURESriversds');
        extension.scope.should.be.equal('read-write');
        extension.extension_name.should.be.equal('nga_geometry_index');
      });
    });

    it('should index the table from the geopackage object', function() {
      this.timeout(10000);
      return geoPackage.indexFeatureTable('FEATURESriversds')
      .then(function(indexed) {
        indexed.should.be.equal(true);
        // ensure it was created
        var fti = featureDao.featureTableIndex;
        var tableIndex = fti.getTableIndex();
        should.exist(tableIndex);
        should.exist(tableIndex.last_indexed);
        var gid = new GeometryIndexDao(geoPackage, featureDao)
        var gi = gid.createObject()
        should.exist(gi)
        var lastIndex;
        for (var index of gid.queryForTableName('FEATURESriversds')) {
          lastIndex = index;
          index.table_name.should.be.equal('FEATURESriversds')
        }
        var ti = gid.getTableIndex(lastIndex);
        should.exist(ti);
        ti.table_name.should.be.equal('FEATURESriversds')
        var count = gid.countByTableName('FEATURESriversds')
        count.should.be.equal(357)
        
      });
    });

    it('should index the geopackage from the geopackage object', function() {
      this.timeout(10000);
      return geoPackage.index()
      .then(function(status) {
        status.should.be.equal(true);
        // ensure it was created
        var fti = featureDao.featureTableIndex;
        var tableIndex = fti.getTableIndex();
        should.exist(tableIndex);
        should.exist(tableIndex.last_indexed);
      });
    });
  });

  describe('Test existing index', function() {

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

    it('should query for the index row rivers, 315', function(done) {
      var whereString = 'table_name = ? and geom_id = ?';
      var whereArgs = [ 'rivers', 315 ];

      var query = sqliteQueryBuilder.buildQuery(false, "'nga_geometry_index'", undefined, whereString);
      var result = geoPackage.getDatabase().get(query, whereArgs);
      should.exist(result);
      done();
    });

    it('should get the extension row', function() {
      var fti = featureDao.featureTableIndex;
      var extension = fti.getFeatureTableIndexExtension();
      should.exist(extension);
    });

    it('should return the index status of true', function() {
      var fti = featureDao.featureTableIndex;
      var indexed = fti.isIndexed();
      indexed.should.be.equal(true);
    });

    it('should force index the table', async function() {
      this.timeout(30000);
      var fti = featureDao.featureTableIndex;
      var tableIndex = fti.getTableIndex();
      tableIndex.last_indexed.should.be.equal('2016-05-02T12:08:14.144Z');
      let indexed = await fti.indexWithForce(true)
      indexed.should.be.equal(true);
      // ensure it was created
      var fti2 = new FeatureTableIndex(geoPackage, featureDao);
      tableIndex = fti2.getTableIndex();
      should.exist(tableIndex);
      tableIndex.last_indexed.should.not.be.equal('2016-05-02T12:08:14.144Z');
    });

    it('should index the already indexed table and just return', async function() {
      this.timeout(30000);
      var fti = featureDao.featureTableIndex;
      var tableIndex = fti.getTableIndex();
      tableIndex.last_indexed.should.be.equal('2016-05-02T12:08:14.144Z');
      let indexed = await fti.index()
      indexed.should.be.equal(true);
      // ensure it was created
      var fti2 = new FeatureTableIndex(geoPackage, featureDao);
      tableIndex = fti2.getTableIndex();
      should.exist(tableIndex);
      tableIndex.last_indexed.should.be.equal('2016-05-02T12:08:14.144Z');
    });
  });
});
