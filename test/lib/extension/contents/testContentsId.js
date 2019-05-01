var GeoPackageAPI = require('../../../..').GeoPackage
  , GeoPackage = require('../../../../lib/geoPackage').default
  , ContentsIdExtension = require('../../../../lib/extension/contents').default
  , ContentsId = require('../../../../lib/extension/contents/contentsId').ContentsId
  , sqliteQueryBuilder = require('../../../../lib/db/sqliteQueryBuilder').default
  , Verification = require('../../../fixtures/verification')
  , testSetup = require('../../../fixtures/testSetup')
  , should = require('chai').should()
  , fs = require('fs')
  , path = require('path');

describe('GeoPackage Contents Id Extension tests', function() {

  describe('Create new index', function() {
    var geoPackage;

    var originalFilename = path.join(__dirname, '..', '..', '..', 'fixtures', 'rivers.gpkg');
    var filename;

    var ci;

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
      copyGeopackage(originalFilename, filename, function(err) {
        GeoPackageAPI.open(filename)
        .then(function(gp) {
          geoPackage = gp;
          should.exist(gp);
          should.exist(gp.getDatabase().getDBConnection());
          gp.getPath().should.be.equal(filename);
          ci = new ContentsIdExtension(gp);
          done();
        });
      });
    });

    afterEach('should close the geopackage', function(done) {
      geoPackage.close();
      testSetup.deleteGeoPackage(filename, done);
    });

    it('should create a contentsId object', function() {
      var contentsId = geoPackage.getContentsIdDao().createObject();
      (contentsId instanceof ContentsId).should.be.true;
      should.not.exist(contentsId.table_name)
      var contents = geoPackage.getContentsDao().createObject();
      contents.table_name = 'My Table Name';
      contentsId.setContents();
      should.not.exist(contentsId.table_name);
      contentsId.setContents(contents);
      contentsId.table_name.should.equal('My Table Name');
    })

    it('should not have the extension', function() {
      ci.has().should.be.false;
      ci.count().should.equal(0);
      ci.idsForType('features').length.should.equal(0)
      ci.missingForType('features').length.should.equal(1)
      ci.missingForType().length.should.equal(2)
      var contents = geoPackage.getContentsDao().queryForAll()
      for (var content of contents) {
        should.not.exist(ci.getIdForContents(content));
        ci.deleteForContents(content).should.equal(false)
        ci.deleteIds().should.equal(0);
        ci.deleteIdsForType('tiles').should.equal(0);
        var ids = ci.ids();
        ids.length.should.equal(0);
      }
    });

    it('should create the extension', function() {
      return ci.getOrCreateExtension()
      .then(function(result) {
        result.should.be.true;
      })
      .then(function() {
        ci.has().should.be.true;
      })
    })

    describe('after extension is created', function() {

      beforeEach('create the extension', function() {
        return ci.getOrCreateExtension()
        .then(function(result) {
          result.should.be.true;
        })
        .then(function() {
          ci.has().should.be.true;
        })
      });

      it('should get for each table', function() {
        var contents = geoPackage.getContentsDao().queryForAll()
        for (var content of contents) {
          should.not.exist(ci.getForContents(content));
        }
      })

      it('should get id for each table', function() {
        var contents = geoPackage.getContentsDao().queryForAll()
        for (var content of contents) {
          should.not.exist(geoPackage.getContentsIdDao().queryForTableName(content.table_name));
          should.not.exist(ci.getIdForContents(content));
        }
      })

      it('should create for each table', async function() {
        var contents = geoPackage.getContentsDao().queryForAll()
        for (var content of contents) {
          var created = await ci.createForContents(content)
          should.exist(created);
          created.table_name.should.equal(content.table_name);
          var contentsId = ci.getForContents(content);
          contentsId.table_name.should.equal(content.table_name);
          should.exist(ci.getIdForContents(content));
          var createdContentsId = await ci.getOrCreateForContents(content);
          createdContentsId.table_name.should.equal(content.table_name);
          var idsFirst = ci.ids();
          idsFirst.length.should.equal(1);
          var deleted = ci.deleteForContents(content);
          deleted.should.equal(true)
        }
        var ids = ci.ids();
        ids.length.should.equal(0);
      })

      it('should create id for each table', async function() {
        var contents = geoPackage.getContentsDao().queryForAll()
        for (var content of contents) {
          var created = await ci.getOrCreateIdForContents(content)
          should.exist(created);
          var contentsId = ci.getForContents(content);
          contentsId.table_name.should.equal(content.table_name);
          geoPackage.getContentsIdDao().getContents(contentsId).table_name.should.equal(contentsId.table_name);
          var idsFirst = ci.ids();
          idsFirst.length.should.equal(1);
          var deleted = geoPackage.getContentsIdDao().deleteByTableName(content.table_name);
          deleted.should.equal(1);
          should.not.exist(ci.getForContents(content));
        }
        var ids = ci.ids();
        ids.length.should.equal(0);
      })

      describe('create the contents ids objects', function() {

        it('should create ids for all tables', async function() {
          var missing = ci.missing()
          missing.length.should.be.equal(2)
          var results = await ci.createIds()
          results.should.equal(2)
          var count = ci.count();
          count.should.equal(2);
          var ids = ci.ids();
          ids.length.should.equal(2);
          var deleted = ci.deleteIds();
          deleted.should.equal(2)
        })

        it('should create ids for feature tables', async function() {
          var missing = ci.missingForType('features')
          missing.length.should.be.equal(1)
          var results = await ci.createIdsForType('features')
          results.should.equal(1)
          var count = ci.count();
          count.should.equal(1);
          var idsFirst = ci.ids();
          idsFirst.length.should.equal(1);
          var deletedFeature = ci.deleteIdsForType('features');
          deletedFeature.should.equal(1)
          var deletedTile = ci.deleteIdsForType('tiles')
          deletedTile.should.equal(0)
          var ids = ci.ids();
          ids.length.should.equal(0);
        })

        it('should create ids for tile tables', async function() {
          var missing = ci.missingForType('tiles')
          missing.length.should.be.equal(1)
          var results = await ci.createIdsForType('tiles')
          results.should.equal(1);
          var count = ci.count();
          count.should.equal(1);
          var idsFirst = ci.ids();
          idsFirst.length.should.equal(1);
          var deletedFeature = ci.deleteIdsForType('features');
          deletedFeature.should.equal(0)
          var deletedTile = ci.deleteIdsForType('tiles')
          deletedTile.should.equal(1)
          var ids = ci.ids();
          ids.length.should.equal(0);
        })
      })
    })
  })
});
