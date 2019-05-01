/**
 * SimpleAttributesRow module.
 * @module extension/relatedTables
 */

import UserRow from '../../user/userRow'

import util from 'util'

/**
 * User Simple Attributes Row containing the values from a single result set row
 * @class
 * @extends {module:user/userRow~UserRow}
 * @param  {module:extension/relatedTables~SimpleAttributesTable} simpleAttributesTable simple attributes table
 * @param  {module:db/dataTypes[]} columnTypes  column types
 * @param  {module:dao/columnValues~ColumnValues[]} values      values
 */
var SimpleAttributesRow = function(simpleAttributesTable, columnTypes, values) {
  UserRow.call(this, simpleAttributesTable, columnTypes, values);
  this.simpleAttributesTable = simpleAttributesTable;
}

util.inherits(SimpleAttributesRow, UserRow);

/**
 * Gets the primary key id column
 * @return {module:user/userColumn~UserColumn}
 */
SimpleAttributesRow.prototype.getIdColumn = function() {
  return this.simpleAttributesTable.getIdColumn();
}

/**
 * Gets the id
 * @return {Number}
 */
SimpleAttributesRow.prototype.getId = function() {
  return this.getValueWithColumnName(this.getIdColumn().name);
}

export default SimpleAttributesRow
