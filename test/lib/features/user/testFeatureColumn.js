var FeatureColumn = require('../../../../lib/features/user/featureColumn').default
  , DataTypes = require('../../../../lib/db/dataTypes').default
  , wkx = require('wkx')
  , should = require('chai').should();

describe('FeatureColumn tests', function() {

  it('should create a column with a geometry type and a data type of Geometry', () => {
    try {
      let uc = new FeatureColumn(0, 'name', DataTypes.GPKGDataType.GPKG_DT_GEOMETRY, undefined, false, '', false, wkx.wkt.Point)
      should.exist(uc)
    } catch (e) {
      false.should.be.equal(true)
    }
  })

  it('should fail to create a column with no geometry type but specified as a geometry column', () => {
    try {
      let uc = new FeatureColumn(0, 'name', DataTypes.GPKGDataType.GPKG_DT_GEOMETRY, undefined, false, '', false)
      false.should.be.equal(true)
    } catch (e) {
      e.message.should.be.equal('Data or Geometry Type is required to create column: name')
    }
  })

})