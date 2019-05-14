/**
 * This adapter uses [better-sqlite3](https://github.com/JoshuaWise/better-sqlite3)
 * to interact with a SQLite database.  The module exports an implementation of
 * [`DBAdapterFactory`]{@link module:db/adapter~DBAdapterFactory}.
 *
 * @module db/sqliteAdapter
 * @implements {module:db/adapter~DBAdapterFactory}
 */

import fs from 'fs'
import path from 'path'
import http from 'http'
import os from 'os'
import Database from 'better-sqlite3'

var SQLiteAdapter = {}

function loadFromUrl(url, tmpPath) {
  return new Promise(function(resolve, reject) {
    http.get(url, function(response) {
      if (response.statusCode !== 200) {
        return reject(new Error('Unable to reach url: ' + url));
      }
      const writeStream = fs.createWriteStream(tmpPath);
      response.pipe(writeStream);
      writeStream.on('close', function() {
        try {
          const db = new Database(tmpPath);
          // verify that this is an actual database
          db.pragma('application_id');
          db.pragma('journal_mode = WAL');
          resolve(db)
        } catch (err) {
          console.log('error opening from url', err);
          return reject(err);
        }
      })
    })
  })
}

/**
 * Returns a Promise which, when resolved, returns a {module:db/sqliteAdapter~Adapter} which has connected to the GeoPackage database file
 * @param  {string|Buffer} [filePath] string path to an existing file or a path to where a new file will be created or a Buffer containing the contents of the file, if undefined, an in memory database is created
 * @return {Promise<module:db/sqliteAdapter~Adapter>}
 */
SQLiteAdapter.createAdapter = async function(filePath) {
  if (!filePath) {
    console.log('create in memory');
    const db = new Database("memory", {
      memory: !filePath
    });
    const adapter = new Adapter(db);
    adapter.filePath = filePath;
    return adapter
  }

  if (typeof filePath === 'string') {
    if (filePath.indexOf('http') === 0) {
      const tmpPath = path.join(os.tmpDir(), Date.now() + '.gpkg');
      const db = await loadFromUrl(filePath, tmpPath)

      const adapter = new Adapter(db);
      adapter.filePath = tmpPath;
      return adapter

    } else {
      const db = new Database(filePath);
      const adapter = new Adapter(db);
      adapter.filePath = filePath;
      return adapter;
    }
  } else {
    // write this byte array to a file then open it
    const byteArray = filePath;
    const tmpPath = path.join(os.tmpDir(), Date.now() + '.gpkg');
    fs.writeFileSync(tmpPath, byteArray);

    const db = new Database(tmpPath);
    // verify that this is an actual database
    try {
      db.pragma('application_id');
      db.pragma('journal_mode = WAL');
    } catch (err) {
      console.log('error', err);
      throw new Error('File is not a valid SQLite Database')
    }
    const adapter = new Adapter(db);
    adapter.filePath = tmpPath;
    return adapter;
  }
}
/**
 * Creates an adapter from an already established better-sqlite3 database connection
 * @param  {better-sqlite3.Database} db better-sqlite3 database connection
 * @return {module:db/sqliteAdapter~Adapter}
 */
SQLiteAdapter.createAdapterFromDb = function(db) {
  return new Adapter(db);
}

export default SQLiteAdapter

/**
 * Class which adapts generic GeoPackage queries to better-sqlite3 queries
 * @class Adapter
 * @param {better-sqlite3.Database} db better-sqlite3 database connection
 */
