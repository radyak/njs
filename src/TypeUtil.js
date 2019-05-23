const AsyncFunction = (async () => {}).constructor

var TypeUtil = {
  isBoolean: function (test) {
    return typeof test === 'boolean'
  },
  isFunction: function (test) {
    return typeof test === 'function'
  },
  isAsyncFunction: function (test) {
    return test instanceof AsyncFunction
  },
  isClass (v) {
    return typeof v === 'function' && /^\s*class\s+/.test(v.toString())
  },
  isNumber: function (test) {
    return typeof test === 'number'
  },
  isString: function (test) {
    return typeof test === 'string'
  },
  isObject: function (test) {
    return !!test && Object.prototype.toString.call(test) === '[object Object]'
  },
  isArray: function (test) {
    return !!test && Object.prototype.toString.call(test) === '[object Array]'
  }
}

module.exports = TypeUtil
