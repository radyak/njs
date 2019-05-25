var expect = require('chai').expect
var AppContext = require('../../src/AppContext')

describe('AppContext', function () {


  beforeEach(() => {
    AppContext.clear()
  })
  

  it('should throw an Error when registering components with invalid names', function (done) {
    var obj = { key: 'value' }
    try {
      AppContext.register(' ', obj)
      done('Should not have accepted white-space-only string as name')
    } catch (e) {
      done()
    }
  })

  it('should throw an Error when registering components with protected names', function (done) {
    var obj = { key: 'value' }
    try {
      AppContext.register('register', obj)
      done('Should not have accepted a protected name')
    } catch (e) {
      done()
    }
  })

  it('can register and get components', function () {
    var obj = { key: 'value' }
    AppContext.register('something', obj)
    var objFromContext = AppContext.something
    expect(objFromContext).to.deep.equal(obj)

    var sameObjFromContext = AppContext['something']
    expect(sameObjFromContext).to.deep.equal(obj)
  })

  it('can register and get primitives', function () {
    AppContext.register('someString', 'some string')
    AppContext.register('someNumber', 5.1)
    AppContext.register('someBoolean', true)

    expect(AppContext.someString).to.equal('some string')
    expect(AppContext.someNumber).to.equal(5.1)
    expect(AppContext.someBoolean).to.equal(true)
  })

  it('can register and get Promises', function (done) {
    AppContext.register('somePromise', new Promise((resolve, reject) => {
      setTimeout(() => resolve(3), 100)
    }))

    AppContext.somePromise.then(value => {
      expect(value).to.equal(3)
      done()
    })
  })

  it('can register and get Promise returning functions', function (done) {
    AppContext.register('somePromise', () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => resolve(5), 100)
      })
    })

    AppContext.somePromise.then(value => {
      expect(value).to.equal(5)
      done()
    })
  })

  it('should throw an Error when getting non-registered components', function (done) {
    var shouldNeverBeAssigned
    try {
      shouldNeverBeAssigned = AppContext.wrongName
      done('Should not have returned non-registered component')
    } catch (e) {
      expect(e.toString()).to.equal(
        "Error: No component with name 'wrongName' / key 'wrongname' present in AppContext"
      )
      expect(shouldNeverBeAssigned).to.equal(undefined)
      done()
    }
  })

  it('should unregister registered components', function (done) {
    AppContext.register('temporaryDependency', {prop: 17})

    expect(AppContext.temporaryDependency).to.deep.equal({prop: 17})

    AppContext.unregister('temporaryDependency')

    try {
      AppContext.temporaryDependency
      done('Should have thrown error')
    } catch (e) {
      expect(e.toString()).to.equal(
        "Error: No component with name 'temporaryDependency' / key 'temporarydependency' present in AppContext"
      )
      done()
    }

  })

  it('should throw error on unregistering protected methods', function (done) {
    
    try {
      AppContext.unregister('register')
      done('Should have thrown error')
    } catch (e) {
      expect(e.toString()).to.equal(
        "Error: Unregistration with keys register, unregister, clear, provider, profiles, start, scan is not allowed"
      )
      done()
    }
    
  })

  it('should throw error on unregistering with non-string name', function (done) {
    
    try {
      AppContext.unregister(17)
      done('Should have thrown error')
    } catch (e) {
      expect(e.toString()).to.equal(
        "Error: Components must be unregistered with a non-empty name of type *string*, but was tried with 17 (type: number)"
      )
      done()
    }
    
  })

  it('should clear', function (done) {

    AppContext.register('dep1', {prop: 1})
    AppContext.register('dep2', 17)
    AppContext.register('dep3', () => 23)

    expect(AppContext.dep1).to.deep.equal({prop: 1})
    expect(AppContext.dep2).to.equal(17)
    expect(AppContext.dep3).to.equal(23)
    
    AppContext.clear()

    try {
      AppContext.dep1
      done('Should have thrown error')
    } catch (e) {
      expect(e.toString()).to.equal(
        "Error: No component with name 'dep1' / key 'dep1' present in AppContext"
      )
    }

    try {
      AppContext.dep2
      done('Should have thrown error')
    } catch (e) {
      expect(e.toString()).to.equal(
        "Error: No component with name 'dep2' / key 'dep2' present in AppContext"
      )
    }

    try {
      AppContext.dep3
      done('Should have thrown error')
    } catch (e) {
      expect(e.toString()).to.equal(
        "Error: No component with name 'dep3' / key 'dep3' present in AppContext"
      )
    }


    done()
  })

})
