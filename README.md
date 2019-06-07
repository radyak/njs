# njs

[![build](https://travis-ci.org/radyak/njs.svg?branch=master)](https://travis-ci.org/radyak/njs)      [![codecov](https://codecov.io/gh/radyak/njs/branch/master/graph/badge.svg)](https://codecov.io/gh/radyak/njs)      [![License: GPLv3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

*njs* [ɪnˈʤes] is a fast, zero-dependency and light-weight *Dependency Injection* library for NodeJS.

## Installation

Install *njs* with npm:

```bash
npm install njs
```

## Introduction

What is *njs* capable of?

Normally, you would "pull" and/or instantiate required things like functions, modules, classes etc. by hand, e.g.:

```javascript
let MyService = require('./services/MyService');
let HttpClient = require('./http/HttpClient');
let devConfig = require('./config/development-config');

let myService = new MyService(new HttpClient(devConfig));
...
```

But this can get cumbersome if you
* have tons of such imports, distributed over several files
* must respect a complex order of instatiation
* need an alternative instance in some cases, e.g. a mock or a different implementation, depending on the environment

Therefore, *njs* provides the following key concepts:
* ***Components*** are all the things you don't want to take care about to instantiate, to require and to manage. This can be classes, objects, functions and primitives.
* *Components* are registered in the ***njs Context***, which manages them and, in particular, their lifecycle.
* ***Providers*** are an optional indirection to put *Components* into the *njs Context*. This can especially be useful if you use *Components* that are resolved asynchronously.
* ***Profiles*** allow for easy substitution of *Components*.

### Example

Following the above example, *njs* allows you to transform this code into the code below:

1. Provide different configurations for different environments:
    ```javascript
    njs.configuration('config', { /* production config */ });

    njs.configuration('config', { /* development config */ }, 'dev');
    ```

2. Register the `HttpClient` and a mock class in the *njs Context*:
    ```javascript
    njs.component('HttpClient', class HttpClient {
        constructor(config) {
            // ...
        }
    });

    njs.component('HttpClient', class MockHttpClient {
        // You could use the config here too or do something completely else
    }, 'dev');
    ```

3. Let *njs* inject the `HttpClient` into your `MyService`:
    ```javascript
    njs.component('MyService', class MyService{
        constructor(HttpClient) {
            // ...
        }
    });
    ```

Now, you could directly get a prepared instance of `MyService` and use it, like:

```javascript
let myService = njs.MyService;

myService.callMyApi() // Example method that may make use of the injecte HttpClient
```

Note how *njs* takes care of the instantiation of `MyService`, together with the injection of the according `HttpClient` component.

Or you could wrap your application's startup. A more profound example for this would be:

```javascript

njs

  // activate the dev profile
  .profiles(
      'dev'
  )

  // njs scans specified directories for components, configurations etc.
  .scan(
    'src/context'
  )

  .start((MyService) => {
    // Since 'dev' profile is active, MyService was injected with MockHttpClient
    MyService.callMyApi()
  })
```

Worth mentioning here, too, you should also know that *njs* can:
* resolve dependencies *asynchronously*
* scan for profiles in *Environment variables*


## Documentation

*njs* provides a *fluent API*, i.e. all *njs* methods can be chained.

### `register(name: String, component: any, profile: String = "default")`

Registers a component with the specified name in the *njs Context*. A component can be an `Object`, `Array`, a `class` or primitives like strings, numbers etc.

Note:
  * The *Global* synonym for `register` is `Dependency(...)`
  * The `name` is case insensitive.
  * If a profile is specified, the component will only be registered if that profile *is already* active.
  * *njs* does not allow to register components with the name of a *njs* method. I.e. for example that `njs.register('register', ...)` would throw an `Error`

Examples: Register the regular `MyService` as Component in the *njs Context*, and a mock substitute for profile `dev`

```javascript
njs.register('MyService', class MyService {
    constructor(HttpClient) {
        // ...
    }

    callMyApi() {
        return this.HttpClient.post(...);
    }
});

njs.register('MyService', {
    callMyApi: () => {
        return new Promise( ... );
    }
});
```


### `provider(name: String, provider: Function, profile: String = "default")`

Registers a provider function with the specified name in the *njs Context*. This allows for dynamic or even asynchronous provision of components. The arguments of the `provider` function specifiy the components the need to be injected.

Examples: Register a provider for `HttpClient`, specific for profile `dev`

```javascript
njs.provider('HttpClient', (asyncLoadedProperties) => {
    return new HttpClient(asyncLoadedProperties);
}, 'dev');
```



### `unregister(name: String)`

Removes a component from the *njs Context*.

Example: Remove `MyService` from the *njs Context*

```javascript
njs.unregister('MyService');
```


### `clear()`

Clears the *njs Context* components, profiles, scan directories and globals.

Example:

```javascript
njs.clear();
```


### `scan(directories: ...String|String[])`

Scans the specified directories recursively and loads all files found. Files in these directories should only contain `register(...)` or `provider(...)` calls (or their Global synonyms).

Note:
  * Under the hood, `require` is called to load the according files, i.e. the corresponding caching effects of `require` must be respected.
  * Must be called before the *njs Context* startup or before components are retrieved from it.

Examples: Scan all files in the directories `src/context` and `src/config`

```javascript
njs.scan('src/context', 'src/config');

njs.scan(['src/context', 'src/config']);
```


### `start(onStartup: Function)`

Starts the *njs Context* and executes the `onStartup` hook function. As for functions registered as `provider`, the arguments of the `provider` function specifiy the components the need to be injected.
This can be used for startup of cronjobs, servers and the like.

Example: Start an [express](https://www.npmjs.com/package/express) App

```javascript
njs.start((expressApp) => {
    expressApp.listen(3000);
});
```


### `profiles(profiles: ...String|String[])`

Activates the specified profiles.

Example: Activate profiles for local development

```javascript
njs.profiles('dev', 'local');

njs.profiles(['dev', 'local']);
```


### `configure(configuration: Object)`

Configures *njs* with an object. Currently, it contains only the following property (open for your suggestions):

| Name | Type | Default | Explanation |
|--|--|--|--|
| `useGlobals` | `boolean` | `false` | Register *njs* method synonyms in the global JS environment, so that you don't have to `require` *njs* in all files; these global synonyms are mentioned for the according methods below. |


Example:

```javascript
njs.configure({
    useGlobals: true
});
```



### Further functionality

#### Manually pull components from the *njs Context*

Besides letting required components be injected into another component, they can also be pulled directly from the *njs Context*:

```javascript
njs.register('HttpClient', { ... })

// ...

let httpClient = njs.HttpClient;
let myService = new MyService(httpClient);
```



#### Configure Profiles with `ACTIVE_CONTEXT_PROFILES` environment variable

In addition to activating profiles explicitly through `profiles(...)`, they can also be activated with the environment variable `ACTIVE_CONTEXT_PROFILES`:

```
ACTIVE_CONTEXT_PROFILES=dev,local
```


#### Global synonyms

You can use globals (or global synonyms) by configuring *njs*:

```javascript
njs.configure({
    useGlobals: true
});
```

Afterwards, you can use the following synonyms, without `require` or import statements

| Synonym | *njs* Method |
|--|--|
| `Component` | `njs.register` |
| `Provider` | `njs.provider` |
| `Njs` | `njs` |
