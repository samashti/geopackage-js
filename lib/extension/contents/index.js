/**
 * Contents module.
 * @module extension/contents
 * @see module:extension/BaseExtension
 */
import BaseExtension from '../baseExtension'
import {Extension} from '../index.js'
import {ContentsId, ContentsIdDao} from './contentsId'
import {Contents, ContentsDao} from '../../core/contents'
/**
 * Contents ID Extension
 * This extension assigns a unique integer identifier to tables defined in the contents.
 * Allows foreign key referencing to a contents (text based primary key) by an integer identifier.
 * @param  {module:geoPackage~GeoPackage} geoPackage the GeoPackage object
 * @class
 * @extends {module:extension/baseExtension~BaseExtension}
 */
class ContentsIdExtension extends BaseExtension {
  constructor(geoPackage) {
    super(geoPackage)
    this.contentsIdDao = geoPackage.getContentsIdDao();
    this.extensionName = ContentsIdExtension.EXTENSION_NAME;
    this.extensionDefinition = ContentsIdExtension.EXTENSION_CONTENTS_ID_DEFINITION;
  }
  /**
   * Get or create the extension
   * @return {Promise}
   */
  getOrCreateExtension() {
    return this.getOrCreate(ContentsIdExtension.EXTENSION_NAME, undefined, undefined, ContentsIdExtension.EXTENSION_CONTENTS_ID_DEFINITION, Extension.READ_WRITE)
      .then(function () {
        return this.contentsIdDao.createTable();
      }.bind(this));
  }
  has() {
    return this.hasExtension(this.extensionName) && this.contentsIdDao.isTableExists();
  }
  getForContents(contents) {
    return this.getForTableName(contents.table_name);
  }
  getForTableName(tableName) {
    if (this.contentsIdDao.isTableExists()) {
      return this.contentsIdDao.queryForTableName(tableName);
    }
  }
  getIdForContents(contents) {
    return this.getIdForTableName(contents.table_name);
  }
  getIdForTableName(tableName) {
    var contentsId = this.getForTableName(tableName);
    if (contentsId) {
      return contentsId.id;
    }
  }
  createForContents(contents) {
    return this.createForTableName(contents.table_name);
  }
  createForTableName(tableName) {
    return this.getOrCreateExtension()
      .then(function () {
        var contentsId = new ContentsId();
        var contents = this.geoPackage.contentsOfTable(tableName);
        contentsId.setContents(contents);
        this.contentsIdDao.create(contentsId);
        return contentsId;
      }.bind(this));
  }
  getOrCreateIdForContents(contents) {
    return this.getOrCreateIdForTableName(contents.table_name);
  }
  getOrCreateIdForTableName(tableName) {
    return this.getOrCreateForTableName(tableName)
      .then(function (contentsId) {
        return contentsId.id;
      });
  }
  getOrCreateForContents(contents) {
    return this.getOrCreateForTableName(contents.table_name);
  }
  getOrCreateForTableName(tableName) {
    return new Promise(function (resolve) {
      var contentsId = this.getForTableName(tableName);
      if (contentsId) {
        return resolve(contentsId);
      }
      return resolve(this.createForTableName(tableName));
    }.bind(this));
  }
  deleteForContents(contents) {
    return this.deleteForTableName(contents.table_name);
  }
  deleteForTableName(tableName) {
    if (this.contentsIdDao.isTableExists()) {
      return this.contentsIdDao.deleteByTableName(tableName) > 0;
    }
    return false;
  }
  createIds() {
    return this.createIdsForType();
  }
  createIdsForType(type) {
    var tables = this.missingForType(type);
    return tables.reduce(function (sequence, tableName) {
      return sequence.then(function () {
        return this.getOrCreateForTableName(tableName);
      }.bind(this));
    }.bind(this), Promise.resolve())
      .then(function () {
        return tables.length;
      });
  }
  missing() {
    return this.missingForType();
  }
  deleteIds() {
    var deleted = 0;
    if (this.contentsIdDao.isTableExists()) {
      deleted = this.contentsIdDao.deleteAll();
    }
    return deleted;
  }
  deleteIdsForType(type) {
    var deleted = 0;
    if (!this.contentsIdDao.isTableExists()) {
      return deleted;
    }
    var contentsIds = [];
    var contentsIdsIterator = this.idsForType(type);
    for (var contentsId of contentsIdsIterator) {
      contentsIds.push(contentsId);
    }
    for (var contentsId of contentsIds) {
      deleted += this.contentsIdDao.delete(contentsId);
    }
    return deleted;
  }
  ids() {
    if (this.contentsIdDao.isTableExists()) {
      return this.contentsIdDao.queryForAll();
    }
    return [];
  }
  count() {
    var count = 0;
    if (this.has()) {
      count = this.contentsIdDao.count();
    }
    return count;
  }
  idsForType(type) {
    if (this.contentsIdDao.isTableExists()) {
      var query = 'SELECT ' + ContentsIdDao.TABLE_NAME + '.* FROM ' + ContentsIdDao.TABLE_NAME + ' INNER JOIN ' + ContentsDao.TABLE_NAME + ' ON ' + ContentsIdDao.COLUMN_TABLE_NAME + ' = ' + ContentsDao.TABLE_NAME + '.' + ContentsDao.COLUMN_TABLE_NAME + ' WHERE ' + ContentsDao.COLUMN_DATA_TYPE + ' = ?';
      return this.contentsIdDao.rawQueryForEach(query, [type]);
    }
    return [];
  }
  /**
   * Get table names without contents Ids
   * @param  {string} type contents data type
   * @return {Array[String]} table names without contents Ids
   */
  missingForType(type) {
    var missing = [];
    var contentsDao = this.geoPackage.getContentsDao();
    var query = 'SELECT ' + ContentsDao.COLUMN_TABLE_NAME + ' FROM ' + ContentsDao.TABLE_NAME;
    var where = '';
    var queryArgs = [];
    if (type && type !== '') {
      where += ContentsDao.COLUMN_DATA_TYPE + ' = ?';
      queryArgs = [type];
    }
    if (this.contentsIdDao.isTableExists()) {
      if (where !== '') {
        where += ' AND ';
      }
      where += ContentsDao.COLUMN_TABLE_NAME + ' NOT IN (SELECT ' + ContentsIdDao.COLUMN_TABLE_NAME + ' FROM ' + ContentsIdDao.TABLE_NAME + ')';
    }
    if (where !== '') {
      query += ' WHERE ' + where;
    }
    var results = contentsDao.rawQueryForEach(query, queryArgs);
    for (var row of results) {
      missing.push(row.table_name);
    }
    return missing;
  }
}

























ContentsIdExtension.EXTENSION_NAME = 'nga_contents_id';
ContentsIdExtension.EXTENSION_RELATED_TABLES_AUTHOR = 'nga';
ContentsIdExtension.EXTENSION_RELATED_TABLES_NAME_NO_AUTHOR = 'contents_id';
ContentsIdExtension.EXTENSION_CONTENTS_ID_DEFINITION = 'geopackage.extensions.contents_id"';

export default ContentsIdExtension
