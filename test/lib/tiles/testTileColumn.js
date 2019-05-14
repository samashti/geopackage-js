const TileColumn = require('../../../lib/tiles/user/tileColumn').default

describe('TileColumn tests', function() {
  it('should not create a tile column with no data type', () => {
    try {
      new TileColumn(0, 'name')
      false.should.be.equal(true)
    } catch (e) {
      e.message.should.be.equal('Data Type is required to create column: name')
    }
  })
})