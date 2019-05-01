/**
 * @module features/user/featureTable
 */

import UserTable from '../../user/userTable'
import util from 'util'

/**
 * `FeatureTable` models [feature user data tables](http://www.geopackage.org/spec/#feature_user_tables),
 *  which contain vector [geometry data]{@link module:features/columns~GeometryColumns}.
 *
 * @class
 * @extends {module:user/userTable~UserTable}
 * @param {string} tableName table name
 * @param {module:features/user/featureColumn~FeatureColumn[]} columns feature columns
 */
const FeatureTable = function(tableName, columns) {
  UserTable.call(this, tableName, columns);
  var geometry = undefined;
  for (var i = 0; i < columns.length; i++) {
    var column = columns[i];
    if (column.isGeometry()) {
      this.duplicateCheck(column.index, geometry, /* WKB_GEOMETRY_NAME */ 'GEOMETRY');
      geometry = column.index;
    }
  }
  this.missingCheck(geometry, /* WKB_GEOMETRY_NAME */ 'GEOMETRY');
  this.geometryIndex = geometry;
}

util.inherits(FeatureTable, UserTable);

/**
 * Get the geometry feature column of this feature table.  This column
 * corresponds to a row in the [geometry columns]{@link module:features/columns~GeometryColumns}
 * table.
 *
 * @returns {module:features/user/featureColumn~FeatureColumn}
 */
FeatureTable.prototype.getGeometryColumn = function () {
  return this.getColumnWithIndex(this.geometryIndex);
};

FeatureTable.prototype.getTableType = function() {
  return UserTable.FEATURE_TABLE;
}

export default FeatureTable
