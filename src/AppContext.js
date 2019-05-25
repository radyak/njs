var TypeUtil = require('./TypeUtil')
var FunctionUtil = require('./FunctionUtil')
var FileUtil = require('./FileUtil')
var path = require('path')

var Context = {}
var scanDirs = []
var activeProfiles = []

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
    rv = instantiate(rv)
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
    // TODO: should e.message be checked for "Class constructor SolarPanel cannot be invoked without 'new'"?
    // console.error(e.message)
  }

  if (instance === undefined) {
    try {
      instance = new (Function.prototype.bind.apply(component, [null, ...dependencies]))()
    } catch (e) {
      // TODO: should e.message be checked for "Function.prototype.bind.apply(...) is not a constructor"?
      // console.error(e.message)
    }
  }

  return instance
}

AppContext.register = function (name, component, profile = 'default') {
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

AppContext.unregister = function (name) {
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

AppContext.clear = function () {
  for (let key in AppContext) {
    if (forbiddenToOverrideProperties.indexOf(key) === -1) {
      AppContext.unregister(key)
    }
  }
}

var isProfileActive = function (profile) {
  return isDefaultProfile(profile) || activeProfiles.indexOf(profile) !== -1
}

var isDefaultProfile = function (profile) {
  return profile === 'default'
}

AppContext.provider = function (name, providerFunction, profile = 'default') {
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
  console.log(`Scanning following files for dependencies:\n`, ',\n\t' + filesToScan.join(',\n\t'))

  for (var file of filesToScan) {
    require(path.resolve('.', file))
  }
}

var addEnvironmentConfiguredProfiles = function () {
  var envVarProfiles = process.env.ACTIVE_CONTEXT_PROFILES
  if (envVarProfiles) {
    envVarProfiles = envVarProfiles.split(/[\s,]+/)
    activeProfiles = activeProfiles.concat(envVarProfiles)
  }
}

AppContext.profiles = function (profiles) {
  activeProfiles = []
  if (TypeUtil.isArray(profiles)) {
    activeProfiles = activeProfiles.concat(profiles)
  } else {
    for (var argument of arguments) {
      activeProfiles.push(argument)
    }
  }
  return AppContext
}

AppContext.start = function (callback) {
  addEnvironmentConfiguredProfiles()
  console.log(`Active profiles:\n`, activeProfiles.join(',\n\t'))

  scanDependencies()
  console.log(`Registered context components (by key):\n`, Object.keys(Context).join(',\n\t'))

  AppContext.provider('Main', callback)
  return AppContext.Main
}

AppContext.scan = function (directories) {
  if (TypeUtil.isArray(directories)) {
    scanDirs = scanDirs.concat(directories)
  } else {
    for (var argument of arguments) {
      scanDirs.push(argument)
    }
  }
  return AppContext
}

const forbiddenToOverrideProperties = Object.keys(AppContext)

global.AppContext = AppContext
global.Dependency = AppContext.register
global.Provider = AppContext.provider
global.Configuration = AppContext.provider

module.exports = AppContext
