var expect = require('chai').expect
var AppContext = require('../src/AppContext')
var TypeUtil = require('../src/TypeUtil')

describe('AppContext', function () {
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

  describe('dependency injection', function () {
    function Battery () {
      this.getEnergy = function () {
        return 'battery'
      }
    }

    class SolarPanel {
      getEnergy () {
        return 'solar panel'
      };
    }

    function Flashlight (battery) {
      this.battery = battery

      this.on = function () {
        if (!this.battery) {
          throw new Error('No battery inserted')
        }
        var source = this.battery.getEnergy()
        return `Flashlight runs with ${source}`
      }
    }

    it('should not work with Vanilla JS', function (done) {
      var flashlightWithoutDI = new Flashlight()
      try {
        flashlightWithoutDI.on()
        done('Should have thrown an Error')
      } catch (e) {
        done()
      }
    })

    it('should inject dependencies automatically (function class definition)', function () {
      AppContext.register('Battery', Battery)
      AppContext.register('Flashlight', Flashlight)

      expect(TypeUtil.isObject(AppContext.Battery)).to.equal(true)
      expect(TypeUtil.isObject(AppContext.Flashlight)).to.equal(true)

      expect(AppContext.Flashlight.on()).to.equal('Flashlight runs with battery')
    })

    it('should inject dependencies automatically (new class definition)', function () {
      AppContext.register('Battery', SolarPanel)
      AppContext.register('Flashlight', Flashlight)

      expect(TypeUtil.isObject(AppContext.Battery)).to.equal(true)
      expect(TypeUtil.isObject(AppContext.Flashlight)).to.equal(true)

      expect(AppContext.Flashlight.on()).to.equal('Flashlight runs with solar panel')
    })

    it('should inject dependencies automatically (provider function definition)', function () {
      AppContext.register('Battery', () => {
        return new Battery()
      })
      AppContext.register('Flashlight', function (Battery) {
        return new Flashlight(Battery)
      })

      expect(TypeUtil.isObject(AppContext.Battery)).to.equal(true)
      expect(TypeUtil.isObject(AppContext.Flashlight)).to.equal(true)

      expect(AppContext.Flashlight.on()).to.equal('Flashlight runs with battery')
    })

    it('should inject dependencies automatically (provider function definition with promises)', function (done) {
      AppContext.register('Battery', () => {
        return new Promise((resolve, reject) => setTimeout(() => resolve(new Battery()), 100))
      })
      AppContext.register('Flashlight', function (Battery) {
        return Promise.all([Battery]).then((values) => {
          var battery = values[0]
          return new Flashlight(battery)
        })
      })

      AppContext.Flashlight.then((flashlight) => {
        expect(flashlight.on()).to.equal('Flashlight runs with battery')
        done()
      })
    })

    it('should throw Error on unsatisfied dependency', function (done) {
      function Flashlight (battery, config) {
        this.battery = battery
        this.config = config

        this.on = function () {
          if (!this.battery) {
            throw new Error('No battery inserted')
          }
          var source = this.battery.getEnergy()
          return `Flashlight runs with ${source} and config key '${this.config.key}'`
        }
      }
      AppContext.register('Battery', SolarPanel)
      AppContext.register('Flashlight', Flashlight)

      var flashlight
      try {
        flashlight = AppContext.Flashlight
        done('Should have thrown an Error')
      } catch (e) {
        expect(e.toString()).to.equal(
          "Error: No component with name 'config' / key 'config' present in AppContext"
        )
        expect(flashlight).to.equal(undefined)
      }

      AppContext.register('config', { key: 'value' })

      expect(AppContext.Flashlight.on()).to.equal("Flashlight runs with solar panel and config key 'value'")

      done()
    })

    it('should create always the same instances', function () {
      AppContext.register('Battery', Battery)
      AppContext.register('Flashlight', Flashlight)

      expect(AppContext.Battery).to.equal(AppContext.Battery)
      expect(AppContext.Flashlight).to.equal(AppContext.Flashlight)
    })

    it('should ignore case', function () {
      AppContext.register('bAtTeRy', Battery)
      AppContext.register('fLaShLiGhT', Flashlight)

      expect(AppContext.BATtery).to.equal(AppContext.batTERY)
      expect(AppContext.FLASHlight).to.equal(AppContext.FlashLIGHT)

      expect(AppContext.flaSHLight.on()).to.equal('Flashlight runs with battery')
    })
  })

  describe('AppContext Bootstrap', function () {
    /**
       * COMMON MODEL:
       *
       *
       *          dep1---\
       *                  |---dep4---\
       *          dep2---/            \
       *           /                   |---dep5
       *          /                   /
       *  dep3---/                   /
       *         \------------------/
       */

    it('should inject and resolve dependencies synchronously', () => {
      AppContext.register('dep1', function () {
        return {
          content: 'dependency-1'
        }
      })

      AppContext.register('dep3', function () {
        return 'dependency-3'
      })

      AppContext.register('dep2', function (dep3) {
        return {
          dep3: dep3,
          content: 'dependency-2'
        }
      })

      AppContext.register('dep4', function (dep1, dep2) {
        return {
          dep1: dep1,
          dep2: dep2,
          content: 'dependency-4'
        }
      })

      AppContext.register('dep5', (dep3, dep4) => {
        return {
          dep3: dep3,
          dep4: dep4,
          content: 'dependency-5'
        }
      })

      var dep5 = AppContext.dep5

      expect(dep5).to.deep.equal({
        dep3: 'dependency-3',
        dep4: {
          dep1: {
            content: 'dependency-1'
          },
          dep2: {
            dep3: 'dependency-3',
            content: 'dependency-2'
          },
          content: 'dependency-4'
        },
        content: 'dependency-5'
      })
    })

    it('should inject and resolve Promise dependencies asynchronously', function (done) {
      AppContext.register('dep1', function () {
        return {
          content: 'dependency-1'
        }
      })

      AppContext.register('dep3', function () {
        return new Promise((resolve, reject) => {
          setTimeout(() => resolve('dependency-3'), 100)
        })
      })

      AppContext.register('dep2', function (dep3) {
        return Promise.all([dep3]).then(values => {
          return {
            dep3: values[0],
            content: 'dependency-2'
          }
        })
      })

      AppContext.register('dep4', function (dep1, dep2) {
        return Promise.all([dep1, dep2]).then(values => {
          return {
            dep1: values[0],
            dep2: values[1],
            content: 'dependency-4'
          }
        })
      })

      AppContext.register('dep5', function (dep3, dep4) {
        return Promise.all([dep3, dep4]).then(values => {
          return {
            dep3: values[0],
            dep4: values[1],
            content: 'dependency-5'
          }
        })
      })

      expect(AppContext.dep5).to.deep.equal({
        dep3: 'dependency-3',
        dep4: {
          dep1: {
            content: 'dependency-1'
          },
          dep2: {
            dep3: 'dependency-3',
            content: 'dependency-2'
          },
          content: 'dependency-4'
        },
        content: 'dependency-5'
      })

      done()
    })
  })
})
