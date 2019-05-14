/**
 * TableIndexDao module.
 * @module extension/index
 */
import Dao from '../../dao/dao'
import TableCreator from '../../db/tableCreator'

/**
 * Table Index object, for indexing data within user tables
 * @class TableIndex
 */
class TableIndex {
  constructor() {
    /**
     * Name of the table
     * @member {String}
     */
    this.table_name;

    /**
     * Last indexed date
     * @member {String}
     */
    this.last_indexed;
  }
}

/**
 * Table Index Data Access Object
 * @class
 * @extends {module:dao/dao~Dao}
 * @param {module:geoPackage~GeoPackage}  geoPackage The GeoPackage object
 */
class TableIndexDao extends Dao {
  /**
   * Create a new TableIndex object
   * @return {module:extension/index~TableIndex}
   */
  createObject() {
    return new TableIndex();
  }
  /**
   * Creates the tables necessary
   * @return {Promise}
   */
  createTable() {
    var tc = new TableCreator(this.geoPackage);
    return tc.createTableIndex();
  }
}

TableIndexDao.TABLE_NAME = "nga_table_index";
TableIndexDao.COLUMN_TABLE_NAME = "table_name";
TableIndexDao.COLUMN_LAST_INDEXED = "last_indexed";

TableIndexDao.prototype.gpkgTableName = TableIndexDao.TABLE_NAME;
TableIndexDao.prototype.idColumns = [TableIndexDao.COLUMN_TABLE_NAME];

export {
  TableIndexDao,
  TableIndex
}
