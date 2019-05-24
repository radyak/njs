var expect = require('chai').expect
var AppContext = require('../../src/AppContext')

describe('AppContext - Cascading Dependency Injection', function () {

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
