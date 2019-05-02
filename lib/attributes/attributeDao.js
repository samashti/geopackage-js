/**
 * @module attributes/attributeDao
 */

import UserDao from '../user/userDao'
import AttributeRow from './attributeRow'

/**
 * Attribute DAO for reading attribute user data tables
 * @class AttributeDao
 * @extends {module:user/userDao~UserDao}
 * @param  {module:geoPackage~GeoPackage} geopackage              geopackage object
 * @param  {module:attributes/attributeTable~AttributeTable} table           attribute table
 */
class AttributeDao extends UserDao {
  constructor(geoPackage, table) {
    super(geoPackage, table);
    if (!table.contents) {
      throw new Error('Attributes table has null Contents');
    }
    /**
     * Contents of this AttributeDao
     * @member {module:core/contents~Contents}
     */
    this.contents = table.contents;
  }
  /**
   * Create a new attribute row with the column types and values
   * @param  {Array} columnTypes column types
   * @param  {module:dao/columnValues~ColumnValues[]} values      values
   * @return {moule:attributes/attributeRow~AttributeRow}             attribute row
   */
  newRowWithColumnTypes(columnTypes, values) {
    return new AttributeRow(this.table, columnTypes, values);
  }
  /**
   * Create a new attribute row
   * @return {module:attributes/attributeRow~AttributeRow} attribute row
   */
  newRow() {
    return new AttributeRow(this.table);
  }
}

export default AttributeDao;
