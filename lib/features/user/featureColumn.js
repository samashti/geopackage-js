/**
 * @module features/user/featureColumn
 */

import UserColumn from '../../user/userColumn'
import DataTypes from '../../db/dataTypes'

/**
 * Represents a user feature column
 * @class
 * @extends {module:user/userColumn~UserColumn}
 */
class FeatureColumn extends UserColumn {
  constructor(index, name, dataType, max, notNull, defaultValue, primaryKey, geometryType) {
    super(index, name, dataType, max, notNull, defaultValue, primaryKey);
    this.geometryType = geometryType;
    if (!geometryType && dataType === DataTypes.GPKGDataType.GPKG_DT_GEOMETRY) {
      throw new Error('Data or Geometry Type is required to create column: ' + name);
    }
  }
  getTypeName() {
    if (this.isGeometry()) {
      return this.geometryType;
    }
    return this.dataType !== undefined && DataTypes.name(this.dataType);
  }
  /**
   * Determine if this column is a geometry
   * @return {Boolean} true if a geometry column
   */
  isGeometry() {
    return this.geometryType !== undefined;
  }
  /**
   *  Create a new primary key column
   *
   *  @param {Number} index column index
   *  @param {string} name  column name
   *
   *  @return feature column
   */
  static createPrimaryKeyColumnWithIndexAndName(index, name) {
    return new FeatureColumn(index, name, DataTypes.GPKGDataType.GPKG_DT_INTEGER, undefined, true, undefined, true);
  }
  /**
   *  Create a new geometry column
   *
   *  @param {Number} index        column index
   *  @param {string} name         column name
   *  @param {WKBGeometryType} type         geometry type
   *  @param {Boolean} notNull      not null
   *  @param {Object} defaultValue default value or nil
   *
   *  @return feature column
   */
  static createGeometryColumn(index, name, type, notNull, defaultValue) {
    return new FeatureColumn(index, name, type, undefined, notNull, defaultValue, false, type);
  }
  /**
   *  Create a new column
   *
   *  @param {Number} index column index
   *  @param {string} name column name
   *  @param {module:db/dataTypes~GPKGDataType} type         data type
   *  @param {Boolean} notNull not null
   *  @param {Object} defaultValue default value or nil
   *
   *  @return feature column
   */
  static createColumnWithIndex(index, name, type, notNull, defaultValue) {
    return FeatureColumn.createColumnWithIndexAndMax(index, name, type, undefined, notNull, defaultValue);
  }
  /**
   *  Create a new column
   *
   *  @param {Number} index        column index
   *  @param {string} name         column name
   *  @param {module:db/dataTypes~GPKGDataType} type         data type
   *  @param {Number} max max value
   *  @param {Boolean} notNull      not null
   *  @param {Object} defaultValue default value or nil
   *
   *  @return feature column
   */
  static createColumnWithIndexAndMax(index, name, type, max, notNull, defaultValue) {
    return new FeatureColumn(index, name, type, max, notNull, defaultValue, false);
  }
}

export default FeatureColumn
