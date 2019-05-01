/**
 * tileTableReader module.
 * @module tiles/user/tileTableReader
 */

import UserTableReader from '../../user/userTableReader'
import DataTypes from '../../db/dataTypes'
import {TileMatrixSet} from '../matrixset'
import TileTable from './tileTable'
import TileColumn from './tileColumn'

import util from 'util'

/**
* Reads the metadata from an existing tile table
* @class TileTableReader
* @extends {module:user~UserTableReader}
*/
var TileTableReader = function(tileMatrixSet) {
  UserTableReader.call(this, tileMatrixSet.table_name);
  this.tileMatrixSet = tileMatrixSet;
}

util.inherits(TileTableReader, UserTableReader);

TileTableReader.prototype.readTileTable = function (geoPackage) {
  return this.readTable(geoPackage.getDatabase());
};

TileTableReader.prototype.createTable = function (tableName, columns) {
  return new TileTable(tableName, columns);
};

TileTableReader.prototype.createColumnWithResults = function (results, index, name, type, max, notNull, defaultValueIndex, primaryKey) {
  var dataType = DataTypes.fromName(type);
  var defaultValue = undefined;
  if (defaultValueIndex) {
    // console.log('default value index', defaultValueIndex);
    // console.log('result', results);
  }
  var column = new TileColumn(index, name, dataType, max, notNull, defaultValue, primaryKey);

  return column;
};

/**
 * The TileTableReader
 * @type {TileTableReader}
 */
export default TileTableReader
