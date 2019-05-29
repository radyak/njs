var expect = require('chai').expect
var AppContext = require('../../src/AppContext')

describe('AppContext - Configuration', function () {
  

  beforeEach(() => {
    AppContext.clear()
    AppContext.configure()
  })



  it('should configure useGlobals', function (done) {
    
    AppContext.configure({
        useGlobals: true
    })

    Component('arandomdependency', 17)

    done()

  })

  it('should throw error when using globals without useGlobals property', function (done) {

    try {
        Component('anotherrandomdependency', 18)
        done('Should have thrown error')
    } catch (e) {
        expect(e.toString()).to.equal('ReferenceError: Component is not defined')
        done()
    }

  })

})
