/**
 * WKB module.
 * @module wkb
 */

import * as wkx from '../../vendor/wkx-esm/dist/wkx'

var wktToEnum = {};
wktToEnum[wkx.wkt.Point] = wkx.wkb.Point;
wktToEnum[wkx.wkt.LineString] = wkx.wkb.LineString;
wktToEnum[wkx.wkt.Polygon] = wkx.wkb.Polygon;
wktToEnum[wkx.wkt.MultiPoint] = wkx.wkb.MultiPoint;
wktToEnum[wkx.wkt.MultiLineString] = wkx.wkb.MultiLineString;
wktToEnum[wkx.wkt.MultiPolygon] = wkx.wkb.MultiPolygon;
wktToEnum[wkx.wkt.GeometryCollection] = wkx.wkb.GeometryCollection;


var wkb = {}
/**
 * number from name
 * @param  {string} name name
 * @return {Number}      number corresponding to the wkb name
 */
wkb.fromName = function(name) {
  name = name.toUpperCase();
  if (name === 'GEOMETRY') {
    return wkx.wkb.GeometryCollection;
  }
  return wktToEnum[name];
}

export default wkb
