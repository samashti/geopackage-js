/**
 * attributeTableReader module.
 * @module attributes/attributeTableReader
 */

import UserTableReader from '../user/userTableReader'
import AttributeTable from './attributeTable'
import DataTypes from '../db/dataTypes'

import util from 'util'

/**
* Reads the metadata from an existing attribute table
* @class AttributeTableReader
* @extends {module:user/userTableReader~UserTableReader}
* @classdesc Reads the metadata from an existing attributes table
*/
var AttributeTableReader = function(tableName) {
  UserTableReader.call(this, tableName);
}

util.inherits(AttributeTableReader, UserTableReader);

/**
 * @inheritdoc
 */
AttributeTableReader.prototype.createTable = function (tableName, columns) {
  return new AttributeTable(tableName, columns);
};

export default AttributeTableReader;
