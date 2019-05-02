/**
 * @module extension/relatedTables
 */

import UserMappingRow from './userMappingRow'
import UserMappingTable from './userMappingTable'
import UserCustomDao from '../../user/custom/userCustomDao'
import ColumnValues from '../../dao/columnValues'

/**
 * User Mapping DAO for reading user mapping data tables
 * @class
 * @extends {module:user/custom/userCustomDao~UserCustomDao}
 * @param  {module:db/geoPackageConnection~GeoPackageConnection} connection        connection
 * @param  {string} table table name
 */
class UserMappingDao extends UserCustomDao {
  constructor(userCustomDao, geoPackage) {
    super(geoPackage, new UserMappingTable(userCustomDao.table.table_name, userCustomDao.table.columns));
  }
  /**
   * Create a new {module:extension/relatedTables~UserMappingRow}
   * @return {module:extension/relatedTables~UserMappingRow}
   */
  newRow() {
    return new UserMappingRow(this.table);
  }
  /**
   * Gets the {module:extension/relatedTables~UserMappingTable}
   * @return {module:extension/relatedTables~UserMappingTable}
   */
  getTable() {
    return this.table;
  }
  /**
   * Create a user mapping row
   * @param  {module:db/dataTypes[]} columnTypes  column types
   * @param  {module:dao/columnValues~ColumnValues[]} values      values
   * @return {module:extension/relatedTables~UserMappingRow}             user mapping row
   */
  newRowWithColumnTypes(columnTypes, values) {
    return new UserMappingRow(this.table, columnTypes, values);
  }
  /**
   * Gets the user mapping row from the result
   * @param  {Object} result db result
   * @return {module:extension/relatedTables~UserMappingRow}             user mapping row
   */
  getUserMappingRow(result) {
    return this.getRow(result);
  }
  /**
   * Query by base id
   * @param  {Number} baseId base id
   * @return {Object[]}
   */
  queryByBaseId(baseId) {
    if (baseId.getBaseId) {
      baseId = baseId.getBaseId();
    }
    return this.queryForAllEq(UserMappingTable.COLUMN_BASE_ID, baseId);
  }
  /**
   * Query by related id
   * @param  {Number} relatedId related id
   * @return {Object[]}
   */
  queryByRelatedId(relatedId) {
    if (relatedId.getRelatedId) {
      relatedId = relatedId.getRelatedId();
    }
    return this.queryForAllEq(UserMappingTable.COLUMN_RELATED_ID, relatedId);
  }
  /**
   * Query by base id and related id
   * @param  {Number} baseId base id
   * @param  {Number} relatedId related id
   * @return {Object[]}
   */
  queryByIds(baseId, relatedId) {
    if (baseId.getBaseId) {
      relatedId = baseId.getRelatedId();
      baseId = baseId.getBaseId();
    }
    var values = new ColumnValues();
    values.addColumn(UserMappingTable.COLUMN_BASE_ID, baseId);
    values.addColumn(UserMappingTable.COLUMN_RELATED_ID, relatedId);
    return this.queryForFieldValues(values);
  }
  /**
   * Count user mapping rows by base id and related id
   * @param  {Number} baseId    base id
   * @param  {Number} relatedId related id
   * @return {Number}
   */
  countByIds(baseId, relatedId) {
    if (baseId.getBaseId) {
      relatedId = baseId.getRelatedId();
      baseId = baseId.getBaseId();
    }
    var values = new ColumnValues();
    values.addColumn(UserMappingTable.COLUMN_BASE_ID, baseId);
    values.addColumn(UserMappingTable.COLUMN_RELATED_ID, relatedId);
    return this.count(values);
  }
  /**
   * Delete by base id
   * @param  {Number} baseId base id
   * @return {Number} number of deleted rows
   */
  deleteByBaseId(baseId) {
    if (baseId.getBaseId) {
      baseId = baseId.getBaseId();
    }
    var where = '';
    where += this.buildWhereWithFieldAndValue(UserMappingTable.COLUMN_BASE_ID, baseId);
    var whereArgs = this.buildWhereArgs([baseId]);
    return this.deleteWhere(where, whereArgs);
  }
  /**
   * Delete by related id
   * @param  {Number} relatedId related id
   * @return {Number} number of deleted rows
   */
  deleteByRelatedId(relatedId) {
    if (relatedId.getRelatedId) {
      relatedId = relatedId.getRelatedId();
    }
    var where = '';
    where += this.buildWhereWithFieldAndValue(UserMappingTable.COLUMN_RELATED_ID, relatedId);
    var whereArgs = this.buildWhereArgs([relatedId]);
    return this.deleteWhere(where, whereArgs);
  }
  /**
   * Delete by base id and related id
   * @param  {Number} baseId    base id
   * @param  {Number} relatedId related id
   * @return {Number} number of deleted rows
   */
  deleteByIds(baseId, relatedId) {
    if (baseId.getBaseId) {
      relatedId = baseId.getRelatedId();
      baseId = baseId.getBaseId();
    }
    var where = '';
    where += this.buildWhereWithFieldAndValue(UserMappingTable.COLUMN_BASE_ID, baseId);
    where += ' and ';
    where += this.buildWhereWithFieldAndValue(UserMappingTable.COLUMN_RELATED_ID, relatedId);
    var whereArgs = this.buildWhereArgs([baseId, relatedId]);
    return this.deleteWhere(where, whereArgs);
  }
}

export default UserMappingDao
