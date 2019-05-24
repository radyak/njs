var expect = require('chai').expect
var AppContext = require('../../src/AppContext')

describe('AppContext - Profiles', function () {
  
  beforeEach(() => {
    AppContext.unregister('dep')
  })


  /*
    To Test:
      * default profile (implicit & explicit)
      * existing other profile
      * [Error] non-existing other profile
      * [Error] non-string profile
      * multiple profiles
        * as array
        * as varargs
        * 
      * Configure profile through
        * .profiles() method
        * Env variable
        * Combinations of the above
  */

  it('should use profile "default" by default', function () {

    AppContext.register('dep', {property: 1}, 'default')
    AppContext.register('dep', {property: 2}, 'test')

    expect(AppContext.dep).to.deep.equal({property: 1})
  })


  it('should ignore unset profiles', function () {

    AppContext.profiles('test')

    AppContext.register('dep', {property: 1}, 'default')
    AppContext.register('dep', {property: 2}, 'test')

    expect(AppContext.dep).to.deep.equal({property: 2})
  })


  it('should throw error if no profile is matching', function (done) {
    
    AppContext.profiles('anothertest')

    AppContext.register('dep', {property: 1}, 'test1')
    AppContext.register('dep', {property: 2}, 'test1')

    try {
      AppContext.dep
      done('Should have thrown error due to unregistered component')
    } catch (e) {
      expect(e.toString()).to.equal("Error: No component with name 'dep' / key 'dep' present in AppContext")
      done()
    }

  })


  it('should apply multiple profiles (varargs style)', function () {
    
    AppContext.profiles('relevantProfile')

    AppContext.register('dep', {property: 1}, 'thisProfile')
    AppContext.register('dep', {property: 2}, 'relevantProfile')
    AppContext.register('dep', {property: 3}, 'thatProfile')

    expect(AppContext.dep).to.deep.equal({property: 2})

  })


  it('should apply multiple profiles (array style)', function () {
    
    AppContext.profiles(['someProfile', 'relevantProfile', 'anotherProfile'])

    AppContext.register('dep', {property: 1}, 'thisProfile')
    AppContext.register('dep', {property: 2}, 'relevantProfile')
    AppContext.register('dep', {property: 3}, 'thatProfile')

    expect(AppContext.dep).to.deep.equal({property: 2})

  })


  it('should apply latest valid profile', function () {
    
    AppContext.profiles(['someProfile', 'relevantProfile', 'anotherRelevantProfile', 'anotherProfile'])

    AppContext.register('dep', {property: 1}, 'thisProfile')
    AppContext.register('dep', {property: 2}, 'relevantProfile')
    AppContext.register('dep', {property: 3}, 'anotherRelevantProfile')
    AppContext.register('dep', {property: 4}, 'thatProfile')

    expect(AppContext.dep).to.deep.equal({property: 3})

  })

})
