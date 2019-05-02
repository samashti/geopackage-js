import turfBbox from '@turf/bbox';

var EnvelopeBuilder = {}

EnvelopeBuilder.buildEnvelopeWithGeometry = function(wkbGeometry) {
  var geoJson = wkbGeometry.toGeoJSON();
  var bbox = turfBbox(geoJson);
  return {
    minX: bbox[0],
    minY: bbox[1],
    maxX: bbox[2],
    maxY: bbox[3]
  };
}

EnvelopeBuilder.expandEnvelopeForGeometry = function(envelope, wkbGeometry) {

}

export default EnvelopeBuilder
