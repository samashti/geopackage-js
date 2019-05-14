var GeoPackageAPI = require('../../../../lib').GeoPackage
  , Verification = require('../../../fixtures/verification')
  , RelatedTablesExtension = require('../../../../lib/extension/relatedTables').default
  , ExtendedRelation = require('../../../../lib/extension/relatedTables/extendedRelation').ExtendedRelation
  , UserMappingTable = require('../../../../lib/extension/relatedTables/userMappingTable').default
  , SetupFeatureTable = require('../../../fixtures/setupFeatureTable').default
  , UserRelatedTable = require('../../../../lib/extension/relatedTables/userRelatedTable').default
  , UserColumn = require('../../../../lib/user/userColumn').default
  , DataTypes = require('../../../../lib/db/dataTypes').default
  , testSetup = require('../../../fixtures/testSetup')
  , RelatedTablesUtils = require('./relatedTablesUtils')
  , should = require('chai').should()
  , wkx = require('wkx')
  , path = require('path');

describe('Related Tables tests', function() {

  describe('Related Tables Read Tests', function() {
    var testGeoPackage;
    var testPath = path.join(__dirname, '..', '..', '..', 'fixtures', 'tmp');
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

      var originalFilename = path.join(__dirname, '..', '..', '..', 'fixtures', 'rte.gpkg');
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

    it('should read a relationship', function() {
      var rte = new RelatedTablesExtension(geoPackage);
      rte.has().should.be.equal(true);
      var relationships = rte.getRelationships();
      relationships.length.should.be.equal(1);

      for (var i = 0; i < relationships.length; i++) {
        var relationship = relationships[i];
        var baseDao = geoPackage.getFeatureDao(relationship.base_table_name);
        var features = baseDao.queryForAll();
        var baseIdMappings = {};
        for (var f = 0; f < features.length; f++) {
          var feature = features[f];
          var row = baseDao.getRow(feature);
          var relatedIds = rte.getMappingsForBase(relationship.mapping_table_name, row.getId());
          if (row.getId() === 1) {
            relatedIds.length.should.be.equal(2);
          } else if (row.getId() === 2) {
            relatedIds.length.should.be.equal(1);
          }
          baseIdMappings[row.getId()] = relatedIds;
        }

        var relatedIdMappings = {};
        var relatedDao = geoPackage.getAttributeDaoWithTableName(relationship.related_table_name);
        var attributes = relatedDao.queryForAll();
        for (var a = 0; a < attributes.length; a++) {
          var attribute = attributes[a];
          var row = relatedDao.getRow(attribute);
          var baseIds = rte.getMappingsForRelated(relationship.mapping_table_name, row.getId());
          if (row.getId() === 17) {
            baseIds.length.should.be.equal(2);
          } else if (row.getId() === 18) {
            baseIds.length.should.be.equal(3);
          } else if (row.getId() === 19) {
            baseIds.length.should.be.equal(1);
          }
          relatedIdMappings[row.getId()] = baseIds;
        }

        for (var baseId in baseIdMappings) {
          var relatedIds = baseIdMappings[baseId.toString()];
          for (var r = 0; r < relatedIds.length; r++) {
            var relatedId = relatedIds[r];
            relatedIdMappings[relatedId.toString()].indexOf(Number(baseId)).should.not.equal(-1);
          }
        }

        for (var relatedId in relatedIdMappings) {
          var baseIds = relatedIdMappings[relatedId.toString()];
          for (var b = 0; b < baseIds.length; b++) {
            var baseId = baseIds[b];
            baseIdMappings[baseId.toString()].indexOf(Number(relatedId)).should.not.equal(-1);
          }
        }
      }
    });

    it('should get relationships for the base table name', function() {
      var rte = new RelatedTablesExtension(geoPackage);
      var relationships = rte.getRelationships('cats_feature');
      relationships.length.should.be.equal(1);
      relationships[0].base_table_name.should.be.equal('cats_feature');
      relationships[0].base_primary_column.should.be.equal('id');
      relationships[0].related_table_name.should.be.equal('cats_media');
      relationships[0].related_primary_column.should.be.equal('id');
    });

    it('should get relationships for the base table name and baseId', function() {
      var rte = new RelatedTablesExtension(geoPackage);
      var relationships = rte.getRelatedRows('cats_feature', 1);
      relationships.length.should.be.equal(1);
      relationships[0].related_table_name.should.be.equal('cats_media');
      relationships[0].mappingRows.length.should.be.equal(2);
      relationships[0].mappingRows[0].row.id.should.be.equal(relationships[0].mappingRows[0].related_id);
    });
  });

  describe('Related Tables Write Tests', function() {

    var testGeoPackage;
    var testPath = path.join(__dirname, '..', '..', '..', 'fixtures', 'tmp');
    var geopackage;

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

      var originalFilename = path.join(__dirname, '..', '..', '..', 'fixtures', 'gdal_sample.gpkg');
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

    it('should create a user related table with a correct data type', () => {
      let userRelatedTable = new UserRelatedTable('name', 'relation', 'data_type', [new UserColumn(0, 'id', DataTypes.GPKGDataType.GPKG_DT_INTEGER, null, false, null, true)])
      try {
        userRelatedTable.setContents({
          data_type: 'data_type'
        })
      } catch (e) {
        false.should.be.equal(true)
      }
    })

    it('should fail to create a user related table with an incorrect data type', () => {
      let userRelatedTable = new UserRelatedTable('name', 'relation', 'data_type', [new UserColumn(0, 'id', DataTypes.GPKGDataType.GPKG_DT_INTEGER, null, false, null, true)])
      try {
        userRelatedTable.setContents({
          data_type: 'not_data_type'
        })
        false.should.be.equal(true)
      } catch (e) {
        e.message.should.be.equal('The contents of this related table must have a data type of data_type')
      }
    })

    it('should write a relationship', function() {

      var rte = new RelatedTablesExtension(geoPackage);
      rte.has().should.be.equal(false);

      var extendedRelationships = rte.getRelationships();
      extendedRelationships.length.should.be.equal(0);

      var baseTableName = 'geometry2d';
      var relatedTableName = 'geometry3d';
      var mappingTableName = 'g2d_3d';

      var additionalColumns = RelatedTablesUtils.createAdditionalUserColumns(UserMappingTable.numRequiredColumns());
      var userMappingTable = UserMappingTable.create(mappingTableName, additionalColumns);
      rte.has(userMappingTable.table_name).should.be.equal(false);

      var numColumns = UserMappingTable.numRequiredColumns() + additionalColumns.length;
      numColumns.should.be.equal(userMappingTable.columns.length);

      var baseIdColumn = userMappingTable.getBaseIdColumn();
      should.exist(baseIdColumn);
      baseIdColumn.name.should.be.equal(UserMappingTable.COLUMN_BASE_ID);
      baseIdColumn.notNull.should.be.equal(true);
      baseIdColumn.primaryKey.should.be.equal(false);

      var featureRelationship = RelatedTablesExtension.RelationshipBuilder()
      .setBaseTableName(baseTableName)
      .setRelatedTableName(relatedTableName)
      .setRelationAuthor('author')
      .setUserMappingTable(userMappingTable);

      return rte.addFeaturesRelationship(featureRelationship)
      .then(function(extendedRelation){
        extendedRelation.relation_name.should.be.equal('x-author_features')
        rte.has().should.be.equal(true);
        rte.has(userMappingTable.table_name).should.be.equal(true);
        should.exist(extendedRelation);
        var relationships = rte.getRelationships();
        relationships.length.should.be.equal(1);
        geoPackage.isTable(mappingTableName).should.be.equal(true);

        var baseDao = geoPackage.getFeatureDao(baseTableName);
        var relatedDao = geoPackage.getFeatureDao(relatedTableName);
        var baseResults = baseDao.queryForAll();
        var relatedResults = relatedDao.queryForAll();

        var userMappingDao = rte.getMappingDao(mappingTableName);
        var userMappingRow;
        for (var i = 0; i < 10; i++) {
          userMappingRow = userMappingDao.newRow();
          userMappingRow.setBaseId(Math.floor(Math.random() * baseResults.length));
          userMappingRow.setRelatedId(Math.floor(Math.random() * relatedResults.length));
          RelatedTablesUtils.populateRow(userMappingTable, userMappingRow, UserMappingTable.requiredColumns());
          var result = userMappingDao.create(userMappingRow);
          var relationships = rte.getRelatedRows(baseTableName, userMappingRow.getBaseId());
          relationships.length.should.be.above(0)
        }

        var count = userMappingDao.getCount();
        count.should.be.equal(10);

        userMappingTable = userMappingDao.table;
        var columns = userMappingTable.columnNames;
        var userMappingRows = userMappingDao.queryForAll();
        userMappingRows.length.should.be.equal(10);

        var rowsDeleted = 0;
        for (var i = 0; i < userMappingRows.length; i++) {
          var resultRow = userMappingDao.getUserMappingRow(userMappingRows[i]);
          should.not.exist(resultRow.getId());
          RelatedTablesUtils.validateUserRow(columns, resultRow);
          RelatedTablesUtils.validateDublinCoreColumns(resultRow);
          var deleteResult = userMappingDao.deleteByIds(resultRow.getBaseId(), resultRow.getRelatedId());
          rowsDeleted += deleteResult;
        }
        rowsDeleted.should.be.equal(10);
        rte.removeRelationship(featureRelationship).should.be.equal(1);
        rte.has(userMappingTable.table_name).should.be.equal(false);
        relationships = rte.getRelationships();
        relationships.length.should.be.equal(0);
        geoPackage.isTable(mappingTableName).should.be.equal(false);
        rte.removeExtension();
        rte.has().should.be.equal(false);
      })
      .catch(function(error) {
        console.log('error', error);
        false.should.be.equal(true);
      });
    });

    it('should add a extended relationship', async function() {

      var rte = new RelatedTablesExtension(geoPackage);
      rte.has().should.be.equal(false);

      var extendedRelationships = rte.getRelationships();
      extendedRelationships.length.should.be.equal(0);

      var baseTableName = 'geometry2d';
      var relatedTableName = 'geometry3d';
      var mappingTableName = 'g2d_3d';

      var additionalColumns = RelatedTablesUtils.createAdditionalUserColumns(UserMappingTable.numRequiredColumns());
      var userMappingTable = UserMappingTable.create(mappingTableName, additionalColumns);
      rte.has(userMappingTable.table_name).should.be.equal(false);

      var numColumns = UserMappingTable.numRequiredColumns() + additionalColumns.length;
      numColumns.should.be.equal(userMappingTable.columns.length);

      var baseIdColumn = userMappingTable.getBaseIdColumn();
      should.exist(baseIdColumn);
      baseIdColumn.name.should.be.equal(UserMappingTable.COLUMN_BASE_ID);
      baseIdColumn.notNull.should.be.equal(true);
      baseIdColumn.primaryKey.should.be.equal(false);

      var er = new ExtendedRelation()
      er.base_table_name = baseTableName;
      er.base_primary_column = geoPackage.getFeatureDao(baseTableName).table.getPkColumn().name;
      er.related_table_name = relatedTableName;
      er.related_primary_column = geoPackage.getFeatureDao(relatedTableName).table.getPkColumn().name
      er.mapping_table_name = userMappingTable.table_name;
      er.relation_name = 'FEATURES';

      await rte.createUserMappingTable(userMappingTable)

      let extendedRelation = await rte.addFeaturesRelationship(er)
      rte.has().should.be.equal(true);
      rte.has(userMappingTable.table_name).should.be.equal(true);
      should.exist(extendedRelation);
      var relationships = rte.getRelationships();
      relationships.length.should.be.equal(1);
      geoPackage.isTable(mappingTableName).should.be.equal(true);

      var baseDao = geoPackage.getFeatureDao(baseTableName);
      var relatedDao = geoPackage.getFeatureDao(relatedTableName);
      var baseResults = baseDao.queryForAll();
      var relatedResults = relatedDao.queryForAll();

      var userMappingDao = rte.getMappingDao(mappingTableName);
      var userMappingRow;
      for (var i = 0; i < 10; i++) {
        userMappingRow = userMappingDao.newRow();
        userMappingRow.setBaseId(Math.floor(Math.random() * baseResults.length));
        userMappingRow.setRelatedId(Math.floor(Math.random() * relatedResults.length));
        RelatedTablesUtils.populateRow(userMappingTable, userMappingRow, UserMappingTable.requiredColumns());
        var result = userMappingDao.create(userMappingRow);
        var relationships = rte.getRelatedRows(baseTableName, userMappingRow.getBaseId());
        relationships.length.should.be.above(0)
      }

      var count = userMappingDao.getCount();
      count.should.be.equal(10);

      userMappingTable = userMappingDao.table;
      var columns = userMappingTable.columnNames;
      var userMappingRows = userMappingDao.queryForAll();
      userMappingRows.length.should.be.equal(10);

      var rowsDeleted = 0;
      for (var i = 0; i < userMappingRows.length; i++) {
        var resultRow = userMappingDao.getUserMappingRow(userMappingRows[i]);
        should.not.exist(resultRow.getId());
        RelatedTablesUtils.validateUserRow(columns, resultRow);
        RelatedTablesUtils.validateDublinCoreColumns(resultRow);
        var deleteResult = userMappingDao.deleteByIds(resultRow.getBaseId(), resultRow.getRelatedId());
        rowsDeleted += deleteResult;
      }
      rowsDeleted.should.be.equal(10);
      rte.removeRelationship(extendedRelation);
      rte.has(userMappingTable.table_name).should.be.equal(false);
      relationships = rte.getRelationships();
      relationships.length.should.be.equal(0);
      geoPackage.isTable(mappingTableName).should.be.equal(false);
      rte.removeExtension();
      rte.has().should.be.equal(false);
    });

    it('should add a extended relationship with a user mapping table name', async function() {

      var rte = new RelatedTablesExtension(geoPackage);
      rte.has().should.be.equal(false);

      var extendedRelationships = rte.getRelationships();
      extendedRelationships.length.should.be.equal(0);

      var baseTableName = 'geometry2d';
      var relatedTableName = 'geometry3d';
      var mappingTableName = 'g2d_3d';

      var er = new ExtendedRelation()
      er.base_table_name = baseTableName;
      er.base_primary_column = geoPackage.getFeatureDao(baseTableName).table.getPkColumn().name;
      er.related_table_name = relatedTableName;
      er.related_primary_column = geoPackage.getFeatureDao(relatedTableName).table.getPkColumn().name
      er.mapping_table_name = mappingTableName;
      er.relation_name = 'FEATURES';

      await rte.createUserMappingTable(mappingTableName)

      let extendedRelation = await rte.addFeaturesRelationship(er)
      rte.has().should.be.equal(true);
      rte.has(mappingTableName).should.be.equal(true);
      should.exist(extendedRelation);
      var relationships = rte.getRelationships();
      relationships.length.should.be.equal(1);
      geoPackage.isTable(mappingTableName).should.be.equal(true);

      var baseDao = geoPackage.getFeatureDao(baseTableName);
      var relatedDao = geoPackage.getFeatureDao(relatedTableName);
      var baseResults = baseDao.queryForAll();
      var relatedResults = relatedDao.queryForAll();

      var userMappingDao = rte.getMappingDao(mappingTableName);
      var userMappingRow;
      for (var i = 0; i < 10; i++) {
        userMappingRow = userMappingDao.newRow();
        userMappingRow.setBaseId(Math.floor(Math.random() * baseResults.length));
        userMappingRow.setRelatedId(Math.floor(Math.random() * relatedResults.length));
        var result = userMappingDao.create(userMappingRow);
        var relationships = rte.getRelatedRows(baseTableName, userMappingRow.getBaseId());
        relationships.length.should.be.above(0)
      }

      var count = userMappingDao.getCount();
      count.should.be.equal(10);

      var userMappingRows = userMappingDao.queryForAll();
      userMappingRows.length.should.be.equal(10);

      var rowsDeleted = 0;
      for (var i = 0; i < userMappingRows.length; i++) {
        var resultRow = userMappingDao.getUserMappingRow(userMappingRows[i]);
        should.not.exist(resultRow.getId());
        var deleteResult = userMappingDao.deleteByIds(resultRow.getBaseId(), resultRow.getRelatedId());
        rowsDeleted += deleteResult;
      }
      rowsDeleted.should.be.equal(10);
      rte.removeExtension();
      rte.has(mappingTableName).should.be.equal(false);
      relationships = rte.getRelationships();
      relationships.length.should.be.equal(0);
      geoPackage.isTable(mappingTableName).should.be.equal(false);
      rte.has().should.be.equal(false);
    });

    it('should fail to make a relationship to a related table that does not exist', async function() {

      var rte = new RelatedTablesExtension(geoPackage);
      rte.has().should.be.equal(false);

      var extendedRelationships = rte.getRelationships();
      extendedRelationships.length.should.be.equal(0);

      var baseTableName = 'geometry2d';
      var mappingTableName = 'g2d_3d';

      var additionalColumns = RelatedTablesUtils.createAdditionalUserColumns(UserMappingTable.numRequiredColumns());
      var userMappingTable = UserMappingTable.create(mappingTableName, additionalColumns);
      rte.has(userMappingTable.table_name).should.be.equal(false);

      var featureRelationship = RelatedTablesExtension.RelationshipBuilder()
      .setBaseTableName(baseTableName)
      .setRelatedTableName('nope')
      .setRelationAuthor('author')
      .setUserMappingTable(userMappingTable);

      try {
        let added = await rte.addRelationship(featureRelationship)
        added.should.be.equal(false)
      } catch (e) {
        should.not.exist(e)
      }
    });

    it('should fail to make a relationship to a base table that does not exist', async function() {
      var rte = new RelatedTablesExtension(geoPackage);
      rte.has().should.be.equal(false);

      var extendedRelationships = rte.getRelationships();
      extendedRelationships.length.should.be.equal(0);

      var relatedTableName = 'geometry2d';
      var mappingTableName = 'g2d_3d';

      var additionalColumns = RelatedTablesUtils.createAdditionalUserColumns(UserMappingTable.numRequiredColumns());
      var userMappingTable = UserMappingTable.create(mappingTableName, additionalColumns);
      rte.has(userMappingTable.table_name).should.be.equal(false);

      var featureRelationship = RelatedTablesExtension.RelationshipBuilder()
      .setBaseTableName('nope')
      .setRelatedTableName(relatedTableName)
      .setRelationAuthor('author')
      .setUserMappingTable(userMappingTable);

      try {
        let added = await rte.addRelationship(featureRelationship)
        added.should.be.equal(false)
      } catch (e) {
        should.not.exist(e)
      }
    });

    it('should fail to make a relationship if the related table is the wrong type', async function() {
      var rte = new RelatedTablesExtension(geoPackage);
      rte.has().should.be.equal(false);

      var extendedRelationships = rte.getRelationships();
      extendedRelationships.length.should.be.equal(0);

      var baseTableName = 'geometry2d';
      var relatedTableName = 'geometry3d';
      var mappingTableName = 'g2d_3d';

      var additionalColumns = RelatedTablesUtils.createAdditionalUserColumns(UserMappingTable.numRequiredColumns());
      var userMappingTable = UserMappingTable.create(mappingTableName, additionalColumns);
      rte.has(userMappingTable.table_name).should.be.equal(false);

      var featureRelationship = RelatedTablesExtension.RelationshipBuilder()
      .setBaseTableName(baseTableName)
      .setRelatedTableName(relatedTableName)
      .setRelationName('TILES')
      .setUserMappingTable(userMappingTable);

      try {
        let added = await rte.addRelationship(featureRelationship)
        added.should.be.equal(false)
      } catch (e) {
        console.log('e', e)
        should.not.exist(e)
      }
    });

    it('should not fail when removing a relationship that does not exist', async function() {
      var rte = new RelatedTablesExtension(geoPackage);
      rte.has().should.be.equal(false);

      var extendedRelationships = rte.getRelationships();
      extendedRelationships.length.should.be.equal(0);

      var baseTableName = 'geometry2d';
      var relatedTableName = 'geometry3d';
      var mappingTableName = 'g2d_3d';

      var additionalColumns = RelatedTablesUtils.createAdditionalUserColumns(UserMappingTable.numRequiredColumns());
      var userMappingTable = UserMappingTable.create(mappingTableName, additionalColumns);
      rte.has(userMappingTable.table_name).should.be.equal(false);

      var featureRelationship = RelatedTablesExtension.RelationshipBuilder()
      .setBaseTableName(baseTableName)
      .setRelatedTableName(relatedTableName)
      .setRelationName('TILES')
      .setUserMappingTable(userMappingTable);

      rte.removeRelationship(featureRelationship).should.be.equal(0)
    });
  });
});