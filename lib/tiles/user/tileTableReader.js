/**
 * tileTableReader module.
 * @module tiles/user/tileTableReader
 */

import UserTableReader from '../../user/userTableReader'
import DataTypes from '../../db/dataTypes'
import TileTable from './tileTable'
import TileColumn from './tileColumn'

/**
* Reads the metadata from an existing tile table
* @class TileTableReader
* @extends {module:user~UserTableReader}
*/
class TileTableReader extends UserTableReader {
  constructor(tileMatrixSet) {
    super(tileMatrixSet.table_name);
    this.tileMatrixSet = tileMatrixSet;
  }
  readTileTable(geoPackage) {
    return this.readTable(geoPackage.getDatabase());
  }
  createTable(tableName, columns) {
    return new TileTable(tableName, columns);
  }
  createColumnWithResults(results, index, name, type, max, notNull, defaultValueIndex, primaryKey) {
    var dataType = DataTypes.fromName(type);
    var defaultValue = undefined;
    if (defaultValueIndex) {
      // console.log('default value index', defaultValueIndex);
      // console.log('result', results);
    }
    var column = new TileColumn(index, name, dataType, max, notNull, defaultValue, primaryKey);
    return column;
  }
}

/**
 * The TileTableReader
 * @type {TileTableReader}
 */
export default TileTableReader
