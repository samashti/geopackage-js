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
module.exports.GPKGDataType = {
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

module.exports.GPKG_DT_BOOLEAN_NAME = "BOOLEAN";
module.exports.GPKG_DT_TINYINT_NAME = "TINYINT";
module.exports.GPKG_DT_SMALLINT_NAME = "SMALLINT";
module.exports.GPKG_DT_MEDIUMINT_NAME = "MEDIUMINT";
module.exports.GPKG_DT_INT_NAME = "INT";
module.exports.GPKG_DT_INTEGER_NAME = "INTEGER";
module.exports.GPKG_DT_FLOAT_NAME = "FLOAT";
module.exports.GPKG_DT_DOUBLE_NAME = "DOUBLE";
module.exports.GPKG_DT_REAL_NAME = "REAL";
module.exports.GPKG_DT_TEXT_NAME = "TEXT";
module.exports.GPKG_DT_BLOB_NAME = "BLOB";
module.exports.GPKG_DT_DATE_NAME = "DATE";
module.exports.GPKG_DT_DATETIME_NAME = "DATETIME";
module.exports.GPKG_DT_GEOMETRY_NAME = "GEOMETRY";

module.exports.GPKGDataType[module.exports.GPKG_DT_BOOLEAN_NAME] = module.exports.GPKGDataType.GPKG_DT_BOOLEAN;
module.exports.GPKGDataType[module.exports.GPKG_DT_TINYINT_NAME] = module.exports.GPKGDataType.GPKG_DT_TINYINT;
module.exports.GPKGDataType[module.exports.GPKG_DT_SMALLINT_NAME] = module.exports.GPKGDataType.GPKG_DT_SMALLINT;
module.exports.GPKGDataType[module.exports.GPKG_DT_MEDIUMINT_NAME] = module.exports.GPKGDataType.GPKG_DT_MEDIUMINT;
module.exports.GPKGDataType[module.exports.GPKG_DT_INT_NAME] = module.exports.GPKGDataType.GPKG_DT_INT;
module.exports.GPKGDataType[module.exports.GPKG_DT_INTEGER_NAME] = module.exports.GPKGDataType.GPKG_DT_INTEGER;
module.exports.GPKGDataType[module.exports.GPKG_DT_FLOAT_NAME] = module.exports.GPKGDataType.GPKG_DT_FLOAT;
module.exports.GPKGDataType[module.exports.GPKG_DT_DOUBLE_NAME] = module.exports.GPKGDataType.GPKG_DT_DOUBLE;
module.exports.GPKGDataType[module.exports.GPKG_DT_REAL_NAME] = module.exports.GPKGDataType.GPKG_DT_REAL;
module.exports.GPKGDataType[module.exports.GPKG_DT_TEXT_NAME] = module.exports.GPKGDataType.GPKG_DT_TEXT;
module.exports.GPKGDataType[module.exports.GPKG_DT_BLOB_NAME] = module.exports.GPKGDataType.GPKG_DT_BLOB;
module.exports.GPKGDataType[module.exports.GPKG_DT_DATE_NAME] = module.exports.GPKGDataType.GPKG_DT_DATE;
module.exports.GPKGDataType[module.exports.GPKG_DT_DATETIME_NAME] = module.exports.GPKGDataType.GPKG_DT_DATETIME;
module.exports.GPKGDataType[module.exports.GPKG_DT_GEOMETRY_NAME] = module.exports.GPKGDataType.GPKG_DT_GEOMETRY;

/**
 * Return the name of the given data type.
 *
 * @param  {module:db/dataTypes~GPKGDataType} dataType the enum to retrieve the name for
 * @return {String} the string name of the given data type enum
 */
module.exports.name = function(dataType) {
  switch(dataType) {
    case module.exports.GPKGDataType.GPKG_DT_BOOLEAN:
      return module.exports.GPKG_DT_BOOLEAN_NAME;
    case module.exports.GPKGDataType.GPKG_DT_TINYINT:
      return module.exports.GPKG_DT_TINYINT_NAME;
    case module.exports.GPKGDataType.GPKG_DT_SMALLINT:
      return module.exports.GPKG_DT_SMALLINT_NAME;
    case module.exports.GPKGDataType.GPKG_DT_MEDIUMINT:
      return module.exports.GPKG_DT_MEDIUMINT_NAME;
    case module.exports.GPKGDataType.GPKG_DT_INT:
      return module.exports.GPKG_DT_INT_NAME;
    case module.exports.GPKGDataType.GPKG_DT_INTEGER:
      return module.exports.GPKG_DT_INTEGER_NAME;
    case module.exports.GPKGDataType.GPKG_DT_FLOAT:
      return module.exports.GPKG_DT_FLOAT_NAME;
    case module.exports.GPKGDataType.GPKG_DT_DOUBLE:
      return module.exports.GPKG_DT_DOUBLE_NAME;
    case module.exports.GPKGDataType.GPKG_DT_REAL:
      return module.exports.GPKG_DT_REAL_NAME;
    case module.exports.GPKGDataType.GPKG_DT_TEXT:
      return module.exports.GPKG_DT_TEXT_NAME;
    case module.exports.GPKGDataType.GPKG_DT_BLOB:
      return module.exports.GPKG_DT_BLOB_NAME;
    case module.exports.GPKGDataType.GPKG_DT_DATE:
      return module.exports.GPKG_DT_DATE_NAME;
    case module.exports.GPKGDataType.GPKG_DT_DATETIME:
      return module.exports.GPKG_DT_DATETIME_NAME;
    case module.exports.GPKGDataType.GPKG_DT_GEOMETRY:
      return module.exports.GPKG_DT_GEOMETRY_NAME;
  }
}

/**
 * Return the data type enum value for the given name, ignoring case.
 *
 * @param  {String} name the name of the data type enum
 * @return {module:db/dataTypes~GPKGDataType} the enum value
 */
module.exports.fromName = function(name) {
  var value = 9;
  if (name) {
    name = name.toUpperCase();
    value = module.exports.GPKGDataType[name];
  }
  return value;
}
