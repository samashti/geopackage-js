/**
 * @module db/dataTypes
 */

/**
 * `GPKGDataType` is an enum hash of constant values that represent the column
 * types found in GeoPackage SQLite database tables.
 *
 * @enum {number}
 * @readonly
 */
var DataTypes = {}
DataTypes.GPKGDataType = {
  /**
   * A boolean value representing true or false.
   */
  GPKG_DT_BOOLEAN: 0,
  /**
   * 8-bit signed two’s complement integer.
   */
  GPKG_DT_TINYINT: 1,
  /**
   * 16-bit signed two’s complement integer.
   */
  GPKG_DT_SMALLINT: 2,
  /**
   * 32-bit signed two’s complement integer.
   */
  GPKG_DT_MEDIUMINT: 3,
  /**
   * 64-bit signed two’s complement integer.
   */
  GPKG_DT_INT: 4,
  /**
   * 64-bit signed two’s complement integer.
   */
  GPKG_DT_INTEGER: 5,
  /**
   * 32-bit IEEE floating point number.
   */
  GPKG_DT_FLOAT: 6,
  /**
   * 64-bit IEEE floating point number.
   */
  GPKG_DT_DOUBLE: 7,
  /**
   * 64-bit IEEE floating point number.
   */
  GPKG_DT_REAL: 8,
  /**
   * TEXT{(maxchar_count)}: Variable length string encoded in either UTF-8 or UTF-16, determined by PRAGMA encoding; see http://www.sqlite.org/pragma.html#pragma_encoding.
   */
  GPKG_DT_TEXT: 9,
  /**
   * BLOB{(max_size)}: Variable length binary data.
   */
  GPKG_DT_BLOB: 10,
  /**
   * ISO-8601 date string in the form YYYY-MM-DD encoded in either UTF-8 or UTF-16.
   */
  GPKG_DT_DATE: 11,
  /**
   * ISO-8601 date/time string in the form YYYY-MM-DDTHH:MM:SS.SSSZ with T separator character and Z suffix for coordinated universal time (UTC) encoded in either UTF-8 or UTF-16.
   */
  GPKG_DT_DATETIME: 12,
  /**
   * The `GEOMETRY` column type
   */
  GPKG_DT_GEOMETRY: 13
};

DataTypes.GPKG_DT_BOOLEAN_NAME = "BOOLEAN";
DataTypes.GPKG_DT_TINYINT_NAME = "TINYINT";
DataTypes.GPKG_DT_SMALLINT_NAME = "SMALLINT";
DataTypes.GPKG_DT_MEDIUMINT_NAME = "MEDIUMINT";
DataTypes.GPKG_DT_INT_NAME = "INT";
DataTypes.GPKG_DT_INTEGER_NAME = "INTEGER";
DataTypes.GPKG_DT_FLOAT_NAME = "FLOAT";
DataTypes.GPKG_DT_DOUBLE_NAME = "DOUBLE";
DataTypes.GPKG_DT_REAL_NAME = "REAL";
DataTypes.GPKG_DT_TEXT_NAME = "TEXT";
DataTypes.GPKG_DT_BLOB_NAME = "BLOB";
DataTypes.GPKG_DT_DATE_NAME = "DATE";
DataTypes.GPKG_DT_DATETIME_NAME = "DATETIME";
DataTypes.GPKG_DT_GEOMETRY_NAME = "GEOMETRY";