class Adapter {
  constructor(db) {
    this.db = db;
  }
  /**
   * Closes the connection to the GeoPackage
   */
  close() {
    this.db.close();
  }
  /**
   * Get the connection to the database file
   * @return {better-sqlite3.Database}
   */
  getDBConnection() {
    return this.db;
  }
  /**
   * Returns a Buffer containing the contents of the database as a file
   * @param  {Function} callback called when export is complete
   */
  export() {
    return fs.readFileSync(this.filePath)
  }
  /**
   * Registers the given function so that it can be used by SQL statements
   * @see {@link https://github.com/JoshuaWise/better-sqlite3/wiki/API#registeroptions-function---this|better-sqlite3 register}
   * @param  {string} name               name of function to register
   * @param  {Function} functionDefinition function to register
   * @return {module:db/sqliteAdapter~Adapter} this
   */
  registerFunction(name, functionDefinition) {
    this.db.function(name, functionDefinition);
    return this;
  }
  /**
   * Gets one row of results from the statement
   * @see {@link https://github.com/JoshuaWise/better-sqlite3/wiki/API#getbindparameters---row|better-sqlite3 get}
   * @param  {string} sql    statement to run
   * @param  {Array|Object} [params] bind parameters
   * @return {Object}
   */
  get(sql, params) {
    var statement = this.db.prepare(sql);
    if (params) {
      return statement.get(params);
    }
    else {
      return statement.get();
    }
  }
  /**
   * Gets all results from the statement in an array
   * @see {@link https://github.com/JoshuaWise/better-sqlite3/wiki/API#allbindparameters---array-of-rows|better-sqlite3 all}
   * @param  {string} sql    statement to run
   * @param  {Array|Object} [params] bind parameters
   * @return {Object[]}
   */
  all(sql, params) {
    var statement = this.db.prepare(sql);
    if (params) {
      return statement.all(params);
    }
    else {
      return statement.all();
    }
  }
  /**
   * Returns an `Iterable` with results from the query
   * @see {@link https://github.com/JoshuaWise/better-sqlite3/wiki/API#iteratebindparameters---iterator|better-sqlite3 iterate}
   * @param  {string} sql    statement to run
   * @param  {Object|Array} [params] bind parameters
   * @return {Iterable<Object>}
   */
  each(sql, params) {
    var statement = this.db.prepare(sql);
    if (params) {
      return statement.iterate(params);
    }
    else {
      return statement.iterate();
    }
  }
  /**
   * Run the given statement, returning information about what changed.
   *
   * @see {@link https://github.com/JoshuaWise/better-sqlite3/wiki/API#runbindparameters---object|better-sqlite3}
   * @param  {string} sql    statement to run
   * @param  {Object|Array} [params] bind parameters
   * @return {@module:db/adapter~DBWriteResult}
   */
  run(sql, params) {
    var statement = this.db.prepare(sql);
    if (params) {
      return statement.run(params);
    }
    else {
      return statement.run();
    }
  }
  /**
   * Runs the specified insert statement and returns the last inserted id or undefined if no insert happened
   * @param  {string} sql    statement to run
   * @param  {Object|Array} [params] bind parameters
   * @return {module:db/adapter~ROWID} last inserted `ROWID`
   */
  insert(sql, params) {
    var statement = this.db.prepare(sql);
    return statement.run(params).lastInsertRowid;
  }
  /**
   * Runs the specified delete statement and returns the number of deleted rows
   * @param {string} sql statement to run
   * @param {Object|Array} params bind parameters
   * @return {number} count of deleted rows
   */
  delete(sql, params) {
    return this.run(sql, params).changes;
  }
  /**
   * Drops the table
   * @param  {string} table table name
   * @return {Boolean} indicates if the table was dropped
   */
  dropTable(table) {
    try {
      var statement = this.db.prepare('DROP TABLE IF EXISTS "' + table + '"');
      var result = statement.run();
      var vacuum = this.db.prepare('VACUUM');
      vacuum.run();
      return result.changes == 0;
    }
    catch (e) {
      console.log('Drop Table Error', e);
      return false;
    }
  }
  /**
   * Counts rows that match the query
   * @param  {string} tableName table name from which to count
   * @param  {string} [where]     where clause
   * @param  {Object|Array} [whereArgs] where args
   * @return {Number} count
   */
  count(tableName, where, whereArgs) {
    var sql = 'SELECT COUNT(*) as count FROM "' + tableName + '"';
    if (where) {
      sql += ' where ' + where;
    }
    var statement = this.db.prepare(sql);
    if (whereArgs) {
      return statement.get(whereArgs).count;
    }
    else {
      return statement.get().count;
    }
  }
}
