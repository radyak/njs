var expect = require('chai').expect
var TypeUtil = require('../src/TypeUtil')

describe('TypeUtils', function () {
  describe('isObject', function () {
    it('should recognize objects created with function definition', function () {
      function FunctionObjectDefinition () { }
      var object = new FunctionObjectDefinition()
      expect(TypeUtil.isArray(object)).to.equal(false)
      expect(TypeUtil.isBoolean(object)).to.equal(false)
      expect(TypeUtil.isFunction(object)).to.equal(false)
      expect(TypeUtil.isNumber(object)).to.equal(false)
      expect(TypeUtil.isObject(object)).to.equal(true)
      expect(TypeUtil.isString(object)).to.equal(false)
      expect(TypeUtil.isClass(object)).to.equal(false)
    })

    it('should recognize objects created with class definition', function () {
      class ClassObjectDefinition { }
      var object = new ClassObjectDefinition()
      expect(TypeUtil.isArray(object)).to.equal(false)
      expect(TypeUtil.isBoolean(object)).to.equal(false)
      expect(TypeUtil.isFunction(object)).to.equal(false)
      expect(TypeUtil.isNumber(object)).to.equal(false)
      expect(TypeUtil.isObject(object)).to.equal(true)
      expect(TypeUtil.isString(object)).to.equal(false)
      expect(TypeUtil.isClass(object)).to.equal(false)
    })

    it('should recognize objects created with direct definition', function () {
      var object = {}
      expect(TypeUtil.isArray(object)).to.equal(false)
      expect(TypeUtil.isBoolean(object)).to.equal(false)
      expect(TypeUtil.isFunction(object)).to.equal(false)
      expect(TypeUtil.isObject(object)).to.equal(true)
      expect(TypeUtil.isNumber(object)).to.equal(false)
      expect(TypeUtil.isString(object)).to.equal(false)
      expect(TypeUtil.isClass(object)).to.equal(false)
    })
  })

  describe('isFunction', function () {
    it('should recognize functions', function () {
      function SomeFunction () { }
      expect(TypeUtil.isArray(SomeFunction)).to.equal(false)
      expect(TypeUtil.isBoolean(SomeFunction)).to.equal(false)
      expect(TypeUtil.isFunction(SomeFunction)).to.equal(true)
      expect(TypeUtil.isFunction(new SomeFunction())).to.equal(false)
      expect(TypeUtil.isNumber(SomeFunction)).to.equal(false)
      expect(TypeUtil.isObject(SomeFunction)).to.equal(false)
      expect(TypeUtil.isString(SomeFunction)).to.equal(false)
      expect(TypeUtil.isClass(SomeFunction)).to.equal(false)
    })

    it('should recognize class definitions as functions', function () {
      class ClassObjectDefinition { }
      expect(TypeUtil.isArray(ClassObjectDefinition)).to.equal(false)
      expect(TypeUtil.isBoolean(ClassObjectDefinition)).to.equal(false)
      expect(TypeUtil.isFunction(ClassObjectDefinition)).to.equal(true)
      expect(TypeUtil.isFunction(new ClassObjectDefinition())).to.equal(false)
      expect(TypeUtil.isObject(ClassObjectDefinition)).to.equal(false)
      expect(TypeUtil.isNumber(ClassObjectDefinition)).to.equal(false)
      expect(TypeUtil.isString(ClassObjectDefinition)).to.equal(false)
      expect(TypeUtil.isClass(ClassObjectDefinition)).to.equal(true)
    })
  })

  it('should recognize async functions', function () {
    var test = async function () {}
    expect(TypeUtil.isArray(test)).to.equal(false)
    expect(TypeUtil.isBoolean(test)).to.equal(false)
    expect(TypeUtil.isAsyncFunction(test)).to.equal(true)
    expect(TypeUtil.isFunction(test)).to.equal(true)
    expect(TypeUtil.isNumber(test)).to.equal(false)
    expect(TypeUtil.isObject(test)).to.equal(false)
    expect(TypeUtil.isString(test)).to.equal(false)
    expect(TypeUtil.isClass(test)).to.equal(false)
  })

  it('should recognize booleans', function () {
    var test = false
    expect(TypeUtil.isArray(test)).to.equal(false)
    expect(TypeUtil.isBoolean(test)).to.equal(true)
    expect(TypeUtil.isFunction(test)).to.equal(false)
    expect(TypeUtil.isNumber(test)).to.equal(false)
    expect(TypeUtil.isObject(test)).to.equal(false)
    expect(TypeUtil.isString(test)).to.equal(false)
    expect(TypeUtil.isClass(test)).to.equal(false)
  })

  it('should recognize strings', function () {
    var test = ''
    expect(TypeUtil.isArray(test)).to.equal(false)
    expect(TypeUtil.isBoolean(test)).to.equal(false)
    expect(TypeUtil.isFunction(test)).to.equal(false)
    expect(TypeUtil.isNumber(test)).to.equal(false)
    expect(TypeUtil.isObject(test)).to.equal(false)
    expect(TypeUtil.isString(test)).to.equal(true)
    expect(TypeUtil.isClass(test)).to.equal(false)
  })

  it('should recognize numbers', function () {
    var test = 5.1
    expect(TypeUtil.isArray(test)).to.equal(false)
    expect(TypeUtil.isBoolean(test)).to.equal(false)
    expect(TypeUtil.isFunction(test)).to.equal(false)
    expect(TypeUtil.isNumber(test)).to.equal(true)
    expect(TypeUtil.isObject(test)).to.equal(false)
    expect(TypeUtil.isString(test)).to.equal(false)
    expect(TypeUtil.isClass(test)).to.equal(false)
  })

  it('should recognize arrays', function () {
    var test = [1, 5]
    expect(TypeUtil.isArray(test)).to.equal(true)
    expect(TypeUtil.isBoolean(test)).to.equal(false)
    expect(TypeUtil.isFunction(test)).to.equal(false)
    expect(TypeUtil.isNumber(test)).to.equal(false)
    expect(TypeUtil.isObject(test)).to.equal(false)
    expect(TypeUtil.isString(test)).to.equal(false)
    expect(TypeUtil.isClass(test)).to.equal(false)
  })

  it('should recognize null as not anything', function () {
    var test = null
    expect(TypeUtil.isArray(test)).to.equal(false)
    expect(TypeUtil.isBoolean(test)).to.equal(false)
    expect(TypeUtil.isFunction(test)).to.equal(false)
    expect(TypeUtil.isNumber(test)).to.equal(false)
    expect(TypeUtil.isObject(test)).to.equal(false)
    expect(TypeUtil.isString(test)).to.equal(false)
    expect(TypeUtil.isClass(test)).to.equal(false)
  })

  it('should recognize undefined as not anything', function () {
    var test
    expect(TypeUtil.isArray(test)).to.equal(false)
    expect(TypeUtil.isBoolean(test)).to.equal(false)
    expect(TypeUtil.isFunction(test)).to.equal(false)
    expect(TypeUtil.isNumber(test)).to.equal(false)
    expect(TypeUtil.isObject(test)).to.equal(false)
    expect(TypeUtil.isString(test)).to.equal(false)
    expect(TypeUtil.isClass(test)).to.equal(false)
  })
})
