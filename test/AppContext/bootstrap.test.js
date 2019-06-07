var expect = require('chai').expect
var AppContext = require('../../src/AppContext')

describe('AppContext - Bootstrap', function () {

  

  beforeEach(() => {
    AppContext.clear()
    AppContext.configure({
      useGlobals: true
    })
  })



  it('should bootstraps empty context', function(done) {

    AppContext.start(() => {
      done()
    })

  })

  it('should not start if theres an unsatisfied dependency', function(done) {

    try {
      AppContext.start((someDependency) => {
        done('Should have thrown an error')
      })
    } catch (e) {
      expect(e.toString()).to.equal("Error: Could not start njs context. Error is: Error while instantiating component 'main'.\n\t -> No component with name 'someDependency' / key 'somedependency' present in AppContext")
      done()
    }
    
  })

  it('should inject dependencies after start', function(done) {

    AppContext.register('dependency', (subDependency) => {
       return {
         sub: subDependency
       }
    })
    AppContext.register('subdependency', {prop: 1})

    AppContext.start((dependency) => {
      expect(dependency).to.deep.equal({sub: {prop: 1}})
      done()
    })

  })


  it('should scan directories recursively for dependencies', function(done) {

    /*
      NOTE: I encountered serious problems:

        1.  When running tests with line coverage;
            Somehow, the loaded files & functions are modified in a way that the
            arguments aren't recognized by FuntionUtil anymore (but only those with
            exactly 1 argument)

            -> WORKAROUND: use 'function' instead of arrow notation

        2.  Loading from a file within the 'test' directory won't work, since
            mocha preloads all files before testing, so the context config files' content
            is cached and the next require() won't modify the context anymore. Ignoring
            didn't work either.

            -> WORKAROUND: put them into a 'test-data' dir in the project root
    */

    AppContext
    .scan([
      'test-data/ApplicationContext/scan-test-normal'
    ])
    .start((dependency) => {
      expect(dependency).to.deep.equal({sub: {prop: 1}})
      done()
    })

  })


  it('should scan directories recursively for dependencies, using profiles', function(done) {

    process.env.ACTIVE_CONTEXT_PROFILES = 'envvar-configured, another'

    AppContext
      .profiles('method-configured')
      .scan(
        'test-data/ApplicationContext/scan-test-profiles/dir',
        'test-data/ApplicationContext/scan-test-profiles/anotherdir',
      )
      .start((dependency) => {
        expect(dependency).to.deep.equal({sub: {prop: 2}})
        done()
      })

  })


  it('should throw error when non-existing directory is scanned', function(done) {

    try {
      AppContext
        .scan(
          'test-data/ApplicationContext/doesntexist',
        )
        .start(() => {
          done('Should have thrown an error')
        })
    } catch (e) {
      expect(e.toString()).to.match(new RegExp("Error: ENOENT: no such file or directory, scandir '.*njs/test-data/ApplicationContext/doesntexist'"))
      done()
    }

  })


  it('should throw error if a dependency throws an error', function(done) {

    Component('subdependency', function() {
        throw new Error('Simulated error')
    })
    
    Provider('Dependency', function(subdependency) {
        return {
            sub: subdependency
        }
    })
    
    try {
      AppContext
        .start((Dependency) => {
          expect(Dependency).to.equal(null)
          done('Should have thrown an error')
        })
    } catch (e) {
      expect(e.toString()).to.equal("Error: Could not start njs context. Error is: Error while instantiating component \'main\'.\n\t -> Error while instantiating component \'dependency\'.\n\t -> Error while instantiating component \'subdependency\'.\n\t -> Simulated error")
      done()
    }

  })


  it('should handle with a second callback if a dependency throws an error', function(done) {

    Component('subdependency', function() {
        throw new Error('Simulated error')
    })
    
    Provider('Dependency', function(subdependency) {
        return {
            sub: subdependency
        }
    })
    
    AppContext
      .start((Dependency) => {
        expect(Dependency).to.equal(null)
        done('Should have thrown an error')
      }, (e) => {
        expect(e.toString()).to.equal("Error: Could not start njs context. Error is: Error while instantiating component 'main'.\n\t -> Error while instantiating component 'dependency'.\n\t -> Error while instantiating component 'subdependency'.\n\t -> Simulated error")
        done()
      })

  })


  it('should clear require.cache', function(done) {
    
    AppContext
      .scan(
        'test-data/ApplicationContext/clear-test'
      )
      .start((Dependency) => {
        expect(Dependency).to.deep.equal({ sub: { prop: 1 } })
      }, (e) => {
        done('Should not have thrown an error')
      })

      .then(() => {
        AppContext.clear()
        AppContext.configure({
          useGlobals: true
        })
      })

      .then(() => {
        
        AppContext
          .scan(
            'test-data/ApplicationContext/clear-test'
          )
          .start((Dependency) => {
            expect(Dependency).to.deep.equal({ sub: { prop: 1 } })
            done()
          }, (e) => {
            done('Should not have thrown an error, but got: ' + e.toString())
          })

      })

      .catch(e => {
        console.error('Error occurred:', e)
        done(e)
      })

  })

})
