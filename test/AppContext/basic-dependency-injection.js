var expect = require('chai').expect
var AppContext = require('../../src/AppContext')
var TypeUtil = require('../../src/TypeUtil')

describe('AppContext - Basic Dependency Injection', function () {


  beforeEach(() => {
    AppContext.clear()
  })

  
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
