/**
 * @module user/custom
 */

import UserColumn from '../userColumn'

/**
 * Create a new user custom columnd
 *  @param {Number} index        column index
 *  @param {string} name         column name
 *  @param {module:db/dataTypes~GPKGDataType} type         data type
 *  @param {Number} max max value
 *  @param {Boolean} notNull      not null
 *  @param {Object} defaultValue default value or nil
 *  @param {Boolean} primaryKey primary key
 */
class UserCustomColumn extends UserColumn {
  constructor(index, name, dataType, max, notNull, defaultValue, primaryKey) {
    super(index, name, dataType, max, notNull, defaultValue, primaryKey);
    if (dataType == null) {
      throw new Error('Data type is required to create column: ' + name);
    }
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
   *  @return {module:user/custom~UserCustomColumn} created column
   */
  static createColumn(index, name, dataType, max, notNull, defaultValue) {
    return new UserCustomColumn(index, name, dataType, max, notNull, defaultValue, false);
  }
}

export default UserCustomColumn
