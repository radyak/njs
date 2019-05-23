var expect = require('chai').expect
var FunctionUtil = require('../src/FunctionUtil')

describe('FunctionUtil', function () {
  describe('should throw an error on non-functional arguments', function () {
    it('of type object', function (done) {
      try {
        FunctionUtil.getFunctionParameters({})
        done('No error was thrown')
      } catch (e) {
        done()
      }
    })
  })

  describe('should recognize old function style arguments', function () {
    it('without arguments', function () {
      expect(FunctionUtil.getFunctionParameters(function () {})).to.deep.equal([])

      expect(FunctionUtil.getFunctionParameters(function () {})).to.deep.equal([])

      expect(FunctionUtil.getFunctionParameters(function () {})).to.deep.equal([])

      expect(FunctionUtil.getFunctionParameters(
        function
        (

        ) { }
      )).to.deep.equal([])
    })

    it('with arguments', function () {
      expect(FunctionUtil.getFunctionParameters(function (a, b, c) {})).to.deep.equal(['a', 'b', 'c'])

      expect(FunctionUtil.getFunctionParameters(function (a, b, c) {})).to.deep.equal(['a', 'b', 'c'])

      expect(FunctionUtil.getFunctionParameters(function (a, b, c) {})).to.deep.equal(['a', 'b', 'c'])

      expect(FunctionUtil.getFunctionParameters(
        function
        (a
          , b,
          c) { }
      )).to.deep.equal(['a', 'b', 'c'])
    })
  })

  describe('should recognize arrow function style arguments', function () {
    it('without arguments', function () {
      expect(FunctionUtil.getFunctionParameters(() => {})).to.deep.equal([])

      expect(FunctionUtil.getFunctionParameters(() => {})).to.deep.equal([])

      expect(FunctionUtil.getFunctionParameters(() => {})).to.deep.equal([])

      expect(FunctionUtil.getFunctionParameters(
        (

        ) => { }
      )).to.deep.equal([])

      expect(FunctionUtil.getFunctionParameters(
        (
          // this comment shouldn't break the functioning
        ) => { }
      )).to.deep.equal([])

      expect(FunctionUtil.getFunctionParameters(
        (
          /* this comment shouldn't
          break the functioning
          */
        ) => { }
      )).to.deep.equal([])
    })

    it('with arguments', function () {
      expect(FunctionUtil.getFunctionParameters((a, b, c) => {})).to.deep.equal(['a', 'b', 'c'])

      expect(FunctionUtil.getFunctionParameters((a, b, c) => {})).to.deep.equal(['a', 'b', 'c'])

      expect(FunctionUtil.getFunctionParameters((a, b, c) => {})).to.deep.equal(['a', 'b', 'c'])

      expect(FunctionUtil.getFunctionParameters(
        (a
          , b,
          c) => { }
      )).to.deep.equal(['a', 'b', 'c'])

      expect(FunctionUtil.getFunctionParameters(
        (a
          // this comment shouldn't break the functioning
          , b, // this comment shouldn't break the functioning
          c
        // this comment shouldn't break the functioning
        ) => { }
      )).to.deep.equal(['a', 'b', 'c'])

      // multiple multi line comments are not supported
      expect(FunctionUtil.getFunctionParameters(
        (a, /* this comment shouldn
          't break the functioning */
          b,
          c
        ) => { }
      )).to.deep.equal(['a', 'b', 'c'])
    })
  })

  describe('should recognize ES6 class constructor arguments', function () {
    it('without constructor', function () {
      expect(FunctionUtil.getFunctionParameters(
        class TestClass {
          otherFunction (d, e) {

          }
        }
      )).to.deep.equal([])

      expect(FunctionUtil.getFunctionParameters(class TestClass {otherFunction (d, e) {}})).to.deep.equal([])

      expect(FunctionUtil.getFunctionParameters(class TestClass { otherFunction (d, e) { } })).to.deep.equal([])

      expect(FunctionUtil.getFunctionParameters(
        class TestClass {
          // this comment shouldn't break the functioning

          otherFunction (d, e) {

          }
        }
      )).to.deep.equal([])

      expect(FunctionUtil.getFunctionParameters(
        class TestClass {
          /* this comment shouldn't
          break the functioning
          */

          otherFunction (d, e) {

          }
        }
      )).to.deep.equal([])
    })

    it('without arguments', function () {
      expect(FunctionUtil.getFunctionParameters(
        class TestClass {
          constructor () { // eslint-disable-line no-useless-constructor

          }

          otherFunction (d, e) {

          }
        }
      )).to.deep.equal([])

      expect(FunctionUtil.getFunctionParameters(class TestClass {constructor () {}})).to.deep.equal([]) // eslint-disable-line no-useless-constructor

      expect(FunctionUtil.getFunctionParameters(class TestClass { constructor () { } })).to.deep.equal([]) // eslint-disable-line no-useless-constructor

      expect(FunctionUtil.getFunctionParameters(
        class TestClass {
          constructor ( // eslint-disable-line no-useless-constructor

          // this comment shouldn't break the functioning
          ) {

          }

          otherFunction (d, e) {

          }
        }
      )).to.deep.equal([])

      expect(FunctionUtil.getFunctionParameters(
        class TestClass {
          constructor ( // eslint-disable-line no-useless-constructor

          /* this comment shouldn't
          break the functioning
          */
          ) {

          }

          otherFunction (d, e) {

          }
        }
      )).to.deep.equal([])
    })

    it('with arguments', function () {
      expect(FunctionUtil.getFunctionParameters(
        class TestClass {
          constructor (a, b, c) { // eslint-disable-line no-useless-constructor

          }

          otherFunction (d, e) {

          }
        }
      )).to.deep.equal(['a', 'b', 'c'])

      expect(FunctionUtil.getFunctionParameters(class TestClass {constructor (a, b, c) {}otherFunction (d, e) {}})).to.deep.equal(['a', 'b', 'c']) // eslint-disable-line no-useless-constructor

      expect(FunctionUtil.getFunctionParameters(class TestClass {constructor (a, b, c) {} otherFunction (d, e) { }})).to.deep.equal(['a', 'b', 'c']) // eslint-disable-line no-useless-constructor

      expect(FunctionUtil.getFunctionParameters(
        class
        TestClass {
          constructor (a // eslint-disable-line no-useless-constructor
            , b,
            c) { }otherFunction (d, e) {

          }
        }
      )).to.deep.equal(['a', 'b', 'c'])

      expect(FunctionUtil.getFunctionParameters(
        class TestClass {
          constructor (a // eslint-disable-line no-useless-constructor
          // this comment shouldn't break the functioning
            , b, // this comment shouldn't break the functioning
            c
            // this comment shouldn't break the functioning
          ) { }
          otherFunction (d, e) {

          }
        }
      )).to.deep.equal(['a', 'b', 'c'])

      // multiple multi line comments are not supported
      expect(FunctionUtil.getFunctionParameters(
        class TestClass {
          constructor (a // eslint-disable-line no-useless-constructor
            /* this comment shouldn't
            break the functioning
            */
            , b,
            c) { }
          otherFunction (d, e) {

          }
        })).to.deep.equal(['a', 'b', 'c'])
    })
  })
})
