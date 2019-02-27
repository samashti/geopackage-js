/**
 * This module contains the interfaces for interacting with different SQLite
 * drivers implementations.
 *
 * @module db/adapter
 */

/**
 * A SQLite driver implements the `DBAdapterFactory` interface to create
 * its implementation of {@link module:db/adapter~DBAdapter}.
 *
 * @interface
 */
class DBAdapterFactory {

  /**
   * Return a `Promise` that resolves with an [adapter]{@link module:db/adapter~DbAdapter} which has connected to the GeoPackage database file.
   *
   * @param  {string|Buffer} [filePath] string path to an existing file or a path to where a new file will be created or a Buffer containing the contents of the file, if undefined, an in memory database is created
   * @return {Promise<module:db/adapter~DBAdapter>}
   */
  createAdapter(filePath) { }

  /**
   * Create an adapter from the given existing database connection.
   *
   * @param  {object} db an implementation-dependent database connection
   * @return {module:db/adapter~DBAdapter}
   */
  createAdapterFromDb(db) { }
}

/**
* An implementation of the `DBAdapter` interface is a database driver's
* connection to perform operations on a SQLite database.
*
* @interface
*/
class DBAdapter {

  /**
   * Close the connection to the GeoPackage database.
   */
  close() { }

  /**
   * Get the underlying object representing the connection to the database.
   *
   * @return {*} an implementation-dependent connection object
   */
  getDBConnection () { }

  /**
   * Asynchronously export the database of this adapter as a `Uint8Array`.
   *
   * @param {module:db/adapter~DBExportCallback} callback called when export is complete
   */
  export(callback) { }

  /**
   * Register the given function so that it can be used by SQL statements.
   *
   * @param  {string} name name of function to register
   * @param  {Function} functionDefinition function to register
   * @return {module:db/adapter~DbAdapter} this
   */
  registerFunction(name, functionDefinition) { }

  /**
   * Run the given SQL query and return a single result.
   *
   * @param  {string} sql statement to run
   * @param  {Array|Object} [params] substitution parameters
   * @return {Object}
   */
  get(sql, params) { }

  /**
   * Run the given SQL query and return an array containing all the results.
   *
   * @param  {string} sql statement to run
   * @param  {Array|Object} [params] bind parameters
   * @return {object[]}
   */
  all(sql, params) { }

  /**
   * Run the given SQL query and return an `Iterable` of the results.
   *
   * @param  {string} sql statement to run
   * @param  {Object|Array} params bind parameters
   * @return {Iterable<Object>}
   */
  each(sql, params) { };

  /**
   * Run the given SQL statement and return information about what changed.
   *
   * @param  {string} sql statement to run
   * @param  {Object|Array} [params] bind parameters
   * @return {module:db/adapter~DBWriteResult}
   */
  run(sql, params) { }

  /**
   * Run the given `INSERT` statement and return the last inserted `ROWID`, or `undefined` if no insert happened.
   *
   * @param  {string} sql statement to run
   * @param  {Object|Array} [params] bind parameters
   * @return {module:db/adapter~ROWID} last inserted `ROWID`
   */
  insert(sql, params) { }

  /**
   * Run the given `DELETE` statement and returns the number of deleted rows
   * @param  {string} sql statement to run
   * @param  {Object|Array} [params] bind parameters
   * @return {number} count of deleted rows
   */
  delete(sql, params) { }

  /**
   * Drop the table with the given name.
   *
   * @param  {string} table table name
   * @return {Boolean} indicates if the table was dropped
   */
  dropTable(table) { }

  /**
   * Counts rows that match the given query.
   *
   * @param  {string} tableName table name from which to count
   * @param  {string} [where] where clause
   * @param  {Object|Array} [whereArgs] where args
   * @return {number} count of matching rows
   */
  count(tableName, where, whereArgs) { }
}

module.exports.DBAdapterFactory = DBAdapterFactory;
module.exports.DBAdapter = DBAdapter;

/**
 * The `ROWID` is a 64-bit integer [SQLite ROWID](https://www.sqlite.org/lang_createtable.html#rowid).
 * This is, for all practical client purposes, an opaque object.
 * @typedef {object} ROWID
 */

/**
 * `DBWriteResult` is an `Object` generated as the result of an `INSERT`,
 * `UPDATE`, or `DELETE` SQL statement.
 *
 * @typedef {object} DBWriteResult
 * @property {number} changes count of rows inserted/updated/deleted
 * @property {module:db/adapter~ROWID} lastInsertROWID the `ROWID` of the last new row inserted into the database; ignore if the SQL statement did not insert rows
 */

/**
 * @typedef {function(*, Unit8Array)} DBExportCallback
 * @param {*} err an error if one occurred, `undefined` or `null` otherwise
 * @param {Uint8Array} content the content of the database as a byte array
 */