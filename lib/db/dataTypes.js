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
var types = {}
types.GPKGDataType = {
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

types.GPKG_DT_BOOLEAN_NAME = "BOOLEAN";
types.GPKG_DT_TINYINT_NAME = "TINYINT";
types.GPKG_DT_SMALLINT_NAME = "SMALLINT";
types.GPKG_DT_MEDIUMINT_NAME = "MEDIUMINT";
types.GPKG_DT_INT_NAME = "INT";
types.GPKG_DT_INTEGER_NAME = "INTEGER";
types.GPKG_DT_FLOAT_NAME = "FLOAT";
types.GPKG_DT_DOUBLE_NAME = "DOUBLE";
types.GPKG_DT_REAL_NAME = "REAL";
types.GPKG_DT_TEXT_NAME = "TEXT";
types.GPKG_DT_BLOB_NAME = "BLOB";
types.GPKG_DT_DATE_NAME = "DATE";
types.GPKG_DT_DATETIME_NAME = "DATETIME";
types.GPKG_DT_GEOMETRY_NAME = "GEOMETRY";

types.GPKGDataType[types.GPKG_DT_BOOLEAN_NAME] = types.GPKGDataType.GPKG_DT_BOOLEAN;
types.GPKGDataType[types.GPKG_DT_TINYINT_NAME] = types.GPKGDataType.GPKG_DT_TINYINT;
types.GPKGDataType[types.GPKG_DT_SMALLINT_NAME] = types.GPKGDataType.GPKG_DT_SMALLINT;
types.GPKGDataType[types.GPKG_DT_MEDIUMINT_NAME] = types.GPKGDataType.GPKG_DT_MEDIUMINT;
types.GPKGDataType[types.GPKG_DT_INT_NAME] = types.GPKGDataType.GPKG_DT_INT;
types.GPKGDataType[types.GPKG_DT_INTEGER_NAME] = types.GPKGDataType.GPKG_DT_INTEGER;
types.GPKGDataType[types.GPKG_DT_FLOAT_NAME] = types.GPKGDataType.GPKG_DT_FLOAT;
types.GPKGDataType[types.GPKG_DT_DOUBLE_NAME] = types.GPKGDataType.GPKG_DT_DOUBLE;
types.GPKGDataType[types.GPKG_DT_REAL_NAME] = types.GPKGDataType.GPKG_DT_REAL;
types.GPKGDataType[types.GPKG_DT_TEXT_NAME] = types.GPKGDataType.GPKG_DT_TEXT;
types.GPKGDataType[types.GPKG_DT_BLOB_NAME] = types.GPKGDataType.GPKG_DT_BLOB;
types.GPKGDataType[types.GPKG_DT_DATE_NAME] = types.GPKGDataType.GPKG_DT_DATE;
types.GPKGDataType[types.GPKG_DT_DATETIME_NAME] = types.GPKGDataType.GPKG_DT_DATETIME;
types.GPKGDataType[types.GPKG_DT_GEOMETRY_NAME] = types.GPKGDataType.GPKG_DT_GEOMETRY;

/**
 * Return the name of the given data type.
 *
 * @param  {module:db/dataTypes~GPKGDataType} dataType the enum to retrieve the name for
 * @return {String} the string name of the given data type enum
 */
types.name = function(dataType) {
  switch(dataType) {
    case types.GPKGDataType.GPKG_DT_BOOLEAN:
      return types.GPKG_DT_BOOLEAN_NAME;
    case types.GPKGDataType.GPKG_DT_TINYINT:
      return types.GPKG_DT_TINYINT_NAME;
    case types.GPKGDataType.GPKG_DT_SMALLINT:
      return types.GPKG_DT_SMALLINT_NAME;
    case types.GPKGDataType.GPKG_DT_MEDIUMINT:
      return types.GPKG_DT_MEDIUMINT_NAME;
    case types.GPKGDataType.GPKG_DT_INT:
      return types.GPKG_DT_INT_NAME;
    case types.GPKGDataType.GPKG_DT_INTEGER:
      return types.GPKG_DT_INTEGER_NAME;
    case types.GPKGDataType.GPKG_DT_FLOAT:
      return types.GPKG_DT_FLOAT_NAME;
    case types.GPKGDataType.GPKG_DT_DOUBLE:
      return types.GPKG_DT_DOUBLE_NAME;
    case types.GPKGDataType.GPKG_DT_REAL:
      return types.GPKG_DT_REAL_NAME;
    case types.GPKGDataType.GPKG_DT_TEXT:
      return types.GPKG_DT_TEXT_NAME;
    case types.GPKGDataType.GPKG_DT_BLOB:
      return types.GPKG_DT_BLOB_NAME;
    case types.GPKGDataType.GPKG_DT_DATE:
      return types.GPKG_DT_DATE_NAME;
    case types.GPKGDataType.GPKG_DT_DATETIME:
      return types.GPKG_DT_DATETIME_NAME;
    case types.GPKGDataType.GPKG_DT_GEOMETRY:
      return types.GPKG_DT_GEOMETRY_NAME;
  }
}

/**
 * Return the data type enum value for the given name, ignoring case.
 *
 * @param  {String} name the name of the data type enum
 * @return {module:db/dataTypes~GPKGDataType} the enum value
 */
types.fromName = function(name) {
  var value = 9;
  if (name) {
    name = name.toUpperCase();
    value = types.GPKGDataType[name];
  }
  return value;
}

export default types
