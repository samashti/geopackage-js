/**
 * @module extension/contents
 */

import Dao from '../../dao/dao'
import ColumnValues from '../../dao/columnValues'

import util from 'util'

/**
 * @class ContentsId
 */
var ContentsId = function() {

  /**
   * Autoincrement primary key
   * @member {Number}
   */
  this.id;

  /**
   * The name of the actual content table, foreign key to gpkg_contents
   * @member {String}
   */
  this.table_name;
}

ContentsId.prototype.setContents = function(contents) {
  if (contents) {
    this.table_name = contents.table_name
  }
}

/**
 * Contents Id Data Access Object
 * @class ContentsIdDao
 * @extends {module:dao/dao~Dao}
 */
var ContentsIdDao = function(geoPackage) {
  Dao.call(this, geoPackage);
};

util.inherits(ContentsIdDao, Dao);

/**
 * Create a {module:extension/contents~ContentsId} object
 * @return {module:extension/contents~ContentsId}
 */
ContentsIdDao.prototype.createObject = function() {
  return new ContentsId();
};

/**
 * Create the necessary tables for this dao
 * @return {Promise}
 */
ContentsIdDao.prototype.createTable = function() {
  var tc = this.geoPackage.getTableCreator();
  return tc.createContentsId();
}

ContentsIdDao.prototype.create = function(object) {
  var id = Dao.prototype.create.call(this, object);
  object.id = id;
  return id;
}

ContentsIdDao.prototype.getContents = function(contentsId) {
  return this.geoPackage.getContentsDao().queryForId(contentsId.table_name)
}

ContentsIdDao.prototype.queryForTableName = function(tableName) {
  var results = this.queryForAllEq(ContentsIdDao.COLUMN_TABLE_NAME, tableName);
  if (results.length) {
    return results[0]
  }
  return
}

ContentsIdDao.prototype.deleteByTableName = function(tableName) {
  var where = this.buildWhereWithFieldAndValue(ContentsIdDao.COLUMN_TABLE_NAME, tableName);
  var whereArgs = this.buildWhereArgs(tableName);
  return this.deleteWhere(where, whereArgs);
}

ContentsIdDao.TABLE_NAME = 'nga_contents_id';
ContentsIdDao.COLUMN_ID = ContentsIdDao.TABLE_NAME + '.id';
ContentsIdDao.COLUMN_TABLE_NAME = ContentsIdDao.TABLE_NAME + '.table_name';

ContentsIdDao.prototype.gpkgTableName = ContentsIdDao.TABLE_NAME;
ContentsIdDao.prototype.idColumns = ['id'];

export {
  ContentsIdDao,
  ContentsId
}
