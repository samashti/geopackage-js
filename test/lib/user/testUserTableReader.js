var UserTableReader = require('../../../lib/user/userTableReader').default
  , UserCustomColumn = require('../../../lib/user/custom/userCustomColumn').default
  , UserDao = require('../../../lib/user/userDao').default
  , GeoPackageAPI = require('../../../lib').GeoPackage
  , path = require('path')
  , should = require('chai').should();

describe('UserTableReader tests', function() {
  var geoPackage;
  beforeEach('create the GeoPackage connection', async function() {
    var filename = path.join(__dirname, '..', '..', 'fixtures', 'gdal_sample.gpkg');
    geoPackage = await GeoPackageAPI.open(filename)
    should.exist(geoPackage);
    should.exist(geoPackage.getDatabase().getDBConnection());
    geoPackage.getPath().should.be.equal(filename);
  });

  afterEach('close the geopackage connection', function() {
    geoPackage.close();
  });

  it('should not make a usercustomcolumn without a data type', () => {
    try {
      new UserCustomColumn(0, 'name')
    } catch (e) {
      should.exist(e)
      e.message.should.be.equal('Data type is required to create column: name')
    }
  })

  it('should read the table', function() {
    var reader = new UserTableReader('point2d');
    var table = reader.readTable(geoPackage.getDatabase());
    table.table_name.should.be.equal('point2d');
    table.columns.length.should.be.equal(8);
    table.columns[0].name.should.be.equal('fid');
    table.columns[1].name.should.be.equal('geom');
    table.columns[2].name.should.be.equal('intfield');
    table.columns[3].name.should.be.equal('strfield');
    table.columns[4].name.should.be.equal('realfield');
    table.columns[5].name.should.be.equal('datetimefield');
    table.columns[6].name.should.be.equal('datefield');
    table.columns[7].name.should.be.equal('binaryfield');
  });

  it('should throw an error if the table does not exist', function() {
    var reader = new UserTableReader('nope');
    try {
    var table = reader.readTable(geoPackage.getDatabase());
    false.should.be.equal(true)
    } catch (e) {
      e.message.should.be.equal('Table does not exist: nope');
    }
  });

  it('should query the table', function() {
    var reader = new UserTableReader('point2d');
    var table = reader.readTable(geoPackage.getDatabase());
    var ud = new UserDao(geoPackage, table);
    var results = ud.queryForAll();
    should.exist(results);
    results.length.should.be.equal(2);
    for (var i = 0; i < results.length; i++) {
      var ur = ud.getRow(results[i]);
      ur.columnCount().should.be.equal(8);
      var names = ur.getColumnNames()
      names.should.include('fid');
      names.should.include('geom');
      names.should.include('intfield');
      names.should.include('strfield');
      names.should.include('realfield');
      names.should.include('datetimefield');
      names.should.include('datefield');
      names.should.include('binaryfield');
      ur.getColumnNameWithIndex(0).should.be.equal('fid');
      ur.getColumnIndexWithColumnName('fid').should.be.equal(0);
      ur.getValueWithIndex(0).should.be.equal(i+1);
      ur.getValueWithColumnName('fid').should.be.equal(i+1);
      ur.getRowColumnTypeWithIndex(0).should.be.equal(5);
      ur.getRowColumnTypeWithColumnName('fid').should.be.equal(5);
      ur.getColumnWithIndex(0).name.should.be.equal('fid');
      ur.getColumnWithColumnName('fid').name.should.be.equal('fid');
      ur.getId().should.be.equal(i+1);
      ur.getPkColumn().name.should.be.equal('fid');
      ur.getColumnWithIndex(0).getTypeName().should.be.equal('INTEGER');
      should.exist(ur.values);
      ur.getPkColumnIndex().should.be.equal(0)
    }
  });

  it('should not allow updating the primary key', function() {
    var reader = new UserTableReader('point2d');
    var table = reader.readTable(geoPackage.getDatabase());
    var ud = new UserDao(geoPackage, table);
    var results = ud.queryForAll();
    should.exist(results);
    results.length.should.be.equal(2);
    for (var i = 0; i < results.length; i++) {
      var ur = ud.getRow(results[i]);
      try {
        ur.setValueWithIndex(0, 'hello')
        false.should.be.equal(true)
      } catch (error) {
        error.message.should.be.equal('Cannot update the primary key of the row.  Table Name: point2d, Index: 0, Name: fid')
      }
    }
  });

  it('should allow setting any column with no validation', function() {
    var reader = new UserTableReader('point2d');
    var table = reader.readTable(geoPackage.getDatabase());
    var ud = new UserDao(geoPackage, table);
    var results = ud.queryForAll();
    should.exist(results);
    results.length.should.be.equal(2);
    for (var i = 0; i < results.length; i++) {
      var ur = ud.getRow(results[i]);
      try {
        ud.setValueInObject(ur, 0, 'hello')
        ur.values.fid.should.be.equal('hello')
      } catch (error) {
        false.should.be.equal(true)
      }
    }
  });

  it('should set the id column', function() {
    var reader = new UserTableReader('point2d');
    var table = reader.readTable(geoPackage.getDatabase());
    var ud = new UserDao(geoPackage, table);
    var results = ud.queryForAll();
    should.exist(results);
    results.length.should.be.equal(2);
    for (var i = 0; i < results.length; i++) {
      var ur = ud.getRow(results[i]);
      try {
        ur.setId('hello')
        ur.values.fid.should.be.equal('hello')
      } catch (error) {
        false.should.be.equal(true)
      }
    }
  });

  it('should return nothing if the table got somehow unset', function() {
    var reader = new UserTableReader('point2d');
    var table = reader.readTable(geoPackage.getDatabase());
    var ud = new UserDao(geoPackage, table);
    ud.table = undefined
    var row = ud.getRow({test: 'no'})
    should.not.exist(row)
  });

});
