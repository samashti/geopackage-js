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

var SQLiteAdapter = {}

/**
 * Returns a Promise which, when resolved, returns a {module:db/sqliteAdapter~Adapter} which has connected to the GeoPackage database file
 * @param  {string|Buffer} [filePath] string path to an existing file or a path to where a new file will be created or a Buffer containing the contents of the file, if undefined, an in memory database is created
 * @return {Promise<module:db/sqliteAdapter~Adapter>}
 */
SQLiteAdapter.createAdapter = function(filePath) {
  return new Promise(function(resolve, reject) {
    var Database = require('better-sqlite3');
    try {
      if (!filePath) {
        console.log('create in memory');
        const db = new Database("memory", {
          memory: !filePath
        });
        const adapter = new Adapter(db);
        adapter.filePath = filePath;
        return resolve(adapter);
      }
      if (typeof filePath === 'string') {
        if (filePath.indexOf('http') === 0) {
          http.get(filePath, function(response) {
            if (response.statusCode !== 200) {
              return reject(new Error('Unable to reach url: ' + filePath));
            }
            const tmpPath = path.join(os.tmpDir(), Date.now() + '.gpkg');
            const writeStream = fs.createWriteStream(tmpPath);
            response.pipe(writeStream);
            writeStream.on('close', function() {
              try {
                const db = new Database(tmpPath);
                // verify that this is an actual database
                db.pragma('application_id');
                db.pragma('journal_mode = WAL');
                const adapter = new Adapter(db);
                adapter.filePath = tmpPath;
                return resolve(adapter);
              } catch (err) {
                console.log('error', err);
                return reject(err);
              }
            });
          });
        } else {
          const db = new Database(filePath);
          const adapter = new Adapter(db);
          adapter.filePath = filePath;
          return resolve(adapter);
        }
      } else {
        // write this byte array to a file then open it
        const byteArray = filePath;
        const tmpPath = path.join(os.tmpDir(), Date.now() + '.gpkg');
        return fs.writeFile(tmpPath, byteArray, function(err) {
          if (err) {
            console.log('error writing GeoPackage temp file at ' + tmpPath, err);
            return reject(err);
          }
          const db = new Database(tmpPath);
          // verify that this is an actual database
          try {
            db.pragma('application_id');
            db.pragma('journal_mode = WAL');
          } catch (err) {
            console.log('error', err);
            return reject(err);
          }
          const adapter = new Adapter(db);
          adapter.filePath = tmpPath;
          return resolve(adapter);
        });
      }
    } catch (err) {
      console.log('Error opening database', err);
      return reject(err);
    }
  });
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
function Adapter(db) {
  this.db = db;
}

/**
 * Closes the connection to the GeoPackage
 */
Adapter.prototype.close = function() {
  this.db.close();
}

/**
 * Get the connection to the database file
 * @return {better-sqlite3.Database}
 */
Adapter.prototype.getDBConnection = function () {
  return this.db;
};

/**
 * Returns a Buffer containing the contents of the database as a file
 * @param  {Function} callback called when export is complete
 */
Adapter.prototype.export = function(callback) {
  fs.readFile(this.filePath, callback);
}

/**
 * Registers the given function so that it can be used by SQL statements
 * @see {@link https://github.com/JoshuaWise/better-sqlite3/wiki/API#registeroptions-function---this|better-sqlite3 register}
 * @param  {string} name               name of function to register
 * @param  {Function} functionDefinition function to register
 * @return {module:db/sqliteAdapter~Adapter} this
 */
Adapter.prototype.registerFunction = function(name, functionDefinition) {
  this.db.register({name: name}, functionDefinition);
  return this;
}

/**
 * Gets one row of results from the statement
 * @see {@link https://github.com/JoshuaWise/better-sqlite3/wiki/API#getbindparameters---row|better-sqlite3 get}
 * @param  {string} sql    statement to run
 * @param  {Array|Object} [params] bind parameters
 * @return {Object}
 */
Adapter.prototype.get = function (sql, params) {
  var statement = this.db.prepare(sql);
  if (params) {
    return statement.get(params);
  } else {
    return statement.get();
  }
};

/**
 * Gets all results from the statement in an array
 * @see {@link https://github.com/JoshuaWise/better-sqlite3/wiki/API#allbindparameters---array-of-rows|better-sqlite3 all}
 * @param  {string} sql    statement to run
 * @param  {Array|Object} [params] bind parameters
 * @return {Object[]}
 */
Adapter.prototype.all = function (sql, params) {
  var statement = this.db.prepare(sql);
  if (params) {
    return statement.all(params);
  } else {
    return statement.all();
  }
};

/**
 * Returns an `Iterable` with results from the query
 * @see {@link https://github.com/JoshuaWise/better-sqlite3/wiki/API#iteratebindparameters---iterator|better-sqlite3 iterate}
 * @param  {string} sql    statement to run
 * @param  {Object|Array} [params] bind parameters
 * @return {Iterable<Object>}
 */
Adapter.prototype.each = function (sql, params) {
  var statement = this.db.prepare(sql);
  if (params) {
    return statement.iterate(params);
  } else {
    return statement.iterate();
  }
};

/**
 * Run the given statement, returning information about what changed.
 *
 * @see {@link https://github.com/JoshuaWise/better-sqlite3/wiki/API#runbindparameters---object|better-sqlite3}
 * @param  {string} sql    statement to run
 * @param  {Object|Array} [params] bind parameters
 * @return {@module:db/adapter~DBWriteResult}
 */
Adapter.prototype.run = function(sql, params) {
  var statement = this.db.prepare(sql);
  if (params) {
    return statement.run(params);
  } else {
    return statement.run();
  }
}

/**
 * Runs the specified insert statement and returns the last inserted id or undefined if no insert happened
 * @param  {string} sql    statement to run
 * @param  {Object|Array} [params] bind parameters
 * @return {module:db/adapter~ROWID} last inserted `ROWID`
 */
Adapter.prototype.insert = function(sql, params) {
  var statement = this.db.prepare(sql);
  return statement.run(params).lastInsertROWID;
};

/**
 * Runs the specified delete statement and returns the number of deleted rows
 * @param {string} sql statement to run
 * @param {Object|Array} params bind parameters
 * @return {number} count of deleted rows
 */
Adapter.prototype.delete = function(sql, params) {
  return this.run(sql, params).changes;
};

/**
 * Drops the table
 * @param  {string} table table name
 * @return {Boolean} indicates if the table was dropped
 */
Adapter.prototype.dropTable = function(table) {
  try {
    var statement = this.db.prepare('DROP TABLE IF EXISTS "' + table + '"');
    var result = statement.run();
    var vacuum = this.db.prepare('VACUUM');
    vacuum.run();
    return result.changes == 0;
  } catch (e) {
    console.log('Drop Table Error', e);
    return false;
  }
};

/**
 * Counts rows that match the query
 * @param  {string} tableName table name from which to count
 * @param  {string} [where]     where clause
 * @param  {Object|Array} [whereArgs] where args
 * @return {Number} count
 */
Adapter.prototype.count = function (tableName, where, whereArgs) {
  var sql = 'SELECT COUNT(*) as count FROM "' + tableName + '"';
  if (where) {
    sql += ' where ' + where;
  }
  var statement = this.db.prepare(sql);
  if (whereArgs) {
    return statement.get(whereArgs).count;
  } else {
    return statement.get().count;
  }
};
