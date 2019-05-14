var UserColumn = require('../../../lib/user/userColumn').default
  , DataTypes = require('../../../lib/db/dataTypes').default
  , should = require('chai').should();

describe('UserColumn tests', function() {

  it('should create a column with a max which is a text column', () => {
    try {
      let uc = new UserColumn(0, 'name', DataTypes.GPKGDataType.GPKG_DT_TEXT, 2)
      should.exist(uc)
    } catch (e) {
      false.should.be.equal(true)
    }
  })

  it('should create a column with a max which is a blob column', () => {
    try {
      let uc = new UserColumn(0, 'name', DataTypes.GPKGDataType.GPKG_DT_BLOB, 2)
      should.exist(uc)
    } catch (e) {
      false.should.be.equal(true)
    }
  })

  it('should not create a column with a max which is not a blob or text', () => {
    try {
      let uc = new UserColumn(0, 'name', DataTypes.GPKGDataType.GPKG_DT_DATE, 2)
      false.should.be.equal(true)
    } catch (e) {
      e.message.should.be.equal('Column max is only supported for TEXT and BLOB columns. column: name, max: 2, type: DATE')
    }
  })

})