var TypeUtil = require('./TypeUtil')
var FunctionUtil = require('./FunctionUtil')
var FileUtil = require('./FileUtil')
var path = require('path')

var Context = {}
var scanDirs = []
var activeProfiles = []

/**
 * The njs context
 */
var AppContext = new Proxy(Context, {
  get (target, name, receiver) {
    var key = name.trim().toLowerCase()
    let rv = Reflect.get(target, key, receiver)
    if (forbiddenToOverrideProperties.indexOf(key) !== -1) {
      return rv
    }

    if (!rv) {
      throw new Error(
        `No component with name '${name}' / key '${key}' present in AppContext`
      )
    }

    if (!TypeUtil.isFunction(rv)) {
      // Not a function/constructor -> can't be instantiated (any more)
      return rv
    }
    try {
      rv = instantiate(rv)
    } catch (error) {
        throw new Error(`Error while instantiating component '${key}'.\n\t -> ${error.message}`)
    }
    Context[key] = rv
    return rv
  }
})

var instantiate = function (component) {
  var dependencies = []
  var dependencyNames = FunctionUtil.getFunctionParameters(component)
  for (var dependencyName of dependencyNames) {
    dependencies.push(AppContext[dependencyName])
  }
  var instance

  try {
    instance = component.apply(null, dependencies)
  } catch (e) {
    if (e.message && e.message.indexOf("cannot be invoked without 'new'") !== -1) {
      // Nothing to do here
    } else {
      throw e
    }
  }

  if (instance === undefined) {
    try {
      instance = new (Function.prototype.bind.apply(component, [null, ...dependencies]))()
    } catch (e) {
      // Potential check:
      // if (e.message && e.message.indexOf('is not a constructor') !== -1) {...}
      // currently not necessary, as `component` is already checked to be a function; arriving here would mean it is neither 
      // a normal function nor a constructor - impossible
    }
  }

  return instance
}

var register = function (name, component, profile = 'default') {
  if (forbiddenToOverrideProperties.indexOf(name) !== -1) {
    throw new Error(`Registration with keys ${forbiddenToOverrideProperties.join(', ')} is not allowed`)
  }
  if (!TypeUtil.isString(name) || !name.trim()) {
    throw new Error(
      `Components must be registered with a non-empty name of type *string*, but was tried with ${name} (type: ${typeof name})`
    )
  }
  if (!TypeUtil.isString(profile) || !profile.trim()) {
    throw new Error(
      `Profiles must be a non-empty name of type *string*, but was tried with ${profile} (type: ${typeof profile})`
    )
  }
  var key = name.trim().toLowerCase()

  // can only be registered if:
  //  * profile is active
  //  * not yet registered
  //  * or if not the default profile (other profiles always override the default profile)
  if (isProfileActive(profile) && (
    !Context.hasOwnProperty(name) || !isDefaultProfile(profile))
  ) {
    Context[key] = component
  }
}

var unregister = function (name) {
  if (forbiddenToOverrideProperties.indexOf(name) !== -1) {
    throw new Error(`Unregistration with keys ${forbiddenToOverrideProperties.join(', ')} is not allowed`)
  }
  if (!TypeUtil.isString(name) || !name.trim()) {
    throw new Error(
      `Components must be unregistered with a non-empty name of type *string*, but was tried with ${name} (type: ${typeof name})`
    )
  }
  var key = name.trim().toLowerCase()

  delete Context[key]
}

var clearRequireCache = function () {
  var cachedFiles = Object.keys(require.cache)
  var cachedContextFiles = cachedFiles.filter(cachedFile => {
    for (var scanDir of scanDirs) {
      if (cachedFile.indexOf(scanDir) !== -1) {
        return true
      }
    }
    return false
  })

  cachedContextFiles.forEach(contextFile => {
    delete require.cache[contextFile]
    console.log(`Deleted ${contextFile} from require.cache`)
  })
}

