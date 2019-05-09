import OptionBuilder from '../../lib/optionBuilder'

describe('Option Builder Tests', () => {
  it('should create an option builder', () => {
    var ob = OptionBuilder([
      'baseTableName'
    ]);
    ob.setBaseTableName('base name')
    ob.getBaseTableName().should.be.equal('base name')
  })
})