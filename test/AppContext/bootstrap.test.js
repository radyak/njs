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

    // TODO: Better throw an error here ...

    try {
      AppContext.start((someDependency) => {
        done('Should have thrown an error')
      })
    } catch (e) {
      expect(e.toString()).to.equal('Error: Could not start njs context. There are probably unsatisfied dependencies')
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
        expect(dependency).to.deep.equal({sub: {prop: 1}})
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
      expect(e.toString()).to.equal("Error: ENOENT: no such file or directory, scandir '/home/fvo/private/dev/radshift/njs/test-data/ApplicationContext/doesntexist'")
      done()
    }

  })

})
