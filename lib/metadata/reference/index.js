/**
 * MetadataReference module.
 * @module metadata/reference
 * @see module:dao/dao
 */

import Dao from '../../dao/dao'
import ColumnValues from '../../dao/columnValues'

/**
 * Links metadata in the gpkg_metadata table to data in the feature, and tiles tables
 * @class MetadataReference
 */
class MetadataReference {
  constructor() {
    /**
     * Lowercase metadata reference scope; one of ‘geopackage’, ‘table’, ‘column’, ’row’, ’row/col’
     * @member {string}
     */
    this.reference_scope;
    /**
     * Name of the table to which this metadata reference applies, or NULL for reference_scope of ‘geopackage’.
     * @member {string}
     */
    this.table_name;
    /**
     * Name of the column to which this metadata reference applies; NULL for
     * reference_scope of ‘geopackage’,‘table’ or ‘row’, or the name of a column
     * in the table_name table for reference_scope of ‘column’ or ‘row/col’
     * @member {string}
     */
    this.column_name;
    /**
     * NULL for reference_scope of ‘geopackage’, ‘table’ or ‘column’, or the
     * rowed of a row record in the table_name table for reference_scope of
     * ‘row’ or ‘row/col’
     * @member {Number}
     */
    this.row_id_value;
    /**
     * timestamp value in ISO 8601 format as defined by the strftime function
     * '%Y-%m-%dT%H:%M:%fZ' format string applied to the current time
     * @member {Date}
     */
    this.timestamp;
    /**
     * gpkg_metadata table id column value for the metadata to which this
     * gpkg_metadata_reference applies
     * @member {Number}
     */
    this.md_file_id;
    /**
     * gpkg_metadata table id column value for the hierarchical parent
     * gpkg_metadata for the gpkg_metadata to which this gpkg_metadata_reference
     * applies, or NULL if md_file_id forms the root of a metadata hierarchy
     * @member {Number}
     */
    this.md_parent_id;
  }
  toDatabaseValue(columnName) {
    if (columnName === 'timestamp') {
      return this.timestamp.toISOString();
    }
    return this[columnName];
  }
  /**
   * Set the metadata
   * @param  {Metadata} metadata metadata
   */
  setMetadata(metadata) {
    if (metadata) {
      this.md_file_id = metadata.id;
    }
    else {
      this.md_file_id = -1;
    }
  }
  /**
   * Set the parent metadata
   * @param  {Metadata} metadata parent metadata
   */
  setParentMetadata(metadata) {
    if (metadata) {
      this.md_parent_id = metadata.id;
    }
    else {
      this.md_parent_id = -1;
    }
  }
  setReferenceScopeType(referenceScopeType) {
    this.reference_scope = referenceScopeType;
    switch (referenceScopeType) {
      case MetadataReference.GEOPACKAGE:
        this.table_name = undefined;
        this.column_name = undefined;
        this.row_id_value = undefined;
        break;
      case MetadataReference.TABLE:
        this.column_name = undefined;
        this.row_id_value = undefined;
        break;
      case MetadataReference.ROW:
        this.column_name = undefined;
        break;
      case MetadataReference.COLUMN:
        this.row_id_value = undefined;
        break;
    }
  }
}

MetadataReference.GEOPACKAGE = "geopackage";
MetadataReference.TABLE = "table";
MetadataReference.COLUMN = "column";
MetadataReference.ROW = "row";
MetadataReference.ROW_COL = "row/col";

/**
 * Metadata Reference Data Access Object
 * @class
 * @extends {module:dao/dao~Dao}
 */
class MetadataReferenceDao extends Dao {
  createObject() {
    return new MetadataReference();
  }
  removeMetadataParent(parentId) {
    var values = {};
    values[MetadataReferenceDao.COLUMN_MD_PARENT_ID] = null;
    var where = this.buildWhereWithFieldAndValue(MetadataReferenceDao.COLUMN_MD_PARENT_ID, parentId);
    var whereArgs = this.buildWhereArgs(parentId);
    return this.updateWithValues(values, where, whereArgs);
  }
  queryByMetadataAndParent(fileId, parentId) {
    var columnValues = new ColumnValues();
    columnValues.addColumn(MetadataReferenceDao.COLUMN_MD_FILE_ID, fileId);
    columnValues.addColumn(MetadataReferenceDao.COLUMN_MD_PARENT_ID, parentId);
    return this.queryForFieldValues(columnValues);
  }
  queryByMetadata(fileId) {
    var columnValues = new ColumnValues();
    columnValues.addColumn(MetadataReferenceDao.COLUMN_MD_FILE_ID, fileId);
    return this.queryForFieldValues(columnValues);
  }
  queryByMetadataParent(parentId) {
    var columnValues = new ColumnValues();
    columnValues.addColumn(MetadataReferenceDao.COLUMN_MD_PARENT_ID, parentId);
    return this.queryForFieldValues(columnValues);
  }
}

MetadataReferenceDao.TABLE_NAME = "gpkg_metadata_reference";
MetadataReferenceDao.COLUMN_REFERENCE_SCOPE = "reference_scope";
MetadataReferenceDao.COLUMN_TABLE_NAME = "table_name";
MetadataReferenceDao.COLUMN_COLUMN_NAME = "column_name";
MetadataReferenceDao.COLUMN_ROW_ID = "row_id";
MetadataReferenceDao.COLUMN_TIMESTAMP = "timestamp";
MetadataReferenceDao.COLUMN_MD_FILE_ID = "md_file_id";
MetadataReferenceDao.COLUMN_MD_PARENT_ID = "md_parent_id";


MetadataReferenceDao.prototype.gpkgTableName = MetadataReferenceDao.TABLE_NAME;
MetadataReferenceDao.prototype.idColumns = [MetadataReferenceDao.COLUMN_MD_FILE_ID, MetadataReferenceDao.COLUMN_MD_PARENT_ID];

export {
  MetadataReferenceDao,
  MetadataReference
}
