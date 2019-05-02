/**
 * @module user/custom
 */
import UserDao from '../userDao'
import UserRow from '../userRow'
import UserCustomTableReader from './userCustomTableReader'

/**
 * User Custom Dao
 * @class
 * @extends module:user/userDao~UserDao
 * @param  {module:geoPackage~GeoPackage} geoPackage      geopackage object
 * @param  {module:user/custom~UserCustomTable} userCustomTable user custom table
 */
class UserCustomDao extends UserDao {
  /**
   * Create a new UserRow
   * @return {module:user/userRow~UserRow}
   */
  newRow() {
    return new UserRow(this.table);
  }
  /**
   * Reads the table specified from the geopackage
   * @param  {module:geoPackage~GeoPackage} geoPackage      geopackage object
   * @param  {string} tableName       table name
   * @param  {string[]} requiredColumns required columns
   * @return {module:user/custom~UserCustomDao}
   */
  static readTable(geoPackage, tableName, requiredColumns) {
    var reader = new UserCustomTableReader(tableName, requiredColumns);
    var userCustomTable = reader.readTable(geoPackage.getDatabase());
    return new UserCustomDao(geoPackage, userCustomTable);
  }
}

export default UserCustomDao
