// #if IS_NOT_BROWSER
import NodeTileCreator from './node'
// #endif
// #if IS_BROWSER
import CanvasTileCreator from './canvas'
// #endif

var initialize = function(width, height, tileMatrix, tileMatrixSet, tileBoundingBox, srs, projectionTo, canvas) {
  var isElectron = !!(typeof navigator != 'undefined' && navigator.userAgent.toLowerCase().indexOf(' electron/') > -1);
  var isPhantom = !!(typeof window != 'undefined' && window.callPhantom && window._phantom);
  var isNode = typeof(process) !== 'undefined' && process.version;
  if (isNode && !isElectron && !isPhantom) {
    return new NodeTileCreator(width, height, tileMatrix, tileMatrixSet, tileBoundingBox, srs, projectionTo, canvas);
  } else {
    return new CanvasTileCreator(width, height, tileMatrix, tileMatrixSet, tileBoundingBox, srs, projectionTo, canvas);
  }
}

export {initialize as initialize}