DataTypes.GPKGDataType[DataTypes.GPKG_DT_BOOLEAN_NAME] = DataTypes.GPKGDataType.GPKG_DT_BOOLEAN;
DataTypes.GPKGDataType[DataTypes.GPKG_DT_TINYINT_NAME] = DataTypes.GPKGDataType.GPKG_DT_TINYINT;
DataTypes.GPKGDataType[DataTypes.GPKG_DT_SMALLINT_NAME] = DataTypes.GPKGDataType.GPKG_DT_SMALLINT;
DataTypes.GPKGDataType[DataTypes.GPKG_DT_MEDIUMINT_NAME] = DataTypes.GPKGDataType.GPKG_DT_MEDIUMINT;
DataTypes.GPKGDataType[DataTypes.GPKG_DT_INT_NAME] = DataTypes.GPKGDataType.GPKG_DT_INT;
DataTypes.GPKGDataType[DataTypes.GPKG_DT_INTEGER_NAME] = DataTypes.GPKGDataType.GPKG_DT_INTEGER;
DataTypes.GPKGDataType[DataTypes.GPKG_DT_FLOAT_NAME] = DataTypes.GPKGDataType.GPKG_DT_FLOAT;
DataTypes.GPKGDataType[DataTypes.GPKG_DT_DOUBLE_NAME] = DataTypes.GPKGDataType.GPKG_DT_DOUBLE;
DataTypes.GPKGDataType[DataTypes.GPKG_DT_REAL_NAME] = DataTypes.GPKGDataType.GPKG_DT_REAL;
DataTypes.GPKGDataType[DataTypes.GPKG_DT_TEXT_NAME] = DataTypes.GPKGDataType.GPKG_DT_TEXT;
DataTypes.GPKGDataType[DataTypes.GPKG_DT_BLOB_NAME] = DataTypes.GPKGDataType.GPKG_DT_BLOB;
DataTypes.GPKGDataType[DataTypes.GPKG_DT_DATE_NAME] = DataTypes.GPKGDataType.GPKG_DT_DATE;
DataTypes.GPKGDataType[DataTypes.GPKG_DT_DATETIME_NAME] = DataTypes.GPKGDataType.GPKG_DT_DATETIME;
DataTypes.GPKGDataType[DataTypes.GPKG_DT_GEOMETRY_NAME] = DataTypes.GPKGDataType.GPKG_DT_GEOMETRY;

/**
 * Return the name of the given data type.
 *
 * @param  {module:db/dataTypes~GPKGDataType} dataType the enum to retrieve the name for
 * @return {String} the string name of the given data type enum
 */
DataTypes.name = function(dataType) {
  switch(dataType) {
    case DataTypes.GPKGDataType.GPKG_DT_BOOLEAN:
      return DataTypes.GPKG_DT_BOOLEAN_NAME;
    case DataTypes.GPKGDataType.GPKG_DT_TINYINT:
      return DataTypes.GPKG_DT_TINYINT_NAME;
    case DataTypes.GPKGDataType.GPKG_DT_SMALLINT:
      return DataTypes.GPKG_DT_SMALLINT_NAME;
    case DataTypes.GPKGDataType.GPKG_DT_MEDIUMINT:
      return DataTypes.GPKG_DT_MEDIUMINT_NAME;
    case DataTypes.GPKGDataType.GPKG_DT_INT:
      return DataTypes.GPKG_DT_INT_NAME;
    case DataTypes.GPKGDataType.GPKG_DT_INTEGER:
      return DataTypes.GPKG_DT_INTEGER_NAME;
    case DataTypes.GPKGDataType.GPKG_DT_FLOAT:
      return DataTypes.GPKG_DT_FLOAT_NAME;
    case DataTypes.GPKGDataType.GPKG_DT_DOUBLE:
      return DataTypes.GPKG_DT_DOUBLE_NAME;
    case DataTypes.GPKGDataType.GPKG_DT_REAL:
      return DataTypes.GPKG_DT_REAL_NAME;
    case DataTypes.GPKGDataType.GPKG_DT_TEXT:
      return DataTypes.GPKG_DT_TEXT_NAME;
    case DataTypes.GPKGDataType.GPKG_DT_BLOB:
      return DataTypes.GPKG_DT_BLOB_NAME;
    case DataTypes.GPKGDataType.GPKG_DT_DATE:
      return DataTypes.GPKG_DT_DATE_NAME;
    case DataTypes.GPKGDataType.GPKG_DT_DATETIME:
      return DataTypes.GPKG_DT_DATETIME_NAME;
    case DataTypes.GPKGDataType.GPKG_DT_GEOMETRY:
      return DataTypes.GPKG_DT_GEOMETRY_NAME;
  }
}

/**
 * Return the data type enum value for the given name, ignoring case.
 *
 * @param  {String} name the name of the data type enum
 * @return {module:db/dataTypes~GPKGDataType} the enum value
 */
DataTypes.fromName = function(name) {
  var value = 9;
  if (name) {
    name = name.toUpperCase();
    value = DataTypes.GPKGDataType[name];
  }
  return value;
}

export {DataTypes}

export default DataTypes
