var WKB = require('../../../lib/wkb').default;
var wkx = require('wkx');

describe('WKB tests', function() {

  it('should get a geometry collection from a GEOMETRY name', function() {
    var wkb = WKB.fromName('GEOMETRY');
    wkb.should.be.equal(wkx.wkb.GeometryCollection);
  });

  it('should get a point from a wkx.Types.wkt.Point name', function() {
    var wkb = WKB.fromName(wkx.wkt.Point);
    wkb.should.be.equal(wkx.wkb.Point);
  });

  it('should get a LineString from a wkx.Types.wkt.LineString name', function() {
    var wkb = WKB.fromName(wkx.wkt.LineString);
    wkb.should.be.equal(wkx.wkb.LineString);
  });

  it('should get a Polygon from a wkx.Types.wkt.Polygon name', function() {
    var wkb = WKB.fromName(wkx.wkt.Polygon);
    wkb.should.be.equal(wkx.wkb.Polygon);
  });

  it('should get a MultiPoint from a wkx.Types.wkt.MultiPoint name', function() {
    var wkb = WKB.fromName(wkx.wkt.MultiPoint);
    wkb.should.be.equal(wkx.wkb.MultiPoint);
  });

  it('should get a MultiLineString from a wkx.Types.wkt.MultiLineString name', function() {
    var wkb = WKB.fromName(wkx.wkt.MultiLineString);
    wkb.should.be.equal(wkx.wkb.MultiLineString);
  });

  it('should get a MultiPolygon from a wkx.Types.wkt.MultiPolygon name', function() {
    var wkb = WKB.fromName(wkx.wkt.MultiPolygon);
    wkb.should.be.equal(wkx.wkb.MultiPolygon);
  });

  it('should get a GeometryCollection from a wkx.Types.wkt.GeometryCollection name', function() {
    var wkb = WKB.fromName(wkx.wkt.GeometryCollection);
    wkb.should.be.equal(wkx.wkb.GeometryCollection);
  });
});
