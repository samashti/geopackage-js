/**
 * @module extension/contents
 */

import Dao from '../../dao/dao'
import ColumnValues from '../../dao/columnValues'

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
class ContentsIdDao extends Dao {
  /**
   * Create a {module:extension/contents~ContentsId} object
   * @return {module:extension/contents~ContentsId}
   */
  createObject() {
    return new ContentsId();
  }
  /**
   * Create the necessary tables for this dao
   * @return {Promise}
   */
  createTable() {
    var tc = this.geoPackage.getTableCreator();
    return tc.createContentsId();
  }
  create(object) {
    var id = Dao.prototype.create.call(this, object);
    object.id = id;
    return id;
  }
  getContents(contentsId) {
    return this.geoPackage.getContentsDao().queryForId(contentsId.table_name);
  }
  queryForTableName(tableName) {
    var results = this.queryForAllEq(ContentsIdDao.COLUMN_TABLE_NAME, tableName);
    if (results.length) {
      return results[0];
    }
    return;
  }
  deleteByTableName(tableName) {
    var where = this.buildWhereWithFieldAndValue(ContentsIdDao.COLUMN_TABLE_NAME, tableName);
    var whereArgs = this.buildWhereArgs(tableName);
    return this.deleteWhere(where, whereArgs);
  }
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
