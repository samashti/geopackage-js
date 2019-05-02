/**
 * featureDao module.
 * @module features/user/featureDao
 */

import UserDao from '../../user/userDao'
import {DataColumnsDao} from '../../dataColumns'
import FeatureRow from './featureRow'
import DataTypes from '../../db/dataTypes'
import FeatureTableIndex from '../../extension/index/featureTableIndex'
import BoundingBox from '../../boundingBox'

import reproject from 'reproject'
import LineIntersect from '@turf/line-intersect'
import Intersect from '@turf/intersect'
import BooleanWithin from '@turf/boolean-within'

/**
 * Feature DAO for reading feature user data tables
 * @class FeatureDao
 * @extends {module:user/userDao~UserDao}
 * @param  {sqlite3} db              database connection
 * @param  {FeatureTable} table           feature table
 * @param  {GeometryColumns} geometryColumns geometry columns
 * @param  {MetadataDb} metadataDb      metadata db
 */
class FeatureDao extends UserDao {
  constructor(geoPackage, table, geometryColumns, metadataDb) {
    super(geoPackage, table);
    this.geometryColumns = geometryColumns;
    this.metadataDb = metadataDb;
    this.dataColumnsDao = new DataColumnsDao(geoPackage);
    this.featureTableIndex = new FeatureTableIndex(geoPackage, this);
    var dao = geoPackage.getGeometryColumnsDao();
    if (!dao.getContents(geometryColumns)) {
      throw new Error('Geometry Columns ' + dao.getId(geometryColumns) + ' has null Contents');
    }
    if (!dao.getSrs(geometryColumns)) {
      throw new Error('Geometry Columns ' + dao.getId(geometryColumns) + ' has null Spatial Reference System');
    }
    this.projection = dao.getProjection(geometryColumns);
  }
  createObject(results) {
    if (results) {
      return this.getRow(results);
    }
    return this.newRow();
  }
  getContents() {
    var dao = this.geoPackage.getGeometryColumnsDao();
    return dao.getContents(this.geometryColumns);
  }
  /**
   * Get the feature table
   * @return {FeatureTable} the feature table
   */
  getFeatureTable() {
    return this.table;
  }
  /**
   * Create a new feature row with the column types and values
   * @param  {Array} columnTypes column types
   * @param  {Array} values      values
   * @return {FeatureRow}             feature row
   */
  newRowWithColumnTypes(columnTypes, values) {
    return new FeatureRow(this.getFeatureTable(), columnTypes, values);
  }
  /**
   * Create a new feature row
   * @return {FeatureRow} feature row
   */
  newRow() {
    return new FeatureRow(this.getFeatureTable());
  }
  /**
   * Get the geometry column name
   * @return {string} the geometry column name
   */
  getGeometryColumnName() {
    return this.geometryColumns.column_name;
  }
  /**
   * Get the geometry types
   * @return {WKBGeometryType} well known binary geometry type
   */
  getGeometryType() {
    return this.geometryColumns.getGeometryType();
  }
  getSrs() {
    return this.geoPackage.getGeometryColumnsDao().getSrs(this.geometryColumns);
  }
  /**
   * Determine if the feature table is indexed
   * @param  {Function} callback called with err if one occurred and true or false indicating the indexed status
   */
  isIndexed() {
    return this.featureTableIndex.isIndexed();
  }
  fastQueryWebMercatorBoundingBox(boundingBox, featureRowCallback) {
    var srs = this.getSrs();
    var iterator = this.featureTableIndex.queryWithBoundingBox(boundingBox, 'EPSG:3857');
    var thisgetRow = this.getRow.bind(this);
    return {
      [Symbol.iterator]() {
        return this;
      },
      next: function () {
        var nextRow = iterator.next();
        if (!nextRow.done) {
          var featureRow = thisgetRow(nextRow.value);
          return {
            value: featureRow,
            done: false
          };
        }
        else {
          return {
            done: true
          };
        }
      }
    };
  }
  queryIndexedFeaturesWithWebMercatorBoundingBox(boundingBox) {
    var srs = this.getSrs();
    var projection = this.projection;
    var iterator = this.featureTableIndex.queryWithBoundingBox(boundingBox, 'EPSG:3857');
    var thisgetRow = this.getRow.bind(this);
    var projectedBoundingBox = boundingBox.projectBoundingBox('EPSG:3857', 'EPSG:4326');
    return {
      [Symbol.iterator]() {
        return this;
      },
      next: function () {
        var nextRow = iterator.next();
        if (!nextRow.done) {
          var featureRow;
          var geometry;
          while (!nextRow.done && !geometry) {
            featureRow = thisgetRow(nextRow.value);
            geometry = reprojectFeature(featureRow, srs, projection);
            geometry = verifyFeature(geometry, projectedBoundingBox);
            if (geometry) {
              geometry.properties = featureRow.values;
              return {
                value: featureRow,
                done: false
              };
            }
            else {
              nextRow = iterator.next();
            }
          }
        }
        return {
          done: true
        };
      }
    };
  }
  /**
   * Calls geoJSONFeatureCallback with the geoJSON of each matched feature (always in 4326 projection)
   * @param  {BoundingBox} boundingBox        4326 bounding box to query
   * @param  {function} geoJSONFeatureCallback called with err, geoJSON, doneCallback
   * @param  {function} doneCallback       called when all rows have been returned
   */
  queryForGeoJSONIndexedFeaturesWithBoundingBox(boundingBox, skipVerification) {
    var columns = [];
    var columnMap = {};
    var srs = this.getSrs();
    var projection = this.projection;
    this.table.columns.forEach(function (column) {
      var dataColumn = this.dataColumnsDao.getDataColumns(this.table.table_name, column.name);
      columns.push({
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
      columnMap[column.name] = columns[columns.length - 1];
    }.bind(this));
    var verifiedCount = 0;
    var iterator = this.featureTableIndex.queryWithBoundingBox(boundingBox, 'EPSG:4326')[Symbol.iterator]();
    var thisgetRow = this.getRow.bind(this);
    return {
      [Symbol.iterator]() {
        return this;
      },
      next: function () {
        var nextRow = iterator.next();
        if (!nextRow.done) {
          var featureRow;
          var geometry;
          while (!nextRow.done && !geometry) {
            featureRow = thisgetRow(nextRow.value);
            geometry = reprojectFeature(featureRow, srs, projection);
            if (!skipVerification) {
              geometry = verifyFeature(geometry, boundingBox);
            }
            if (geometry) {
              var geoJson = {
                properties: {},
                geometry: geometry
              };
              for (var key in featureRow.values) {
                if (featureRow.values.hasOwnProperty(key) && key != featureRow.getGeometryColumn().name && key != 'id') {
                  if (key.toLowerCase() == '_feature_id') {
                    geoJson.id = featureRow.values[key];
                  }
                  else if (key.toLowerCase() == '_properties_id') {
                    geoJson.properties[key.substring(12)] = featureRow.values[key];
                  }
                  else {
                    geoJson.properties[columnMap[key].displayName] = featureRow.values[key];
                  }
                }
              }
              geoJson.id = geoJson.id || featureRow.getId();
              return {
                value: geoJson,
                done: false
              };
            }
            else {
              nextRow = iterator.next();
            }
          }
        }
        return {
          done: true
        };
      }.bind(this)
    };
  }
  queryIndexedFeaturesWithBoundingBox(boundingBox) {
    var srs = this.getSrs();
    var projection = this.projection;
    var iterator = this.featureTableIndex.queryWithBoundingBox(boundingBox, 'EPSG:4326');
    var thisgetRow = this.getRow.bind(this);
    return {
      [Symbol.iterator]() {
        return this;
      },
      next: function () {
        var nextRow = iterator.next();
        if (!nextRow.done) {
          var featureRow;
          var geometry;
          while (!nextRow.done && !geometry) {
            featureRow = thisgetRow(nextRow.value);
            geometry = reprojectFeature(featureRow, srs, projection);
            geometry = verifyFeature(geometry, boundingBox);
            if (geometry) {
              geometry.properties = featureRow.values;
              return {
                value: featureRow,
                done: false
              };
            }
            else {
              nextRow = iterator.next();
            }
          }
        }
        return {
          done: true
        };
      }.bind(this)
    };
  }
  getBoundingBox() {
    var contents = this.getContents();
    return new BoundingBox(contents.min_x, contents.max_x, contents.min_y, contents.max_y);
  }
}

function reprojectFeature(featureRow, srs, projection) {
  var geometry = featureRow.getGeometry().toGeoJSON();
  if (srs.organization + ':' + srs.organization_coordsys_id != 'EPSG:4326') {
    geometry = reproject.reproject(geometry, projection, 'EPSG:4326');
  }
  return geometry;
}

function verifyFeature(geometry, boundingBox) {
  try {
    if (geometry.type == 'Point') {
      return geometry;
    } else if (geometry.type == 'LineString') {
      var intersect = LineIntersect(geometry, boundingBox.toGeoJSON().geometry);
      if (intersect.features.length) {
        return geometry;
      } else if (BooleanWithin(geometry, boundingBox.toGeoJSON().geometry)) {
        return geometry;
      }
    } else if (geometry.type == 'MultiLineString') {
      for (var i = 0; i < geometry.coordinates.length; i++) {
        var intersect = LineIntersect({
            type: 'LineString',
            coordinates: geometry.coordinates[i]
          }, boundingBox.toGeoJSON().geometry);
        if (intersect.features.length) {
          return geometry;
        } else if (BooleanWithin({
            type: 'LineString',
            coordinates: geometry.coordinates[i]
          }, boundingBox.toGeoJSON().geometry)) {
          return geometry;
        }
      }
    } else if (geometry.type == 'Polygon') {
      var polyIntersect = Intersect(geometry, boundingBox.toGeoJSON().geometry);
      if (polyIntersect) {
        return geometry;
      } else if (BooleanWithin(geometry, boundingBox.toGeoJSON().geometry)) {
        return geometry;
      }
    } else if (geometry.type == 'MultiPolygon') {
      var polyIntersect = Intersect({
          type: 'Polygon',
          coordinates: geometry.coordinates[i]
        }, boundingBox.toGeoJSON().geometry);
      if (polyIntersect) {
        return geometry;
      } else if (BooleanWithin({
          type: 'Polygon',
          coordinates: geometry.coordinates[i]
        }, boundingBox.toGeoJSON().geometry)) {
        return geometry;
      }
    }
  } catch (e) {}
}

export default FeatureDao
