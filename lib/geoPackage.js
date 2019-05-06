
/**
 * @module geoPackage
 */

import {SpatialReferenceSystemDao} from './core/srs'
import {GeometryColumnsDao} from './features/columns'
import FeatureDao from './features/user/featureDao'
import FeatureTableReader from './features/user/featureTableReader'
import {ContentsDao} from './core/contents'
import {Contents} from './core/contents'
import {TileMatrixSetDao, TileMatrixSet} from './tiles/matrixset'
import {TileMatrixDao, TileMatrix} from './tiles/matrix'
import TileTableReader from './tiles/user/tileTableReader'
import TileDao from './tiles/user/tileDao'
import TileTable from './tiles/user/tileTable'
import TileBoundingBoxUtils from './tiles/tileBoundingBoxUtils'
import TableCreator from './db/tableCreator'
import UserTable from './user/userTable'
import FeatureTable from './features/user/featureTable'
import {DataColumnsDao} from './dataColumns'
import {DataColumnConstraintsDao} from './dataColumnConstraints'
import {MetadataDao} from './metadata'
import {MetadataReferenceDao} from './metadata/reference'
import {ExtensionDao} from './extension'
import {CrsWktExtension} from './extension/crsWkt'
import {SchemaExtension} from './extension/schema'
import RelatedTablesExtension from './extension/relatedTables'
import {TableIndexDao} from './extension/index/tableIndex'
import {GeometryIndexDao} from './extension/index/geometryIndex'
import {ExtendedRelationDao} from './extension/relatedTables/extendedRelation'
import {ContentsIdDao} from './extension/contents/contentsId'
import AttributeTable from './attributes/attributeTable'
import AttributeTableReader from './attributes/attributeTableReader'
import AttributeDao from './attributes/attributeDao'
import DataTypes from './db/dataTypes'

import proj4 from 'proj4'

import defs from './proj4Defs'
for (var name in defs) {
  if (defs[name]) {
    proj4.defs(name, defs[name]);
  }
}

/**
 * A `GeoPackage` instance is the interface to a physical GeoPackage SQLite
 * database.
 * @param {string} name
 * @param {string} path
 * @param {module:db/geoPackageConnection~GeoPackageConnection} connection
 * @class
 */
