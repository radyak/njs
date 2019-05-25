var expect = require('chai').expect
var AppContext = require('../../src/AppContext')

describe('AppContext - Provider', function () {

  
  beforeEach(() => {
    AppContext.clear()
  })


  it('should throw error on non-function provider', function (done) {

    try {
      AppContext.provider('dep', {property: 1})
      done('Should have thrown error')
    } catch (e) {
      expect(e.toString()).to.equal('Error: Argument [object Object] is not a function')
      done()
    }

  })

  it('should provide dependencies asyncronously and recursively', function (done) {

    let obj = {property: 1}
    AppContext.register('secondaryDep', obj)
    AppContext.provider('dep', (secondaryDep) => {
      return {
        secondaryDep: secondaryDep,
        property: 13
      }
    })

    AppContext.dep.then(dep => {
      expect(dep).to.deep.equal({
        secondaryDep: {property: 1},
        property: 13
      })
      done()
    })
  })

})
