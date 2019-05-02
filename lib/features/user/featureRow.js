/**
 * featureRow module.
 * @module features/user/featureRow
 */

import UserRow from '../../user/userRow'
import FeatureColumn from './featureColumn'
import GeometryData from '../../geom/geometryData'
import DataTypes from '../../db/dataTypes'

/**
 * Feature Row containing the values from a single result set row
 * @param  {FeatureTable} featureTable feature table
 * @param  {Array} columnTypes  column types
 * @param  {Array} values       values
 */
class FeatureRow extends UserRow {
  constructor(featureTable, columnTypes, values) {
    super(featureTable, columnTypes, values);
    this.featureTable = featureTable;
  }
  /**
   * Get the geometry column index
   * @return {Number} geometry column index
   */
  getGeometryColumnIndex() {
    return this.featureTable.geometryIndex;
  }
  /**
   * Get the geometry column
   * @return {FeatureColumn} geometry column
   */
  getGeometryColumn() {
    return this.featureTable.getGeometryColumn();
  }
  /**
   * Get the geometry
   * @return {Buffer} geometry data
   */
  getGeometry() {
    return this.getValueWithIndex(this.featureTable.geometryIndex);
  }
  /**
   * set the geometry
   * @param {Buffer} geometryData geometry data
   */
  setGeometry(geometryData) {
    this.setValueWithIndex(this.featureTable.geometryIndex, geometryData);
  }
  toObjectValue(index, value) {
    var objectValue = value;
    var column = this.getColumnWithIndex(index);
    if (column.isGeometry() && value) {
      objectValue = new GeometryData(value);
    }
    return objectValue;
  }
  toDatabaseValue(columnName) {
    var column = this.getColumnWithColumnName(columnName);
    var value = this.getValueWithColumnName(columnName);
    if (column.isGeometry() && value.toData) {
      return value.toData();
    }
    else if (column.dataType === DataTypes.GPKGDataType.BOOLEAN) {
      return value === true ? 1 : 0;
    }
    return value;
  }
}

export default FeatureRow
