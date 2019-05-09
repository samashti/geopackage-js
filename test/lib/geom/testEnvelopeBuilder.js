import EnvelopeBuilder from '../../../lib/geom/envelopeBuilder';

import * as wkx from 'wkx';
var should = require('chai').should();
var zmData = require('../../../vendor/wkx-esm/test/testdataZM.json')
var zData = require('../../../vendor/wkx-esm/test/testdataZ.json')
var mData = require('../../../vendor/wkx-esm/test/testdataM.json')
var xydata = require('../../../vendor/wkx-esm/test/testdata.json')

describe('Envelope Builder tests', function() {
  var shapeTests = []

  for (const data in zmData) {
    if (!data.startsWith('empty')) {
      shapeTests.push(zmData[data].wkt)
    }
  }
  for (const data in zData) {
    if (!data.startsWith('empty')) {
      shapeTests.push(zData[data].wkt)
    }
  }
  for (const data in mData) {
    if (!data.startsWith('empty')) {
      shapeTests.push(mData[data].wkt)
    }
  }
  for (const data in xydata) {
    if (!data.startsWith('empty')) {
      shapeTests.push(xydata[data].wkt)
    }
  }
  function parse(wkt) {
    var parsed = {
      minX: Number.MAX_VALUE,
      maxX: Number.MIN_VALUE,
      minY: Number.MAX_VALUE,
      maxY: Number.MIN_VALUE,
      minZ: Number.MAX_VALUE,
      maxZ: Number.MIN_VALUE,
      minM: Number.MAX_VALUE,
      maxM: Number.MIN_VALUE
    }
    var hasM = false
    var hasZ = false

    var matches = wkt.match(/(\((-?\d+.\d+\s?-?\d*.\d*,?)+\))+|(\((-?\d+.\d+,?)+\))/g)
    if (!matches) 
      return {
        "maxM": NaN,
        "maxX": -Infinity,
        "maxY": -Infinity,
        "maxZ": NaN,
        "minM": NaN,
        "minX": Infinity,
        "minY": Infinity,
        "minZ": NaN
      }
    for (var match of matches) {
      while(match.indexOf('(') === 0) {
        match = match.slice(1)
      }
      while(match.lastIndexOf(')') === match.length-1) {
        match = match.slice(0, -1)
      }
      var points = match.split(',')
      for (const point of points) {
        var components = point.split(' ')
        parsed.minX = Math.min(parsed.minX, Number(components[0]))
        parsed.maxX = Math.max(parsed.maxX, Number(components[0]))
        parsed.minY = Math.min(parsed.minY, Number(components[1]))
        parsed.maxY = Math.max(parsed.maxY, Number(components[1]))
        if (wkt.indexOf(' ZM ') !== -1) {
          parsed.hasM = true;
          parsed.hasZ = true;
          parsed.minZ = Math.min(parsed.minZ, Number(components[2]))
          parsed.maxZ = Math.max(parsed.maxZ, Number(components[2]))
          parsed.minM = Math.min(parsed.minM, Number(components[3]))
          parsed.maxM = Math.max(parsed.maxM, Number(components[3]))
        }
        else if (wkt.indexOf(' M ') !== -1) {
          parsed.hasM = true;
          parsed.hasZ = false;
          parsed.minM = Math.min(parsed.minM, Number(components[2]))
          parsed.maxM = Math.max(parsed.maxM, Number(components[2]))
        }
        else if (wkt.indexOf(' Z ') !== -1) {
          parsed.hasM = false;
          parsed.hasZ = true;
          parsed.minZ = Math.min(parsed.minZ, Number(components[2]))
          parsed.maxZ = Math.max(parsed.maxZ, Number(components[2]))
        } else {
          parsed.hasM = false;
          parsed.hasZ = false;
        }
      }
    }
    if (!parsed.hasZ) {
      delete parsed.minZ
      delete parsed.maxZ
    }
    if (!parsed.hasM) {
      delete parsed.minM
      delete parsed.maxM
    }
    return parsed;
  }

  it('should test all the shapes', () => {
    for (const shape of shapeTests) {
      console.log('Testing Shape', shape)
      const wkb = wkx.Geometry._parseWkt(shape);
      const envelope = EnvelopeBuilder.buildEnvelopeWithGeometry(wkb)
      const real = parse(shape)
      envelope.should.deep.equal(real)
    }
  });
})
