const TypeUtil = require('./TypeUtil')

var FunctionUtil = {
  getFunctionParameters: function (func) {
    if (!TypeUtil.isFunction(func)) {
      throw new Error(`Argument ${func} is not a function`)
    }

    var normalizedFunctionString = func.toString()
    // remove multi line comments
      .replace(/\/\*(.|[\r\n])*\*\//g, '')

    // remove single line comments
      .replace(/\/\/.*\n/g, '')

    // remove all whitespaces
      .replace(/\s/g, '')

    var matches
    if (TypeUtil.isClass(func)) {
      matches = normalizedFunctionString.match(/.*constructor.*?\(([^)]*)\)/)
    } else {
      matches = normalizedFunctionString.match(/\(([^)]*)\)/)
    }

    var args = matches ? matches[1] : ''

    return args
      .split(',')
      .map(function (arg) {
        // Ensure no inline comments are parsed and trim the whitespace.
        return arg
          .replace(/\/\*(.|[\r\n])*\*\//, '')
          .replace(/\/\/.*\n/, '')
          .trim()
      })
      .filter(function (arg) {
        // Ensure no undefined values are added.
        return arg
      })
  }
}

module.exports = FunctionUtil
