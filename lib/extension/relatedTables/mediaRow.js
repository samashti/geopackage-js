/**
 * MediaRow module.
 * @module extension/relatedTables
 */

import UserRow from '../../user/userRow'

/**
 * User Media Row containing the values from a single result set row
 * @class
 * @extends {module:user/userRow~UserRow}
 * @param  {module:extension/relatedTables~MediaTable} mediaTable  media table
 * @param  {module:db/dataTypes[]} columnTypes  column types
 * @param  {module:dao/columnValues~ColumnValues[]} values      values
 */
class MediaRow extends UserRow {
  constructor(mediaTable, columnTypes, values) {
    super(mediaTable, columnTypes, values);
    this.mediaTable = mediaTable;
  }
  /**
   * Gets the id column
   * @return {module:user/userColumn~UserColumn}
   */
  getIdColumn() {
    return this.mediaTable.getIdColumn();
  }
  /**
   * Gets the id
   * @return {Number}
   */
  getId() {
    return this.getValueWithColumnName(this.getIdColumn().name);
  }
  /**
   * Get the data column
   * @return {module:user/userColumn~UserColumn}
   */
  getDataColumn() {
    return this.mediaTable.getDataColumn();
  }
  /**
   * Gets the data
   * @return {Buffer}
   */
  getData() {
    return this.getValueWithColumnName(this.getDataColumn().name);
  }
  /**
   * Sets the data for the row
   * @param  {Buffer} data data
   */
  setData(data) {
    this.setValueWithColumnName(this.getDataColumn().name, data);
  }
  /**
   * Get the content type column
   * @return {module:user/userColumn~UserColumn}
   */
  getContentTypeColumn() {
    return this.mediaTable.getContentTypeColumn();
  }
  /**
   * Gets the content type
   * @return {string}
   */
  getContentType() {
    return this.getValueWithColumnName(this.getContentTypeColumn().name);
  }
  /**
   * Sets the content type for the row
   * @param  {string} contentType contentType
   */
  setContentType(contentType) {
    this.setValueWithColumnName(this.getContentTypeColumn().name, contentType);
  }
}

export default MediaRow