class GeoPackage {
  constructor(name, path, connection) {
    this.name = name;
    this.path = path;
    this.connection = connection;
    this.tableCreator = new TableCreator(this);
  }
  close() {
    this.connection.close();
  }
  getDatabase() {
    return this.connection;
  }
  getPath() {
    return this.path;
  }
  export() {
    return this.connection.export();
  }
  /**
   * Get the GeoPackage name
   * @return {String} the GeoPackage name
   */
  getName() {
    return this.name;
  }
  /**
   * @returns {module:core/srs~SpatialReferenceSystemDao} the DAO to access the [SRS table]{@link module:core/srs~SpatialReferenceSystem} in this `GeoPackage`
   */
  getSpatialReferenceSystemDao() {
    return this.spatialReferenceSystemDao || (this.spatialReferenceSystemDao = new SpatialReferenceSystemDao(this));
  }
  /**
   * @returns {module:core/contents~ContentsDao} the DAO to access the [contents table]{@link module:core/contents~Contents} in this `GeoPackage`
   */
  getContentsDao() {
    return this.contentsDao || (this.contentsDao = new ContentsDao(this));
  }
  /**
   * @returns {module:tiles/matrixset~TileMatrixSetDao} the DAO to access the [tile matrix set]{@link module:tiles/matrixset~TileMatrixSet} in this `GeoPackage`
   */
  getTileMatrixSetDao() {
    return this.tileMatrixSetDao || (this.tileMatrixSetDao = new TileMatrixSetDao(this));
  }
  /**
   * @returns {module:tiles/matrixset~TileMatrixDao} the DAO to access the [tile matrix]{@link module:tiles/matrixset~TileMatrix} in this `GeoPackage`
   */
  getTileMatrixDao() {
    return this.tileMatrixDao || (this.tileMatrixDao = new TileMatrixDao(this));
  }
  getDataColumnsDao() {
    return this.dataColumnsDao || (this.dataColumnsDao = new DataColumnsDao(this));
  }
  getExtensionDao() {
    return this.extensionDao || (this.extensionDao = new ExtensionDao(this));
  }
  getTableIndexDao() {
    return this.tableIndexDao || (this.tableIndexDao = new TableIndexDao(this));
  }
  getGeometryColumnsDao() {
    return this.geometryColumnsDao || (this.geometryColumnsDao = new GeometryColumnsDao(this));
  }
  getDataColumnConstraintsDao() {
    return this.dataColumnConstraintsDao || (this.dataColumnConstraintsDao = new DataColumnConstraintsDao(this));
  }
  getMetadataReferenceDao() {
    return this.metadataReferenceDao || (this.metadataReferenceDao = new MetadataReferenceDao(this));
  }
  getMetadataDao() {
    return this.metadataDao || (this.metadataDao = new MetadataDao(this));
  }
  getExtendedRelationDao() {
    return this.extendedRelationDao || (this.extendedRelationDao = new ExtendedRelationDao(this));
  }
  getGeometryIndexDao(featureDao) {
    return new GeometryIndexDao(this, featureDao);
  }
  getRelatedTablesExtension() {
    return this.relatedTablesExtension || (this.relatedTablesExtension = new RelatedTablesExtension(this));
  }
  /**
   * @returns {module:extension/contents~ContentsIdDao} the DAO to access the [contentsId table]{@link extension/contents~ContentsIdDao} in this `GeoPackage`
   */
  getContentsIdDao() {
    return this.contentsIdDao || (this.contentsIdDao = new ContentsIdDao(this));
  }
  getSrs(srsId) {
    var dao = this.getSpatialReferenceSystemDao();
    return dao.queryForId(srsId);
  }
  createRequiredTables() {
    var geopackage = this;
    return this.tableCreator.createRequired()
      .then(function (results) {
        return geopackage;
      });
  }
  createSupportedExtensions() {
    var crs = new CrsWktExtension(this);
    crs.getOrCreateExtension();
    var schema = new SchemaExtension(this);
    schema.getOrCreateExtension();
    return this;
  }
  /**
   * @returns {module:tiles/user/tileDao~TileDao} the `TileDao` to access [tiles]{@link module:tiles/user/tileTable}
   */
  getTileDaoWithTileMatrixSet(tileMatrixSet) {
    var tileMatrices = [];
    var tileMatrixDao = this.getTileMatrixDao();
    var results = tileMatrixDao.queryForAllEq(TileMatrixDao.COLUMN_TABLE_NAME, tileMatrixSet.table_name, null, null, TileMatrixDao.COLUMN_ZOOM_LEVEL + ' ASC, ' + TileMatrixDao.COLUMN_PIXEL_X_SIZE + ' DESC, ' + TileMatrixDao.COLUMN_PIXEL_Y_SIZE + ' DESC');
    results.forEach(function (result) {
      var tm = new TileMatrix();
      tileMatrixDao.populateObjectFromResult(tm, result);
      tileMatrices.push(tm);
    });
    var tableReader = new TileTableReader(tileMatrixSet);
    var tileTable = tableReader.readTileTable(this);
    return new TileDao(this, tileTable, tileMatrixSet, tileMatrices);
  }
  getTileDaoWithContents(contents) {
    var dao = this.getContentsDao();
    var tileMatrixSet = dao.getTileMatrixSet(contents);
    return this.getTileDaoWithTileMatrixSet(tileMatrixSet);
  }
  getTileDao(tableName) {
    var tms = this.getTileMatrixSetDao();
    var results = tms.queryForAllEq(TileMatrixSetDao.COLUMN_TABLE_NAME, tableName);
    if (results.length > 1) {
      throw new Error('Unexpected state. More than one Tile Matrix Set matched for table name: ' + tableName + ', count: ' + results.length);
    }
    else if (results.length === 0) {
      throw new Error('No Tile Matrix found for table name: ' + tableName);
    }
    var tileMatrixSet = new TileMatrixSet();
    tms.populateObjectFromResult(tileMatrixSet, results[0]);
    return this.getTileDaoWithTileMatrixSet(tileMatrixSet);
  }
  /**
   * Return a hash containing arrays of table names grouped under keys `features`,
   * `tiles`, and `attributes`.
   * @return {{features: string[], tiles: string[], attributes: string[]}}
   */
  getTables() {
    var tables = {};
    var featureTables = this.getFeatureTables();
    tables.features = featureTables;
    var tileTables = this.getTileTables();
    tables.tiles = tileTables;
    var attributesTables = this.getAttributesTables();
    tables.attributes = attributesTables;
    return tables;
  }
  getAttributesTables() {
    return this.getContentsDao().getTables(ContentsDao.GPKG_CDT_ATTRIBUTES_NAME);
  }
  hasAttributeTable(attributeTableName) {
    var tables = this.getAttributesTables();
    return tables && tables.indexOf(attributeTableName) != -1;
  }
  /**
   * @returns {string[]} table names from {@link module:tiles/matrixset~TileMatrixSetDao#getTileTables}
   */
  getTileTables() {
    var tms = this.getTileMatrixSetDao();
    if (!tms.isTableExists()) {
      return [];
    }
    return tms.getTileTables();
  }
  /**
   * Check if a table with the given name exists in this GeoPackage, and is a
   * [tile table]{@link module:tiles/user/tileTable~TileTable}.
   *
   * @param {String} tileTableName name of the tile table
   * @returns {boolean} `true` if the table exists and is a tile table, `false` otherwise
   */
  hasTileTable(tileTableName) {
    var tables = this.getTileTables();
    return tables && tables.indexOf(tileTableName) != -1;
  }
  /**
   * Checks if a table with the given name exists in this GeoPackage, and is a
   * [feature table]{@link module:features/user/featureTable~FeatureTable}.
   *
   * @param {String} featureTableName name of the feature table
   * @returns {boolean} `true` if the table exists and is a feature table, `false` otherwise
   */
  hasFeatureTable(featureTableName) {
    var tables = this.getFeatureTables();
    return tables && tables.indexOf(featureTableName) != -1;
  }
  /**
   * @returns {string[]} feature table names from {@link module:features/columns~GeometryColumnsDao#getFeatureTables}
   */
  getFeatureTables() {
    var gcd = this.getGeometryColumnsDao();
    if (!gcd.isTableExists()) {
      return [];
    }
    return gcd.getFeatureTables();
  }
  isContentsTable(tableName) {
    return !!this.contentsOfTable(tableName);
  }
  contentsOfTable(tableName) {
    return this.getContentsDao().queryForId(tableName);
  }
  /**
   * @returns {boolean} `true` if this GeoPackage has a table with the given name, `false` otherwise
   */
  isTable(tableName) {
    return !!this.connection.tableExists(tableName);
  }
  /**
   * @param {string} type a table [data type]{@link module:core/contents~Contents#data_type} name
   * @param {string} tableName [table name]{@link module:core/contents~Contents#table_name}
   * @return {boolean} `true` if the given table name has a row in the [contents]{@link module:core/contents~Contents} table AND is the given {@link #getTableType}, `false` otherwise
   */
  isTableType(type, tableName) {
    return type === this.getTableType(tableName);
  }
  /**
   * @param {string} tableName [table name]{@link module:core/contents~Contents#table_name}
   * @return {string} the [data type]{@link module:core/contents~Contents#data_type}
   * of the table with the given name
   */
  getTableType(tableName) {
    var contents = this.getTableContents(tableName);
    if (contents) {
      return contents.data_type;
    }
  }
  /**
   * @param {string} tableName [table name]{@link module:core/contents~Contents#table_name}
   * @return {module:core/contents~Contents} the contents information for the given table name
   */
  getTableContents(tableName) {
    return this.getContentsDao().queryForId(tableName);
  }
  /**
   * Drop the table with the given name from this GeoPackage.  This simply drops
   * the table and does not take any steps to ensure referential integrity by
   * deleting associated rows in other tables.
   *
   * @param {string} tableName the name of the table to drop
   * @returns {boolean} result from {@link module:db/geoPackageConnection~GeoPackageConnection#dropTable}
   */
  deleteTable(tableName) {
    return this.connection.dropTable(tableName);
  }
  getTableCreator() {
    return this.tableCreator;
  }
  async index() {
    var tables = this.getFeatureTables();
    for (const table of tables) {
      let indexed = await this.indexFeatureTable(table)
      if (!indexed) {
        throw new Error('Unable to index table ' + table);
      }
    }
    return true
  }
  async indexFeatureTable(table, progress) {
    var featureDao = this.getFeatureDao(table);
    var fti = featureDao.featureTableIndex;

    var tableIndex = fti.getTableIndex();
    if (tableIndex) {
      return true
    }
    return await fti.index(progress);
  }
  /**
   *  Get a Feature DAO from Geometry Columns
   *
   *  @param {GeometryColumns} geometryColumns Geometry Columns
   *  @param {callback} callback called with an error if one occurred and the {FeatureDao}
   */
  getFeatureDaoWithGeometryColumns(geometryColumns) {
    if (!geometryColumns) {
      throw new Error('Non null Geometry Columns is required to create Feature DAO');
    }
    var tableReader = new FeatureTableReader(geometryColumns);
    var featureTable = tableReader.readFeatureTable(this);
    var dao = new FeatureDao(this, featureTable, geometryColumns, this.metadataDb);
    return dao;
  }
  /**
   * Get a Feature DAO from Contents
   * @param  {Contents}   contents Contents
   * @param  {Function} callback callback called with an error if one occurred and the {FeatureDao}
   */
  getFeatureDaoWithContents(contents) {
    var dao = this.getContentsDao();
    var columns = dao.getGeometryColumns(contents);
    return this.getFeatureDaoWithGeometryColumns(columns);
  }
  /**
   * Get a Feature DAO from Contents
   * @param  {string}   tableName table name
   * @param  {Function} callback callback called with an error if one occurred and the {FeatureDao}
   */
  getFeatureDao(tableName) {
    var dao = this.getGeometryColumnsDao();
    var geometryColumns = dao.queryForTableName(tableName);
    if (!geometryColumns) {
      throw new Error('No Feature Table exists for table name: ' + tableName);
    }
    return this.getFeatureDaoWithGeometryColumns(geometryColumns);
  }
  /**
   * Queries for GeoJSON features in a feature table
   * @param  {String}   tableName   Table name to query
   * @param  {BoundingBox}   boundingBox BoundingBox to query
   * @param  {Function} callback    Caled with err, featureArray
   */
  queryForGeoJSONFeaturesInTable(tableName, boundingBox) {
    var featureDao = this.getFeatureDao(tableName);
    var features = [];
    var iterator = featureDao.queryForGeoJSONIndexedFeaturesWithBoundingBox(boundingBox);
    for (var feature of iterator) {
      features.push(feature);
    }
    return features;
  }
  /**
   * iterates GeoJSON features in a feature table within a bounding box
   * @param  {String}   tableName   Table name to query
   * @param  {BoundingBox}   boundingBox BoundingBox to query
   * @param  {Function} rowCallback    Caled with err, geoJSON
   * @param  {Function} doneCallback    Caled with err if one occurred
   */
  iterateGeoJSONFeaturesInTableWithinBoundingBox(tableName, boundingBox) {
    var featureDao = this.getFeatureDao(tableName);
    return featureDao.queryForGeoJSONIndexedFeaturesWithBoundingBox(boundingBox);
  }
  /**
   * Create the Geometry Columns table if it does not already exist
   * @returns {Boolean} created status
   */
  async createGeometryColumnsTable() {
    var dao = this.getGeometryColumnsDao();
    if (dao.isTableExists()) {
      return true
    }
    return this.tableCreator.createGeometryColumns();
  }
  /**
   * Get a Attribute DAO
   * @param  {string}   tableName table name
   * @param  {Function} callback callback called with an error if one occurred and the {AttributeDao}
   */
  getAttributeDaoWithTableName(tableName) {
    var dao = this.getContentsDao();
    var contents = dao.queryForId(tableName);
    return this.getAttributeDaoWithContents(contents);
  }
  /**
   * Get a Attribute DAO
   * @param  {Contents}   contents Contents
   * @param  {Function} callback callback called with an error if one occurred and the {AttributeDao}
   */
  getAttributeDaoWithContents(contents) {
    if (!contents) {
      throw new Error('Non null Contents is required to create an Attributes DAO');
    }
    var reader = new AttributeTableReader(contents.table_name);
    var table = reader.readTable(this.connection);
    table.setContents(contents);
    return new AttributeDao(this, table);
  }
  async createAttributeTable(tableName, columns, dataColumns) {
    var attributeTable = new AttributeTable(tableName, columns);
    var result = this.tableCreator.createUserTable(attributeTable);
    var contents = new Contents();
    contents.table_name = tableName;
    contents.data_type = ContentsDao.GPKG_CDT_ATTRIBUTES_NAME;
    contents.identifier = tableName;
    contents.last_change = new Date().toISOString();
    await this.getContentsDao().create(contents);
    if (dataColumns) {
      await this.createDataColumns()
      var dataColumnsDao = this.getDataColumnsDao();
      dataColumns.forEach(function (dataColumn) {
        dataColumnsDao.create(dataColumn);
      });
    }
    return true
  }
  /**
   * Create the given {@link module:features/user/featureTable~FeatureTable}
   * @param  {FeatureTable}   featureTable    feature table
   */
  createFeatureTable(featureTable) {
    return this.tableCreator.createUserTable(featureTable);
  }
  createFeatureTableWithGeometryColumns(geometryColumns, boundingBox, srsId, columns) {
    return this.createFeatureTableWithGeometryColumnsAndDataColumns(geometryColumns, boundingBox, srsId, columns, undefined);
  }
  async createFeatureTableWithGeometryColumnsAndDataColumns(geometryColumns, boundingBox, srsId, columns, dataColumns) {
    await this.createGeometryColumnsTable()
    var featureTable = new FeatureTable(geometryColumns.table_name, columns);
    var result = this.createFeatureTable(featureTable);
    var contents = new Contents();
    contents.table_name = geometryColumns.table_name;
    contents.data_type = ContentsDao.GPKG_CDT_FEATURES_NAME;
    contents.identifier = geometryColumns.table_name;
    contents.last_change = new Date().toISOString();
    contents.min_x = boundingBox.minLongitude;
    contents.min_y = boundingBox.minLatitude;
    contents.max_x = boundingBox.maxLongitude;
    contents.max_y = boundingBox.maxLatitude;
    contents.srs_id = srsId;
    this.getContentsDao().create(contents);
    geometryColumns.srs_id = srsId;
    this.getGeometryColumnsDao().create(geometryColumns);
    if (dataColumns) {
      await this.createDataColumns()
      var dataColumnsDao = this.getDataColumnsDao();
      dataColumns.forEach(function (dataColumn) {
        dataColumnsDao.create(dataColumn);
      });
    }
    return true;
  }
  /**
   * Create the Tile Matrix Set table if it does not already exist
   * @param  {Function} callback called with an error if one occurred otherwise the table now exists
   */
  async createTileMatrixSetTable() {
    var dao = this.getTileMatrixSetDao();
    if (dao.isTableExists()) {
      return true;
    }
    return this.tableCreator.createTileMatrixSet();
  }
  /**
   * Create the Tile Matrix table if it does not already exist
   * @param  {Function} callback called with an error if one occurred otherwise the table now exists
   */
  async createTileMatrixTable() {
    var dao = this.getTileMatrixDao();
    if (dao.isTableExists()) {
      return true;
    }
    return this.tableCreator.createTileMatrix();
  }
  /**
   * Create the given tile table in this GeoPackage.
   *
   * @param  {module:tiles/user/tileTable~TileTable} tileTable
   * @returns {@link module:db/tableCreator~TableCreator#createUserTable}
   */
  createTileTable(tileTable) {
    return this.tableCreator.createUserTable(tileTable);
  }
  /**
   * Create a new [tile table]{@link module:tiles/user/tileTable~TileTable} in this GeoPackage.
   *
   * @param {String} tableName tile table name
   * @param {BoundingBox} contentsBoundingBox bounding box of the contents table
   * @param {Number} contentsSrsId srs id of the contents table
   * @param {BoundingBox} tileMatrixSetBoundingBox bounding box of the matrix set
   * @param {Number} tileMatrixSetSrsId srs id of the matrix set
   * @returns {Promise<module:tiles/matrixset~TileMatrixSet>} `Promise` of the created {@link module:tiles/matrixset~TileMatrixSet}
   */
  async createTileTableWithTableName(tableName, contentsBoundingBox, contentsSrsId, tileMatrixSetBoundingBox, tileMatrixSetSrsId) {
    const columns = TileTable.createRequiredColumns();
    const tileTable = new TileTable(tableName, columns);
    const contents = new Contents();
    contents.table_name = tableName;
    contents.data_type = ContentsDao.GPKG_CDT_TILES_NAME;
    contents.identifier = tableName;
    contents.last_change = new Date().toISOString();
    contents.min_x = contentsBoundingBox.minLongitude;
    contents.min_y = contentsBoundingBox.minLatitude;
    contents.max_x = contentsBoundingBox.maxLongitude;
    contents.max_y = contentsBoundingBox.maxLatitude;
    contents.srs_id = contentsSrsId;
    const tileMatrixSet = new TileMatrixSet();
    tileMatrixSet.setContents(contents);
    tileMatrixSet.srs_id = tileMatrixSetSrsId;
    tileMatrixSet.min_x = tileMatrixSetBoundingBox.minLongitude;
    tileMatrixSet.min_y = tileMatrixSetBoundingBox.minLatitude;
    tileMatrixSet.max_x = tileMatrixSetBoundingBox.maxLongitude;
    tileMatrixSet.max_y = tileMatrixSetBoundingBox.maxLatitude;
    await this.createTileMatrixSetTable()
    await this.createTileMatrixTable();
    this.createTileTable(tileTable);
    this.getContentsDao().create(contents);
    this.getTileMatrixSetDao().create(tileMatrixSet);
    return tileMatrixSet;
  }
  /**
   * Create the tables and rows necessary to store tiles in a {@link module:tiles/matrixset~TileMatrixSet}.
   * This will create a [tile matrix row]{@link module:tiles/matrix~TileMatrix}
   * for every integral zoom level in the range `[minZoom..maxZoom]`.
   *
   * @param {BoundingBox} epsg3857TileBoundingBox
   * @param {module:tiles/matrixset~TileMatrixSet} tileMatrixSet
   * @param {number} minZoom
   * @param {number} maxZoom
   * @param {number} [tileSize=256] optional tile size in pixels
   * @returns {module:geoPackage~GeoPackage} `this` `GeoPackage`
   */
  createStandardWebMercatorTileMatrix(epsg3857TileBoundingBox, tileMatrixSet, minZoom, maxZoom, tileSize) {
    tileSize = tileSize || 256;
    var tileMatrixDao = this.getTileMatrixDao();
    for (var zoom = minZoom; zoom <= maxZoom; zoom++) {
      var box = TileBoundingBoxUtils.webMercatorTileBox(epsg3857TileBoundingBox, zoom);
      var matrixWidth = (box.maxX - box.minX) + 1;
      var matrixHeight = (box.maxY - box.minY) + 1;
      var pixelXSize = ((epsg3857TileBoundingBox.maxLongitude - epsg3857TileBoundingBox.minLongitude) / matrixWidth) / tileSize;
      var pixelYSize = ((epsg3857TileBoundingBox.maxLatitude - epsg3857TileBoundingBox.minLatitude) / matrixHeight) / tileSize;
      var tileMatrix = new TileMatrix();
      tileMatrix.table_name = tileMatrixSet.table_name;
      tileMatrix.zoom_level = zoom;
      tileMatrix.matrix_width = matrixWidth;
      tileMatrix.matrix_height = matrixHeight;
      tileMatrix.tile_width = tileSize;
      tileMatrix.tile_height = tileSize;
      tileMatrix.pixel_x_size = pixelXSize;
      tileMatrix.pixel_y_size = pixelYSize;
      tileMatrixDao.create(tileMatrix);
    }
    return this;
  }
  /**
   * Adds a tile to the GeoPackage
   * @param  {object}   tile       Byte array or Buffer containing the tile bytes
   * @param  {String}   tableName  Table name to add the tile to
   * @param  {Number}   zoom       zoom level of this tile
   * @param  {Number}   tileRow    row of this tile
   * @param  {Number}   tileColumn column of this tile
   */
  addTile(tileStream, tableName, zoom, tileRow, tileColumn) {
    var tileDao = this.getTileDao(tableName);
    var newRow = tileDao.newRow();
    newRow.setZoomLevel(zoom);
    newRow.setTileColumn(tileColumn);
    newRow.setTileRow(tileRow);
    newRow.setTileData(tileStream);
    return tileDao.create(newRow);
  }
  /**
   * Create the Data Columns table if it does not already exist
   * @param  {Function} callback called with an error if one occurred otherwise the table now exists
   */
  async createDataColumns() {
    var dao = this.getDataColumnsDao();
    if (dao.isTableExists()) {
      return true;
    }
    return this.tableCreator.createDataColumns();
  }
  /**
   * Create the Data Column Constraints table if it does not already exist
   * @param  {Function} callback called with an error if one occurred otherwise the table now exists
   */
  async createDataColumnConstraintsTable() {
    var dao = this.getDataColumnConstraintsDao();
    if (dao.isTableExists()) {
      return true;
    }
    return this.tableCreator.createDataColumnConstraints();
  }
  async createMetadataTable() {
    var dao = this.getMetadataDao();
    if (dao.isTableExists()) {
      return true;
    }
    return this.tableCreator.createMetadata();
  }
  async createMetadataReferenceTable() {
    var dao = this.getMetadataReferenceDao();
    if (dao.isTableExists()) {
      return true;
    }
    return this.tableCreator.createMetadataReference();
  }
  async createExtensionTable() {
    var dao = this.getExtensionDao();
    if (dao.isTableExists()) {
      return true;
    }
    return this.tableCreator.createExtensions();
  }
  async createTableIndexTable() {
    var dao = this.getTableIndexDao();
    if (dao.isTableExists()) {
      return true;
    }
    return this.tableCreator.createTableIndex();
  }
  async createGeometryIndexTable() {
    var dao = this.getGeometryIndexDao();
    if (dao.isTableExists()) {
      return true;
    }
    return this.tableCreator.createGeometryIndex();
  }
  /**
   * Get the application id of the GeoPackage
   * @param  {Function} callback callback called with the application id
   */
  getApplicationId() {
    var connection = this.getDatabase();
    return connection.getApplicationId();
  }
  getInfoForTable(tableDao) {
    var info = {};
    info.tableName = tableDao.table_name;
    info.tableType = tableDao.table.getTableType();
    info.count = tableDao.getCount();
    if (info.tableType === UserTable.FEATURE_TABLE) {
      info.geometryColumns = {};
      info.geometryColumns.tableName = tableDao.geometryColumns.table_name;
      info.geometryColumns.geometryColumn = tableDao.geometryColumns.column_name;
      info.geometryColumns.geometryTypeName = tableDao.geometryColumns.geometry_type_name;
      info.geometryColumns.z = tableDao.geometryColumns.z;
      info.geometryColumns.m = tableDao.geometryColumns.m;
    }
    if (info.tableType === UserTable.TILE_TABLE) {
      info.minZoom = tableDao.minZoom;
      info.maxZoom = tableDao.maxZoom;
      info.minWebMapZoom = tableDao.minWebMapZoom;
      info.maxWebMapZoom = tableDao.maxWebMapZoom;
      info.zoomLevels = tableDao.tileMatrices.length;
    }
    var dao;
    var contentsRetriever;
    if (info.tableType === UserTable.FEATURE_TABLE) {
      dao = this.getGeometryColumnsDao();
      contentsRetriever = tableDao.geometryColumns;
    }
    else if (info.tableType === UserTable.TILE_TABLE) {
      dao = this.getTileMatrixSetDao();
      contentsRetriever = tableDao.tileMatrixSet;
      info.tileMatrixSet = {};
      info.tileMatrixSet.srsId = tableDao.tileMatrixSet.srs_id;
      info.tileMatrixSet.minX = tableDao.tileMatrixSet.min_x;
      info.tileMatrixSet.maxX = tableDao.tileMatrixSet.max_x;
      info.tileMatrixSet.minY = tableDao.tileMatrixSet.min_y;
      info.tileMatrixSet.maxY = tableDao.tileMatrixSet.max_y;
    }
    var contents = dao.getContents(contentsRetriever);
    info.contents = {};
    info.contents.tableName = contents.table_name;
    info.contents.dataType = contents.data_type;
    info.contents.identifier = contents.identifier;
    info.contents.description = contents.description;
    info.contents.lastChange = contents.last_change;
    info.contents.minX = contents.min_x;
    info.contents.maxX = contents.max_x;
    info.contents.minY = contents.min_y;
    info.contents.maxY = contents.max_y;
    var contentsDao = this.getContentsDao();
    var contentsSrs = contentsDao.getSrs(contents);
    info.contents.srs = {
      name: contentsSrs.srs_name,
      id: contentsSrs.srs_id,
      organization: contentsSrs.organization,
      organization_coordsys_id: contentsSrs.organization_coordsys_id,
      definition: contentsSrs.definition,
      description: contentsSrs.description
    };
    var srs = tableDao.getSrs();
    info.srs = {
      name: srs.srs_name,
      id: srs.srs_id,
      organization: srs.organization,
      organization_coordsys_id: srs.organization_coordsys_id,
      definition: srs.definition,
      description: srs.description
    };
    info.columns = [];
    info.columnMap = {};
    var dcd = this.getDataColumnsDao();
    tableDao.table.columns.forEach(function (column) {
      var dataColumn = dcd.getDataColumns(tableDao.table.table_name, column.name);
      info.columns.push({
        index: column.index,
        name: column.name,
        max: column.max,
        min: column.min,
        notNull: column.notNull,
        primaryKey: column.primaryKey,
        dataType: column.dataType ? DataTypes.name(column.dataType) : '',
        displayName: dataColumn && dataColumn.name ? dataColumn.name : column.name,
        dataColumn: dataColumn
      });
      info.columnMap[column.name] = info.columns[info.columns.length - 1];
    }.bind(this));
    return info;
  }
  static loadProjections(items) {
    if (!(items instanceof Array))
      throw new Error('Invalid array of projections');
    for (var i = 0; i < items.length; i++) {
      if (!defs[items[i]])
        throw new Error('Projection not found');
      this.addProjection(items[i], defs[items[i]]);
    }
  }
  static addProjection(name, definition) {
    if (!name || !definition)
      throw new Error('Invalid projection name/definition');
    proj4.defs('' + name, '' + definition);
  }
  static hasProjection(name) {
    return proj4.defs('' + name);
  }
}

export default GeoPackage