var clear = function () {
  clearRequireCache()
  scanDirs = []
  activeProfiles = []

  for (let key in AppContext) {
    if (forbiddenToOverrideProperties.indexOf(key) === -1) {
      AppContext.unregister(key)
    }
  }

  AppContext.configure({})
}

var isProfileActive = function (profile) {
  return isDefaultProfile(profile) || isEnvConfiguredProfile(profile) || activeProfiles.indexOf(profile) !== -1
}

var isDefaultProfile = function (profile) {
  return profile === 'default'
}

var isEnvConfiguredProfile = function (profile) {
  var envVarProfiles = process.env.ACTIVE_CONTEXT_PROFILES
  return envVarProfiles && envVarProfiles.split(/[\s,]+/).indexOf(profile) !== -1
}


/**
 * Registers a dependency provider.
 * 
 * @param {String} name                   The name to register the provider with
 * @param {Function} providerFunction     The provider function
 * @param {String} [profile="default"]    The profile to register the dependency for; default value is "default"
 */
var provider = function (name, providerFunction, profile = 'default') {
  var dependencyNames = FunctionUtil.getFunctionParameters(providerFunction)

  AppContext.register(name, () => {
    return resolveThenCallback(dependencyNames, providerFunction)
  }, profile)
}

var resolveThenCallback = function (dependencyNames, callback) {
  var dependencies = []
  for (var dependencyName of dependencyNames) {
    dependencies.push(AppContext[dependencyName])
  }
  return Promise.all(dependencies).then(values => {
    return callback.apply(null, values)
  })
}

var scanDependencies = function () {
  var filesToScan = []
  for (var scanDir of scanDirs) {
    filesToScan = filesToScan.concat(FileUtil.listFilesRecursively(scanDir))
  }

  console.log(`Scanning following files for dependencies:\n`, '\t' + filesToScan.join(',\n\t'))

  for (var file of filesToScan) {
    let filePath = path.resolve('.', file)
    require(filePath)
  }
}


/**
 * Activates the given profiles.
 * 
 * @param {...String|String[]} profiles The profiles to activate
 */
var profiles = function (profiles) {
  if (TypeUtil.isArray(profiles)) {
    activeProfiles = activeProfiles.concat(profiles)
  } else {
    for (var argument of arguments) {
      activeProfiles.push(argument)
    }
  }
  return AppContext
}


/**
 * Starts the njs context
 * 
 * @param {Function} callback             The callback function to call after the njs context startup
 */
var start = function (callback, errorCallback) {
  console.log(`Active profiles:\n`, `\t` + activeProfiles.join(',\n\t'))

  scanDependencies()
  console.log(`Registered context components (by key):\n`, `\t` + Object.keys(Context).join(',\n\t'))

  AppContext.provider('Main', callback)
  try {
    return AppContext.Main
  } catch (e) {
    let newError = new Error(`Could not start njs context. Error is: ${e.message}`)
    if (errorCallback) {
      errorCallback(newError)
      return
    }
    throw newError
  }
}


/**
 * Scans the specified directory/directories for dependency registrations.
 * 
 * @param {...String|String[]} directories    The directories to scan
 * @returns                                   The njs context
 */
var scan = function (directories) {
  if (TypeUtil.isArray(directories)) {
    scanDirs = scanDirs.concat(directories)
  } else {
    for (var argument of arguments) {
      scanDirs.push(argument)
    }
  }
  return AppContext
}



/**
 * Configures the njs context; accepts the following properties:
 * 
 * @param {Object} configuration      The configuration
 */
var configure = function(configuration) {

  if (configuration && !!configuration.useGlobals) {
    global.Njs = AppContext
    global.Component = AppContext.register
    global.Provider = AppContext.provider
  } else {
    delete global.Njs
    delete global.Component
    delete global.Provider
  }

  return AppContext
}

AppContext.register = register
AppContext.unregister = unregister
AppContext.clear = clear
AppContext.provider = provider
AppContext.profiles = profiles
AppContext.start = start
AppContext.scan = scan
AppContext.configure = configure

const forbiddenToOverrideProperties = Object.keys(AppContext).sort()

module.exports = AppContext
