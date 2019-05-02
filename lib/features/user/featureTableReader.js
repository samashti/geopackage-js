/**
 * featureTableReader module.
 * @module features/user/featureTableReader
 */
import UserTableReader from '../../user/userTableReader'
import FeatureTable from './featureTable'
import FeatureColumn from './featureColumn'
import {GeometryColumnsDao} from '../columns'
import DataTypes from '../../db/dataTypes'
import wkb from '../../wkb'

/**
* Reads the metadata from an existing feature table
* @class FeatureTableReader
* @extends {module:user~UserTableReader}
*/
class FeatureTableReader extends UserTableReader {
  constructor(tableNameOrGeometryColumns) {
    super(tableNameOrGeometryColumns.table_name ? tableNameOrGeometryColumns.table_name : tableNameOrGeometryColumns)
    if (tableNameOrGeometryColumns.table_name) {
      this.geometryColumns = tableNameOrGeometryColumns;
    }
  }
  readFeatureTable(geoPackage) {
    if (!this.geometryColumns) {
      var gcd = new GeometryColumnsDao(geoPackage);
      this.geometryColumns = gcd.queryForTableName(this.table_name);
      return this.readTable(geoPackage.getDatabase());
    }
    else {
      return this.readTable(geoPackage.getDatabase());
    }
  }
  createTable(tableName, columns) {
    return new FeatureTable(tableName, columns);
  }
  createColumnWithResults(results, index, name, type, max, notNull, defaultValue, primaryKey) {
    var geometry = name === this.geometryColumns.column_name;
    var geometryType = undefined;
    var dataType = undefined;
    if (geometry) {
      geometryType = wkb.fromName(type);
    }
    else {
      dataType = DataTypes.fromName(type);
    }
    var column = new FeatureColumn(index, name, dataType, max, notNull, defaultValue, primaryKey, geometryType);
    return column;
  }
}

/**
 * The FeatureTableReader
 * @type {FeatureTableReader}
 */
export default FeatureTableReader
