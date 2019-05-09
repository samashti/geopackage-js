import turfBbox from '@turf/bbox';
import * as wkx from 'wkx'

var EnvelopeBuilder = {}

EnvelopeBuilder.buildEnvelopeWithGeometry = function(wkbGeometry) {
  var geoJson = wkbGeometry.toGeoJSON();
  var bbox = turfBbox(geoJson);
  var envelope = {
    minX: bbox[0],
    minY: bbox[1],
    maxX: bbox[2],
    maxY: bbox[3]
  };
  wkbGeometry
  if (wkbGeometry.hasZ) {
    envelope.minZ = Number.MAX_VALUE
    envelope.maxZ = Number.MIN_VALUE
  }
  if (wkbGeometry.hasM) {
    envelope.minM = Number.MAX_VALUE
    envelope.maxM = Number.MIN_VALUE
  }
  envelope.hasM = wkbGeometry.hasM
  envelope.hasZ = wkbGeometry.hasZ
  if (wkbGeometry.hasZ || wkbGeometry.hasM) {
    zmEnvelope(wkbGeometry, envelope, wkbGeometry.hasZ, wkbGeometry.hasM)
  }
  return envelope;
}

function zmEnvelope(geom, envelope, hasZ, hasM) {
  if (geom instanceof wkx.Point) {
    if (hasZ) {
      envelope.minZ = Math.min(envelope.minZ, geom.z)
      envelope.maxZ = Math.max(envelope.maxZ, geom.z)
    }
    if (hasM) {
      envelope.minM = Math.min(envelope.minM, geom.m)
      envelope.maxM = Math.max(envelope.maxM, geom.m)
    }
  }
  if (geom instanceof wkx.LineString) {
    for (const point of geom.points) {
      if (hasZ) {
        envelope.minZ = Math.min(envelope.minZ, point.z)
        envelope.maxZ = Math.max(envelope.maxZ, point.z)
      }
      if (hasM) {
        envelope.minM = Math.min(envelope.minM, point.m)
        envelope.maxM = Math.max(envelope.maxM, point.m)
      }
    }
  }
  if (geom instanceof wkx.Polygon) {
    for (const eRingPoint of geom.exteriorRing) {
      zmEnvelope(eRingPoint, envelope, hasZ, hasM)
    }
    for (const interiorRing of geom.interiorRings) {
      for (const ringPoint of interiorRing) {
        zmEnvelope(ringPoint, envelope, hasZ, hasM)
      }
    }
  }
  if (geom instanceof wkx.GeometryCollection) {
    for (const geometry of geom.geometries) {
      zmEnvelope(geometry, envelope, hasZ, hasM)
    }
  }
  if (geom instanceof wkx.MultiPoint) {
    for (const point of geom.points) {
      zmEnvelope(point, envelope, hasZ, hasM)
    }
  }
  if (geom instanceof wkx.MultiLineString) {
    for (const lineString of geom.lineStrings) {
      zmEnvelope(lineString, envelope, hasZ, hasM)
    }
  }
  if (geom instanceof wkx.MultiPolygon) {
    for (const polygon of geom.polygons) {
      zmEnvelope(polygon, envelope, hasZ, hasM)
    }
  }

  return envelope;
}

export default EnvelopeBuilder
