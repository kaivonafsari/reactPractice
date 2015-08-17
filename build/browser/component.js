/*!
 * Pellet v0.0.100
 * https://github.com/Rebelizer/pellet
 * 
 * Copyright 2014 Demetrius Johnson
 * Released under the MIT license
 * https://github.com/Rebelizer/pellet/LICENSE
 * 
 * 
 * Date: 2015-08-17T20:09:57.103Z
 */
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/js/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	__webpack_require__(5);
	__webpack_require__(6);
	__webpack_require__(7);
	__webpack_require__(1);
	__webpack_require__(8);
	__webpack_require__(4);
	__webpack_require__(11);
	__webpack_require__(12);
	__webpack_require__(13);
	__webpack_require__(14);
	__webpack_require__(10);
	__webpack_require__(26);
	__webpack_require__(9);
	__webpack_require__(15);
	module.exports = __webpack_require__(2);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var observables = __webpack_require__(17)
	  , TransformFn = {};
	
	// Helper function
	function wrap(command) {
	  return function() {
	    var configDetails;
	    var args = Array.prototype.slice.call(arguments, 0);
	    args[0] = this._namespace + args[0];
	
	    if(this.statsd && (false)) {
	      this.statsd[command].apply(this.statsd, args);
	    } else {
	      this.emit('statsd', {c:command, a:JSON.stringify(args)});
	    }
	  }
	}
	
	function instrumentation(statsdConfig, config) {
	  this._namespace = '';
	  this.statsd = null;
	  this.isolatedConfig = null;
	
	  this.bus = new observables.autoRelease(null, this);
	
	  if(config && config.debug) {
	    this.debugFilter = new RegExp(config.debug);
	  }
	
	  if(false) {
	    this.statsd = new (require('node-statsd'))(statsdConfig);
	  }
	}
	
	instrumentation.prototype.namespace = function(namespace) {
	  var obj = Object.create(this);
	  obj._namespace = this._namespace + namespace.replace(/\.$/,'') + '.';
	  return obj;
	}
	
	instrumentation.prototype.elapseTimer = function(startAt, namespace) {
	  var start, _this;
	
	  if(namespace) {
	    _this = this.namespace(namespace);
	  } else {
	    _this = this;
	  }
	
	  if(startAt) {
	    start = startAt;
	  } else {
	    if(false) {
	      start = process.hrtime();
	    } else if(true) {
	      if(window.performance) {
	        start = window.performance.now();
	      } else {
	        start = new Date();
	      }
	    }
	  }
	
	  return {
	    mark: function(name) {
	      if(false) {
	        var end = process.hrtime();
	        _this.timing(name, (((end[0]-start[0])*1e9) + (end[1]-start[1]))/1e6);
	      } else if(true) {
	        if(window.performance) {
	          _this.timing(name, window.performance.now()-start);
	        } else {
	          _this.timing(name, new Date()-start);
	        }
	      }
	    }
	  };
	}
	
	instrumentation.prototype.log = instrumentation.prototype.info = function(data) {
	  if(arguments.length !== 1) {throw Error('instrumentation log can only have one argument');}
	  this.emit('info', data);
	}
	
	instrumentation.prototype.error = function(data) {
	  if(arguments.length !== 1) {throw Error('instrumentation log can only have one argument');}
	  this.emit('error', data);
	}
	
	instrumentation.prototype.warn = function(data) {
	  if(arguments.length !== 1) {throw Error('instrumentation log can only have one argument');}
	  this.emit('warn', data);
	}
	
	instrumentation.prototype.event = function(data) {
	  this.emit('event', data);
	}
	
	instrumentation.prototype.timing = wrap('timing');
	instrumentation.prototype.increment = wrap('increment');
	instrumentation.prototype.decrement = wrap('decrement');
	instrumentation.prototype.histogram = wrap('histogram');
	instrumentation.prototype.gauge = wrap('gauge');
	instrumentation.prototype.set = wrap('set');
	
	/**
	 * Broadcast instrumentation details to all listeners
	 *
	 * @param type
	 * @param data
	 * @param isolatedConfig
	 */
	instrumentation.prototype.emit = function(type, details, namespace, sessionId) {
	  this.bus.emit({
	    type: type || 'NA',
	    sessionId: sessionId,
	    namespace: namespace || this._namespace || 'NA',
	    details: details || {}
	  }, this, this.isolatedConfig);
	
	  if(this.debugFilter && this.debugFilter.test(type)) {
	    console.debug('instrument:', type, JSON.stringify(details), this.isolatedConfig?'with isolatedConfig':'');
	  }
	}
	
	instrumentation.prototype.addIsolatedConfig = function(isolatedConfig) {
	  var wrapper = Object.create(this);
	  wrapper.isolatedConfig = isolatedConfig;
	  return wrapper;
	}
	
	instrumentation.prototype.registerTransformFn = function(name, fn) {
	  TransformFn[name] = fn;
	}
	
	instrumentation.prototype.getTransformFn = function(name) {
	  return TransformFn[name];
	}
	
	module.exports = instrumentation;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var react = __webpack_require__(16)
	  , utils = __webpack_require__(18)
	  , observables = __webpack_require__(17)
	  , isolator = __webpack_require__(19)
	  , instrumentation = __webpack_require__(1)
	  , pelletReactMixin = __webpack_require__(20)
	  , experimentInterface = __webpack_require__(21)
	  , cookie = __webpack_require__(22);
	
	/**
	 * @class pellet
	 *
	 */
	function pellet(config, options) {
	  this.readyFnQue = [];
	  this.initFnQue = [];
	  this.coordinators = {};
	  this.coordinatorSpecs = {};
	  this.components = {};
	  this.locales = {};
	
	  this.middlewareStack = [];
	  this.config = config || {};
	  this.options = options || {};
	
	  if(config) {
	    this.v = config._v;
	    this.rthash = config._rthash;
	  } else {
	    this.v = 'NA';
	    this.rthash = null;
	  }
	
	  // setup the experiment interface (passthru mode)
	  this.experiment = new experimentInterface(this);
	
	  if (this.options.instrumentation) {
	    this.instrumentation = this.options.instrumentation;
	  } else {
	    this.instrumentation = new instrumentation(null, this.config.instrumentation);
	  }
	
	  if (this.options.logger) {
	    this.logger = this.options.logger;
	  } else {
	    this.logger = null; // TODO: make a mock logger
	  }
	}
	
	/**
	 *
	 * @type {observables}
	 */
	pellet.prototype.observables = observables;
	
	/**
	 *
	 * @type {cookie}
	 */
	if(true) {
	  pellet.prototype.cookie = cookie;
	}
	
	/**
	 *
	 * @type {exports}
	 */
	pellet.prototype.createClass = function(spec) {
	  if(!spec.mixins) {
	    spec.mixins = [];
	  }
	
	  if(!(pelletReactMixin in spec.mixins)) {
	    spec.mixins.push(pelletReactMixin);
	  }
	
	  if(spec.componentConstruction) {
	    var _componentConstruction = spec.componentConstruction;
	    delete spec.componentConstruction;
	  }
	
	  if(spec.layoutTemplate) {
	    var _layout = spec.layoutTemplate;
	    delete spec.layoutTemplate;
	  }
	
	  if(typeof spec.routes !== 'undefined') {
	    var i, allRoutes;
	
	    if(typeof spec.routes === 'string') {
	      allRoutes = [spec.routes];
	    } else if(spec.routes instanceof Array) {
	      allRoutes = spec.routes;
	    }
	
	    delete spec.routes;
	  }
	
	  var reactClass = react.createClass(spec);
	
	  // make sure we have static version of _$construction
	  // and __$layout
	  if(_componentConstruction) {
	    reactClass._$construction = _componentConstruction;
	  }
	
	  if(_layout) {
	    reactClass.__$layout = _layout;
	  }
	
	  if(allRoutes) {
	    for(i in allRoutes) {
	      var options = {};
	      if(typeof spec.onRouteUnmountReact !== 'undefined') {
	        options.onRouteUnmountReact = !!spec.onRouteUnmountReact;
	      }
	
	      this.addComponentRoute(allRoutes[i], reactClass, options);
	    }
	  }
	
	  return reactClass;
	};
	
	pellet.prototype.setExperimentInterface = function(api) {
	  this.experiment = api;
	}
	
	pellet.prototype.setLocaleLookupFn = function(lookupFn) {
	  this.suggestLocales = lookupFn;
	};
	
	pellet.prototype.loadTranslation = function(locale, fn) {
	  this.locales[locale] = fn;
	};
	
	pellet.prototype.loadManifestComponents = function(manifest) {
	  var last, id, key, keys;
	
	  if(!manifest || typeof(manifest) !== 'object') {
	    return;
	  }
	
	  keys = Object.keys(manifest);
	
	  keys.sort().reverse();
	  for(var i in keys) {
	    key = keys[i];
	    id = key.substring(0, key.indexOf('@'));
	    if(id) {
	      if(last !== id) {
	        if(this.components[id]) {
	          console.warn('duplicate manifest component loaded:', id)
	        }
	
	        this.components[id] = manifest[key];
	        last = id;
	      }
	
	      this.components[key] = manifest[key];
	    }
	  }
	};
	
	/**
	 *
	 * NOTE: be careful with the options because once initialized
	 * we never create the coordinator so for each unique name the options
	 * need to match!
	 *
	 * @param key
	 * @param isGlobal
	 * @param options
	 * @returns {*}
	 */
	pellet.prototype.getCoordinator = function(name, type) {
	  if(!name) {
	    throw new Error('name is required');
	  }
	
	  if(instance = this.coordinators[name]) {
	    return instance;
	  }
	
	  if(typeof type !== 'string') {
	    type = name;
	    if(typeof type === 'object') {
	      options = type;
	    }
	  }
	
	  // now create a global coordinator
	  var instance = this.createCoordinator(type);
	  this.coordinators[name] = instance;
	
	  return instance;
	};
	
	/**
	 *
	 * @param key
	 * @param isGlobal
	 * @param options
	 * @returns {*}
	 */
	pellet.prototype.createCoordinator = function(type) {
	  if(!type) {
	    throw new Error('type is required');
	  }
	
	  if(!this.coordinatorSpecs[type]) {
	    throw new Error('Cannot find ' + type + ' coordinator spec');
	  }
	
	  var instance = new isolator();
	  utils.mixInto(instance, this.coordinatorSpecs[type], ['_emitters', '_releaseList', '_id', 'isolatedConfig'], ['initialize', 'load', 'release']);
	  instance.initialize();
	
	  return instance;
	};
	
	/**
	 * register the coordinator spec that creates the new coordinator
	 * of type name.
	 *
	 * @param name
	 * @param fn
	 */
	pellet.prototype.registerCoordinatorSpec = function(name, spec) {
	  if(!spec || !name) {
	    throw new Error('Spec and name are required for all coordinators.');
	  }
	
	  if(this.coordinatorSpecs[name]) {
	    console.error('Error duplicate store specs:', name);
	    throw new Error('Cannot have duplicate store specs');
	  }
	
	  if(spec._emitters || spec._releaseList || spec._id || this.isolatedConfig) {
	    console.error('Error invalided fields specs:', name);
	    throw new Error('_emitters, _releaseList, _id, isolatedConfig are reserved fields');
	  }
	
	  this.coordinatorSpecs[name] = spec;
	};
	
	/**
	 * register a function to be called once pellet is ready
	 * @param fn
	 */
	pellet.prototype.onReady = function(fn) {
	  // if all ready running fire immediately with the last know err (or null if no errors)
	  if(typeof(this.readyError) != 'undefined') {
	    setTimeout(function() {
	      fn(module.exports.readyError);
	    }, 1);
	
	    return;
	  }
	
	  this.readyFnQue.push(fn);
	};
	
	/**
	 * register a function needed to complete before pellet is ready
	 * @param fn
	 */
	pellet.prototype.registerInitFn = function(fn) {
	  this.initFnQue.push(fn);
	};
	
	/**
	 * Called after everyone has register their load functions
	 */
	pellet.prototype.startInit = function() {
	  if(typeof(this.readyError) != 'undefined') {
	    throw new Error('Cannot reinit because pellet is all ready running.');
	  }
	
	  var cbCount = this.initFnQue.length;
	  function done(err) {
	    if(err) {
	      // console log the error and safe the most recent error
	      console.error('Error init pellet because:', err.message);
	      module.exports.readyError = err;
	    }
	
	    if(--cbCount <= 0) {
	      // if all callback had no error set to null
	      if(!module.exports.readyError) {
	        module.exports.readyError = null;
	      }
	
	      var fn;
	      while(fn = module.exports.readyFnQue.pop()) {
	        fn(module.exports.readyError);
	      }
	    }
	  }
	
	  if(cbCount === 0) {
	    done(null);
	    return;
	  }
	
	  // now call all init fn and wait until all done
	  for(i in this.initFnQue) {
	    this.initFnQue[i](done);
	  }
	};
	
	/**
	 *
	 * @param renderOptions
	 * @param component
	 * @param options
	 * @returns {locals|*|js.locals|module.locals|app.locals|string}
	 */
	pellet.prototype.suggestLocales = function(renderOptions, component, options) {
	  if(true) {
	    var locales = document.body.getAttribute('locales');
	    if(locales) {
	      return locales;
	    }
	  }
	
	  return module.exports.config.locales || 'en-US';
	}
	
	if(false) {
	  module.exports = global.__pellet__ref = new pellet(global.__pellet__bootstrap.config, global.__pellet__bootstrap.options);
	} else if(true) {
	  module.exports = window.__pellet__ref = new pellet(window.__pellet__config);
	
	  module.exports.addWindowOnreadyEvent = function(fn) {
	    if(document.readyState == 'interactive' || document.readyState == 'complete') {
	      fn();
	      return;
	    }
	
	    if (document.addEventListener) {
	      document.addEventListener('DOMContentLoaded', fn, false);
	    } else if(window.attachEvent) {
	      document.attachEvent('onreadystatechange', fn);
	    } else {
	      setTimeout(fn, 2000);
	    }
	  }
	
	  module.exports.addWindowOnreadyEvent(function() {
	    // we need to simulate async load (this is needed
	    // so the webpack browser version can registerInitFn
	    setTimeout(function() {
	      window.__pellet__ref.startInit();
	    }, 1);
	  });
	} else {
	  module.exports = new pellet();
	}


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var patch = ['silly', 'debug', 'verbose', 'info', 'warn', 'error']
	  , map = ['info', 'info', 'log', 'info', 'warn', 'error']
	  , i = patch.length;
	
	while(i--) {
	  if(!console[patch[i]]) {
	    console[patch[i]] = console[map[i]];
	  }
	}


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var pellet = __webpack_require__(2)
	
	pellet.userAgentMixin = {
	  getUA: function() {
	    return (this.context.requestContext && this.context.requestContext.userAgentDetails) || {};
	  }
	};


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var pellet = __webpack_require__(2);
	
	if(true) {
	  var PARSE_STATSD = /^\["((.+)\.)?(.+)"\s*,\s*(.+)\]$/;
	  var REMOVE_PROTOCOL = /^https?:\/\/[^\/]+/;
	
	  function sendCmd(type, gaTrackID) {
	    if(!gaTrackID) {
	      gaTrackID = pellet.config[type];
	    }
	
	    if(!gaTrackID){
	      return 'send';
	    }
	
	    return gaTrackID + '.send';
	  }
	
	  pellet.registerInitFn(function (next) {
	    if(pellet.config && pellet.config.instrumentation) {
	      var gaTimingFilterFn = pellet.config.instrumentation.gaTimingFilterFn
	        , gaEventFilterFn = pellet.config.instrumentation.gaEventFilterFn;
	    }
	
	    pellet.instrumentation.bus.on(function (data) {
	      var namespace = data.namespace
	        , gaTrackID = data.gaTrackID
	        , details = data.details
	        , type = data.type
	        , fn;
	
	      if(type === 'uncaught-exception' && pellet.config.gaExceptionTrackID !== false) {
	        ga(sendCmd('gaExceptionTrackID', gaTrackID), 'exception', {
	          exDescription: details.msg + ' lineno:' + details.no
	        });
	      } else if(type === 'statsd' && details.c === 'timing' && pellet.config.gaTimingTrackID !== false) {
	        if(gaTimingFilterFn && (fn = pellet.instrumentation.getTransformFn(gaTimingFilterFn)) && !(data = fn(data))) {
	          return;
	        }
	
	        // update the gaTrackID because
	        // getTransformFn can update the value
	        gaTrackID = data.gaTrackID;
	
	        // convert the statsd data to a GA timing event
	        data = data.details.a.match(PARSE_STATSD);
	        if(data) {
	          ga(sendCmd('gaTimingTrackID', gaTrackID), 'timing', {
	            'timingCategory': data[2] || 'statsd',
	            'timingVar': data[3],
	            'timingValue': parseInt(data[4])
	          });
	        }
	      } else if(type === 'event' && pellet.config.gaEventTrackID !== false) {
	        if(gaEventFilterFn && (fn=pellet.instrumentation.getTransformFn(gaEventFilterFn)) && !(data = fn(data))) {
	          return;
	        }
	
	        // update the gaTrackID because
	        // getTransformFn can update the value
	        gaTrackID = data.gaTrackID;
	
	        ga(sendCmd('gaEventTrackID', gaTrackID), 'event', data);
	      } else if(type === 'routechange') {
	
	        var statusCode = (details.pipeline && details.pipeline.$ && details.pipeline.$.statusCode);
	        var url = (pellet.config.gaTrackCanonical && details.pipeline && details.pipeline.$ && details.pipeline.$.relCanonical) || details.originalUrl;
	
	        // report normal 2XX status codes, but for any other codes like
	        // 404, 500 status send them to the gaSyntheticPageUrl page for tracking
	        if(!pellet.config.gaSyntheticPageUrl || statusCode === 200) {
	          ga('set', {
	            page: url.replace(REMOVE_PROTOCOL, ''),
	            title: document.title
	          });
	        } else {
	          ga('set', {
	            page: pellet.config.gaSyntheticPageUrl + '/' + statusCode + '?url=' + url + '&refer=' + details.referrer,
	            title: document.title
	          });
	        }
	
	        ga('send', 'pageview');
	      }
	    });
	
	    next();
	  });
	}


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var pellet = __webpack_require__(2);
	
	if(true) {
	  pellet.registerInitFn(function (next) {
	
	    var _url, _filter, maxUrl;
	    var batchTimeout = null
	      , batchIndex = 0
	      , batchUrl = ''
	      , batch_n = null
	      , batch_t = null
	      , batch_s = null;
	
	    if(pellet.config && pellet.config.instrumentation) {
	      _url = pellet.config.instrumentation.url;
	      _filter = pellet.config.instrumentation.filter;
	      _batchTimeout = pellet.config.instrumentation.batchTimeout;
	
	      //
	      maxUrl = 2024 - _url.length - 100;
	
	      if(_filter) {
	        _filter = new RegExp(_filter);
	      }
	    }
	
	    function s4() {
	      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	    }
	
	    pellet.getSessionId = function(forceRegenerate) {
	      var sessionKey = pellet.config.instrumentation.cookie || '_uid';
	
	      sessionId = pellet.cookie.get(sessionKey);
	      if (!sessionId || forceRegenerate) {
	        if(pellet.config.instrumentation.lstorage) {
	          sessionId = localStorage.getItem(sessionKey);
	        }
	
	        if(!sessionId || forceRegenerate) {
	          sessionId = 'pID:' + s4() + s4() + s4() + '-' + s4();
	        }
	
	        pellet.setSessionId(sessionId, true)
	      }
	
	      return sessionId;
	    }
	
	    pellet.setSessionId = function(sessionId, force) {
	      var sessionKey = pellet.config.instrumentation.cookie || '_uid';
	
	      if(!force) {
	        var lastSessionId = pellet.getSessionId();
	        if(lastSessionId === sessionKey) {
	          return false;
	        }
	      }
	
	      if(pellet.config.instrumentation.lstorage) {
	        localStorage.setItem(sessionKey, sessionId);
	      }
	
	      pellet.cookie.set(sessionKey, sessionId);
	
	      return true;
	    }
	
	    function timeout() {
	      trackPixel = new Image(1,1);
	      trackPixel.src = _url + '?_ba=t&_cac=' + (+(new Date())) + batchUrl;
	
	      batchTimeout = null;
	      batchIndex = 0;
	      batchUrl = '';
	      batch_n = null;
	      batch_t = null;
	      batch_s = null;
	    }
	
	    pellet.instrumentation.bus.on(function (data) {
	      var sessionId = data.sessionId
	        , namespace = data.namespace
	        , payload = data.details
	        , type = data.type
	        , argCount
	        , trackPixel;
	
	      // do not send filtered types to server
	      if(_filter && !_filter.test(type)) {
	        return;
	      }
	
	      if(_url) {
	        var url = ''
	          , query = []
	          , data;
	
	        if(typeof(payload) === 'string') {
	          data = {
	            text: payload
	          }
	        } else {
	          data = Object.create(payload);
	        }
	
	        if(!sessionId) {
	          sessionId = pellet.getSessionId()
	        }
	
	        if(!_batchTimeout || batch_n !== namespace) {
	          data._n = batch_n = namespace;
	        }
	
	        if(!_batchTimeout || batch_t !== type) {
	          data._t = batch_t = type;
	        }
	
	        if(!_batchTimeout || batch_s !== sessionId) {
	          data._s = batch_s = sessionId;
	        }
	
	        argCount = 0;
	        for(i in data) {
	          if(data[i]) {
	            query.push(i + '=' + encodeURIComponent(data[i]));
	            argCount++;
	          }
	        }
	
	        if(query.length) {
	          url = query.join('&');
	        }
	
	        if(!_batchTimeout) {
	          var trackPixel = new Image(1,1);
	          trackPixel.src = _url + '?_cac=' + (+(new Date())) + '&' + url;
	          return;
	        }
	
	        if(batchUrl.length + url.length + (argCount * 4) < maxUrl) {
	          if(batchIndex === 0) {
	            batchUrl += '&' + url;
	          } else {
	            batchUrl += '&' + url.replace(/=/g, '$' + batchIndex + '=');
	          }
	
	          batchIndex++;
	        } else {
	          trackPixel = new Image(1,1);
	          trackPixel.src = _url + '?_ba=t&_cac=' + (+(new Date())) + batchUrl;
	
	          batchUrl = '';
	          batchIndex = 1;
	          batch_n = namespace;
	          batch_t = type;
	          batch_s = sessionId;
	
	          if(url.indexOf('_n=') === -1) {
	            batchUrl = '&_n=' + encodeURIComponent(batch_n);
	          }
	
	          if(url.indexOf('_t=') === -1) {
	            batchUrl += '&_t=' + encodeURIComponent(batch_t);
	          }
	
	          if(url.indexOf('_s=') === -1) {
	            batchUrl += '&_s=' + encodeURIComponent(batch_s);
	          }
	
	          batchUrl += '&' + url;
	        }
	
	        if(!batchTimeout) {
	          batchTimeout = setTimeout(timeout, _batchTimeout);
	        }
	      } else {
	        console.debug('instrument:', sessionId, type, namespace, JSON.stringify(payload));
	      }
	    });
	
	    next();
	  });
	}


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var pellet = __webpack_require__(2)
	  , pelletRender = __webpack_require__(23)
	  , isomorphicHttp = __webpack_require__(24)
	  , utils = __webpack_require__(18)
	  , routeTable = __webpack_require__(25)
	
	var runtimeIsolatedConfig = null;
	var runtimeRequestContext = null;
	if(true) {
	  runtimeIsolatedConfig = {};
	  runtimeRequestContext = {};
	}
	
	pellet.routes = new routeTable(); // TODO: pass in an options for sensitive & strict vi pellet.config
	pellet.skeletonPageRender = false;
	
	pellet.setSkeletonPage = function(templatingFn) {
	  this.skeletonPageRender = templatingFn;
	};
	
	/**
	 *
	 * @param route
	 * @param component
	 * @param options
	 */
	pellet.addComponentRoute = function(route, component, options) {
	  var _this = this;
	
	  this.routes.add(route, function() {
	    var _experiment
	      , routeContext = this
	      , _component = component
	      , renderOptions = {props:{}, isolatedConfig:runtimeIsolatedConfig, requestContext:runtimeRequestContext};
	
	    try {
	      if(false) {
	        if(options && typeof options.mode !== 'undefined') {
	          renderOptions.mode = options.mode;
	        } else {
	          //just for bots do not return react-id version (the routeContext.request comes from pellet middleware passing in the express request
	          //if (!options.mode && routeContext.request) {
	          //  if (/googlebot|gurujibot|twitterbot|yandexbot|slurp|msnbot|bingbot|rogerbot|facebookexternalhit/i.test(routeContext.request.headers['user-agent'] || '')) {
	          //    options.mode = pelletRender.MODE_STRING;
	          //  }
	          //}
	        }
	
	        // create a isomorphic http provider for the isomorphic render
	        renderOptions.http = new isomorphicHttp(
	          routeContext.request,
	          routeContext.respose,
	          routeContext.next);
	
	        renderOptions.requestContext = routeContext.request.requestContext;
	      } else {
	        // create a isomorphic http provider for the isomorphic render
	        renderOptions.http = new isomorphicHttp();
	
	        // in the browser only use the serialized date once the bootstrap
	        // call router.
	        if(window.__pellet__ctx) {
	          renderOptions.context = window.__pellet__ctx;
	          delete window.__pellet__ctx;
	
	          if(typeof(renderOptions.context) === 'string') {
	            renderOptions.context = JSON.parse(renderOptions.context);
	          }
	
	          if(typeof(renderOptions.context.requestContext) !== 'undefined') {
	            runtimeRequestContext = renderOptions.requestContext = renderOptions.context.requestContext;
	            delete renderOptions.context.requestContext;
	          }
	        }
	      }
	
	      // merge in the routes argument into the props
	      renderOptions.props.originalUrl = routeContext.originalUrl;
	      renderOptions.props.params = routeContext.params;
	      renderOptions.props.query = routeContext.query;
	      renderOptions.props.url = routeContext.url;
	
	      // now check if the route needs to unmount the page or use the default
	      // reactIgnoreRouteUnmount config value
	      if(options && typeof(options.onRouteUnmountReact) !== 'undefined') {
	        renderOptions.onRouteUnmountReact = !!options.onRouteUnmountReact;
	      } else {
	        renderOptions.onRouteUnmountReact = !pellet.config.reactIgnoreRouteUnmount;
	      }
	
	      // now check if the page component is apart of a experiment and get the correct variation
	      if((_experiment = pellet.experiment.select(_component, renderOptions.isolatedConfig, options.experimentId, renderOptions))) {
	        _component = _experiment;
	      }
	
	      // if a layout is defined we swap the component with its layout component
	      // and pass the component to the layout using layoutContent props.
	      // NOTE: _component is needed because the way the addComponentRoute closer
	      //       we do not want to over write component because the next call will
	      //       be wrong!
	      if(_component.__$layout) {
	        renderOptions.props.__layoutContent = _component;
	        _component = pellet.components[_component.__$layout];
	      }
	
	      // use pellets default locale lookup function (devs can overwrite this for custom logic)
	      renderOptions.locales = _this.suggestLocales(renderOptions, _component, options);
	
	      // now render the component (using isomorphic render)
	      pelletRender.renderComponent(_component, renderOptions, function(err, html, ctx) {
	        if(false) {
	          if(err) {
	            console.error('Error rendering component because:', err.message);
	            routeContext.next(err);
	            return;
	          }
	
	          if(!routeContext.respose.getHeader('Content-Type')) {
	            routeContext.respose.setHeader('Content-Type', 'text/html');
	          }
	
	          // add user-agent hash and the build number to the render options to help with cache control
	          renderOptions.ushash = utils.djb2(routeContext.request.headers['user-agent']||'').toString(32);
	          renderOptions.manifest = pellet.options.manifest;
	
	          if(_this.skeletonPageRender) {
	            html = _this.skeletonPageRender(html, ctx, renderOptions);
	          }
	
	          // if expressjs or nodejs
	          if(routeContext.respose.status) {
	            routeContext.respose.send(html);
	          } else {
	            routeContext.respose.end(html);
	          }
	
	        } else {
	          if(err) {
	            console.error('Error trying to render because:', err.message, err.stack);
	          }
	        }
	
	        // now instrument the route change so pageviews can be tracked
	        pellet.instrumentation.emit('routechange', {
	          originalUrl: renderOptions.props.originalUrl,
	          params: renderOptions.props.params,
	          query: renderOptions.props.query,
	          url: renderOptions.props.url,
	          pipeline: ctx
	        });
	
	      });
	    } catch(ex) {
	      console.error('Error trying to render because:', ex.message, ex.stack);
	      if(false) {
	        routeContext.next(ex);
	      }
	    }
	  }, options);
	};
	
	if(false) {
	  // SERVER ENVIRONMENT
	  // add our basic routing middleware
	
	  pellet.middlewareStack.push({
	    priority: 10,
	    fn: function (req, res, next) {
	      var match = pellet.routes.parse(req.originalUrl);
	      if (!match) {
	        return next();
	      }
	
	      match.request = req;
	      match.respose = res;
	      match.next = next;
	
	      match.fn.call(match);
	    }
	  });
	} else if(true) {
	  // BROWSER ENVIRONMENT
	  // bootstrap the browser environment but triggering the route
	  // the page was loaded and replay the events on the server
	  // render.
	
	  pellet.onReady(function() {
	    var match = pellet.routes.parse(location.pathname + location.search);
	    if(match && match.fn) {
	      match.fn.call(match);
	    }
	  });
	
	  var currentLocation = location.pathname + location.search;
	  function navigate(newLocation, match) {
	    console.debug('pellet navigate(', newLocation, ')');
	    if (newLocation === currentLocation) {
	      return;
	    }
	
	    currentLocation = newLocation;
	
	    if(!match) {
	      match = pellet.routes.parse(newLocation);
	    }
	
	    if(match) {
	      console.debug('pellet matched route', newLocation);
	      match.fn.call(match);
	    } else {
	      console.error('Can not find route for:', newLocation);
	      window.location = newLocation;
	    }
	  };
	
	  pellet.addWindowOnreadyEvent(function() {
	    // handle back and forward button requests
	    window.addEventListener('popstate', function() {
	      navigate(location.pathname + location.search);
	    });
	  });
	
	  pellet.setLocation = function(url, title, data) {
	    if(!url) {
	      return
	    }
	
	    var match = pellet.routes.parse(url);
	    if(!match) {
	      console.debug('set via window.location')
	      window.location = url;
	      return;
	    }
	
	    console.debug('set via window.history.pushState')
	    window.history.pushState(data || null, title || '', url);
	    navigate(url);
	  }
	
	  document.addEventListener('click', function(e) {
	    var node = e.target;
	    while(node) {
	      if (node.nodeName == 'A') {
	
	        if (node.hasAttribute('data-stop-propagation')) {
	          e.stopPropagation();
	          e.preventDefault();
	          return;
	        }
	
	        if (node.getAttribute('data-external-link') == 'true') {
	          return;
	        }
	
	        if(node.target && node.target != '_self') {
	          return;
	        }
	
	        var href = node.getAttribute('href');
	        if(!href) {
	          return;
	        }
	
	        var match = pellet.routes.parse(href);
	        if(!match) {
	          return;
	        }
	
	        e.stopPropagation();
	        e.preventDefault();
	
	        window.history.pushState(null, '', href);
	        navigate(href, match);
	      }
	
	      node = node.parentNode;
	    }
	  });
	}


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var pellet = __webpack_require__(2);
	
	function gaExperiment(experiments, config) {
	  this.experiments = experiments;
	  this.allVariations = (config && config.config) || {};
	  this.instrument = pellet.instrumentation.namespace('ga_experiment');
	  this.variationCache = {};
	}
	
	gaExperiment.prototype.select = function(name, ctx, experimentId, _renderOptions) {
	  var i, type, choice, version, allExperiments;
	
	  if(name === null) {
	    return;
	  }
	
	  // find out the name's type. It can be a component
	  // or a string if the format of '@component' or
	  // '=variationValue' or just a string
	  if(typeof name === 'function') {
	    // look up the component's version/key
	    for(i in pellet.components) {
	      if(pellet.components[i] === name) {
	        name = i;
	        break;
	      }
	    }
	
	    // if not found return undefined
	    if(typeof name === 'function') {
	      return;
	    }
	
	    name = name.substring(0, name.indexOf('@'));
	    type = 1;
	  } else if(typeof name !== 'string') {
	    console.warn('GA experiment: invalid version experiment:', experimentId, 'type:', typeof name, 'name:', name);
	    this.instrument.increment(experimentId + '.missing_component');
	    throw new Error('invalid experiment version type');
	  } else {
	    if (name[0] === '@') {
	      type = 1;
	      name = name.substring(1);
	    } else if (name[0] === '=') {
	      type = 2;
	      name = name.substring(1);
	    }
	
	    if (!name) {
	      return;
	    }
	
	    // if the key has a version use the specified version
	    // and ignore the experiment version
	    if (type !== 2 && name.indexOf('@') !== -1) {
	      return pellet.components[name];
	    }
	
	    if (type !== 1 && (i = name.indexOf('=')) !== -1) {
	      return name.substring(i + 1);
	    }
	  }
	
	  if(type === 1) {
	    allExperiments = this.allVariations['@'+name];
	  } else if(type === 2) {
	    allExperiments = this.allVariations['='+name];
	  } else {
	    if((allExperiments = this.allVariations['@'+name])) {
	      type = 1;
	    } else if((allExperiments = this.allVariations['='+name])) {
	      type = 2;
	    }
	  }
	
	  // if no experiment data try to find the
	  // default component or the variation value
	  if(!allExperiments) {
	    if(type === 1) return pellet.components[name];
	    else if(type === 2) return name;
	    return pellet.components[name] || name;
	  }
	
	  if(typeof experimentId === 'string') {
	    if(!allExperiments[experimentId]) {
	      console.warn('Cannot find component for experiment', experimentId, 'its missing from our variations list', allExperiments);
	      this.instrument.increment(experimentId+'.missing_component');
	
	      if(type === 1) return pellet.components[name];
	      else if(type === 2) return name;
	      return pellet.components[name] || name;
	    }
	
	    version = this.getVariation(experimentId);
	    choice = allExperiments[experimentId][version];
	
	  } else {
	    for(i in allExperiments) {
	      version = this.getVariation(i);
	      version = allExperiments[i][version];
	
	      if(choice && choice !== version) {
	        console.warn('Ambiguous experiment cannot pick component because to many:', name, 'in', allExperiments);
	        this.instrument.increment(allExperiments[i]+'.ambiguous');
	      }
	
	      choice = version;
	    }
	  }
	
	  if(type === 1) {
	    version = pellet.components[name+'@'+choice];
	  } else if(type === 2) {
	    version = choice;
	  } else {
	    version = pellet.components[name+'@'+choice] || name;
	  }
	
	  if(!version) {
	    console.error('Cannot find component ', name, 'for choice', choice, 'because component not in manifest');
	    this.instrument.increment((experimentId||'NA')+'.missing_component_choice');
	    return pellet.components[name];
	  }
	
	  return version;
	}
	
	/**
	 *
	 * @param experimentId
	 * @return {*} null if not participating, else 0-n
	 */
	gaExperiment.prototype.getVariation = function(experimentId) {
	  if(experimentId in this.variationCache) {
	    console.debug('experiment: using cache');
	    return this.variationCache[experimentId];
	  }
	
	  var variation = cxApi.getChosenVariation(experimentId);
	  if (variation === cxApi.NO_CHOSEN_VARIATION) {
	    console.debug('experiment:', experimentId, 'NO_CHOSEN_VARIATION');
	    variation = cxApi.chooseVariation(experimentId);
	    cxApi.setChosenVariation(variation, experimentId);
	
	    this.variationCache[experimentId] = variation;
	
	    this.instrument.increment(experimentId+'.pick.'+variation);
	  } else if (variation === cxApi.NOT_PARTICIPATING) {
	    // not A/B testing
	    console.debug('experiment:', experimentId, 'NOT_PARTICIPATING');
	    this.instrument.increment(experimentId+'.not_participating');
	    return null;
	  }
	
	  console.debug('experiment:', experimentId, 'using variation:', variation);
	  return variation;
	}
	
	// Do not run GA experiments on SERVER
	// only on the client.
	if(true) {
	  // wait for pellet to be initialized because
	  // __pellet_gaExperiments is async loaded
	  pellet.onReady(function () {
	    pellet.setExperimentInterface(new gaExperiment(window.__pellet_gaExperiments, pellet.__gaExperimentConfig));
	  });
	}


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(16)
	  , abnDashboardJade = __webpack_require__(31)
	  , pellet = __webpack_require__(2);
	
	module.exports = abnDashboardComponent = pellet.createClass({
	  /*,
	  componentWillMount: function() {
	  },
	  componentDidMount: function(nextProps) {
	  },
	  componentWillReceiveProps: function(nextProps) {
	  },
	  shouldComponentUpdate: function(nextProps, nextState) {
	  },
	  componentWillUpdate: function(nextProps, nextState) {
	  },
	  componentDidUpdate: function(prevProps, prevState) {
	  },
	  componentWillUnmount: function(nextProps, nextState) {
	  },
	  */
	
	  routes: pellet.config.abnDashboardUrl,
	  //layoutTemplate: "vevoWebLayout",
	
	  componentConstruction: function(options, next) {
	    this.addToHead('meta', {name:'robots', content:'noindex, nofollow'});
	
	
	    next();
	  },
	
	  getInitialState: function() {
	    return {
	      activeExperiment: -1,
	      message: null
	    };
	  },
	
	  setVariation: function(id) {
	    id = parseInt(id);
	    cxApi.setChosenVariation(id, this.state.activeExperiment);
	    this.setState({
	      message: 'saved variation change'
	    });
	
	    ga('send', 'pageview', document.location.pathname);
	  },
	
	  showExperiment : function(id) {
	    this.setState({
	      activeExperiment: id
	    });
	  },
	
	  render: function() {
	    if(this.state.message) {
	      var self = this;
	      setTimeout(function() {
	        self.setState({
	          message: null
	        });
	      }, 2000);
	    }
	
	    return abnDashboardJade(this);
	  }
	});


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(16)
	  , indexJade = __webpack_require__(33)
	  , pellet = __webpack_require__(2);
	
	module.exports = indexPage = pellet.createClass({
	  /*
	  componentConstruction: function(options, next) {
	    this.set({val:'val'}); // serialized to the broswer from the server render
	    this.setProps({val:'val'}); // set props passed to getInitialState
	
	    next();
	  },
	  getInitialState: function() {
	    return {};
	  },
	  componentWillMount: function() {
	  },
	  componentDidMount: function(nextProps) {
	  },
	  componentWillReceiveProps: function(nextProps) {
	  },
	  shouldComponentUpdate: function(nextProps, nextState) {
	  },
	  componentWillUpdate: function(nextProps, nextState) {
	  },
	  componentDidUpdate: function(prevProps, prevState) {
	  },
	  componentWillUnmount: function(nextProps, nextState) {
	  },
	  */
	
	// layoutTemplate: "{name_of_your_layout_in_the_manifest}",
	  
	  routes: ["/", "/index"],
	  
	
	  render: function() {
	    return indexJade(this);
	  }
	});


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(16)
	  , aboutJade = __webpack_require__(32)
	  , pellet = __webpack_require__(2);
	
	module.exports = aboutPage = pellet.createClass({
	  /*
	  componentConstruction: function(options, next) {
	    this.set({val:'val'}); // serialized to the broswer from the server render
	    this.setProps({val:'val'}); // set props passed to getInitialState
	
	    next();
	  },
	  getInitialState: function() {
	    return {};
	  },
	  componentWillMount: function() {
	  },
	  componentDidMount: function(nextProps) {
	  },
	  componentWillReceiveProps: function(nextProps) {
	  },
	  shouldComponentUpdate: function(nextProps, nextState) {
	  },
	  componentWillUpdate: function(nextProps, nextState) {
	  },
	  componentDidUpdate: function(prevProps, prevState) {
	  },
	  componentWillUnmount: function(nextProps, nextState) {
	  },
	  */
	
	 layoutTemplate: "layout1",
	  
	  routes: "/about",
	  
	
	  render: function() {
	    return aboutJade(this);
	  }
	});


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(16)
	  , helloJade = __webpack_require__(34)
	  , pellet = __webpack_require__(2);
	
	module.exports = helloPage = pellet.createClass({
	  /*
	  componentConstruction: function(options, next) {
	    this.set({val:'val'}); // serialized to the broswer from the server render
	    this.setProps({val:'val'}); // set props passed to getInitialState
	
	    next();
	  },
	  getInitialState: function() {
	    return {};
	  },
	  componentWillMount: function() {
	  },
	  componentDidMount: function(nextProps) {
	  },
	  componentWillReceiveProps: function(nextProps) {
	  },
	  shouldComponentUpdate: function(nextProps, nextState) {
	  },
	  componentWillUpdate: function(nextProps, nextState) {
	  },
	  componentDidUpdate: function(prevProps, prevState) {
	  },
	  componentWillUnmount: function(nextProps, nextState) {
	  },
	  */
	
	  getInitialState: function() {
	    return {
	      count: 0
	    };
	  },
	
	  add: function(){
	    this.setState({count: this.state.count+1});
	  },
	
	  layoutTemplate: "layout1",
	  
	  routes: "/hello/:name",
	  
	
	  render: function() {
	    return helloJade(this);
	  }
	});


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(16)
	  , layout1Jade = __webpack_require__(35)
	  , pellet = __webpack_require__(2);
	
	module.exports = layout1Layout = pellet.createClass({
	  componentConstruction: function(options, next) {
	
	    // if the layout does not have state you skip
	    // creating the namespace
	    var ns = this.namespace("content")
	    ns.setProps({
	        originalUrl: this.props.originalUrl,
	        params: this.props.params,
	        query: this.props.query,
	        url: this.props.url
	    });
	
	    this.setProps({
	      layoutContent: this.props.__layoutContent
	    });
	
	    // now forward the layout main context's component construction data
	    ns.addChildComponent(false, this.props.__layoutContent, options, next);
	  },
	
	  /*
	  getInitialState: function() {
	    return {};
	  },
	  componentWillMount: function() {
	  },
	  componentDidMount: function(nextProps) {
	  },
	  componentWillReceiveProps: function(nextProps) {
	  },
	  shouldComponentUpdate: function(nextProps, nextState) {
	  },
	  componentWillUpdate: function(nextProps, nextState) {
	  },
	  componentDidUpdate: function(prevProps, prevState) {
	  },
	  componentWillUnmount: function(nextProps, nextState) {
	  },
	  */
	
	  render: function() {
	    this.layoutContent = React.createElement(this.props.layoutContent, this.props.content);
	    return layout1Jade(this);
	  }
	});


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(16)
	  , messageJade = __webpack_require__(36)
	  , pellet = __webpack_require__(2);
	
	module.exports = messageComponent = pellet.createClass({
	  /*
	  componentConstruction: function(options, next) {
	    this.set({val:'val'}); // serialized to the broswer from the server render
	    this.setProps({val:'val'}); // set props passed to getInitialState
	
	    next();
	  },
	  getInitialState: function() {
	    return {};
	  },
	  componentWillMount: function() {
	  },
	  componentDidMount: function(nextProps) {
	  },
	  componentWillReceiveProps: function(nextProps) {
	  },
	  shouldComponentUpdate: function(nextProps, nextState) {
	  },
	  componentWillUpdate: function(nextProps, nextState) {
	  },
	  componentDidUpdate: function(prevProps, prevState) {
	  },
	  componentWillUnmount: function(nextProps, nextState) {
	  },
	  */
	
	  render: function() {
	    return messageJade(this);
	  }
	});


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var index = {};index["about@0.0.0"] = __webpack_require__(11);index["hello@0.0.0"] = __webpack_require__(12);index["layout1@0.0.0"] = __webpack_require__(13);index["message@0.0.0"] = __webpack_require__(14);index["secondProject@0.0.0"] = __webpack_require__(10);index["intl@0.0.0"] = __webpack_require__(26);index["pelletABNDashboard@0.0.0"] = __webpack_require__(9);__webpack_require__(2).loadManifestComponents(index);

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = React;

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	kefir = __webpack_require__(41)
	
	/**
	 *
	 * @param obs
	 * @param _owner is the default sender for all messages
	 */
	function autoRelease(obs, owner, isolatedConfig) {
	  this.children = [];
	  this.refEnd = [];
	  this.refValue = [];
	  this.refBoth = [];
	  this.refLog = [];
	
	  this.owner = owner;
	  this.isolatedConfig = isolatedConfig;
	
	  if(obs instanceof autoRelease) {
	    this.__obs = obs.__obs;
	  } else if(obs) {
	    this.__obs = obs;
	  } else {
	    this.__obs = kefir.emitter();
	  }
	}
	
	autoRelease.prototype.AUTO_RELEASE_EMITED = kefir.AUTO_RELEASE_EMITED = 1;
	autoRelease.prototype.AUTO_RELEASE_ENDED = kefir.AUTO_RELEASE_ENDED = 2;
	autoRelease.prototype.AUTO_RELEASE_BOTH = kefir.AUTO_RELEASE_BOTH = 3;
	
	autoRelease.prototype.map = function(a) {var ret; this.children.push(ret = new autoRelease(this.__obs.map(a), this.owner, this.isolatedConfig)); return ret;};
	autoRelease.prototype.mapTo = function(a) {var ret; this.children.push(ret = new autoRelease(this.__obs.mapTo(a), this.owner, this.isolatedConfig)); return ret;};
	autoRelease.prototype.pluck = function(a) {var ret; this.children.push(ret = new autoRelease(this.__obs.pluck(a), this.owner, this.isolatedConfig)); return ret;};
	autoRelease.prototype.invoke = function(a) {var ret; this.children.push(ret = new autoRelease(this.__obs.invoke(a), this.owner, this.isolatedConfig)); return ret;};
	autoRelease.prototype.not = function() {var ret; this.children.push(ret = new autoRelease(this.__obs.not(), this.owner, this.isolatedConfig)); return ret;};
	autoRelease.prototype.timestamp = function() {var ret; this.children.push(ret = new autoRelease(this.__obs.timestamp(), this.owner, this.isolatedConfig)); return ret;};
	autoRelease.prototype.tap = function(a) {var ret; this.children.push(ret = new autoRelease(this.__obs.tap(a), this.owner, this.isolatedConfig)); return ret;};
	autoRelease.prototype.filter = function(a) {var ret; this.children.push(ret = new autoRelease(this.__obs.filter(a), this.owner, this.isolatedConfig)); return ret;};
	autoRelease.prototype.take = function(a) {var ret; this.children.push(ret = new autoRelease(this.__obs.take(a), this.owner, this.isolatedConfig)); return ret;};
	autoRelease.prototype.takeWhile = function(a) {var ret; this.children.push(ret = new autoRelease(this.__obs.takeWhile(a), this.owner, this.isolatedConfig)); return ret;};
	autoRelease.prototype.skip = function(a) {var ret; this.children.push(ret = new autoRelease(this.__obs.skip(a), this.owner, this.isolatedConfig)); return ret;};
	autoRelease.prototype.skipWhile = function(a) {var ret; this.children.push(ret = new autoRelease(this.__obs.skipWhile(a), this.owner, this.isolatedConfig)); return ret;};
	autoRelease.prototype.skipDuplicates = function(a) {var ret; this.children.push(ret = new autoRelease(this.__obs.skipDuplicates(a), this.owner, this.isolatedConfig)); return ret;};
	autoRelease.prototype.diff = function(a,b) {var ret; this.children.push(ret = new autoRelease(this.__obs.diff(a,b), this.owner, this.isolatedConfig)); return ret;};
	autoRelease.prototype.scan = function(a,b) {var ret; this.children.push(ret = new autoRelease(this.__obs.scan(a,b), this.owner, this.isolatedConfig)); return ret;};
	autoRelease.prototype.reduce = function(a,b) {var ret; this.children.push(ret = new autoRelease(this.__obs.reduce(a,b), this.owner, this.isolatedConfig)); return ret;};
	autoRelease.prototype.slidingWindow = function(a,b) {var ret; this.children.push(ret = new autoRelease(this.__obs.slidingWindow(a,b), this.owner, this.isolatedConfig)); return ret;};
	autoRelease.prototype.delay = function(a) {var ret; this.children.push(ret = new autoRelease(this.__obs.delay(a), this.owner, this.isolatedConfig)); return ret;};
	autoRelease.prototype.throttle = function(a,b) {var ret; this.children.push(ret = new autoRelease(this.__obs.throttle(a,b), this.owner, this.isolatedConfig)); return ret;};
	autoRelease.prototype.debounce = function(a,b) {var ret; this.children.push(ret = new autoRelease(this.__obs.debounce(a,b), this.owner, this.isolatedConfig)); return ret;};
	autoRelease.prototype.flatten = function(a) {var ret; this.children.push(ret = new autoRelease(this.__obs.flatten(a), this.owner, this.isolatedConfig)); return ret;};
	autoRelease.prototype.transduce = function(a) {var ret; this.children.push(ret = new autoRelease(this.__obs.transduce(a), this.owner, this.isolatedConfig)); return ret;};
	autoRelease.prototype.withHandler = function(a) {var ret; this.children.push(ret = new autoRelease(this.__obs.withHandler(a), this.owner, this.isolatedConfig)); return ret;};
	autoRelease.prototype.toProperty = function(a) {var ret; this.children.push(ret = new autoRelease(this.__obs.toProperty(a), this.owner, this.isolatedConfig)); return ret;};
	autoRelease.prototype.changes = function() {var ret; this.children.push(ret = new autoRelease(this.__obs.changes(), this.owner, this.isolatedConfig)); return ret;};
	autoRelease.prototype.flatMap = function(a) {var ret; this.children.push(ret = new autoRelease(this.__obs.flatMap(a), this.owner, this.isolatedConfig)); return ret;};
	autoRelease.prototype.flatMapLatest = function(a) {var ret; this.children.push(ret = new autoRelease(this.__obs.flatMapLatest(a), this.owner, this.isolatedConfig)); return ret;};
	autoRelease.prototype.flatMapFirst = function(a) {var ret; this.children.push(ret = new autoRelease(this.__obs.flatMapFirst(a), this.owner, this.isolatedConfig)); return ret;};
	autoRelease.prototype.flatMapConcat = function(a) {var ret; this.children.push(ret = new autoRelease(this.__obs.flatMapConcat(a), this.owner, this.isolatedConfig)); return ret;};
	autoRelease.prototype.flatMapConcurLimit = function(a,b) {var ret; this.children.push(ret = new autoRelease(this.__obs.flatMapConcurLimit(a,b), this.owner, this.isolatedConfig)); return ret;};
	autoRelease.prototype.awaiting = function(a) {var ret; this.children.push(ret = new autoRelease(this.__obs.awaiting(a), this.owner, this.isolatedConfig)); return ret;};
	autoRelease.prototype.filterBy = function(a) {var ret; this.children.push(ret = new autoRelease(this.__obs.filterBy(a), this.owner, this.isolatedConfig)); return ret;};
	
	// need to add combine, and, or
	
	autoRelease.prototype.emit = function(a, sender, isolatedConfig) {
	  var _sender = sender || this.owner;
	  var _isolatedConfig = isolatedConfig || this.isolatedConfig;
	  if(_sender) {
	    this.__obs.emit({sender:_sender, ctx: _isolatedConfig, event:a});
	  } else {
	    this.__obs.emit(a);
	  }
	
	  return this;
	}
	
	autoRelease.prototype.end = function() {
	  this.__obs.end();
	  return this;
	}
	
	autoRelease.prototype.on = function(fn, rawEvent, type) {
	  var _fn;
	  if(!rawEvent) {
	    _fn = function(data) {
	      return fn(data.event);
	    }
	  } else {
	    _fn = fn;
	  }
	
	  if(type === kefir.AUTO_RELEASE_ENDED) {
	    this.refEnd.push(_fn);
	    this.__obs.onEnd(_fn);
	  } else if(type === kefir.AUTO_RELEASE_BOTH) {
	    this.refBoth.push(_fn);
	    this.__obs.onAny(_fn);
	  } else {
	    this.refValue.push(_fn);
	    this.__obs.onValue(_fn);
	  }
	
	  return this;
	}
	
	autoRelease.prototype.log = function(name) {
	  this.refLog.push(name);
	  this.__obs.log(name);
	  return this;
	}
	
	autoRelease.prototype.release = function() {
	  var i;
	  for(i in this.children) {
	    this.children[i].release();
	  }
	
	  for(i in this.refValue) {
	    this.__obs.offValue(this.refValue[i]);
	  }
	
	  for(i in this.refBoth) {
	    this.__obs.offAny(this.refBoth[i]);
	  }
	
	  for(i in this.refEnd) {
	    this.__obs.offEnd(this.refEnd[i]);
	  }
	
	  for(i in this.refLog) {
	    this.__obs.offLog(this.refLog[i]);
	  }
	
	  this.children = [];
	  this.refValue = [];
	  this.refBoth = [];
	  this.refEnd = [];
	  this.refLog = [];
	}
	
	kefir.autoRelease = autoRelease;
	
	module.exports = kefir;


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Pellet's common utilities
	 *
	 * @namespace utils
	 */
	
	var exports = module.exports = {
	  noop: function() {},
	
	  /**
	   *
	   * @memberof utils
	   * @param input
	   * @returns {Object}
	   */
	  camelcase: function (input) {
	    return input.split(/[^A-Za-z0-9_]+/).reduce(function (str, word) {
	      return str + word[0].toUpperCase() + word.slice(1);
	    });
	  },
	
	  /**
	   * Hash a string using djb2
	   *
	   * @memberof utils
	   * @param str
	   * @returns {number}
	   */
	  djb2: function(str) {
	    var hash = 5381, i = str.length;
	
	    while(i) {
	      hash = (hash * 33) ^ str.charCodeAt(--i);
	    }
	
	    return hash >>> 0;
	  },
	
	  /**
	   * Hash a object is a safe way that ignores key order
	   *
	   * @memberof utils
	   * @param obj
	   * @param options
	   *   ignoreArrayOrder:
	   * @returns {number}
	   */
	  hashObject: function(obj, options) {
	    var hash = 5381;
	
	    function walkArray(obj) {
	      var val, j = obj.length;
	
	      if(options && options.ignoreArrayOrder) {
	        var sorted = [];
	        while (j--) {
	          sorted[j] = exports.hashObject(obj[j], options);
	        }
	
	        val = sorted.sort().toString();
	
	        j = val.length;
	        while (j) {
	          hash = (hash * 33) ^ val.charCodeAt(--j);
	        }
	      } else {
	        while (j--) {
	          walk(obj[j]);
	        }
	      }
	    }
	
	    function walk(obj) {
	      var i, j, val, keys, type;
	
	      type = typeof(obj);
	      if(type === 'object' && obj !== null) {
	        if (Array.isArray(obj)) {
	          walkArray(obj);
	          return;
	        }
	
	        keys = Object.keys(obj);
	        i = keys.length;
	        keys.sort();
	      }
	
	      // we are a primitive or empty obj like Regex, Date, null, undefined, etc.
	      if(!i) {
	        val = type + (obj && obj.toString());
	        j = val.length;
	        while (j) {
	          hash = (hash * 33) ^ val.charCodeAt(--j);
	        }
	        return;
	      }
	
	      if (i = keys.length) {
	        while (i--) {
	          // now add the key to the hash
	          val = keys[i];
	          j = val.length;
	          while (j) {
	            hash = (hash * 33) ^ val.charCodeAt(--j);
	          }
	
	          walk(obj[keys[i]]);
	        }
	      }
	    }
	
	    walk(obj);
	
	    return hash >>> 0;
	  },
	
	  /**
	   * Order an array so the order will not effect the hash of
	   * the object. This is done via sorting the array values
	   * perdurable by their own hash.
	   *
	   * Use case:
	   *   When hashing an object that needs to be sorted in a cache
	   *   but the array order is not important, but you do not want
	   *   to change the hash.
	   *
	   * @memberof utils
	   * @param arr
	   * @return {Array}
	   */
	  makeArrayHashSafe: function(arr) {
	    return arr.sort(function(a, b) {
	      exports.hashObject(a) - exports.hashObject(b);
	    });
	  },
	
	  /**
	   *
	   * @memberof utils
	   * @param one
	   * @param two
	   * @returns {Function}
	   */
	  createChainedFunction: function (one, two) {
	    return function chainedFunction() {
	      one.apply(this, arguments);
	      two.apply(this, arguments);
	    };
	  },
	
	  /**
	   *
	   * @memberof utils
	   * @param dest
	   * @param src
	   * @param ignoreSpec
	   * @param singleSpec array of
	   */
	  mixInto: function (dest, src, ignoreSpec, chainableSpec) {
	    Object.keys(src).forEach(function (prop) {
	      if (ignoreSpec && -1 !== ignoreSpec.indexOf(prop)) {
	        return;
	      }
	
	      if (chainableSpec && chainableSpec.indexOf(prop) !== -1) {
	        if (!dest[prop]) {
	          dest[prop] = src[prop];
	        } else {
	          dest[prop] = exports.createChainedFunction(dest[prop], src[prop]);
	        }
	      } else {
	        if (!dest[prop]) {
	          dest[prop] = src[prop];
	        } else {
	          throw new Error('Mixin property collision for property "' + prop + '"');
	        }
	      }
	    });
	  },
	
	  /**
	   * deep merge/copy objects into a single union object
	   *
	   * @memberof utils
	   * @param objects
	   * @param result
	   * @param options
	   *   deleteUndefined
	   *   arrayCopyMode 0 = replace, 1=copy, 2=join/copy
	   *   noneCopyTypes array of types like RegExp, Date
	   *   refCopy - will make a ref to the source node if the target node is undefined or a non object type. If object type keep walking to and until endpoint.
	   */
	  objectUnion: function(objects, result, options, inRecursiveLoop) {
	    var i, j, obj, val;
	
	  // todo: this is SLOW! I need to rethink this and make it faster!
	
	    var delUndefined = false
	      , noneCopyTypes = false
	      , refCopy = false
	      , arrayCopyMode = 0;
	
	    if(!result || typeof objects !== 'object') {
	      throw new Error('both objects and result are required')
	    }
	
	    if(options) {
	      delUndefined = !!options.deleteUndefined;
	      if(typeof options.arrayCopyMode !== 'undefined') {
	        arrayCopyMode = options.arrayCopyMode;
	      }
	
	      if(typeof options.noneCopyTypes !== 'undefined') {
	        noneCopyTypes = options.noneCopyTypes;
	      }
	
	      if(typeof options.refCopy !== 'undefined') {
	        refCopy = options.refCopy;
	      }
	    }
	
	    if(!inRecursiveLoop && Array.isArray(objects)) {
	      inRecursiveLoop = -1;
	    }
	
	    for(i in objects) {
	      obj = objects[i];
	
	      if(obj && typeof obj === 'object') {
	        for (j in obj) {
	          val = obj[j];
	
	          if(typeof(val) === 'object' && val !== null) {
	            if(Array.isArray(val)) {
	              if(arrayCopyMode === 1) {
	                result[j] = [].concat(val);
	              } else if(arrayCopyMode === 2) {
	                if(!Array.isArray(result[j])) {
	                  if(typeof(result[j]) !== 'undefined') {
	                    result[j] = [result[j]].concat(val);
	                  } else {
	                    result[j] = [].concat(val);
	                  }
	                } else {
	                  result[j] = result[j].concat(val);
	                }
	              } else {
	                result[j] = val;
	              }
	
	              continue;
	            } else if(noneCopyTypes) {
	              if(noneCopyTypes.filter(function(type) {return val instanceof type}).length) {
	                result[j] = val;
	                continue;
	              }
	            }
	
	            if(typeof result[j] !== 'object') {
	              if(!refCopy) {
	                result[j] = {};
	              } else {
	                result[j] = val;
	                continue;
	              }
	            }
	
	            exports.objectUnion([val], result[j], options, true);
	          } else if(delUndefined && typeof(val) === 'undefined') {
	            delete result[j];
	          } else {
	            result[j] = val;
	          }
	        }
	      } else {
	        if(inRecursiveLoop === -1) {
	          throw new Error('cannot merge non object types');
	        }
	
	        result[i] = obj;
	      }
	    }
	  }
	};


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var observables = __webpack_require__(17)
	  , utils = __webpack_require__(18);
	
	var emitterConstructor = new observables.emitter()
	  , emitterConstructor = emitterConstructor.constructor;
	
	function isolator(path, type, id, isolatedConfig) {
	  this._emitters = {};
	  this._releaseList = {};
	  this.isolatedConfig = isolatedConfig || {};
	
	  this._id = {
	    id: (id || this),
	    path: (path || '/')
	  };
	
	  if(type) {
	    this._id.type = type;
	  }
	}
	
	isolator.prototype.updateIsolatedConfig = function(config) {
	  utils.objectUnion([config], this.isolatedConfig); //todo: need to set options!
	}
	
	isolator.prototype.createChild = function(isolatedConfig) {
	  var proxy = Object.create(this);
	  proxy._releaseList = {};
	  this._releaseList['_$' + Object.keys(this._releaseList).length] = proxy;
	
	  if(isolatedConfig) {
	    // ??? if we merge in the values
	    proxy.isolatedConfig = isolatedConfig;
	  }
	
	  // todo: update this this._id with more info (need to copy this._id because parent need its own copy
	
	  return proxy;
	}
	
	isolator.prototype.event = function(name, isolated) {
	  var emitter, autoRelease;
	
	  if(autoRelease = this._releaseList[name]) {
	    if(autoRelease instanceof observables.autoRelease) {
	      return autoRelease;
	    }
	
	    // throw because the key already exists and is not an emitter. this is most
	    // likely because we have a coordinator with that name or name is _$..
	    throw new Error('Conflict with existing key');
	  }
	
	  emitter = this._emitters[name];
	  if(!emitter) {
	    emitter = this._emitters[name] = observables.emitter();
	  }
	
	  autoRelease = new observables.autoRelease(emitter, this._id, this.isolatedConfig);
	  this._releaseList[name] = autoRelease;
	
	  if(isolated) {
	    var _this = this;
	    return autoRelease.filter(function(data) {
	      if(!data.ctx || !_this.isolatedConfig) {
	        return false;
	      }
	
	      return data.ctx === _this.isolatedConfig;
	    });
	  }
	
	  return autoRelease;
	}
	
	isolator.prototype.makeProperty = function(event, name, current, isolate) {
	  var emitter, autoRelease;
	
	  if(autoRelease = this._releaseList[name]) {
	    if(autoRelease instanceof observables.autoRelease) {
	      return autoRelease;
	    }
	
	    // throw because the key already exists and is not an emitter. this is most
	    // likely because we have a coordinator with that name or name is _$..
	    throw new Error('Conflict with existing key');
	  }
	
	  if(!(event instanceof observables.autoRelease)) {
	    if(!(event = this._emitters[event])) {
	      throw new Error('Unknown base event to build property from');
	    }
	  }
	
	  emitter = this._emitters[name];
	  if(!emitter) {
	    emitter = this._emitters[name] = event.toProperty({sender:this._id, event:current});
	  }
	
	  autoRelease = new observables.autoRelease(emitter, this._id);
	  this._releaseList[name] = autoRelease;
	
	  return autoRelease;
	}
	
	isolator.prototype.registerEmitter = function(name, emitter) {
	  if(this._releaseList[name]) {
	    // throw because the key already exists
	    throw new Error('Conflict with existing key');
	  }
	
	  if(emitter instanceof observables.autoRelease) {
	    this._emitters[name] = emitter.__obs;
	    this._releaseList[name] = emitter;
	  } else if(emitter instanceof emitterConstructor) {
	    this._emitters[name] = emitter;
	    this._releaseList[name] = emitter = new observables.autoRelease(emitter, this._id);
	  } else {
	    throw new Error('Cannot register a non emitter/autorelease');
	  }
	
	  return emitter;
	}
	
	isolator.prototype.coordinator = function(name, type) {
	  var instance = this._releaseList[name];
	  if(instance) {
	    if(instance instanceof isolator) {
	      return instance;
	    }
	
	    // throw because the key already exists and is not an coordinator. this is most
	    // likely because we have a event with that name or name is _$..
	    throw new Error('Conflict with existing key');
	  }
	
	  // NOTE: require('./pellet') is required to work around a webpack load order
	  // pellet.js loads this file so we need to lazy get pellet to have full init
	  // version.
	  instance = __webpack_require__(2).getCoordinator(name, type);
	  this._releaseList[name] = instance = instance.createChild(this.isolatedConfig);
	
	  return instance;
	}
	
	/**
	 * release only the observables but the emit will remain
	 */
	isolator.prototype.release = function() {
	  for(var i in this._releaseList) {
	    this._releaseList[i].release();
	  }
	
	  this._releaseList = {};
	}
	
	module.exports = isolator;


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var react = __webpack_require__(16)
	  , isolator = __webpack_require__(19);
	
	var spec = {
	  requestContext: react.PropTypes.object,
	  rootIsolator: react.PropTypes.instanceOf(isolator),
	  locales: react.PropTypes.oneOfType([
	    react.PropTypes.string,
	    react.PropTypes.array
	  ])
	};
	
	module.exports = {
	  contextTypes     : spec,
	  childContextTypes: spec,
	
	  getInitialState: function() {
	    // create a local  instrument with our isolatedConfig. This is like having our own constructor
	    this.instrument = __webpack_require__(2).instrumentation.addIsolatedConfig(this.context.rootIsolator.isolatedConfig);
	    return (this.props && this.props.__initState) || {};
	  },
	
	  event: function(name) {
	    if(!this._$isolator) {
	      console.verbose('add local isolator because event:', name);
	      this._$isolator = this.context.rootIsolator.createChild();
	    }
	
	    return this._$isolator.event(name);
	  },
	
	  coordinator: function(name, type) {
	    if(!this._$isolator) {
	      console.verbose('add local isolator because isolator:', name, type);
	      this._$isolator = this.context.rootIsolator.createChild();
	    }
	
	    return this._$isolator.coordinator(name, type);
	  },
	
	  getLocales: function() {
	    return this.props.locales || this.context.locales;
	  },
	
	  getRequestContext: function() {
	    return this.context.requestContext;
	  },
	
	  getIsolatedConfig: function() {
	    if(this._$isolator) {
	      return this._$isolator.isolatedConfig;
	    } else {
	      return this.context.rootIsolator.isolatedConfig;
	    }
	  },
	
	  componentWillUnmount: function() {
	    // release everything if root element unmounting
	    // else check if local isolator that we need to
	    // release.
	    if(!this._owner) {
	      console.verbose('release rootIsolator');
	      this.context.rootIsolator.release();
	    } else if(this._$isolator) {
	      console.verbose('release local isolator');
	      this._$isolator.release();
	    }
	  },
	
	  getChildContext: function () {
	    return {
	      rootIsolator: this.context.rootIsolator,
	      requestContext: this.context.requestContext,
	      locales: this.getLocales()
	    };
	  }
	};


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 *
	 * @interface experimentI
	 * @class
	 */
	function experimentInterface(pellet) {
	  this.pellet = pellet;
	}
	
	experimentInterface.prototype.select = function(name, ctx, experimentId, _renderOptions) {
	  var i, type;
	
	  if(name === null) {
	    return;
	  }
	
	  if(typeof name === 'function') {
	    // look up the component's version/key
	    for(i in this.pellet.components) {
	      if(this.pellet.components[i] === name) {
	        name = i;
	        break;
	      }
	    }
	
	    // if not found return undefined
	    if(typeof name === 'function') {
	      return;
	    }
	
	    name = name.substring(0, name.indexOf('@'));
	    type = 1;
	  } else if(typeof name !== 'string') {
	    console.warn('GA experiment: invalid version experiment:', experimentId, 'type:', typeof name, 'name:', name);
	    throw new Error('invalid experiment version type');
	  } else {
	    if (name[0] === '@') {
	      type = 1;
	      name = name.substring(1);
	    } else if (name[0] === '=') {
	      type = 2;
	      name = name.substring(1);
	    }
	
	    if (!name) {
	      return;
	    }
	
	    // if the key has a version use the specified version
	    // and ignore the experiment version
	    if (type !== 2 && name.indexOf('@') !== -1) {
	      return this.pellet.components[name];
	    }
	
	    if (type !== 1 && (i = name.indexOf('=')) !== -1) {
	      return name.substring(i + 1);
	    }
	  }
	
	  if(type === 1) return this.pellet.components[name];
	  else if(type === 2) return name;
	  return this.pellet.components[name] || name;
	}
	
	module.exports = experimentInterface;


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	// based off of https://github.com/ScottHamper/cookies
	
	var cookies = {
	  get: function (key) {
	    if (cookies._cachedDocumentCookie !== window.document.cookie) {
	      cookies._renewCache();
	    }
	
	    return cookies._cache[key];
	  },
	
	  set: function (key, value, options) {
	    options = cookies._getExtendedOptions(options);
	    options.expires = cookies._getExpiresDate(value === undefined ? -1 : options.expires);
	
	    window.document.cookie = cookies._generateCookieString(key, value, options);
	
	    return cookies;
	  },
	
	  expire: function (key, options) {
	    return cookies.set(key, undefined, options);
	  },
	
	  _getExtendedOptions: function (options) {
	    return {
	      path: options && options.path || '/',
	      domain: options && options.domain,
	      expires: options && options.expires,
	      secure: options && options.secure !== undefined ? options.secure : false
	    };
	  },
	
	  _isValidDate: function (date) {
	    return Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime());
	  },
	
	  _getExpiresDate: function (expires, now) {
	    now = now || new Date();
	    switch (typeof expires) {
	      case 'number':
	        expires = new Date(now.getTime() + expires * 1000);
	        break;
	      case 'string':
	        expires = new Date(expires);
	        break;
	    }
	
	    if (expires && !cookies._isValidDate(expires)) {
	      throw new Error('`expires` parameter cannot be converted to a valid Date instance');
	    }
	
	    return expires;
	  },
	
	  _generateCookieString: function (key, value, options) {
	    key = key.replace(/[^#$&+\^`|]/g, encodeURIComponent);
	    key = key.replace(/\(/g, '%28').replace(/\)/g, '%29');
	    value = (value + '').replace(/[^!#$&-+\--:<-\[\]-~]/g, encodeURIComponent);
	    options = options || {};
	
	    var cookieString = key + '=' + value;
	    cookieString += options.path ? ';path=' + options.path : '';
	    cookieString += options.domain ? ';domain=' + options.domain : '';
	    cookieString += options.expires ? ';expires=' + options.expires.toUTCString() : '';
	    cookieString += options.secure ? ';secure' : '';
	
	    return cookieString;
	  },
	
	  _getCacheFromString: function (documentCookie) {
	    var cookieCache = {};
	    var cookiesArray = documentCookie ? documentCookie.split('; ') : [];
	
	    for (var i = 0; i < cookiesArray.length; i++) {
	      var cookieKvp = cookies._getKeyValuePairFromCookieString(cookiesArray[i]);
	
	      if (cookieCache[cookieKvp.key] === undefined) {
	        cookieCache[cookieKvp.key] = cookieKvp.value;
	      }
	    }
	
	    return cookieCache;
	  },
	
	  _getKeyValuePairFromCookieString: function (cookieString) {
	    // "=" is a valid character in a cookie value according to RFC6265, so cannot `split('=')`
	    var separatorIndex = cookieString.indexOf('=');
	
	    // IE omits the "=" when the cookie value is an empty string
	    separatorIndex = separatorIndex < 0 ? cookieString.length : separatorIndex;
	
	    return {
	      key: decodeURIComponent(cookieString.substr(0, separatorIndex)),
	      value: decodeURIComponent(cookieString.substr(separatorIndex + 1))
	    };
	  },
	
	  _renewCache: function () {
	    cookies._cache = cookies._getCacheFromString(window.document.cookie);
	    cookies._cachedDocumentCookie = window.document.cookie;
	  }
	};
	
	module.exports = cookies;


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var react = __webpack_require__(16)
	  , pellet = __webpack_require__(2)
	  , utils = __webpack_require__(18)
	  , isolator = __webpack_require__(19)
	  , pipeline = __webpack_require__(37);
	
	// options.context options.mode=MODE_HTML, options.dom =
	
	var pelletRender = module.exports = {
	  MODE_STRING: 'static',
	  MODE_HTML: 'markup',
	  MODE_DOM: 'dom',
	
	  /**
	   * Render the component for both the server and browser
	   *
	   * @param component
	   * @param options (mode: targetEl:, context: or props:)
	   * @param next
	   */
	  renderComponent: function(component, options, next) {
	    if(typeof options == 'function') {
	      next = options;
	      options = {};
	    } else if(!options) {
	      options = {};
	    }
	
	    if(!component || !next) {
	      throw new Error('the component and next are required')
	    }
	
	    // default the mode using the environment so if in browser use
	    // DOM render else render full html with react-ids
	    if(!options.mode) {
	      if(true) {
	        options.mode = pelletRender.MODE_DOM;
	      } else {
	        options.mode = pelletRender.MODE_HTML;
	      }
	    }
	
	    var instrument = pellet.instrumentation.namespace('isorender.');
	    var mesure = instrument.elapseTimer();
	    instrument.increment('count');
	
	    function renderReactComponent(component, ctx) {
	      var result;
	
	      try {
	        if(options.mode == pelletRender.MODE_DOM && (true)) {
	          if(!options.targetEl) {
	            options.targetEl = document.getElementById('__PELLET__');
	            if(!options.targetEl) {
	              options.targetEl = document.body;
	            }
	          }
	
	          if(options.onRouteUnmountReact) {
	            react.unmountComponentAtNode(options.targetEl);
	            mesure.mark('react_unmount');
	          }
	
	          // only add touch events if the device support it
	          if ('ontouchstart' in document.documentElement) {
	            react.initializeTouchEvents(true);
	          }
	
	          result = react.render(component, options.targetEl);
	
	          if(!options.targetEl._loadedAndInitialized) {
	            if(options.targetEl.className) {
	              options.targetEl.className = options.targetEl.className.replace('loading_and_uninitialized', '').trim();
	            }
	
	            options.targetEl._loadedAndInitialized = true;
	          }
	
	          if(!document.body._loadedAndInitialized) {
	            if(document.body.className) {
	              document.body.className = document.body.className.replace('uninitialized', '').trim();
	            }
	
	            document.body._loadedAndInitialized = true;
	          }
	        } else if(options.mode == pelletRender.MODE_STRING) {
	          result = react.renderToStaticMarkup(component);
	        } else if(options.mode == pelletRender.MODE_HTML) {
	          if(pellet.options && pellet.options.useReactRenderToStaticMarkup) {
	            result = react.renderToStaticMarkup(component);
	          } else {
	            result = react.renderToString(component);
	          }
	        }
	
	        mesure.mark('react_render');
	      } catch(ex) {
	        next(ex);
	        instrument.increment('error');
	        return;
	      }
	
	      next(null, result, ctx);
	
	      // update the cache with the latest render markup (if needed)
	      // requires a pipeline else we can not cache pages
	      if(ctx.updateCache) {
	        ctx.updateCache(result, function (err) {
	          if (err) {
	            instrument.increment('cacheUpdateError');
	            console.error('Cannot update cache key', ctx.$.cacheKey, 'because:', err.message || err);
	            return;
	          }
	
	          instrument.increment('cacheUpdate');
	        });
	      }
	    }
	
	    var componentWithContext;
	
	    // get the serialize state if component has a onRoute function
	    if (component._$construction) {
	
	      try {
	        function cacheHitFn(html, ctx, head) {
	          instrument.increment('cacheHit');
	
	          //console.debug('Cache layer: cacheHitFn existing headTags', options.http.headTags)
	          // merge in cached header tags
	          if(head) {
	            var tag, i, len = head.length;
	            for(i = 0; i < len; i++) {
	              tag = head[i];
	              if(options.http.headTags.indexOf(tag) === -1) {
	                options.http.headTags.push(tag);
	              }
	            }
	          }
	
	          next(null, html, {toJSON:function() {return ctx;}});
	
	          // we do not want to send 2 responses
	          // so no op the next call
	          next = utils.noop;
	        }
	
	        // create a pipeline to render the component and track its state.
	        // options.context is the serialized data from the server
	        // options.http is isomorphic req/res to
	        var pipe = new pipeline(options.context, options.http, options.isolatedConfig, options.requestContext, options.locales, cacheHitFn);
	
	        // update the pipe props because we got them in our options
	        // the route function sets things like originalUrl, params, etc.
	        // so the __$onRoute can know about the route that was triggered
	        if(options.props) {
	          pipe.setProps(options.props);
	        }
	
	        mesure.mark('create_pipeline');
	
	        // now run the pre-flight code before asking react to render
	        // this allows for async code to be executed and tracks any
	        // data that needs to get serialized to the client.
	        component._$construction.call(pipe, {}, function (err) {
	          mesure.mark('component_construction');
	
	          if(err) {
	            instrument.increment('err');
	            return next(err);
	          }
	
	          // wait a tick so all kefir emit get processed for the
	          // pipe serialization.
	          setTimeout(function() {
	
	            // stop rendering if aborted or
	            // the cache is up to date
	            var renderAction = pipe.isRenderRequired();
	            if (renderAction !== pipe.RENDER_NEEDED) {
	              pipe.release();
	              mesure.mark('release');
	
	              if (renderAction === this.RENDER_ABORT) {
	                instrument.increment('abort');
	              } else if (renderAction === this.RENDER_NO_CHANGE) {
	                instrument.increment('cacheAbort');
	              }
	
	              next(null, null, pipe);
	              return;
	            }
	
	            // make sure the react context has locales to pick the
	            // rendered language. Then render the element with the
	            // props from the __$onRoute.
	            try {
	              componentWithContext = react.withContext({
	                rootIsolator: new isolator(null, null, null, pipe.rootIsolator.isolatedConfig),
	                requestContext: options.requestContext,
	                locales: options.locales
	              }, function () {
	                return React.createElement(component, pipe.props);
	              });
	            } catch (ex) {
	              next(ex);
	              return;
	            }
	
	            mesure.mark('react_context');
	
	            pipe.release();
	            mesure.mark('release');
	            renderReactComponent(componentWithContext, pipe);
	          }, 0);
	        });
	      } catch(ex) {
	        console.error('Error in trying to render component because:', ex.message);
	
	        pipe.release();
	        next(ex);
	      }
	    } else {
	
	      try {
	        componentWithContext = react.withContext({
	          rootIsolator: new isolator(null, null, null, options.isolatedConfig),
	          requestContext: options.requestContext,
	          locales: options.locales
	        }, function () {
	          var props;
	
	          if(options.context && options.context.props) {
	            if(options.props) {
	              props = {};
	              utils.objectUnion([options.context.props, options.props], props);
	            } else {
	              props = options.context.props;
	            }
	          } else if(options.props) {
	            props = options.props;
	          }
	
	          return React.createElement(component, props);
	        });
	      } catch(ex) {
	        next(ex);
	        return;
	      }
	
	      renderReactComponent(componentWithContext, {
	        toJSON: function() {
	          try {
	            return JSON.stringify({
	              requestContext: options.requestContext,
	              props: null,
	              coordinatorState: null
	            });
	          } catch(ex) {
	            console.error("Cannot serialize isomorphic context because:", ex.message);
	            throw ex;
	          }
	        }
	      });
	    }
	  }
	};


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var browserCookie;
	if(true) {
	  browserCookie = __webpack_require__(22);
	}
	
	/**
	 * Isomorphic http used by both server and browser.
	 *
	 * @class
	 * @param request
	 * @param respose
	 * @param next
	 */
	function isomorphicHttp (request, respose, next) {
	  this.request = request;
	  this.respose = respose;
	  this.next = next;
	
	  this.headTags = [];
	}
	
	isomorphicHttp.prototype = {
	  /**
	   * Set the http status code.
	   *
	   * This only has an effect on the server.
	   *
	   * @param {number} code
	   */
	  status: function(code) {
	    if(true) {
	      return;
	    }
	
	    // if expressjs or nodejs
	    if(this.respose.status) {
	      this.respose.status(code);
	    } else {
	      this.respose.statusCode = code;
	    }
	  },
	
	  /**
	   * Adds a header to the http response.
	   *
	   * This only has an effect on the server.
	   *
	   * @param field
	   * @param val
	   * @returns {*}
	   */
	  headers: function(field, val) {
	    if(true) {
	      return;
	    }
	
	    if (2 == arguments.length) {
	      if (Array.isArray(val)) {
	        val = val.map(String);
	      } else {
	        val = String(val);
	      }
	
	      // setHeader = res.set ? http.OutgoingMessage.prototype.setHeader : res.setHeader
	      this.respose.setHeader(field, val);
	    } else if(typeof field === 'object'){
	      for (var key in field) {
	        this.set(key, field[key]);
	      }
	    } else {
	      return this.request.headers[field];
	    }
	  },
	
	  /**
	   * Set _Content-Type_ response header with `type` through `mime.lookup()`
	   * when it does not contain "/", or set the Content-Type to `type` otherwise.
	   *
	   * This only has an effect on the server.
	   *
	   * Examples:
	   *
	   *     http.type('.html');
	   *     http.type('html');
	   *     http.type('json');
	   *     http.type('application/json');
	   *     http.type('png');
	   *
	   * @param {string} type
	   */
	  type: function(type) {
	    if(true) {
	      return;
	    }
	
	    this.respose.type(type);
	  },
	
	  /**
	   * Redirect to the given `url` with optional response `status`
	   * defaulting to 302.
	   *
	   * This only has an effect on the server.
	   *
	   * The resulting `url` is determined by `res.location()`, so
	   * it will play nicely with mounted apps, relative paths,
	   * `"back"` etc.
	   *
	   * Examples:
	   *
	   *     http.redirect('/foo/bar');
	   *     http.redirect('http://example.com');
	   *     http.redirect(301, 'http://example.com');
	   *     http.redirect('../login'); // /blog/post/1 -> /blog/login
	   *
	   * @param {number} [status]
	   * @param {string} url
	   */
	  redirect: function(status, url) {
	    if(true) {
	      // todo: look at redirect logic and redirect using history.push
	      return;
	    }
	
	    // todo: I need to make this a nodejs version not express
	    this.respose.redirect.apply(this.respose, Array.prototype.slice.call(arguments, 0));
	  },
	
	  /**
	   * Add to the header.
	   *
	   * Options:
	   *  * meta
	   *  * link
	   *  * title
	   *
	   * @param type
	   * @param fields
	   */
	  addToHead: function(type, fields) {
	    if(true) {
	      if(type == 'title') {
	        document.title = fields;
	      }
	
	      return;
	    }
	
	    var newLine;
	
	    switch(type) {
	      case 'meta':
	        newLine = ['<meta'];
	
	        if (fields.name) {
	          newLine.push('name="' + fields.name + '"');
	        }
	
	        if (fields.property) {
	          newLine.push('property="' + fields.property + '"');
	        }
	
	        if (fields.charset) {
	          newLine.push('charset="' + fields.charset + '"');
	        }
	
	        if (fields.content) {
	          newLine.push('content="' + fields.content + '"');
	        }
	
	        if (fields.httpEquiv) {
	          newLine.push('http-equiv="' + fields.httpEquiv + '"');
	        }
	
	        if (fields['http-equiv']) {
	          newLine.push('http-equiv="' + fields['http-equiv'] + '"');
	        }
	
	        newLine = newLine.join(' ') + '>';
	        break;
	      case 'link':
	        newLine = ['<link'];
	
	        if (fields.href) {
	          newLine.push('href="' + fields.href + '"');
	        }
	
	        if (fields.charset) {
	          newLine.push('charset="' + fields.charset + '"');
	        }
	
	        if (fields.hreflang) {
	          newLine.push('hreflang="' + fields.hreflang + '"');
	        }
	
	        if (fields.media) {
	          newLine.push('media="' + fields.media + '"');
	        }
	
	        if (fields.rev) {
	          newLine.push('rev="' + fields.rev + '"');
	        }
	
	        if (fields.rel) {
	          newLine.push('rel="' + fields.rel + '"');
	        }
	
	        if (fields.sizes) {
	          newLine.push('sizes="' + fields.sizes + '"');
	        }
	
	        if (fields.type) {
	          newLine.push('type="' + type + '"');
	        }
	
	        if (fields.target) {
	          newLine.push('target="' + target + '"');
	        }
	
	        newLine = newLine.join(' ') + '>';
	        break;
	      case 'title':
	        newLine = '<title>' + fields + '</title>';
	        break;
	      case 'script':
	        throw new Error('Use the addScript function');
	        break;
	      case 'style':
	        throw new Error('Use the addStyle function');
	        break;
	      default:
	        throw new Error('Unknown head tag ' + type);
	    }
	
	    this.headTags.push(newLine);
	  },
	
	  /**
	   *
	   * @param name
	   * @param value
	   * @param options
	   *   path
	   *   domain
	   *   expires
	   *   secure
	   *     server side only
	   *   httpOnly
	   *   maxAge
	   *
	   * @returns {*}
	   */
	  cookie: function(name, value, options) {
	    if(typeof value === 'undefined' && typeof options === 'undefined') {
	      if(true) {
	        return browserCookie.get(name);
	      } else if(process.env.SERVER_ENV) {
	        return this.request.cookies && this.request.cookies[name];
	      }
	    } else {
	      if(true) {
	        if(options && (options.httpOnly || options.maxAge)) {
	          throw new Error('Can not set httpOnly or maxAge on the browser');
	        }
	
	        browserCookie.set(name, value, options);
	      } else if(process.env.SERVER_ENV) {
	        this.respose.cookie(name, value, options);
	      }
	    }
	  }
	};
	
	module.exports = isomorphicHttp;


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var pathToRegexp = __webpack_require__(38)
	  , querystring = __webpack_require__(39);
	
	function router(options) {
	  this.routes = [];
	
	  this.defaults = {
	    sensitive: !!(options && options.sensitive || false),
	    strict: !!(options && options.strict || false),
	    end: true,
	    rank: 0
	  };
	
	  if(options && typeof options.end !== 'undefined') {
	    this.defaults.end = !!options.end;
	  }
	}
	
	router.prototype.add = function(pattern, fn, options) {
	  var key;
	
	  if(!fn) {
	    throw new Error('callback fn is required.')
	  }
	
	  // build up the options using our defaults and overrides
	  var privateOptions = Object.create(this.defaults);
	  if(options) {
	    if(typeof(options.sensitive) !== 'undefined') {
	      privateOptions.sensitive = !!options.sensitive;
	    }
	
	    if(typeof(options.strict) !== 'undefined') {
	      privateOptions.strict = !!options.strict;
	    }
	
	    if(typeof(options.end) !== 'undefined') {
	      privateOptions.end = !!options.end;
	    }
	
	    if(typeof(options.rank) !== 'undefined') {
	      privateOptions.rank = parseInt(options.rank, 10);
	    }
	  }
	
	  // build a unique key to identify the route ignoring named parameters
	  if(typeof pattern === 'string') {
	    key = pattern.replace(/:[^\?\*\/]+/g,'_').replace(/_([\*\?])/g,'$1');
	  } else if(pattern instanceof Array) {
	    key = JSON.stringify(pattern).replace(/[\[\]"\,]/g,'');
	  } else if(pattern instanceof RegExp) {
	    key = pattern.toString();
	  }
	
	  var route;
	
	  // looking for duplicate routes
	  for(var i in this.routes) {
	    if(this.routes[i].key === key) {
	      if(this.routes[i].rank >= privateOptions.rank) {
	        return false;
	      } else {
	        route = this.routes[i] = pathToRegexp(pattern, [], privateOptions);
	        route.key = key;
	        route.rank = privateOptions.rank;
	        route.fn = fn;
	        return key;
	      }
	    }
	  }
	
	  route = pathToRegexp(pattern, [], privateOptions);
	  route.key = key;
	  route.rank = privateOptions.rank;
	  route.fn = fn;
	
	  this.routes.push(route);
	
	  // todo: sort the routes by key and order so most specific route are first i.e. /foo/demi -> /foo/:name -> /foo/:path*
	  this.routes.sort(function(a, b) {
	    return b.rank - a.rank;
	  });
	
	  return key;
	};
	
	router.prototype.parse = function(fullpath) {
	  var i, path, result, route, query;
	
	  query = fullpath.indexOf('?');
	  if(query !== -1) {
	    path = fullpath.substring(0, query);
	    query = querystring.parse(fullpath.substring(query + 1));
	  } else {
	    path = fullpath;
	  }
	
	  for(i in this.routes) {
	    route = this.routes[i];
	    result = route.exec(path);
	
	    if(result) {
	      result.shift();
	
	      var details = {
	        fn: route.fn,
	        url: path,
	        originalUrl: fullpath,
	        query: query !== -1 ? query : null,
	        params: route.keys.length ? {} : null
	      };
	
	      for(i in route.keys) {
	        details.params[route.keys[i].name] = result.shift();
	      }
	
	      return details;
	    }
	  }
	
	  return false;
	};
	
	module.exports = router;


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	var react = __webpack_require__(16)
	  , cx = react.addons.classSet
	  , pellet = __webpack_require__(2);
	
	var spec = {
	  value: react.PropTypes.string,
	  index: react.PropTypes.string,
	  fuzzy: react.PropTypes.boolean,
	  missing: react.PropTypes.string
	};
	
	var _intl;
	if(false) {
	  _intl = require('intl/Intl.complete.js');
	  require('intl/locale-data/complete.js');
	} else {
	  _intl = window.Intl;
	}
	
	function getTranslation(locales, props) {
	
	  var val;
	
	  var state = {
	    hasErrors: false,
	    isMissing: true,
	    translation: ''
	  };
	
	  // supports calling props as
	  //  getTranslation(locales, { index: stringToTranslate })
	  // or
	  //  getTranslation(locales, stringToTranslate)
	  if (typeof props === "string") {
	    props = {
	      index: props
	    }
	  }
	
	  // todo: make a function that will walk over all the locales and try to match them i.e. us-en, us-br, us
	
	  if(locales) {
	    if(pellet.locales[locales]) {
	      if(props.index && (val = (props.fuzzy ? props.index.toLowerCase().replace(/\W/g, ''):props.index)) && pellet.locales[locales][val]) {
	        state.isMissing = false;
	        try {
	          state.translation = pellet.locales[locales][val](props);
	        } catch(ex) {
	          console.error('Cannot get translation because:', ex.message);
	          state.translation = '[ERROR:' + locales + ':' + val + ']';
	          state.hasErrors = true;
	        }
	      } else if(props.value) {
	        try {
	          if(props.fuzzy) {
	            val = props.value.toLowerCase().replace(/\W/g, '');
	          } else {
	            val = props.value;
	          }
	
	          if(pellet.locales[locales][val]) {
	            state.translation = pellet.locales[locales][val](props);
	          } else {
	            state.translation = props.value;
	          }
	
	          state.isMissing = false;
	        } catch(ex) {
	          console.error('Cannot get translation because:', ex.message);
	          state.translation = '[ERROR:' + locales + ':' + props.value + ']';
	          state.hasErrors = true;
	        }
	      } else {
	        state.translation = props.missing || '[MISSING: "' + props.index + '"]';
	      }
	    } else {
	      state.translation = '[UNKNOWN LOCALE: "' + locales + '"]';
	    }
	  } else {
	    state.translation = '[LOCALE NOT SET]';
	  }
	
	  if(pellet.config.intlHideDebugMsg && (state.hasErrors || state.isMissing) && state.translation[0]=='[') {
	    state.translation = props.missing || props.value || props.index;
	  }
	
	  if(props.htmlEscape) {
	    state.translation = state.translation.replace(/&/g, '&amp;')
	      .replace(/</g, '&lt;')
	      .replace(/>/g, '&gt;')
	      .replace(/"/g, '&quot;')
	      .replace(/#/g, '&#35;')
	      .replace(/\\/g, '\\\\')
	      .replace(/\n/g, '\\n');
	  }
	
	  return state;
	}
	
	/**
	 * helper function to lookup translation in pellet
	 *
	 * @param scope
	 * @param options
	 * @returns {string|*|buildManifestMap.server.translation}
	 */
	function _getLocales(scope) {
	  return (scope.getLocales && scope.getLocales()) || scope;
	}
	
	pellet.intl = function(scope, options) {
	  return getTranslation(_getLocales(scope), options).translation;
	}
	
	pellet.intl.formatNumber = function(scope, number, options) {
	  return _intl.NumberFormat(_getLocales(scope), options).format(number);
	}
	
	pellet.intl.formatDateTime = function(scope, date, options) {
	  return _intl.DateTimeFormat(_getLocales(scope), options).format(date);
	}
	
	pellet.intl.load = function(locales, next) {
	  if(pellet.locales[locales]) {
	    if(next) {
	      next();
	      return;
	    }
	  }
	
	  var src = (pellet.config.jsMountPoint || '/js/') + locales + '.js';
	  var head = document.getElementsByTagName('head')[0];
	  var script = document.createElement('script');
	  script.type = 'text/javascript';
	  script.src = src;
	
	  if(next) {
	    var done = false;
	    script.onload = script.onreadystatechange = function() {
	      if( !done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") ) {
	        done = true;
	        next();
	
	        // Handle memory leak in IE
	        script.onload = script.onreadystatechange = null;
	        if (head && script.parentNode) {
	          head.removeChild(script);
	        }
	      }
	    };
	  }
	
	  head.appendChild(script);
	}
	
	module.exports = pellet.createClass({
	  propsTypes: spec,
	
	  render: function() {
	
	    var locales = this.getLocales();
	    var translation = getTranslation(locales, this.props);
	
	    if((true) && translation.isMissing && !pellet.locales[locales] && !pellet.locales['_$'+locales]) {
	      console.info('Try to load missing locales:', locales);
	      pellet.locales['_$'+locales] = true;
	      var _this = this;
	
	      pellet.intl.load(locales, function() {
	        while(_this._owner) {
	          _this = _this._owner;
	        }
	
	        _this.forceUpdate();
	      });
	
	      return (
	        React.createElement("span", null)
	      );
	    }
	
	    var classes = cx({
	      'translation-missing': translation.isMissing,
	      'translation-error': translation.hasErrors
	    });
	
	    return (
	      React.createElement("span", {className: classes}, translation.translation)
	    );
	  }
	});


/***/ },
/* 27 */,
/* 28 */,
/* 29 */,
/* 30 */,
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	React = react = __webpack_require__(16);Pellet = pellet = __webpack_require__(2);module.exports=function(__$this) {
	  return React.createElement("div", {
	    className: "abnDashboard-component"
	  }, __$this.state.message ? React.createElement("div", {
	    className: "message"
	  }, __$this.state.message) : null, React.createElement("div", {
	    className: "logo"
	  }, React.createElement("img", {
	    src: "//raw.githubusercontent.com/Rebelizer/pellet/master/doghouse/public/favicon.ico"
	  }), React.createElement("h1", null, "Pellet Experiments")), React.createElement("div", {
	    className: "grid-h"
	  }, React.createElement("div", {
	    className: "titlebar row"
	  }, React.createElement("span", {
	    className: "name"
	  }, "NAME"), React.createElement("span", null, "UPDATED"), React.createElement("span", {
	    className: "active"
	  }, "SPLIT")), pellet.experiment.experiments ? ǃmap＿(pellet.experiment.experiments, function(experiment, $index) {
	    var activeExp;
	    return React.createElement("div", {
	      className: "experiment"
	    }, React.createElement("div", {
	      onClick: __$this.showExperiment.bind(__$this, experiment.data.id),
	      className: "row hover"
	    }, React.createElement("span", {
	      className: "name"
	    }, experiment.data.id), React.createElement("span", null, experiment.data.updated && pellet.intl.formatDateTime(__$this, new Date(experiment.data.updated))), React.createElement("span", {
	      className: "active"
	    }, 100 * experiment.data.participation + "%")), experiment.data.id == __$this.state.activeExperiment ? React.createElement("div", {
	      className: "details"
	    }, (activeExp = cxApi.getChosenVariation(experiment.data.id), ǃmap＿(experiment.data.items, function(item, $index) {
	      return React.createElement("div", {
	        className: "detail-block"
	      }, activeExp != item.id ? React.createElement("a", {
	        onClick: __$this.setVariation.bind(__$this, item.id),
	        className: "make-active"
	      }, "make active") : React.createElement("div", {
	        className: "active-experiment"
	      }, "active"), React.createElement("span", null, "Variation " + item.id + " is " + (item.disabled ? "disabled" : "active") + " and getting " + Math.floor(1e3 * item.weight) / 10 + "% of traffic."), React.createElement("ul", null, ǃmap＿(pellet.experiment.allVariations, function(info, comp) {
	        return info[experiment.data.id] ? "=" == comp[0] ? React.createElement("li", null, 'The key "' + comp.substring(1) + '" will be "' + info[experiment.data.id][parseInt(item.id)] + '"') : "@" == comp[0] ? React.createElement("li", null, "The " + comp.substring(1) + ' component will use "' + info[experiment.data.id][parseInt(item.id)] + '" version') : React.createElement("li", null, '"' + comp + '" -> "' + info[experiment.data.id][parseInt(item.id)] + '"') : null;
	      })));
	    }))) : null);
	  }) : null, React.createElement("p", null, React.createElement("a", {
	    href: "https://www.google.com/analytics/web/?hl=en#report/siteopt-experiments/",
	    target: "ga"
	  }, "Google Analytics Experiments")), React.createElement("h3", null, "Participating Components"), React.createElement("div", {
	    className: "titlebar row"
	  }, React.createElement("span", {
	    className: "name"
	  }, "COMPONENTS"), React.createElement("span", null, "Type")), pellet.experiment.allVariations ? ǃmap＿(pellet.experiment.allVariations, function(x, name) {
	    return React.createElement("div", {
	      className: "row hover"
	    }, React.createElement("span", {
	      className: "name"
	    }, name.substring(1)), React.createElement("span", null, "=" === name[0] ? "Key/Value" : "@" === name[0] ? "Component" : "unknown"));
	  }) : null, React.createElement("h3", null, "All Components"), React.createElement("div", {
	    className: "titlebar row"
	  }, React.createElement("span", {
	    className: "name"
	  }, "NAME"), React.createElement("span", {
	    className: "active"
	  }, "VERSION")), ǃmap＿(pellet.components, function(x, name) {
	    return comp = name.split("@"), null, 2 == comp.length ? React.createElement("div", {
	      className: "row hover"
	    }, React.createElement("span", {
	      className: "name"
	    }, comp[0]), React.createElement("span", null, comp[1])) : null;
	  })));
	};
	function ǃmap＿(obj, each, alt) {
	  var result = [], key;
	  if (typeof obj.length === 'number') {
	    result = [].map.call(obj, each);
	  } else {
	    for (key in obj) result.push(each(obj[key], key));
	  }
	  return result.length ? result : alt && alt();
	}

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	React = react = __webpack_require__(16);Pellet = pellet = __webpack_require__(2);module.exports=function(__$this) {
	  return React.createElement("div", {
	    className: "about-page"
	  }, React.createElement("h1", null, "My about Page"), React.createElement("a", {
	    href: "/hello/Kaivon"
	  }, "Kaivon "), React.createElement("br"), React.createElement("a", {
	    href: "/"
	  }, "Home"));
	};

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	React = react = __webpack_require__(16);Pellet = pellet = __webpack_require__(2);module.exports=function(__$this) {
	  return React.createElement("div", {
	    className: "index-page"
	  }, React.createElement("h1", null, "My index Page"));
	};

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	React = react = __webpack_require__(16);Pellet = pellet = __webpack_require__(2);module.exports=function(__$this) {
	  return React.createElement("div", {
	    className: "hello-page"
	  }, React.createElement("h1", null, "My hello Page"), React.createElement("h2", null, "What's Up!"), React.createElement("h3", null, "" + __$this.props.params.name), React.createElement("h3", null, "" + __$this.state.count), React.createElement("button", {
	    onClick: __$this.add
	  }, "Up It!"), "Kaivon" == __$this.props.params.name ? React.createElement("h2", null, "yo") : null, React.createElement("hr"), React.createElement(pellet.components.message || message, {
	    name: "Afsari" + __$this.state.count
	  }), React.createElement("hr"), React.createElement("a", {
	    href: "/about"
	  }, "About"));
	};

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	React = react = __webpack_require__(16);Pellet = pellet = __webpack_require__(2);module.exports=function(__$this) {
	  return React.createElement("div", {
	    className: "layout1-layout"
	  }, React.createElement("header", null, React.createElement("h1", null, "My layout1 layout header")), __$this.layoutContent, React.createElement("footer", null, React.createElement("p", null, "Copyright " + new Date().toJSON())));
	};

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	React = react = __webpack_require__(16);Pellet = pellet = __webpack_require__(2);module.exports=function(__$this) {
	  return React.createElement("div", {
	    className: "message-component"
	  }, "Real Time Weapon Change! " + __$this.props.name);
	};

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	var pellet = __webpack_require__(2)
	  , isolator = __webpack_require__(19)
	  , utils = __webpack_require__(18);
	
	var defaultCacheInterface = null;
	
	/**
	 * context to merge the two environments
	 *
	 * @class
	 * @param initData
	 * @param http
	 * @param isolatedConfig
	 * @param requestContext
	 * @param locales
	 * @param {function} [cacheHitFn] called to send a cached data
	 */
	function pipeline(initData, http, isolatedConfig, requestContext, locales, cacheHitFn) {
	  this.http = http;
	  this.serialize = {};
	  this.props = {};
	  this.requestContext = requestContext;
	  this.locales = locales;
	  this.rootIsolator = new isolator(null, null, null, isolatedConfig);
	  this.coordinatorNameTypeMap = {};
	
	  // create a instrument interface that will embed our isolatedConfig info
	  this.instrument = pellet.instrumentation.addIsolatedConfig(isolatedConfig);
	
	  // because the pipeline used Object.create to clone the namespace
	  // we create a shared object that will not lose updates. for example
	  // if you create a new namespace and update this.abortRender it update
	  // only the namespace version not the owner/parent.
	  this.$ = {
	    abortRender: false,
	    cacheInterface: defaultCacheInterface,    // the interace used to cache request
	    cacheHitFn: cacheHitFn || null,           // a fn called to send the cached data to the clint
	    cacheNeedsUpdating: false,                // true will update the cache at the end of the render
	    cacheForceRender: false,                  // true to force a render even if cache hash match
	    cacheHitCalled: false,                    // this is if the cache hit was sent to the client
	    cacheKey: '',
	    cacheDataSignature: '',                   // this is a data signature to help skip full renders
	    cacheHitData: null,                       // this is a last cached data to help skip full renders
	    statusCode: 200,                          // this is the current http statusCode
	    relCanonical: null                        // this is the current rel canonical url
	  };
	
	  if(initData) {
	    utils.objectUnion([initData.props], this.props);
	    utils.objectUnion([initData.props], this.serialize);
	
	    if(initData.coordinatorState) {
	      this.coordinatorState = initData.coordinatorState;
	      for(var i in this.coordinatorState) {
	        var _coordinator = pellet.getCoordinator(i, this.coordinatorState[i].type);
	        if(_coordinator) {
	          _coordinator.load(this.coordinatorState[i].items);
	        }
	      }
	    } else {
	      this.coordinatorState = {};
	    }
	  } else {
	    this.coordinatorState = {};
	  }
	
	  this.parentContext = null;
	  this.insertAt = '';
	
	  var root = {};
	  this.insertNode = {
	    key: false,
	    head: root,
	    root: root
	  };
	}
	
	// HELPER FUNCTIONS - wrappers around
	pipeline.prototype.LINK = 'link';
	pipeline.prototype.META = 'meta';
	pipeline.prototype.TITLE = 'title';
	
	pipeline.prototype.RENDER_ABORT = 'abort';
	pipeline.prototype.RENDER_NO_CHANGE = 'no-change';
	pipeline.prototype.RENDER_NEEDED = 'needed';
	
	/**
	 * Add header to the http response.
	 *
	 * Please refer to {@link isomorphicHttp#addToHead} for full list of supported tags
	 *
	 * Examples:
	 *
	 *     this.addToHead('title', 'My page title here')
	 *     this.addToHead('meta', {name: 'description', content:'My SEO SERP description'})
	 *
	 * @param field
	 * @param val
	 */
	pipeline.prototype.addToHead = function(field, val) {
	  this.http.addToHead(field, val);
	};
	
	pipeline.prototype.headers = function(field, val) {
	  if(arguments.length === 2) {
	    return this.http.headers(field, val);
	  } else {
	    return this.http.headers(field);
	  }
	};
	
	/**
	 * Get or Set the http status code
	 *
	 * Examples:
	 *
	 *     this.statusCode()
	 *     this.statusCode(404)
	 *
	 * @param code
	 * @return {*}
	 */
	pipeline.prototype.statusCode = function(code) {
	  if(arguments.length === 1) {
	    this.$.statusCode = code;
	    this.http.status(code);
	  } else {
	    return this.$.statusCode;
	  }
	};
	
	pipeline.prototype.setTitle = function(title) {
	  this.http.addToHead(this.TITLE, title);
	};
	
	pipeline.prototype.setCanonical = function(url) {
	  this.$.relCanonical = url;
	  this.http.addToHead(this.LINK, {rel:'canonical', href:url});
	};
	
	pipeline.prototype.cookie = function() {
	  return this.http.cookie.apply(this.http, Array.prototype.slice.apply(arguments));
	};
	
	pipeline.prototype.redirect = function(url) {
	  this.http.redirect(url);
	  this.$.abortRender = true;
	};
	
	pipeline.prototype.event = function(name) {
	  return this.rootIsolator.event(name);
	}
	
	pipeline.prototype.getIsolatedConfig = function() {
	  return this.rootIsolator.isolatedConfig;
	}
	
	pipeline.prototype.updateIsolatedConfig = function(config) {
	  return this.rootIsolator.updateIsolatedConfig(config);
	}
	
	pipeline.prototype.getLocales = function() {
	  return this.props.locales || this.locales;
	}
	
	pipeline.prototype.getRequestContext = function() {
	  return this.requestContext;
	}
	
	pipeline.prototype.abortCache = function() {
	  this.$.cacheNeedsUpdating = false;
	}
	
	pipeline.prototype.coordinator = function(name, type, serializeEventName) {
	  this.coordinatorNameTypeMap[name] = type;
	  var coordinator = this.rootIsolator.coordinator(name, type);
	
	  if(serializeEventName && (false)) {
	    var _this = this;
	
	    coordinator.event(serializeEventName).filter(function(data) {
	      return (data.sender.id === coordinator._id.id) && (data.ctx === coordinator.isolatedConfig);
	    }).on(function(data) {
	      _this.set(name, data.event);
	    }, true);
	  }
	
	  return coordinator;
	}
	
	/**
	 * create a new namespace
	 * @param namespace
	 * @param fromRoot
	 * @returns {*}
	 */
	pipeline.prototype.namespace = function(namespace, fromRoot) {
	  // ignore if no change in namespace
	  if(!namespace && !fromRoot) {
	    return this;
	  }
	
	  var index, path, key
	    , root = {}
	    , head = root
	    , newCtx = Object.create(this);
	
	  // trim out trailing "." and clean up duplicate "..." before getting path
	  path = (fromRoot ? namespace : (this.insertAt + '.' + namespace));
	  path = path.trim().replace(/\.+/g, '.').replace(/(^\.)|(\.$)/g, '');
	
	  newCtx.parentContext = this;
	  newCtx.insertAt = path;
	
	  path = path.split('.');
	  key = path.pop();
	  while((index = path.shift()) != null) {
	    head = head[index] = {};
	  }
	
	  newCtx.insertNode = {
	    key: key,
	    head: head,
	    root: root
	  };
	
	  return newCtx;
	};
	
	/**
	 *
	 * @private
	 * @param obj
	 * @returns {*}
	 */
	pipeline.prototype.buildMergeObjFromNamespace = function(obj) {
	  if(!this.insertNode.key) {
	    return obj;
	  }
	
	  this.insertNode.head[this.insertNode.key] = obj;
	  return this.insertNode.root;
	};
	
	pipeline.prototype.setProps = function(obj) {
	  if(this.insertNode.key === false && typeof obj !== 'object') {
	    throw new Error('Cannot merge non objects to root namespace')
	  }
	
	  // todo: make sure no observables (save versions) because it will blow is someone uses it
	
	  var mergeObj = this.buildMergeObjFromNamespace(obj);
	  utils.objectUnion([mergeObj], this.props, {deleteUndefined:true});
	};
	
	pipeline.prototype.setState = function(obj, cb) {
	  if(typeof obj !== 'object') {
	    throw new Error('Cannot merge non objects to context state')
	  } /*
	  TODO: need to support the fn(previousState, currentProps) version
	  need to update Unit test and make sure the namescpae is mantained
	  else if(typeof obj !== 'function') {
	    obj = obj(this.props.__initState, this.props)
	  }*/
	
	  var mergeObj = this.buildMergeObjFromNamespace({__initState:obj});
	  utils.objectUnion([mergeObj], this.props, {deleteUndefined:true});
	  if(typeof cb === 'function') {
	    cb();
	  }
	};
	
	/**
	 *
	 * @param coordinator
	 * @param obj
	 */
	pipeline.prototype.set = function(key, value) {
	
	  // check if we are serialize data for a coordinator (need to make sure its one of our coordinators)
	  if(typeof value !== 'undefined' && typeof(key) === 'string' && this.coordinatorNameTypeMap[key]) {
	    var data;
	    if(!(data = this.coordinatorState[key])) {
	      data = this.coordinatorState[key] = {
	        type: this.coordinatorNameTypeMap[key],
	        items:[]
	      };
	    }
	
	    data.items.push(value);
	    return;
	  }
	
	  value = key;
	
	  if(this.insertNode.key === false && typeof value !== 'object') {
	    throw new Error('Cannot merge non objects to root namespace')
	  }
	
	  // todo: make sure all the items in obj are primitives i.e. number, strings, object but not functions or object with constrotor
	  // this is because we JSON.stringify and we need the serialize to work
	
	  var mergeObj = this.buildMergeObjFromNamespace(value);
	  utils.objectUnion([mergeObj], this.props, {deleteUndefined:true});
	  utils.objectUnion([mergeObj], this.serialize, {deleteUndefined:true});
	};
	
	/**
	 * Adds evidence to cache key.
	 * Use this to build up the cache key used to xxx
	 *
	 * @param {string} evidence addition evidence used to build the cache key
	 */
	pipeline.prototype.addCacheKey = function(evidence) {
	  this.$.cacheKey += evidence;
	};
	
	
	/**
	 * Adds evidence to around cached data
	 *
	 * Use this to help pellet skip full react renders. For example if the cached
	 * version was rendered with props {a:1, b:2} and the data from componentConstruction
	 * has not changed is safe to skip the render because the markup will be the same.
	 * This can safe pellet from having to render react markup and keep using the cached
	 * version.
	 *
	 * If you do not use this pellet will use the props
	 *
	 * @param evidence
	 */
	pipeline.prototype.signatureCacheData = function(evidence) {
	  this.$.cacheDataSignature += evidence;
	};
	
	/**
	 * Used to transform the data send to the client
	 *
	 * @callback transformCtxFn
	 * @param ctx This is the cached ctx
	 * @param head This is the cached headers
	 * @param meta This is the caches meta data
	 * @callback next callback after your done with your transform
	 */
	
	/**
	 * Used to transform the data send to the client
	 *
	 * @callback sendCachedCB
	 * @param err
	 * @param cachedData
	 */
	
	/**
	 * Use pipeline cache to  .
	 *
	 * let the pipeline lookup
	 *
	 * @param {number} dirtyRead use a potentially dirty version to ttl (in ms) if 0 do not server from the cache or -1 to force render
	 * @param {transformCtxFn} [transformCtxFn] used to modify serialize data
	 * @param {sendCachedCB} next
	 */
	pipeline.prototype.serveFromCache = function(dirtyRead, transformCtxFn, next) {
	  if(arguments.length === 2) {
	    next = transformCtxFn;
	    transformCtxFn = null;
	  }
	
	  if(true) {
	    if(next) {
	      next(null, null, null);
	    }
	  } else {
	    var _this = this;
	
	    console.debug('Cache layer: check if in cache (key):', this.$.cacheKey);
	
	    // turn on cache updating, because we are
	    // trying to return a cached version.
	    this.$.cacheNeedsUpdating = true;
	
	    // check the cache for the cacheKey and if found transform ctx and
	    // render the cached version if dirtyRead > 0
	    this.$.cacheInterface.get(this.$.cacheKey, function(err, data, metaData) {
	      if(err) {
	        next(err, null, null);
	        return;
	      }
	
	      console.debug('Cache layer: cache contains ctx', !!(data && data.ctx), 'head:',!!(data && data.head), 'meta:', !!metaData);
	      //console.debug('Cache layer: DATA:', data||'nothing');
	      //console.debug('Cache layer: head:', data && data.head);
	
	      if(data) {
	        // save off the data for the render step
	        // this allow use to the skip render if data signature
	        // has not changed. It most cases this is the props
	        _this.$.cacheHitData = data;
	
	        // if dirtyRead == -1 force render and ignore the cache
	        if(dirtyRead === -1) {
	          _this.$.cacheForceRender = true;
	          dirtyRead = 0;
	        }
	
	        if(transformCtxFn) {
	          transformCtxFn(_this, (data && data.ctx && JSON.parse(data.ctx)), data.head, metaData, function(err, ctx, head) {
	            console.debug('Cache layer: use dirty read', dirtyRead && ((Date.now() - metaData.lastModified) <= dirtyRead), 'ttl:', dirtyRead, 'elapse:', (Date.now() - metaData.lastModified));
	
	            if(dirtyRead && ((Date.now() - metaData.lastModified) <= dirtyRead)) {
	              _this.$.cacheHitCalled = true;
	              _this.$.cacheHitFn(data.html, ctx && JSON.stringify(ctx), head);
	              return;
	            }
	
	            next(null, data, metaData);
	          });
	        } else {
	          console.debug('Cache layer: use dirty read', dirtyRead && ((Date.now() - metaData.lastModified) <= dirtyRead), 'ttl:', dirtyRead, 'elapse:',(Date.now() - metaData.lastModified));
	
	          if(dirtyRead && ((Date.now() - metaData.lastModified) <= dirtyRead)) {
	            _this.$.cacheHitCalled = true;
	            _this.$.cacheHitFn(data.html, data.ctx, data.head);
	            return;
	          }
	
	          next(null, data, metaData);
	        }
	      } else {
	        next(null, null, null);
	      }
	    });
	  }
	};
	
	/**
	 * Update the cache with both the html and serialize data
	 * if we do not need to update the cache
	 *
	 * @param html
	 * @param {callback} next
	 * @return {boolean} if we need to update the cache
	 */
	pipeline.prototype.updateCache = function(html, next) {
	  if(true) {
	    next(null, false);
	  } else {
	    if(pellet.options.cacheOnly200Response && this.$.statusCode != 200) {
	      console.debug('Cache layer: abort cache because statusCode:', this.$.statusCode);
	      this.$.cacheNeedsUpdating = false;
	    }
	
	    console.debug('Cache layer: needs to update:', this.$.cacheNeedsUpdating);
	
	    // this is tied to the serveFromCache call so if
	    // during a request serveFromCache is not called
	    // we do not update the cache because it will never
	    // get used.
	    if(!this.$.cacheNeedsUpdating) {
	      next(null, false);
	      return;
	    }
	
	    try {
	      var _this = this
	        , ctx = this.getJSON(true);
	
	      console.debug('Cache layer: update (key):', this.$.cacheKey, 'html hash:', ctx.hash);
	      //console.debug('Cache layer: ctx:', JSON.stringify(ctx,null,2))
	
	      // update the cache with the HTML and ctx
	      this.$.cacheInterface.set(this.$.cacheKey, {
	        html: html,
	        hash: ctx.hash,
	        ctx: ctx.json,
	        head: this.http.headTags
	      }, function(err) {
	        if(err) {
	          console.error('Error updating cache layer', _this.$.cacheKey, 'because:', err.message||err);
	          next(err);
	          return;
	        }
	
	        next(null);
	      });
	    } catch(ex) {
	      console.error('Error updating cache layer', this.$.cacheKey, 'because:', ex.message||ex);
	      next(ex);
	    }
	  }
	};
	
	/**
	 * Returns if the the render should be aborted
	 *
	 * This can be caused by the pipeline being aborted via an
	 * operation like a redirect or manual response. Additional
	 * if the caching layer does not require a render this will
	 * return false.
	 *
	 * @returns {boolean}
	 */
	pipeline.prototype.isRenderRequired = function() {
	  console.debug('Cache layer: isRenderRequired abortRender:', this.$.abortRender, 'cacheHitCalled:', this.$.cacheHitCalled, 'cacheHitData.hash:', this.$.cacheHitData && this.$.cacheHitData.hash)
	
	  if(this.$.abortRender) {
	    console.debug('Abort render because manual abort in response (i.e. redirect)');
	    return this.RENDER_ABORT;
	  }
	
	  var hash = this.getJSON(true, true).hash
	    , needToRender = ((this.$.cacheHitData && this.$.cacheHitData.hash) != hash) ? this.RENDER_NEEDED : this.RENDER_NO_CHANGE;
	
	  console.debug('Cache layer: render required:', needToRender, 'from cache (hash):', this.$.cacheHitData && this.$.cacheHitData.hash, 'current:', hash, 'force:', this.$.cacheForceRender);
	
	  if(this.$.cacheForceRender) {
	    needToRender = this.RENDER_NEEDED;
	  }
	
	  if(false) {
	    var _cacheKey = this.$.cacheKey;
	    // touch the cache to update its TTL data
	    this.$.cacheInterface.touch(_cacheKey, this.$.cacheHitData, function(err) {
	      if(err) {
	        console.error('Error touching cache layer', _cacheKey, 'because:', err.message||err);
	        return;
	      }
	    });
	  }
	
	  return needToRender;
	}
	
	/**
	 * Set the cache interface this pipeline should use.
	 *
	 * @param cacheInterface
	 */
	pipeline.prototype.setCacheInterface = function(cacheInterface) {
	  this.$.cacheInterface = cacheInterface;
	};
	
	pipeline.prototype.addChildComponent = function(namespace, component, options, next) {
	  var context = this;
	
	  if(component._$construction) {
	    if(namespace) {
	      context = this.namespace(namespace);
	    }
	
	    component._$construction.call(context, options, next);
	  } else {
	    next();
	  }
	};
	
	pipeline.prototype.getUA = function () {
	  return (this.requestContext && this.requestContext.userAgentDetails) || {};
	}
	
	/**
	 *
	 * @param calcHash
	 * @param skipJSON
	 * @return {*}
	 */
	pipeline.prototype.getJSON = function(calcHash, skipJSON) {
	  try {
	    // now make sure the coordinator serialized state is safe for hashing, because
	    // the data is async the order the data is stored in coordinatorState.*.items[*]
	    // is random and this will change the hash of ctx (toJSON) so sort the array
	    // via makeArrayHashSafe to make it perdurable
	    if(!pellet.options.cacheHashIgnoreArrayOrder) {
	      for (var i in this.coordinatorState) {
	        this.coordinatorState[i].items = utils.makeArrayHashSafe(this.coordinatorState[i].items);
	      }
	    }
	
	    var result = {}
	      , data = {
	        requestContext: this.requestContext,
	        props: this.serialize,
	        coordinatorState: this.coordinatorState
	      };
	
	    if(calcHash) {
	      result.hash = this.$.cacheDataSignature || utils.hashObject(data, {ignoreArrayOrder: pellet.options.cacheHashIgnoreArrayOrder});
	    }
	
	    if(!skipJSON) {
	      result.json = JSON.stringify(data);
	    }
	
	    return result;
	  } catch(ex) {
	    console.error("Cannot serialize isomorphic context because:", ex.message||ex);
	    throw ex;
	  }
	}
	
	/**
	 * Returns a JSON string and a hash
	 *
	 * @return {string} returns the JSON string
	 */
	pipeline.prototype.toJSON = function() {
	  return this.getJSON(false).json;
	};
	
	pipeline.prototype.release = function() {
	  this.rootIsolator.release();
	};
	
	/**
	 * Set the cache interface used by the pipeline.
	 *
	 * @param cacheInterface
	 */
	pellet.setDefaultPipelineCacheInterface = function(cacheInterface) {
	  defaultCacheInterface = cacheInterface;
	}
	
	module.exports = pipeline;


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	var isarray = __webpack_require__(44)
	
	/**
	 * Expose `pathToRegexp`.
	 */
	module.exports = pathToRegexp
	module.exports.parse = parse
	module.exports.compile = compile
	module.exports.tokensToFunction = tokensToFunction
	module.exports.tokensToRegExp = tokensToRegExp
	
	/**
	 * The main path matching regexp utility.
	 *
	 * @type {RegExp}
	 */
	var PATH_REGEXP = new RegExp([
	  // Match escaped characters that would otherwise appear in future matches.
	  // This allows the user to escape special characters that won't transform.
	  '(\\\\.)',
	  // Match Express-style parameters and un-named parameters with a prefix
	  // and optional suffixes. Matches appear as:
	  //
	  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
	  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
	  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
	  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
	].join('|'), 'g')
	
	/**
	 * Parse a string for the raw tokens.
	 *
	 * @param  {String} str
	 * @return {Array}
	 */
	function parse (str) {
	  var tokens = []
	  var key = 0
	  var index = 0
	  var path = ''
	  var res
	
	  while ((res = PATH_REGEXP.exec(str)) != null) {
	    var m = res[0]
	    var escaped = res[1]
	    var offset = res.index
	    path += str.slice(index, offset)
	    index = offset + m.length
	
	    // Ignore already escaped sequences.
	    if (escaped) {
	      path += escaped[1]
	      continue
	    }
	
	    // Push the current path onto the tokens.
	    if (path) {
	      tokens.push(path)
	      path = ''
	    }
	
	    var prefix = res[2]
	    var name = res[3]
	    var capture = res[4]
	    var group = res[5]
	    var suffix = res[6]
	    var asterisk = res[7]
	
	    var repeat = suffix === '+' || suffix === '*'
	    var optional = suffix === '?' || suffix === '*'
	    var delimiter = prefix || '/'
	    var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?')
	
	    tokens.push({
	      name: name || key++,
	      prefix: prefix || '',
	      delimiter: delimiter,
	      optional: optional,
	      repeat: repeat,
	      pattern: escapeGroup(pattern)
	    })
	  }
	
	  // Match any characters still remaining.
	  if (index < str.length) {
	    path += str.substr(index)
	  }
	
	  // If the path exists, push it onto the end.
	  if (path) {
	    tokens.push(path)
	  }
	
	  return tokens
	}
	
	/**
	 * Compile a string to a template function for the path.
	 *
	 * @param  {String}   str
	 * @return {Function}
	 */
	function compile (str) {
	  return tokensToFunction(parse(str))
	}
	
	/**
	 * Expose a method for transforming tokens into the path function.
	 */
	function tokensToFunction (tokens) {
	  // Compile all the tokens into regexps.
	  var matches = new Array(tokens.length)
	
	  // Compile all the patterns before compilation.
	  for (var i = 0; i < tokens.length; i++) {
	    if (typeof tokens[i] === 'object') {
	      matches[i] = new RegExp('^' + tokens[i].pattern + '$')
	    }
	  }
	
	  return function (obj) {
	    var path = ''
	
	    obj = obj || {}
	
	    for (var i = 0; i < tokens.length; i++) {
	      var key = tokens[i]
	
	      if (typeof key === 'string') {
	        path += key
	
	        continue
	      }
	
	      var value = obj[key.name]
	
	      if (value == null) {
	        if (key.optional) {
	          continue
	        } else {
	          throw new TypeError('Expected "' + key.name + '" to be defined')
	        }
	      }
	
	      if (isarray(value)) {
	        if (!key.repeat) {
	          throw new TypeError('Expected "' + key.name + '" to not repeat')
	        }
	
	        if (value.length === 0) {
	          if (key.optional) {
	            continue
	          } else {
	            throw new TypeError('Expected "' + key.name + '" to not be empty')
	          }
	        }
	
	        for (var j = 0; j < value.length; j++) {
	          if (!matches[i].test(value[j])) {
	            throw new TypeError('Expected all "' + key.name + '" to match "' + key.pattern + '"')
	          }
	
	          path += (j === 0 ? key.prefix : key.delimiter) + encodeURIComponent(value[j])
	        }
	
	        continue
	      }
	
	      if (!matches[i].test(value)) {
	        throw new TypeError('Expected "' + key.name + '" to match "' + key.pattern + '"')
	      }
	
	      path += key.prefix + encodeURIComponent(value)
	    }
	
	    return path
	  }
	}
	
	/**
	 * Escape a regular expression string.
	 *
	 * @param  {String} str
	 * @return {String}
	 */
	function escapeString (str) {
	  return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1')
	}
	
	/**
	 * Escape the capturing group by escaping special characters and meaning.
	 *
	 * @param  {String} group
	 * @return {String}
	 */
	function escapeGroup (group) {
	  return group.replace(/([=!:$\/()])/g, '\\$1')
	}
	
	/**
	 * Attach the keys as a property of the regexp.
	 *
	 * @param  {RegExp} re
	 * @param  {Array}  keys
	 * @return {RegExp}
	 */
	function attachKeys (re, keys) {
	  re.keys = keys
	  return re
	}
	
	/**
	 * Get the flags for a regexp from the options.
	 *
	 * @param  {Object} options
	 * @return {String}
	 */
	function flags (options) {
	  return options.sensitive ? '' : 'i'
	}
	
	/**
	 * Pull out keys from a regexp.
	 *
	 * @param  {RegExp} path
	 * @param  {Array}  keys
	 * @return {RegExp}
	 */
	function regexpToRegexp (path, keys) {
	  // Use a negative lookahead to match only capturing groups.
	  var groups = path.source.match(/\((?!\?)/g)
	
	  if (groups) {
	    for (var i = 0; i < groups.length; i++) {
	      keys.push({
	        name: i,
	        prefix: null,
	        delimiter: null,
	        optional: false,
	        repeat: false,
	        pattern: null
	      })
	    }
	  }
	
	  return attachKeys(path, keys)
	}
	
	/**
	 * Transform an array into a regexp.
	 *
	 * @param  {Array}  path
	 * @param  {Array}  keys
	 * @param  {Object} options
	 * @return {RegExp}
	 */
	function arrayToRegexp (path, keys, options) {
	  var parts = []
	
	  for (var i = 0; i < path.length; i++) {
	    parts.push(pathToRegexp(path[i], keys, options).source)
	  }
	
	  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options))
	
	  return attachKeys(regexp, keys)
	}
	
	/**
	 * Create a path regexp from string input.
	 *
	 * @param  {String} path
	 * @param  {Array}  keys
	 * @param  {Object} options
	 * @return {RegExp}
	 */
	function stringToRegexp (path, keys, options) {
	  var tokens = parse(path)
	  var re = tokensToRegExp(tokens, options)
	
	  // Attach keys back to the regexp.
	  for (var i = 0; i < tokens.length; i++) {
	    if (typeof tokens[i] !== 'string') {
	      keys.push(tokens[i])
	    }
	  }
	
	  return attachKeys(re, keys)
	}
	
	/**
	 * Expose a function for taking tokens and returning a RegExp.
	 *
	 * @param  {Array}  tokens
	 * @param  {Array}  keys
	 * @param  {Object} options
	 * @return {RegExp}
	 */
	function tokensToRegExp (tokens, options) {
	  options = options || {}
	
	  var strict = options.strict
	  var end = options.end !== false
	  var route = ''
	  var lastToken = tokens[tokens.length - 1]
	  var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken)
	
	  // Iterate over the tokens and create our regexp string.
	  for (var i = 0; i < tokens.length; i++) {
	    var token = tokens[i]
	
	    if (typeof token === 'string') {
	      route += escapeString(token)
	    } else {
	      var prefix = escapeString(token.prefix)
	      var capture = token.pattern
	
	      if (token.repeat) {
	        capture += '(?:' + prefix + capture + ')*'
	      }
	
	      if (token.optional) {
	        if (prefix) {
	          capture = '(?:' + prefix + '(' + capture + '))?'
	        } else {
	          capture = '(' + capture + ')?'
	        }
	      } else {
	        capture = prefix + '(' + capture + ')'
	      }
	
	      route += capture
	    }
	  }
	
	  // In non-strict mode we allow a slash at the end of match. If the path to
	  // match already ends with a slash, we remove it for consistency. The slash
	  // is valid at the end of a path match, not in the middle. This is important
	  // in non-ending mode, where "/test/" shouldn't match "/test//route".
	  if (!strict) {
	    route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?'
	  }
	
	  if (end) {
	    route += '$'
	  } else {
	    // In non-ending mode, we need the capturing groups to match as much as
	    // possible by using a positive lookahead to the end or next path segment.
	    route += strict && endsWithSlash ? '' : '(?=\\/|$)'
	  }
	
	  return new RegExp('^' + route, flags(options))
	}
	
	/**
	 * Normalize the given path string, returning a regular expression.
	 *
	 * An empty array can be passed in for the keys, which will hold the
	 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
	 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
	 *
	 * @param  {(String|RegExp|Array)} path
	 * @param  {Array}                 [keys]
	 * @param  {Object}                [options]
	 * @return {RegExp}
	 */
	function pathToRegexp (path, keys, options) {
	  keys = keys || []
	
	  if (!isarray(keys)) {
	    options = keys
	    keys = []
	  } else if (!options) {
	    options = {}
	  }
	
	  if (path instanceof RegExp) {
	    return regexpToRegexp(path, keys, options)
	  }
	
	  if (isarray(path)) {
	    return arrayToRegexp(path, keys, options)
	  }
	
	  return stringToRegexp(path, keys, options)
	}


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.decode = exports.parse = __webpack_require__(42);
	exports.encode = exports.stringify = __webpack_require__(43);


/***/ },
/* 40 */,
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*! Kefir.js v0.5.3
	 *  https://github.com/pozadi/kefir
	 */
	;(function(global){
	  "use strict";
	
	  var Kefir = {};
	
	
	function and() {
	  for (var i = 0; i < arguments.length; i++) {
	    if (!arguments[i]) {
	      return arguments[i];
	    }
	  }
	  return arguments[i - 1];
	}
	
	function or() {
	  for (var i = 0; i < arguments.length; i++) {
	    if (arguments[i]) {
	      return arguments[i];
	    }
	  }
	  return arguments[i - 1];
	}
	
	function not(x) {
	  return !x;
	}
	
	function concat(a, b) {
	  var result, length, i, j;
	  if (a.length === 0) {  return b  }
	  if (b.length === 0) {  return a  }
	  j = 0;
	  result = new Array(a.length + b.length);
	  length = a.length;
	  for (i = 0; i < length; i++, j++) {
	    result[j] = a[i];
	  }
	  length = b.length;
	  for (i = 0; i < length; i++, j++) {
	    result[j] = b[i];
	  }
	  return result;
	}
	
	function find(arr, value) {
	  var length = arr.length
	    , i;
	  for (i = 0; i < length; i++) {
	    if (arr[i] === value) {  return i  }
	  }
	  return -1;
	}
	
	function findByPred(arr, pred) {
	  var length = arr.length
	    , i;
	  for (i = 0; i < length; i++) {
	    if (pred(arr[i])) {  return i  }
	  }
	  return -1;
	}
	
	function cloneArray(input) {
	  var length = input.length
	    , result = new Array(length)
	    , i;
	  for (i = 0; i < length; i++) {
	    result[i] = input[i];
	  }
	  return result;
	}
	
	function remove(input, index) {
	  var length = input.length
	    , result, i, j;
	  if (index >= 0 && index < length) {
	    if (length === 1) {
	      return [];
	    } else {
	      result = new Array(length - 1);
	      for (i = 0, j = 0; i < length; i++) {
	        if (i !== index) {
	          result[j] = input[i];
	          j++;
	        }
	      }
	      return result;
	    }
	  } else {
	    return input;
	  }
	}
	
	function removeByPred(input, pred) {
	  return remove(input, findByPred(input, pred));
	}
	
	function map(input, fn) {
	  var length = input.length
	    , result = new Array(length)
	    , i;
	  for (i = 0; i < length; i++) {
	    result[i] = fn(input[i]);
	  }
	  return result;
	}
	
	function forEach(arr, fn) {
	  var length = arr.length
	    , i;
	  for (i = 0; i < length; i++) {  fn(arr[i])  }
	}
	
	function fillArray(arr, value) {
	  var length = arr.length
	    , i;
	  for (i = 0; i < length; i++) {
	    arr[i] = value;
	  }
	}
	
	function contains(arr, value) {
	  return find(arr, value) !== -1;
	}
	
	function rest(arr, start, onEmpty) {
	  if (arr.length > start) {
	    return Array.prototype.slice.call(arr, start);
	  }
	  return onEmpty;
	}
	
	function slide(cur, next, max) {
	  var length = Math.min(max, cur.length + 1),
	      offset = cur.length - length + 1,
	      result = new Array(length),
	      i;
	  for (i = offset; i < length; i++) {
	    result[i - offset] = cur[i];
	  }
	  result[length - 1] = next;
	  return result;
	}
	
	function isEqualArrays(a, b) {
	  var length, i;
	  if (a == null && b == null) {
	    return true;
	  }
	  if (a == null || b == null) {
	    return false;
	  }
	  if (a.length !== b.length) {
	    return false;
	  }
	  for (i = 0, length = a.length; i < length; i++) {
	    if (a[i] !== b[i]) {
	      return false;
	    }
	  }
	  return true;
	}
	
	function spread(fn, length) {
	  switch(length) {
	    case 0:  return function(a) {  return fn()  };
	    case 1:  return function(a) {  return fn(a[0])  };
	    case 2:  return function(a) {  return fn(a[0], a[1])  };
	    case 3:  return function(a) {  return fn(a[0], a[1], a[2])  };
	    case 4:  return function(a) {  return fn(a[0], a[1], a[2], a[3])  };
	    default: return function(a) {  return fn.apply(null, a)  };
	  }
	}
	
	function apply(fn, c, a) {
	  var aLength = a ? a.length : 0;
	  if (c == null) {
	    switch (aLength) {
	      case 0:  return fn();
	      case 1:  return fn(a[0]);
	      case 2:  return fn(a[0], a[1]);
	      case 3:  return fn(a[0], a[1], a[2]);
	      case 4:  return fn(a[0], a[1], a[2], a[3]);
	      default: return fn.apply(null, a);
	    }
	  } else {
	    switch (aLength) {
	      case 0:  return fn.call(c);
	      default: return fn.apply(c, a);
	    }
	  }
	}
	
	function get(map, key, notFound) {
	  if (map && key in map) {
	    return map[key];
	  } else {
	    return notFound;
	  }
	}
	
	function own(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}
	
	function createObj(proto) {
	  var F = function() {};
	  F.prototype = proto;
	  return new F();
	}
	
	function extend(target /*, mixin1, mixin2...*/) {
	  var length = arguments.length
	    , i, prop;
	  for (i = 1; i < length; i++) {
	    for (prop in arguments[i]) {
	      target[prop] = arguments[i][prop];
	    }
	  }
	  return target;
	}
	
	function inherit(Child, Parent /*, mixin1, mixin2...*/) {
	  var length = arguments.length
	    , i;
	  Child.prototype = createObj(Parent.prototype);
	  Child.prototype.constructor = Child;
	  for (i = 2; i < length; i++) {
	    extend(Child.prototype, arguments[i]);
	  }
	  return Child;
	}
	
	var NOTHING = ['<nothing>'];
	var END = 'end';
	var VALUE = 'value';
	var ERROR = 'error';
	var ANY = 'any';
	
	function noop() {}
	
	function id(x) {
	  return x;
	}
	
	function strictEqual(a, b) {
	  return a === b;
	}
	
	function defaultDiff(a, b) {
	  return [a, b]
	}
	
	var now = Date.now ?
	  function() { return Date.now() } :
	  function() { return new Date().getTime() };
	
	function isFn(fn) {
	  return typeof fn === 'function';
	}
	
	function isUndefined(x) {
	  return typeof x === 'undefined';
	}
	
	function isArrayLike(xs) {
	  return isArray(xs) || isArguments(xs);
	}
	
	var isArray = Array.isArray || function(xs) {
	  return Object.prototype.toString.call(xs) === '[object Array]';
	}
	
	var isArguments = function(xs) {
	  return Object.prototype.toString.call(xs) === '[object Arguments]';
	}
	
	// For IE
	if (!isArguments(arguments)) {
	  isArguments = function(obj) {
	    return !!(obj && own(obj, 'callee'));
	  }
	}
	
	function withInterval(name, mixin) {
	
	  function AnonymousStream(wait, args) {
	    Stream.call(this);
	    this._wait = wait;
	    this._intervalId = null;
	    var $ = this;
	    this._$onTick = function() {  $._onTick()  }
	    this._init(args);
	  }
	
	  inherit(AnonymousStream, Stream, {
	
	    _name: name,
	
	    _init: function(args) {},
	    _free: function() {},
	
	    _onTick: function() {},
	
	    _onActivation: function() {
	      this._intervalId = setInterval(this._$onTick, this._wait);
	    },
	    _onDeactivation: function() {
	      if (this._intervalId !== null) {
	        clearInterval(this._intervalId);
	        this._intervalId = null;
	      }
	    },
	
	    _clear: function() {
	      Stream.prototype._clear.call(this);
	      this._$onTick = null;
	      this._free();
	    }
	
	  }, mixin);
	
	  Kefir[name] = function(wait) {
	    return new AnonymousStream(wait, rest(arguments, 1, []));
	  }
	}
	
	function withOneSource(name, mixin, options) {
	
	
	  options = extend({
	    streamMethod: function(StreamClass, PropertyClass) {
	      return function() {  return new StreamClass(this, arguments)  }
	    },
	    propertyMethod: function(StreamClass, PropertyClass) {
	      return function() {  return new PropertyClass(this, arguments)  }
	    }
	  }, options || {});
	
	
	
	  mixin = extend({
	    _init: function(args) {},
	    _free: function() {},
	
	    _handleValue: function(x, isCurrent) {  this._send(VALUE, x, isCurrent)  },
	    _handleError: function(x, isCurrent) {  this._send(ERROR, x, isCurrent)  },
	    _handleEnd: function(__, isCurrent) {  this._send(END, null, isCurrent)  },
	
	    _handleAny: function(event) {
	      switch (event.type) {
	        case VALUE: this._handleValue(event.value, event.current); break;
	        case ERROR: this._handleError(event.value, event.current); break;
	        case END: this._handleEnd(event.value, event.current); break;
	      }
	    },
	
	    _onActivation: function() {
	      this._source.onAny(this._$handleAny);
	    },
	    _onDeactivation: function() {
	      this._source.offAny(this._$handleAny);
	    }
	  }, mixin || {});
	
	
	
	  function buildClass(BaseClass) {
	    function AnonymousObservable(source, args) {
	      BaseClass.call(this);
	      this._source = source;
	      this._name = source._name + '.' + name;
	      this._init(args);
	      var $ = this;
	      this._$handleAny = function(event) {  $._handleAny(event)  }
	    }
	
	    inherit(AnonymousObservable, BaseClass, {
	      _clear: function() {
	        BaseClass.prototype._clear.call(this);
	        this._source = null;
	        this._$handleAny = null;
	        this._free();
	      }
	    }, mixin);
	
	    return AnonymousObservable;
	  }
	
	
	  var AnonymousStream = buildClass(Stream);
	  var AnonymousProperty = buildClass(Property);
	
	  if (options.streamMethod) {
	    Stream.prototype[name] = options.streamMethod(AnonymousStream, AnonymousProperty);
	  }
	
	  if (options.propertyMethod) {
	    Property.prototype[name] = options.propertyMethod(AnonymousStream, AnonymousProperty);
	  }
	
	}
	
	function withTwoSources(name, mixin /*, options*/) {
	
	  mixin = extend({
	    _init: function(args) {},
	    _free: function() {},
	
	    _handlePrimaryValue: function(x, isCurrent) {  this._send(VALUE, x, isCurrent)  },
	    _handlePrimaryError: function(x, isCurrent) {  this._send(ERROR, x, isCurrent)  },
	    _handlePrimaryEnd: function(__, isCurrent) {  this._send(END, null, isCurrent)  },
	
	    _handleSecondaryValue: function(x, isCurrent) {  this._lastSecondary = x  },
	    _handleSecondaryError: function(x, isCurrent) {  this._send(ERROR, x, isCurrent)  },
	    _handleSecondaryEnd: function(__, isCurrent) {},
	
	    _handlePrimaryAny: function(event) {
	      switch (event.type) {
	        case VALUE:
	          this._handlePrimaryValue(event.value, event.current);
	          break;
	        case ERROR:
	          this._handlePrimaryError(event.value, event.current);
	          break;
	        case END:
	          this._handlePrimaryEnd(event.value, event.current);
	          break;
	      }
	    },
	    _handleSecondaryAny: function(event) {
	      switch (event.type) {
	        case VALUE:
	          this._handleSecondaryValue(event.value, event.current);
	          break;
	        case ERROR:
	          this._handleSecondaryError(event.value, event.current);
	          break;
	        case END:
	          this._handleSecondaryEnd(event.value, event.current);
	          this._removeSecondary();
	          break;
	      }
	    },
	
	    _removeSecondary: function() {
	      if (this._secondary !== null) {
	        this._secondary.offAny(this._$handleSecondaryAny);
	        this._$handleSecondaryAny = null;
	        this._secondary = null;
	      }
	    },
	
	    _onActivation: function() {
	      if (this._secondary !== null) {
	        this._secondary.onAny(this._$handleSecondaryAny);
	      }
	      if (this._alive) {
	        this._primary.onAny(this._$handlePrimaryAny);
	      }
	    },
	    _onDeactivation: function() {
	      if (this._secondary !== null) {
	        this._secondary.offAny(this._$handleSecondaryAny);
	      }
	      this._primary.offAny(this._$handlePrimaryAny);
	    }
	  }, mixin || {});
	
	
	
	  function buildClass(BaseClass) {
	    function AnonymousObservable(primary, secondary, args) {
	      BaseClass.call(this);
	      this._primary = primary;
	      this._secondary = secondary;
	      this._name = primary._name + '.' + name;
	      this._lastSecondary = NOTHING;
	      var $ = this;
	      this._$handleSecondaryAny = function(event) {  $._handleSecondaryAny(event)  }
	      this._$handlePrimaryAny = function(event) {  $._handlePrimaryAny(event)  }
	      this._init(args);
	    }
	
	    inherit(AnonymousObservable, BaseClass, {
	      _clear: function() {
	        BaseClass.prototype._clear.call(this);
	        this._primary = null;
	        this._secondary = null;
	        this._lastSecondary = null;
	        this._$handleSecondaryAny = null;
	        this._$handlePrimaryAny = null;
	        this._free();
	      }
	    }, mixin);
	
	    return AnonymousObservable;
	  }
	
	
	  var AnonymousStream = buildClass(Stream);
	  var AnonymousProperty = buildClass(Property);
	
	  Stream.prototype[name] = function(secondary) {
	    return new AnonymousStream(this, secondary, rest(arguments, 1, []));
	  }
	
	  Property.prototype[name] = function(secondary) {
	    return new AnonymousProperty(this, secondary, rest(arguments, 1, []));
	  }
	
	}
	
	// Subscribers
	
	function Subscribers() {
	  this._items = [];
	}
	
	extend(Subscribers, {
	  callOne: function(fnData, event) {
	    if (fnData.type === ANY) {
	      fnData.fn(event);
	    } else if (fnData.type === event.type) {
	      if (fnData.type === VALUE || fnData.type === ERROR) {
	        fnData.fn(event.value);
	      } else {
	        fnData.fn();
	      }
	    }
	  },
	  callOnce: function(type, fn, event) {
	    if (type === ANY) {
	      fn(event);
	    } else if (type === event.type) {
	      if (type === VALUE || type === ERROR) {
	        fn(event.value);
	      } else {
	        fn();
	      }
	    }
	  }
	});
	
	
	extend(Subscribers.prototype, {
	  add: function(type, fn, _key) {
	    this._items = concat(this._items, [{
	      type: type,
	      fn: fn,
	      key: _key || null
	    }]);
	  },
	  remove: function(type, fn, _key) {
	    var pred = isArray(_key) ?
	      function(fnData) {return fnData.type === type && isEqualArrays(fnData.key, _key)} :
	      function(fnData) {return fnData.type === type && fnData.fn === fn};
	    this._items = removeByPred(this._items, pred);
	  },
	  callAll: function(event) {
	    var items = this._items;
	    for (var i = 0; i < items.length; i++) {
	      Subscribers.callOne(items[i], event);
	    }
	  },
	  isEmpty: function() {
	    return this._items.length === 0;
	  }
	});
	
	
	
	
	
	// Events
	
	function Event(type, value, current) {
	  return {type: type, value: value, current: !!current};
	}
	
	var CURRENT_END = Event(END, undefined, true);
	
	
	
	
	
	// Observable
	
	function Observable() {
	  this._subscribers = new Subscribers();
	  this._active = false;
	  this._alive = true;
	}
	Kefir.Observable = Observable;
	
	extend(Observable.prototype, {
	
	  _name: 'observable',
	
	  _onActivation: function() {},
	  _onDeactivation: function() {},
	
	  _setActive: function(active) {
	    if (this._active !== active) {
	      this._active = active;
	      if (active) {
	        this._onActivation();
	      } else {
	        this._onDeactivation();
	      }
	    }
	  },
	
	  _clear: function() {
	    this._setActive(false);
	    this._alive = false;
	    this._subscribers = null;
	  },
	
	  _send: function(type, x, isCurrent) {
	    if (this._alive) {
	      this._subscribers.callAll(Event(type, x, isCurrent));
	      if (type === END) {  this._clear()  }
	    }
	  },
	
	  _on: function(type, fn, _key) {
	    if (this._alive) {
	      this._subscribers.add(type, fn, _key);
	      this._setActive(true);
	    } else {
	      Subscribers.callOnce(type, fn, CURRENT_END);
	    }
	    return this;
	  },
	
	  _off: function(type, fn, _key) {
	    if (this._alive) {
	      this._subscribers.remove(type, fn, _key);
	      if (this._subscribers.isEmpty()) {
	        this._setActive(false);
	      }
	    }
	    return this;
	  },
	
	  onValue:  function(fn, _key) {  return this._on(VALUE, fn, _key)   },
	  onError:  function(fn, _key) {  return this._on(ERROR, fn, _key)   },
	  onEnd:    function(fn, _key) {  return this._on(END, fn, _key)     },
	  onAny:    function(fn, _key) {  return this._on(ANY, fn, _key)     },
	
	  offValue: function(fn, _key) {  return this._off(VALUE, fn, _key)  },
	  offError: function(fn, _key) {  return this._off(ERROR, fn, _key)  },
	  offEnd:   function(fn, _key) {  return this._off(END, fn, _key)    },
	  offAny:   function(fn, _key) {  return this._off(ANY, fn, _key)    }
	
	});
	
	
	// extend() can't handle `toString` in IE8
	Observable.prototype.toString = function() {  return '[' + this._name + ']'  };
	
	
	
	
	
	
	
	
	
	// Stream
	
	function Stream() {
	  Observable.call(this);
	}
	Kefir.Stream = Stream;
	
	inherit(Stream, Observable, {
	
	  _name: 'stream'
	
	});
	
	
	
	
	
	
	
	// Property
	
	function Property() {
	  Observable.call(this);
	  this._current = NOTHING;
	  this._currentError = NOTHING;
	}
	Kefir.Property = Property;
	
	inherit(Property, Observable, {
	
	  _name: 'property',
	
	  _send: function(type, x, isCurrent) {
	    if (this._alive) {
	      if (!isCurrent) {
	        this._subscribers.callAll(Event(type, x));
	      }
	      if (type === VALUE) {  this._current = x  }
	      if (type === ERROR) {  this._currentError = x  }
	      if (type === END) {  this._clear()  }
	    }
	  },
	
	  _on: function(type, fn, _key) {
	    if (this._alive) {
	      this._subscribers.add(type, fn, _key);
	      this._setActive(true);
	    }
	    if (this._current !== NOTHING) {
	      Subscribers.callOnce(type, fn, Event(VALUE, this._current, true));
	    }
	    if (this._currentError !== NOTHING) {
	      Subscribers.callOnce(type, fn, Event(ERROR, this._currentError, true));
	    }
	    if (!this._alive) {
	      Subscribers.callOnce(type, fn, CURRENT_END);
	    }
	    return this;
	  }
	
	});
	
	
	
	
	
	
	// Log
	
	Observable.prototype.log = function(name) {
	  name = name || this.toString();
	  this.onAny(function(event) {
	    var typeStr = '<' + event.type + (event.current ? ':current' : '') + '>';
	    if (event.type === VALUE || event.type === ERROR) {
	      console.log(name, typeStr, event.value);
	    } else {
	      console.log(name, typeStr);
	    }
	  }, ['__logKey__', this, name]);
	  return this;
	}
	
	Observable.prototype.offLog = function(name) {
	  name = name || this.toString();
	  this.offAny(null, ['__logKey__', this, name]);
	  return this;
	}
	
	
	
	// Kefir.withInterval()
	
	withInterval('withInterval', {
	  _init: function(args) {
	    this._fn = args[0];
	    var $ = this;
	    this._emitter = {
	      emit: function(x) {  $._send(VALUE, x)  },
	      error: function(x) {  $._send(ERROR, x)  },
	      end: function() {  $._send(END)  }
	    }
	  },
	  _free: function() {
	    this._fn = null;
	    this._emitter = null;
	  },
	  _onTick: function() {
	    this._fn(this._emitter);
	  }
	});
	
	
	
	
	
	// Kefir.fromPoll()
	
	withInterval('fromPoll', {
	  _init: function(args) {
	    this._fn = args[0];
	  },
	  _free: function() {
	    this._fn = null;
	  },
	  _onTick: function() {
	    this._send(VALUE, this._fn());
	  }
	});
	
	
	
	
	
	// Kefir.interval()
	
	withInterval('interval', {
	  _init: function(args) {
	    this._x = args[0];
	  },
	  _free: function() {
	    this._x = null;
	  },
	  _onTick: function() {
	    this._send(VALUE, this._x);
	  }
	});
	
	
	
	
	// Kefir.sequentially()
	
	withInterval('sequentially', {
	  _init: function(args) {
	    this._xs = cloneArray(args[0]);
	    if (this._xs.length === 0) {
	      this._send(END)
	    }
	  },
	  _free: function() {
	    this._xs = null;
	  },
	  _onTick: function() {
	    switch (this._xs.length) {
	      case 1:
	        this._send(VALUE, this._xs[0]);
	        this._send(END);
	        break;
	      default:
	        this._send(VALUE, this._xs.shift());
	    }
	  }
	});
	
	
	
	
	// Kefir.repeatedly()
	
	withInterval('repeatedly', {
	  _init: function(args) {
	    this._xs = cloneArray(args[0]);
	    this._i = -1;
	  },
	  _onTick: function() {
	    if (this._xs.length > 0) {
	      this._i = (this._i + 1) % this._xs.length;
	      this._send(VALUE, this._xs[this._i]);
	    }
	  }
	});
	
	
	
	
	
	// Kefir.later()
	
	withInterval('later', {
	  _init: function(args) {
	    this._x = args[0];
	  },
	  _free: function() {
	    this._x = null;
	  },
	  _onTick: function() {
	    this._send(VALUE, this._x);
	    this._send(END);
	  }
	});
	
	function _AbstractPool(options) {
	  Stream.call(this);
	
	  this._queueLim = get(options, 'queueLim', 0);
	  this._concurLim = get(options, 'concurLim', -1);
	  this._drop = get(options, 'drop', 'new');
	  if (this._concurLim === 0) {
	    throw new Error('options.concurLim can\'t be 0');
	  }
	
	  var $ = this;
	  this._$handleSubAny = function(event) {  $._handleSubAny(event)  };
	
	  this._queue = [];
	  this._curSources = [];
	  this._activating = false;
	}
	
	inherit(_AbstractPool, Stream, {
	
	  _name: 'abstractPool',
	
	  _add: function(obj, toObs) {
	    toObs = toObs || id;
	    if (this._concurLim === -1 || this._curSources.length < this._concurLim) {
	      this._addToCur(toObs(obj));
	    } else {
	      if (this._queueLim === -1 || this._queue.length < this._queueLim) {
	        this._addToQueue(toObs(obj));
	      } else if (this._drop === 'old') {
	        this._removeOldest();
	        this._add(toObs(obj));
	      }
	    }
	  },
	  _addAll: function(obss) {
	    var $ = this;
	    forEach(obss, function(obs) {  $._add(obs)  });
	  },
	  _remove: function(obs) {
	    if (this._removeCur(obs) === -1) {
	      this._removeQueue(obs);
	    }
	  },
	
	  _addToQueue: function(obs) {
	    this._queue = concat(this._queue, [obs]);
	  },
	  _addToCur: function(obs) {
	    this._curSources = concat(this._curSources, [obs]);
	    if (this._active) {  this._subscribe(obs)  }
	  },
	  _subscribe: function(obs) {
	    var $ = this;
	    obs.onAny(this._$handleSubAny);
	    obs.onEnd(function() {  $._removeCur(obs)  }, [this, obs]);
	  },
	  _unsubscribe: function(obs) {
	    obs.offAny(this._$handleSubAny);
	    obs.offEnd(null, [this, obs]);
	  },
	  _handleSubAny: function(event) {
	    if (event.type === VALUE || event.type === ERROR) {
	      this._send(event.type, event.value, event.current && this._activating);
	    }
	  },
	
	  _removeQueue: function(obs) {
	    var index = find(this._queue, obs);
	    this._queue = remove(this._queue, index);
	    return index;
	  },
	  _removeCur: function(obs) {
	    if (this._active) {  this._unsubscribe(obs)  }
	    var index = find(this._curSources, obs);
	    this._curSources = remove(this._curSources, index);
	    if (index !== -1) {
	      if (this._queue.length !== 0) {
	        this._pullQueue();
	      } else if (this._curSources.length === 0) {
	        this._onEmpty();
	      }
	    }
	    return index;
	  },
	  _removeOldest: function() {
	    this._removeCur(this._curSources[0]);
	  },
	
	  _pullQueue: function() {
	    if (this._queue.length !== 0) {
	      this._queue = cloneArray(this._queue);
	      this._addToCur(this._queue.shift());
	    }
	  },
	
	  _onActivation: function() {
	    var sources = this._curSources
	      , i;
	    this._activating = true;
	    for (i = 0; i < sources.length; i++) {  this._subscribe(sources[i])  }
	    this._activating = false;
	  },
	  _onDeactivation: function() {
	    var sources = this._curSources
	      , i;
	    for (i = 0; i < sources.length; i++) {  this._unsubscribe(sources[i])  }
	  },
	
	  _isEmpty: function() {  return this._curSources.length === 0  },
	  _onEmpty: function() {},
	
	  _clear: function() {
	    Stream.prototype._clear.call(this);
	    this._queue = null;
	    this._curSources = null;
	    this._$handleSubAny = null;
	  }
	
	});
	
	
	
	
	
	// .merge()
	
	var MergeLike = {
	  _onEmpty: function() {
	    if (this._initialised) {  this._send(END, null, this._activating)  }
	  }
	};
	
	function Merge(sources) {
	  _AbstractPool.call(this);
	  if (sources.length === 0) {  this._send(END)  } else {  this._addAll(sources)  }
	  this._initialised = true;
	}
	
	inherit(Merge, _AbstractPool, extend({_name: 'merge'}, MergeLike));
	
	Kefir.merge = function(obss) {
	  return new Merge(obss);
	}
	
	Observable.prototype.merge = function(other) {
	  return Kefir.merge([this, other]);
	}
	
	
	
	
	// .concat()
	
	function Concat(sources) {
	  _AbstractPool.call(this, {concurLim: 1, queueLim: -1});
	  if (sources.length === 0) {  this._send(END)  } else {  this._addAll(sources)  }
	  this._initialised = true;
	}
	
	inherit(Concat, _AbstractPool, extend({_name: 'concat'}, MergeLike));
	
	Kefir.concat = function(obss) {
	  return new Concat(obss);
	}
	
	Observable.prototype.concat = function(other) {
	  return Kefir.concat([this, other]);
	}
	
	
	
	
	
	
	// .pool()
	
	function Pool() {
	  _AbstractPool.call(this);
	}
	
	inherit(Pool, _AbstractPool, {
	
	  _name: 'pool',
	
	  plug: function(obs) {
	    this._add(obs);
	    return this;
	  },
	  unplug: function(obs) {
	    this._remove(obs);
	    return this;
	  }
	
	});
	
	Kefir.pool = function() {
	  return new Pool();
	}
	
	
	
	
	
	// .bus()
	
	function Bus() {
	  _AbstractPool.call(this);
	}
	
	inherit(Bus, _AbstractPool, {
	
	  _name: 'bus',
	
	  plug: function(obs) {
	    this._add(obs);
	    return this;
	  },
	  unplug: function(obs) {
	    this._remove(obs);
	    return this;
	  },
	
	  emit: function(x) {
	    this._send(VALUE, x);
	    return this;
	  },
	  error: function(x) {
	    this._send(ERROR, x);
	    return this;
	  },
	  end: function() {
	    this._send(END);
	    return this;
	  }
	
	});
	
	Kefir.bus = function() {
	  return new Bus();
	}
	
	
	
	
	
	// .flatMap()
	
	function FlatMap(source, fn, options) {
	  _AbstractPool.call(this, options);
	  this._source = source;
	  this._fn = fn || id;
	  this._mainEnded = false;
	  this._lastCurrent = null;
	
	  var $ = this;
	  this._$handleMainSource = function(event) {  $._handleMainSource(event)  };
	}
	
	inherit(FlatMap, _AbstractPool, {
	
	  _onActivation: function() {
	    _AbstractPool.prototype._onActivation.call(this);
	    if (this._active) {
	      this._activating = true;
	      this._source.onAny(this._$handleMainSource);
	      this._activating = false;
	    }
	  },
	  _onDeactivation: function() {
	    _AbstractPool.prototype._onDeactivation.call(this);
	    this._source.offAny(this._$handleMainSource);
	  },
	
	  _handleMainSource: function(event) {
	    if (event.type === VALUE) {
	      if (!event.current || this._lastCurrent !== event.value) {
	        this._add(event.value, this._fn);
	      }
	      this._lastCurrent = event.value;
	    }
	    if (event.type === ERROR) {
	      this._send(ERROR, event.value, event.current);
	    }
	    if (event.type === END) {
	      if (this._isEmpty()) {
	        this._send(END, null, event.current);
	      } else {
	        this._mainEnded = true;
	      }
	    }
	  },
	
	  _onEmpty: function() {
	    if (this._mainEnded) {  this._send(END)  }
	  },
	
	  _clear: function() {
	    _AbstractPool.prototype._clear.call(this);
	    this._source = null;
	    this._lastCurrent = null;
	    this._$handleMainSource = null;
	  }
	
	});
	
	Observable.prototype.flatMap = function(fn) {
	  return new FlatMap(this, fn)
	    .setName(this, 'flatMap');
	}
	
	Observable.prototype.flatMapLatest = function(fn) {
	  return new FlatMap(this, fn, {concurLim: 1, drop: 'old'})
	    .setName(this, 'flatMapLatest');
	}
	
	Observable.prototype.flatMapFirst = function(fn) {
	  return new FlatMap(this, fn, {concurLim: 1})
	    .setName(this, 'flatMapFirst');
	}
	
	Observable.prototype.flatMapConcat = function(fn) {
	  return new FlatMap(this, fn, {queueLim: -1, concurLim: 1})
	    .setName(this, 'flatMapConcat');
	}
	
	Observable.prototype.flatMapConcurLimit = function(fn, limit) {
	  var result;
	  if (limit === 0) {
	    result = Kefir.never();
	  } else {
	    if (limit < 0) {  limit = -1  }
	    result = new FlatMap(this, fn, {queueLim: -1, concurLim: limit});
	  }
	  return result.setName(this, 'flatMapConcurLimit');
	}
	
	
	
	
	
	
	// .zip()
	
	function Zip(sources, combinator) {
	  Stream.call(this);
	  if (sources.length === 0) {
	    this._send(END);
	  } else {
	    this._buffers = map(sources, function(source) {
	      return isArray(source) ? cloneArray(source) : [];
	    });
	    this._sources = map(sources, function(source) {
	      return isArray(source) ? Kefir.never() : source;
	    });
	    this._combinator = combinator ? spread(combinator, this._sources.length) : id;
	    this._aliveCount = 0;
	  }
	}
	
	
	inherit(Zip, Stream, {
	
	  _name: 'zip',
	
	  _onActivation: function() {
	    var i, length = this._sources.length;
	    this._drainArrays();
	    this._aliveCount = length;
	    for (i = 0; i < length; i++) {
	      this._sources[i].onAny(this._bindHandleAny(i), [this, i]);
	    }
	  },
	
	  _onDeactivation: function() {
	    for (var i = 0; i < this._sources.length; i++) {
	      this._sources[i].offAny(null, [this, i]);
	    }
	  },
	
	  _emit: function(isCurrent) {
	    var values = new Array(this._buffers.length);
	    for (var i = 0; i < this._buffers.length; i++) {
	      values[i] = this._buffers[i].shift();
	    }
	    this._send(VALUE, this._combinator(values), isCurrent);
	  },
	
	  _isFull: function() {
	    for (var i = 0; i < this._buffers.length; i++) {
	      if (this._buffers[i].length === 0) {
	        return false;
	      }
	    }
	    return true;
	  },
	
	  _emitIfFull: function(isCurrent) {
	    if (this._isFull()) {
	      this._emit(isCurrent);
	    }
	  },
	
	  _drainArrays: function() {
	    while (this._isFull()) {
	      this._emit(true);
	    }
	  },
	
	  _bindHandleAny: function(i) {
	    var $ = this;
	    return function(event) {  $._handleAny(i, event)  };
	  },
	
	  _handleAny: function(i, event) {
	    if (event.type === VALUE) {
	      this._buffers[i].push(event.value);
	      this._emitIfFull(event.current);
	    }
	    if (event.type === ERROR) {
	      this._send(ERROR, event.value, event.current);
	    }
	    if (event.type === END) {
	      this._aliveCount--;
	      if (this._aliveCount === 0) {
	        this._send(END, null, event.current);
	      }
	    }
	  },
	
	  _clear: function() {
	    Stream.prototype._clear.call(this);
	    this._sources = null;
	    this._buffers = null;
	    this._combinator = null;
	  }
	
	});
	
	Kefir.zip = function(sources, combinator) {
	  return new Zip(sources, combinator);
	}
	
	Observable.prototype.zip = function(other, combinator) {
	  return new Zip([this, other], combinator);
	}
	
	
	
	
	
	
	// .sampledBy()
	
	function SampledBy(passive, active, combinator) {
	  Stream.call(this);
	  if (active.length === 0) {
	    this._send(END);
	  } else {
	    this._passiveCount = passive.length;
	    this._sources = concat(passive, active);
	    this._combinator = combinator ? spread(combinator, this._sources.length) : id;
	    this._aliveCount = 0;
	    this._currents = new Array(this._sources.length);
	    fillArray(this._currents, NOTHING);
	    this._activating = false;
	    this._emitAfterActivation = false;
	    this._endAfterActivation = false;
	  }
	}
	
	
	inherit(SampledBy, Stream, {
	
	  _name: 'sampledBy',
	
	  _onActivation: function() {
	    var length = this._sources.length,
	        i;
	    this._aliveCount = length - this._passiveCount;
	    this._activating = true;
	    for (i = 0; i < length; i++) {
	      this._sources[i].onAny(this._bindHandleAny(i), [this, i]);
	    }
	    this._activating = false;
	    if (this._emitAfterActivation) {
	      this._emitAfterActivation = false;
	      this._emitIfFull(true);
	    }
	    if (this._endAfterActivation) {
	      this._send(END, null, true);
	    }
	  },
	
	  _onDeactivation: function() {
	    var length = this._sources.length,
	        i;
	    for (i = 0; i < length; i++) {
	      this._sources[i].offAny(null, [this, i]);
	    }
	  },
	
	  _emitIfFull: function(isCurrent) {
	    if (!contains(this._currents, NOTHING)) {
	      var combined = cloneArray(this._currents);
	      combined = this._combinator(combined);
	      this._send(VALUE, combined, isCurrent);
	    }
	  },
	
	  _bindHandleAny: function(i) {
	    var $ = this;
	    return function(event) {  $._handleAny(i, event)  };
	  },
	
	  _handleAny: function(i, event) {
	    if (event.type === VALUE) {
	      this._currents[i] = event.value;
	      if (i >= this._passiveCount) {
	        if (this._activating) {
	          this._emitAfterActivation = true;
	        } else {
	          this._emitIfFull(event.current);
	        }
	      }
	    }
	    if (event.type === ERROR) {
	      this._send(ERROR, event.value, event.current);
	    }
	    if (event.type === END) {
	      if (i >= this._passiveCount) {
	        this._aliveCount--;
	        if (this._aliveCount === 0) {
	          if (this._activating) {
	            this._endAfterActivation = true;
	          } else {
	            this._send(END, null, event.current);
	          }
	        }
	      }
	    }
	  },
	
	  _clear: function() {
	    Stream.prototype._clear.call(this);
	    this._sources = null;
	    this._currents = null;
	    this._combinator = null;
	  }
	
	});
	
	Kefir.sampledBy = function(passive, active, combinator) {
	  return new SampledBy(passive, active, combinator);
	}
	
	Observable.prototype.sampledBy = function(other, combinator) {
	  return Kefir.sampledBy([this], [other], combinator || id);
	}
	
	
	
	
	// .combine()
	
	Kefir.combine = function(sources, combinator) {
	  return new SampledBy([], sources, combinator).setName('combine');
	}
	
	Observable.prototype.combine = function(other, combinator) {
	  return Kefir.combine([this, other], combinator);
	}
	
	function produceStream(StreamClass, PropertyClass) {
	  return function() {  return new StreamClass(this, arguments)  }
	}
	function produceProperty(StreamClass, PropertyClass) {
	  return function() {  return new PropertyClass(this, arguments)  }
	}
	
	
	
	// .toProperty()
	
	withOneSource('toProperty', {
	  _init: function(args) {
	    if (args.length > 0) {
	      this._send(VALUE, args[0]);
	    }
	  }
	}, {propertyMethod: produceProperty, streamMethod: produceProperty});
	
	
	
	// .withDefault (Deprecated)
	
	Stream.prototype.withDefault = Stream.prototype.toProperty;
	Property.prototype.withDefault = Property.prototype.toProperty;
	
	
	
	
	
	// .changes()
	
	withOneSource('changes', {
	  _handleValue: function(x, isCurrent) {
	    if (!isCurrent) {
	      this._send(VALUE, x);
	    }
	  },
	  _handleError: function(x, isCurrent) {
	    if (!isCurrent) {
	      this._send(ERROR, x);
	    }
	  }
	}, {
	  streamMethod: function() {
	    return function() {
	      return this;
	    }
	  },
	  propertyMethod: produceStream
	});
	
	
	
	
	// .withHandler()
	
	withOneSource('withHandler', {
	  _init: function(args) {
	    this._handler = args[0];
	    this._forcedCurrent = false;
	    var $ = this;
	    this._emitter = {
	      emit: function(x) {  $._send(VALUE, x, $._forcedCurrent)  },
	      error: function(x) {  $._send(ERROR, x, $._forcedCurrent)  },
	      end: function() {  $._send(END, null, $._forcedCurrent)  }
	    }
	  },
	  _free: function() {
	    this._handler = null;
	    this._emitter = null;
	  },
	  _handleAny: function(event) {
	    this._forcedCurrent = event.current;
	    this._handler(this._emitter, event);
	    this._forcedCurrent = false;
	  }
	});
	
	
	
	
	// .flatten(fn)
	
	withOneSource('flatten', {
	  _init: function(args) {
	    this._fn = args[0] ? args[0] : id;
	  },
	  _free: function() {
	    this._fn = null;
	  },
	  _handleValue: function(x, isCurrent) {
	    var xs = this._fn(x);
	    for (var i = 0; i < xs.length; i++) {
	      this._send(VALUE, xs[i], isCurrent);
	    }
	  }
	});
	
	
	
	
	
	
	
	// .transduce(transducer)
	
	function xformForObs(obs) {
	  return {
	    step: function(res, input) {
	      obs._send(VALUE, input, obs._forcedCurrent);
	      return null;
	    },
	    result: function(res) {
	      obs._send(END, null, obs._forcedCurrent);
	      return null;
	    }
	  };
	}
	
	withOneSource('transduce', {
	  _init: function(args) {
	    this._xform = args[0](xformForObs(this));
	  },
	  _free: function() {
	    this._xform = null;
	  },
	  _handleValue: function(x, isCurrent) {
	    this._forcedCurrent = isCurrent;
	    if (this._xform.step(null, x) !== null) {
	      this._xform.result(null);
	    }
	    this._forcedCurrent = false;
	  },
	  _handleEnd: function(__, isCurrent) {
	    this._forcedCurrent = isCurrent;
	    this._xform.result(null);
	    this._forcedCurrent = false;
	  }
	});
	
	
	
	
	
	var withFnArgMixin = {
	  _init: function(args) {  this._fn = args[0] || id  },
	  _free: function() {  this._fn = null  }
	};
	
	
	
	// .map(fn)
	
	withOneSource('map', extend({
	  _handleValue: function(x, isCurrent) {
	    this._send(VALUE, this._fn(x), isCurrent);
	  }
	}, withFnArgMixin));
	
	
	
	
	// .mapErrors(fn)
	
	withOneSource('mapErrors', extend({
	  _handleError: function(x, isCurrent) {
	    this._send(ERROR, this._fn(x), isCurrent);
	  }
	}, withFnArgMixin));
	
	
	
	// .errorsToValues(fn)
	
	function defaultErrorsToValuesHandler(x) {
	  return {
	    convert: true,
	    value: x
	  };
	}
	
	withOneSource('errorsToValues', extend({
	  _init: function(args) {
	    this._fn = args[0] || defaultErrorsToValuesHandler;
	  },
	  _free: function() {
	    this._fn = null;
	  },
	  _handleError: function(x, isCurrent) {
	    var result = this._fn(x);
	    var type = result.convert ? VALUE : ERROR;
	    var newX = result.convert ? result.value : x;
	    this._send(type, newX, isCurrent);
	  }
	}));
	
	
	
	// .valuesToErrors(fn)
	
	function defaultValuesToErrorsHandler(x) {
	  return {
	    convert: true,
	    error: x
	  };
	}
	
	withOneSource('valuesToErrors', extend({
	  _init: function(args) {
	    this._fn = args[0] || defaultValuesToErrorsHandler;
	  },
	  _free: function() {
	    this._fn = null;
	  },
	  _handleValue: function(x, isCurrent) {
	    var result = this._fn(x);
	    var type = result.convert ? ERROR : VALUE;
	    var newX = result.convert ? result.error : x;
	    this._send(type, newX, isCurrent);
	  }
	}));
	
	
	
	
	// .filter(fn)
	
	withOneSource('filter', extend({
	  _handleValue: function(x, isCurrent) {
	    if (this._fn(x)) {
	      this._send(VALUE, x, isCurrent);
	    }
	  }
	}, withFnArgMixin));
	
	
	
	
	// .filterErrors(fn)
	
	withOneSource('filterErrors', extend({
	  _handleError: function(x, isCurrent) {
	    if (this._fn(x)) {
	      this._send(ERROR, x, isCurrent);
	    }
	  }
	}, withFnArgMixin));
	
	
	
	
	// .takeWhile(fn)
	
	withOneSource('takeWhile', extend({
	  _handleValue: function(x, isCurrent) {
	    if (this._fn(x)) {
	      this._send(VALUE, x, isCurrent);
	    } else {
	      this._send(END, null, isCurrent);
	    }
	  }
	}, withFnArgMixin));
	
	
	
	
	
	// .take(n)
	
	withOneSource('take', {
	  _init: function(args) {
	    this._n = args[0];
	    if (this._n <= 0) {
	      this._send(END);
	    }
	  },
	  _handleValue: function(x, isCurrent) {
	    this._n--;
	    this._send(VALUE, x, isCurrent);
	    if (this._n === 0) {
	      this._send(END, null, isCurrent);
	    }
	  }
	});
	
	
	
	
	
	// .skip(n)
	
	withOneSource('skip', {
	  _init: function(args) {
	    this._n = Math.max(0, args[0]);
	  },
	  _handleValue: function(x, isCurrent) {
	    if (this._n === 0) {
	      this._send(VALUE, x, isCurrent);
	    } else {
	      this._n--;
	    }
	  }
	});
	
	
	
	
	// .skipDuplicates([fn])
	
	withOneSource('skipDuplicates', {
	  _init: function(args) {
	    this._fn = args[0] || strictEqual;
	    this._prev = NOTHING;
	  },
	  _free: function() {
	    this._fn = null;
	    this._prev = null;
	  },
	  _handleValue: function(x, isCurrent) {
	    if (this._prev === NOTHING || !this._fn(this._prev, x)) {
	      this._send(VALUE, x, isCurrent);
	      this._prev = x;
	    }
	  }
	});
	
	
	
	
	
	// .skipWhile(fn)
	
	withOneSource('skipWhile', {
	  _init: function(args) {
	    this._fn = args[0] || id;
	    this._skip = true;
	  },
	  _free: function() {
	    this._fn = null;
	  },
	  _handleValue: function(x, isCurrent) {
	    if (!this._skip) {
	      this._send(VALUE, x, isCurrent);
	      return;
	    }
	    if (!this._fn(x)) {
	      this._skip = false;
	      this._fn = null;
	      this._send(VALUE, x, isCurrent);
	    }
	  }
	});
	
	
	
	
	
	// .diff(fn, seed)
	
	withOneSource('diff', {
	  _init: function(args) {
	    this._fn = args[0] || defaultDiff;
	    this._prev = args.length > 1 ? args[1] : NOTHING;
	  },
	  _free: function() {
	    this._prev = null;
	    this._fn = null;
	  },
	  _handleValue: function(x, isCurrent) {
	    if (this._prev !== NOTHING) {
	      this._send(VALUE, this._fn(this._prev, x), isCurrent);
	    }
	    this._prev = x;
	  }
	});
	
	
	
	
	
	// .scan(fn, seed)
	
	withOneSource('scan', {
	  _init: function(args) {
	    this._fn = args[0];
	    if (args.length > 1) {
	      this._send(VALUE, args[1], true);
	    }
	  },
	  _free: function() {
	    this._fn = null;
	  },
	  _handleValue: function(x, isCurrent) {
	    if (this._current !== NOTHING) {
	      x = this._fn(this._current, x);
	    }
	    this._send(VALUE, x, isCurrent);
	  }
	}, {streamMethod: produceProperty});
	
	
	
	
	
	// .reduce(fn, seed)
	
	withOneSource('reduce', {
	  _init: function(args) {
	    this._fn = args[0];
	    this._result = args.length > 1 ? args[1] : NOTHING;
	  },
	  _free: function() {
	    this._fn = null;
	    this._result = null;
	  },
	  _handleValue: function(x) {
	    this._result = (this._result === NOTHING) ? x : this._fn(this._result, x);
	  },
	  _handleEnd: function(__, isCurrent) {
	    if (this._result !== NOTHING) {
	      this._send(VALUE, this._result, isCurrent);
	    }
	    this._send(END, null, isCurrent);
	  }
	});
	
	
	
	
	// .mapEnd(fn)
	
	withOneSource('mapEnd', {
	  _init: function(args) {
	    this._fn = args[0];
	  },
	  _free: function() {
	    this._fn = null;
	  },
	  _handleEnd: function(__, isCurrent) {
	    this._send(VALUE, this._fn(), isCurrent);
	    this._send(END, null, isCurrent);
	  }
	});
	
	
	
	
	// .skipValue()
	
	withOneSource('skipValues', {
	  _handleValue: function() {}
	});
	
	
	
	// .skipError()
	
	withOneSource('skipErrors', {
	  _handleError: function() {}
	});
	
	
	
	// .skipEnd()
	
	withOneSource('skipEnd', {
	  _handleEnd: function() {}
	});
	
	
	
	// .endOnError(fn)
	
	withOneSource('endOnError', extend({
	  _handleError: function(x, isCurrent) {
	    this._send(ERROR, x, isCurrent);
	    this._send(END, null, isCurrent);
	  }
	}));
	
	
	
	// .slidingWindow(max[, min])
	
	withOneSource('slidingWindow', {
	  _init: function(args) {
	    this._max = args[0];
	    this._min = args[1] || 0;
	    this._buff = [];
	  },
	  _free: function() {
	    this._buff = null;
	  },
	  _handleValue: function(x, isCurrent) {
	    this._buff = slide(this._buff, x, this._max);
	    if (this._buff.length >= this._min) {
	      this._send(VALUE, this._buff, isCurrent);
	    }
	  }
	});
	
	
	
	
	// .bufferWhile([predicate], [options])
	
	withOneSource('bufferWhile', {
	  _init: function(args) {
	    this._fn = args[0] || id;
	    this._flushOnEnd = get(args[1], 'flushOnEnd', true);
	    this._buff = [];
	  },
	  _free: function() {
	    this._buff = null;
	  },
	  _flush: function(isCurrent) {
	    if (this._buff !== null && this._buff.length !== 0) {
	      this._send(VALUE, this._buff, isCurrent);
	      this._buff = [];
	    }
	  },
	  _handleValue: function(x, isCurrent) {
	    this._buff.push(x);
	    if (!this._fn(x)) {
	      this._flush(isCurrent);
	    }
	  },
	  _handleEnd: function(x, isCurrent) {
	    if (this._flushOnEnd) {
	      this._flush(isCurrent);
	    }
	    this._send(END, null, isCurrent);
	  }
	});
	
	
	
	
	
	// .debounce(wait, {immediate})
	
	withOneSource('debounce', {
	  _init: function(args) {
	    this._wait = Math.max(0, args[0]);
	    this._immediate = get(args[1], 'immediate', false);
	    this._lastAttempt = 0;
	    this._timeoutId = null;
	    this._laterValue = null;
	    this._endLater = false;
	    var $ = this;
	    this._$later = function() {  $._later()  };
	  },
	  _free: function() {
	    this._laterValue = null;
	    this._$later = null;
	  },
	  _handleValue: function(x, isCurrent) {
	    if (isCurrent) {
	      this._send(VALUE, x, isCurrent);
	    } else {
	      this._lastAttempt = now();
	      if (this._immediate && !this._timeoutId) {
	        this._send(VALUE, x);
	      }
	      if (!this._timeoutId) {
	        this._timeoutId = setTimeout(this._$later, this._wait);
	      }
	      if (!this._immediate) {
	        this._laterValue = x;
	      }
	    }
	  },
	  _handleEnd: function(__, isCurrent) {
	    if (isCurrent) {
	      this._send(END, null, isCurrent);
	    } else {
	      if (this._timeoutId && !this._immediate) {
	        this._endLater = true;
	      } else {
	        this._send(END);
	      }
	    }
	  },
	  _later: function() {
	    var last = now() - this._lastAttempt;
	    if (last < this._wait && last >= 0) {
	      this._timeoutId = setTimeout(this._$later, this._wait - last);
	    } else {
	      this._timeoutId = null;
	      if (!this._immediate) {
	        this._send(VALUE, this._laterValue);
	        this._laterValue = null;
	      }
	      if (this._endLater) {
	        this._send(END);
	      }
	    }
	  }
	});
	
	
	
	
	
	// .throttle(wait, {leading, trailing})
	
	withOneSource('throttle', {
	  _init: function(args) {
	    this._wait = Math.max(0, args[0]);
	    this._leading = get(args[1], 'leading', true);
	    this._trailing = get(args[1], 'trailing', true);
	    this._trailingValue = null;
	    this._timeoutId = null;
	    this._endLater = false;
	    this._lastCallTime = 0;
	    var $ = this;
	    this._$trailingCall = function() {  $._trailingCall()  };
	  },
	  _free: function() {
	    this._trailingValue = null;
	    this._$trailingCall = null;
	  },
	  _handleValue: function(x, isCurrent) {
	    if (isCurrent) {
	      this._send(VALUE, x, isCurrent);
	    } else {
	      var curTime = now();
	      if (this._lastCallTime === 0 && !this._leading) {
	        this._lastCallTime = curTime;
	      }
	      var remaining = this._wait - (curTime - this._lastCallTime);
	      if (remaining <= 0) {
	        this._cancelTraling();
	        this._lastCallTime = curTime;
	        this._send(VALUE, x);
	      } else if (this._trailing) {
	        this._cancelTraling();
	        this._trailingValue = x;
	        this._timeoutId = setTimeout(this._$trailingCall, remaining);
	      }
	    }
	  },
	  _handleEnd: function(__, isCurrent) {
	    if (isCurrent) {
	      this._send(END, null, isCurrent);
	    } else {
	      if (this._timeoutId) {
	        this._endLater = true;
	      } else {
	        this._send(END);
	      }
	    }
	  },
	  _cancelTraling: function() {
	    if (this._timeoutId !== null) {
	      clearTimeout(this._timeoutId);
	      this._timeoutId = null;
	    }
	  },
	  _trailingCall: function() {
	    this._send(VALUE, this._trailingValue);
	    this._timeoutId = null;
	    this._trailingValue = null;
	    this._lastCallTime = !this._leading ? 0 : now();
	    if (this._endLater) {
	      this._send(END);
	    }
	  }
	});
	
	
	
	
	
	// .delay()
	
	withOneSource('delay', {
	  _init: function(args) {
	    this._wait = Math.max(0, args[0]);
	    this._buff = [];
	    var $ = this;
	    this._$shiftBuff = function() {  $._send(VALUE, $._buff.shift())  }
	  },
	  _free: function() {
	    this._buff = null;
	    this._$shiftBuff = null;
	  },
	  _handleValue: function(x, isCurrent) {
	    if (isCurrent) {
	      this._send(VALUE, x, isCurrent);
	    } else {
	      this._buff.push(x);
	      setTimeout(this._$shiftBuff, this._wait);
	    }
	  },
	  _handleEnd: function(__, isCurrent) {
	    if (isCurrent) {
	      this._send(END, null, isCurrent);
	    } else {
	      var $ = this;
	      setTimeout(function() {  $._send(END)  }, this._wait);
	    }
	  }
	});
	
	// Kefir.fromBinder(fn)
	
	function FromBinder(fn) {
	  Stream.call(this);
	  this._fn = fn;
	  this._unsubscribe = null;
	}
	
	inherit(FromBinder, Stream, {
	
	  _name: 'fromBinder',
	
	  _onActivation: function() {
	    var $ = this
	      , isCurrent = true
	      , emitter = {
	        emit: function(x) {  $._send(VALUE, x, isCurrent)  },
	        error: function(x) {  $._send(ERROR, x, isCurrent)  },
	        end: function() {  $._send(END, null, isCurrent)  }
	      };
	    this._unsubscribe = this._fn(emitter) || null;
	
	    // work around https://github.com/pozadi/kefir/issues/35
	    if (!this._active && this._unsubscribe !== null) {
	      this._unsubscribe();
	      this._unsubscribe = null;
	    }
	
	    isCurrent = false;
	  },
	  _onDeactivation: function() {
	    if (this._unsubscribe !== null) {
	      this._unsubscribe();
	      this._unsubscribe = null;
	    }
	  },
	
	  _clear: function() {
	    Stream.prototype._clear.call(this);
	    this._fn = null;
	  }
	
	})
	
	Kefir.fromBinder = function(fn) {
	  return new FromBinder(fn);
	}
	
	
	
	
	
	
	// Kefir.emitter()
	
	function Emitter() {
	  Stream.call(this);
	}
	
	inherit(Emitter, Stream, {
	  _name: 'emitter',
	  emit: function(x) {
	    this._send(VALUE, x);
	    return this;
	  },
	  error: function(x) {
	    this._send(ERROR, x);
	    return this;
	  },
	  end: function() {
	    this._send(END);
	    return this;
	  }
	});
	
	Kefir.emitter = function() {
	  return new Emitter();
	}
	
	Kefir.Emitter = Emitter;
	
	
	
	
	
	
	
	// Kefir.never()
	
	var neverObj = new Stream();
	neverObj._send(END);
	neverObj._name = 'never';
	Kefir.never = function() {  return neverObj  }
	
	
	
	
	
	// Kefir.constant(x)
	
	function Constant(x) {
	  Property.call(this);
	  this._send(VALUE, x);
	  this._send(END);
	}
	
	inherit(Constant, Property, {
	  _name: 'constant'
	})
	
	Kefir.constant = function(x) {
	  return new Constant(x);
	}
	
	
	
	
	// Kefir.constantError(x)
	
	function ConstantError(x) {
	  Property.call(this);
	  this._send(ERROR, x);
	  this._send(END);
	}
	
	inherit(ConstantError, Property, {
	  _name: 'constantError'
	})
	
	Kefir.constantError = function(x) {
	  return new ConstantError(x);
	}
	
	
	// .setName
	
	Observable.prototype.setName = function(sourceObs, selfName /* or just selfName */) {
	  this._name = selfName ? sourceObs._name + '.' + selfName : sourceObs;
	  return this;
	}
	
	
	
	// .mapTo
	
	Observable.prototype.mapTo = function(value) {
	  return this.map(function() {  return value  }).setName(this, 'mapTo');
	}
	
	
	
	// .pluck
	
	Observable.prototype.pluck = function(propertyName) {
	  return this.map(function(x) {
	    return x[propertyName];
	  }).setName(this, 'pluck');
	}
	
	
	
	// .invoke
	
	Observable.prototype.invoke = function(methodName /*, arg1, arg2... */) {
	  var args = rest(arguments, 1);
	  return this.map(args ?
	    function(x) {  return apply(x[methodName], x, args)  } :
	    function(x) {  return x[methodName]()  }
	  ).setName(this, 'invoke');
	}
	
	
	
	
	// .timestamp
	
	Observable.prototype.timestamp = function() {
	  return this.map(function(x) {  return {value: x, time: now()}  }).setName(this, 'timestamp');
	}
	
	
	
	
	// .tap
	
	Observable.prototype.tap = function(fn) {
	  return this.map(function(x) {
	    fn(x);
	    return x;
	  }).setName(this, 'tap');
	}
	
	
	
	// .and
	
	Kefir.and = function(observables) {
	  return Kefir.combine(observables, and).setName('and');
	}
	
	Observable.prototype.and = function(other) {
	  return this.combine(other, and).setName('and');
	}
	
	
	
	// .or
	
	Kefir.or = function(observables) {
	  return Kefir.combine(observables, or).setName('or');
	}
	
	Observable.prototype.or = function(other) {
	  return this.combine(other, or).setName('or');
	}
	
	
	
	// .not
	
	Observable.prototype.not = function() {
	  return this.map(not).setName(this, 'not');
	}
	
	
	
	// .awaiting
	
	Observable.prototype.awaiting = function(other) {
	  return Kefir.merge([
	    this.mapTo(true),
	    other.mapTo(false)
	  ]).skipDuplicates().toProperty(false).setName(this, 'awaiting');
	}
	
	
	
	
	// .fromCallback
	
	Kefir.fromCallback = function(callbackConsumer) {
	  var called = false;
	  return Kefir.fromBinder(function(emitter) {
	    if (!called) {
	      callbackConsumer(function(x) {
	        emitter.emit(x);
	        emitter.end();
	      });
	      called = true;
	    }
	  }).setName('fromCallback');
	}
	
	
	
	
	// .fromNodeCallback
	
	Kefir.fromNodeCallback = function(callbackConsumer) {
	  var called = false;
	  return Kefir.fromBinder(function(emitter) {
	    if (!called) {
	      callbackConsumer(function(error, x) {
	        if (error) {
	          emitter.error(error);
	        } else {
	          emitter.emit(x);
	        }
	        emitter.end();
	      });
	      called = true;
	    }
	  }).setName('fromNodeCallback');
	}
	
	
	
	
	// .fromPromise
	
	Kefir.fromPromise = function(promise) {
	  var called = false;
	  return Kefir.fromBinder(function(emitter) {
	    if (!called) {
	      var onValue = function(x) {
	        emitter.emit(x);
	        emitter.end();
	      };
	      var onError = function(x) {
	        emitter.error(x);
	        emitter.end();
	      };
	      var _promise = promise.then(onValue, onError);
	
	      // prevent promise/A+ libraries like Q to swallow exceptions
	      if (_promise && isFn(_promise.done)) {
	        _promise.done();
	      }
	
	      called = true;
	    }
	  }).toProperty().setName('fromPromise');
	}
	
	
	
	
	
	
	// .fromSubUnsub
	
	Kefir.fromSubUnsub = function(sub, unsub, transformer) {
	  return Kefir.fromBinder(function(emitter) {
	    var handler = transformer ? function() {
	      emitter.emit(apply(transformer, this, arguments));
	    } : emitter.emit;
	    sub(handler);
	    return function() {  unsub(handler)  };
	  });
	}
	
	
	
	
	// .fromEvent
	
	var subUnsubPairs = [
	  ['addEventListener', 'removeEventListener'],
	  ['addListener', 'removeListener'],
	  ['on', 'off']
	];
	
	Kefir.fromEvent = function(target, eventName, transformer) {
	  var pair, sub, unsub;
	
	  for (var i = 0; i < subUnsubPairs.length; i++) {
	    pair = subUnsubPairs[i];
	    if (isFn(target[pair[0]]) && isFn(target[pair[1]])) {
	      sub = pair[0];
	      unsub = pair[1];
	      break;
	    }
	  }
	
	  if (sub === undefined) {
	    throw new Error('target don\'t support any of ' +
	      'addEventListener/removeEventListener, addListener/removeListener, on/off method pair');
	  }
	
	  return Kefir.fromSubUnsub(
	    function(handler) {  target[sub](eventName, handler)  },
	    function(handler) {  target[unsub](eventName, handler)  },
	    transformer
	  ).setName('fromEvent');
	}
	
	var withTwoSourcesAndBufferMixin = {
	  _init: function(args) {
	    this._buff = [];
	    this._flushOnEnd = get(args[0], 'flushOnEnd', true);
	  },
	  _free: function() {
	    this._buff = null;
	  },
	  _flush: function(isCurrent) {
	    if (this._buff !== null && this._buff.length !== 0) {
	      this._send(VALUE, this._buff, isCurrent);
	      this._buff = [];
	    }
	  },
	
	  _handlePrimaryEnd: function(__, isCurrent) {
	    if (this._flushOnEnd) {
	      this._flush(isCurrent);
	    }
	    this._send(END, null, isCurrent);
	  }
	};
	
	
	
	withTwoSources('bufferBy', extend({
	
	  _onActivation: function() {
	    this._primary.onAny(this._$handlePrimaryAny);
	    if (this._alive && this._secondary !== null) {
	      this._secondary.onAny(this._$handleSecondaryAny);
	    }
	  },
	
	  _handlePrimaryValue: function(x, isCurrent) {
	    this._buff.push(x);
	  },
	
	  _handleSecondaryValue: function(x, isCurrent) {
	    this._flush(isCurrent);
	  },
	
	  _handleSecondaryEnd: function(x, isCurrent) {
	    if (!this._flushOnEnd) {
	      this._send(END, null, isCurrent);
	    }
	  }
	
	}, withTwoSourcesAndBufferMixin));
	
	
	
	
	withTwoSources('bufferWhileBy', extend({
	
	  _handlePrimaryValue: function(x, isCurrent) {
	    this._buff.push(x);
	    if (this._lastSecondary !== NOTHING && !this._lastSecondary) {
	      this._flush(isCurrent);
	    }
	  },
	
	  _handleSecondaryEnd: function(x, isCurrent) {
	    if (!this._flushOnEnd && (this._lastSecondary === NOTHING || this._lastSecondary)) {
	      this._send(END, null, isCurrent);
	    }
	  }
	
	}, withTwoSourcesAndBufferMixin));
	
	
	
	
	
	withTwoSources('filterBy', {
	
	  _handlePrimaryValue: function(x, isCurrent) {
	    if (this._lastSecondary !== NOTHING && this._lastSecondary) {
	      this._send(VALUE, x, isCurrent);
	    }
	  },
	
	  _handleSecondaryEnd: function(__, isCurrent) {
	    if (this._lastSecondary === NOTHING || !this._lastSecondary) {
	      this._send(END, null, isCurrent);
	    }
	  }
	
	});
	
	
	
	withTwoSources('skipUntilBy', {
	
	  _handlePrimaryValue: function(x, isCurrent) {
	    if (this._lastSecondary !== NOTHING) {
	      this._send(VALUE, x, isCurrent);
	    }
	  },
	
	  _handleSecondaryEnd: function(__, isCurrent) {
	    if (this._lastSecondary === NOTHING) {
	      this._send(END, null, isCurrent);
	    }
	  }
	
	});
	
	
	
	withTwoSources('takeUntilBy', {
	
	  _handleSecondaryValue: function(x, isCurrent) {
	    this._send(END, null, isCurrent);
	  }
	
	});
	
	
	
	withTwoSources('takeWhileBy', {
	
	  _handlePrimaryValue: function(x, isCurrent) {
	    if (this._lastSecondary !== NOTHING) {
	      this._send(VALUE, x, isCurrent);
	    }
	  },
	
	  _handleSecondaryValue: function(x, isCurrent) {
	    this._lastSecondary = x;
	    if (!this._lastSecondary) {
	      this._send(END, null, isCurrent);
	    }
	  },
	
	  _handleSecondaryEnd: function(__, isCurrent) {
	    if (this._lastSecondary === NOTHING) {
	      this._send(END, null, isCurrent);
	    }
	  }
	
	});
	
	
	
	
	withTwoSources('skipWhileBy', {
	
	  _init: function() {
	    this._hasFalseyFromSecondary = false;
	  },
	
	  _handlePrimaryValue: function(x, isCurrent) {
	    if (this._hasFalseyFromSecondary) {
	      this._send(VALUE, x, isCurrent);
	    }
	  },
	
	  _handleSecondaryValue: function(x, isCurrent) {
	    this._hasFalseyFromSecondary = this._hasFalseyFromSecondary || !x;
	  },
	
	  _handleSecondaryEnd: function(__, isCurrent) {
	    if (!this._hasFalseyFromSecondary) {
	      this._send(END, null, isCurrent);
	    }
	  }
	
	});
	
	
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
	      return Kefir;
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    global.Kefir = Kefir;
	  } else if (typeof module === "object" && typeof exports === "object") {
	    module.exports = Kefir;
	    Kefir.Kefir = Kefir;
	  } else {
	    global.Kefir = Kefir;
	  }
	
	}(this));

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	'use strict';
	
	// If obj.hasOwnProperty has been overridden, then calling
	// obj.hasOwnProperty(prop) will break.
	// See: https://github.com/joyent/node/issues/1707
	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}
	
	module.exports = function(qs, sep, eq, options) {
	  sep = sep || '&';
	  eq = eq || '=';
	  var obj = {};
	
	  if (typeof qs !== 'string' || qs.length === 0) {
	    return obj;
	  }
	
	  var regexp = /\+/g;
	  qs = qs.split(sep);
	
	  var maxKeys = 1000;
	  if (options && typeof options.maxKeys === 'number') {
	    maxKeys = options.maxKeys;
	  }
	
	  var len = qs.length;
	  // maxKeys <= 0 means that we should not limit keys count
	  if (maxKeys > 0 && len > maxKeys) {
	    len = maxKeys;
	  }
	
	  for (var i = 0; i < len; ++i) {
	    var x = qs[i].replace(regexp, '%20'),
	        idx = x.indexOf(eq),
	        kstr, vstr, k, v;
	
	    if (idx >= 0) {
	      kstr = x.substr(0, idx);
	      vstr = x.substr(idx + 1);
	    } else {
	      kstr = x;
	      vstr = '';
	    }
	
	    k = decodeURIComponent(kstr);
	    v = decodeURIComponent(vstr);
	
	    if (!hasOwnProperty(obj, k)) {
	      obj[k] = v;
	    } else if (isArray(obj[k])) {
	      obj[k].push(v);
	    } else {
	      obj[k] = [obj[k], v];
	    }
	  }
	
	  return obj;
	};
	
	var isArray = Array.isArray || function (xs) {
	  return Object.prototype.toString.call(xs) === '[object Array]';
	};


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	'use strict';
	
	var stringifyPrimitive = function(v) {
	  switch (typeof v) {
	    case 'string':
	      return v;
	
	    case 'boolean':
	      return v ? 'true' : 'false';
	
	    case 'number':
	      return isFinite(v) ? v : '';
	
	    default:
	      return '';
	  }
	};
	
	module.exports = function(obj, sep, eq, name) {
	  sep = sep || '&';
	  eq = eq || '=';
	  if (obj === null) {
	    obj = undefined;
	  }
	
	  if (typeof obj === 'object') {
	    return map(objectKeys(obj), function(k) {
	      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
	      if (isArray(obj[k])) {
	        return map(obj[k], function(v) {
	          return ks + encodeURIComponent(stringifyPrimitive(v));
	        }).join(sep);
	      } else {
	        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
	      }
	    }).join(sep);
	
	  }
	
	  if (!name) return '';
	  return encodeURIComponent(stringifyPrimitive(name)) + eq +
	         encodeURIComponent(stringifyPrimitive(obj));
	};
	
	var isArray = Array.isArray || function (xs) {
	  return Object.prototype.toString.call(xs) === '[object Array]';
	};
	
	function map (xs, f) {
	  if (xs.map) return xs.map(f);
	  var res = [];
	  for (var i = 0; i < xs.length; i++) {
	    res.push(f(xs[i], i));
	  }
	  return res;
	}
	
	var objectKeys = Object.keys || function (obj) {
	  var res = [];
	  for (var key in obj) {
	    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
	  }
	  return res;
	};


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = Array.isArray || function (arr) {
	  return Object.prototype.toString.call(arr) == '[object Array]';
	};


/***/ }
/******/ ])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZjAyYTIzNzAiLCJ3ZWJwYWNrOi8vLy91c3IvbG9jYWwvbGliL34vcGVsbGV0L3NyYy9pbnN0cnVtZW50YXRpb24uanMiLCJ3ZWJwYWNrOi8vLy91c3IvbG9jYWwvbGliL34vcGVsbGV0L3NyYy9wZWxsZXQuanMiLCJ3ZWJwYWNrOi8vLy91c3IvbG9jYWwvbGliL34vcGVsbGV0L3NyYy9jb21wb25lbnRzL2NvbnNvbGUtcG9seWZpbGwuanMiLCJ3ZWJwYWNrOi8vLy91c3IvbG9jYWwvbGliL34vcGVsbGV0L3NyYy9jb21wb25lbnRzL3VzZXItYWdlbnQtbWl4aW4uanMiLCJ3ZWJwYWNrOi8vLy91c3IvbG9jYWwvbGliL34vcGVsbGV0L3NyYy9pbnN0cnVtZW50YXRpb24vZ29vZ2xlLWFuYWx5dGljcy5qcyIsIndlYnBhY2s6Ly8vL3Vzci9sb2NhbC9saWIvfi9wZWxsZXQvc3JjL2luc3RydW1lbnRhdGlvbi9sb2NhbC5qcyIsIndlYnBhY2s6Ly8vL3Vzci9sb2NhbC9saWIvfi9wZWxsZXQvc3JjL2lzb21vcnBoaWMvcm91dGUuanMiLCJ3ZWJwYWNrOi8vLy91c3IvbG9jYWwvbGliL34vcGVsbGV0L3NyYy9jb21wb25lbnRzL211bHRpdmFyaWF0ZS10ZXN0aW5nL2dhLWV4cGVyaW1lbnQuanMiLCJ3ZWJwYWNrOi8vLy91c3IvbG9jYWwvbGliL34vcGVsbGV0L3NyYy9jb21wb25lbnRzL211bHRpdmFyaWF0ZS10ZXN0aW5nL2Rhc2hib2FyZC9hYm4tZGFzaGJvYXJkLmpzIiwid2VicGFjazovLy8uL2luZGV4LmpzIiwid2VicGFjazovLy8uL2Fib3V0L2Fib3V0LmpzIiwid2VicGFjazovLy8uL2hlbGxvL2hlbGxvLmpzIiwid2VicGFjazovLy8uL2xheW91dDEvbGF5b3V0MS5qcyIsIndlYnBhY2s6Ly8vLi9tZXNzYWdlL21lc3NhZ2UuanMiLCJ3ZWJwYWNrOi8vLy4uL2J1aWxkL19FTUJFRF9JTkRFWC5qcyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJSZWFjdFwiIiwid2VicGFjazovLy8vdXNyL2xvY2FsL2xpYi9+L3BlbGxldC9zcmMvb2JzZXJ2YWJsZXMuanMiLCJ3ZWJwYWNrOi8vLy91c3IvbG9jYWwvbGliL34vcGVsbGV0L3NyYy91dGlscy5qcyIsIndlYnBhY2s6Ly8vL3Vzci9sb2NhbC9saWIvfi9wZWxsZXQvc3JjL2lzb2xhdG9yLmpzIiwid2VicGFjazovLy8vdXNyL2xvY2FsL2xpYi9+L3BlbGxldC9zcmMvY29tcG9uZW50LW1peGluLmpzIiwid2VicGFjazovLy8vdXNyL2xvY2FsL2xpYi9+L3BlbGxldC9zcmMvZXhwZXJpbWVudC1pbnRlcmZhY2UuanMiLCJ3ZWJwYWNrOi8vLy91c3IvbG9jYWwvbGliL34vcGVsbGV0L3NyYy9pc29tb3JwaGljL2Nvb2tpZS5qcyIsIndlYnBhY2s6Ly8vL3Vzci9sb2NhbC9saWIvfi9wZWxsZXQvc3JjL3JlbmRlci5qcyIsIndlYnBhY2s6Ly8vL3Vzci9sb2NhbC9saWIvfi9wZWxsZXQvc3JjL2lzb21vcnBoaWMvaHR0cC5qcyIsIndlYnBhY2s6Ly8vL3Vzci9sb2NhbC9saWIvfi9wZWxsZXQvc3JjL3JvdXRlLXRhYmxlLmpzIiwid2VicGFjazovLy8vdXNyL2xvY2FsL2xpYi9+L3BlbGxldC9zcmMvY29tcG9uZW50cy9pbnRlcm5hdGlvbmFsaXphdGlvbi9pbnRlcm5hdGlvbmFsaXphdGlvbi5qc3giLCJ3ZWJwYWNrOi8vLy91c3IvbG9jYWwvbGliL34vcGVsbGV0L3NyYy9jb21wb25lbnRzL211bHRpdmFyaWF0ZS10ZXN0aW5nL2Rhc2hib2FyZC9hYm4tZGFzaGJvYXJkLmphZGUiLCJ3ZWJwYWNrOi8vLy4vYWJvdXQvYWJvdXQuamFkZSIsIndlYnBhY2s6Ly8vLi9pbmRleC5qYWRlIiwid2VicGFjazovLy8uL2hlbGxvL2hlbGxvLmphZGUiLCJ3ZWJwYWNrOi8vLy4vbGF5b3V0MS9sYXlvdXQxLmphZGUiLCJ3ZWJwYWNrOi8vLy4vbWVzc2FnZS9tZXNzYWdlLmphZGUiLCJ3ZWJwYWNrOi8vLy91c3IvbG9jYWwvbGliL34vcGVsbGV0L3NyYy9pc29tb3JwaGljL3BpcGVsaW5lLmpzIiwid2VicGFjazovLy8vdXNyL2xvY2FsL2xpYi9+L3BlbGxldC9+L3BhdGgtdG8tcmVnZXhwL2luZGV4LmpzIiwid2VicGFjazovLy8od2VicGFjaykvfi9ub2RlLWxpYnMtYnJvd3Nlci9+L3F1ZXJ5c3RyaW5nLWVzMy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vL3Vzci9sb2NhbC9saWIvfi9wZWxsZXQvfi9rZWZpci9kaXN0L2tlZmlyLmpzIiwid2VicGFjazovLy8od2VicGFjaykvfi9ub2RlLWxpYnMtYnJvd3Nlci9+L3F1ZXJ5c3RyaW5nLWVzMy9kZWNvZGUuanMiLCJ3ZWJwYWNrOi8vLyh3ZWJwYWNrKS9+L25vZGUtbGlicy1icm93c2VyL34vcXVlcnlzdHJpbmctZXMzL2VuY29kZS5qcyIsIndlYnBhY2s6Ly8vL3Vzci9sb2NhbC9saWIvfi9wZWxsZXQvfi9wYXRoLXRvLXJlZ2V4cC9+L2lzYXJyYXkvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdUJBQWU7QUFDZjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSx3Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN0Q0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLE1BQUs7QUFDTCw0QkFBMkIsa0NBQWtDO0FBQzdEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBLFFBQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTztBQUNQO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsK0JBQThCO0FBQzlCO0FBQ0E7O0FBRUE7QUFDQSwrQkFBOEI7QUFDOUI7QUFDQTs7QUFFQTtBQUNBLCtCQUE4QjtBQUM5QjtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQzNJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUc7QUFDSCx3QkFBdUI7QUFDdkI7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsV0FBVTtBQUNWO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFdBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsV0FBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxFQUFDO0FBQ0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMLElBQUc7QUFDSCxFQUFDO0FBQ0Q7QUFDQTs7Ozs7OztBQ3RXQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ1JBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNOQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNULFFBQU87QUFDUDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVztBQUNYO0FBQ0EsUUFBTztBQUNQO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxRQUFPOztBQUVQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVztBQUNYLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxZQUFXO0FBQ1g7O0FBRUE7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQSxJQUFHO0FBQ0g7Ozs7Ozs7QUN4RkE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBVztBQUNYO0FBQ0E7O0FBRUE7QUFDQSxVQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsUUFBTztBQUNQO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0EsSUFBRztBQUNIOzs7Ozs7O0FDdkxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGtDQUFpQztBQUNqQzs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUF5QixRQUFROztBQUVqQztBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsUUFBTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVc7QUFDWDtBQUNBOztBQUVBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7O0FBRVQsUUFBTztBQUNQLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUc7QUFDSCxFQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0wsSUFBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7Ozs7Ozs7QUN0UkE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsSUFBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBLElBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxhQUFZLEVBQUU7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDs7Ozs7OztBQ3RLQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSw2QkFBNEIsMkNBQTJDOzs7QUFHdkU7QUFDQSxJQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0EsSUFBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0wsSUFBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1QsUUFBTztBQUNQOztBQUVBO0FBQ0E7QUFDQSxFQUFDOzs7Ozs7O0FDbkVEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxlQUFjLFVBQVUsRUFBRTtBQUMxQixvQkFBbUIsVUFBVSxFQUFFOztBQUUvQjtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIOztBQUVBLHNCQUFxQixvQ0FBb0M7O0FBRXpEOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQSxFQUFDOzs7Ozs7O0FDdkNEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxlQUFjLFVBQVUsRUFBRTtBQUMxQixvQkFBbUIsVUFBVSxFQUFFOztBQUUvQjtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIOztBQUVBOztBQUVBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQSxFQUFDOzs7Ozs7O0FDdkNEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxlQUFjLFVBQVUsRUFBRTtBQUMxQixvQkFBbUIsVUFBVSxFQUFFOztBQUUvQjtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRzs7QUFFSDtBQUNBLG9CQUFtQiwwQkFBMEI7QUFDN0MsSUFBRzs7QUFFSDs7QUFFQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0EsRUFBQzs7Ozs7OztBQ2pERDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0EsSUFBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQSxJQUFHO0FBQ0g7QUFDQSxJQUFHO0FBQ0g7QUFDQSxJQUFHO0FBQ0g7QUFDQSxJQUFHO0FBQ0g7QUFDQSxJQUFHO0FBQ0g7QUFDQSxJQUFHO0FBQ0g7QUFDQSxJQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFDOzs7Ozs7O0FDakREO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxlQUFjLFVBQVUsRUFBRTtBQUMxQixvQkFBbUIsVUFBVSxFQUFFOztBQUUvQjtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEVBQUM7Ozs7Ozs7QUNsQ0QsZ0JBQWUsK0NBQTZHLCtDQUE2RyxpREFBbUgsaURBQW1ILHVEQUErRyw4Q0FBaUksMkRBQWlKLHFEOzs7Ozs7QUNBaDFCLHdCOzs7Ozs7QUNBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLDBDQUF5QyxRQUFRLCtGQUErRjtBQUNoSiw0Q0FBMkMsUUFBUSxpR0FBaUc7QUFDcEosNENBQTJDLFFBQVEsaUdBQWlHO0FBQ3BKLDZDQUE0QyxRQUFRLGtHQUFrRztBQUN0Six5Q0FBd0MsUUFBUSw4RkFBOEY7QUFDOUksK0NBQThDLFFBQVEsb0dBQW9HO0FBQzFKLDBDQUF5QyxRQUFRLCtGQUErRjtBQUNoSiw2Q0FBNEMsUUFBUSxrR0FBa0c7QUFDdEosMkNBQTBDLFFBQVEsZ0dBQWdHO0FBQ2xKLGdEQUErQyxRQUFRLHFHQUFxRztBQUM1SiwyQ0FBMEMsUUFBUSxnR0FBZ0c7QUFDbEosZ0RBQStDLFFBQVEscUdBQXFHO0FBQzVKLHFEQUFvRCxRQUFRLDBHQUEwRztBQUN0Syw2Q0FBNEMsUUFBUSxrR0FBa0c7QUFDdEosNkNBQTRDLFFBQVEsa0dBQWtHO0FBQ3RKLCtDQUE4QyxRQUFRLG9HQUFvRztBQUMxSixzREFBcUQsUUFBUSwyR0FBMkc7QUFDeEssNENBQTJDLFFBQVEsaUdBQWlHO0FBQ3BKLGlEQUFnRCxRQUFRLHNHQUFzRztBQUM5SixpREFBZ0QsUUFBUSxzR0FBc0c7QUFDOUosOENBQTZDLFFBQVEsbUdBQW1HO0FBQ3hKLGdEQUErQyxRQUFRLHFHQUFxRztBQUM1SixrREFBaUQsUUFBUSx1R0FBdUc7QUFDaEssaURBQWdELFFBQVEsc0dBQXNHO0FBQzlKLDZDQUE0QyxRQUFRLGtHQUFrRztBQUN0Siw4Q0FBNkMsUUFBUSxtR0FBbUc7QUFDeEosb0RBQW1ELFFBQVEseUdBQXlHO0FBQ3BLLG1EQUFrRCxRQUFRLHdHQUF3RztBQUNsSyxvREFBbUQsUUFBUSx5R0FBeUc7QUFDcEssMkRBQTBELFFBQVEsZ0hBQWdIO0FBQ2xMLCtDQUE4QyxRQUFRLG9HQUFvRztBQUMxSiwrQ0FBOEMsUUFBUSxvR0FBb0c7O0FBRTFKOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXFCLDhDQUE4QztBQUNuRSxJQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOzs7Ozs7OztBQzlJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esc0JBQXFCOztBQUVyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0wsSUFBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWU7QUFDZjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsSUFBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFlO0FBQ2Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0EsSUFBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0wsSUFBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWU7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0EsUUFBTztBQUNQO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMLElBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWU7QUFDZjtBQUNBO0FBQ0E7QUFDQSxvQkFBbUI7QUFDbkI7QUFDQTtBQUNBLGtCQUFpQjtBQUNqQjtBQUNBO0FBQ0EsZ0JBQWU7QUFDZjtBQUNBOztBQUVBO0FBQ0EsY0FBYTtBQUNiLHVEQUFzRCwyQkFBMkI7QUFDakY7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsZ0JBQWU7QUFDZjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFlBQVc7QUFDWDtBQUNBLFlBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxRQUFPO0FBQ1A7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUM1UkE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esb0RBQW1EO0FBQ25EOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLE1BQUs7QUFDTDs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esd0RBQXVELCtCQUErQjtBQUN0Rjs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOzs7Ozs7O0FDNUpBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxJQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxJQUFHOztBQUVIO0FBQ0E7QUFDQSxJQUFHOztBQUVIO0FBQ0E7QUFDQSxJQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0EsSUFBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxJQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDaEVB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QUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsSUFBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsUUFBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUNqUkE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQSxJQUFHO0FBQ0g7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBRzs7QUFF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Q0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUM7Ozs7O0FBS0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBQzs7Ozs7QUFLRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFDOzs7OztBQUtEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEVBQUM7Ozs7OztBQU1EOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUM7Ozs7OztBQU1EOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsRUFBQzs7Ozs7QUFLRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBQzs7Ozs7O0FBTUQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBQzs7Ozs7O0FBTUQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUM7Ozs7OztBQU1EOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUMsR0FBRyw4QkFBOEI7Ozs7OztBQU1sQzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFDOzs7OztBQUtEOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBQzs7Ozs7QUFLRDs7QUFFQTtBQUNBO0FBQ0EsRUFBQzs7OztBQUlEOztBQUVBO0FBQ0E7QUFDQSxFQUFDOzs7O0FBSUQ7O0FBRUE7QUFDQTtBQUNBLEVBQUM7Ozs7QUFJRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBQzs7OztBQUlEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFDOzs7OztBQUtEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBQzs7Ozs7O0FBTUQscUJBQW9CLFVBQVU7O0FBRTlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdDQUErQjtBQUMvQixJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0EsUUFBTztBQUNQO0FBQ0E7QUFDQTtBQUNB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QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLEVBQUM7Ozs7QUFJRDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsRUFBQzs7OztBQUlEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLEVBQUM7Ozs7O0FBS0Q7O0FBRUE7QUFDQTtBQUNBLElBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHOztBQUVIO0FBQ0E7QUFDQSxJQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsRUFBQzs7O0FBR0Q7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTs7QUFFQSxFQUFDLFE7Ozs7OztBQy9vRkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxrQkFBaUIsU0FBUztBQUMxQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7Ozs7O0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1QsUUFBTztBQUNQO0FBQ0E7QUFDQSxNQUFLOztBQUVMOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxrQkFBaUIsZUFBZTtBQUNoQztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ3BGQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCIvanMvXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogd2VicGFjay9ib290c3RyYXAgZjAyYTIzNzBcbiAqKi8iLCJ2YXIgb2JzZXJ2YWJsZXMgPSByZXF1aXJlKCcuL29ic2VydmFibGVzJylcbiAgLCBUcmFuc2Zvcm1GbiA9IHt9O1xuXG4vLyBIZWxwZXIgZnVuY3Rpb25cbmZ1bmN0aW9uIHdyYXAoY29tbWFuZCkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNvbmZpZ0RldGFpbHM7XG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICAgIGFyZ3NbMF0gPSB0aGlzLl9uYW1lc3BhY2UgKyBhcmdzWzBdO1xuXG4gICAgaWYodGhpcy5zdGF0c2QgJiYgcHJvY2Vzcy5lbnYuU0VSVkVSX0VOVikge1xuICAgICAgdGhpcy5zdGF0c2RbY29tbWFuZF0uYXBwbHkodGhpcy5zdGF0c2QsIGFyZ3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmVtaXQoJ3N0YXRzZCcsIHtjOmNvbW1hbmQsIGE6SlNPTi5zdHJpbmdpZnkoYXJncyl9KTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaW5zdHJ1bWVudGF0aW9uKHN0YXRzZENvbmZpZywgY29uZmlnKSB7XG4gIHRoaXMuX25hbWVzcGFjZSA9ICcnO1xuICB0aGlzLnN0YXRzZCA9IG51bGw7XG4gIHRoaXMuaXNvbGF0ZWRDb25maWcgPSBudWxsO1xuXG4gIHRoaXMuYnVzID0gbmV3IG9ic2VydmFibGVzLmF1dG9SZWxlYXNlKG51bGwsIHRoaXMpO1xuXG4gIGlmKGNvbmZpZyAmJiBjb25maWcuZGVidWcpIHtcbiAgICB0aGlzLmRlYnVnRmlsdGVyID0gbmV3IFJlZ0V4cChjb25maWcuZGVidWcpO1xuICB9XG5cbiAgaWYocHJvY2Vzcy5lbnYuU0VSVkVSX0VOVikge1xuICAgIHRoaXMuc3RhdHNkID0gbmV3IChyZXF1aXJlKCdub2RlLXN0YXRzZCcpKShzdGF0c2RDb25maWcpO1xuICB9XG59XG5cbmluc3RydW1lbnRhdGlvbi5wcm90b3R5cGUubmFtZXNwYWNlID0gZnVuY3Rpb24obmFtZXNwYWNlKSB7XG4gIHZhciBvYmogPSBPYmplY3QuY3JlYXRlKHRoaXMpO1xuICBvYmouX25hbWVzcGFjZSA9IHRoaXMuX25hbWVzcGFjZSArIG5hbWVzcGFjZS5yZXBsYWNlKC9cXC4kLywnJykgKyAnLic7XG4gIHJldHVybiBvYmo7XG59XG5cbmluc3RydW1lbnRhdGlvbi5wcm90b3R5cGUuZWxhcHNlVGltZXIgPSBmdW5jdGlvbihzdGFydEF0LCBuYW1lc3BhY2UpIHtcbiAgdmFyIHN0YXJ0LCBfdGhpcztcblxuICBpZihuYW1lc3BhY2UpIHtcbiAgICBfdGhpcyA9IHRoaXMubmFtZXNwYWNlKG5hbWVzcGFjZSk7XG4gIH0gZWxzZSB7XG4gICAgX3RoaXMgPSB0aGlzO1xuICB9XG5cbiAgaWYoc3RhcnRBdCkge1xuICAgIHN0YXJ0ID0gc3RhcnRBdDtcbiAgfSBlbHNlIHtcbiAgICBpZihwcm9jZXNzLmVudi5TRVJWRVJfRU5WKSB7XG4gICAgICBzdGFydCA9IHByb2Nlc3MuaHJ0aW1lKCk7XG4gICAgfSBlbHNlIGlmKHByb2Nlc3MuZW52LkJST1dTRVJfRU5WKSB7XG4gICAgICBpZih3aW5kb3cucGVyZm9ybWFuY2UpIHtcbiAgICAgICAgc3RhcnQgPSB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdGFydCA9IG5ldyBEYXRlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBtYXJrOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgICBpZihwcm9jZXNzLmVudi5TRVJWRVJfRU5WKSB7XG4gICAgICAgIHZhciBlbmQgPSBwcm9jZXNzLmhydGltZSgpO1xuICAgICAgICBfdGhpcy50aW1pbmcobmFtZSwgKCgoZW5kWzBdLXN0YXJ0WzBdKSoxZTkpICsgKGVuZFsxXS1zdGFydFsxXSkpLzFlNik7XG4gICAgICB9IGVsc2UgaWYocHJvY2Vzcy5lbnYuQlJPV1NFUl9FTlYpIHtcbiAgICAgICAgaWYod2luZG93LnBlcmZvcm1hbmNlKSB7XG4gICAgICAgICAgX3RoaXMudGltaW5nKG5hbWUsIHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKS1zdGFydCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX3RoaXMudGltaW5nKG5hbWUsIG5ldyBEYXRlKCktc3RhcnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xufVxuXG5pbnN0cnVtZW50YXRpb24ucHJvdG90eXBlLmxvZyA9IGluc3RydW1lbnRhdGlvbi5wcm90b3R5cGUuaW5mbyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgaWYoYXJndW1lbnRzLmxlbmd0aCAhPT0gMSkge3Rocm93IEVycm9yKCdpbnN0cnVtZW50YXRpb24gbG9nIGNhbiBvbmx5IGhhdmUgb25lIGFyZ3VtZW50Jyk7fVxuICB0aGlzLmVtaXQoJ2luZm8nLCBkYXRhKTtcbn1cblxuaW5zdHJ1bWVudGF0aW9uLnByb3RvdHlwZS5lcnJvciA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgaWYoYXJndW1lbnRzLmxlbmd0aCAhPT0gMSkge3Rocm93IEVycm9yKCdpbnN0cnVtZW50YXRpb24gbG9nIGNhbiBvbmx5IGhhdmUgb25lIGFyZ3VtZW50Jyk7fVxuICB0aGlzLmVtaXQoJ2Vycm9yJywgZGF0YSk7XG59XG5cbmluc3RydW1lbnRhdGlvbi5wcm90b3R5cGUud2FybiA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgaWYoYXJndW1lbnRzLmxlbmd0aCAhPT0gMSkge3Rocm93IEVycm9yKCdpbnN0cnVtZW50YXRpb24gbG9nIGNhbiBvbmx5IGhhdmUgb25lIGFyZ3VtZW50Jyk7fVxuICB0aGlzLmVtaXQoJ3dhcm4nLCBkYXRhKTtcbn1cblxuaW5zdHJ1bWVudGF0aW9uLnByb3RvdHlwZS5ldmVudCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgdGhpcy5lbWl0KCdldmVudCcsIGRhdGEpO1xufVxuXG5pbnN0cnVtZW50YXRpb24ucHJvdG90eXBlLnRpbWluZyA9IHdyYXAoJ3RpbWluZycpO1xuaW5zdHJ1bWVudGF0aW9uLnByb3RvdHlwZS5pbmNyZW1lbnQgPSB3cmFwKCdpbmNyZW1lbnQnKTtcbmluc3RydW1lbnRhdGlvbi5wcm90b3R5cGUuZGVjcmVtZW50ID0gd3JhcCgnZGVjcmVtZW50Jyk7XG5pbnN0cnVtZW50YXRpb24ucHJvdG90eXBlLmhpc3RvZ3JhbSA9IHdyYXAoJ2hpc3RvZ3JhbScpO1xuaW5zdHJ1bWVudGF0aW9uLnByb3RvdHlwZS5nYXVnZSA9IHdyYXAoJ2dhdWdlJyk7XG5pbnN0cnVtZW50YXRpb24ucHJvdG90eXBlLnNldCA9IHdyYXAoJ3NldCcpO1xuXG4vKipcbiAqIEJyb2FkY2FzdCBpbnN0cnVtZW50YXRpb24gZGV0YWlscyB0byBhbGwgbGlzdGVuZXJzXG4gKlxuICogQHBhcmFtIHR5cGVcbiAqIEBwYXJhbSBkYXRhXG4gKiBAcGFyYW0gaXNvbGF0ZWRDb25maWdcbiAqL1xuaW5zdHJ1bWVudGF0aW9uLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSwgZGV0YWlscywgbmFtZXNwYWNlLCBzZXNzaW9uSWQpIHtcbiAgdGhpcy5idXMuZW1pdCh7XG4gICAgdHlwZTogdHlwZSB8fCAnTkEnLFxuICAgIHNlc3Npb25JZDogc2Vzc2lvbklkLFxuICAgIG5hbWVzcGFjZTogbmFtZXNwYWNlIHx8IHRoaXMuX25hbWVzcGFjZSB8fCAnTkEnLFxuICAgIGRldGFpbHM6IGRldGFpbHMgfHwge31cbiAgfSwgdGhpcywgdGhpcy5pc29sYXRlZENvbmZpZyk7XG5cbiAgaWYodGhpcy5kZWJ1Z0ZpbHRlciAmJiB0aGlzLmRlYnVnRmlsdGVyLnRlc3QodHlwZSkpIHtcbiAgICBjb25zb2xlLmRlYnVnKCdpbnN0cnVtZW50OicsIHR5cGUsIEpTT04uc3RyaW5naWZ5KGRldGFpbHMpLCB0aGlzLmlzb2xhdGVkQ29uZmlnPyd3aXRoIGlzb2xhdGVkQ29uZmlnJzonJyk7XG4gIH1cbn1cblxuaW5zdHJ1bWVudGF0aW9uLnByb3RvdHlwZS5hZGRJc29sYXRlZENvbmZpZyA9IGZ1bmN0aW9uKGlzb2xhdGVkQ29uZmlnKSB7XG4gIHZhciB3cmFwcGVyID0gT2JqZWN0LmNyZWF0ZSh0aGlzKTtcbiAgd3JhcHBlci5pc29sYXRlZENvbmZpZyA9IGlzb2xhdGVkQ29uZmlnO1xuICByZXR1cm4gd3JhcHBlcjtcbn1cblxuaW5zdHJ1bWVudGF0aW9uLnByb3RvdHlwZS5yZWdpc3RlclRyYW5zZm9ybUZuID0gZnVuY3Rpb24obmFtZSwgZm4pIHtcbiAgVHJhbnNmb3JtRm5bbmFtZV0gPSBmbjtcbn1cblxuaW5zdHJ1bWVudGF0aW9uLnByb3RvdHlwZS5nZXRUcmFuc2Zvcm1GbiA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgcmV0dXJuIFRyYW5zZm9ybUZuW25hbWVdO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGluc3RydW1lbnRhdGlvbjtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogL3Vzci9sb2NhbC9saWIvfi9wZWxsZXQvc3JjL2luc3RydW1lbnRhdGlvbi5qc1xuICoqIG1vZHVsZSBpZCA9IDFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMlxuICoqLyIsInZhciByZWFjdCA9IHJlcXVpcmUoJ3JlYWN0JylcbiAgLCB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxuICAsIG9ic2VydmFibGVzID0gcmVxdWlyZSgnLi9vYnNlcnZhYmxlcycpXG4gICwgaXNvbGF0b3IgPSByZXF1aXJlKCcuL2lzb2xhdG9yJylcbiAgLCBpbnN0cnVtZW50YXRpb24gPSByZXF1aXJlKCcuL2luc3RydW1lbnRhdGlvbicpXG4gICwgcGVsbGV0UmVhY3RNaXhpbiA9IHJlcXVpcmUoJy4vY29tcG9uZW50LW1peGluJylcbiAgLCBleHBlcmltZW50SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9leHBlcmltZW50LWludGVyZmFjZScpXG4gICwgY29va2llID0gcmVxdWlyZSgnLi9pc29tb3JwaGljL2Nvb2tpZScpO1xuXG4vKipcbiAqIEBjbGFzcyBwZWxsZXRcbiAqXG4gKi9cbmZ1bmN0aW9uIHBlbGxldChjb25maWcsIG9wdGlvbnMpIHtcbiAgdGhpcy5yZWFkeUZuUXVlID0gW107XG4gIHRoaXMuaW5pdEZuUXVlID0gW107XG4gIHRoaXMuY29vcmRpbmF0b3JzID0ge307XG4gIHRoaXMuY29vcmRpbmF0b3JTcGVjcyA9IHt9O1xuICB0aGlzLmNvbXBvbmVudHMgPSB7fTtcbiAgdGhpcy5sb2NhbGVzID0ge307XG5cbiAgdGhpcy5taWRkbGV3YXJlU3RhY2sgPSBbXTtcbiAgdGhpcy5jb25maWcgPSBjb25maWcgfHwge307XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgaWYoY29uZmlnKSB7XG4gICAgdGhpcy52ID0gY29uZmlnLl92O1xuICAgIHRoaXMucnRoYXNoID0gY29uZmlnLl9ydGhhc2g7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy52ID0gJ05BJztcbiAgICB0aGlzLnJ0aGFzaCA9IG51bGw7XG4gIH1cblxuICAvLyBzZXR1cCB0aGUgZXhwZXJpbWVudCBpbnRlcmZhY2UgKHBhc3N0aHJ1IG1vZGUpXG4gIHRoaXMuZXhwZXJpbWVudCA9IG5ldyBleHBlcmltZW50SW50ZXJmYWNlKHRoaXMpO1xuXG4gIGlmICh0aGlzLm9wdGlvbnMuaW5zdHJ1bWVudGF0aW9uKSB7XG4gICAgdGhpcy5pbnN0cnVtZW50YXRpb24gPSB0aGlzLm9wdGlvbnMuaW5zdHJ1bWVudGF0aW9uO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuaW5zdHJ1bWVudGF0aW9uID0gbmV3IGluc3RydW1lbnRhdGlvbihudWxsLCB0aGlzLmNvbmZpZy5pbnN0cnVtZW50YXRpb24pO1xuICB9XG5cbiAgaWYgKHRoaXMub3B0aW9ucy5sb2dnZXIpIHtcbiAgICB0aGlzLmxvZ2dlciA9IHRoaXMub3B0aW9ucy5sb2dnZXI7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5sb2dnZXIgPSBudWxsOyAvLyBUT0RPOiBtYWtlIGEgbW9jayBsb2dnZXJcbiAgfVxufVxuXG4vKipcbiAqXG4gKiBAdHlwZSB7b2JzZXJ2YWJsZXN9XG4gKi9cbnBlbGxldC5wcm90b3R5cGUub2JzZXJ2YWJsZXMgPSBvYnNlcnZhYmxlcztcblxuLyoqXG4gKlxuICogQHR5cGUge2Nvb2tpZX1cbiAqL1xuaWYocHJvY2Vzcy5lbnYuQlJPV1NFUl9FTlYpIHtcbiAgcGVsbGV0LnByb3RvdHlwZS5jb29raWUgPSBjb29raWU7XG59XG5cbi8qKlxuICpcbiAqIEB0eXBlIHtleHBvcnRzfVxuICovXG5wZWxsZXQucHJvdG90eXBlLmNyZWF0ZUNsYXNzID0gZnVuY3Rpb24oc3BlYykge1xuICBpZighc3BlYy5taXhpbnMpIHtcbiAgICBzcGVjLm1peGlucyA9IFtdO1xuICB9XG5cbiAgaWYoIShwZWxsZXRSZWFjdE1peGluIGluIHNwZWMubWl4aW5zKSkge1xuICAgIHNwZWMubWl4aW5zLnB1c2gocGVsbGV0UmVhY3RNaXhpbik7XG4gIH1cblxuICBpZihzcGVjLmNvbXBvbmVudENvbnN0cnVjdGlvbikge1xuICAgIHZhciBfY29tcG9uZW50Q29uc3RydWN0aW9uID0gc3BlYy5jb21wb25lbnRDb25zdHJ1Y3Rpb247XG4gICAgZGVsZXRlIHNwZWMuY29tcG9uZW50Q29uc3RydWN0aW9uO1xuICB9XG5cbiAgaWYoc3BlYy5sYXlvdXRUZW1wbGF0ZSkge1xuICAgIHZhciBfbGF5b3V0ID0gc3BlYy5sYXlvdXRUZW1wbGF0ZTtcbiAgICBkZWxldGUgc3BlYy5sYXlvdXRUZW1wbGF0ZTtcbiAgfVxuXG4gIGlmKHR5cGVvZiBzcGVjLnJvdXRlcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB2YXIgaSwgYWxsUm91dGVzO1xuXG4gICAgaWYodHlwZW9mIHNwZWMucm91dGVzID09PSAnc3RyaW5nJykge1xuICAgICAgYWxsUm91dGVzID0gW3NwZWMucm91dGVzXTtcbiAgICB9IGVsc2UgaWYoc3BlYy5yb3V0ZXMgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgYWxsUm91dGVzID0gc3BlYy5yb3V0ZXM7XG4gICAgfVxuXG4gICAgZGVsZXRlIHNwZWMucm91dGVzO1xuICB9XG5cbiAgdmFyIHJlYWN0Q2xhc3MgPSByZWFjdC5jcmVhdGVDbGFzcyhzcGVjKTtcblxuICAvLyBtYWtlIHN1cmUgd2UgaGF2ZSBzdGF0aWMgdmVyc2lvbiBvZiBfJGNvbnN0cnVjdGlvblxuICAvLyBhbmQgX18kbGF5b3V0XG4gIGlmKF9jb21wb25lbnRDb25zdHJ1Y3Rpb24pIHtcbiAgICByZWFjdENsYXNzLl8kY29uc3RydWN0aW9uID0gX2NvbXBvbmVudENvbnN0cnVjdGlvbjtcbiAgfVxuXG4gIGlmKF9sYXlvdXQpIHtcbiAgICByZWFjdENsYXNzLl9fJGxheW91dCA9IF9sYXlvdXQ7XG4gIH1cblxuICBpZihhbGxSb3V0ZXMpIHtcbiAgICBmb3IoaSBpbiBhbGxSb3V0ZXMpIHtcbiAgICAgIHZhciBvcHRpb25zID0ge307XG4gICAgICBpZih0eXBlb2Ygc3BlYy5vblJvdXRlVW5tb3VudFJlYWN0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBvcHRpb25zLm9uUm91dGVVbm1vdW50UmVhY3QgPSAhIXNwZWMub25Sb3V0ZVVubW91bnRSZWFjdDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5hZGRDb21wb25lbnRSb3V0ZShhbGxSb3V0ZXNbaV0sIHJlYWN0Q2xhc3MsIG9wdGlvbnMpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZWFjdENsYXNzO1xufTtcblxucGVsbGV0LnByb3RvdHlwZS5zZXRFeHBlcmltZW50SW50ZXJmYWNlID0gZnVuY3Rpb24oYXBpKSB7XG4gIHRoaXMuZXhwZXJpbWVudCA9IGFwaTtcbn1cblxucGVsbGV0LnByb3RvdHlwZS5zZXRMb2NhbGVMb29rdXBGbiA9IGZ1bmN0aW9uKGxvb2t1cEZuKSB7XG4gIHRoaXMuc3VnZ2VzdExvY2FsZXMgPSBsb29rdXBGbjtcbn07XG5cbnBlbGxldC5wcm90b3R5cGUubG9hZFRyYW5zbGF0aW9uID0gZnVuY3Rpb24obG9jYWxlLCBmbikge1xuICB0aGlzLmxvY2FsZXNbbG9jYWxlXSA9IGZuO1xufTtcblxucGVsbGV0LnByb3RvdHlwZS5sb2FkTWFuaWZlc3RDb21wb25lbnRzID0gZnVuY3Rpb24obWFuaWZlc3QpIHtcbiAgdmFyIGxhc3QsIGlkLCBrZXksIGtleXM7XG5cbiAgaWYoIW1hbmlmZXN0IHx8IHR5cGVvZihtYW5pZmVzdCkgIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAga2V5cyA9IE9iamVjdC5rZXlzKG1hbmlmZXN0KTtcblxuICBrZXlzLnNvcnQoKS5yZXZlcnNlKCk7XG4gIGZvcih2YXIgaSBpbiBrZXlzKSB7XG4gICAga2V5ID0ga2V5c1tpXTtcbiAgICBpZCA9IGtleS5zdWJzdHJpbmcoMCwga2V5LmluZGV4T2YoJ0AnKSk7XG4gICAgaWYoaWQpIHtcbiAgICAgIGlmKGxhc3QgIT09IGlkKSB7XG4gICAgICAgIGlmKHRoaXMuY29tcG9uZW50c1tpZF0pIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oJ2R1cGxpY2F0ZSBtYW5pZmVzdCBjb21wb25lbnQgbG9hZGVkOicsIGlkKVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jb21wb25lbnRzW2lkXSA9IG1hbmlmZXN0W2tleV07XG4gICAgICAgIGxhc3QgPSBpZDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5jb21wb25lbnRzW2tleV0gPSBtYW5pZmVzdFtrZXldO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKlxuICogTk9URTogYmUgY2FyZWZ1bCB3aXRoIHRoZSBvcHRpb25zIGJlY2F1c2Ugb25jZSBpbml0aWFsaXplZFxuICogd2UgbmV2ZXIgY3JlYXRlIHRoZSBjb29yZGluYXRvciBzbyBmb3IgZWFjaCB1bmlxdWUgbmFtZSB0aGUgb3B0aW9uc1xuICogbmVlZCB0byBtYXRjaCFcbiAqXG4gKiBAcGFyYW0ga2V5XG4gKiBAcGFyYW0gaXNHbG9iYWxcbiAqIEBwYXJhbSBvcHRpb25zXG4gKiBAcmV0dXJucyB7Kn1cbiAqL1xucGVsbGV0LnByb3RvdHlwZS5nZXRDb29yZGluYXRvciA9IGZ1bmN0aW9uKG5hbWUsIHR5cGUpIHtcbiAgaWYoIW5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ25hbWUgaXMgcmVxdWlyZWQnKTtcbiAgfVxuXG4gIGlmKGluc3RhbmNlID0gdGhpcy5jb29yZGluYXRvcnNbbmFtZV0pIHtcbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH1cblxuICBpZih0eXBlb2YgdHlwZSAhPT0gJ3N0cmluZycpIHtcbiAgICB0eXBlID0gbmFtZTtcbiAgICBpZih0eXBlb2YgdHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIG9wdGlvbnMgPSB0eXBlO1xuICAgIH1cbiAgfVxuXG4gIC8vIG5vdyBjcmVhdGUgYSBnbG9iYWwgY29vcmRpbmF0b3JcbiAgdmFyIGluc3RhbmNlID0gdGhpcy5jcmVhdGVDb29yZGluYXRvcih0eXBlKTtcbiAgdGhpcy5jb29yZGluYXRvcnNbbmFtZV0gPSBpbnN0YW5jZTtcblxuICByZXR1cm4gaW5zdGFuY2U7XG59O1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ga2V5XG4gKiBAcGFyYW0gaXNHbG9iYWxcbiAqIEBwYXJhbSBvcHRpb25zXG4gKiBAcmV0dXJucyB7Kn1cbiAqL1xucGVsbGV0LnByb3RvdHlwZS5jcmVhdGVDb29yZGluYXRvciA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgaWYoIXR5cGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3R5cGUgaXMgcmVxdWlyZWQnKTtcbiAgfVxuXG4gIGlmKCF0aGlzLmNvb3JkaW5hdG9yU3BlY3NbdHlwZV0pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBmaW5kICcgKyB0eXBlICsgJyBjb29yZGluYXRvciBzcGVjJyk7XG4gIH1cblxuICB2YXIgaW5zdGFuY2UgPSBuZXcgaXNvbGF0b3IoKTtcbiAgdXRpbHMubWl4SW50byhpbnN0YW5jZSwgdGhpcy5jb29yZGluYXRvclNwZWNzW3R5cGVdLCBbJ19lbWl0dGVycycsICdfcmVsZWFzZUxpc3QnLCAnX2lkJywgJ2lzb2xhdGVkQ29uZmlnJ10sIFsnaW5pdGlhbGl6ZScsICdsb2FkJywgJ3JlbGVhc2UnXSk7XG4gIGluc3RhbmNlLmluaXRpYWxpemUoKTtcblxuICByZXR1cm4gaW5zdGFuY2U7XG59O1xuXG4vKipcbiAqIHJlZ2lzdGVyIHRoZSBjb29yZGluYXRvciBzcGVjIHRoYXQgY3JlYXRlcyB0aGUgbmV3IGNvb3JkaW5hdG9yXG4gKiBvZiB0eXBlIG5hbWUuXG4gKlxuICogQHBhcmFtIG5hbWVcbiAqIEBwYXJhbSBmblxuICovXG5wZWxsZXQucHJvdG90eXBlLnJlZ2lzdGVyQ29vcmRpbmF0b3JTcGVjID0gZnVuY3Rpb24obmFtZSwgc3BlYykge1xuICBpZighc3BlYyB8fCAhbmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignU3BlYyBhbmQgbmFtZSBhcmUgcmVxdWlyZWQgZm9yIGFsbCBjb29yZGluYXRvcnMuJyk7XG4gIH1cblxuICBpZih0aGlzLmNvb3JkaW5hdG9yU3BlY3NbbmFtZV0pIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBkdXBsaWNhdGUgc3RvcmUgc3BlY3M6JywgbmFtZSk7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgaGF2ZSBkdXBsaWNhdGUgc3RvcmUgc3BlY3MnKTtcbiAgfVxuXG4gIGlmKHNwZWMuX2VtaXR0ZXJzIHx8IHNwZWMuX3JlbGVhc2VMaXN0IHx8IHNwZWMuX2lkIHx8IHRoaXMuaXNvbGF0ZWRDb25maWcpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbnZhbGlkZWQgZmllbGRzIHNwZWNzOicsIG5hbWUpO1xuICAgIHRocm93IG5ldyBFcnJvcignX2VtaXR0ZXJzLCBfcmVsZWFzZUxpc3QsIF9pZCwgaXNvbGF0ZWRDb25maWcgYXJlIHJlc2VydmVkIGZpZWxkcycpO1xuICB9XG5cbiAgdGhpcy5jb29yZGluYXRvclNwZWNzW25hbWVdID0gc3BlYztcbn07XG5cbi8qKlxuICogcmVnaXN0ZXIgYSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgb25jZSBwZWxsZXQgaXMgcmVhZHlcbiAqIEBwYXJhbSBmblxuICovXG5wZWxsZXQucHJvdG90eXBlLm9uUmVhZHkgPSBmdW5jdGlvbihmbikge1xuICAvLyBpZiBhbGwgcmVhZHkgcnVubmluZyBmaXJlIGltbWVkaWF0ZWx5IHdpdGggdGhlIGxhc3Qga25vdyBlcnIgKG9yIG51bGwgaWYgbm8gZXJyb3JzKVxuICBpZih0eXBlb2YodGhpcy5yZWFkeUVycm9yKSAhPSAndW5kZWZpbmVkJykge1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBmbihtb2R1bGUuZXhwb3J0cy5yZWFkeUVycm9yKTtcbiAgICB9LCAxKTtcblxuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMucmVhZHlGblF1ZS5wdXNoKGZuKTtcbn07XG5cbi8qKlxuICogcmVnaXN0ZXIgYSBmdW5jdGlvbiBuZWVkZWQgdG8gY29tcGxldGUgYmVmb3JlIHBlbGxldCBpcyByZWFkeVxuICogQHBhcmFtIGZuXG4gKi9cbnBlbGxldC5wcm90b3R5cGUucmVnaXN0ZXJJbml0Rm4gPSBmdW5jdGlvbihmbikge1xuICB0aGlzLmluaXRGblF1ZS5wdXNoKGZuKTtcbn07XG5cbi8qKlxuICogQ2FsbGVkIGFmdGVyIGV2ZXJ5b25lIGhhcyByZWdpc3RlciB0aGVpciBsb2FkIGZ1bmN0aW9uc1xuICovXG5wZWxsZXQucHJvdG90eXBlLnN0YXJ0SW5pdCA9IGZ1bmN0aW9uKCkge1xuICBpZih0eXBlb2YodGhpcy5yZWFkeUVycm9yKSAhPSAndW5kZWZpbmVkJykge1xuICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHJlaW5pdCBiZWNhdXNlIHBlbGxldCBpcyBhbGwgcmVhZHkgcnVubmluZy4nKTtcbiAgfVxuXG4gIHZhciBjYkNvdW50ID0gdGhpcy5pbml0Rm5RdWUubGVuZ3RoO1xuICBmdW5jdGlvbiBkb25lKGVycikge1xuICAgIGlmKGVycikge1xuICAgICAgLy8gY29uc29sZSBsb2cgdGhlIGVycm9yIGFuZCBzYWZlIHRoZSBtb3N0IHJlY2VudCBlcnJvclxuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW5pdCBwZWxsZXQgYmVjYXVzZTonLCBlcnIubWVzc2FnZSk7XG4gICAgICBtb2R1bGUuZXhwb3J0cy5yZWFkeUVycm9yID0gZXJyO1xuICAgIH1cblxuICAgIGlmKC0tY2JDb3VudCA8PSAwKSB7XG4gICAgICAvLyBpZiBhbGwgY2FsbGJhY2sgaGFkIG5vIGVycm9yIHNldCB0byBudWxsXG4gICAgICBpZighbW9kdWxlLmV4cG9ydHMucmVhZHlFcnJvcikge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cy5yZWFkeUVycm9yID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgdmFyIGZuO1xuICAgICAgd2hpbGUoZm4gPSBtb2R1bGUuZXhwb3J0cy5yZWFkeUZuUXVlLnBvcCgpKSB7XG4gICAgICAgIGZuKG1vZHVsZS5leHBvcnRzLnJlYWR5RXJyb3IpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmKGNiQ291bnQgPT09IDApIHtcbiAgICBkb25lKG51bGwpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIG5vdyBjYWxsIGFsbCBpbml0IGZuIGFuZCB3YWl0IHVudGlsIGFsbCBkb25lXG4gIGZvcihpIGluIHRoaXMuaW5pdEZuUXVlKSB7XG4gICAgdGhpcy5pbml0Rm5RdWVbaV0oZG9uZSk7XG4gIH1cbn07XG5cbi8qKlxuICpcbiAqIEBwYXJhbSByZW5kZXJPcHRpb25zXG4gKiBAcGFyYW0gY29tcG9uZW50XG4gKiBAcGFyYW0gb3B0aW9uc1xuICogQHJldHVybnMge2xvY2Fsc3wqfGpzLmxvY2Fsc3xtb2R1bGUubG9jYWxzfGFwcC5sb2NhbHN8c3RyaW5nfVxuICovXG5wZWxsZXQucHJvdG90eXBlLnN1Z2dlc3RMb2NhbGVzID0gZnVuY3Rpb24ocmVuZGVyT3B0aW9ucywgY29tcG9uZW50LCBvcHRpb25zKSB7XG4gIGlmKHByb2Nlc3MuZW52LkJST1dTRVJfRU5WKSB7XG4gICAgdmFyIGxvY2FsZXMgPSBkb2N1bWVudC5ib2R5LmdldEF0dHJpYnV0ZSgnbG9jYWxlcycpO1xuICAgIGlmKGxvY2FsZXMpIHtcbiAgICAgIHJldHVybiBsb2NhbGVzO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBtb2R1bGUuZXhwb3J0cy5jb25maWcubG9jYWxlcyB8fCAnZW4tVVMnO1xufVxuXG5pZihwcm9jZXNzLmVudi5TRVJWRVJfRU5WKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gZ2xvYmFsLl9fcGVsbGV0X19yZWYgPSBuZXcgcGVsbGV0KGdsb2JhbC5fX3BlbGxldF9fYm9vdHN0cmFwLmNvbmZpZywgZ2xvYmFsLl9fcGVsbGV0X19ib290c3RyYXAub3B0aW9ucyk7XG59IGVsc2UgaWYocHJvY2Vzcy5lbnYuQlJPV1NFUl9FTlYpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cuX19wZWxsZXRfX3JlZiA9IG5ldyBwZWxsZXQod2luZG93Ll9fcGVsbGV0X19jb25maWcpO1xuXG4gIG1vZHVsZS5leHBvcnRzLmFkZFdpbmRvd09ucmVhZHlFdmVudCA9IGZ1bmN0aW9uKGZuKSB7XG4gICAgaWYoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PSAnaW50ZXJhY3RpdmUnIHx8IGRvY3VtZW50LnJlYWR5U3RhdGUgPT0gJ2NvbXBsZXRlJykge1xuICAgICAgZm4oKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZuLCBmYWxzZSk7XG4gICAgfSBlbHNlIGlmKHdpbmRvdy5hdHRhY2hFdmVudCkge1xuICAgICAgZG9jdW1lbnQuYXR0YWNoRXZlbnQoJ29ucmVhZHlzdGF0ZWNoYW5nZScsIGZuKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0VGltZW91dChmbiwgMjAwMCk7XG4gICAgfVxuICB9XG5cbiAgbW9kdWxlLmV4cG9ydHMuYWRkV2luZG93T25yZWFkeUV2ZW50KGZ1bmN0aW9uKCkge1xuICAgIC8vIHdlIG5lZWQgdG8gc2ltdWxhdGUgYXN5bmMgbG9hZCAodGhpcyBpcyBuZWVkZWRcbiAgICAvLyBzbyB0aGUgd2VicGFjayBicm93c2VyIHZlcnNpb24gY2FuIHJlZ2lzdGVySW5pdEZuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIHdpbmRvdy5fX3BlbGxldF9fcmVmLnN0YXJ0SW5pdCgpO1xuICAgIH0sIDEpO1xuICB9KTtcbn0gZWxzZSB7XG4gIG1vZHVsZS5leHBvcnRzID0gbmV3IHBlbGxldCgpO1xufVxuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAvdXNyL2xvY2FsL2xpYi9+L3BlbGxldC9zcmMvcGVsbGV0LmpzXG4gKiogbW9kdWxlIGlkID0gMlxuICoqIG1vZHVsZSBjaHVua3MgPSAyXG4gKiovIiwidmFyIHBhdGNoID0gWydzaWxseScsICdkZWJ1ZycsICd2ZXJib3NlJywgJ2luZm8nLCAnd2FybicsICdlcnJvciddXG4gICwgbWFwID0gWydpbmZvJywgJ2luZm8nLCAnbG9nJywgJ2luZm8nLCAnd2FybicsICdlcnJvciddXG4gICwgaSA9IHBhdGNoLmxlbmd0aDtcblxud2hpbGUoaS0tKSB7XG4gIGlmKCFjb25zb2xlW3BhdGNoW2ldXSkge1xuICAgIGNvbnNvbGVbcGF0Y2hbaV1dID0gY29uc29sZVttYXBbaV1dO1xuICB9XG59XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC91c3IvbG9jYWwvbGliL34vcGVsbGV0L3NyYy9jb21wb25lbnRzL2NvbnNvbGUtcG9seWZpbGwuanNcbiAqKiBtb2R1bGUgaWQgPSAzXG4gKiogbW9kdWxlIGNodW5rcyA9IDJcbiAqKi8iLCJ2YXIgcGVsbGV0ID0gcmVxdWlyZSgncGVsbGV0JylcblxucGVsbGV0LnVzZXJBZ2VudE1peGluID0ge1xuICBnZXRVQTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICh0aGlzLmNvbnRleHQucmVxdWVzdENvbnRleHQgJiYgdGhpcy5jb250ZXh0LnJlcXVlc3RDb250ZXh0LnVzZXJBZ2VudERldGFpbHMpIHx8IHt9O1xuICB9XG59O1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAvdXNyL2xvY2FsL2xpYi9+L3BlbGxldC9zcmMvY29tcG9uZW50cy91c2VyLWFnZW50LW1peGluLmpzXG4gKiogbW9kdWxlIGlkID0gNFxuICoqIG1vZHVsZSBjaHVua3MgPSAyXG4gKiovIiwidmFyIHBlbGxldCA9IHJlcXVpcmUoJy4uL3BlbGxldCcpO1xuXG5pZihwcm9jZXNzLmVudi5CUk9XU0VSX0VOVikge1xuICB2YXIgUEFSU0VfU1RBVFNEID0gL15cXFtcIigoLispXFwuKT8oLispXCJcXHMqLFxccyooLispXFxdJC87XG4gIHZhciBSRU1PVkVfUFJPVE9DT0wgPSAvXmh0dHBzPzpcXC9cXC9bXlxcL10rLztcblxuICBmdW5jdGlvbiBzZW5kQ21kKHR5cGUsIGdhVHJhY2tJRCkge1xuICAgIGlmKCFnYVRyYWNrSUQpIHtcbiAgICAgIGdhVHJhY2tJRCA9IHBlbGxldC5jb25maWdbdHlwZV07XG4gICAgfVxuXG4gICAgaWYoIWdhVHJhY2tJRCl7XG4gICAgICByZXR1cm4gJ3NlbmQnO1xuICAgIH1cblxuICAgIHJldHVybiBnYVRyYWNrSUQgKyAnLnNlbmQnO1xuICB9XG5cbiAgcGVsbGV0LnJlZ2lzdGVySW5pdEZuKGZ1bmN0aW9uIChuZXh0KSB7XG4gICAgaWYocGVsbGV0LmNvbmZpZyAmJiBwZWxsZXQuY29uZmlnLmluc3RydW1lbnRhdGlvbikge1xuICAgICAgdmFyIGdhVGltaW5nRmlsdGVyRm4gPSBwZWxsZXQuY29uZmlnLmluc3RydW1lbnRhdGlvbi5nYVRpbWluZ0ZpbHRlckZuXG4gICAgICAgICwgZ2FFdmVudEZpbHRlckZuID0gcGVsbGV0LmNvbmZpZy5pbnN0cnVtZW50YXRpb24uZ2FFdmVudEZpbHRlckZuO1xuICAgIH1cblxuICAgIHBlbGxldC5pbnN0cnVtZW50YXRpb24uYnVzLm9uKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICB2YXIgbmFtZXNwYWNlID0gZGF0YS5uYW1lc3BhY2VcbiAgICAgICAgLCBnYVRyYWNrSUQgPSBkYXRhLmdhVHJhY2tJRFxuICAgICAgICAsIGRldGFpbHMgPSBkYXRhLmRldGFpbHNcbiAgICAgICAgLCB0eXBlID0gZGF0YS50eXBlXG4gICAgICAgICwgZm47XG5cbiAgICAgIGlmKHR5cGUgPT09ICd1bmNhdWdodC1leGNlcHRpb24nICYmIHBlbGxldC5jb25maWcuZ2FFeGNlcHRpb25UcmFja0lEICE9PSBmYWxzZSkge1xuICAgICAgICBnYShzZW5kQ21kKCdnYUV4Y2VwdGlvblRyYWNrSUQnLCBnYVRyYWNrSUQpLCAnZXhjZXB0aW9uJywge1xuICAgICAgICAgIGV4RGVzY3JpcHRpb246IGRldGFpbHMubXNnICsgJyBsaW5lbm86JyArIGRldGFpbHMubm9cbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2UgaWYodHlwZSA9PT0gJ3N0YXRzZCcgJiYgZGV0YWlscy5jID09PSAndGltaW5nJyAmJiBwZWxsZXQuY29uZmlnLmdhVGltaW5nVHJhY2tJRCAhPT0gZmFsc2UpIHtcbiAgICAgICAgaWYoZ2FUaW1pbmdGaWx0ZXJGbiAmJiAoZm4gPSBwZWxsZXQuaW5zdHJ1bWVudGF0aW9uLmdldFRyYW5zZm9ybUZuKGdhVGltaW5nRmlsdGVyRm4pKSAmJiAhKGRhdGEgPSBmbihkYXRhKSkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyB1cGRhdGUgdGhlIGdhVHJhY2tJRCBiZWNhdXNlXG4gICAgICAgIC8vIGdldFRyYW5zZm9ybUZuIGNhbiB1cGRhdGUgdGhlIHZhbHVlXG4gICAgICAgIGdhVHJhY2tJRCA9IGRhdGEuZ2FUcmFja0lEO1xuXG4gICAgICAgIC8vIGNvbnZlcnQgdGhlIHN0YXRzZCBkYXRhIHRvIGEgR0EgdGltaW5nIGV2ZW50XG4gICAgICAgIGRhdGEgPSBkYXRhLmRldGFpbHMuYS5tYXRjaChQQVJTRV9TVEFUU0QpO1xuICAgICAgICBpZihkYXRhKSB7XG4gICAgICAgICAgZ2Eoc2VuZENtZCgnZ2FUaW1pbmdUcmFja0lEJywgZ2FUcmFja0lEKSwgJ3RpbWluZycsIHtcbiAgICAgICAgICAgICd0aW1pbmdDYXRlZ29yeSc6IGRhdGFbMl0gfHwgJ3N0YXRzZCcsXG4gICAgICAgICAgICAndGltaW5nVmFyJzogZGF0YVszXSxcbiAgICAgICAgICAgICd0aW1pbmdWYWx1ZSc6IHBhcnNlSW50KGRhdGFbNF0pXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZih0eXBlID09PSAnZXZlbnQnICYmIHBlbGxldC5jb25maWcuZ2FFdmVudFRyYWNrSUQgIT09IGZhbHNlKSB7XG4gICAgICAgIGlmKGdhRXZlbnRGaWx0ZXJGbiAmJiAoZm49cGVsbGV0Lmluc3RydW1lbnRhdGlvbi5nZXRUcmFuc2Zvcm1GbihnYUV2ZW50RmlsdGVyRm4pKSAmJiAhKGRhdGEgPSBmbihkYXRhKSkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyB1cGRhdGUgdGhlIGdhVHJhY2tJRCBiZWNhdXNlXG4gICAgICAgIC8vIGdldFRyYW5zZm9ybUZuIGNhbiB1cGRhdGUgdGhlIHZhbHVlXG4gICAgICAgIGdhVHJhY2tJRCA9IGRhdGEuZ2FUcmFja0lEO1xuXG4gICAgICAgIGdhKHNlbmRDbWQoJ2dhRXZlbnRUcmFja0lEJywgZ2FUcmFja0lEKSwgJ2V2ZW50JywgZGF0YSk7XG4gICAgICB9IGVsc2UgaWYodHlwZSA9PT0gJ3JvdXRlY2hhbmdlJykge1xuXG4gICAgICAgIHZhciBzdGF0dXNDb2RlID0gKGRldGFpbHMucGlwZWxpbmUgJiYgZGV0YWlscy5waXBlbGluZS4kICYmIGRldGFpbHMucGlwZWxpbmUuJC5zdGF0dXNDb2RlKTtcbiAgICAgICAgdmFyIHVybCA9IChwZWxsZXQuY29uZmlnLmdhVHJhY2tDYW5vbmljYWwgJiYgZGV0YWlscy5waXBlbGluZSAmJiBkZXRhaWxzLnBpcGVsaW5lLiQgJiYgZGV0YWlscy5waXBlbGluZS4kLnJlbENhbm9uaWNhbCkgfHwgZGV0YWlscy5vcmlnaW5hbFVybDtcblxuICAgICAgICAvLyByZXBvcnQgbm9ybWFsIDJYWCBzdGF0dXMgY29kZXMsIGJ1dCBmb3IgYW55IG90aGVyIGNvZGVzIGxpa2VcbiAgICAgICAgLy8gNDA0LCA1MDAgc3RhdHVzIHNlbmQgdGhlbSB0byB0aGUgZ2FTeW50aGV0aWNQYWdlVXJsIHBhZ2UgZm9yIHRyYWNraW5nXG4gICAgICAgIGlmKCFwZWxsZXQuY29uZmlnLmdhU3ludGhldGljUGFnZVVybCB8fCBzdGF0dXNDb2RlID09PSAyMDApIHtcbiAgICAgICAgICBnYSgnc2V0Jywge1xuICAgICAgICAgICAgcGFnZTogdXJsLnJlcGxhY2UoUkVNT1ZFX1BST1RPQ09MLCAnJyksXG4gICAgICAgICAgICB0aXRsZTogZG9jdW1lbnQudGl0bGVcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBnYSgnc2V0Jywge1xuICAgICAgICAgICAgcGFnZTogcGVsbGV0LmNvbmZpZy5nYVN5bnRoZXRpY1BhZ2VVcmwgKyAnLycgKyBzdGF0dXNDb2RlICsgJz91cmw9JyArIHVybCArICcmcmVmZXI9JyArIGRldGFpbHMucmVmZXJyZXIsXG4gICAgICAgICAgICB0aXRsZTogZG9jdW1lbnQudGl0bGVcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdhKCdzZW5kJywgJ3BhZ2V2aWV3Jyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBuZXh0KCk7XG4gIH0pO1xufVxuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAvdXNyL2xvY2FsL2xpYi9+L3BlbGxldC9zcmMvaW5zdHJ1bWVudGF0aW9uL2dvb2dsZS1hbmFseXRpY3MuanNcbiAqKiBtb2R1bGUgaWQgPSA1XG4gKiogbW9kdWxlIGNodW5rcyA9IDJcbiAqKi8iLCJ2YXIgcGVsbGV0ID0gcmVxdWlyZSgnLi4vcGVsbGV0Jyk7XG5cbmlmKHByb2Nlc3MuZW52LkJST1dTRVJfRU5WKSB7XG4gIHBlbGxldC5yZWdpc3RlckluaXRGbihmdW5jdGlvbiAobmV4dCkge1xuXG4gICAgdmFyIF91cmwsIF9maWx0ZXIsIG1heFVybDtcbiAgICB2YXIgYmF0Y2hUaW1lb3V0ID0gbnVsbFxuICAgICAgLCBiYXRjaEluZGV4ID0gMFxuICAgICAgLCBiYXRjaFVybCA9ICcnXG4gICAgICAsIGJhdGNoX24gPSBudWxsXG4gICAgICAsIGJhdGNoX3QgPSBudWxsXG4gICAgICAsIGJhdGNoX3MgPSBudWxsO1xuXG4gICAgaWYocGVsbGV0LmNvbmZpZyAmJiBwZWxsZXQuY29uZmlnLmluc3RydW1lbnRhdGlvbikge1xuICAgICAgX3VybCA9IHBlbGxldC5jb25maWcuaW5zdHJ1bWVudGF0aW9uLnVybDtcbiAgICAgIF9maWx0ZXIgPSBwZWxsZXQuY29uZmlnLmluc3RydW1lbnRhdGlvbi5maWx0ZXI7XG4gICAgICBfYmF0Y2hUaW1lb3V0ID0gcGVsbGV0LmNvbmZpZy5pbnN0cnVtZW50YXRpb24uYmF0Y2hUaW1lb3V0O1xuXG4gICAgICAvL1xuICAgICAgbWF4VXJsID0gMjAyNCAtIF91cmwubGVuZ3RoIC0gMTAwO1xuXG4gICAgICBpZihfZmlsdGVyKSB7XG4gICAgICAgIF9maWx0ZXIgPSBuZXcgUmVnRXhwKF9maWx0ZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHM0KCkge1xuICAgICAgcmV0dXJuIE1hdGguZmxvb3IoKDEgKyBNYXRoLnJhbmRvbSgpKSAqIDB4MTAwMDApLnRvU3RyaW5nKDE2KS5zdWJzdHJpbmcoMSk7XG4gICAgfVxuXG4gICAgcGVsbGV0LmdldFNlc3Npb25JZCA9IGZ1bmN0aW9uKGZvcmNlUmVnZW5lcmF0ZSkge1xuICAgICAgdmFyIHNlc3Npb25LZXkgPSBwZWxsZXQuY29uZmlnLmluc3RydW1lbnRhdGlvbi5jb29raWUgfHwgJ191aWQnO1xuXG4gICAgICBzZXNzaW9uSWQgPSBwZWxsZXQuY29va2llLmdldChzZXNzaW9uS2V5KTtcbiAgICAgIGlmICghc2Vzc2lvbklkIHx8IGZvcmNlUmVnZW5lcmF0ZSkge1xuICAgICAgICBpZihwZWxsZXQuY29uZmlnLmluc3RydW1lbnRhdGlvbi5sc3RvcmFnZSkge1xuICAgICAgICAgIHNlc3Npb25JZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKHNlc3Npb25LZXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoIXNlc3Npb25JZCB8fCBmb3JjZVJlZ2VuZXJhdGUpIHtcbiAgICAgICAgICBzZXNzaW9uSWQgPSAncElEOicgKyBzNCgpICsgczQoKSArIHM0KCkgKyAnLScgKyBzNCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcGVsbGV0LnNldFNlc3Npb25JZChzZXNzaW9uSWQsIHRydWUpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZXNzaW9uSWQ7XG4gICAgfVxuXG4gICAgcGVsbGV0LnNldFNlc3Npb25JZCA9IGZ1bmN0aW9uKHNlc3Npb25JZCwgZm9yY2UpIHtcbiAgICAgIHZhciBzZXNzaW9uS2V5ID0gcGVsbGV0LmNvbmZpZy5pbnN0cnVtZW50YXRpb24uY29va2llIHx8ICdfdWlkJztcblxuICAgICAgaWYoIWZvcmNlKSB7XG4gICAgICAgIHZhciBsYXN0U2Vzc2lvbklkID0gcGVsbGV0LmdldFNlc3Npb25JZCgpO1xuICAgICAgICBpZihsYXN0U2Vzc2lvbklkID09PSBzZXNzaW9uS2V5KSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmKHBlbGxldC5jb25maWcuaW5zdHJ1bWVudGF0aW9uLmxzdG9yYWdlKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHNlc3Npb25LZXksIHNlc3Npb25JZCk7XG4gICAgICB9XG5cbiAgICAgIHBlbGxldC5jb29raWUuc2V0KHNlc3Npb25LZXksIHNlc3Npb25JZCk7XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRpbWVvdXQoKSB7XG4gICAgICB0cmFja1BpeGVsID0gbmV3IEltYWdlKDEsMSk7XG4gICAgICB0cmFja1BpeGVsLnNyYyA9IF91cmwgKyAnP19iYT10Jl9jYWM9JyArICgrKG5ldyBEYXRlKCkpKSArIGJhdGNoVXJsO1xuXG4gICAgICBiYXRjaFRpbWVvdXQgPSBudWxsO1xuICAgICAgYmF0Y2hJbmRleCA9IDA7XG4gICAgICBiYXRjaFVybCA9ICcnO1xuICAgICAgYmF0Y2hfbiA9IG51bGw7XG4gICAgICBiYXRjaF90ID0gbnVsbDtcbiAgICAgIGJhdGNoX3MgPSBudWxsO1xuICAgIH1cblxuICAgIHBlbGxldC5pbnN0cnVtZW50YXRpb24uYnVzLm9uKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICB2YXIgc2Vzc2lvbklkID0gZGF0YS5zZXNzaW9uSWRcbiAgICAgICAgLCBuYW1lc3BhY2UgPSBkYXRhLm5hbWVzcGFjZVxuICAgICAgICAsIHBheWxvYWQgPSBkYXRhLmRldGFpbHNcbiAgICAgICAgLCB0eXBlID0gZGF0YS50eXBlXG4gICAgICAgICwgYXJnQ291bnRcbiAgICAgICAgLCB0cmFja1BpeGVsO1xuXG4gICAgICAvLyBkbyBub3Qgc2VuZCBmaWx0ZXJlZCB0eXBlcyB0byBzZXJ2ZXJcbiAgICAgIGlmKF9maWx0ZXIgJiYgIV9maWx0ZXIudGVzdCh0eXBlKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmKF91cmwpIHtcbiAgICAgICAgdmFyIHVybCA9ICcnXG4gICAgICAgICAgLCBxdWVyeSA9IFtdXG4gICAgICAgICAgLCBkYXRhO1xuXG4gICAgICAgIGlmKHR5cGVvZihwYXlsb2FkKSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgdGV4dDogcGF5bG9hZFxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkYXRhID0gT2JqZWN0LmNyZWF0ZShwYXlsb2FkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCFzZXNzaW9uSWQpIHtcbiAgICAgICAgICBzZXNzaW9uSWQgPSBwZWxsZXQuZ2V0U2Vzc2lvbklkKClcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCFfYmF0Y2hUaW1lb3V0IHx8IGJhdGNoX24gIT09IG5hbWVzcGFjZSkge1xuICAgICAgICAgIGRhdGEuX24gPSBiYXRjaF9uID0gbmFtZXNwYWNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoIV9iYXRjaFRpbWVvdXQgfHwgYmF0Y2hfdCAhPT0gdHlwZSkge1xuICAgICAgICAgIGRhdGEuX3QgPSBiYXRjaF90ID0gdHlwZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCFfYmF0Y2hUaW1lb3V0IHx8IGJhdGNoX3MgIT09IHNlc3Npb25JZCkge1xuICAgICAgICAgIGRhdGEuX3MgPSBiYXRjaF9zID0gc2Vzc2lvbklkO1xuICAgICAgICB9XG5cbiAgICAgICAgYXJnQ291bnQgPSAwO1xuICAgICAgICBmb3IoaSBpbiBkYXRhKSB7XG4gICAgICAgICAgaWYoZGF0YVtpXSkge1xuICAgICAgICAgICAgcXVlcnkucHVzaChpICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KGRhdGFbaV0pKTtcbiAgICAgICAgICAgIGFyZ0NvdW50Kys7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYocXVlcnkubGVuZ3RoKSB7XG4gICAgICAgICAgdXJsID0gcXVlcnkuam9pbignJicpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoIV9iYXRjaFRpbWVvdXQpIHtcbiAgICAgICAgICB2YXIgdHJhY2tQaXhlbCA9IG5ldyBJbWFnZSgxLDEpO1xuICAgICAgICAgIHRyYWNrUGl4ZWwuc3JjID0gX3VybCArICc/X2NhYz0nICsgKCsobmV3IERhdGUoKSkpICsgJyYnICsgdXJsO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGJhdGNoVXJsLmxlbmd0aCArIHVybC5sZW5ndGggKyAoYXJnQ291bnQgKiA0KSA8IG1heFVybCkge1xuICAgICAgICAgIGlmKGJhdGNoSW5kZXggPT09IDApIHtcbiAgICAgICAgICAgIGJhdGNoVXJsICs9ICcmJyArIHVybDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYmF0Y2hVcmwgKz0gJyYnICsgdXJsLnJlcGxhY2UoLz0vZywgJyQnICsgYmF0Y2hJbmRleCArICc9Jyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYmF0Y2hJbmRleCsrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRyYWNrUGl4ZWwgPSBuZXcgSW1hZ2UoMSwxKTtcbiAgICAgICAgICB0cmFja1BpeGVsLnNyYyA9IF91cmwgKyAnP19iYT10Jl9jYWM9JyArICgrKG5ldyBEYXRlKCkpKSArIGJhdGNoVXJsO1xuXG4gICAgICAgICAgYmF0Y2hVcmwgPSAnJztcbiAgICAgICAgICBiYXRjaEluZGV4ID0gMTtcbiAgICAgICAgICBiYXRjaF9uID0gbmFtZXNwYWNlO1xuICAgICAgICAgIGJhdGNoX3QgPSB0eXBlO1xuICAgICAgICAgIGJhdGNoX3MgPSBzZXNzaW9uSWQ7XG5cbiAgICAgICAgICBpZih1cmwuaW5kZXhPZignX249JykgPT09IC0xKSB7XG4gICAgICAgICAgICBiYXRjaFVybCA9ICcmX249JyArIGVuY29kZVVSSUNvbXBvbmVudChiYXRjaF9uKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZih1cmwuaW5kZXhPZignX3Q9JykgPT09IC0xKSB7XG4gICAgICAgICAgICBiYXRjaFVybCArPSAnJl90PScgKyBlbmNvZGVVUklDb21wb25lbnQoYmF0Y2hfdCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYodXJsLmluZGV4T2YoJ19zPScpID09PSAtMSkge1xuICAgICAgICAgICAgYmF0Y2hVcmwgKz0gJyZfcz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KGJhdGNoX3MpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGJhdGNoVXJsICs9ICcmJyArIHVybDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCFiYXRjaFRpbWVvdXQpIHtcbiAgICAgICAgICBiYXRjaFRpbWVvdXQgPSBzZXRUaW1lb3V0KHRpbWVvdXQsIF9iYXRjaFRpbWVvdXQpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmRlYnVnKCdpbnN0cnVtZW50OicsIHNlc3Npb25JZCwgdHlwZSwgbmFtZXNwYWNlLCBKU09OLnN0cmluZ2lmeShwYXlsb2FkKSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBuZXh0KCk7XG4gIH0pO1xufVxuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAvdXNyL2xvY2FsL2xpYi9+L3BlbGxldC9zcmMvaW5zdHJ1bWVudGF0aW9uL2xvY2FsLmpzXG4gKiogbW9kdWxlIGlkID0gNlxuICoqIG1vZHVsZSBjaHVua3MgPSAyXG4gKiovIiwidmFyIHBlbGxldCA9IHJlcXVpcmUoJ3BlbGxldCcpXG4gICwgcGVsbGV0UmVuZGVyID0gcmVxdWlyZSgnLi8uLi9yZW5kZXInKVxuICAsIGlzb21vcnBoaWNIdHRwID0gcmVxdWlyZSgnLi9odHRwJylcbiAgLCB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJylcbiAgLCByb3V0ZVRhYmxlID0gcmVxdWlyZSgnLi8uLi9yb3V0ZS10YWJsZScpXG5cbnZhciBydW50aW1lSXNvbGF0ZWRDb25maWcgPSBudWxsO1xudmFyIHJ1bnRpbWVSZXF1ZXN0Q29udGV4dCA9IG51bGw7XG5pZihwcm9jZXNzLmVudi5CUk9XU0VSX0VOVikge1xuICBydW50aW1lSXNvbGF0ZWRDb25maWcgPSB7fTtcbiAgcnVudGltZVJlcXVlc3RDb250ZXh0ID0ge307XG59XG5cbnBlbGxldC5yb3V0ZXMgPSBuZXcgcm91dGVUYWJsZSgpOyAvLyBUT0RPOiBwYXNzIGluIGFuIG9wdGlvbnMgZm9yIHNlbnNpdGl2ZSAmIHN0cmljdCB2aSBwZWxsZXQuY29uZmlnXG5wZWxsZXQuc2tlbGV0b25QYWdlUmVuZGVyID0gZmFsc2U7XG5cbnBlbGxldC5zZXRTa2VsZXRvblBhZ2UgPSBmdW5jdGlvbih0ZW1wbGF0aW5nRm4pIHtcbiAgdGhpcy5za2VsZXRvblBhZ2VSZW5kZXIgPSB0ZW1wbGF0aW5nRm47XG59O1xuXG4vKipcbiAqXG4gKiBAcGFyYW0gcm91dGVcbiAqIEBwYXJhbSBjb21wb25lbnRcbiAqIEBwYXJhbSBvcHRpb25zXG4gKi9cbnBlbGxldC5hZGRDb21wb25lbnRSb3V0ZSA9IGZ1bmN0aW9uKHJvdXRlLCBjb21wb25lbnQsIG9wdGlvbnMpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcblxuICB0aGlzLnJvdXRlcy5hZGQocm91dGUsIGZ1bmN0aW9uKCkge1xuICAgIHZhciBfZXhwZXJpbWVudFxuICAgICAgLCByb3V0ZUNvbnRleHQgPSB0aGlzXG4gICAgICAsIF9jb21wb25lbnQgPSBjb21wb25lbnRcbiAgICAgICwgcmVuZGVyT3B0aW9ucyA9IHtwcm9wczp7fSwgaXNvbGF0ZWRDb25maWc6cnVudGltZUlzb2xhdGVkQ29uZmlnLCByZXF1ZXN0Q29udGV4dDpydW50aW1lUmVxdWVzdENvbnRleHR9O1xuXG4gICAgdHJ5IHtcbiAgICAgIGlmKHByb2Nlc3MuZW52LlNFUlZFUl9FTlYpIHtcbiAgICAgICAgaWYob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy5tb2RlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHJlbmRlck9wdGlvbnMubW9kZSA9IG9wdGlvbnMubW9kZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvL2p1c3QgZm9yIGJvdHMgZG8gbm90IHJldHVybiByZWFjdC1pZCB2ZXJzaW9uICh0aGUgcm91dGVDb250ZXh0LnJlcXVlc3QgY29tZXMgZnJvbSBwZWxsZXQgbWlkZGxld2FyZSBwYXNzaW5nIGluIHRoZSBleHByZXNzIHJlcXVlc3RcbiAgICAgICAgICAvL2lmICghb3B0aW9ucy5tb2RlICYmIHJvdXRlQ29udGV4dC5yZXF1ZXN0KSB7XG4gICAgICAgICAgLy8gIGlmICgvZ29vZ2xlYm90fGd1cnVqaWJvdHx0d2l0dGVyYm90fHlhbmRleGJvdHxzbHVycHxtc25ib3R8YmluZ2JvdHxyb2dlcmJvdHxmYWNlYm9va2V4dGVybmFsaGl0L2kudGVzdChyb3V0ZUNvbnRleHQucmVxdWVzdC5oZWFkZXJzWyd1c2VyLWFnZW50J10gfHwgJycpKSB7XG4gICAgICAgICAgLy8gICAgb3B0aW9ucy5tb2RlID0gcGVsbGV0UmVuZGVyLk1PREVfU1RSSU5HO1xuICAgICAgICAgIC8vICB9XG4gICAgICAgICAgLy99XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjcmVhdGUgYSBpc29tb3JwaGljIGh0dHAgcHJvdmlkZXIgZm9yIHRoZSBpc29tb3JwaGljIHJlbmRlclxuICAgICAgICByZW5kZXJPcHRpb25zLmh0dHAgPSBuZXcgaXNvbW9ycGhpY0h0dHAoXG4gICAgICAgICAgcm91dGVDb250ZXh0LnJlcXVlc3QsXG4gICAgICAgICAgcm91dGVDb250ZXh0LnJlc3Bvc2UsXG4gICAgICAgICAgcm91dGVDb250ZXh0Lm5leHQpO1xuXG4gICAgICAgIHJlbmRlck9wdGlvbnMucmVxdWVzdENvbnRleHQgPSByb3V0ZUNvbnRleHQucmVxdWVzdC5yZXF1ZXN0Q29udGV4dDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGNyZWF0ZSBhIGlzb21vcnBoaWMgaHR0cCBwcm92aWRlciBmb3IgdGhlIGlzb21vcnBoaWMgcmVuZGVyXG4gICAgICAgIHJlbmRlck9wdGlvbnMuaHR0cCA9IG5ldyBpc29tb3JwaGljSHR0cCgpO1xuXG4gICAgICAgIC8vIGluIHRoZSBicm93c2VyIG9ubHkgdXNlIHRoZSBzZXJpYWxpemVkIGRhdGUgb25jZSB0aGUgYm9vdHN0cmFwXG4gICAgICAgIC8vIGNhbGwgcm91dGVyLlxuICAgICAgICBpZih3aW5kb3cuX19wZWxsZXRfX2N0eCkge1xuICAgICAgICAgIHJlbmRlck9wdGlvbnMuY29udGV4dCA9IHdpbmRvdy5fX3BlbGxldF9fY3R4O1xuICAgICAgICAgIGRlbGV0ZSB3aW5kb3cuX19wZWxsZXRfX2N0eDtcblxuICAgICAgICAgIGlmKHR5cGVvZihyZW5kZXJPcHRpb25zLmNvbnRleHQpID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgcmVuZGVyT3B0aW9ucy5jb250ZXh0ID0gSlNPTi5wYXJzZShyZW5kZXJPcHRpb25zLmNvbnRleHQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKHR5cGVvZihyZW5kZXJPcHRpb25zLmNvbnRleHQucmVxdWVzdENvbnRleHQpICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcnVudGltZVJlcXVlc3RDb250ZXh0ID0gcmVuZGVyT3B0aW9ucy5yZXF1ZXN0Q29udGV4dCA9IHJlbmRlck9wdGlvbnMuY29udGV4dC5yZXF1ZXN0Q29udGV4dDtcbiAgICAgICAgICAgIGRlbGV0ZSByZW5kZXJPcHRpb25zLmNvbnRleHQucmVxdWVzdENvbnRleHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIG1lcmdlIGluIHRoZSByb3V0ZXMgYXJndW1lbnQgaW50byB0aGUgcHJvcHNcbiAgICAgIHJlbmRlck9wdGlvbnMucHJvcHMub3JpZ2luYWxVcmwgPSByb3V0ZUNvbnRleHQub3JpZ2luYWxVcmw7XG4gICAgICByZW5kZXJPcHRpb25zLnByb3BzLnBhcmFtcyA9IHJvdXRlQ29udGV4dC5wYXJhbXM7XG4gICAgICByZW5kZXJPcHRpb25zLnByb3BzLnF1ZXJ5ID0gcm91dGVDb250ZXh0LnF1ZXJ5O1xuICAgICAgcmVuZGVyT3B0aW9ucy5wcm9wcy51cmwgPSByb3V0ZUNvbnRleHQudXJsO1xuXG4gICAgICAvLyBub3cgY2hlY2sgaWYgdGhlIHJvdXRlIG5lZWRzIHRvIHVubW91bnQgdGhlIHBhZ2Ugb3IgdXNlIHRoZSBkZWZhdWx0XG4gICAgICAvLyByZWFjdElnbm9yZVJvdXRlVW5tb3VudCBjb25maWcgdmFsdWVcbiAgICAgIGlmKG9wdGlvbnMgJiYgdHlwZW9mKG9wdGlvbnMub25Sb3V0ZVVubW91bnRSZWFjdCkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJlbmRlck9wdGlvbnMub25Sb3V0ZVVubW91bnRSZWFjdCA9ICEhb3B0aW9ucy5vblJvdXRlVW5tb3VudFJlYWN0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVuZGVyT3B0aW9ucy5vblJvdXRlVW5tb3VudFJlYWN0ID0gIXBlbGxldC5jb25maWcucmVhY3RJZ25vcmVSb3V0ZVVubW91bnQ7XG4gICAgICB9XG5cbiAgICAgIC8vIG5vdyBjaGVjayBpZiB0aGUgcGFnZSBjb21wb25lbnQgaXMgYXBhcnQgb2YgYSBleHBlcmltZW50IGFuZCBnZXQgdGhlIGNvcnJlY3QgdmFyaWF0aW9uXG4gICAgICBpZigoX2V4cGVyaW1lbnQgPSBwZWxsZXQuZXhwZXJpbWVudC5zZWxlY3QoX2NvbXBvbmVudCwgcmVuZGVyT3B0aW9ucy5pc29sYXRlZENvbmZpZywgb3B0aW9ucy5leHBlcmltZW50SWQsIHJlbmRlck9wdGlvbnMpKSkge1xuICAgICAgICBfY29tcG9uZW50ID0gX2V4cGVyaW1lbnQ7XG4gICAgICB9XG5cbiAgICAgIC8vIGlmIGEgbGF5b3V0IGlzIGRlZmluZWQgd2Ugc3dhcCB0aGUgY29tcG9uZW50IHdpdGggaXRzIGxheW91dCBjb21wb25lbnRcbiAgICAgIC8vIGFuZCBwYXNzIHRoZSBjb21wb25lbnQgdG8gdGhlIGxheW91dCB1c2luZyBsYXlvdXRDb250ZW50IHByb3BzLlxuICAgICAgLy8gTk9URTogX2NvbXBvbmVudCBpcyBuZWVkZWQgYmVjYXVzZSB0aGUgd2F5IHRoZSBhZGRDb21wb25lbnRSb3V0ZSBjbG9zZXJcbiAgICAgIC8vICAgICAgIHdlIGRvIG5vdCB3YW50IHRvIG92ZXIgd3JpdGUgY29tcG9uZW50IGJlY2F1c2UgdGhlIG5leHQgY2FsbCB3aWxsXG4gICAgICAvLyAgICAgICBiZSB3cm9uZyFcbiAgICAgIGlmKF9jb21wb25lbnQuX18kbGF5b3V0KSB7XG4gICAgICAgIHJlbmRlck9wdGlvbnMucHJvcHMuX19sYXlvdXRDb250ZW50ID0gX2NvbXBvbmVudDtcbiAgICAgICAgX2NvbXBvbmVudCA9IHBlbGxldC5jb21wb25lbnRzW19jb21wb25lbnQuX18kbGF5b3V0XTtcbiAgICAgIH1cblxuICAgICAgLy8gdXNlIHBlbGxldHMgZGVmYXVsdCBsb2NhbGUgbG9va3VwIGZ1bmN0aW9uIChkZXZzIGNhbiBvdmVyd3JpdGUgdGhpcyBmb3IgY3VzdG9tIGxvZ2ljKVxuICAgICAgcmVuZGVyT3B0aW9ucy5sb2NhbGVzID0gX3RoaXMuc3VnZ2VzdExvY2FsZXMocmVuZGVyT3B0aW9ucywgX2NvbXBvbmVudCwgb3B0aW9ucyk7XG5cbiAgICAgIC8vIG5vdyByZW5kZXIgdGhlIGNvbXBvbmVudCAodXNpbmcgaXNvbW9ycGhpYyByZW5kZXIpXG4gICAgICBwZWxsZXRSZW5kZXIucmVuZGVyQ29tcG9uZW50KF9jb21wb25lbnQsIHJlbmRlck9wdGlvbnMsIGZ1bmN0aW9uKGVyciwgaHRtbCwgY3R4KSB7XG4gICAgICAgIGlmKHByb2Nlc3MuZW52LlNFUlZFUl9FTlYpIHtcbiAgICAgICAgICBpZihlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHJlbmRlcmluZyBjb21wb25lbnQgYmVjYXVzZTonLCBlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICByb3V0ZUNvbnRleHQubmV4dChlcnIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKCFyb3V0ZUNvbnRleHQucmVzcG9zZS5nZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScpKSB7XG4gICAgICAgICAgICByb3V0ZUNvbnRleHQucmVzcG9zZS5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICd0ZXh0L2h0bWwnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBhZGQgdXNlci1hZ2VudCBoYXNoIGFuZCB0aGUgYnVpbGQgbnVtYmVyIHRvIHRoZSByZW5kZXIgb3B0aW9ucyB0byBoZWxwIHdpdGggY2FjaGUgY29udHJvbFxuICAgICAgICAgIHJlbmRlck9wdGlvbnMudXNoYXNoID0gdXRpbHMuZGpiMihyb3V0ZUNvbnRleHQucmVxdWVzdC5oZWFkZXJzWyd1c2VyLWFnZW50J118fCcnKS50b1N0cmluZygzMik7XG4gICAgICAgICAgcmVuZGVyT3B0aW9ucy5tYW5pZmVzdCA9IHBlbGxldC5vcHRpb25zLm1hbmlmZXN0O1xuXG4gICAgICAgICAgaWYoX3RoaXMuc2tlbGV0b25QYWdlUmVuZGVyKSB7XG4gICAgICAgICAgICBodG1sID0gX3RoaXMuc2tlbGV0b25QYWdlUmVuZGVyKGh0bWwsIGN0eCwgcmVuZGVyT3B0aW9ucyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gaWYgZXhwcmVzc2pzIG9yIG5vZGVqc1xuICAgICAgICAgIGlmKHJvdXRlQ29udGV4dC5yZXNwb3NlLnN0YXR1cykge1xuICAgICAgICAgICAgcm91dGVDb250ZXh0LnJlc3Bvc2Uuc2VuZChodG1sKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcm91dGVDb250ZXh0LnJlc3Bvc2UuZW5kKGh0bWwpO1xuICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgdHJ5aW5nIHRvIHJlbmRlciBiZWNhdXNlOicsIGVyci5tZXNzYWdlLCBlcnIuc3RhY2spO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG5vdyBpbnN0cnVtZW50IHRoZSByb3V0ZSBjaGFuZ2Ugc28gcGFnZXZpZXdzIGNhbiBiZSB0cmFja2VkXG4gICAgICAgIHBlbGxldC5pbnN0cnVtZW50YXRpb24uZW1pdCgncm91dGVjaGFuZ2UnLCB7XG4gICAgICAgICAgb3JpZ2luYWxVcmw6IHJlbmRlck9wdGlvbnMucHJvcHMub3JpZ2luYWxVcmwsXG4gICAgICAgICAgcGFyYW1zOiByZW5kZXJPcHRpb25zLnByb3BzLnBhcmFtcyxcbiAgICAgICAgICBxdWVyeTogcmVuZGVyT3B0aW9ucy5wcm9wcy5xdWVyeSxcbiAgICAgICAgICB1cmw6IHJlbmRlck9wdGlvbnMucHJvcHMudXJsLFxuICAgICAgICAgIHBpcGVsaW5lOiBjdHhcbiAgICAgICAgfSk7XG5cbiAgICAgIH0pO1xuICAgIH0gY2F0Y2goZXgpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHRyeWluZyB0byByZW5kZXIgYmVjYXVzZTonLCBleC5tZXNzYWdlLCBleC5zdGFjayk7XG4gICAgICBpZihwcm9jZXNzLmVudi5TRVJWRVJfRU5WKSB7XG4gICAgICAgIHJvdXRlQ29udGV4dC5uZXh0KGV4KTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIG9wdGlvbnMpO1xufTtcblxuaWYocHJvY2Vzcy5lbnYuU0VSVkVSX0VOVikge1xuICAvLyBTRVJWRVIgRU5WSVJPTk1FTlRcbiAgLy8gYWRkIG91ciBiYXNpYyByb3V0aW5nIG1pZGRsZXdhcmVcblxuICBwZWxsZXQubWlkZGxld2FyZVN0YWNrLnB1c2goe1xuICAgIHByaW9yaXR5OiAxMCxcbiAgICBmbjogZnVuY3Rpb24gKHJlcSwgcmVzLCBuZXh0KSB7XG4gICAgICB2YXIgbWF0Y2ggPSBwZWxsZXQucm91dGVzLnBhcnNlKHJlcS5vcmlnaW5hbFVybCk7XG4gICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgIHJldHVybiBuZXh0KCk7XG4gICAgICB9XG5cbiAgICAgIG1hdGNoLnJlcXVlc3QgPSByZXE7XG4gICAgICBtYXRjaC5yZXNwb3NlID0gcmVzO1xuICAgICAgbWF0Y2gubmV4dCA9IG5leHQ7XG5cbiAgICAgIG1hdGNoLmZuLmNhbGwobWF0Y2gpO1xuICAgIH1cbiAgfSk7XG59IGVsc2UgaWYocHJvY2Vzcy5lbnYuQlJPV1NFUl9FTlYpIHtcbiAgLy8gQlJPV1NFUiBFTlZJUk9OTUVOVFxuICAvLyBib290c3RyYXAgdGhlIGJyb3dzZXIgZW52aXJvbm1lbnQgYnV0IHRyaWdnZXJpbmcgdGhlIHJvdXRlXG4gIC8vIHRoZSBwYWdlIHdhcyBsb2FkZWQgYW5kIHJlcGxheSB0aGUgZXZlbnRzIG9uIHRoZSBzZXJ2ZXJcbiAgLy8gcmVuZGVyLlxuXG4gIHBlbGxldC5vblJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIHZhciBtYXRjaCA9IHBlbGxldC5yb3V0ZXMucGFyc2UobG9jYXRpb24ucGF0aG5hbWUgKyBsb2NhdGlvbi5zZWFyY2gpO1xuICAgIGlmKG1hdGNoICYmIG1hdGNoLmZuKSB7XG4gICAgICBtYXRjaC5mbi5jYWxsKG1hdGNoKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBjdXJyZW50TG9jYXRpb24gPSBsb2NhdGlvbi5wYXRobmFtZSArIGxvY2F0aW9uLnNlYXJjaDtcbiAgZnVuY3Rpb24gbmF2aWdhdGUobmV3TG9jYXRpb24sIG1hdGNoKSB7XG4gICAgY29uc29sZS5kZWJ1ZygncGVsbGV0IG5hdmlnYXRlKCcsIG5ld0xvY2F0aW9uLCAnKScpO1xuICAgIGlmIChuZXdMb2NhdGlvbiA9PT0gY3VycmVudExvY2F0aW9uKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY3VycmVudExvY2F0aW9uID0gbmV3TG9jYXRpb247XG5cbiAgICBpZighbWF0Y2gpIHtcbiAgICAgIG1hdGNoID0gcGVsbGV0LnJvdXRlcy5wYXJzZShuZXdMb2NhdGlvbik7XG4gICAgfVxuXG4gICAgaWYobWF0Y2gpIHtcbiAgICAgIGNvbnNvbGUuZGVidWcoJ3BlbGxldCBtYXRjaGVkIHJvdXRlJywgbmV3TG9jYXRpb24pO1xuICAgICAgbWF0Y2guZm4uY2FsbChtYXRjaCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0NhbiBub3QgZmluZCByb3V0ZSBmb3I6JywgbmV3TG9jYXRpb24pO1xuICAgICAgd2luZG93LmxvY2F0aW9uID0gbmV3TG9jYXRpb247XG4gICAgfVxuICB9O1xuXG4gIHBlbGxldC5hZGRXaW5kb3dPbnJlYWR5RXZlbnQoZnVuY3Rpb24oKSB7XG4gICAgLy8gaGFuZGxlIGJhY2sgYW5kIGZvcndhcmQgYnV0dG9uIHJlcXVlc3RzXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgZnVuY3Rpb24oKSB7XG4gICAgICBuYXZpZ2F0ZShsb2NhdGlvbi5wYXRobmFtZSArIGxvY2F0aW9uLnNlYXJjaCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIHBlbGxldC5zZXRMb2NhdGlvbiA9IGZ1bmN0aW9uKHVybCwgdGl0bGUsIGRhdGEpIHtcbiAgICBpZighdXJsKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB2YXIgbWF0Y2ggPSBwZWxsZXQucm91dGVzLnBhcnNlKHVybCk7XG4gICAgaWYoIW1hdGNoKSB7XG4gICAgICBjb25zb2xlLmRlYnVnKCdzZXQgdmlhIHdpbmRvdy5sb2NhdGlvbicpXG4gICAgICB3aW5kb3cubG9jYXRpb24gPSB1cmw7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc29sZS5kZWJ1Zygnc2V0IHZpYSB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUnKVxuICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZShkYXRhIHx8IG51bGwsIHRpdGxlIHx8ICcnLCB1cmwpO1xuICAgIG5hdmlnYXRlKHVybCk7XG4gIH1cblxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgbm9kZSA9IGUudGFyZ2V0O1xuICAgIHdoaWxlKG5vZGUpIHtcbiAgICAgIGlmIChub2RlLm5vZGVOYW1lID09ICdBJykge1xuXG4gICAgICAgIGlmIChub2RlLmhhc0F0dHJpYnV0ZSgnZGF0YS1zdG9wLXByb3BhZ2F0aW9uJykpIHtcbiAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtZXh0ZXJuYWwtbGluaycpID09ICd0cnVlJykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKG5vZGUudGFyZ2V0ICYmIG5vZGUudGFyZ2V0ICE9ICdfc2VsZicpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaHJlZiA9IG5vZGUuZ2V0QXR0cmlidXRlKCdocmVmJyk7XG4gICAgICAgIGlmKCFocmVmKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG1hdGNoID0gcGVsbGV0LnJvdXRlcy5wYXJzZShocmVmKTtcbiAgICAgICAgaWYoIW1hdGNoKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZShudWxsLCAnJywgaHJlZik7XG4gICAgICAgIG5hdmlnYXRlKGhyZWYsIG1hdGNoKTtcbiAgICAgIH1cblxuICAgICAgbm9kZSA9IG5vZGUucGFyZW50Tm9kZTtcbiAgICB9XG4gIH0pO1xufVxuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAvdXNyL2xvY2FsL2xpYi9+L3BlbGxldC9zcmMvaXNvbW9ycGhpYy9yb3V0ZS5qc1xuICoqIG1vZHVsZSBpZCA9IDdcbiAqKiBtb2R1bGUgY2h1bmtzID0gMlxuICoqLyIsInZhciBwZWxsZXQgPSByZXF1aXJlKCcuLi8uLi9wZWxsZXQnKTtcblxuZnVuY3Rpb24gZ2FFeHBlcmltZW50KGV4cGVyaW1lbnRzLCBjb25maWcpIHtcbiAgdGhpcy5leHBlcmltZW50cyA9IGV4cGVyaW1lbnRzO1xuICB0aGlzLmFsbFZhcmlhdGlvbnMgPSAoY29uZmlnICYmIGNvbmZpZy5jb25maWcpIHx8IHt9O1xuICB0aGlzLmluc3RydW1lbnQgPSBwZWxsZXQuaW5zdHJ1bWVudGF0aW9uLm5hbWVzcGFjZSgnZ2FfZXhwZXJpbWVudCcpO1xuICB0aGlzLnZhcmlhdGlvbkNhY2hlID0ge307XG59XG5cbmdhRXhwZXJpbWVudC5wcm90b3R5cGUuc2VsZWN0ID0gZnVuY3Rpb24obmFtZSwgY3R4LCBleHBlcmltZW50SWQsIF9yZW5kZXJPcHRpb25zKSB7XG4gIHZhciBpLCB0eXBlLCBjaG9pY2UsIHZlcnNpb24sIGFsbEV4cGVyaW1lbnRzO1xuXG4gIGlmKG5hbWUgPT09IG51bGwpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBmaW5kIG91dCB0aGUgbmFtZSdzIHR5cGUuIEl0IGNhbiBiZSBhIGNvbXBvbmVudFxuICAvLyBvciBhIHN0cmluZyBpZiB0aGUgZm9ybWF0IG9mICdAY29tcG9uZW50JyBvclxuICAvLyAnPXZhcmlhdGlvblZhbHVlJyBvciBqdXN0IGEgc3RyaW5nXG4gIGlmKHR5cGVvZiBuYW1lID09PSAnZnVuY3Rpb24nKSB7XG4gICAgLy8gbG9vayB1cCB0aGUgY29tcG9uZW50J3MgdmVyc2lvbi9rZXlcbiAgICBmb3IoaSBpbiBwZWxsZXQuY29tcG9uZW50cykge1xuICAgICAgaWYocGVsbGV0LmNvbXBvbmVudHNbaV0gPT09IG5hbWUpIHtcbiAgICAgICAgbmFtZSA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGlmIG5vdCBmb3VuZCByZXR1cm4gdW5kZWZpbmVkXG4gICAgaWYodHlwZW9mIG5hbWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoMCwgbmFtZS5pbmRleE9mKCdAJykpO1xuICAgIHR5cGUgPSAxO1xuICB9IGVsc2UgaWYodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgY29uc29sZS53YXJuKCdHQSBleHBlcmltZW50OiBpbnZhbGlkIHZlcnNpb24gZXhwZXJpbWVudDonLCBleHBlcmltZW50SWQsICd0eXBlOicsIHR5cGVvZiBuYW1lLCAnbmFtZTonLCBuYW1lKTtcbiAgICB0aGlzLmluc3RydW1lbnQuaW5jcmVtZW50KGV4cGVyaW1lbnRJZCArICcubWlzc2luZ19jb21wb25lbnQnKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZXhwZXJpbWVudCB2ZXJzaW9uIHR5cGUnKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAobmFtZVswXSA9PT0gJ0AnKSB7XG4gICAgICB0eXBlID0gMTtcbiAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cmluZygxKTtcbiAgICB9IGVsc2UgaWYgKG5hbWVbMF0gPT09ICc9Jykge1xuICAgICAgdHlwZSA9IDI7XG4gICAgICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoMSk7XG4gICAgfVxuXG4gICAgaWYgKCFuYW1lKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gaWYgdGhlIGtleSBoYXMgYSB2ZXJzaW9uIHVzZSB0aGUgc3BlY2lmaWVkIHZlcnNpb25cbiAgICAvLyBhbmQgaWdub3JlIHRoZSBleHBlcmltZW50IHZlcnNpb25cbiAgICBpZiAodHlwZSAhPT0gMiAmJiBuYW1lLmluZGV4T2YoJ0AnKSAhPT0gLTEpIHtcbiAgICAgIHJldHVybiBwZWxsZXQuY29tcG9uZW50c1tuYW1lXTtcbiAgICB9XG5cbiAgICBpZiAodHlwZSAhPT0gMSAmJiAoaSA9IG5hbWUuaW5kZXhPZignPScpKSAhPT0gLTEpIHtcbiAgICAgIHJldHVybiBuYW1lLnN1YnN0cmluZyhpICsgMSk7XG4gICAgfVxuICB9XG5cbiAgaWYodHlwZSA9PT0gMSkge1xuICAgIGFsbEV4cGVyaW1lbnRzID0gdGhpcy5hbGxWYXJpYXRpb25zWydAJytuYW1lXTtcbiAgfSBlbHNlIGlmKHR5cGUgPT09IDIpIHtcbiAgICBhbGxFeHBlcmltZW50cyA9IHRoaXMuYWxsVmFyaWF0aW9uc1snPScrbmFtZV07XG4gIH0gZWxzZSB7XG4gICAgaWYoKGFsbEV4cGVyaW1lbnRzID0gdGhpcy5hbGxWYXJpYXRpb25zWydAJytuYW1lXSkpIHtcbiAgICAgIHR5cGUgPSAxO1xuICAgIH0gZWxzZSBpZigoYWxsRXhwZXJpbWVudHMgPSB0aGlzLmFsbFZhcmlhdGlvbnNbJz0nK25hbWVdKSkge1xuICAgICAgdHlwZSA9IDI7XG4gICAgfVxuICB9XG5cbiAgLy8gaWYgbm8gZXhwZXJpbWVudCBkYXRhIHRyeSB0byBmaW5kIHRoZVxuICAvLyBkZWZhdWx0IGNvbXBvbmVudCBvciB0aGUgdmFyaWF0aW9uIHZhbHVlXG4gIGlmKCFhbGxFeHBlcmltZW50cykge1xuICAgIGlmKHR5cGUgPT09IDEpIHJldHVybiBwZWxsZXQuY29tcG9uZW50c1tuYW1lXTtcbiAgICBlbHNlIGlmKHR5cGUgPT09IDIpIHJldHVybiBuYW1lO1xuICAgIHJldHVybiBwZWxsZXQuY29tcG9uZW50c1tuYW1lXSB8fCBuYW1lO1xuICB9XG5cbiAgaWYodHlwZW9mIGV4cGVyaW1lbnRJZCA9PT0gJ3N0cmluZycpIHtcbiAgICBpZighYWxsRXhwZXJpbWVudHNbZXhwZXJpbWVudElkXSkge1xuICAgICAgY29uc29sZS53YXJuKCdDYW5ub3QgZmluZCBjb21wb25lbnQgZm9yIGV4cGVyaW1lbnQnLCBleHBlcmltZW50SWQsICdpdHMgbWlzc2luZyBmcm9tIG91ciB2YXJpYXRpb25zIGxpc3QnLCBhbGxFeHBlcmltZW50cyk7XG4gICAgICB0aGlzLmluc3RydW1lbnQuaW5jcmVtZW50KGV4cGVyaW1lbnRJZCsnLm1pc3NpbmdfY29tcG9uZW50Jyk7XG5cbiAgICAgIGlmKHR5cGUgPT09IDEpIHJldHVybiBwZWxsZXQuY29tcG9uZW50c1tuYW1lXTtcbiAgICAgIGVsc2UgaWYodHlwZSA9PT0gMikgcmV0dXJuIG5hbWU7XG4gICAgICByZXR1cm4gcGVsbGV0LmNvbXBvbmVudHNbbmFtZV0gfHwgbmFtZTtcbiAgICB9XG5cbiAgICB2ZXJzaW9uID0gdGhpcy5nZXRWYXJpYXRpb24oZXhwZXJpbWVudElkKTtcbiAgICBjaG9pY2UgPSBhbGxFeHBlcmltZW50c1tleHBlcmltZW50SWRdW3ZlcnNpb25dO1xuXG4gIH0gZWxzZSB7XG4gICAgZm9yKGkgaW4gYWxsRXhwZXJpbWVudHMpIHtcbiAgICAgIHZlcnNpb24gPSB0aGlzLmdldFZhcmlhdGlvbihpKTtcbiAgICAgIHZlcnNpb24gPSBhbGxFeHBlcmltZW50c1tpXVt2ZXJzaW9uXTtcblxuICAgICAgaWYoY2hvaWNlICYmIGNob2ljZSAhPT0gdmVyc2lvbikge1xuICAgICAgICBjb25zb2xlLndhcm4oJ0FtYmlndW91cyBleHBlcmltZW50IGNhbm5vdCBwaWNrIGNvbXBvbmVudCBiZWNhdXNlIHRvIG1hbnk6JywgbmFtZSwgJ2luJywgYWxsRXhwZXJpbWVudHMpO1xuICAgICAgICB0aGlzLmluc3RydW1lbnQuaW5jcmVtZW50KGFsbEV4cGVyaW1lbnRzW2ldKycuYW1iaWd1b3VzJyk7XG4gICAgICB9XG5cbiAgICAgIGNob2ljZSA9IHZlcnNpb247XG4gICAgfVxuICB9XG5cbiAgaWYodHlwZSA9PT0gMSkge1xuICAgIHZlcnNpb24gPSBwZWxsZXQuY29tcG9uZW50c1tuYW1lKydAJytjaG9pY2VdO1xuICB9IGVsc2UgaWYodHlwZSA9PT0gMikge1xuICAgIHZlcnNpb24gPSBjaG9pY2U7XG4gIH0gZWxzZSB7XG4gICAgdmVyc2lvbiA9IHBlbGxldC5jb21wb25lbnRzW25hbWUrJ0AnK2Nob2ljZV0gfHwgbmFtZTtcbiAgfVxuXG4gIGlmKCF2ZXJzaW9uKSB7XG4gICAgY29uc29sZS5lcnJvcignQ2Fubm90IGZpbmQgY29tcG9uZW50ICcsIG5hbWUsICdmb3IgY2hvaWNlJywgY2hvaWNlLCAnYmVjYXVzZSBjb21wb25lbnQgbm90IGluIG1hbmlmZXN0Jyk7XG4gICAgdGhpcy5pbnN0cnVtZW50LmluY3JlbWVudCgoZXhwZXJpbWVudElkfHwnTkEnKSsnLm1pc3NpbmdfY29tcG9uZW50X2Nob2ljZScpO1xuICAgIHJldHVybiBwZWxsZXQuY29tcG9uZW50c1tuYW1lXTtcbiAgfVxuXG4gIHJldHVybiB2ZXJzaW9uO1xufVxuXG4vKipcbiAqXG4gKiBAcGFyYW0gZXhwZXJpbWVudElkXG4gKiBAcmV0dXJuIHsqfSBudWxsIGlmIG5vdCBwYXJ0aWNpcGF0aW5nLCBlbHNlIDAtblxuICovXG5nYUV4cGVyaW1lbnQucHJvdG90eXBlLmdldFZhcmlhdGlvbiA9IGZ1bmN0aW9uKGV4cGVyaW1lbnRJZCkge1xuICBpZihleHBlcmltZW50SWQgaW4gdGhpcy52YXJpYXRpb25DYWNoZSkge1xuICAgIGNvbnNvbGUuZGVidWcoJ2V4cGVyaW1lbnQ6IHVzaW5nIGNhY2hlJyk7XG4gICAgcmV0dXJuIHRoaXMudmFyaWF0aW9uQ2FjaGVbZXhwZXJpbWVudElkXTtcbiAgfVxuXG4gIHZhciB2YXJpYXRpb24gPSBjeEFwaS5nZXRDaG9zZW5WYXJpYXRpb24oZXhwZXJpbWVudElkKTtcbiAgaWYgKHZhcmlhdGlvbiA9PT0gY3hBcGkuTk9fQ0hPU0VOX1ZBUklBVElPTikge1xuICAgIGNvbnNvbGUuZGVidWcoJ2V4cGVyaW1lbnQ6JywgZXhwZXJpbWVudElkLCAnTk9fQ0hPU0VOX1ZBUklBVElPTicpO1xuICAgIHZhcmlhdGlvbiA9IGN4QXBpLmNob29zZVZhcmlhdGlvbihleHBlcmltZW50SWQpO1xuICAgIGN4QXBpLnNldENob3NlblZhcmlhdGlvbih2YXJpYXRpb24sIGV4cGVyaW1lbnRJZCk7XG5cbiAgICB0aGlzLnZhcmlhdGlvbkNhY2hlW2V4cGVyaW1lbnRJZF0gPSB2YXJpYXRpb247XG5cbiAgICB0aGlzLmluc3RydW1lbnQuaW5jcmVtZW50KGV4cGVyaW1lbnRJZCsnLnBpY2suJyt2YXJpYXRpb24pO1xuICB9IGVsc2UgaWYgKHZhcmlhdGlvbiA9PT0gY3hBcGkuTk9UX1BBUlRJQ0lQQVRJTkcpIHtcbiAgICAvLyBub3QgQS9CIHRlc3RpbmdcbiAgICBjb25zb2xlLmRlYnVnKCdleHBlcmltZW50OicsIGV4cGVyaW1lbnRJZCwgJ05PVF9QQVJUSUNJUEFUSU5HJyk7XG4gICAgdGhpcy5pbnN0cnVtZW50LmluY3JlbWVudChleHBlcmltZW50SWQrJy5ub3RfcGFydGljaXBhdGluZycpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc29sZS5kZWJ1ZygnZXhwZXJpbWVudDonLCBleHBlcmltZW50SWQsICd1c2luZyB2YXJpYXRpb246JywgdmFyaWF0aW9uKTtcbiAgcmV0dXJuIHZhcmlhdGlvbjtcbn1cblxuLy8gRG8gbm90IHJ1biBHQSBleHBlcmltZW50cyBvbiBTRVJWRVJcbi8vIG9ubHkgb24gdGhlIGNsaWVudC5cbmlmKHByb2Nlc3MuZW52LkJST1dTRVJfRU5WKSB7XG4gIC8vIHdhaXQgZm9yIHBlbGxldCB0byBiZSBpbml0aWFsaXplZCBiZWNhdXNlXG4gIC8vIF9fcGVsbGV0X2dhRXhwZXJpbWVudHMgaXMgYXN5bmMgbG9hZGVkXG4gIHBlbGxldC5vblJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgICBwZWxsZXQuc2V0RXhwZXJpbWVudEludGVyZmFjZShuZXcgZ2FFeHBlcmltZW50KHdpbmRvdy5fX3BlbGxldF9nYUV4cGVyaW1lbnRzLCBwZWxsZXQuX19nYUV4cGVyaW1lbnRDb25maWcpKTtcbiAgfSk7XG59XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC91c3IvbG9jYWwvbGliL34vcGVsbGV0L3NyYy9jb21wb25lbnRzL211bHRpdmFyaWF0ZS10ZXN0aW5nL2dhLWV4cGVyaW1lbnQuanNcbiAqKiBtb2R1bGUgaWQgPSA4XG4gKiogbW9kdWxlIGNodW5rcyA9IDJcbiAqKi8iLCJ2YXIgUmVhY3QgPSByZXF1aXJlKFwicmVhY3RcIilcbiAgLCBhYm5EYXNoYm9hcmRKYWRlID0gcmVxdWlyZSgnLi9hYm4tZGFzaGJvYXJkLmphZGUnKVxuICAsIHBlbGxldCA9IHJlcXVpcmUoXCJwZWxsZXRcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gYWJuRGFzaGJvYXJkQ29tcG9uZW50ID0gcGVsbGV0LmNyZWF0ZUNsYXNzKHtcbiAgLyosXG4gIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gIH0sXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbihuZXh0UHJvcHMpIHtcbiAgfSxcbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24obmV4dFByb3BzKSB7XG4gIH0sXG4gIHNob3VsZENvbXBvbmVudFVwZGF0ZTogZnVuY3Rpb24obmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcbiAgfSxcbiAgY29tcG9uZW50V2lsbFVwZGF0ZTogZnVuY3Rpb24obmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcbiAgfSxcbiAgY29tcG9uZW50RGlkVXBkYXRlOiBmdW5jdGlvbihwcmV2UHJvcHMsIHByZXZTdGF0ZSkge1xuICB9LFxuICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24obmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcbiAgfSxcbiAgKi9cblxuICByb3V0ZXM6IHBlbGxldC5jb25maWcuYWJuRGFzaGJvYXJkVXJsLFxuICAvL2xheW91dFRlbXBsYXRlOiBcInZldm9XZWJMYXlvdXRcIixcblxuICBjb21wb25lbnRDb25zdHJ1Y3Rpb246IGZ1bmN0aW9uKG9wdGlvbnMsIG5leHQpIHtcbiAgICB0aGlzLmFkZFRvSGVhZCgnbWV0YScsIHtuYW1lOidyb2JvdHMnLCBjb250ZW50Oidub2luZGV4LCBub2ZvbGxvdyd9KTtcblxuXG4gICAgbmV4dCgpO1xuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGFjdGl2ZUV4cGVyaW1lbnQ6IC0xLFxuICAgICAgbWVzc2FnZTogbnVsbFxuICAgIH07XG4gIH0sXG5cbiAgc2V0VmFyaWF0aW9uOiBmdW5jdGlvbihpZCkge1xuICAgIGlkID0gcGFyc2VJbnQoaWQpO1xuICAgIGN4QXBpLnNldENob3NlblZhcmlhdGlvbihpZCwgdGhpcy5zdGF0ZS5hY3RpdmVFeHBlcmltZW50KTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIG1lc3NhZ2U6ICdzYXZlZCB2YXJpYXRpb24gY2hhbmdlJ1xuICAgIH0pO1xuXG4gICAgZ2EoJ3NlbmQnLCAncGFnZXZpZXcnLCBkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZSk7XG4gIH0sXG5cbiAgc2hvd0V4cGVyaW1lbnQgOiBmdW5jdGlvbihpZCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgYWN0aXZlRXhwZXJpbWVudDogaWRcbiAgICB9KTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIGlmKHRoaXMuc3RhdGUubWVzc2FnZSkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5zZXRTdGF0ZSh7XG4gICAgICAgICAgbWVzc2FnZTogbnVsbFxuICAgICAgICB9KTtcbiAgICAgIH0sIDIwMDApO1xuICAgIH1cblxuICAgIHJldHVybiBhYm5EYXNoYm9hcmRKYWRlKHRoaXMpO1xuICB9XG59KTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogL3Vzci9sb2NhbC9saWIvfi9wZWxsZXQvc3JjL2NvbXBvbmVudHMvbXVsdGl2YXJpYXRlLXRlc3RpbmcvZGFzaGJvYXJkL2Fibi1kYXNoYm9hcmQuanNcbiAqKiBtb2R1bGUgaWQgPSA5XG4gKiogbW9kdWxlIGNodW5rcyA9IDJcbiAqKi8iLCJ2YXIgUmVhY3QgPSByZXF1aXJlKFwicmVhY3RcIilcbiAgLCBpbmRleEphZGUgPSByZXF1aXJlKCcuL2luZGV4LmphZGUnKVxuICAsIHBlbGxldCA9IHJlcXVpcmUoXCJwZWxsZXRcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gaW5kZXhQYWdlID0gcGVsbGV0LmNyZWF0ZUNsYXNzKHtcbiAgLypcbiAgY29tcG9uZW50Q29uc3RydWN0aW9uOiBmdW5jdGlvbihvcHRpb25zLCBuZXh0KSB7XG4gICAgdGhpcy5zZXQoe3ZhbDondmFsJ30pOyAvLyBzZXJpYWxpemVkIHRvIHRoZSBicm9zd2VyIGZyb20gdGhlIHNlcnZlciByZW5kZXJcbiAgICB0aGlzLnNldFByb3BzKHt2YWw6J3ZhbCd9KTsgLy8gc2V0IHByb3BzIHBhc3NlZCB0byBnZXRJbml0aWFsU3RhdGVcblxuICAgIG5leHQoKTtcbiAgfSxcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge307XG4gIH0sXG4gIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gIH0sXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbihuZXh0UHJvcHMpIHtcbiAgfSxcbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24obmV4dFByb3BzKSB7XG4gIH0sXG4gIHNob3VsZENvbXBvbmVudFVwZGF0ZTogZnVuY3Rpb24obmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcbiAgfSxcbiAgY29tcG9uZW50V2lsbFVwZGF0ZTogZnVuY3Rpb24obmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcbiAgfSxcbiAgY29tcG9uZW50RGlkVXBkYXRlOiBmdW5jdGlvbihwcmV2UHJvcHMsIHByZXZTdGF0ZSkge1xuICB9LFxuICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24obmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcbiAgfSxcbiAgKi9cblxuLy8gbGF5b3V0VGVtcGxhdGU6IFwie25hbWVfb2ZfeW91cl9sYXlvdXRfaW5fdGhlX21hbmlmZXN0fVwiLFxuICBcbiAgcm91dGVzOiBbXCIvXCIsIFwiL2luZGV4XCJdLFxuICBcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBpbmRleEphZGUodGhpcyk7XG4gIH1cbn0pO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL2luZGV4LmpzXG4gKiogbW9kdWxlIGlkID0gMTBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMlxuICoqLyIsInZhciBSZWFjdCA9IHJlcXVpcmUoXCJyZWFjdFwiKVxuICAsIGFib3V0SmFkZSA9IHJlcXVpcmUoJy4vYWJvdXQuamFkZScpXG4gICwgcGVsbGV0ID0gcmVxdWlyZShcInBlbGxldFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBhYm91dFBhZ2UgPSBwZWxsZXQuY3JlYXRlQ2xhc3Moe1xuICAvKlxuICBjb21wb25lbnRDb25zdHJ1Y3Rpb246IGZ1bmN0aW9uKG9wdGlvbnMsIG5leHQpIHtcbiAgICB0aGlzLnNldCh7dmFsOid2YWwnfSk7IC8vIHNlcmlhbGl6ZWQgdG8gdGhlIGJyb3N3ZXIgZnJvbSB0aGUgc2VydmVyIHJlbmRlclxuICAgIHRoaXMuc2V0UHJvcHMoe3ZhbDondmFsJ30pOyAvLyBzZXQgcHJvcHMgcGFzc2VkIHRvIGdldEluaXRpYWxTdGF0ZVxuXG4gICAgbmV4dCgpO1xuICB9LFxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7fTtcbiAgfSxcbiAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgfSxcbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKG5leHRQcm9wcykge1xuICB9LFxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbihuZXh0UHJvcHMpIHtcbiAgfSxcbiAgc2hvdWxkQ29tcG9uZW50VXBkYXRlOiBmdW5jdGlvbihuZXh0UHJvcHMsIG5leHRTdGF0ZSkge1xuICB9LFxuICBjb21wb25lbnRXaWxsVXBkYXRlOiBmdW5jdGlvbihuZXh0UHJvcHMsIG5leHRTdGF0ZSkge1xuICB9LFxuICBjb21wb25lbnREaWRVcGRhdGU6IGZ1bmN0aW9uKHByZXZQcm9wcywgcHJldlN0YXRlKSB7XG4gIH0sXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbihuZXh0UHJvcHMsIG5leHRTdGF0ZSkge1xuICB9LFxuICAqL1xuXG4gbGF5b3V0VGVtcGxhdGU6IFwibGF5b3V0MVwiLFxuICBcbiAgcm91dGVzOiBcIi9hYm91dFwiLFxuICBcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBhYm91dEphZGUodGhpcyk7XG4gIH1cbn0pO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL2Fib3V0L2Fib3V0LmpzXG4gKiogbW9kdWxlIGlkID0gMTFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMlxuICoqLyIsInZhciBSZWFjdCA9IHJlcXVpcmUoXCJyZWFjdFwiKVxuICAsIGhlbGxvSmFkZSA9IHJlcXVpcmUoJy4vaGVsbG8uamFkZScpXG4gICwgcGVsbGV0ID0gcmVxdWlyZShcInBlbGxldFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBoZWxsb1BhZ2UgPSBwZWxsZXQuY3JlYXRlQ2xhc3Moe1xuICAvKlxuICBjb21wb25lbnRDb25zdHJ1Y3Rpb246IGZ1bmN0aW9uKG9wdGlvbnMsIG5leHQpIHtcbiAgICB0aGlzLnNldCh7dmFsOid2YWwnfSk7IC8vIHNlcmlhbGl6ZWQgdG8gdGhlIGJyb3N3ZXIgZnJvbSB0aGUgc2VydmVyIHJlbmRlclxuICAgIHRoaXMuc2V0UHJvcHMoe3ZhbDondmFsJ30pOyAvLyBzZXQgcHJvcHMgcGFzc2VkIHRvIGdldEluaXRpYWxTdGF0ZVxuXG4gICAgbmV4dCgpO1xuICB9LFxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7fTtcbiAgfSxcbiAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgfSxcbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKG5leHRQcm9wcykge1xuICB9LFxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbihuZXh0UHJvcHMpIHtcbiAgfSxcbiAgc2hvdWxkQ29tcG9uZW50VXBkYXRlOiBmdW5jdGlvbihuZXh0UHJvcHMsIG5leHRTdGF0ZSkge1xuICB9LFxuICBjb21wb25lbnRXaWxsVXBkYXRlOiBmdW5jdGlvbihuZXh0UHJvcHMsIG5leHRTdGF0ZSkge1xuICB9LFxuICBjb21wb25lbnREaWRVcGRhdGU6IGZ1bmN0aW9uKHByZXZQcm9wcywgcHJldlN0YXRlKSB7XG4gIH0sXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbihuZXh0UHJvcHMsIG5leHRTdGF0ZSkge1xuICB9LFxuICAqL1xuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvdW50OiAwXG4gICAgfTtcbiAgfSxcblxuICBhZGQ6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5zZXRTdGF0ZSh7Y291bnQ6IHRoaXMuc3RhdGUuY291bnQrMX0pO1xuICB9LFxuXG4gIGxheW91dFRlbXBsYXRlOiBcImxheW91dDFcIixcbiAgXG4gIHJvdXRlczogXCIvaGVsbG8vOm5hbWVcIixcbiAgXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gaGVsbG9KYWRlKHRoaXMpO1xuICB9XG59KTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9oZWxsby9oZWxsby5qc1xuICoqIG1vZHVsZSBpZCA9IDEyXG4gKiogbW9kdWxlIGNodW5rcyA9IDJcbiAqKi8iLCJ2YXIgUmVhY3QgPSByZXF1aXJlKFwicmVhY3RcIilcbiAgLCBsYXlvdXQxSmFkZSA9IHJlcXVpcmUoJy4vbGF5b3V0MS5qYWRlJylcbiAgLCBwZWxsZXQgPSByZXF1aXJlKFwicGVsbGV0XCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGxheW91dDFMYXlvdXQgPSBwZWxsZXQuY3JlYXRlQ2xhc3Moe1xuICBjb21wb25lbnRDb25zdHJ1Y3Rpb246IGZ1bmN0aW9uKG9wdGlvbnMsIG5leHQpIHtcblxuICAgIC8vIGlmIHRoZSBsYXlvdXQgZG9lcyBub3QgaGF2ZSBzdGF0ZSB5b3Ugc2tpcFxuICAgIC8vIGNyZWF0aW5nIHRoZSBuYW1lc3BhY2VcbiAgICB2YXIgbnMgPSB0aGlzLm5hbWVzcGFjZShcImNvbnRlbnRcIilcbiAgICBucy5zZXRQcm9wcyh7XG4gICAgICAgIG9yaWdpbmFsVXJsOiB0aGlzLnByb3BzLm9yaWdpbmFsVXJsLFxuICAgICAgICBwYXJhbXM6IHRoaXMucHJvcHMucGFyYW1zLFxuICAgICAgICBxdWVyeTogdGhpcy5wcm9wcy5xdWVyeSxcbiAgICAgICAgdXJsOiB0aGlzLnByb3BzLnVybFxuICAgIH0pO1xuXG4gICAgdGhpcy5zZXRQcm9wcyh7XG4gICAgICBsYXlvdXRDb250ZW50OiB0aGlzLnByb3BzLl9fbGF5b3V0Q29udGVudFxuICAgIH0pO1xuXG4gICAgLy8gbm93IGZvcndhcmQgdGhlIGxheW91dCBtYWluIGNvbnRleHQncyBjb21wb25lbnQgY29uc3RydWN0aW9uIGRhdGFcbiAgICBucy5hZGRDaGlsZENvbXBvbmVudChmYWxzZSwgdGhpcy5wcm9wcy5fX2xheW91dENvbnRlbnQsIG9wdGlvbnMsIG5leHQpO1xuICB9LFxuXG4gIC8qXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHt9O1xuICB9LFxuICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICB9LFxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24obmV4dFByb3BzKSB7XG4gIH0sXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKG5leHRQcm9wcykge1xuICB9LFxuICBzaG91bGRDb21wb25lbnRVcGRhdGU6IGZ1bmN0aW9uKG5leHRQcm9wcywgbmV4dFN0YXRlKSB7XG4gIH0sXG4gIGNvbXBvbmVudFdpbGxVcGRhdGU6IGZ1bmN0aW9uKG5leHRQcm9wcywgbmV4dFN0YXRlKSB7XG4gIH0sXG4gIGNvbXBvbmVudERpZFVwZGF0ZTogZnVuY3Rpb24ocHJldlByb3BzLCBwcmV2U3RhdGUpIHtcbiAgfSxcbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKG5leHRQcm9wcywgbmV4dFN0YXRlKSB7XG4gIH0sXG4gICovXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmxheW91dENvbnRlbnQgPSBSZWFjdC5jcmVhdGVFbGVtZW50KHRoaXMucHJvcHMubGF5b3V0Q29udGVudCwgdGhpcy5wcm9wcy5jb250ZW50KTtcbiAgICByZXR1cm4gbGF5b3V0MUphZGUodGhpcyk7XG4gIH1cbn0pO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL2xheW91dDEvbGF5b3V0MS5qc1xuICoqIG1vZHVsZSBpZCA9IDEzXG4gKiogbW9kdWxlIGNodW5rcyA9IDJcbiAqKi8iLCJ2YXIgUmVhY3QgPSByZXF1aXJlKFwicmVhY3RcIilcbiAgLCBtZXNzYWdlSmFkZSA9IHJlcXVpcmUoJy4vbWVzc2FnZS5qYWRlJylcbiAgLCBwZWxsZXQgPSByZXF1aXJlKFwicGVsbGV0XCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG1lc3NhZ2VDb21wb25lbnQgPSBwZWxsZXQuY3JlYXRlQ2xhc3Moe1xuICAvKlxuICBjb21wb25lbnRDb25zdHJ1Y3Rpb246IGZ1bmN0aW9uKG9wdGlvbnMsIG5leHQpIHtcbiAgICB0aGlzLnNldCh7dmFsOid2YWwnfSk7IC8vIHNlcmlhbGl6ZWQgdG8gdGhlIGJyb3N3ZXIgZnJvbSB0aGUgc2VydmVyIHJlbmRlclxuICAgIHRoaXMuc2V0UHJvcHMoe3ZhbDondmFsJ30pOyAvLyBzZXQgcHJvcHMgcGFzc2VkIHRvIGdldEluaXRpYWxTdGF0ZVxuXG4gICAgbmV4dCgpO1xuICB9LFxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7fTtcbiAgfSxcbiAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgfSxcbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKG5leHRQcm9wcykge1xuICB9LFxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbihuZXh0UHJvcHMpIHtcbiAgfSxcbiAgc2hvdWxkQ29tcG9uZW50VXBkYXRlOiBmdW5jdGlvbihuZXh0UHJvcHMsIG5leHRTdGF0ZSkge1xuICB9LFxuICBjb21wb25lbnRXaWxsVXBkYXRlOiBmdW5jdGlvbihuZXh0UHJvcHMsIG5leHRTdGF0ZSkge1xuICB9LFxuICBjb21wb25lbnREaWRVcGRhdGU6IGZ1bmN0aW9uKHByZXZQcm9wcywgcHJldlN0YXRlKSB7XG4gIH0sXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbihuZXh0UHJvcHMsIG5leHRTdGF0ZSkge1xuICB9LFxuICAqL1xuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG1lc3NhZ2VKYWRlKHRoaXMpO1xuICB9XG59KTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9tZXNzYWdlL21lc3NhZ2UuanNcbiAqKiBtb2R1bGUgaWQgPSAxNFxuICoqIG1vZHVsZSBjaHVua3MgPSAyXG4gKiovIiwidmFyIGluZGV4ID0ge307aW5kZXhbXCJhYm91dEAwLjAuMFwiXSA9IHJlcXVpcmUoXCIvVXNlcnMvS2Fpdm9uL0Rlc2t0b3AvcmVhY3RQcmFjdGljZS9zZWNvbmQtcHJvamVjdC9mcm9udGVuZC9hYm91dC9hYm91dC5qc1wiKTtpbmRleFtcImhlbGxvQDAuMC4wXCJdID0gcmVxdWlyZShcIi9Vc2Vycy9LYWl2b24vRGVza3RvcC9yZWFjdFByYWN0aWNlL3NlY29uZC1wcm9qZWN0L2Zyb250ZW5kL2hlbGxvL2hlbGxvLmpzXCIpO2luZGV4W1wibGF5b3V0MUAwLjAuMFwiXSA9IHJlcXVpcmUoXCIvVXNlcnMvS2Fpdm9uL0Rlc2t0b3AvcmVhY3RQcmFjdGljZS9zZWNvbmQtcHJvamVjdC9mcm9udGVuZC9sYXlvdXQxL2xheW91dDEuanNcIik7aW5kZXhbXCJtZXNzYWdlQDAuMC4wXCJdID0gcmVxdWlyZShcIi9Vc2Vycy9LYWl2b24vRGVza3RvcC9yZWFjdFByYWN0aWNlL3NlY29uZC1wcm9qZWN0L2Zyb250ZW5kL21lc3NhZ2UvbWVzc2FnZS5qc1wiKTtpbmRleFtcInNlY29uZFByb2plY3RAMC4wLjBcIl0gPSByZXF1aXJlKFwiL1VzZXJzL0thaXZvbi9EZXNrdG9wL3JlYWN0UHJhY3RpY2Uvc2Vjb25kLXByb2plY3QvZnJvbnRlbmQvaW5kZXguanNcIik7aW5kZXhbXCJpbnRsQDAuMC4wXCJdID0gcmVxdWlyZShcIi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy9wZWxsZXQvc3JjL2NvbXBvbmVudHMvaW50ZXJuYXRpb25hbGl6YXRpb24vaW50ZXJuYXRpb25hbGl6YXRpb24uanN4XCIpO2luZGV4W1wicGVsbGV0QUJORGFzaGJvYXJkQDAuMC4wXCJdID0gcmVxdWlyZShcIi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy9wZWxsZXQvc3JjL2NvbXBvbmVudHMvbXVsdGl2YXJpYXRlLXRlc3RpbmcvZGFzaGJvYXJkL2Fibi1kYXNoYm9hcmQuanNcIik7cmVxdWlyZShcInBlbGxldFwiKS5sb2FkTWFuaWZlc3RDb21wb25lbnRzKGluZGV4KTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4uL2J1aWxkL19FTUJFRF9JTkRFWC5qc1xuICoqIG1vZHVsZSBpZCA9IDE1XG4gKiogbW9kdWxlIGNodW5rcyA9IDJcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IFJlYWN0O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogZXh0ZXJuYWwgXCJSZWFjdFwiXG4gKiogbW9kdWxlIGlkID0gMTZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMlxuICoqLyIsImtlZmlyID0gcmVxdWlyZSgna2VmaXInKVxuXG4vKipcbiAqXG4gKiBAcGFyYW0gb2JzXG4gKiBAcGFyYW0gX293bmVyIGlzIHRoZSBkZWZhdWx0IHNlbmRlciBmb3IgYWxsIG1lc3NhZ2VzXG4gKi9cbmZ1bmN0aW9uIGF1dG9SZWxlYXNlKG9icywgb3duZXIsIGlzb2xhdGVkQ29uZmlnKSB7XG4gIHRoaXMuY2hpbGRyZW4gPSBbXTtcbiAgdGhpcy5yZWZFbmQgPSBbXTtcbiAgdGhpcy5yZWZWYWx1ZSA9IFtdO1xuICB0aGlzLnJlZkJvdGggPSBbXTtcbiAgdGhpcy5yZWZMb2cgPSBbXTtcblxuICB0aGlzLm93bmVyID0gb3duZXI7XG4gIHRoaXMuaXNvbGF0ZWRDb25maWcgPSBpc29sYXRlZENvbmZpZztcblxuICBpZihvYnMgaW5zdGFuY2VvZiBhdXRvUmVsZWFzZSkge1xuICAgIHRoaXMuX19vYnMgPSBvYnMuX19vYnM7XG4gIH0gZWxzZSBpZihvYnMpIHtcbiAgICB0aGlzLl9fb2JzID0gb2JzO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuX19vYnMgPSBrZWZpci5lbWl0dGVyKCk7XG4gIH1cbn1cblxuYXV0b1JlbGVhc2UucHJvdG90eXBlLkFVVE9fUkVMRUFTRV9FTUlURUQgPSBrZWZpci5BVVRPX1JFTEVBU0VfRU1JVEVEID0gMTtcbmF1dG9SZWxlYXNlLnByb3RvdHlwZS5BVVRPX1JFTEVBU0VfRU5ERUQgPSBrZWZpci5BVVRPX1JFTEVBU0VfRU5ERUQgPSAyO1xuYXV0b1JlbGVhc2UucHJvdG90eXBlLkFVVE9fUkVMRUFTRV9CT1RIID0ga2VmaXIuQVVUT19SRUxFQVNFX0JPVEggPSAzO1xuXG5hdXRvUmVsZWFzZS5wcm90b3R5cGUubWFwID0gZnVuY3Rpb24oYSkge3ZhciByZXQ7IHRoaXMuY2hpbGRyZW4ucHVzaChyZXQgPSBuZXcgYXV0b1JlbGVhc2UodGhpcy5fX29icy5tYXAoYSksIHRoaXMub3duZXIsIHRoaXMuaXNvbGF0ZWRDb25maWcpKTsgcmV0dXJuIHJldDt9O1xuYXV0b1JlbGVhc2UucHJvdG90eXBlLm1hcFRvID0gZnVuY3Rpb24oYSkge3ZhciByZXQ7IHRoaXMuY2hpbGRyZW4ucHVzaChyZXQgPSBuZXcgYXV0b1JlbGVhc2UodGhpcy5fX29icy5tYXBUbyhhKSwgdGhpcy5vd25lciwgdGhpcy5pc29sYXRlZENvbmZpZykpOyByZXR1cm4gcmV0O307XG5hdXRvUmVsZWFzZS5wcm90b3R5cGUucGx1Y2sgPSBmdW5jdGlvbihhKSB7dmFyIHJldDsgdGhpcy5jaGlsZHJlbi5wdXNoKHJldCA9IG5ldyBhdXRvUmVsZWFzZSh0aGlzLl9fb2JzLnBsdWNrKGEpLCB0aGlzLm93bmVyLCB0aGlzLmlzb2xhdGVkQ29uZmlnKSk7IHJldHVybiByZXQ7fTtcbmF1dG9SZWxlYXNlLnByb3RvdHlwZS5pbnZva2UgPSBmdW5jdGlvbihhKSB7dmFyIHJldDsgdGhpcy5jaGlsZHJlbi5wdXNoKHJldCA9IG5ldyBhdXRvUmVsZWFzZSh0aGlzLl9fb2JzLmludm9rZShhKSwgdGhpcy5vd25lciwgdGhpcy5pc29sYXRlZENvbmZpZykpOyByZXR1cm4gcmV0O307XG5hdXRvUmVsZWFzZS5wcm90b3R5cGUubm90ID0gZnVuY3Rpb24oKSB7dmFyIHJldDsgdGhpcy5jaGlsZHJlbi5wdXNoKHJldCA9IG5ldyBhdXRvUmVsZWFzZSh0aGlzLl9fb2JzLm5vdCgpLCB0aGlzLm93bmVyLCB0aGlzLmlzb2xhdGVkQ29uZmlnKSk7IHJldHVybiByZXQ7fTtcbmF1dG9SZWxlYXNlLnByb3RvdHlwZS50aW1lc3RhbXAgPSBmdW5jdGlvbigpIHt2YXIgcmV0OyB0aGlzLmNoaWxkcmVuLnB1c2gocmV0ID0gbmV3IGF1dG9SZWxlYXNlKHRoaXMuX19vYnMudGltZXN0YW1wKCksIHRoaXMub3duZXIsIHRoaXMuaXNvbGF0ZWRDb25maWcpKTsgcmV0dXJuIHJldDt9O1xuYXV0b1JlbGVhc2UucHJvdG90eXBlLnRhcCA9IGZ1bmN0aW9uKGEpIHt2YXIgcmV0OyB0aGlzLmNoaWxkcmVuLnB1c2gocmV0ID0gbmV3IGF1dG9SZWxlYXNlKHRoaXMuX19vYnMudGFwKGEpLCB0aGlzLm93bmVyLCB0aGlzLmlzb2xhdGVkQ29uZmlnKSk7IHJldHVybiByZXQ7fTtcbmF1dG9SZWxlYXNlLnByb3RvdHlwZS5maWx0ZXIgPSBmdW5jdGlvbihhKSB7dmFyIHJldDsgdGhpcy5jaGlsZHJlbi5wdXNoKHJldCA9IG5ldyBhdXRvUmVsZWFzZSh0aGlzLl9fb2JzLmZpbHRlcihhKSwgdGhpcy5vd25lciwgdGhpcy5pc29sYXRlZENvbmZpZykpOyByZXR1cm4gcmV0O307XG5hdXRvUmVsZWFzZS5wcm90b3R5cGUudGFrZSA9IGZ1bmN0aW9uKGEpIHt2YXIgcmV0OyB0aGlzLmNoaWxkcmVuLnB1c2gocmV0ID0gbmV3IGF1dG9SZWxlYXNlKHRoaXMuX19vYnMudGFrZShhKSwgdGhpcy5vd25lciwgdGhpcy5pc29sYXRlZENvbmZpZykpOyByZXR1cm4gcmV0O307XG5hdXRvUmVsZWFzZS5wcm90b3R5cGUudGFrZVdoaWxlID0gZnVuY3Rpb24oYSkge3ZhciByZXQ7IHRoaXMuY2hpbGRyZW4ucHVzaChyZXQgPSBuZXcgYXV0b1JlbGVhc2UodGhpcy5fX29icy50YWtlV2hpbGUoYSksIHRoaXMub3duZXIsIHRoaXMuaXNvbGF0ZWRDb25maWcpKTsgcmV0dXJuIHJldDt9O1xuYXV0b1JlbGVhc2UucHJvdG90eXBlLnNraXAgPSBmdW5jdGlvbihhKSB7dmFyIHJldDsgdGhpcy5jaGlsZHJlbi5wdXNoKHJldCA9IG5ldyBhdXRvUmVsZWFzZSh0aGlzLl9fb2JzLnNraXAoYSksIHRoaXMub3duZXIsIHRoaXMuaXNvbGF0ZWRDb25maWcpKTsgcmV0dXJuIHJldDt9O1xuYXV0b1JlbGVhc2UucHJvdG90eXBlLnNraXBXaGlsZSA9IGZ1bmN0aW9uKGEpIHt2YXIgcmV0OyB0aGlzLmNoaWxkcmVuLnB1c2gocmV0ID0gbmV3IGF1dG9SZWxlYXNlKHRoaXMuX19vYnMuc2tpcFdoaWxlKGEpLCB0aGlzLm93bmVyLCB0aGlzLmlzb2xhdGVkQ29uZmlnKSk7IHJldHVybiByZXQ7fTtcbmF1dG9SZWxlYXNlLnByb3RvdHlwZS5za2lwRHVwbGljYXRlcyA9IGZ1bmN0aW9uKGEpIHt2YXIgcmV0OyB0aGlzLmNoaWxkcmVuLnB1c2gocmV0ID0gbmV3IGF1dG9SZWxlYXNlKHRoaXMuX19vYnMuc2tpcER1cGxpY2F0ZXMoYSksIHRoaXMub3duZXIsIHRoaXMuaXNvbGF0ZWRDb25maWcpKTsgcmV0dXJuIHJldDt9O1xuYXV0b1JlbGVhc2UucHJvdG90eXBlLmRpZmYgPSBmdW5jdGlvbihhLGIpIHt2YXIgcmV0OyB0aGlzLmNoaWxkcmVuLnB1c2gocmV0ID0gbmV3IGF1dG9SZWxlYXNlKHRoaXMuX19vYnMuZGlmZihhLGIpLCB0aGlzLm93bmVyLCB0aGlzLmlzb2xhdGVkQ29uZmlnKSk7IHJldHVybiByZXQ7fTtcbmF1dG9SZWxlYXNlLnByb3RvdHlwZS5zY2FuID0gZnVuY3Rpb24oYSxiKSB7dmFyIHJldDsgdGhpcy5jaGlsZHJlbi5wdXNoKHJldCA9IG5ldyBhdXRvUmVsZWFzZSh0aGlzLl9fb2JzLnNjYW4oYSxiKSwgdGhpcy5vd25lciwgdGhpcy5pc29sYXRlZENvbmZpZykpOyByZXR1cm4gcmV0O307XG5hdXRvUmVsZWFzZS5wcm90b3R5cGUucmVkdWNlID0gZnVuY3Rpb24oYSxiKSB7dmFyIHJldDsgdGhpcy5jaGlsZHJlbi5wdXNoKHJldCA9IG5ldyBhdXRvUmVsZWFzZSh0aGlzLl9fb2JzLnJlZHVjZShhLGIpLCB0aGlzLm93bmVyLCB0aGlzLmlzb2xhdGVkQ29uZmlnKSk7IHJldHVybiByZXQ7fTtcbmF1dG9SZWxlYXNlLnByb3RvdHlwZS5zbGlkaW5nV2luZG93ID0gZnVuY3Rpb24oYSxiKSB7dmFyIHJldDsgdGhpcy5jaGlsZHJlbi5wdXNoKHJldCA9IG5ldyBhdXRvUmVsZWFzZSh0aGlzLl9fb2JzLnNsaWRpbmdXaW5kb3coYSxiKSwgdGhpcy5vd25lciwgdGhpcy5pc29sYXRlZENvbmZpZykpOyByZXR1cm4gcmV0O307XG5hdXRvUmVsZWFzZS5wcm90b3R5cGUuZGVsYXkgPSBmdW5jdGlvbihhKSB7dmFyIHJldDsgdGhpcy5jaGlsZHJlbi5wdXNoKHJldCA9IG5ldyBhdXRvUmVsZWFzZSh0aGlzLl9fb2JzLmRlbGF5KGEpLCB0aGlzLm93bmVyLCB0aGlzLmlzb2xhdGVkQ29uZmlnKSk7IHJldHVybiByZXQ7fTtcbmF1dG9SZWxlYXNlLnByb3RvdHlwZS50aHJvdHRsZSA9IGZ1bmN0aW9uKGEsYikge3ZhciByZXQ7IHRoaXMuY2hpbGRyZW4ucHVzaChyZXQgPSBuZXcgYXV0b1JlbGVhc2UodGhpcy5fX29icy50aHJvdHRsZShhLGIpLCB0aGlzLm93bmVyLCB0aGlzLmlzb2xhdGVkQ29uZmlnKSk7IHJldHVybiByZXQ7fTtcbmF1dG9SZWxlYXNlLnByb3RvdHlwZS5kZWJvdW5jZSA9IGZ1bmN0aW9uKGEsYikge3ZhciByZXQ7IHRoaXMuY2hpbGRyZW4ucHVzaChyZXQgPSBuZXcgYXV0b1JlbGVhc2UodGhpcy5fX29icy5kZWJvdW5jZShhLGIpLCB0aGlzLm93bmVyLCB0aGlzLmlzb2xhdGVkQ29uZmlnKSk7IHJldHVybiByZXQ7fTtcbmF1dG9SZWxlYXNlLnByb3RvdHlwZS5mbGF0dGVuID0gZnVuY3Rpb24oYSkge3ZhciByZXQ7IHRoaXMuY2hpbGRyZW4ucHVzaChyZXQgPSBuZXcgYXV0b1JlbGVhc2UodGhpcy5fX29icy5mbGF0dGVuKGEpLCB0aGlzLm93bmVyLCB0aGlzLmlzb2xhdGVkQ29uZmlnKSk7IHJldHVybiByZXQ7fTtcbmF1dG9SZWxlYXNlLnByb3RvdHlwZS50cmFuc2R1Y2UgPSBmdW5jdGlvbihhKSB7dmFyIHJldDsgdGhpcy5jaGlsZHJlbi5wdXNoKHJldCA9IG5ldyBhdXRvUmVsZWFzZSh0aGlzLl9fb2JzLnRyYW5zZHVjZShhKSwgdGhpcy5vd25lciwgdGhpcy5pc29sYXRlZENvbmZpZykpOyByZXR1cm4gcmV0O307XG5hdXRvUmVsZWFzZS5wcm90b3R5cGUud2l0aEhhbmRsZXIgPSBmdW5jdGlvbihhKSB7dmFyIHJldDsgdGhpcy5jaGlsZHJlbi5wdXNoKHJldCA9IG5ldyBhdXRvUmVsZWFzZSh0aGlzLl9fb2JzLndpdGhIYW5kbGVyKGEpLCB0aGlzLm93bmVyLCB0aGlzLmlzb2xhdGVkQ29uZmlnKSk7IHJldHVybiByZXQ7fTtcbmF1dG9SZWxlYXNlLnByb3RvdHlwZS50b1Byb3BlcnR5ID0gZnVuY3Rpb24oYSkge3ZhciByZXQ7IHRoaXMuY2hpbGRyZW4ucHVzaChyZXQgPSBuZXcgYXV0b1JlbGVhc2UodGhpcy5fX29icy50b1Byb3BlcnR5KGEpLCB0aGlzLm93bmVyLCB0aGlzLmlzb2xhdGVkQ29uZmlnKSk7IHJldHVybiByZXQ7fTtcbmF1dG9SZWxlYXNlLnByb3RvdHlwZS5jaGFuZ2VzID0gZnVuY3Rpb24oKSB7dmFyIHJldDsgdGhpcy5jaGlsZHJlbi5wdXNoKHJldCA9IG5ldyBhdXRvUmVsZWFzZSh0aGlzLl9fb2JzLmNoYW5nZXMoKSwgdGhpcy5vd25lciwgdGhpcy5pc29sYXRlZENvbmZpZykpOyByZXR1cm4gcmV0O307XG5hdXRvUmVsZWFzZS5wcm90b3R5cGUuZmxhdE1hcCA9IGZ1bmN0aW9uKGEpIHt2YXIgcmV0OyB0aGlzLmNoaWxkcmVuLnB1c2gocmV0ID0gbmV3IGF1dG9SZWxlYXNlKHRoaXMuX19vYnMuZmxhdE1hcChhKSwgdGhpcy5vd25lciwgdGhpcy5pc29sYXRlZENvbmZpZykpOyByZXR1cm4gcmV0O307XG5hdXRvUmVsZWFzZS5wcm90b3R5cGUuZmxhdE1hcExhdGVzdCA9IGZ1bmN0aW9uKGEpIHt2YXIgcmV0OyB0aGlzLmNoaWxkcmVuLnB1c2gocmV0ID0gbmV3IGF1dG9SZWxlYXNlKHRoaXMuX19vYnMuZmxhdE1hcExhdGVzdChhKSwgdGhpcy5vd25lciwgdGhpcy5pc29sYXRlZENvbmZpZykpOyByZXR1cm4gcmV0O307XG5hdXRvUmVsZWFzZS5wcm90b3R5cGUuZmxhdE1hcEZpcnN0ID0gZnVuY3Rpb24oYSkge3ZhciByZXQ7IHRoaXMuY2hpbGRyZW4ucHVzaChyZXQgPSBuZXcgYXV0b1JlbGVhc2UodGhpcy5fX29icy5mbGF0TWFwRmlyc3QoYSksIHRoaXMub3duZXIsIHRoaXMuaXNvbGF0ZWRDb25maWcpKTsgcmV0dXJuIHJldDt9O1xuYXV0b1JlbGVhc2UucHJvdG90eXBlLmZsYXRNYXBDb25jYXQgPSBmdW5jdGlvbihhKSB7dmFyIHJldDsgdGhpcy5jaGlsZHJlbi5wdXNoKHJldCA9IG5ldyBhdXRvUmVsZWFzZSh0aGlzLl9fb2JzLmZsYXRNYXBDb25jYXQoYSksIHRoaXMub3duZXIsIHRoaXMuaXNvbGF0ZWRDb25maWcpKTsgcmV0dXJuIHJldDt9O1xuYXV0b1JlbGVhc2UucHJvdG90eXBlLmZsYXRNYXBDb25jdXJMaW1pdCA9IGZ1bmN0aW9uKGEsYikge3ZhciByZXQ7IHRoaXMuY2hpbGRyZW4ucHVzaChyZXQgPSBuZXcgYXV0b1JlbGVhc2UodGhpcy5fX29icy5mbGF0TWFwQ29uY3VyTGltaXQoYSxiKSwgdGhpcy5vd25lciwgdGhpcy5pc29sYXRlZENvbmZpZykpOyByZXR1cm4gcmV0O307XG5hdXRvUmVsZWFzZS5wcm90b3R5cGUuYXdhaXRpbmcgPSBmdW5jdGlvbihhKSB7dmFyIHJldDsgdGhpcy5jaGlsZHJlbi5wdXNoKHJldCA9IG5ldyBhdXRvUmVsZWFzZSh0aGlzLl9fb2JzLmF3YWl0aW5nKGEpLCB0aGlzLm93bmVyLCB0aGlzLmlzb2xhdGVkQ29uZmlnKSk7IHJldHVybiByZXQ7fTtcbmF1dG9SZWxlYXNlLnByb3RvdHlwZS5maWx0ZXJCeSA9IGZ1bmN0aW9uKGEpIHt2YXIgcmV0OyB0aGlzLmNoaWxkcmVuLnB1c2gocmV0ID0gbmV3IGF1dG9SZWxlYXNlKHRoaXMuX19vYnMuZmlsdGVyQnkoYSksIHRoaXMub3duZXIsIHRoaXMuaXNvbGF0ZWRDb25maWcpKTsgcmV0dXJuIHJldDt9O1xuXG4vLyBuZWVkIHRvIGFkZCBjb21iaW5lLCBhbmQsIG9yXG5cbmF1dG9SZWxlYXNlLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24oYSwgc2VuZGVyLCBpc29sYXRlZENvbmZpZykge1xuICB2YXIgX3NlbmRlciA9IHNlbmRlciB8fCB0aGlzLm93bmVyO1xuICB2YXIgX2lzb2xhdGVkQ29uZmlnID0gaXNvbGF0ZWRDb25maWcgfHwgdGhpcy5pc29sYXRlZENvbmZpZztcbiAgaWYoX3NlbmRlcikge1xuICAgIHRoaXMuX19vYnMuZW1pdCh7c2VuZGVyOl9zZW5kZXIsIGN0eDogX2lzb2xhdGVkQ29uZmlnLCBldmVudDphfSk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fX29icy5lbWl0KGEpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59XG5cbmF1dG9SZWxlYXNlLnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fX29icy5lbmQoKTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbmF1dG9SZWxlYXNlLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKGZuLCByYXdFdmVudCwgdHlwZSkge1xuICB2YXIgX2ZuO1xuICBpZighcmF3RXZlbnQpIHtcbiAgICBfZm4gPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICByZXR1cm4gZm4oZGF0YS5ldmVudCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIF9mbiA9IGZuO1xuICB9XG5cbiAgaWYodHlwZSA9PT0ga2VmaXIuQVVUT19SRUxFQVNFX0VOREVEKSB7XG4gICAgdGhpcy5yZWZFbmQucHVzaChfZm4pO1xuICAgIHRoaXMuX19vYnMub25FbmQoX2ZuKTtcbiAgfSBlbHNlIGlmKHR5cGUgPT09IGtlZmlyLkFVVE9fUkVMRUFTRV9CT1RIKSB7XG4gICAgdGhpcy5yZWZCb3RoLnB1c2goX2ZuKTtcbiAgICB0aGlzLl9fb2JzLm9uQW55KF9mbik7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5yZWZWYWx1ZS5wdXNoKF9mbik7XG4gICAgdGhpcy5fX29icy5vblZhbHVlKF9mbik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn1cblxuYXV0b1JlbGVhc2UucHJvdG90eXBlLmxvZyA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgdGhpcy5yZWZMb2cucHVzaChuYW1lKTtcbiAgdGhpcy5fX29icy5sb2cobmFtZSk7XG4gIHJldHVybiB0aGlzO1xufVxuXG5hdXRvUmVsZWFzZS5wcm90b3R5cGUucmVsZWFzZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaTtcbiAgZm9yKGkgaW4gdGhpcy5jaGlsZHJlbikge1xuICAgIHRoaXMuY2hpbGRyZW5baV0ucmVsZWFzZSgpO1xuICB9XG5cbiAgZm9yKGkgaW4gdGhpcy5yZWZWYWx1ZSkge1xuICAgIHRoaXMuX19vYnMub2ZmVmFsdWUodGhpcy5yZWZWYWx1ZVtpXSk7XG4gIH1cblxuICBmb3IoaSBpbiB0aGlzLnJlZkJvdGgpIHtcbiAgICB0aGlzLl9fb2JzLm9mZkFueSh0aGlzLnJlZkJvdGhbaV0pO1xuICB9XG5cbiAgZm9yKGkgaW4gdGhpcy5yZWZFbmQpIHtcbiAgICB0aGlzLl9fb2JzLm9mZkVuZCh0aGlzLnJlZkVuZFtpXSk7XG4gIH1cblxuICBmb3IoaSBpbiB0aGlzLnJlZkxvZykge1xuICAgIHRoaXMuX19vYnMub2ZmTG9nKHRoaXMucmVmTG9nW2ldKTtcbiAgfVxuXG4gIHRoaXMuY2hpbGRyZW4gPSBbXTtcbiAgdGhpcy5yZWZWYWx1ZSA9IFtdO1xuICB0aGlzLnJlZkJvdGggPSBbXTtcbiAgdGhpcy5yZWZFbmQgPSBbXTtcbiAgdGhpcy5yZWZMb2cgPSBbXTtcbn1cblxua2VmaXIuYXV0b1JlbGVhc2UgPSBhdXRvUmVsZWFzZTtcblxubW9kdWxlLmV4cG9ydHMgPSBrZWZpcjtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogL3Vzci9sb2NhbC9saWIvfi9wZWxsZXQvc3JjL29ic2VydmFibGVzLmpzXG4gKiogbW9kdWxlIGlkID0gMTdcbiAqKiBtb2R1bGUgY2h1bmtzID0gMlxuICoqLyIsIlxuLyoqXG4gKiBQZWxsZXQncyBjb21tb24gdXRpbGl0aWVzXG4gKlxuICogQG5hbWVzcGFjZSB1dGlsc1xuICovXG5cbnZhciBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIG5vb3A6IGZ1bmN0aW9uKCkge30sXG5cbiAgLyoqXG4gICAqXG4gICAqIEBtZW1iZXJvZiB1dGlsc1xuICAgKiBAcGFyYW0gaW5wdXRcbiAgICogQHJldHVybnMge09iamVjdH1cbiAgICovXG4gIGNhbWVsY2FzZTogZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgcmV0dXJuIGlucHV0LnNwbGl0KC9bXkEtWmEtejAtOV9dKy8pLnJlZHVjZShmdW5jdGlvbiAoc3RyLCB3b3JkKSB7XG4gICAgICByZXR1cm4gc3RyICsgd29yZFswXS50b1VwcGVyQ2FzZSgpICsgd29yZC5zbGljZSgxKTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogSGFzaCBhIHN0cmluZyB1c2luZyBkamIyXG4gICAqXG4gICAqIEBtZW1iZXJvZiB1dGlsc1xuICAgKiBAcGFyYW0gc3RyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBkamIyOiBmdW5jdGlvbihzdHIpIHtcbiAgICB2YXIgaGFzaCA9IDUzODEsIGkgPSBzdHIubGVuZ3RoO1xuXG4gICAgd2hpbGUoaSkge1xuICAgICAgaGFzaCA9IChoYXNoICogMzMpIF4gc3RyLmNoYXJDb2RlQXQoLS1pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gaGFzaCA+Pj4gMDtcbiAgfSxcblxuICAvKipcbiAgICogSGFzaCBhIG9iamVjdCBpcyBhIHNhZmUgd2F5IHRoYXQgaWdub3JlcyBrZXkgb3JkZXJcbiAgICpcbiAgICogQG1lbWJlcm9mIHV0aWxzXG4gICAqIEBwYXJhbSBvYmpcbiAgICogQHBhcmFtIG9wdGlvbnNcbiAgICogICBpZ25vcmVBcnJheU9yZGVyOlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgaGFzaE9iamVjdDogZnVuY3Rpb24ob2JqLCBvcHRpb25zKSB7XG4gICAgdmFyIGhhc2ggPSA1MzgxO1xuXG4gICAgZnVuY3Rpb24gd2Fsa0FycmF5KG9iaikge1xuICAgICAgdmFyIHZhbCwgaiA9IG9iai5sZW5ndGg7XG5cbiAgICAgIGlmKG9wdGlvbnMgJiYgb3B0aW9ucy5pZ25vcmVBcnJheU9yZGVyKSB7XG4gICAgICAgIHZhciBzb3J0ZWQgPSBbXTtcbiAgICAgICAgd2hpbGUgKGotLSkge1xuICAgICAgICAgIHNvcnRlZFtqXSA9IGV4cG9ydHMuaGFzaE9iamVjdChvYmpbal0sIG9wdGlvbnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFsID0gc29ydGVkLnNvcnQoKS50b1N0cmluZygpO1xuXG4gICAgICAgIGogPSB2YWwubGVuZ3RoO1xuICAgICAgICB3aGlsZSAoaikge1xuICAgICAgICAgIGhhc2ggPSAoaGFzaCAqIDMzKSBeIHZhbC5jaGFyQ29kZUF0KC0taik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdoaWxlIChqLS0pIHtcbiAgICAgICAgICB3YWxrKG9ialtqXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiB3YWxrKG9iaikge1xuICAgICAgdmFyIGksIGosIHZhbCwga2V5cywgdHlwZTtcblxuICAgICAgdHlwZSA9IHR5cGVvZihvYmopO1xuICAgICAgaWYodHlwZSA9PT0gJ29iamVjdCcgJiYgb2JqICE9PSBudWxsKSB7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KG9iaikpIHtcbiAgICAgICAgICB3YWxrQXJyYXkob2JqKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBrZXlzID0gT2JqZWN0LmtleXMob2JqKTtcbiAgICAgICAgaSA9IGtleXMubGVuZ3RoO1xuICAgICAgICBrZXlzLnNvcnQoKTtcbiAgICAgIH1cblxuICAgICAgLy8gd2UgYXJlIGEgcHJpbWl0aXZlIG9yIGVtcHR5IG9iaiBsaWtlIFJlZ2V4LCBEYXRlLCBudWxsLCB1bmRlZmluZWQsIGV0Yy5cbiAgICAgIGlmKCFpKSB7XG4gICAgICAgIHZhbCA9IHR5cGUgKyAob2JqICYmIG9iai50b1N0cmluZygpKTtcbiAgICAgICAgaiA9IHZhbC5sZW5ndGg7XG4gICAgICAgIHdoaWxlIChqKSB7XG4gICAgICAgICAgaGFzaCA9IChoYXNoICogMzMpIF4gdmFsLmNoYXJDb2RlQXQoLS1qKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChpID0ga2V5cy5sZW5ndGgpIHtcbiAgICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAgIC8vIG5vdyBhZGQgdGhlIGtleSB0byB0aGUgaGFzaFxuICAgICAgICAgIHZhbCA9IGtleXNbaV07XG4gICAgICAgICAgaiA9IHZhbC5sZW5ndGg7XG4gICAgICAgICAgd2hpbGUgKGopIHtcbiAgICAgICAgICAgIGhhc2ggPSAoaGFzaCAqIDMzKSBeIHZhbC5jaGFyQ29kZUF0KC0taik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgd2FsayhvYmpba2V5c1tpXV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgd2FsayhvYmopO1xuXG4gICAgcmV0dXJuIGhhc2ggPj4+IDA7XG4gIH0sXG5cbiAgLyoqXG4gICAqIE9yZGVyIGFuIGFycmF5IHNvIHRoZSBvcmRlciB3aWxsIG5vdCBlZmZlY3QgdGhlIGhhc2ggb2ZcbiAgICogdGhlIG9iamVjdC4gVGhpcyBpcyBkb25lIHZpYSBzb3J0aW5nIHRoZSBhcnJheSB2YWx1ZXNcbiAgICogcGVyZHVyYWJsZSBieSB0aGVpciBvd24gaGFzaC5cbiAgICpcbiAgICogVXNlIGNhc2U6XG4gICAqICAgV2hlbiBoYXNoaW5nIGFuIG9iamVjdCB0aGF0IG5lZWRzIHRvIGJlIHNvcnRlZCBpbiBhIGNhY2hlXG4gICAqICAgYnV0IHRoZSBhcnJheSBvcmRlciBpcyBub3QgaW1wb3J0YW50LCBidXQgeW91IGRvIG5vdCB3YW50XG4gICAqICAgdG8gY2hhbmdlIHRoZSBoYXNoLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgdXRpbHNcbiAgICogQHBhcmFtIGFyclxuICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICovXG4gIG1ha2VBcnJheUhhc2hTYWZlOiBmdW5jdGlvbihhcnIpIHtcbiAgICByZXR1cm4gYXJyLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgZXhwb3J0cy5oYXNoT2JqZWN0KGEpIC0gZXhwb3J0cy5oYXNoT2JqZWN0KGIpO1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKlxuICAgKiBAbWVtYmVyb2YgdXRpbHNcbiAgICogQHBhcmFtIG9uZVxuICAgKiBAcGFyYW0gdHdvXG4gICAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAgICovXG4gIGNyZWF0ZUNoYWluZWRGdW5jdGlvbjogZnVuY3Rpb24gKG9uZSwgdHdvKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIGNoYWluZWRGdW5jdGlvbigpIHtcbiAgICAgIG9uZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgdHdvLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfSxcblxuICAvKipcbiAgICpcbiAgICogQG1lbWJlcm9mIHV0aWxzXG4gICAqIEBwYXJhbSBkZXN0XG4gICAqIEBwYXJhbSBzcmNcbiAgICogQHBhcmFtIGlnbm9yZVNwZWNcbiAgICogQHBhcmFtIHNpbmdsZVNwZWMgYXJyYXkgb2ZcbiAgICovXG4gIG1peEludG86IGZ1bmN0aW9uIChkZXN0LCBzcmMsIGlnbm9yZVNwZWMsIGNoYWluYWJsZVNwZWMpIHtcbiAgICBPYmplY3Qua2V5cyhzcmMpLmZvckVhY2goZnVuY3Rpb24gKHByb3ApIHtcbiAgICAgIGlmIChpZ25vcmVTcGVjICYmIC0xICE9PSBpZ25vcmVTcGVjLmluZGV4T2YocHJvcCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoY2hhaW5hYmxlU3BlYyAmJiBjaGFpbmFibGVTcGVjLmluZGV4T2YocHJvcCkgIT09IC0xKSB7XG4gICAgICAgIGlmICghZGVzdFtwcm9wXSkge1xuICAgICAgICAgIGRlc3RbcHJvcF0gPSBzcmNbcHJvcF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVzdFtwcm9wXSA9IGV4cG9ydHMuY3JlYXRlQ2hhaW5lZEZ1bmN0aW9uKGRlc3RbcHJvcF0sIHNyY1twcm9wXSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghZGVzdFtwcm9wXSkge1xuICAgICAgICAgIGRlc3RbcHJvcF0gPSBzcmNbcHJvcF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXhpbiBwcm9wZXJ0eSBjb2xsaXNpb24gZm9yIHByb3BlcnR5IFwiJyArIHByb3AgKyAnXCInKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBkZWVwIG1lcmdlL2NvcHkgb2JqZWN0cyBpbnRvIGEgc2luZ2xlIHVuaW9uIG9iamVjdFxuICAgKlxuICAgKiBAbWVtYmVyb2YgdXRpbHNcbiAgICogQHBhcmFtIG9iamVjdHNcbiAgICogQHBhcmFtIHJlc3VsdFxuICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgKiAgIGRlbGV0ZVVuZGVmaW5lZFxuICAgKiAgIGFycmF5Q29weU1vZGUgMCA9IHJlcGxhY2UsIDE9Y29weSwgMj1qb2luL2NvcHlcbiAgICogICBub25lQ29weVR5cGVzIGFycmF5IG9mIHR5cGVzIGxpa2UgUmVnRXhwLCBEYXRlXG4gICAqICAgcmVmQ29weSAtIHdpbGwgbWFrZSBhIHJlZiB0byB0aGUgc291cmNlIG5vZGUgaWYgdGhlIHRhcmdldCBub2RlIGlzIHVuZGVmaW5lZCBvciBhIG5vbiBvYmplY3QgdHlwZS4gSWYgb2JqZWN0IHR5cGUga2VlcCB3YWxraW5nIHRvIGFuZCB1bnRpbCBlbmRwb2ludC5cbiAgICovXG4gIG9iamVjdFVuaW9uOiBmdW5jdGlvbihvYmplY3RzLCByZXN1bHQsIG9wdGlvbnMsIGluUmVjdXJzaXZlTG9vcCkge1xuICAgIHZhciBpLCBqLCBvYmosIHZhbDtcblxuICAvLyB0b2RvOiB0aGlzIGlzIFNMT1chIEkgbmVlZCB0byByZXRoaW5rIHRoaXMgYW5kIG1ha2UgaXQgZmFzdGVyIVxuXG4gICAgdmFyIGRlbFVuZGVmaW5lZCA9IGZhbHNlXG4gICAgICAsIG5vbmVDb3B5VHlwZXMgPSBmYWxzZVxuICAgICAgLCByZWZDb3B5ID0gZmFsc2VcbiAgICAgICwgYXJyYXlDb3B5TW9kZSA9IDA7XG5cbiAgICBpZighcmVzdWx0IHx8IHR5cGVvZiBvYmplY3RzICE9PSAnb2JqZWN0Jykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdib3RoIG9iamVjdHMgYW5kIHJlc3VsdCBhcmUgcmVxdWlyZWQnKVxuICAgIH1cblxuICAgIGlmKG9wdGlvbnMpIHtcbiAgICAgIGRlbFVuZGVmaW5lZCA9ICEhb3B0aW9ucy5kZWxldGVVbmRlZmluZWQ7XG4gICAgICBpZih0eXBlb2Ygb3B0aW9ucy5hcnJheUNvcHlNb2RlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBhcnJheUNvcHlNb2RlID0gb3B0aW9ucy5hcnJheUNvcHlNb2RlO1xuICAgICAgfVxuXG4gICAgICBpZih0eXBlb2Ygb3B0aW9ucy5ub25lQ29weVR5cGVzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBub25lQ29weVR5cGVzID0gb3B0aW9ucy5ub25lQ29weVR5cGVzO1xuICAgICAgfVxuXG4gICAgICBpZih0eXBlb2Ygb3B0aW9ucy5yZWZDb3B5ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZWZDb3B5ID0gb3B0aW9ucy5yZWZDb3B5O1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmKCFpblJlY3Vyc2l2ZUxvb3AgJiYgQXJyYXkuaXNBcnJheShvYmplY3RzKSkge1xuICAgICAgaW5SZWN1cnNpdmVMb29wID0gLTE7XG4gICAgfVxuXG4gICAgZm9yKGkgaW4gb2JqZWN0cykge1xuICAgICAgb2JqID0gb2JqZWN0c1tpXTtcblxuICAgICAgaWYob2JqICYmIHR5cGVvZiBvYmogPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZvciAoaiBpbiBvYmopIHtcbiAgICAgICAgICB2YWwgPSBvYmpbal07XG5cbiAgICAgICAgICBpZih0eXBlb2YodmFsKSA9PT0gJ29iamVjdCcgJiYgdmFsICE9PSBudWxsKSB7XG4gICAgICAgICAgICBpZihBcnJheS5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAgICAgICAgaWYoYXJyYXlDb3B5TW9kZSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtqXSA9IFtdLmNvbmNhdCh2YWwpO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYoYXJyYXlDb3B5TW9kZSA9PT0gMikge1xuICAgICAgICAgICAgICAgIGlmKCFBcnJheS5pc0FycmF5KHJlc3VsdFtqXSkpIHtcbiAgICAgICAgICAgICAgICAgIGlmKHR5cGVvZihyZXN1bHRbal0pICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRbal0gPSBbcmVzdWx0W2pdXS5jb25jYXQodmFsKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFtqXSA9IFtdLmNvbmNhdCh2YWwpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICByZXN1bHRbal0gPSByZXN1bHRbal0uY29uY2F0KHZhbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtqXSA9IHZhbDtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmKG5vbmVDb3B5VHlwZXMpIHtcbiAgICAgICAgICAgICAgaWYobm9uZUNvcHlUeXBlcy5maWx0ZXIoZnVuY3Rpb24odHlwZSkge3JldHVybiB2YWwgaW5zdGFuY2VvZiB0eXBlfSkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2pdID0gdmFsO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHR5cGVvZiByZXN1bHRbal0gIT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgIGlmKCFyZWZDb3B5KSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2pdID0ge307XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2pdID0gdmFsO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGV4cG9ydHMub2JqZWN0VW5pb24oW3ZhbF0sIHJlc3VsdFtqXSwgb3B0aW9ucywgdHJ1ZSk7XG4gICAgICAgICAgfSBlbHNlIGlmKGRlbFVuZGVmaW5lZCAmJiB0eXBlb2YodmFsKSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGRlbGV0ZSByZXN1bHRbal07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdFtqXSA9IHZhbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmKGluUmVjdXJzaXZlTG9vcCA9PT0gLTEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nhbm5vdCBtZXJnZSBub24gb2JqZWN0IHR5cGVzJyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXN1bHRbaV0gPSBvYmo7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAvdXNyL2xvY2FsL2xpYi9+L3BlbGxldC9zcmMvdXRpbHMuanNcbiAqKiBtb2R1bGUgaWQgPSAxOFxuICoqIG1vZHVsZSBjaHVua3MgPSAyXG4gKiovIiwidmFyIG9ic2VydmFibGVzID0gcmVxdWlyZSgnLi9vYnNlcnZhYmxlcycpXG4gICwgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbnZhciBlbWl0dGVyQ29uc3RydWN0b3IgPSBuZXcgb2JzZXJ2YWJsZXMuZW1pdHRlcigpXG4gICwgZW1pdHRlckNvbnN0cnVjdG9yID0gZW1pdHRlckNvbnN0cnVjdG9yLmNvbnN0cnVjdG9yO1xuXG5mdW5jdGlvbiBpc29sYXRvcihwYXRoLCB0eXBlLCBpZCwgaXNvbGF0ZWRDb25maWcpIHtcbiAgdGhpcy5fZW1pdHRlcnMgPSB7fTtcbiAgdGhpcy5fcmVsZWFzZUxpc3QgPSB7fTtcbiAgdGhpcy5pc29sYXRlZENvbmZpZyA9IGlzb2xhdGVkQ29uZmlnIHx8IHt9O1xuXG4gIHRoaXMuX2lkID0ge1xuICAgIGlkOiAoaWQgfHwgdGhpcyksXG4gICAgcGF0aDogKHBhdGggfHwgJy8nKVxuICB9O1xuXG4gIGlmKHR5cGUpIHtcbiAgICB0aGlzLl9pZC50eXBlID0gdHlwZTtcbiAgfVxufVxuXG5pc29sYXRvci5wcm90b3R5cGUudXBkYXRlSXNvbGF0ZWRDb25maWcgPSBmdW5jdGlvbihjb25maWcpIHtcbiAgdXRpbHMub2JqZWN0VW5pb24oW2NvbmZpZ10sIHRoaXMuaXNvbGF0ZWRDb25maWcpOyAvL3RvZG86IG5lZWQgdG8gc2V0IG9wdGlvbnMhXG59XG5cbmlzb2xhdG9yLnByb3RvdHlwZS5jcmVhdGVDaGlsZCA9IGZ1bmN0aW9uKGlzb2xhdGVkQ29uZmlnKSB7XG4gIHZhciBwcm94eSA9IE9iamVjdC5jcmVhdGUodGhpcyk7XG4gIHByb3h5Ll9yZWxlYXNlTGlzdCA9IHt9O1xuICB0aGlzLl9yZWxlYXNlTGlzdFsnXyQnICsgT2JqZWN0LmtleXModGhpcy5fcmVsZWFzZUxpc3QpLmxlbmd0aF0gPSBwcm94eTtcblxuICBpZihpc29sYXRlZENvbmZpZykge1xuICAgIC8vID8/PyBpZiB3ZSBtZXJnZSBpbiB0aGUgdmFsdWVzXG4gICAgcHJveHkuaXNvbGF0ZWRDb25maWcgPSBpc29sYXRlZENvbmZpZztcbiAgfVxuXG4gIC8vIHRvZG86IHVwZGF0ZSB0aGlzIHRoaXMuX2lkIHdpdGggbW9yZSBpbmZvIChuZWVkIHRvIGNvcHkgdGhpcy5faWQgYmVjYXVzZSBwYXJlbnQgbmVlZCBpdHMgb3duIGNvcHlcblxuICByZXR1cm4gcHJveHk7XG59XG5cbmlzb2xhdG9yLnByb3RvdHlwZS5ldmVudCA9IGZ1bmN0aW9uKG5hbWUsIGlzb2xhdGVkKSB7XG4gIHZhciBlbWl0dGVyLCBhdXRvUmVsZWFzZTtcblxuICBpZihhdXRvUmVsZWFzZSA9IHRoaXMuX3JlbGVhc2VMaXN0W25hbWVdKSB7XG4gICAgaWYoYXV0b1JlbGVhc2UgaW5zdGFuY2VvZiBvYnNlcnZhYmxlcy5hdXRvUmVsZWFzZSkge1xuICAgICAgcmV0dXJuIGF1dG9SZWxlYXNlO1xuICAgIH1cblxuICAgIC8vIHRocm93IGJlY2F1c2UgdGhlIGtleSBhbHJlYWR5IGV4aXN0cyBhbmQgaXMgbm90IGFuIGVtaXR0ZXIuIHRoaXMgaXMgbW9zdFxuICAgIC8vIGxpa2VseSBiZWNhdXNlIHdlIGhhdmUgYSBjb29yZGluYXRvciB3aXRoIHRoYXQgbmFtZSBvciBuYW1lIGlzIF8kLi5cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvbmZsaWN0IHdpdGggZXhpc3Rpbmcga2V5Jyk7XG4gIH1cblxuICBlbWl0dGVyID0gdGhpcy5fZW1pdHRlcnNbbmFtZV07XG4gIGlmKCFlbWl0dGVyKSB7XG4gICAgZW1pdHRlciA9IHRoaXMuX2VtaXR0ZXJzW25hbWVdID0gb2JzZXJ2YWJsZXMuZW1pdHRlcigpO1xuICB9XG5cbiAgYXV0b1JlbGVhc2UgPSBuZXcgb2JzZXJ2YWJsZXMuYXV0b1JlbGVhc2UoZW1pdHRlciwgdGhpcy5faWQsIHRoaXMuaXNvbGF0ZWRDb25maWcpO1xuICB0aGlzLl9yZWxlYXNlTGlzdFtuYW1lXSA9IGF1dG9SZWxlYXNlO1xuXG4gIGlmKGlzb2xhdGVkKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICByZXR1cm4gYXV0b1JlbGVhc2UuZmlsdGVyKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGlmKCFkYXRhLmN0eCB8fCAhX3RoaXMuaXNvbGF0ZWRDb25maWcpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGF0YS5jdHggPT09IF90aGlzLmlzb2xhdGVkQ29uZmlnO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIGF1dG9SZWxlYXNlO1xufVxuXG5pc29sYXRvci5wcm90b3R5cGUubWFrZVByb3BlcnR5ID0gZnVuY3Rpb24oZXZlbnQsIG5hbWUsIGN1cnJlbnQsIGlzb2xhdGUpIHtcbiAgdmFyIGVtaXR0ZXIsIGF1dG9SZWxlYXNlO1xuXG4gIGlmKGF1dG9SZWxlYXNlID0gdGhpcy5fcmVsZWFzZUxpc3RbbmFtZV0pIHtcbiAgICBpZihhdXRvUmVsZWFzZSBpbnN0YW5jZW9mIG9ic2VydmFibGVzLmF1dG9SZWxlYXNlKSB7XG4gICAgICByZXR1cm4gYXV0b1JlbGVhc2U7XG4gICAgfVxuXG4gICAgLy8gdGhyb3cgYmVjYXVzZSB0aGUga2V5IGFscmVhZHkgZXhpc3RzIGFuZCBpcyBub3QgYW4gZW1pdHRlci4gdGhpcyBpcyBtb3N0XG4gICAgLy8gbGlrZWx5IGJlY2F1c2Ugd2UgaGF2ZSBhIGNvb3JkaW5hdG9yIHdpdGggdGhhdCBuYW1lIG9yIG5hbWUgaXMgXyQuLlxuICAgIHRocm93IG5ldyBFcnJvcignQ29uZmxpY3Qgd2l0aCBleGlzdGluZyBrZXknKTtcbiAgfVxuXG4gIGlmKCEoZXZlbnQgaW5zdGFuY2VvZiBvYnNlcnZhYmxlcy5hdXRvUmVsZWFzZSkpIHtcbiAgICBpZighKGV2ZW50ID0gdGhpcy5fZW1pdHRlcnNbZXZlbnRdKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGJhc2UgZXZlbnQgdG8gYnVpbGQgcHJvcGVydHkgZnJvbScpO1xuICAgIH1cbiAgfVxuXG4gIGVtaXR0ZXIgPSB0aGlzLl9lbWl0dGVyc1tuYW1lXTtcbiAgaWYoIWVtaXR0ZXIpIHtcbiAgICBlbWl0dGVyID0gdGhpcy5fZW1pdHRlcnNbbmFtZV0gPSBldmVudC50b1Byb3BlcnR5KHtzZW5kZXI6dGhpcy5faWQsIGV2ZW50OmN1cnJlbnR9KTtcbiAgfVxuXG4gIGF1dG9SZWxlYXNlID0gbmV3IG9ic2VydmFibGVzLmF1dG9SZWxlYXNlKGVtaXR0ZXIsIHRoaXMuX2lkKTtcbiAgdGhpcy5fcmVsZWFzZUxpc3RbbmFtZV0gPSBhdXRvUmVsZWFzZTtcblxuICByZXR1cm4gYXV0b1JlbGVhc2U7XG59XG5cbmlzb2xhdG9yLnByb3RvdHlwZS5yZWdpc3RlckVtaXR0ZXIgPSBmdW5jdGlvbihuYW1lLCBlbWl0dGVyKSB7XG4gIGlmKHRoaXMuX3JlbGVhc2VMaXN0W25hbWVdKSB7XG4gICAgLy8gdGhyb3cgYmVjYXVzZSB0aGUga2V5IGFscmVhZHkgZXhpc3RzXG4gICAgdGhyb3cgbmV3IEVycm9yKCdDb25mbGljdCB3aXRoIGV4aXN0aW5nIGtleScpO1xuICB9XG5cbiAgaWYoZW1pdHRlciBpbnN0YW5jZW9mIG9ic2VydmFibGVzLmF1dG9SZWxlYXNlKSB7XG4gICAgdGhpcy5fZW1pdHRlcnNbbmFtZV0gPSBlbWl0dGVyLl9fb2JzO1xuICAgIHRoaXMuX3JlbGVhc2VMaXN0W25hbWVdID0gZW1pdHRlcjtcbiAgfSBlbHNlIGlmKGVtaXR0ZXIgaW5zdGFuY2VvZiBlbWl0dGVyQ29uc3RydWN0b3IpIHtcbiAgICB0aGlzLl9lbWl0dGVyc1tuYW1lXSA9IGVtaXR0ZXI7XG4gICAgdGhpcy5fcmVsZWFzZUxpc3RbbmFtZV0gPSBlbWl0dGVyID0gbmV3IG9ic2VydmFibGVzLmF1dG9SZWxlYXNlKGVtaXR0ZXIsIHRoaXMuX2lkKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCByZWdpc3RlciBhIG5vbiBlbWl0dGVyL2F1dG9yZWxlYXNlJyk7XG4gIH1cblxuICByZXR1cm4gZW1pdHRlcjtcbn1cblxuaXNvbGF0b3IucHJvdG90eXBlLmNvb3JkaW5hdG9yID0gZnVuY3Rpb24obmFtZSwgdHlwZSkge1xuICB2YXIgaW5zdGFuY2UgPSB0aGlzLl9yZWxlYXNlTGlzdFtuYW1lXTtcbiAgaWYoaW5zdGFuY2UpIHtcbiAgICBpZihpbnN0YW5jZSBpbnN0YW5jZW9mIGlzb2xhdG9yKSB7XG4gICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgfVxuXG4gICAgLy8gdGhyb3cgYmVjYXVzZSB0aGUga2V5IGFscmVhZHkgZXhpc3RzIGFuZCBpcyBub3QgYW4gY29vcmRpbmF0b3IuIHRoaXMgaXMgbW9zdFxuICAgIC8vIGxpa2VseSBiZWNhdXNlIHdlIGhhdmUgYSBldmVudCB3aXRoIHRoYXQgbmFtZSBvciBuYW1lIGlzIF8kLi5cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvbmZsaWN0IHdpdGggZXhpc3Rpbmcga2V5Jyk7XG4gIH1cblxuICAvLyBOT1RFOiByZXF1aXJlKCcuL3BlbGxldCcpIGlzIHJlcXVpcmVkIHRvIHdvcmsgYXJvdW5kIGEgd2VicGFjayBsb2FkIG9yZGVyXG4gIC8vIHBlbGxldC5qcyBsb2FkcyB0aGlzIGZpbGUgc28gd2UgbmVlZCB0byBsYXp5IGdldCBwZWxsZXQgdG8gaGF2ZSBmdWxsIGluaXRcbiAgLy8gdmVyc2lvbi5cbiAgaW5zdGFuY2UgPSByZXF1aXJlKCcuL3BlbGxldCcpLmdldENvb3JkaW5hdG9yKG5hbWUsIHR5cGUpO1xuICB0aGlzLl9yZWxlYXNlTGlzdFtuYW1lXSA9IGluc3RhbmNlID0gaW5zdGFuY2UuY3JlYXRlQ2hpbGQodGhpcy5pc29sYXRlZENvbmZpZyk7XG5cbiAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG4vKipcbiAqIHJlbGVhc2Ugb25seSB0aGUgb2JzZXJ2YWJsZXMgYnV0IHRoZSBlbWl0IHdpbGwgcmVtYWluXG4gKi9cbmlzb2xhdG9yLnByb3RvdHlwZS5yZWxlYXNlID0gZnVuY3Rpb24oKSB7XG4gIGZvcih2YXIgaSBpbiB0aGlzLl9yZWxlYXNlTGlzdCkge1xuICAgIHRoaXMuX3JlbGVhc2VMaXN0W2ldLnJlbGVhc2UoKTtcbiAgfVxuXG4gIHRoaXMuX3JlbGVhc2VMaXN0ID0ge307XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNvbGF0b3I7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC91c3IvbG9jYWwvbGliL34vcGVsbGV0L3NyYy9pc29sYXRvci5qc1xuICoqIG1vZHVsZSBpZCA9IDE5XG4gKiogbW9kdWxlIGNodW5rcyA9IDJcbiAqKi8iLCJ2YXIgcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpXG4gICwgaXNvbGF0b3IgPSByZXF1aXJlKCcuL2lzb2xhdG9yJyk7XG5cbnZhciBzcGVjID0ge1xuICByZXF1ZXN0Q29udGV4dDogcmVhY3QuUHJvcFR5cGVzLm9iamVjdCxcbiAgcm9vdElzb2xhdG9yOiByZWFjdC5Qcm9wVHlwZXMuaW5zdGFuY2VPZihpc29sYXRvciksXG4gIGxvY2FsZXM6IHJlYWN0LlByb3BUeXBlcy5vbmVPZlR5cGUoW1xuICAgIHJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG4gICAgcmVhY3QuUHJvcFR5cGVzLmFycmF5XG4gIF0pXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY29udGV4dFR5cGVzICAgICA6IHNwZWMsXG4gIGNoaWxkQ29udGV4dFR5cGVzOiBzcGVjLFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgLy8gY3JlYXRlIGEgbG9jYWwgIGluc3RydW1lbnQgd2l0aCBvdXIgaXNvbGF0ZWRDb25maWcuIFRoaXMgaXMgbGlrZSBoYXZpbmcgb3VyIG93biBjb25zdHJ1Y3RvclxuICAgIHRoaXMuaW5zdHJ1bWVudCA9IHJlcXVpcmUoJ3BlbGxldCcpLmluc3RydW1lbnRhdGlvbi5hZGRJc29sYXRlZENvbmZpZyh0aGlzLmNvbnRleHQucm9vdElzb2xhdG9yLmlzb2xhdGVkQ29uZmlnKTtcbiAgICByZXR1cm4gKHRoaXMucHJvcHMgJiYgdGhpcy5wcm9wcy5fX2luaXRTdGF0ZSkgfHwge307XG4gIH0sXG5cbiAgZXZlbnQ6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBpZighdGhpcy5fJGlzb2xhdG9yKSB7XG4gICAgICBjb25zb2xlLnZlcmJvc2UoJ2FkZCBsb2NhbCBpc29sYXRvciBiZWNhdXNlIGV2ZW50OicsIG5hbWUpO1xuICAgICAgdGhpcy5fJGlzb2xhdG9yID0gdGhpcy5jb250ZXh0LnJvb3RJc29sYXRvci5jcmVhdGVDaGlsZCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl8kaXNvbGF0b3IuZXZlbnQobmFtZSk7XG4gIH0sXG5cbiAgY29vcmRpbmF0b3I6IGZ1bmN0aW9uKG5hbWUsIHR5cGUpIHtcbiAgICBpZighdGhpcy5fJGlzb2xhdG9yKSB7XG4gICAgICBjb25zb2xlLnZlcmJvc2UoJ2FkZCBsb2NhbCBpc29sYXRvciBiZWNhdXNlIGlzb2xhdG9yOicsIG5hbWUsIHR5cGUpO1xuICAgICAgdGhpcy5fJGlzb2xhdG9yID0gdGhpcy5jb250ZXh0LnJvb3RJc29sYXRvci5jcmVhdGVDaGlsZCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl8kaXNvbGF0b3IuY29vcmRpbmF0b3IobmFtZSwgdHlwZSk7XG4gIH0sXG5cbiAgZ2V0TG9jYWxlczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMubG9jYWxlcyB8fCB0aGlzLmNvbnRleHQubG9jYWxlcztcbiAgfSxcblxuICBnZXRSZXF1ZXN0Q29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuY29udGV4dC5yZXF1ZXN0Q29udGV4dDtcbiAgfSxcblxuICBnZXRJc29sYXRlZENvbmZpZzogZnVuY3Rpb24oKSB7XG4gICAgaWYodGhpcy5fJGlzb2xhdG9yKSB7XG4gICAgICByZXR1cm4gdGhpcy5fJGlzb2xhdG9yLmlzb2xhdGVkQ29uZmlnO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5jb250ZXh0LnJvb3RJc29sYXRvci5pc29sYXRlZENvbmZpZztcbiAgICB9XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIC8vIHJlbGVhc2UgZXZlcnl0aGluZyBpZiByb290IGVsZW1lbnQgdW5tb3VudGluZ1xuICAgIC8vIGVsc2UgY2hlY2sgaWYgbG9jYWwgaXNvbGF0b3IgdGhhdCB3ZSBuZWVkIHRvXG4gICAgLy8gcmVsZWFzZS5cbiAgICBpZighdGhpcy5fb3duZXIpIHtcbiAgICAgIGNvbnNvbGUudmVyYm9zZSgncmVsZWFzZSByb290SXNvbGF0b3InKTtcbiAgICAgIHRoaXMuY29udGV4dC5yb290SXNvbGF0b3IucmVsZWFzZSgpO1xuICAgIH0gZWxzZSBpZih0aGlzLl8kaXNvbGF0b3IpIHtcbiAgICAgIGNvbnNvbGUudmVyYm9zZSgncmVsZWFzZSBsb2NhbCBpc29sYXRvcicpO1xuICAgICAgdGhpcy5fJGlzb2xhdG9yLnJlbGVhc2UoKTtcbiAgICB9XG4gIH0sXG5cbiAgZ2V0Q2hpbGRDb250ZXh0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJvb3RJc29sYXRvcjogdGhpcy5jb250ZXh0LnJvb3RJc29sYXRvcixcbiAgICAgIHJlcXVlc3RDb250ZXh0OiB0aGlzLmNvbnRleHQucmVxdWVzdENvbnRleHQsXG4gICAgICBsb2NhbGVzOiB0aGlzLmdldExvY2FsZXMoKVxuICAgIH07XG4gIH1cbn07XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC91c3IvbG9jYWwvbGliL34vcGVsbGV0L3NyYy9jb21wb25lbnQtbWl4aW4uanNcbiAqKiBtb2R1bGUgaWQgPSAyMFxuICoqIG1vZHVsZSBjaHVua3MgPSAyXG4gKiovIiwiLyoqXG4gKlxuICogQGludGVyZmFjZSBleHBlcmltZW50SVxuICogQGNsYXNzXG4gKi9cbmZ1bmN0aW9uIGV4cGVyaW1lbnRJbnRlcmZhY2UocGVsbGV0KSB7XG4gIHRoaXMucGVsbGV0ID0gcGVsbGV0O1xufVxuXG5leHBlcmltZW50SW50ZXJmYWNlLnByb3RvdHlwZS5zZWxlY3QgPSBmdW5jdGlvbihuYW1lLCBjdHgsIGV4cGVyaW1lbnRJZCwgX3JlbmRlck9wdGlvbnMpIHtcbiAgdmFyIGksIHR5cGU7XG5cbiAgaWYobmFtZSA9PT0gbnVsbCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmKHR5cGVvZiBuYW1lID09PSAnZnVuY3Rpb24nKSB7XG4gICAgLy8gbG9vayB1cCB0aGUgY29tcG9uZW50J3MgdmVyc2lvbi9rZXlcbiAgICBmb3IoaSBpbiB0aGlzLnBlbGxldC5jb21wb25lbnRzKSB7XG4gICAgICBpZih0aGlzLnBlbGxldC5jb21wb25lbnRzW2ldID09PSBuYW1lKSB7XG4gICAgICAgIG5hbWUgPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBpZiBub3QgZm91bmQgcmV0dXJuIHVuZGVmaW5lZFxuICAgIGlmKHR5cGVvZiBuYW1lID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKDAsIG5hbWUuaW5kZXhPZignQCcpKTtcbiAgICB0eXBlID0gMTtcbiAgfSBlbHNlIGlmKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgIGNvbnNvbGUud2FybignR0EgZXhwZXJpbWVudDogaW52YWxpZCB2ZXJzaW9uIGV4cGVyaW1lbnQ6JywgZXhwZXJpbWVudElkLCAndHlwZTonLCB0eXBlb2YgbmFtZSwgJ25hbWU6JywgbmFtZSk7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGV4cGVyaW1lbnQgdmVyc2lvbiB0eXBlJyk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKG5hbWVbMF0gPT09ICdAJykge1xuICAgICAgdHlwZSA9IDE7XG4gICAgICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoMSk7XG4gICAgfSBlbHNlIGlmIChuYW1lWzBdID09PSAnPScpIHtcbiAgICAgIHR5cGUgPSAyO1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKDEpO1xuICAgIH1cblxuICAgIGlmICghbmFtZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGlmIHRoZSBrZXkgaGFzIGEgdmVyc2lvbiB1c2UgdGhlIHNwZWNpZmllZCB2ZXJzaW9uXG4gICAgLy8gYW5kIGlnbm9yZSB0aGUgZXhwZXJpbWVudCB2ZXJzaW9uXG4gICAgaWYgKHR5cGUgIT09IDIgJiYgbmFtZS5pbmRleE9mKCdAJykgIT09IC0xKSB7XG4gICAgICByZXR1cm4gdGhpcy5wZWxsZXQuY29tcG9uZW50c1tuYW1lXTtcbiAgICB9XG5cbiAgICBpZiAodHlwZSAhPT0gMSAmJiAoaSA9IG5hbWUuaW5kZXhPZignPScpKSAhPT0gLTEpIHtcbiAgICAgIHJldHVybiBuYW1lLnN1YnN0cmluZyhpICsgMSk7XG4gICAgfVxuICB9XG5cbiAgaWYodHlwZSA9PT0gMSkgcmV0dXJuIHRoaXMucGVsbGV0LmNvbXBvbmVudHNbbmFtZV07XG4gIGVsc2UgaWYodHlwZSA9PT0gMikgcmV0dXJuIG5hbWU7XG4gIHJldHVybiB0aGlzLnBlbGxldC5jb21wb25lbnRzW25hbWVdIHx8IG5hbWU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwZXJpbWVudEludGVyZmFjZTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogL3Vzci9sb2NhbC9saWIvfi9wZWxsZXQvc3JjL2V4cGVyaW1lbnQtaW50ZXJmYWNlLmpzXG4gKiogbW9kdWxlIGlkID0gMjFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMlxuICoqLyIsIi8vIGJhc2VkIG9mZiBvZiBodHRwczovL2dpdGh1Yi5jb20vU2NvdHRIYW1wZXIvY29va2llc1xuXG52YXIgY29va2llcyA9IHtcbiAgZ2V0OiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgaWYgKGNvb2tpZXMuX2NhY2hlZERvY3VtZW50Q29va2llICE9PSB3aW5kb3cuZG9jdW1lbnQuY29va2llKSB7XG4gICAgICBjb29raWVzLl9yZW5ld0NhY2hlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvb2tpZXMuX2NhY2hlW2tleV07XG4gIH0sXG5cbiAgc2V0OiBmdW5jdGlvbiAoa2V5LCB2YWx1ZSwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBjb29raWVzLl9nZXRFeHRlbmRlZE9wdGlvbnMob3B0aW9ucyk7XG4gICAgb3B0aW9ucy5leHBpcmVzID0gY29va2llcy5fZ2V0RXhwaXJlc0RhdGUodmFsdWUgPT09IHVuZGVmaW5lZCA/IC0xIDogb3B0aW9ucy5leHBpcmVzKTtcblxuICAgIHdpbmRvdy5kb2N1bWVudC5jb29raWUgPSBjb29raWVzLl9nZW5lcmF0ZUNvb2tpZVN0cmluZyhrZXksIHZhbHVlLCBvcHRpb25zKTtcblxuICAgIHJldHVybiBjb29raWVzO1xuICB9LFxuXG4gIGV4cGlyZTogZnVuY3Rpb24gKGtleSwgb3B0aW9ucykge1xuICAgIHJldHVybiBjb29raWVzLnNldChrZXksIHVuZGVmaW5lZCwgb3B0aW9ucyk7XG4gIH0sXG5cbiAgX2dldEV4dGVuZGVkT3B0aW9uczogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcGF0aDogb3B0aW9ucyAmJiBvcHRpb25zLnBhdGggfHwgJy8nLFxuICAgICAgZG9tYWluOiBvcHRpb25zICYmIG9wdGlvbnMuZG9tYWluLFxuICAgICAgZXhwaXJlczogb3B0aW9ucyAmJiBvcHRpb25zLmV4cGlyZXMsXG4gICAgICBzZWN1cmU6IG9wdGlvbnMgJiYgb3B0aW9ucy5zZWN1cmUgIT09IHVuZGVmaW5lZCA/IG9wdGlvbnMuc2VjdXJlIDogZmFsc2VcbiAgICB9O1xuICB9LFxuXG4gIF9pc1ZhbGlkRGF0ZTogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGRhdGUpID09PSAnW29iamVjdCBEYXRlXScgJiYgIWlzTmFOKGRhdGUuZ2V0VGltZSgpKTtcbiAgfSxcblxuICBfZ2V0RXhwaXJlc0RhdGU6IGZ1bmN0aW9uIChleHBpcmVzLCBub3cpIHtcbiAgICBub3cgPSBub3cgfHwgbmV3IERhdGUoKTtcbiAgICBzd2l0Y2ggKHR5cGVvZiBleHBpcmVzKSB7XG4gICAgICBjYXNlICdudW1iZXInOlxuICAgICAgICBleHBpcmVzID0gbmV3IERhdGUobm93LmdldFRpbWUoKSArIGV4cGlyZXMgKiAxMDAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICBleHBpcmVzID0gbmV3IERhdGUoZXhwaXJlcyk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGlmIChleHBpcmVzICYmICFjb29raWVzLl9pc1ZhbGlkRGF0ZShleHBpcmVzKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdgZXhwaXJlc2AgcGFyYW1ldGVyIGNhbm5vdCBiZSBjb252ZXJ0ZWQgdG8gYSB2YWxpZCBEYXRlIGluc3RhbmNlJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGV4cGlyZXM7XG4gIH0sXG5cbiAgX2dlbmVyYXRlQ29va2llU3RyaW5nOiBmdW5jdGlvbiAoa2V5LCB2YWx1ZSwgb3B0aW9ucykge1xuICAgIGtleSA9IGtleS5yZXBsYWNlKC9bXiMkJitcXF5gfF0vZywgZW5jb2RlVVJJQ29tcG9uZW50KTtcbiAgICBrZXkgPSBrZXkucmVwbGFjZSgvXFwoL2csICclMjgnKS5yZXBsYWNlKC9cXCkvZywgJyUyOScpO1xuICAgIHZhbHVlID0gKHZhbHVlICsgJycpLnJlcGxhY2UoL1teISMkJi0rXFwtLTo8LVxcW1xcXS1+XS9nLCBlbmNvZGVVUklDb21wb25lbnQpO1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdmFyIGNvb2tpZVN0cmluZyA9IGtleSArICc9JyArIHZhbHVlO1xuICAgIGNvb2tpZVN0cmluZyArPSBvcHRpb25zLnBhdGggPyAnO3BhdGg9JyArIG9wdGlvbnMucGF0aCA6ICcnO1xuICAgIGNvb2tpZVN0cmluZyArPSBvcHRpb25zLmRvbWFpbiA/ICc7ZG9tYWluPScgKyBvcHRpb25zLmRvbWFpbiA6ICcnO1xuICAgIGNvb2tpZVN0cmluZyArPSBvcHRpb25zLmV4cGlyZXMgPyAnO2V4cGlyZXM9JyArIG9wdGlvbnMuZXhwaXJlcy50b1VUQ1N0cmluZygpIDogJyc7XG4gICAgY29va2llU3RyaW5nICs9IG9wdGlvbnMuc2VjdXJlID8gJztzZWN1cmUnIDogJyc7XG5cbiAgICByZXR1cm4gY29va2llU3RyaW5nO1xuICB9LFxuXG4gIF9nZXRDYWNoZUZyb21TdHJpbmc6IGZ1bmN0aW9uIChkb2N1bWVudENvb2tpZSkge1xuICAgIHZhciBjb29raWVDYWNoZSA9IHt9O1xuICAgIHZhciBjb29raWVzQXJyYXkgPSBkb2N1bWVudENvb2tpZSA/IGRvY3VtZW50Q29va2llLnNwbGl0KCc7ICcpIDogW107XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvb2tpZXNBcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGNvb2tpZUt2cCA9IGNvb2tpZXMuX2dldEtleVZhbHVlUGFpckZyb21Db29raWVTdHJpbmcoY29va2llc0FycmF5W2ldKTtcblxuICAgICAgaWYgKGNvb2tpZUNhY2hlW2Nvb2tpZUt2cC5rZXldID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29va2llQ2FjaGVbY29va2llS3ZwLmtleV0gPSBjb29raWVLdnAudmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvb2tpZUNhY2hlO1xuICB9LFxuXG4gIF9nZXRLZXlWYWx1ZVBhaXJGcm9tQ29va2llU3RyaW5nOiBmdW5jdGlvbiAoY29va2llU3RyaW5nKSB7XG4gICAgLy8gXCI9XCIgaXMgYSB2YWxpZCBjaGFyYWN0ZXIgaW4gYSBjb29raWUgdmFsdWUgYWNjb3JkaW5nIHRvIFJGQzYyNjUsIHNvIGNhbm5vdCBgc3BsaXQoJz0nKWBcbiAgICB2YXIgc2VwYXJhdG9ySW5kZXggPSBjb29raWVTdHJpbmcuaW5kZXhPZignPScpO1xuXG4gICAgLy8gSUUgb21pdHMgdGhlIFwiPVwiIHdoZW4gdGhlIGNvb2tpZSB2YWx1ZSBpcyBhbiBlbXB0eSBzdHJpbmdcbiAgICBzZXBhcmF0b3JJbmRleCA9IHNlcGFyYXRvckluZGV4IDwgMCA/IGNvb2tpZVN0cmluZy5sZW5ndGggOiBzZXBhcmF0b3JJbmRleDtcblxuICAgIHJldHVybiB7XG4gICAgICBrZXk6IGRlY29kZVVSSUNvbXBvbmVudChjb29raWVTdHJpbmcuc3Vic3RyKDAsIHNlcGFyYXRvckluZGV4KSksXG4gICAgICB2YWx1ZTogZGVjb2RlVVJJQ29tcG9uZW50KGNvb2tpZVN0cmluZy5zdWJzdHIoc2VwYXJhdG9ySW5kZXggKyAxKSlcbiAgICB9O1xuICB9LFxuXG4gIF9yZW5ld0NhY2hlOiBmdW5jdGlvbiAoKSB7XG4gICAgY29va2llcy5fY2FjaGUgPSBjb29raWVzLl9nZXRDYWNoZUZyb21TdHJpbmcod2luZG93LmRvY3VtZW50LmNvb2tpZSk7XG4gICAgY29va2llcy5fY2FjaGVkRG9jdW1lbnRDb29raWUgPSB3aW5kb3cuZG9jdW1lbnQuY29va2llO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvb2tpZXM7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC91c3IvbG9jYWwvbGliL34vcGVsbGV0L3NyYy9pc29tb3JwaGljL2Nvb2tpZS5qc1xuICoqIG1vZHVsZSBpZCA9IDIyXG4gKiogbW9kdWxlIGNodW5rcyA9IDJcbiAqKi8iLCJ2YXIgcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpXG4gICwgcGVsbGV0ID0gcmVxdWlyZSgnLi9wZWxsZXQnKVxuICAsIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXG4gICwgaXNvbGF0b3IgPSByZXF1aXJlKCcuL2lzb2xhdG9yJylcbiAgLCBwaXBlbGluZSA9IHJlcXVpcmUoJy4vaXNvbW9ycGhpYy9waXBlbGluZScpO1xuXG4vLyBvcHRpb25zLmNvbnRleHQgb3B0aW9ucy5tb2RlPU1PREVfSFRNTCwgb3B0aW9ucy5kb20gPVxuXG52YXIgcGVsbGV0UmVuZGVyID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIE1PREVfU1RSSU5HOiAnc3RhdGljJyxcbiAgTU9ERV9IVE1MOiAnbWFya3VwJyxcbiAgTU9ERV9ET006ICdkb20nLFxuXG4gIC8qKlxuICAgKiBSZW5kZXIgdGhlIGNvbXBvbmVudCBmb3IgYm90aCB0aGUgc2VydmVyIGFuZCBicm93c2VyXG4gICAqXG4gICAqIEBwYXJhbSBjb21wb25lbnRcbiAgICogQHBhcmFtIG9wdGlvbnMgKG1vZGU6IHRhcmdldEVsOiwgY29udGV4dDogb3IgcHJvcHM6KVxuICAgKiBAcGFyYW0gbmV4dFxuICAgKi9cbiAgcmVuZGVyQ29tcG9uZW50OiBmdW5jdGlvbihjb21wb25lbnQsIG9wdGlvbnMsIG5leHQpIHtcbiAgICBpZih0eXBlb2Ygb3B0aW9ucyA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICBuZXh0ID0gb3B0aW9ucztcbiAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICB9IGVsc2UgaWYoIW9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICB9XG5cbiAgICBpZighY29tcG9uZW50IHx8ICFuZXh0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3RoZSBjb21wb25lbnQgYW5kIG5leHQgYXJlIHJlcXVpcmVkJylcbiAgICB9XG5cbiAgICAvLyBkZWZhdWx0IHRoZSBtb2RlIHVzaW5nIHRoZSBlbnZpcm9ubWVudCBzbyBpZiBpbiBicm93c2VyIHVzZVxuICAgIC8vIERPTSByZW5kZXIgZWxzZSByZW5kZXIgZnVsbCBodG1sIHdpdGggcmVhY3QtaWRzXG4gICAgaWYoIW9wdGlvbnMubW9kZSkge1xuICAgICAgaWYocHJvY2Vzcy5lbnYuQlJPV1NFUl9FTlYpIHtcbiAgICAgICAgb3B0aW9ucy5tb2RlID0gcGVsbGV0UmVuZGVyLk1PREVfRE9NO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3B0aW9ucy5tb2RlID0gcGVsbGV0UmVuZGVyLk1PREVfSFRNTDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgaW5zdHJ1bWVudCA9IHBlbGxldC5pbnN0cnVtZW50YXRpb24ubmFtZXNwYWNlKCdpc29yZW5kZXIuJyk7XG4gICAgdmFyIG1lc3VyZSA9IGluc3RydW1lbnQuZWxhcHNlVGltZXIoKTtcbiAgICBpbnN0cnVtZW50LmluY3JlbWVudCgnY291bnQnKTtcblxuICAgIGZ1bmN0aW9uIHJlbmRlclJlYWN0Q29tcG9uZW50KGNvbXBvbmVudCwgY3R4KSB7XG4gICAgICB2YXIgcmVzdWx0O1xuXG4gICAgICB0cnkge1xuICAgICAgICBpZihvcHRpb25zLm1vZGUgPT0gcGVsbGV0UmVuZGVyLk1PREVfRE9NICYmIHByb2Nlc3MuZW52LkJST1dTRVJfRU5WKSB7XG4gICAgICAgICAgaWYoIW9wdGlvbnMudGFyZ2V0RWwpIHtcbiAgICAgICAgICAgIG9wdGlvbnMudGFyZ2V0RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnX19QRUxMRVRfXycpO1xuICAgICAgICAgICAgaWYoIW9wdGlvbnMudGFyZ2V0RWwpIHtcbiAgICAgICAgICAgICAgb3B0aW9ucy50YXJnZXRFbCA9IGRvY3VtZW50LmJvZHk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYob3B0aW9ucy5vblJvdXRlVW5tb3VudFJlYWN0KSB7XG4gICAgICAgICAgICByZWFjdC51bm1vdW50Q29tcG9uZW50QXROb2RlKG9wdGlvbnMudGFyZ2V0RWwpO1xuICAgICAgICAgICAgbWVzdXJlLm1hcmsoJ3JlYWN0X3VubW91bnQnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBvbmx5IGFkZCB0b3VjaCBldmVudHMgaWYgdGhlIGRldmljZSBzdXBwb3J0IGl0XG4gICAgICAgICAgaWYgKCdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkge1xuICAgICAgICAgICAgcmVhY3QuaW5pdGlhbGl6ZVRvdWNoRXZlbnRzKHRydWUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJlc3VsdCA9IHJlYWN0LnJlbmRlcihjb21wb25lbnQsIG9wdGlvbnMudGFyZ2V0RWwpO1xuXG4gICAgICAgICAgaWYoIW9wdGlvbnMudGFyZ2V0RWwuX2xvYWRlZEFuZEluaXRpYWxpemVkKSB7XG4gICAgICAgICAgICBpZihvcHRpb25zLnRhcmdldEVsLmNsYXNzTmFtZSkge1xuICAgICAgICAgICAgICBvcHRpb25zLnRhcmdldEVsLmNsYXNzTmFtZSA9IG9wdGlvbnMudGFyZ2V0RWwuY2xhc3NOYW1lLnJlcGxhY2UoJ2xvYWRpbmdfYW5kX3VuaW5pdGlhbGl6ZWQnLCAnJykudHJpbSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBvcHRpb25zLnRhcmdldEVsLl9sb2FkZWRBbmRJbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYoIWRvY3VtZW50LmJvZHkuX2xvYWRlZEFuZEluaXRpYWxpemVkKSB7XG4gICAgICAgICAgICBpZihkb2N1bWVudC5ib2R5LmNsYXNzTmFtZSkge1xuICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTmFtZSA9IGRvY3VtZW50LmJvZHkuY2xhc3NOYW1lLnJlcGxhY2UoJ3VuaW5pdGlhbGl6ZWQnLCAnJykudHJpbSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5Ll9sb2FkZWRBbmRJbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYob3B0aW9ucy5tb2RlID09IHBlbGxldFJlbmRlci5NT0RFX1NUUklORykge1xuICAgICAgICAgIHJlc3VsdCA9IHJlYWN0LnJlbmRlclRvU3RhdGljTWFya3VwKGNvbXBvbmVudCk7XG4gICAgICAgIH0gZWxzZSBpZihvcHRpb25zLm1vZGUgPT0gcGVsbGV0UmVuZGVyLk1PREVfSFRNTCkge1xuICAgICAgICAgIGlmKHBlbGxldC5vcHRpb25zICYmIHBlbGxldC5vcHRpb25zLnVzZVJlYWN0UmVuZGVyVG9TdGF0aWNNYXJrdXApIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlYWN0LnJlbmRlclRvU3RhdGljTWFya3VwKGNvbXBvbmVudCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlYWN0LnJlbmRlclRvU3RyaW5nKGNvbXBvbmVudCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbWVzdXJlLm1hcmsoJ3JlYWN0X3JlbmRlcicpO1xuICAgICAgfSBjYXRjaChleCkge1xuICAgICAgICBuZXh0KGV4KTtcbiAgICAgICAgaW5zdHJ1bWVudC5pbmNyZW1lbnQoJ2Vycm9yJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbmV4dChudWxsLCByZXN1bHQsIGN0eCk7XG5cbiAgICAgIC8vIHVwZGF0ZSB0aGUgY2FjaGUgd2l0aCB0aGUgbGF0ZXN0IHJlbmRlciBtYXJrdXAgKGlmIG5lZWRlZClcbiAgICAgIC8vIHJlcXVpcmVzIGEgcGlwZWxpbmUgZWxzZSB3ZSBjYW4gbm90IGNhY2hlIHBhZ2VzXG4gICAgICBpZihjdHgudXBkYXRlQ2FjaGUpIHtcbiAgICAgICAgY3R4LnVwZGF0ZUNhY2hlKHJlc3VsdCwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIGluc3RydW1lbnQuaW5jcmVtZW50KCdjYWNoZVVwZGF0ZUVycm9yJyk7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdDYW5ub3QgdXBkYXRlIGNhY2hlIGtleScsIGN0eC4kLmNhY2hlS2V5LCAnYmVjYXVzZTonLCBlcnIubWVzc2FnZSB8fCBlcnIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGluc3RydW1lbnQuaW5jcmVtZW50KCdjYWNoZVVwZGF0ZScpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgY29tcG9uZW50V2l0aENvbnRleHQ7XG5cbiAgICAvLyBnZXQgdGhlIHNlcmlhbGl6ZSBzdGF0ZSBpZiBjb21wb25lbnQgaGFzIGEgb25Sb3V0ZSBmdW5jdGlvblxuICAgIGlmIChjb21wb25lbnQuXyRjb25zdHJ1Y3Rpb24pIHtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgZnVuY3Rpb24gY2FjaGVIaXRGbihodG1sLCBjdHgsIGhlYWQpIHtcbiAgICAgICAgICBpbnN0cnVtZW50LmluY3JlbWVudCgnY2FjaGVIaXQnKTtcblxuICAgICAgICAgIC8vY29uc29sZS5kZWJ1ZygnQ2FjaGUgbGF5ZXI6IGNhY2hlSGl0Rm4gZXhpc3RpbmcgaGVhZFRhZ3MnLCBvcHRpb25zLmh0dHAuaGVhZFRhZ3MpXG4gICAgICAgICAgLy8gbWVyZ2UgaW4gY2FjaGVkIGhlYWRlciB0YWdzXG4gICAgICAgICAgaWYoaGVhZCkge1xuICAgICAgICAgICAgdmFyIHRhZywgaSwgbGVuID0gaGVhZC5sZW5ndGg7XG4gICAgICAgICAgICBmb3IoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICB0YWcgPSBoZWFkW2ldO1xuICAgICAgICAgICAgICBpZihvcHRpb25zLmh0dHAuaGVhZFRhZ3MuaW5kZXhPZih0YWcpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMuaHR0cC5oZWFkVGFncy5wdXNoKHRhZyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZXh0KG51bGwsIGh0bWwsIHt0b0pTT046ZnVuY3Rpb24oKSB7cmV0dXJuIGN0eDt9fSk7XG5cbiAgICAgICAgICAvLyB3ZSBkbyBub3Qgd2FudCB0byBzZW5kIDIgcmVzcG9uc2VzXG4gICAgICAgICAgLy8gc28gbm8gb3AgdGhlIG5leHQgY2FsbFxuICAgICAgICAgIG5leHQgPSB1dGlscy5ub29wO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY3JlYXRlIGEgcGlwZWxpbmUgdG8gcmVuZGVyIHRoZSBjb21wb25lbnQgYW5kIHRyYWNrIGl0cyBzdGF0ZS5cbiAgICAgICAgLy8gb3B0aW9ucy5jb250ZXh0IGlzIHRoZSBzZXJpYWxpemVkIGRhdGEgZnJvbSB0aGUgc2VydmVyXG4gICAgICAgIC8vIG9wdGlvbnMuaHR0cCBpcyBpc29tb3JwaGljIHJlcS9yZXMgdG9cbiAgICAgICAgdmFyIHBpcGUgPSBuZXcgcGlwZWxpbmUob3B0aW9ucy5jb250ZXh0LCBvcHRpb25zLmh0dHAsIG9wdGlvbnMuaXNvbGF0ZWRDb25maWcsIG9wdGlvbnMucmVxdWVzdENvbnRleHQsIG9wdGlvbnMubG9jYWxlcywgY2FjaGVIaXRGbik7XG5cbiAgICAgICAgLy8gdXBkYXRlIHRoZSBwaXBlIHByb3BzIGJlY2F1c2Ugd2UgZ290IHRoZW0gaW4gb3VyIG9wdGlvbnNcbiAgICAgICAgLy8gdGhlIHJvdXRlIGZ1bmN0aW9uIHNldHMgdGhpbmdzIGxpa2Ugb3JpZ2luYWxVcmwsIHBhcmFtcywgZXRjLlxuICAgICAgICAvLyBzbyB0aGUgX18kb25Sb3V0ZSBjYW4ga25vdyBhYm91dCB0aGUgcm91dGUgdGhhdCB3YXMgdHJpZ2dlcmVkXG4gICAgICAgIGlmKG9wdGlvbnMucHJvcHMpIHtcbiAgICAgICAgICBwaXBlLnNldFByb3BzKG9wdGlvbnMucHJvcHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgbWVzdXJlLm1hcmsoJ2NyZWF0ZV9waXBlbGluZScpO1xuXG4gICAgICAgIC8vIG5vdyBydW4gdGhlIHByZS1mbGlnaHQgY29kZSBiZWZvcmUgYXNraW5nIHJlYWN0IHRvIHJlbmRlclxuICAgICAgICAvLyB0aGlzIGFsbG93cyBmb3IgYXN5bmMgY29kZSB0byBiZSBleGVjdXRlZCBhbmQgdHJhY2tzIGFueVxuICAgICAgICAvLyBkYXRhIHRoYXQgbmVlZHMgdG8gZ2V0IHNlcmlhbGl6ZWQgdG8gdGhlIGNsaWVudC5cbiAgICAgICAgY29tcG9uZW50Ll8kY29uc3RydWN0aW9uLmNhbGwocGlwZSwge30sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICBtZXN1cmUubWFyaygnY29tcG9uZW50X2NvbnN0cnVjdGlvbicpO1xuXG4gICAgICAgICAgaWYoZXJyKSB7XG4gICAgICAgICAgICBpbnN0cnVtZW50LmluY3JlbWVudCgnZXJyJyk7XG4gICAgICAgICAgICByZXR1cm4gbmV4dChlcnIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIHdhaXQgYSB0aWNrIHNvIGFsbCBrZWZpciBlbWl0IGdldCBwcm9jZXNzZWQgZm9yIHRoZVxuICAgICAgICAgIC8vIHBpcGUgc2VyaWFsaXphdGlvbi5cbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAvLyBzdG9wIHJlbmRlcmluZyBpZiBhYm9ydGVkIG9yXG4gICAgICAgICAgICAvLyB0aGUgY2FjaGUgaXMgdXAgdG8gZGF0ZVxuICAgICAgICAgICAgdmFyIHJlbmRlckFjdGlvbiA9IHBpcGUuaXNSZW5kZXJSZXF1aXJlZCgpO1xuICAgICAgICAgICAgaWYgKHJlbmRlckFjdGlvbiAhPT0gcGlwZS5SRU5ERVJfTkVFREVEKSB7XG4gICAgICAgICAgICAgIHBpcGUucmVsZWFzZSgpO1xuICAgICAgICAgICAgICBtZXN1cmUubWFyaygncmVsZWFzZScpO1xuXG4gICAgICAgICAgICAgIGlmIChyZW5kZXJBY3Rpb24gPT09IHRoaXMuUkVOREVSX0FCT1JUKSB7XG4gICAgICAgICAgICAgICAgaW5zdHJ1bWVudC5pbmNyZW1lbnQoJ2Fib3J0Jyk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAocmVuZGVyQWN0aW9uID09PSB0aGlzLlJFTkRFUl9OT19DSEFOR0UpIHtcbiAgICAgICAgICAgICAgICBpbnN0cnVtZW50LmluY3JlbWVudCgnY2FjaGVBYm9ydCcpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgbmV4dChudWxsLCBudWxsLCBwaXBlKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBtYWtlIHN1cmUgdGhlIHJlYWN0IGNvbnRleHQgaGFzIGxvY2FsZXMgdG8gcGljayB0aGVcbiAgICAgICAgICAgIC8vIHJlbmRlcmVkIGxhbmd1YWdlLiBUaGVuIHJlbmRlciB0aGUgZWxlbWVudCB3aXRoIHRoZVxuICAgICAgICAgICAgLy8gcHJvcHMgZnJvbSB0aGUgX18kb25Sb3V0ZS5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGNvbXBvbmVudFdpdGhDb250ZXh0ID0gcmVhY3Qud2l0aENvbnRleHQoe1xuICAgICAgICAgICAgICAgIHJvb3RJc29sYXRvcjogbmV3IGlzb2xhdG9yKG51bGwsIG51bGwsIG51bGwsIHBpcGUucm9vdElzb2xhdG9yLmlzb2xhdGVkQ29uZmlnKSxcbiAgICAgICAgICAgICAgICByZXF1ZXN0Q29udGV4dDogb3B0aW9ucy5yZXF1ZXN0Q29udGV4dCxcbiAgICAgICAgICAgICAgICBsb2NhbGVzOiBvcHRpb25zLmxvY2FsZXNcbiAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KGNvbXBvbmVudCwgcGlwZS5wcm9wcyk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgICAgbmV4dChleCk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbWVzdXJlLm1hcmsoJ3JlYWN0X2NvbnRleHQnKTtcblxuICAgICAgICAgICAgcGlwZS5yZWxlYXNlKCk7XG4gICAgICAgICAgICBtZXN1cmUubWFyaygncmVsZWFzZScpO1xuICAgICAgICAgICAgcmVuZGVyUmVhY3RDb21wb25lbnQoY29tcG9uZW50V2l0aENvbnRleHQsIHBpcGUpO1xuICAgICAgICAgIH0sIDApO1xuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2goZXgpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gdHJ5aW5nIHRvIHJlbmRlciBjb21wb25lbnQgYmVjYXVzZTonLCBleC5tZXNzYWdlKTtcblxuICAgICAgICBwaXBlLnJlbGVhc2UoKTtcbiAgICAgICAgbmV4dChleCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgY29tcG9uZW50V2l0aENvbnRleHQgPSByZWFjdC53aXRoQ29udGV4dCh7XG4gICAgICAgICAgcm9vdElzb2xhdG9yOiBuZXcgaXNvbGF0b3IobnVsbCwgbnVsbCwgbnVsbCwgb3B0aW9ucy5pc29sYXRlZENvbmZpZyksXG4gICAgICAgICAgcmVxdWVzdENvbnRleHQ6IG9wdGlvbnMucmVxdWVzdENvbnRleHQsXG4gICAgICAgICAgbG9jYWxlczogb3B0aW9ucy5sb2NhbGVzXG4gICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgcHJvcHM7XG5cbiAgICAgICAgICBpZihvcHRpb25zLmNvbnRleHQgJiYgb3B0aW9ucy5jb250ZXh0LnByb3BzKSB7XG4gICAgICAgICAgICBpZihvcHRpb25zLnByb3BzKSB7XG4gICAgICAgICAgICAgIHByb3BzID0ge307XG4gICAgICAgICAgICAgIHV0aWxzLm9iamVjdFVuaW9uKFtvcHRpb25zLmNvbnRleHQucHJvcHMsIG9wdGlvbnMucHJvcHNdLCBwcm9wcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBwcm9wcyA9IG9wdGlvbnMuY29udGV4dC5wcm9wcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYob3B0aW9ucy5wcm9wcykge1xuICAgICAgICAgICAgcHJvcHMgPSBvcHRpb25zLnByb3BzO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KGNvbXBvbmVudCwgcHJvcHMpO1xuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2goZXgpIHtcbiAgICAgICAgbmV4dChleCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgcmVuZGVyUmVhY3RDb21wb25lbnQoY29tcG9uZW50V2l0aENvbnRleHQsIHtcbiAgICAgICAgdG9KU09OOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgcmVxdWVzdENvbnRleHQ6IG9wdGlvbnMucmVxdWVzdENvbnRleHQsXG4gICAgICAgICAgICAgIHByb3BzOiBudWxsLFxuICAgICAgICAgICAgICBjb29yZGluYXRvclN0YXRlOiBudWxsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGNhdGNoKGV4KSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiQ2Fubm90IHNlcmlhbGl6ZSBpc29tb3JwaGljIGNvbnRleHQgYmVjYXVzZTpcIiwgZXgubWVzc2FnZSk7XG4gICAgICAgICAgICB0aHJvdyBleDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogL3Vzci9sb2NhbC9saWIvfi9wZWxsZXQvc3JjL3JlbmRlci5qc1xuICoqIG1vZHVsZSBpZCA9IDIzXG4gKiogbW9kdWxlIGNodW5rcyA9IDJcbiAqKi8iLCJ2YXIgYnJvd3NlckNvb2tpZTtcbmlmKHByb2Nlc3MuZW52LkJST1dTRVJfRU5WKSB7XG4gIGJyb3dzZXJDb29raWUgPSByZXF1aXJlKCcuL2Nvb2tpZScpO1xufVxuXG4vKipcbiAqIElzb21vcnBoaWMgaHR0cCB1c2VkIGJ5IGJvdGggc2VydmVyIGFuZCBicm93c2VyLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHJlcXVlc3RcbiAqIEBwYXJhbSByZXNwb3NlXG4gKiBAcGFyYW0gbmV4dFxuICovXG5mdW5jdGlvbiBpc29tb3JwaGljSHR0cCAocmVxdWVzdCwgcmVzcG9zZSwgbmV4dCkge1xuICB0aGlzLnJlcXVlc3QgPSByZXF1ZXN0O1xuICB0aGlzLnJlc3Bvc2UgPSByZXNwb3NlO1xuICB0aGlzLm5leHQgPSBuZXh0O1xuXG4gIHRoaXMuaGVhZFRhZ3MgPSBbXTtcbn1cblxuaXNvbW9ycGhpY0h0dHAucHJvdG90eXBlID0ge1xuICAvKipcbiAgICogU2V0IHRoZSBodHRwIHN0YXR1cyBjb2RlLlxuICAgKlxuICAgKiBUaGlzIG9ubHkgaGFzIGFuIGVmZmVjdCBvbiB0aGUgc2VydmVyLlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gY29kZVxuICAgKi9cbiAgc3RhdHVzOiBmdW5jdGlvbihjb2RlKSB7XG4gICAgaWYocHJvY2Vzcy5lbnYuQlJPV1NFUl9FTlYpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBpZiBleHByZXNzanMgb3Igbm9kZWpzXG4gICAgaWYodGhpcy5yZXNwb3NlLnN0YXR1cykge1xuICAgICAgdGhpcy5yZXNwb3NlLnN0YXR1cyhjb2RlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZXNwb3NlLnN0YXR1c0NvZGUgPSBjb2RlO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQWRkcyBhIGhlYWRlciB0byB0aGUgaHR0cCByZXNwb25zZS5cbiAgICpcbiAgICogVGhpcyBvbmx5IGhhcyBhbiBlZmZlY3Qgb24gdGhlIHNlcnZlci5cbiAgICpcbiAgICogQHBhcmFtIGZpZWxkXG4gICAqIEBwYXJhbSB2YWxcbiAgICogQHJldHVybnMgeyp9XG4gICAqL1xuICBoZWFkZXJzOiBmdW5jdGlvbihmaWVsZCwgdmFsKSB7XG4gICAgaWYocHJvY2Vzcy5lbnYuQlJPV1NFUl9FTlYpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoMiA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgIHZhbCA9IHZhbC5tYXAoU3RyaW5nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbCA9IFN0cmluZyh2YWwpO1xuICAgICAgfVxuXG4gICAgICAvLyBzZXRIZWFkZXIgPSByZXMuc2V0ID8gaHR0cC5PdXRnb2luZ01lc3NhZ2UucHJvdG90eXBlLnNldEhlYWRlciA6IHJlcy5zZXRIZWFkZXJcbiAgICAgIHRoaXMucmVzcG9zZS5zZXRIZWFkZXIoZmllbGQsIHZhbCk7XG4gICAgfSBlbHNlIGlmKHR5cGVvZiBmaWVsZCA9PT0gJ29iamVjdCcpe1xuICAgICAgZm9yICh2YXIga2V5IGluIGZpZWxkKSB7XG4gICAgICAgIHRoaXMuc2V0KGtleSwgZmllbGRba2V5XSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnJlcXVlc3QuaGVhZGVyc1tmaWVsZF07XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBTZXQgX0NvbnRlbnQtVHlwZV8gcmVzcG9uc2UgaGVhZGVyIHdpdGggYHR5cGVgIHRocm91Z2ggYG1pbWUubG9va3VwKClgXG4gICAqIHdoZW4gaXQgZG9lcyBub3QgY29udGFpbiBcIi9cIiwgb3Igc2V0IHRoZSBDb250ZW50LVR5cGUgdG8gYHR5cGVgIG90aGVyd2lzZS5cbiAgICpcbiAgICogVGhpcyBvbmx5IGhhcyBhbiBlZmZlY3Qgb24gdGhlIHNlcnZlci5cbiAgICpcbiAgICogRXhhbXBsZXM6XG4gICAqXG4gICAqICAgICBodHRwLnR5cGUoJy5odG1sJyk7XG4gICAqICAgICBodHRwLnR5cGUoJ2h0bWwnKTtcbiAgICogICAgIGh0dHAudHlwZSgnanNvbicpO1xuICAgKiAgICAgaHR0cC50eXBlKCdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAqICAgICBodHRwLnR5cGUoJ3BuZycpO1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICAgKi9cbiAgdHlwZTogZnVuY3Rpb24odHlwZSkge1xuICAgIGlmKHByb2Nlc3MuZW52LkJST1dTRVJfRU5WKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5yZXNwb3NlLnR5cGUodHlwZSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlZGlyZWN0IHRvIHRoZSBnaXZlbiBgdXJsYCB3aXRoIG9wdGlvbmFsIHJlc3BvbnNlIGBzdGF0dXNgXG4gICAqIGRlZmF1bHRpbmcgdG8gMzAyLlxuICAgKlxuICAgKiBUaGlzIG9ubHkgaGFzIGFuIGVmZmVjdCBvbiB0aGUgc2VydmVyLlxuICAgKlxuICAgKiBUaGUgcmVzdWx0aW5nIGB1cmxgIGlzIGRldGVybWluZWQgYnkgYHJlcy5sb2NhdGlvbigpYCwgc29cbiAgICogaXQgd2lsbCBwbGF5IG5pY2VseSB3aXRoIG1vdW50ZWQgYXBwcywgcmVsYXRpdmUgcGF0aHMsXG4gICAqIGBcImJhY2tcImAgZXRjLlxuICAgKlxuICAgKiBFeGFtcGxlczpcbiAgICpcbiAgICogICAgIGh0dHAucmVkaXJlY3QoJy9mb28vYmFyJyk7XG4gICAqICAgICBodHRwLnJlZGlyZWN0KCdodHRwOi8vZXhhbXBsZS5jb20nKTtcbiAgICogICAgIGh0dHAucmVkaXJlY3QoMzAxLCAnaHR0cDovL2V4YW1wbGUuY29tJyk7XG4gICAqICAgICBodHRwLnJlZGlyZWN0KCcuLi9sb2dpbicpOyAvLyAvYmxvZy9wb3N0LzEgLT4gL2Jsb2cvbG9naW5cbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtzdGF0dXNdXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgICovXG4gIHJlZGlyZWN0OiBmdW5jdGlvbihzdGF0dXMsIHVybCkge1xuICAgIGlmKHByb2Nlc3MuZW52LkJST1dTRVJfRU5WKSB7XG4gICAgICAvLyB0b2RvOiBsb29rIGF0IHJlZGlyZWN0IGxvZ2ljIGFuZCByZWRpcmVjdCB1c2luZyBoaXN0b3J5LnB1c2hcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyB0b2RvOiBJIG5lZWQgdG8gbWFrZSB0aGlzIGEgbm9kZWpzIHZlcnNpb24gbm90IGV4cHJlc3NcbiAgICB0aGlzLnJlc3Bvc2UucmVkaXJlY3QuYXBwbHkodGhpcy5yZXNwb3NlLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApKTtcbiAgfSxcblxuICAvKipcbiAgICogQWRkIHRvIHRoZSBoZWFkZXIuXG4gICAqXG4gICAqIE9wdGlvbnM6XG4gICAqICAqIG1ldGFcbiAgICogICogbGlua1xuICAgKiAgKiB0aXRsZVxuICAgKlxuICAgKiBAcGFyYW0gdHlwZVxuICAgKiBAcGFyYW0gZmllbGRzXG4gICAqL1xuICBhZGRUb0hlYWQ6IGZ1bmN0aW9uKHR5cGUsIGZpZWxkcykge1xuICAgIGlmKHByb2Nlc3MuZW52LkJST1dTRVJfRU5WKSB7XG4gICAgICBpZih0eXBlID09ICd0aXRsZScpIHtcbiAgICAgICAgZG9jdW1lbnQudGl0bGUgPSBmaWVsZHM7XG4gICAgICB9XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgbmV3TGluZTtcblxuICAgIHN3aXRjaCh0eXBlKSB7XG4gICAgICBjYXNlICdtZXRhJzpcbiAgICAgICAgbmV3TGluZSA9IFsnPG1ldGEnXTtcblxuICAgICAgICBpZiAoZmllbGRzLm5hbWUpIHtcbiAgICAgICAgICBuZXdMaW5lLnB1c2goJ25hbWU9XCInICsgZmllbGRzLm5hbWUgKyAnXCInKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmaWVsZHMucHJvcGVydHkpIHtcbiAgICAgICAgICBuZXdMaW5lLnB1c2goJ3Byb3BlcnR5PVwiJyArIGZpZWxkcy5wcm9wZXJ0eSArICdcIicpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZpZWxkcy5jaGFyc2V0KSB7XG4gICAgICAgICAgbmV3TGluZS5wdXNoKCdjaGFyc2V0PVwiJyArIGZpZWxkcy5jaGFyc2V0ICsgJ1wiJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZmllbGRzLmNvbnRlbnQpIHtcbiAgICAgICAgICBuZXdMaW5lLnB1c2goJ2NvbnRlbnQ9XCInICsgZmllbGRzLmNvbnRlbnQgKyAnXCInKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmaWVsZHMuaHR0cEVxdWl2KSB7XG4gICAgICAgICAgbmV3TGluZS5wdXNoKCdodHRwLWVxdWl2PVwiJyArIGZpZWxkcy5odHRwRXF1aXYgKyAnXCInKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmaWVsZHNbJ2h0dHAtZXF1aXYnXSkge1xuICAgICAgICAgIG5ld0xpbmUucHVzaCgnaHR0cC1lcXVpdj1cIicgKyBmaWVsZHNbJ2h0dHAtZXF1aXYnXSArICdcIicpO1xuICAgICAgICB9XG5cbiAgICAgICAgbmV3TGluZSA9IG5ld0xpbmUuam9pbignICcpICsgJz4nO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2xpbmsnOlxuICAgICAgICBuZXdMaW5lID0gWyc8bGluayddO1xuXG4gICAgICAgIGlmIChmaWVsZHMuaHJlZikge1xuICAgICAgICAgIG5ld0xpbmUucHVzaCgnaHJlZj1cIicgKyBmaWVsZHMuaHJlZiArICdcIicpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZpZWxkcy5jaGFyc2V0KSB7XG4gICAgICAgICAgbmV3TGluZS5wdXNoKCdjaGFyc2V0PVwiJyArIGZpZWxkcy5jaGFyc2V0ICsgJ1wiJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZmllbGRzLmhyZWZsYW5nKSB7XG4gICAgICAgICAgbmV3TGluZS5wdXNoKCdocmVmbGFuZz1cIicgKyBmaWVsZHMuaHJlZmxhbmcgKyAnXCInKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmaWVsZHMubWVkaWEpIHtcbiAgICAgICAgICBuZXdMaW5lLnB1c2goJ21lZGlhPVwiJyArIGZpZWxkcy5tZWRpYSArICdcIicpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZpZWxkcy5yZXYpIHtcbiAgICAgICAgICBuZXdMaW5lLnB1c2goJ3Jldj1cIicgKyBmaWVsZHMucmV2ICsgJ1wiJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZmllbGRzLnJlbCkge1xuICAgICAgICAgIG5ld0xpbmUucHVzaCgncmVsPVwiJyArIGZpZWxkcy5yZWwgKyAnXCInKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmaWVsZHMuc2l6ZXMpIHtcbiAgICAgICAgICBuZXdMaW5lLnB1c2goJ3NpemVzPVwiJyArIGZpZWxkcy5zaXplcyArICdcIicpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZpZWxkcy50eXBlKSB7XG4gICAgICAgICAgbmV3TGluZS5wdXNoKCd0eXBlPVwiJyArIHR5cGUgKyAnXCInKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmaWVsZHMudGFyZ2V0KSB7XG4gICAgICAgICAgbmV3TGluZS5wdXNoKCd0YXJnZXQ9XCInICsgdGFyZ2V0ICsgJ1wiJyk7XG4gICAgICAgIH1cblxuICAgICAgICBuZXdMaW5lID0gbmV3TGluZS5qb2luKCcgJykgKyAnPic7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndGl0bGUnOlxuICAgICAgICBuZXdMaW5lID0gJzx0aXRsZT4nICsgZmllbGRzICsgJzwvdGl0bGU+JztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdzY3JpcHQnOlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VzZSB0aGUgYWRkU2NyaXB0IGZ1bmN0aW9uJyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnc3R5bGUnOlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VzZSB0aGUgYWRkU3R5bGUgZnVuY3Rpb24nKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gaGVhZCB0YWcgJyArIHR5cGUpO1xuICAgIH1cblxuICAgIHRoaXMuaGVhZFRhZ3MucHVzaChuZXdMaW5lKTtcbiAgfSxcblxuICAvKipcbiAgICpcbiAgICogQHBhcmFtIG5hbWVcbiAgICogQHBhcmFtIHZhbHVlXG4gICAqIEBwYXJhbSBvcHRpb25zXG4gICAqICAgcGF0aFxuICAgKiAgIGRvbWFpblxuICAgKiAgIGV4cGlyZXNcbiAgICogICBzZWN1cmVcbiAgICogICAgIHNlcnZlciBzaWRlIG9ubHlcbiAgICogICBodHRwT25seVxuICAgKiAgIG1heEFnZVxuICAgKlxuICAgKiBAcmV0dXJucyB7Kn1cbiAgICovXG4gIGNvb2tpZTogZnVuY3Rpb24obmFtZSwgdmFsdWUsIG9wdGlvbnMpIHtcbiAgICBpZih0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBvcHRpb25zID09PSAndW5kZWZpbmVkJykge1xuICAgICAgaWYocHJvY2Vzcy5lbnYuQlJPV1NFUl9FTlYpIHtcbiAgICAgICAgcmV0dXJuIGJyb3dzZXJDb29raWUuZ2V0KG5hbWUpO1xuICAgICAgfSBlbHNlIGlmKHByb2Nlc3MuZW52LlNFUlZFUl9FTlYpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVxdWVzdC5jb29raWVzICYmIHRoaXMucmVxdWVzdC5jb29raWVzW25hbWVdO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZihwcm9jZXNzLmVudi5CUk9XU0VSX0VOVikge1xuICAgICAgICBpZihvcHRpb25zICYmIChvcHRpb25zLmh0dHBPbmx5IHx8IG9wdGlvbnMubWF4QWdlKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2FuIG5vdCBzZXQgaHR0cE9ubHkgb3IgbWF4QWdlIG9uIHRoZSBicm93c2VyJyk7XG4gICAgICAgIH1cblxuICAgICAgICBicm93c2VyQ29va2llLnNldChuYW1lLCB2YWx1ZSwgb3B0aW9ucyk7XG4gICAgICB9IGVsc2UgaWYocHJvY2Vzcy5lbnYuU0VSVkVSX0VOVikge1xuICAgICAgICB0aGlzLnJlc3Bvc2UuY29va2llKG5hbWUsIHZhbHVlLCBvcHRpb25zKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gaXNvbW9ycGhpY0h0dHA7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC91c3IvbG9jYWwvbGliL34vcGVsbGV0L3NyYy9pc29tb3JwaGljL2h0dHAuanNcbiAqKiBtb2R1bGUgaWQgPSAyNFxuICoqIG1vZHVsZSBjaHVua3MgPSAyXG4gKiovIiwidmFyIHBhdGhUb1JlZ2V4cCA9IHJlcXVpcmUoJ3BhdGgtdG8tcmVnZXhwJylcbiAgLCBxdWVyeXN0cmluZyA9IHJlcXVpcmUoJ3F1ZXJ5c3RyaW5nJyk7XG5cbmZ1bmN0aW9uIHJvdXRlcihvcHRpb25zKSB7XG4gIHRoaXMucm91dGVzID0gW107XG5cbiAgdGhpcy5kZWZhdWx0cyA9IHtcbiAgICBzZW5zaXRpdmU6ICEhKG9wdGlvbnMgJiYgb3B0aW9ucy5zZW5zaXRpdmUgfHwgZmFsc2UpLFxuICAgIHN0cmljdDogISEob3B0aW9ucyAmJiBvcHRpb25zLnN0cmljdCB8fCBmYWxzZSksXG4gICAgZW5kOiB0cnVlLFxuICAgIHJhbms6IDBcbiAgfTtcblxuICBpZihvcHRpb25zICYmIHR5cGVvZiBvcHRpb25zLmVuZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB0aGlzLmRlZmF1bHRzLmVuZCA9ICEhb3B0aW9ucy5lbmQ7XG4gIH1cbn1cblxucm91dGVyLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihwYXR0ZXJuLCBmbiwgb3B0aW9ucykge1xuICB2YXIga2V5O1xuXG4gIGlmKCFmbikge1xuICAgIHRocm93IG5ldyBFcnJvcignY2FsbGJhY2sgZm4gaXMgcmVxdWlyZWQuJylcbiAgfVxuXG4gIC8vIGJ1aWxkIHVwIHRoZSBvcHRpb25zIHVzaW5nIG91ciBkZWZhdWx0cyBhbmQgb3ZlcnJpZGVzXG4gIHZhciBwcml2YXRlT3B0aW9ucyA9IE9iamVjdC5jcmVhdGUodGhpcy5kZWZhdWx0cyk7XG4gIGlmKG9wdGlvbnMpIHtcbiAgICBpZih0eXBlb2Yob3B0aW9ucy5zZW5zaXRpdmUpICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgcHJpdmF0ZU9wdGlvbnMuc2Vuc2l0aXZlID0gISFvcHRpb25zLnNlbnNpdGl2ZTtcbiAgICB9XG5cbiAgICBpZih0eXBlb2Yob3B0aW9ucy5zdHJpY3QpICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgcHJpdmF0ZU9wdGlvbnMuc3RyaWN0ID0gISFvcHRpb25zLnN0cmljdDtcbiAgICB9XG5cbiAgICBpZih0eXBlb2Yob3B0aW9ucy5lbmQpICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgcHJpdmF0ZU9wdGlvbnMuZW5kID0gISFvcHRpb25zLmVuZDtcbiAgICB9XG5cbiAgICBpZih0eXBlb2Yob3B0aW9ucy5yYW5rKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHByaXZhdGVPcHRpb25zLnJhbmsgPSBwYXJzZUludChvcHRpb25zLnJhbmssIDEwKTtcbiAgICB9XG4gIH1cblxuICAvLyBidWlsZCBhIHVuaXF1ZSBrZXkgdG8gaWRlbnRpZnkgdGhlIHJvdXRlIGlnbm9yaW5nIG5hbWVkIHBhcmFtZXRlcnNcbiAgaWYodHlwZW9mIHBhdHRlcm4gPT09ICdzdHJpbmcnKSB7XG4gICAga2V5ID0gcGF0dGVybi5yZXBsYWNlKC86W15cXD9cXCpcXC9dKy9nLCdfJykucmVwbGFjZSgvXyhbXFwqXFw/XSkvZywnJDEnKTtcbiAgfSBlbHNlIGlmKHBhdHRlcm4gaW5zdGFuY2VvZiBBcnJheSkge1xuICAgIGtleSA9IEpTT04uc3RyaW5naWZ5KHBhdHRlcm4pLnJlcGxhY2UoL1tcXFtcXF1cIlxcLF0vZywnJyk7XG4gIH0gZWxzZSBpZihwYXR0ZXJuIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAga2V5ID0gcGF0dGVybi50b1N0cmluZygpO1xuICB9XG5cbiAgdmFyIHJvdXRlO1xuXG4gIC8vIGxvb2tpbmcgZm9yIGR1cGxpY2F0ZSByb3V0ZXNcbiAgZm9yKHZhciBpIGluIHRoaXMucm91dGVzKSB7XG4gICAgaWYodGhpcy5yb3V0ZXNbaV0ua2V5ID09PSBrZXkpIHtcbiAgICAgIGlmKHRoaXMucm91dGVzW2ldLnJhbmsgPj0gcHJpdmF0ZU9wdGlvbnMucmFuaykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByb3V0ZSA9IHRoaXMucm91dGVzW2ldID0gcGF0aFRvUmVnZXhwKHBhdHRlcm4sIFtdLCBwcml2YXRlT3B0aW9ucyk7XG4gICAgICAgIHJvdXRlLmtleSA9IGtleTtcbiAgICAgICAgcm91dGUucmFuayA9IHByaXZhdGVPcHRpb25zLnJhbms7XG4gICAgICAgIHJvdXRlLmZuID0gZm47XG4gICAgICAgIHJldHVybiBrZXk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcm91dGUgPSBwYXRoVG9SZWdleHAocGF0dGVybiwgW10sIHByaXZhdGVPcHRpb25zKTtcbiAgcm91dGUua2V5ID0ga2V5O1xuICByb3V0ZS5yYW5rID0gcHJpdmF0ZU9wdGlvbnMucmFuaztcbiAgcm91dGUuZm4gPSBmbjtcblxuICB0aGlzLnJvdXRlcy5wdXNoKHJvdXRlKTtcblxuICAvLyB0b2RvOiBzb3J0IHRoZSByb3V0ZXMgYnkga2V5IGFuZCBvcmRlciBzbyBtb3N0IHNwZWNpZmljIHJvdXRlIGFyZSBmaXJzdCBpLmUuIC9mb28vZGVtaSAtPiAvZm9vLzpuYW1lIC0+IC9mb28vOnBhdGgqXG4gIHRoaXMucm91dGVzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBiLnJhbmsgLSBhLnJhbms7XG4gIH0pO1xuXG4gIHJldHVybiBrZXk7XG59O1xuXG5yb3V0ZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oZnVsbHBhdGgpIHtcbiAgdmFyIGksIHBhdGgsIHJlc3VsdCwgcm91dGUsIHF1ZXJ5O1xuXG4gIHF1ZXJ5ID0gZnVsbHBhdGguaW5kZXhPZignPycpO1xuICBpZihxdWVyeSAhPT0gLTEpIHtcbiAgICBwYXRoID0gZnVsbHBhdGguc3Vic3RyaW5nKDAsIHF1ZXJ5KTtcbiAgICBxdWVyeSA9IHF1ZXJ5c3RyaW5nLnBhcnNlKGZ1bGxwYXRoLnN1YnN0cmluZyhxdWVyeSArIDEpKTtcbiAgfSBlbHNlIHtcbiAgICBwYXRoID0gZnVsbHBhdGg7XG4gIH1cblxuICBmb3IoaSBpbiB0aGlzLnJvdXRlcykge1xuICAgIHJvdXRlID0gdGhpcy5yb3V0ZXNbaV07XG4gICAgcmVzdWx0ID0gcm91dGUuZXhlYyhwYXRoKTtcblxuICAgIGlmKHJlc3VsdCkge1xuICAgICAgcmVzdWx0LnNoaWZ0KCk7XG5cbiAgICAgIHZhciBkZXRhaWxzID0ge1xuICAgICAgICBmbjogcm91dGUuZm4sXG4gICAgICAgIHVybDogcGF0aCxcbiAgICAgICAgb3JpZ2luYWxVcmw6IGZ1bGxwYXRoLFxuICAgICAgICBxdWVyeTogcXVlcnkgIT09IC0xID8gcXVlcnkgOiBudWxsLFxuICAgICAgICBwYXJhbXM6IHJvdXRlLmtleXMubGVuZ3RoID8ge30gOiBudWxsXG4gICAgICB9O1xuXG4gICAgICBmb3IoaSBpbiByb3V0ZS5rZXlzKSB7XG4gICAgICAgIGRldGFpbHMucGFyYW1zW3JvdXRlLmtleXNbaV0ubmFtZV0gPSByZXN1bHQuc2hpZnQoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRldGFpbHM7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSByb3V0ZXI7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC91c3IvbG9jYWwvbGliL34vcGVsbGV0L3NyYy9yb3V0ZS10YWJsZS5qc1xuICoqIG1vZHVsZSBpZCA9IDI1XG4gKiogbW9kdWxlIGNodW5rcyA9IDJcbiAqKi8iLCJ2YXIgcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpXG4gICwgY3ggPSByZWFjdC5hZGRvbnMuY2xhc3NTZXRcbiAgLCBwZWxsZXQgPSByZXF1aXJlKCdwZWxsZXQnKTtcblxudmFyIHNwZWMgPSB7XG4gIHZhbHVlOiByZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuICBpbmRleDogcmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgZnV6enk6IHJlYWN0LlByb3BUeXBlcy5ib29sZWFuLFxuICBtaXNzaW5nOiByZWFjdC5Qcm9wVHlwZXMuc3RyaW5nXG59O1xuXG52YXIgX2ludGw7XG5pZihwcm9jZXNzLmVudi5TRVJWRVJfRU5WKSB7XG4gIF9pbnRsID0gcmVxdWlyZSgnaW50bC9JbnRsLmNvbXBsZXRlLmpzJyk7XG4gIHJlcXVpcmUoJ2ludGwvbG9jYWxlLWRhdGEvY29tcGxldGUuanMnKTtcbn0gZWxzZSB7XG4gIF9pbnRsID0gd2luZG93LkludGw7XG59XG5cbmZ1bmN0aW9uIGdldFRyYW5zbGF0aW9uKGxvY2FsZXMsIHByb3BzKSB7XG5cbiAgdmFyIHZhbDtcblxuICB2YXIgc3RhdGUgPSB7XG4gICAgaGFzRXJyb3JzOiBmYWxzZSxcbiAgICBpc01pc3Npbmc6IHRydWUsXG4gICAgdHJhbnNsYXRpb246ICcnXG4gIH07XG5cbiAgLy8gc3VwcG9ydHMgY2FsbGluZyBwcm9wcyBhc1xuICAvLyAgZ2V0VHJhbnNsYXRpb24obG9jYWxlcywgeyBpbmRleDogc3RyaW5nVG9UcmFuc2xhdGUgfSlcbiAgLy8gb3JcbiAgLy8gIGdldFRyYW5zbGF0aW9uKGxvY2FsZXMsIHN0cmluZ1RvVHJhbnNsYXRlKVxuICBpZiAodHlwZW9mIHByb3BzID09PSBcInN0cmluZ1wiKSB7XG4gICAgcHJvcHMgPSB7XG4gICAgICBpbmRleDogcHJvcHNcbiAgICB9XG4gIH1cblxuICAvLyB0b2RvOiBtYWtlIGEgZnVuY3Rpb24gdGhhdCB3aWxsIHdhbGsgb3ZlciBhbGwgdGhlIGxvY2FsZXMgYW5kIHRyeSB0byBtYXRjaCB0aGVtIGkuZS4gdXMtZW4sIHVzLWJyLCB1c1xuXG4gIGlmKGxvY2FsZXMpIHtcbiAgICBpZihwZWxsZXQubG9jYWxlc1tsb2NhbGVzXSkge1xuICAgICAgaWYocHJvcHMuaW5kZXggJiYgKHZhbCA9IChwcm9wcy5mdXp6eSA/IHByb3BzLmluZGV4LnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvXFxXL2csICcnKTpwcm9wcy5pbmRleCkpICYmIHBlbGxldC5sb2NhbGVzW2xvY2FsZXNdW3ZhbF0pIHtcbiAgICAgICAgc3RhdGUuaXNNaXNzaW5nID0gZmFsc2U7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgc3RhdGUudHJhbnNsYXRpb24gPSBwZWxsZXQubG9jYWxlc1tsb2NhbGVzXVt2YWxdKHByb3BzKTtcbiAgICAgICAgfSBjYXRjaChleCkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Nhbm5vdCBnZXQgdHJhbnNsYXRpb24gYmVjYXVzZTonLCBleC5tZXNzYWdlKTtcbiAgICAgICAgICBzdGF0ZS50cmFuc2xhdGlvbiA9ICdbRVJST1I6JyArIGxvY2FsZXMgKyAnOicgKyB2YWwgKyAnXSc7XG4gICAgICAgICAgc3RhdGUuaGFzRXJyb3JzID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmKHByb3BzLnZhbHVlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYocHJvcHMuZnV6enkpIHtcbiAgICAgICAgICAgIHZhbCA9IHByb3BzLnZhbHVlLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvXFxXL2csICcnKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFsID0gcHJvcHMudmFsdWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYocGVsbGV0LmxvY2FsZXNbbG9jYWxlc11bdmFsXSkge1xuICAgICAgICAgICAgc3RhdGUudHJhbnNsYXRpb24gPSBwZWxsZXQubG9jYWxlc1tsb2NhbGVzXVt2YWxdKHByb3BzKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUudHJhbnNsYXRpb24gPSBwcm9wcy52YWx1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzdGF0ZS5pc01pc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgfSBjYXRjaChleCkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Nhbm5vdCBnZXQgdHJhbnNsYXRpb24gYmVjYXVzZTonLCBleC5tZXNzYWdlKTtcbiAgICAgICAgICBzdGF0ZS50cmFuc2xhdGlvbiA9ICdbRVJST1I6JyArIGxvY2FsZXMgKyAnOicgKyBwcm9wcy52YWx1ZSArICddJztcbiAgICAgICAgICBzdGF0ZS5oYXNFcnJvcnMgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdGF0ZS50cmFuc2xhdGlvbiA9IHByb3BzLm1pc3NpbmcgfHwgJ1tNSVNTSU5HOiBcIicgKyBwcm9wcy5pbmRleCArICdcIl0nO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzdGF0ZS50cmFuc2xhdGlvbiA9ICdbVU5LTk9XTiBMT0NBTEU6IFwiJyArIGxvY2FsZXMgKyAnXCJdJztcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgc3RhdGUudHJhbnNsYXRpb24gPSAnW0xPQ0FMRSBOT1QgU0VUXSc7XG4gIH1cblxuICBpZihwZWxsZXQuY29uZmlnLmludGxIaWRlRGVidWdNc2cgJiYgKHN0YXRlLmhhc0Vycm9ycyB8fCBzdGF0ZS5pc01pc3NpbmcpICYmIHN0YXRlLnRyYW5zbGF0aW9uWzBdPT0nWycpIHtcbiAgICBzdGF0ZS50cmFuc2xhdGlvbiA9IHByb3BzLm1pc3NpbmcgfHwgcHJvcHMudmFsdWUgfHwgcHJvcHMuaW5kZXg7XG4gIH1cblxuICBpZihwcm9wcy5odG1sRXNjYXBlKSB7XG4gICAgc3RhdGUudHJhbnNsYXRpb24gPSBzdGF0ZS50cmFuc2xhdGlvbi5yZXBsYWNlKC8mL2csICcmYW1wOycpXG4gICAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpXG4gICAgICAucmVwbGFjZSgvIy9nLCAnJiMzNTsnKVxuICAgICAgLnJlcGxhY2UoL1xcXFwvZywgJ1xcXFxcXFxcJylcbiAgICAgIC5yZXBsYWNlKC9cXG4vZywgJ1xcXFxuJyk7XG4gIH1cblxuICByZXR1cm4gc3RhdGU7XG59XG5cbi8qKlxuICogaGVscGVyIGZ1bmN0aW9uIHRvIGxvb2t1cCB0cmFuc2xhdGlvbiBpbiBwZWxsZXRcbiAqXG4gKiBAcGFyYW0gc2NvcGVcbiAqIEBwYXJhbSBvcHRpb25zXG4gKiBAcmV0dXJucyB7c3RyaW5nfCp8YnVpbGRNYW5pZmVzdE1hcC5zZXJ2ZXIudHJhbnNsYXRpb259XG4gKi9cbmZ1bmN0aW9uIF9nZXRMb2NhbGVzKHNjb3BlKSB7XG4gIHJldHVybiAoc2NvcGUuZ2V0TG9jYWxlcyAmJiBzY29wZS5nZXRMb2NhbGVzKCkpIHx8IHNjb3BlO1xufVxuXG5wZWxsZXQuaW50bCA9IGZ1bmN0aW9uKHNjb3BlLCBvcHRpb25zKSB7XG4gIHJldHVybiBnZXRUcmFuc2xhdGlvbihfZ2V0TG9jYWxlcyhzY29wZSksIG9wdGlvbnMpLnRyYW5zbGF0aW9uO1xufVxuXG5wZWxsZXQuaW50bC5mb3JtYXROdW1iZXIgPSBmdW5jdGlvbihzY29wZSwgbnVtYmVyLCBvcHRpb25zKSB7XG4gIHJldHVybiBfaW50bC5OdW1iZXJGb3JtYXQoX2dldExvY2FsZXMoc2NvcGUpLCBvcHRpb25zKS5mb3JtYXQobnVtYmVyKTtcbn1cblxucGVsbGV0LmludGwuZm9ybWF0RGF0ZVRpbWUgPSBmdW5jdGlvbihzY29wZSwgZGF0ZSwgb3B0aW9ucykge1xuICByZXR1cm4gX2ludGwuRGF0ZVRpbWVGb3JtYXQoX2dldExvY2FsZXMoc2NvcGUpLCBvcHRpb25zKS5mb3JtYXQoZGF0ZSk7XG59XG5cbnBlbGxldC5pbnRsLmxvYWQgPSBmdW5jdGlvbihsb2NhbGVzLCBuZXh0KSB7XG4gIGlmKHBlbGxldC5sb2NhbGVzW2xvY2FsZXNdKSB7XG4gICAgaWYobmV4dCkge1xuICAgICAgbmV4dCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuXG4gIHZhciBzcmMgPSAocGVsbGV0LmNvbmZpZy5qc01vdW50UG9pbnQgfHwgJy9qcy8nKSArIGxvY2FsZXMgKyAnLmpzJztcbiAgdmFyIGhlYWQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdO1xuICB2YXIgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gIHNjcmlwdC50eXBlID0gJ3RleHQvamF2YXNjcmlwdCc7XG4gIHNjcmlwdC5zcmMgPSBzcmM7XG5cbiAgaWYobmV4dCkge1xuICAgIHZhciBkb25lID0gZmFsc2U7XG4gICAgc2NyaXB0Lm9ubG9hZCA9IHNjcmlwdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmKCAhZG9uZSAmJiAoIXRoaXMucmVhZHlTdGF0ZSB8fCB0aGlzLnJlYWR5U3RhdGUgPT09IFwibG9hZGVkXCIgfHwgdGhpcy5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIpICkge1xuICAgICAgICBkb25lID0gdHJ1ZTtcbiAgICAgICAgbmV4dCgpO1xuXG4gICAgICAgIC8vIEhhbmRsZSBtZW1vcnkgbGVhayBpbiBJRVxuICAgICAgICBzY3JpcHQub25sb2FkID0gc2NyaXB0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IG51bGw7XG4gICAgICAgIGlmIChoZWFkICYmIHNjcmlwdC5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgaGVhZC5yZW1vdmVDaGlsZChzY3JpcHQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBwZWxsZXQuY3JlYXRlQ2xhc3Moe1xuICBwcm9wc1R5cGVzOiBzcGVjLFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgbG9jYWxlcyA9IHRoaXMuZ2V0TG9jYWxlcygpO1xuICAgIHZhciB0cmFuc2xhdGlvbiA9IGdldFRyYW5zbGF0aW9uKGxvY2FsZXMsIHRoaXMucHJvcHMpO1xuXG4gICAgaWYocHJvY2Vzcy5lbnYuQlJPV1NFUl9FTlYgJiYgdHJhbnNsYXRpb24uaXNNaXNzaW5nICYmICFwZWxsZXQubG9jYWxlc1tsb2NhbGVzXSAmJiAhcGVsbGV0LmxvY2FsZXNbJ18kJytsb2NhbGVzXSkge1xuICAgICAgY29uc29sZS5pbmZvKCdUcnkgdG8gbG9hZCBtaXNzaW5nIGxvY2FsZXM6JywgbG9jYWxlcyk7XG4gICAgICBwZWxsZXQubG9jYWxlc1snXyQnK2xvY2FsZXNdID0gdHJ1ZTtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIHBlbGxldC5pbnRsLmxvYWQobG9jYWxlcywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHdoaWxlKF90aGlzLl9vd25lcikge1xuICAgICAgICAgIF90aGlzID0gX3RoaXMuX293bmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgX3RoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8c3Bhbj48L3NwYW4+XG4gICAgICApO1xuICAgIH1cblxuICAgIHZhciBjbGFzc2VzID0gY3goe1xuICAgICAgJ3RyYW5zbGF0aW9uLW1pc3NpbmcnOiB0cmFuc2xhdGlvbi5pc01pc3NpbmcsXG4gICAgICAndHJhbnNsYXRpb24tZXJyb3InOiB0cmFuc2xhdGlvbi5oYXNFcnJvcnNcbiAgICB9KTtcblxuICAgIHJldHVybiAoXG4gICAgICA8c3BhbiBjbGFzc05hbWU9e2NsYXNzZXN9Pnt0cmFuc2xhdGlvbi50cmFuc2xhdGlvbn08L3NwYW4+XG4gICAgKTtcbiAgfVxufSk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAvdXNyL2xvY2FsL2xpYi9+L3BlbGxldC9zcmMvY29tcG9uZW50cy9pbnRlcm5hdGlvbmFsaXphdGlvbi9pbnRlcm5hdGlvbmFsaXphdGlvbi5qc3hcbiAqKi8iLCJSZWFjdCA9IHJlYWN0ID0gcmVxdWlyZShcInJlYWN0XCIpO1BlbGxldCA9IHBlbGxldCA9IHJlcXVpcmUoXCJwZWxsZXRcIik7bW9kdWxlLmV4cG9ydHM9ZnVuY3Rpb24oX18kdGhpcykge1xuICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XG4gICAgY2xhc3NOYW1lOiBcImFibkRhc2hib2FyZC1jb21wb25lbnRcIlxuICB9LCBfXyR0aGlzLnN0YXRlLm1lc3NhZ2UgPyBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICBjbGFzc05hbWU6IFwibWVzc2FnZVwiXG4gIH0sIF9fJHRoaXMuc3RhdGUubWVzc2FnZSkgOiBudWxsLCBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICBjbGFzc05hbWU6IFwibG9nb1wiXG4gIH0sIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIiwge1xuICAgIHNyYzogXCIvL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vUmViZWxpemVyL3BlbGxldC9tYXN0ZXIvZG9naG91c2UvcHVibGljL2Zhdmljb24uaWNvXCJcbiAgfSksIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJoMVwiLCBudWxsLCBcIlBlbGxldCBFeHBlcmltZW50c1wiKSksIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1xuICAgIGNsYXNzTmFtZTogXCJncmlkLWhcIlxuICB9LCBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICBjbGFzc05hbWU6IFwidGl0bGViYXIgcm93XCJcbiAgfSwgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge1xuICAgIGNsYXNzTmFtZTogXCJuYW1lXCJcbiAgfSwgXCJOQU1FXCIpLCBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCBudWxsLCBcIlVQREFURURcIiksIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtcbiAgICBjbGFzc05hbWU6IFwiYWN0aXZlXCJcbiAgfSwgXCJTUExJVFwiKSksIHBlbGxldC5leHBlcmltZW50LmV4cGVyaW1lbnRzID8gx4NtYXDvvL8ocGVsbGV0LmV4cGVyaW1lbnQuZXhwZXJpbWVudHMsIGZ1bmN0aW9uKGV4cGVyaW1lbnQsICRpbmRleCkge1xuICAgIHZhciBhY3RpdmVFeHA7XG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1xuICAgICAgY2xhc3NOYW1lOiBcImV4cGVyaW1lbnRcIlxuICAgIH0sIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1xuICAgICAgb25DbGljazogX18kdGhpcy5zaG93RXhwZXJpbWVudC5iaW5kKF9fJHRoaXMsIGV4cGVyaW1lbnQuZGF0YS5pZCksXG4gICAgICBjbGFzc05hbWU6IFwicm93IGhvdmVyXCJcbiAgICB9LCBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7XG4gICAgICBjbGFzc05hbWU6IFwibmFtZVwiXG4gICAgfSwgZXhwZXJpbWVudC5kYXRhLmlkKSwgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwgbnVsbCwgZXhwZXJpbWVudC5kYXRhLnVwZGF0ZWQgJiYgcGVsbGV0LmludGwuZm9ybWF0RGF0ZVRpbWUoX18kdGhpcywgbmV3IERhdGUoZXhwZXJpbWVudC5kYXRhLnVwZGF0ZWQpKSksIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtcbiAgICAgIGNsYXNzTmFtZTogXCJhY3RpdmVcIlxuICAgIH0sIDEwMCAqIGV4cGVyaW1lbnQuZGF0YS5wYXJ0aWNpcGF0aW9uICsgXCIlXCIpKSwgZXhwZXJpbWVudC5kYXRhLmlkID09IF9fJHRoaXMuc3RhdGUuYWN0aXZlRXhwZXJpbWVudCA/IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1xuICAgICAgY2xhc3NOYW1lOiBcImRldGFpbHNcIlxuICAgIH0sIChhY3RpdmVFeHAgPSBjeEFwaS5nZXRDaG9zZW5WYXJpYXRpb24oZXhwZXJpbWVudC5kYXRhLmlkKSwgx4NtYXDvvL8oZXhwZXJpbWVudC5kYXRhLml0ZW1zLCBmdW5jdGlvbihpdGVtLCAkaW5kZXgpIHtcbiAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICAgICAgY2xhc3NOYW1lOiBcImRldGFpbC1ibG9ja1wiXG4gICAgICB9LCBhY3RpdmVFeHAgIT0gaXRlbS5pZCA/IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJhXCIsIHtcbiAgICAgICAgb25DbGljazogX18kdGhpcy5zZXRWYXJpYXRpb24uYmluZChfXyR0aGlzLCBpdGVtLmlkKSxcbiAgICAgICAgY2xhc3NOYW1lOiBcIm1ha2UtYWN0aXZlXCJcbiAgICAgIH0sIFwibWFrZSBhY3RpdmVcIikgOiBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICAgICAgY2xhc3NOYW1lOiBcImFjdGl2ZS1leHBlcmltZW50XCJcbiAgICAgIH0sIFwiYWN0aXZlXCIpLCBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCBudWxsLCBcIlZhcmlhdGlvbiBcIiArIGl0ZW0uaWQgKyBcIiBpcyBcIiArIChpdGVtLmRpc2FibGVkID8gXCJkaXNhYmxlZFwiIDogXCJhY3RpdmVcIikgKyBcIiBhbmQgZ2V0dGluZyBcIiArIE1hdGguZmxvb3IoMWUzICogaXRlbS53ZWlnaHQpIC8gMTAgKyBcIiUgb2YgdHJhZmZpYy5cIiksIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJ1bFwiLCBudWxsLCDHg21hcO+8vyhwZWxsZXQuZXhwZXJpbWVudC5hbGxWYXJpYXRpb25zLCBmdW5jdGlvbihpbmZvLCBjb21wKSB7XG4gICAgICAgIHJldHVybiBpbmZvW2V4cGVyaW1lbnQuZGF0YS5pZF0gPyBcIj1cIiA9PSBjb21wWzBdID8gUmVhY3QuY3JlYXRlRWxlbWVudChcImxpXCIsIG51bGwsICdUaGUga2V5IFwiJyArIGNvbXAuc3Vic3RyaW5nKDEpICsgJ1wiIHdpbGwgYmUgXCInICsgaW5mb1tleHBlcmltZW50LmRhdGEuaWRdW3BhcnNlSW50KGl0ZW0uaWQpXSArICdcIicpIDogXCJAXCIgPT0gY29tcFswXSA/IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJsaVwiLCBudWxsLCBcIlRoZSBcIiArIGNvbXAuc3Vic3RyaW5nKDEpICsgJyBjb21wb25lbnQgd2lsbCB1c2UgXCInICsgaW5mb1tleHBlcmltZW50LmRhdGEuaWRdW3BhcnNlSW50KGl0ZW0uaWQpXSArICdcIiB2ZXJzaW9uJykgOiBSZWFjdC5jcmVhdGVFbGVtZW50KFwibGlcIiwgbnVsbCwgJ1wiJyArIGNvbXAgKyAnXCIgLT4gXCInICsgaW5mb1tleHBlcmltZW50LmRhdGEuaWRdW3BhcnNlSW50KGl0ZW0uaWQpXSArICdcIicpIDogbnVsbDtcbiAgICAgIH0pKSk7XG4gICAgfSkpKSA6IG51bGwpO1xuICB9KSA6IG51bGwsIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJwXCIsIG51bGwsIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJhXCIsIHtcbiAgICBocmVmOiBcImh0dHBzOi8vd3d3Lmdvb2dsZS5jb20vYW5hbHl0aWNzL3dlYi8/aGw9ZW4jcmVwb3J0L3NpdGVvcHQtZXhwZXJpbWVudHMvXCIsXG4gICAgdGFyZ2V0OiBcImdhXCJcbiAgfSwgXCJHb29nbGUgQW5hbHl0aWNzIEV4cGVyaW1lbnRzXCIpKSwgUmVhY3QuY3JlYXRlRWxlbWVudChcImgzXCIsIG51bGwsIFwiUGFydGljaXBhdGluZyBDb21wb25lbnRzXCIpLCBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICBjbGFzc05hbWU6IFwidGl0bGViYXIgcm93XCJcbiAgfSwgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge1xuICAgIGNsYXNzTmFtZTogXCJuYW1lXCJcbiAgfSwgXCJDT01QT05FTlRTXCIpLCBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCBudWxsLCBcIlR5cGVcIikpLCBwZWxsZXQuZXhwZXJpbWVudC5hbGxWYXJpYXRpb25zID8gx4NtYXDvvL8ocGVsbGV0LmV4cGVyaW1lbnQuYWxsVmFyaWF0aW9ucywgZnVuY3Rpb24oeCwgbmFtZSkge1xuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICAgIGNsYXNzTmFtZTogXCJyb3cgaG92ZXJcIlxuICAgIH0sIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtcbiAgICAgIGNsYXNzTmFtZTogXCJuYW1lXCJcbiAgICB9LCBuYW1lLnN1YnN0cmluZygxKSksIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIG51bGwsIFwiPVwiID09PSBuYW1lWzBdID8gXCJLZXkvVmFsdWVcIiA6IFwiQFwiID09PSBuYW1lWzBdID8gXCJDb21wb25lbnRcIiA6IFwidW5rbm93blwiKSk7XG4gIH0pIDogbnVsbCwgUmVhY3QuY3JlYXRlRWxlbWVudChcImgzXCIsIG51bGwsIFwiQWxsIENvbXBvbmVudHNcIiksIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1xuICAgIGNsYXNzTmFtZTogXCJ0aXRsZWJhciByb3dcIlxuICB9LCBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7XG4gICAgY2xhc3NOYW1lOiBcIm5hbWVcIlxuICB9LCBcIk5BTUVcIiksIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtcbiAgICBjbGFzc05hbWU6IFwiYWN0aXZlXCJcbiAgfSwgXCJWRVJTSU9OXCIpKSwgx4NtYXDvvL8ocGVsbGV0LmNvbXBvbmVudHMsIGZ1bmN0aW9uKHgsIG5hbWUpIHtcbiAgICByZXR1cm4gY29tcCA9IG5hbWUuc3BsaXQoXCJAXCIpLCBudWxsLCAyID09IGNvbXAubGVuZ3RoID8gUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XG4gICAgICBjbGFzc05hbWU6IFwicm93IGhvdmVyXCJcbiAgICB9LCBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7XG4gICAgICBjbGFzc05hbWU6IFwibmFtZVwiXG4gICAgfSwgY29tcFswXSksIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIG51bGwsIGNvbXBbMV0pKSA6IG51bGw7XG4gIH0pKSk7XG59O1xuZnVuY3Rpb24gx4NtYXDvvL8ob2JqLCBlYWNoLCBhbHQpIHtcbiAgdmFyIHJlc3VsdCA9IFtdLCBrZXk7XG4gIGlmICh0eXBlb2Ygb2JqLmxlbmd0aCA9PT0gJ251bWJlcicpIHtcbiAgICByZXN1bHQgPSBbXS5tYXAuY2FsbChvYmosIGVhY2gpO1xuICB9IGVsc2Uge1xuICAgIGZvciAoa2V5IGluIG9iaikgcmVzdWx0LnB1c2goZWFjaChvYmpba2V5XSwga2V5KSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdC5sZW5ndGggPyByZXN1bHQgOiBhbHQgJiYgYWx0KCk7XG59XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAvdXNyL2xvY2FsL2xpYi9+L3BlbGxldC9zcmMvY29tcG9uZW50cy9tdWx0aXZhcmlhdGUtdGVzdGluZy9kYXNoYm9hcmQvYWJuLWRhc2hib2FyZC5qYWRlXG4gKiogbW9kdWxlIGlkID0gMzFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMlxuICoqLyIsIlJlYWN0ID0gcmVhY3QgPSByZXF1aXJlKFwicmVhY3RcIik7UGVsbGV0ID0gcGVsbGV0ID0gcmVxdWlyZShcInBlbGxldFwiKTttb2R1bGUuZXhwb3J0cz1mdW5jdGlvbihfXyR0aGlzKSB7XG4gIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICBjbGFzc05hbWU6IFwiYWJvdXQtcGFnZVwiXG4gIH0sIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJoMVwiLCBudWxsLCBcIk15IGFib3V0IFBhZ2VcIiksIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJhXCIsIHtcbiAgICBocmVmOiBcIi9oZWxsby9LYWl2b25cIlxuICB9LCBcIkthaXZvbiBcIiksIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJiclwiKSwgUmVhY3QuY3JlYXRlRWxlbWVudChcImFcIiwge1xuICAgIGhyZWY6IFwiL1wiXG4gIH0sIFwiSG9tZVwiKSk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9hYm91dC9hYm91dC5qYWRlXG4gKiogbW9kdWxlIGlkID0gMzJcbiAqKiBtb2R1bGUgY2h1bmtzID0gMlxuICoqLyIsIlJlYWN0ID0gcmVhY3QgPSByZXF1aXJlKFwicmVhY3RcIik7UGVsbGV0ID0gcGVsbGV0ID0gcmVxdWlyZShcInBlbGxldFwiKTttb2R1bGUuZXhwb3J0cz1mdW5jdGlvbihfXyR0aGlzKSB7XG4gIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICBjbGFzc05hbWU6IFwiaW5kZXgtcGFnZVwiXG4gIH0sIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJoMVwiLCBudWxsLCBcIk15IGluZGV4IFBhZ2VcIikpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vaW5kZXguamFkZVxuICoqIG1vZHVsZSBpZCA9IDMzXG4gKiogbW9kdWxlIGNodW5rcyA9IDJcbiAqKi8iLCJSZWFjdCA9IHJlYWN0ID0gcmVxdWlyZShcInJlYWN0XCIpO1BlbGxldCA9IHBlbGxldCA9IHJlcXVpcmUoXCJwZWxsZXRcIik7bW9kdWxlLmV4cG9ydHM9ZnVuY3Rpb24oX18kdGhpcykge1xuICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XG4gICAgY2xhc3NOYW1lOiBcImhlbGxvLXBhZ2VcIlxuICB9LCBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaDFcIiwgbnVsbCwgXCJNeSBoZWxsbyBQYWdlXCIpLCBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaDJcIiwgbnVsbCwgXCJXaGF0J3MgVXAhXCIpLCBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaDNcIiwgbnVsbCwgXCJcIiArIF9fJHRoaXMucHJvcHMucGFyYW1zLm5hbWUpLCBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaDNcIiwgbnVsbCwgXCJcIiArIF9fJHRoaXMuc3RhdGUuY291bnQpLCBSZWFjdC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIsIHtcbiAgICBvbkNsaWNrOiBfXyR0aGlzLmFkZFxuICB9LCBcIlVwIEl0IVwiKSwgXCJLYWl2b25cIiA9PSBfXyR0aGlzLnByb3BzLnBhcmFtcy5uYW1lID8gUmVhY3QuY3JlYXRlRWxlbWVudChcImgyXCIsIG51bGwsIFwieW9cIikgOiBudWxsLCBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaHJcIiksIFJlYWN0LmNyZWF0ZUVsZW1lbnQocGVsbGV0LmNvbXBvbmVudHMubWVzc2FnZSB8fCBtZXNzYWdlLCB7XG4gICAgbmFtZTogXCJBZnNhcmlcIiArIF9fJHRoaXMuc3RhdGUuY291bnRcbiAgfSksIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJoclwiKSwgUmVhY3QuY3JlYXRlRWxlbWVudChcImFcIiwge1xuICAgIGhyZWY6IFwiL2Fib3V0XCJcbiAgfSwgXCJBYm91dFwiKSk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9oZWxsby9oZWxsby5qYWRlXG4gKiogbW9kdWxlIGlkID0gMzRcbiAqKiBtb2R1bGUgY2h1bmtzID0gMlxuICoqLyIsIlJlYWN0ID0gcmVhY3QgPSByZXF1aXJlKFwicmVhY3RcIik7UGVsbGV0ID0gcGVsbGV0ID0gcmVxdWlyZShcInBlbGxldFwiKTttb2R1bGUuZXhwb3J0cz1mdW5jdGlvbihfXyR0aGlzKSB7XG4gIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICBjbGFzc05hbWU6IFwibGF5b3V0MS1sYXlvdXRcIlxuICB9LCBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaGVhZGVyXCIsIG51bGwsIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJoMVwiLCBudWxsLCBcIk15IGxheW91dDEgbGF5b3V0IGhlYWRlclwiKSksIF9fJHRoaXMubGF5b3V0Q29udGVudCwgUmVhY3QuY3JlYXRlRWxlbWVudChcImZvb3RlclwiLCBudWxsLCBSZWFjdC5jcmVhdGVFbGVtZW50KFwicFwiLCBudWxsLCBcIkNvcHlyaWdodCBcIiArIG5ldyBEYXRlKCkudG9KU09OKCkpKSk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9sYXlvdXQxL2xheW91dDEuamFkZVxuICoqIG1vZHVsZSBpZCA9IDM1XG4gKiogbW9kdWxlIGNodW5rcyA9IDJcbiAqKi8iLCJSZWFjdCA9IHJlYWN0ID0gcmVxdWlyZShcInJlYWN0XCIpO1BlbGxldCA9IHBlbGxldCA9IHJlcXVpcmUoXCJwZWxsZXRcIik7bW9kdWxlLmV4cG9ydHM9ZnVuY3Rpb24oX18kdGhpcykge1xuICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XG4gICAgY2xhc3NOYW1lOiBcIm1lc3NhZ2UtY29tcG9uZW50XCJcbiAgfSwgXCJSZWFsIFRpbWUgV2VhcG9uIENoYW5nZSEgXCIgKyBfXyR0aGlzLnByb3BzLm5hbWUpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vbWVzc2FnZS9tZXNzYWdlLmphZGVcbiAqKiBtb2R1bGUgaWQgPSAzNlxuICoqIG1vZHVsZSBjaHVua3MgPSAyXG4gKiovIiwidmFyIHBlbGxldCA9IHJlcXVpcmUoJy4vLi4vcGVsbGV0JylcbiAgLCBpc29sYXRvciA9IHJlcXVpcmUoJy4vLi4vaXNvbGF0b3InKVxuICAsIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG52YXIgZGVmYXVsdENhY2hlSW50ZXJmYWNlID0gbnVsbDtcblxuLyoqXG4gKiBjb250ZXh0IHRvIG1lcmdlIHRoZSB0d28gZW52aXJvbm1lbnRzXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0gaW5pdERhdGFcbiAqIEBwYXJhbSBodHRwXG4gKiBAcGFyYW0gaXNvbGF0ZWRDb25maWdcbiAqIEBwYXJhbSByZXF1ZXN0Q29udGV4dFxuICogQHBhcmFtIGxvY2FsZXNcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IFtjYWNoZUhpdEZuXSBjYWxsZWQgdG8gc2VuZCBhIGNhY2hlZCBkYXRhXG4gKi9cbmZ1bmN0aW9uIHBpcGVsaW5lKGluaXREYXRhLCBodHRwLCBpc29sYXRlZENvbmZpZywgcmVxdWVzdENvbnRleHQsIGxvY2FsZXMsIGNhY2hlSGl0Rm4pIHtcbiAgdGhpcy5odHRwID0gaHR0cDtcbiAgdGhpcy5zZXJpYWxpemUgPSB7fTtcbiAgdGhpcy5wcm9wcyA9IHt9O1xuICB0aGlzLnJlcXVlc3RDb250ZXh0ID0gcmVxdWVzdENvbnRleHQ7XG4gIHRoaXMubG9jYWxlcyA9IGxvY2FsZXM7XG4gIHRoaXMucm9vdElzb2xhdG9yID0gbmV3IGlzb2xhdG9yKG51bGwsIG51bGwsIG51bGwsIGlzb2xhdGVkQ29uZmlnKTtcbiAgdGhpcy5jb29yZGluYXRvck5hbWVUeXBlTWFwID0ge307XG5cbiAgLy8gY3JlYXRlIGEgaW5zdHJ1bWVudCBpbnRlcmZhY2UgdGhhdCB3aWxsIGVtYmVkIG91ciBpc29sYXRlZENvbmZpZyBpbmZvXG4gIHRoaXMuaW5zdHJ1bWVudCA9IHBlbGxldC5pbnN0cnVtZW50YXRpb24uYWRkSXNvbGF0ZWRDb25maWcoaXNvbGF0ZWRDb25maWcpO1xuXG4gIC8vIGJlY2F1c2UgdGhlIHBpcGVsaW5lIHVzZWQgT2JqZWN0LmNyZWF0ZSB0byBjbG9uZSB0aGUgbmFtZXNwYWNlXG4gIC8vIHdlIGNyZWF0ZSBhIHNoYXJlZCBvYmplY3QgdGhhdCB3aWxsIG5vdCBsb3NlIHVwZGF0ZXMuIGZvciBleGFtcGxlXG4gIC8vIGlmIHlvdSBjcmVhdGUgYSBuZXcgbmFtZXNwYWNlIGFuZCB1cGRhdGUgdGhpcy5hYm9ydFJlbmRlciBpdCB1cGRhdGVcbiAgLy8gb25seSB0aGUgbmFtZXNwYWNlIHZlcnNpb24gbm90IHRoZSBvd25lci9wYXJlbnQuXG4gIHRoaXMuJCA9IHtcbiAgICBhYm9ydFJlbmRlcjogZmFsc2UsXG4gICAgY2FjaGVJbnRlcmZhY2U6IGRlZmF1bHRDYWNoZUludGVyZmFjZSwgICAgLy8gdGhlIGludGVyYWNlIHVzZWQgdG8gY2FjaGUgcmVxdWVzdFxuICAgIGNhY2hlSGl0Rm46IGNhY2hlSGl0Rm4gfHwgbnVsbCwgICAgICAgICAgIC8vIGEgZm4gY2FsbGVkIHRvIHNlbmQgdGhlIGNhY2hlZCBkYXRhIHRvIHRoZSBjbGludFxuICAgIGNhY2hlTmVlZHNVcGRhdGluZzogZmFsc2UsICAgICAgICAgICAgICAgIC8vIHRydWUgd2lsbCB1cGRhdGUgdGhlIGNhY2hlIGF0IHRoZSBlbmQgb2YgdGhlIHJlbmRlclxuICAgIGNhY2hlRm9yY2VSZW5kZXI6IGZhbHNlLCAgICAgICAgICAgICAgICAgIC8vIHRydWUgdG8gZm9yY2UgYSByZW5kZXIgZXZlbiBpZiBjYWNoZSBoYXNoIG1hdGNoXG4gICAgY2FjaGVIaXRDYWxsZWQ6IGZhbHNlLCAgICAgICAgICAgICAgICAgICAgLy8gdGhpcyBpcyBpZiB0aGUgY2FjaGUgaGl0IHdhcyBzZW50IHRvIHRoZSBjbGllbnRcbiAgICBjYWNoZUtleTogJycsXG4gICAgY2FjaGVEYXRhU2lnbmF0dXJlOiAnJywgICAgICAgICAgICAgICAgICAgLy8gdGhpcyBpcyBhIGRhdGEgc2lnbmF0dXJlIHRvIGhlbHAgc2tpcCBmdWxsIHJlbmRlcnNcbiAgICBjYWNoZUhpdERhdGE6IG51bGwsICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGlzIGlzIGEgbGFzdCBjYWNoZWQgZGF0YSB0byBoZWxwIHNraXAgZnVsbCByZW5kZXJzXG4gICAgc3RhdHVzQ29kZTogMjAwLCAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhpcyBpcyB0aGUgY3VycmVudCBodHRwIHN0YXR1c0NvZGVcbiAgICByZWxDYW5vbmljYWw6IG51bGwgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGlzIGlzIHRoZSBjdXJyZW50IHJlbCBjYW5vbmljYWwgdXJsXG4gIH07XG5cbiAgaWYoaW5pdERhdGEpIHtcbiAgICB1dGlscy5vYmplY3RVbmlvbihbaW5pdERhdGEucHJvcHNdLCB0aGlzLnByb3BzKTtcbiAgICB1dGlscy5vYmplY3RVbmlvbihbaW5pdERhdGEucHJvcHNdLCB0aGlzLnNlcmlhbGl6ZSk7XG5cbiAgICBpZihpbml0RGF0YS5jb29yZGluYXRvclN0YXRlKSB7XG4gICAgICB0aGlzLmNvb3JkaW5hdG9yU3RhdGUgPSBpbml0RGF0YS5jb29yZGluYXRvclN0YXRlO1xuICAgICAgZm9yKHZhciBpIGluIHRoaXMuY29vcmRpbmF0b3JTdGF0ZSkge1xuICAgICAgICB2YXIgX2Nvb3JkaW5hdG9yID0gcGVsbGV0LmdldENvb3JkaW5hdG9yKGksIHRoaXMuY29vcmRpbmF0b3JTdGF0ZVtpXS50eXBlKTtcbiAgICAgICAgaWYoX2Nvb3JkaW5hdG9yKSB7XG4gICAgICAgICAgX2Nvb3JkaW5hdG9yLmxvYWQodGhpcy5jb29yZGluYXRvclN0YXRlW2ldLml0ZW1zKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNvb3JkaW5hdG9yU3RhdGUgPSB7fTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5jb29yZGluYXRvclN0YXRlID0ge307XG4gIH1cblxuICB0aGlzLnBhcmVudENvbnRleHQgPSBudWxsO1xuICB0aGlzLmluc2VydEF0ID0gJyc7XG5cbiAgdmFyIHJvb3QgPSB7fTtcbiAgdGhpcy5pbnNlcnROb2RlID0ge1xuICAgIGtleTogZmFsc2UsXG4gICAgaGVhZDogcm9vdCxcbiAgICByb290OiByb290XG4gIH07XG59XG5cbi8vIEhFTFBFUiBGVU5DVElPTlMgLSB3cmFwcGVycyBhcm91bmRcbnBpcGVsaW5lLnByb3RvdHlwZS5MSU5LID0gJ2xpbmsnO1xucGlwZWxpbmUucHJvdG90eXBlLk1FVEEgPSAnbWV0YSc7XG5waXBlbGluZS5wcm90b3R5cGUuVElUTEUgPSAndGl0bGUnO1xuXG5waXBlbGluZS5wcm90b3R5cGUuUkVOREVSX0FCT1JUID0gJ2Fib3J0JztcbnBpcGVsaW5lLnByb3RvdHlwZS5SRU5ERVJfTk9fQ0hBTkdFID0gJ25vLWNoYW5nZSc7XG5waXBlbGluZS5wcm90b3R5cGUuUkVOREVSX05FRURFRCA9ICduZWVkZWQnO1xuXG4vKipcbiAqIEFkZCBoZWFkZXIgdG8gdGhlIGh0dHAgcmVzcG9uc2UuXG4gKlxuICogUGxlYXNlIHJlZmVyIHRvIHtAbGluayBpc29tb3JwaGljSHR0cCNhZGRUb0hlYWR9IGZvciBmdWxsIGxpc3Qgb2Ygc3VwcG9ydGVkIHRhZ3NcbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgdGhpcy5hZGRUb0hlYWQoJ3RpdGxlJywgJ015IHBhZ2UgdGl0bGUgaGVyZScpXG4gKiAgICAgdGhpcy5hZGRUb0hlYWQoJ21ldGEnLCB7bmFtZTogJ2Rlc2NyaXB0aW9uJywgY29udGVudDonTXkgU0VPIFNFUlAgZGVzY3JpcHRpb24nfSlcbiAqXG4gKiBAcGFyYW0gZmllbGRcbiAqIEBwYXJhbSB2YWxcbiAqL1xucGlwZWxpbmUucHJvdG90eXBlLmFkZFRvSGVhZCA9IGZ1bmN0aW9uKGZpZWxkLCB2YWwpIHtcbiAgdGhpcy5odHRwLmFkZFRvSGVhZChmaWVsZCwgdmFsKTtcbn07XG5cbnBpcGVsaW5lLnByb3RvdHlwZS5oZWFkZXJzID0gZnVuY3Rpb24oZmllbGQsIHZhbCkge1xuICBpZihhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5oZWFkZXJzKGZpZWxkLCB2YWwpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB0aGlzLmh0dHAuaGVhZGVycyhmaWVsZCk7XG4gIH1cbn07XG5cbi8qKlxuICogR2V0IG9yIFNldCB0aGUgaHR0cCBzdGF0dXMgY29kZVxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICB0aGlzLnN0YXR1c0NvZGUoKVxuICogICAgIHRoaXMuc3RhdHVzQ29kZSg0MDQpXG4gKlxuICogQHBhcmFtIGNvZGVcbiAqIEByZXR1cm4geyp9XG4gKi9cbnBpcGVsaW5lLnByb3RvdHlwZS5zdGF0dXNDb2RlID0gZnVuY3Rpb24oY29kZSkge1xuICBpZihhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgdGhpcy4kLnN0YXR1c0NvZGUgPSBjb2RlO1xuICAgIHRoaXMuaHR0cC5zdGF0dXMoY29kZSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHRoaXMuJC5zdGF0dXNDb2RlO1xuICB9XG59O1xuXG5waXBlbGluZS5wcm90b3R5cGUuc2V0VGl0bGUgPSBmdW5jdGlvbih0aXRsZSkge1xuICB0aGlzLmh0dHAuYWRkVG9IZWFkKHRoaXMuVElUTEUsIHRpdGxlKTtcbn07XG5cbnBpcGVsaW5lLnByb3RvdHlwZS5zZXRDYW5vbmljYWwgPSBmdW5jdGlvbih1cmwpIHtcbiAgdGhpcy4kLnJlbENhbm9uaWNhbCA9IHVybDtcbiAgdGhpcy5odHRwLmFkZFRvSGVhZCh0aGlzLkxJTkssIHtyZWw6J2Nhbm9uaWNhbCcsIGhyZWY6dXJsfSk7XG59O1xuXG5waXBlbGluZS5wcm90b3R5cGUuY29va2llID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmh0dHAuY29va2llLmFwcGx5KHRoaXMuaHR0cCwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmFwcGx5KGFyZ3VtZW50cykpO1xufTtcblxucGlwZWxpbmUucHJvdG90eXBlLnJlZGlyZWN0ID0gZnVuY3Rpb24odXJsKSB7XG4gIHRoaXMuaHR0cC5yZWRpcmVjdCh1cmwpO1xuICB0aGlzLiQuYWJvcnRSZW5kZXIgPSB0cnVlO1xufTtcblxucGlwZWxpbmUucHJvdG90eXBlLmV2ZW50ID0gZnVuY3Rpb24obmFtZSkge1xuICByZXR1cm4gdGhpcy5yb290SXNvbGF0b3IuZXZlbnQobmFtZSk7XG59XG5cbnBpcGVsaW5lLnByb3RvdHlwZS5nZXRJc29sYXRlZENvbmZpZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5yb290SXNvbGF0b3IuaXNvbGF0ZWRDb25maWc7XG59XG5cbnBpcGVsaW5lLnByb3RvdHlwZS51cGRhdGVJc29sYXRlZENvbmZpZyA9IGZ1bmN0aW9uKGNvbmZpZykge1xuICByZXR1cm4gdGhpcy5yb290SXNvbGF0b3IudXBkYXRlSXNvbGF0ZWRDb25maWcoY29uZmlnKTtcbn1cblxucGlwZWxpbmUucHJvdG90eXBlLmdldExvY2FsZXMgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMucHJvcHMubG9jYWxlcyB8fCB0aGlzLmxvY2FsZXM7XG59XG5cbnBpcGVsaW5lLnByb3RvdHlwZS5nZXRSZXF1ZXN0Q29udGV4dCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5yZXF1ZXN0Q29udGV4dDtcbn1cblxucGlwZWxpbmUucHJvdG90eXBlLmFib3J0Q2FjaGUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy4kLmNhY2hlTmVlZHNVcGRhdGluZyA9IGZhbHNlO1xufVxuXG5waXBlbGluZS5wcm90b3R5cGUuY29vcmRpbmF0b3IgPSBmdW5jdGlvbihuYW1lLCB0eXBlLCBzZXJpYWxpemVFdmVudE5hbWUpIHtcbiAgdGhpcy5jb29yZGluYXRvck5hbWVUeXBlTWFwW25hbWVdID0gdHlwZTtcbiAgdmFyIGNvb3JkaW5hdG9yID0gdGhpcy5yb290SXNvbGF0b3IuY29vcmRpbmF0b3IobmFtZSwgdHlwZSk7XG5cbiAgaWYoc2VyaWFsaXplRXZlbnROYW1lICYmIHByb2Nlc3MuZW52LlNFUlZFUl9FTlYpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgY29vcmRpbmF0b3IuZXZlbnQoc2VyaWFsaXplRXZlbnROYW1lKS5maWx0ZXIoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmV0dXJuIChkYXRhLnNlbmRlci5pZCA9PT0gY29vcmRpbmF0b3IuX2lkLmlkKSAmJiAoZGF0YS5jdHggPT09IGNvb3JkaW5hdG9yLmlzb2xhdGVkQ29uZmlnKTtcbiAgICB9KS5vbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICBfdGhpcy5zZXQobmFtZSwgZGF0YS5ldmVudCk7XG4gICAgfSwgdHJ1ZSk7XG4gIH1cblxuICByZXR1cm4gY29vcmRpbmF0b3I7XG59XG5cbi8qKlxuICogY3JlYXRlIGEgbmV3IG5hbWVzcGFjZVxuICogQHBhcmFtIG5hbWVzcGFjZVxuICogQHBhcmFtIGZyb21Sb290XG4gKiBAcmV0dXJucyB7Kn1cbiAqL1xucGlwZWxpbmUucHJvdG90eXBlLm5hbWVzcGFjZSA9IGZ1bmN0aW9uKG5hbWVzcGFjZSwgZnJvbVJvb3QpIHtcbiAgLy8gaWdub3JlIGlmIG5vIGNoYW5nZSBpbiBuYW1lc3BhY2VcbiAgaWYoIW5hbWVzcGFjZSAmJiAhZnJvbVJvb3QpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHZhciBpbmRleCwgcGF0aCwga2V5XG4gICAgLCByb290ID0ge31cbiAgICAsIGhlYWQgPSByb290XG4gICAgLCBuZXdDdHggPSBPYmplY3QuY3JlYXRlKHRoaXMpO1xuXG4gIC8vIHRyaW0gb3V0IHRyYWlsaW5nIFwiLlwiIGFuZCBjbGVhbiB1cCBkdXBsaWNhdGUgXCIuLi5cIiBiZWZvcmUgZ2V0dGluZyBwYXRoXG4gIHBhdGggPSAoZnJvbVJvb3QgPyBuYW1lc3BhY2UgOiAodGhpcy5pbnNlcnRBdCArICcuJyArIG5hbWVzcGFjZSkpO1xuICBwYXRoID0gcGF0aC50cmltKCkucmVwbGFjZSgvXFwuKy9nLCAnLicpLnJlcGxhY2UoLyheXFwuKXwoXFwuJCkvZywgJycpO1xuXG4gIG5ld0N0eC5wYXJlbnRDb250ZXh0ID0gdGhpcztcbiAgbmV3Q3R4Lmluc2VydEF0ID0gcGF0aDtcblxuICBwYXRoID0gcGF0aC5zcGxpdCgnLicpO1xuICBrZXkgPSBwYXRoLnBvcCgpO1xuICB3aGlsZSgoaW5kZXggPSBwYXRoLnNoaWZ0KCkpICE9IG51bGwpIHtcbiAgICBoZWFkID0gaGVhZFtpbmRleF0gPSB7fTtcbiAgfVxuXG4gIG5ld0N0eC5pbnNlcnROb2RlID0ge1xuICAgIGtleToga2V5LFxuICAgIGhlYWQ6IGhlYWQsXG4gICAgcm9vdDogcm9vdFxuICB9O1xuXG4gIHJldHVybiBuZXdDdHg7XG59O1xuXG4vKipcbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIG9ialxuICogQHJldHVybnMgeyp9XG4gKi9cbnBpcGVsaW5lLnByb3RvdHlwZS5idWlsZE1lcmdlT2JqRnJvbU5hbWVzcGFjZSA9IGZ1bmN0aW9uKG9iaikge1xuICBpZighdGhpcy5pbnNlcnROb2RlLmtleSkge1xuICAgIHJldHVybiBvYmo7XG4gIH1cblxuICB0aGlzLmluc2VydE5vZGUuaGVhZFt0aGlzLmluc2VydE5vZGUua2V5XSA9IG9iajtcbiAgcmV0dXJuIHRoaXMuaW5zZXJ0Tm9kZS5yb290O1xufTtcblxucGlwZWxpbmUucHJvdG90eXBlLnNldFByb3BzID0gZnVuY3Rpb24ob2JqKSB7XG4gIGlmKHRoaXMuaW5zZXJ0Tm9kZS5rZXkgPT09IGZhbHNlICYmIHR5cGVvZiBvYmogIT09ICdvYmplY3QnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgbWVyZ2Ugbm9uIG9iamVjdHMgdG8gcm9vdCBuYW1lc3BhY2UnKVxuICB9XG5cbiAgLy8gdG9kbzogbWFrZSBzdXJlIG5vIG9ic2VydmFibGVzIChzYXZlIHZlcnNpb25zKSBiZWNhdXNlIGl0IHdpbGwgYmxvdyBpcyBzb21lb25lIHVzZXMgaXRcblxuICB2YXIgbWVyZ2VPYmogPSB0aGlzLmJ1aWxkTWVyZ2VPYmpGcm9tTmFtZXNwYWNlKG9iaik7XG4gIHV0aWxzLm9iamVjdFVuaW9uKFttZXJnZU9ial0sIHRoaXMucHJvcHMsIHtkZWxldGVVbmRlZmluZWQ6dHJ1ZX0pO1xufTtcblxucGlwZWxpbmUucHJvdG90eXBlLnNldFN0YXRlID0gZnVuY3Rpb24ob2JqLCBjYikge1xuICBpZih0eXBlb2Ygb2JqICE9PSAnb2JqZWN0Jykge1xuICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IG1lcmdlIG5vbiBvYmplY3RzIHRvIGNvbnRleHQgc3RhdGUnKVxuICB9IC8qXG4gIFRPRE86IG5lZWQgdG8gc3VwcG9ydCB0aGUgZm4ocHJldmlvdXNTdGF0ZSwgY3VycmVudFByb3BzKSB2ZXJzaW9uXG4gIG5lZWQgdG8gdXBkYXRlIFVuaXQgdGVzdCBhbmQgbWFrZSBzdXJlIHRoZSBuYW1lc2NwYWUgaXMgbWFudGFpbmVkXG4gIGVsc2UgaWYodHlwZW9mIG9iaiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIG9iaiA9IG9iaih0aGlzLnByb3BzLl9faW5pdFN0YXRlLCB0aGlzLnByb3BzKVxuICB9Ki9cblxuICB2YXIgbWVyZ2VPYmogPSB0aGlzLmJ1aWxkTWVyZ2VPYmpGcm9tTmFtZXNwYWNlKHtfX2luaXRTdGF0ZTpvYmp9KTtcbiAgdXRpbHMub2JqZWN0VW5pb24oW21lcmdlT2JqXSwgdGhpcy5wcm9wcywge2RlbGV0ZVVuZGVmaW5lZDp0cnVlfSk7XG4gIGlmKHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNiKCk7XG4gIH1cbn07XG5cbi8qKlxuICpcbiAqIEBwYXJhbSBjb29yZGluYXRvclxuICogQHBhcmFtIG9ialxuICovXG5waXBlbGluZS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuXG4gIC8vIGNoZWNrIGlmIHdlIGFyZSBzZXJpYWxpemUgZGF0YSBmb3IgYSBjb29yZGluYXRvciAobmVlZCB0byBtYWtlIHN1cmUgaXRzIG9uZSBvZiBvdXIgY29vcmRpbmF0b3JzKVxuICBpZih0eXBlb2YgdmFsdWUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZihrZXkpID09PSAnc3RyaW5nJyAmJiB0aGlzLmNvb3JkaW5hdG9yTmFtZVR5cGVNYXBba2V5XSkge1xuICAgIHZhciBkYXRhO1xuICAgIGlmKCEoZGF0YSA9IHRoaXMuY29vcmRpbmF0b3JTdGF0ZVtrZXldKSkge1xuICAgICAgZGF0YSA9IHRoaXMuY29vcmRpbmF0b3JTdGF0ZVtrZXldID0ge1xuICAgICAgICB0eXBlOiB0aGlzLmNvb3JkaW5hdG9yTmFtZVR5cGVNYXBba2V5XSxcbiAgICAgICAgaXRlbXM6W11cbiAgICAgIH07XG4gICAgfVxuXG4gICAgZGF0YS5pdGVtcy5wdXNoKHZhbHVlKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YWx1ZSA9IGtleTtcblxuICBpZih0aGlzLmluc2VydE5vZGUua2V5ID09PSBmYWxzZSAmJiB0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgbWVyZ2Ugbm9uIG9iamVjdHMgdG8gcm9vdCBuYW1lc3BhY2UnKVxuICB9XG5cbiAgLy8gdG9kbzogbWFrZSBzdXJlIGFsbCB0aGUgaXRlbXMgaW4gb2JqIGFyZSBwcmltaXRpdmVzIGkuZS4gbnVtYmVyLCBzdHJpbmdzLCBvYmplY3QgYnV0IG5vdCBmdW5jdGlvbnMgb3Igb2JqZWN0IHdpdGggY29uc3Ryb3RvclxuICAvLyB0aGlzIGlzIGJlY2F1c2Ugd2UgSlNPTi5zdHJpbmdpZnkgYW5kIHdlIG5lZWQgdGhlIHNlcmlhbGl6ZSB0byB3b3JrXG5cbiAgdmFyIG1lcmdlT2JqID0gdGhpcy5idWlsZE1lcmdlT2JqRnJvbU5hbWVzcGFjZSh2YWx1ZSk7XG4gIHV0aWxzLm9iamVjdFVuaW9uKFttZXJnZU9ial0sIHRoaXMucHJvcHMsIHtkZWxldGVVbmRlZmluZWQ6dHJ1ZX0pO1xuICB1dGlscy5vYmplY3RVbmlvbihbbWVyZ2VPYmpdLCB0aGlzLnNlcmlhbGl6ZSwge2RlbGV0ZVVuZGVmaW5lZDp0cnVlfSk7XG59O1xuXG4vKipcbiAqIEFkZHMgZXZpZGVuY2UgdG8gY2FjaGUga2V5LlxuICogVXNlIHRoaXMgdG8gYnVpbGQgdXAgdGhlIGNhY2hlIGtleSB1c2VkIHRvIHh4eFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBldmlkZW5jZSBhZGRpdGlvbiBldmlkZW5jZSB1c2VkIHRvIGJ1aWxkIHRoZSBjYWNoZSBrZXlcbiAqL1xucGlwZWxpbmUucHJvdG90eXBlLmFkZENhY2hlS2V5ID0gZnVuY3Rpb24oZXZpZGVuY2UpIHtcbiAgdGhpcy4kLmNhY2hlS2V5ICs9IGV2aWRlbmNlO1xufTtcblxuXG4vKipcbiAqIEFkZHMgZXZpZGVuY2UgdG8gYXJvdW5kIGNhY2hlZCBkYXRhXG4gKlxuICogVXNlIHRoaXMgdG8gaGVscCBwZWxsZXQgc2tpcCBmdWxsIHJlYWN0IHJlbmRlcnMuIEZvciBleGFtcGxlIGlmIHRoZSBjYWNoZWRcbiAqIHZlcnNpb24gd2FzIHJlbmRlcmVkIHdpdGggcHJvcHMge2E6MSwgYjoyfSBhbmQgdGhlIGRhdGEgZnJvbSBjb21wb25lbnRDb25zdHJ1Y3Rpb25cbiAqIGhhcyBub3QgY2hhbmdlZCBpcyBzYWZlIHRvIHNraXAgdGhlIHJlbmRlciBiZWNhdXNlIHRoZSBtYXJrdXAgd2lsbCBiZSB0aGUgc2FtZS5cbiAqIFRoaXMgY2FuIHNhZmUgcGVsbGV0IGZyb20gaGF2aW5nIHRvIHJlbmRlciByZWFjdCBtYXJrdXAgYW5kIGtlZXAgdXNpbmcgdGhlIGNhY2hlZFxuICogdmVyc2lvbi5cbiAqXG4gKiBJZiB5b3UgZG8gbm90IHVzZSB0aGlzIHBlbGxldCB3aWxsIHVzZSB0aGUgcHJvcHNcbiAqXG4gKiBAcGFyYW0gZXZpZGVuY2VcbiAqL1xucGlwZWxpbmUucHJvdG90eXBlLnNpZ25hdHVyZUNhY2hlRGF0YSA9IGZ1bmN0aW9uKGV2aWRlbmNlKSB7XG4gIHRoaXMuJC5jYWNoZURhdGFTaWduYXR1cmUgKz0gZXZpZGVuY2U7XG59O1xuXG4vKipcbiAqIFVzZWQgdG8gdHJhbnNmb3JtIHRoZSBkYXRhIHNlbmQgdG8gdGhlIGNsaWVudFxuICpcbiAqIEBjYWxsYmFjayB0cmFuc2Zvcm1DdHhGblxuICogQHBhcmFtIGN0eCBUaGlzIGlzIHRoZSBjYWNoZWQgY3R4XG4gKiBAcGFyYW0gaGVhZCBUaGlzIGlzIHRoZSBjYWNoZWQgaGVhZGVyc1xuICogQHBhcmFtIG1ldGEgVGhpcyBpcyB0aGUgY2FjaGVzIG1ldGEgZGF0YVxuICogQGNhbGxiYWNrIG5leHQgY2FsbGJhY2sgYWZ0ZXIgeW91ciBkb25lIHdpdGggeW91ciB0cmFuc2Zvcm1cbiAqL1xuXG4vKipcbiAqIFVzZWQgdG8gdHJhbnNmb3JtIHRoZSBkYXRhIHNlbmQgdG8gdGhlIGNsaWVudFxuICpcbiAqIEBjYWxsYmFjayBzZW5kQ2FjaGVkQ0JcbiAqIEBwYXJhbSBlcnJcbiAqIEBwYXJhbSBjYWNoZWREYXRhXG4gKi9cblxuLyoqXG4gKiBVc2UgcGlwZWxpbmUgY2FjaGUgdG8gIC5cbiAqXG4gKiBsZXQgdGhlIHBpcGVsaW5lIGxvb2t1cFxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBkaXJ0eVJlYWQgdXNlIGEgcG90ZW50aWFsbHkgZGlydHkgdmVyc2lvbiB0byB0dGwgKGluIG1zKSBpZiAwIGRvIG5vdCBzZXJ2ZXIgZnJvbSB0aGUgY2FjaGUgb3IgLTEgdG8gZm9yY2UgcmVuZGVyXG4gKiBAcGFyYW0ge3RyYW5zZm9ybUN0eEZufSBbdHJhbnNmb3JtQ3R4Rm5dIHVzZWQgdG8gbW9kaWZ5IHNlcmlhbGl6ZSBkYXRhXG4gKiBAcGFyYW0ge3NlbmRDYWNoZWRDQn0gbmV4dFxuICovXG5waXBlbGluZS5wcm90b3R5cGUuc2VydmVGcm9tQ2FjaGUgPSBmdW5jdGlvbihkaXJ0eVJlYWQsIHRyYW5zZm9ybUN0eEZuLCBuZXh0KSB7XG4gIGlmKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICBuZXh0ID0gdHJhbnNmb3JtQ3R4Rm47XG4gICAgdHJhbnNmb3JtQ3R4Rm4gPSBudWxsO1xuICB9XG5cbiAgaWYocHJvY2Vzcy5lbnYuQlJPV1NFUl9FTlYgfHwgIXRoaXMuJC5jYWNoZUludGVyZmFjZSkge1xuICAgIGlmKG5leHQpIHtcbiAgICAgIG5leHQobnVsbCwgbnVsbCwgbnVsbCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBjb25zb2xlLmRlYnVnKCdDYWNoZSBsYXllcjogY2hlY2sgaWYgaW4gY2FjaGUgKGtleSk6JywgdGhpcy4kLmNhY2hlS2V5KTtcblxuICAgIC8vIHR1cm4gb24gY2FjaGUgdXBkYXRpbmcsIGJlY2F1c2Ugd2UgYXJlXG4gICAgLy8gdHJ5aW5nIHRvIHJldHVybiBhIGNhY2hlZCB2ZXJzaW9uLlxuICAgIHRoaXMuJC5jYWNoZU5lZWRzVXBkYXRpbmcgPSB0cnVlO1xuXG4gICAgLy8gY2hlY2sgdGhlIGNhY2hlIGZvciB0aGUgY2FjaGVLZXkgYW5kIGlmIGZvdW5kIHRyYW5zZm9ybSBjdHggYW5kXG4gICAgLy8gcmVuZGVyIHRoZSBjYWNoZWQgdmVyc2lvbiBpZiBkaXJ0eVJlYWQgPiAwXG4gICAgdGhpcy4kLmNhY2hlSW50ZXJmYWNlLmdldCh0aGlzLiQuY2FjaGVLZXksIGZ1bmN0aW9uKGVyciwgZGF0YSwgbWV0YURhdGEpIHtcbiAgICAgIGlmKGVycikge1xuICAgICAgICBuZXh0KGVyciwgbnVsbCwgbnVsbCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc29sZS5kZWJ1ZygnQ2FjaGUgbGF5ZXI6IGNhY2hlIGNvbnRhaW5zIGN0eCcsICEhKGRhdGEgJiYgZGF0YS5jdHgpLCAnaGVhZDonLCEhKGRhdGEgJiYgZGF0YS5oZWFkKSwgJ21ldGE6JywgISFtZXRhRGF0YSk7XG4gICAgICAvL2NvbnNvbGUuZGVidWcoJ0NhY2hlIGxheWVyOiBEQVRBOicsIGRhdGF8fCdub3RoaW5nJyk7XG4gICAgICAvL2NvbnNvbGUuZGVidWcoJ0NhY2hlIGxheWVyOiBoZWFkOicsIGRhdGEgJiYgZGF0YS5oZWFkKTtcblxuICAgICAgaWYoZGF0YSkge1xuICAgICAgICAvLyBzYXZlIG9mZiB0aGUgZGF0YSBmb3IgdGhlIHJlbmRlciBzdGVwXG4gICAgICAgIC8vIHRoaXMgYWxsb3cgdXNlIHRvIHRoZSBza2lwIHJlbmRlciBpZiBkYXRhIHNpZ25hdHVyZVxuICAgICAgICAvLyBoYXMgbm90IGNoYW5nZWQuIEl0IG1vc3QgY2FzZXMgdGhpcyBpcyB0aGUgcHJvcHNcbiAgICAgICAgX3RoaXMuJC5jYWNoZUhpdERhdGEgPSBkYXRhO1xuXG4gICAgICAgIC8vIGlmIGRpcnR5UmVhZCA9PSAtMSBmb3JjZSByZW5kZXIgYW5kIGlnbm9yZSB0aGUgY2FjaGVcbiAgICAgICAgaWYoZGlydHlSZWFkID09PSAtMSkge1xuICAgICAgICAgIF90aGlzLiQuY2FjaGVGb3JjZVJlbmRlciA9IHRydWU7XG4gICAgICAgICAgZGlydHlSZWFkID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHRyYW5zZm9ybUN0eEZuKSB7XG4gICAgICAgICAgdHJhbnNmb3JtQ3R4Rm4oX3RoaXMsIChkYXRhICYmIGRhdGEuY3R4ICYmIEpTT04ucGFyc2UoZGF0YS5jdHgpKSwgZGF0YS5oZWFkLCBtZXRhRGF0YSwgZnVuY3Rpb24oZXJyLCBjdHgsIGhlYWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoJ0NhY2hlIGxheWVyOiB1c2UgZGlydHkgcmVhZCcsIGRpcnR5UmVhZCAmJiAoKERhdGUubm93KCkgLSBtZXRhRGF0YS5sYXN0TW9kaWZpZWQpIDw9IGRpcnR5UmVhZCksICd0dGw6JywgZGlydHlSZWFkLCAnZWxhcHNlOicsIChEYXRlLm5vdygpIC0gbWV0YURhdGEubGFzdE1vZGlmaWVkKSk7XG5cbiAgICAgICAgICAgIGlmKGRpcnR5UmVhZCAmJiAoKERhdGUubm93KCkgLSBtZXRhRGF0YS5sYXN0TW9kaWZpZWQpIDw9IGRpcnR5UmVhZCkpIHtcbiAgICAgICAgICAgICAgX3RoaXMuJC5jYWNoZUhpdENhbGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgIF90aGlzLiQuY2FjaGVIaXRGbihkYXRhLmh0bWwsIGN0eCAmJiBKU09OLnN0cmluZ2lmeShjdHgpLCBoZWFkKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBuZXh0KG51bGwsIGRhdGEsIG1ldGFEYXRhKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmRlYnVnKCdDYWNoZSBsYXllcjogdXNlIGRpcnR5IHJlYWQnLCBkaXJ0eVJlYWQgJiYgKChEYXRlLm5vdygpIC0gbWV0YURhdGEubGFzdE1vZGlmaWVkKSA8PSBkaXJ0eVJlYWQpLCAndHRsOicsIGRpcnR5UmVhZCwgJ2VsYXBzZTonLChEYXRlLm5vdygpIC0gbWV0YURhdGEubGFzdE1vZGlmaWVkKSk7XG5cbiAgICAgICAgICBpZihkaXJ0eVJlYWQgJiYgKChEYXRlLm5vdygpIC0gbWV0YURhdGEubGFzdE1vZGlmaWVkKSA8PSBkaXJ0eVJlYWQpKSB7XG4gICAgICAgICAgICBfdGhpcy4kLmNhY2hlSGl0Q2FsbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIF90aGlzLiQuY2FjaGVIaXRGbihkYXRhLmh0bWwsIGRhdGEuY3R4LCBkYXRhLmhlYWQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIG5leHQobnVsbCwgZGF0YSwgbWV0YURhdGEpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXh0KG51bGwsIG51bGwsIG51bGwpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59O1xuXG4vKipcbiAqIFVwZGF0ZSB0aGUgY2FjaGUgd2l0aCBib3RoIHRoZSBodG1sIGFuZCBzZXJpYWxpemUgZGF0YVxuICogaWYgd2UgZG8gbm90IG5lZWQgdG8gdXBkYXRlIHRoZSBjYWNoZVxuICpcbiAqIEBwYXJhbSBodG1sXG4gKiBAcGFyYW0ge2NhbGxiYWNrfSBuZXh0XG4gKiBAcmV0dXJuIHtib29sZWFufSBpZiB3ZSBuZWVkIHRvIHVwZGF0ZSB0aGUgY2FjaGVcbiAqL1xucGlwZWxpbmUucHJvdG90eXBlLnVwZGF0ZUNhY2hlID0gZnVuY3Rpb24oaHRtbCwgbmV4dCkge1xuICBpZihwcm9jZXNzLmVudi5CUk9XU0VSX0VOViB8fCAhdGhpcy4kLmNhY2hlSW50ZXJmYWNlKSB7XG4gICAgbmV4dChudWxsLCBmYWxzZSk7XG4gIH0gZWxzZSB7XG4gICAgaWYocGVsbGV0Lm9wdGlvbnMuY2FjaGVPbmx5MjAwUmVzcG9uc2UgJiYgdGhpcy4kLnN0YXR1c0NvZGUgIT0gMjAwKSB7XG4gICAgICBjb25zb2xlLmRlYnVnKCdDYWNoZSBsYXllcjogYWJvcnQgY2FjaGUgYmVjYXVzZSBzdGF0dXNDb2RlOicsIHRoaXMuJC5zdGF0dXNDb2RlKTtcbiAgICAgIHRoaXMuJC5jYWNoZU5lZWRzVXBkYXRpbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zb2xlLmRlYnVnKCdDYWNoZSBsYXllcjogbmVlZHMgdG8gdXBkYXRlOicsIHRoaXMuJC5jYWNoZU5lZWRzVXBkYXRpbmcpO1xuXG4gICAgLy8gdGhpcyBpcyB0aWVkIHRvIHRoZSBzZXJ2ZUZyb21DYWNoZSBjYWxsIHNvIGlmXG4gICAgLy8gZHVyaW5nIGEgcmVxdWVzdCBzZXJ2ZUZyb21DYWNoZSBpcyBub3QgY2FsbGVkXG4gICAgLy8gd2UgZG8gbm90IHVwZGF0ZSB0aGUgY2FjaGUgYmVjYXVzZSBpdCB3aWxsIG5ldmVyXG4gICAgLy8gZ2V0IHVzZWQuXG4gICAgaWYoIXRoaXMuJC5jYWNoZU5lZWRzVXBkYXRpbmcpIHtcbiAgICAgIG5leHQobnVsbCwgZmFsc2UpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzXG4gICAgICAgICwgY3R4ID0gdGhpcy5nZXRKU09OKHRydWUpO1xuXG4gICAgICBjb25zb2xlLmRlYnVnKCdDYWNoZSBsYXllcjogdXBkYXRlIChrZXkpOicsIHRoaXMuJC5jYWNoZUtleSwgJ2h0bWwgaGFzaDonLCBjdHguaGFzaCk7XG4gICAgICAvL2NvbnNvbGUuZGVidWcoJ0NhY2hlIGxheWVyOiBjdHg6JywgSlNPTi5zdHJpbmdpZnkoY3R4LG51bGwsMikpXG5cbiAgICAgIC8vIHVwZGF0ZSB0aGUgY2FjaGUgd2l0aCB0aGUgSFRNTCBhbmQgY3R4XG4gICAgICB0aGlzLiQuY2FjaGVJbnRlcmZhY2Uuc2V0KHRoaXMuJC5jYWNoZUtleSwge1xuICAgICAgICBodG1sOiBodG1sLFxuICAgICAgICBoYXNoOiBjdHguaGFzaCxcbiAgICAgICAgY3R4OiBjdHguanNvbixcbiAgICAgICAgaGVhZDogdGhpcy5odHRwLmhlYWRUYWdzXG4gICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgaWYoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgdXBkYXRpbmcgY2FjaGUgbGF5ZXInLCBfdGhpcy4kLmNhY2hlS2V5LCAnYmVjYXVzZTonLCBlcnIubWVzc2FnZXx8ZXJyKTtcbiAgICAgICAgICBuZXh0KGVycik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbmV4dChudWxsKTtcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2goZXgpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHVwZGF0aW5nIGNhY2hlIGxheWVyJywgdGhpcy4kLmNhY2hlS2V5LCAnYmVjYXVzZTonLCBleC5tZXNzYWdlfHxleCk7XG4gICAgICBuZXh0KGV4KTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogUmV0dXJucyBpZiB0aGUgdGhlIHJlbmRlciBzaG91bGQgYmUgYWJvcnRlZFxuICpcbiAqIFRoaXMgY2FuIGJlIGNhdXNlZCBieSB0aGUgcGlwZWxpbmUgYmVpbmcgYWJvcnRlZCB2aWEgYW5cbiAqIG9wZXJhdGlvbiBsaWtlIGEgcmVkaXJlY3Qgb3IgbWFudWFsIHJlc3BvbnNlLiBBZGRpdGlvbmFsXG4gKiBpZiB0aGUgY2FjaGluZyBsYXllciBkb2VzIG5vdCByZXF1aXJlIGEgcmVuZGVyIHRoaXMgd2lsbFxuICogcmV0dXJuIGZhbHNlLlxuICpcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5waXBlbGluZS5wcm90b3R5cGUuaXNSZW5kZXJSZXF1aXJlZCA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmRlYnVnKCdDYWNoZSBsYXllcjogaXNSZW5kZXJSZXF1aXJlZCBhYm9ydFJlbmRlcjonLCB0aGlzLiQuYWJvcnRSZW5kZXIsICdjYWNoZUhpdENhbGxlZDonLCB0aGlzLiQuY2FjaGVIaXRDYWxsZWQsICdjYWNoZUhpdERhdGEuaGFzaDonLCB0aGlzLiQuY2FjaGVIaXREYXRhICYmIHRoaXMuJC5jYWNoZUhpdERhdGEuaGFzaClcblxuICBpZih0aGlzLiQuYWJvcnRSZW5kZXIpIHtcbiAgICBjb25zb2xlLmRlYnVnKCdBYm9ydCByZW5kZXIgYmVjYXVzZSBtYW51YWwgYWJvcnQgaW4gcmVzcG9uc2UgKGkuZS4gcmVkaXJlY3QpJyk7XG4gICAgcmV0dXJuIHRoaXMuUkVOREVSX0FCT1JUO1xuICB9XG5cbiAgdmFyIGhhc2ggPSB0aGlzLmdldEpTT04odHJ1ZSwgdHJ1ZSkuaGFzaFxuICAgICwgbmVlZFRvUmVuZGVyID0gKCh0aGlzLiQuY2FjaGVIaXREYXRhICYmIHRoaXMuJC5jYWNoZUhpdERhdGEuaGFzaCkgIT0gaGFzaCkgPyB0aGlzLlJFTkRFUl9ORUVERUQgOiB0aGlzLlJFTkRFUl9OT19DSEFOR0U7XG5cbiAgY29uc29sZS5kZWJ1ZygnQ2FjaGUgbGF5ZXI6IHJlbmRlciByZXF1aXJlZDonLCBuZWVkVG9SZW5kZXIsICdmcm9tIGNhY2hlIChoYXNoKTonLCB0aGlzLiQuY2FjaGVIaXREYXRhICYmIHRoaXMuJC5jYWNoZUhpdERhdGEuaGFzaCwgJ2N1cnJlbnQ6JywgaGFzaCwgJ2ZvcmNlOicsIHRoaXMuJC5jYWNoZUZvcmNlUmVuZGVyKTtcblxuICBpZih0aGlzLiQuY2FjaGVGb3JjZVJlbmRlcikge1xuICAgIG5lZWRUb1JlbmRlciA9IHRoaXMuUkVOREVSX05FRURFRDtcbiAgfVxuXG4gIGlmKHByb2Nlc3MuZW52LlNFUlZFUl9FTlYgJiYgdGhpcy4kLmNhY2hlSW50ZXJmYWNlICYmIG5lZWRUb1JlbmRlciA9PT0gdGhpcy5SRU5ERVJfTk9fQ0hBTkdFKSB7XG4gICAgdmFyIF9jYWNoZUtleSA9IHRoaXMuJC5jYWNoZUtleTtcbiAgICAvLyB0b3VjaCB0aGUgY2FjaGUgdG8gdXBkYXRlIGl0cyBUVEwgZGF0YVxuICAgIHRoaXMuJC5jYWNoZUludGVyZmFjZS50b3VjaChfY2FjaGVLZXksIHRoaXMuJC5jYWNoZUhpdERhdGEsIGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHRvdWNoaW5nIGNhY2hlIGxheWVyJywgX2NhY2hlS2V5LCAnYmVjYXVzZTonLCBlcnIubWVzc2FnZXx8ZXJyKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIG5lZWRUb1JlbmRlcjtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIGNhY2hlIGludGVyZmFjZSB0aGlzIHBpcGVsaW5lIHNob3VsZCB1c2UuXG4gKlxuICogQHBhcmFtIGNhY2hlSW50ZXJmYWNlXG4gKi9cbnBpcGVsaW5lLnByb3RvdHlwZS5zZXRDYWNoZUludGVyZmFjZSA9IGZ1bmN0aW9uKGNhY2hlSW50ZXJmYWNlKSB7XG4gIHRoaXMuJC5jYWNoZUludGVyZmFjZSA9IGNhY2hlSW50ZXJmYWNlO1xufTtcblxucGlwZWxpbmUucHJvdG90eXBlLmFkZENoaWxkQ29tcG9uZW50ID0gZnVuY3Rpb24obmFtZXNwYWNlLCBjb21wb25lbnQsIG9wdGlvbnMsIG5leHQpIHtcbiAgdmFyIGNvbnRleHQgPSB0aGlzO1xuXG4gIGlmKGNvbXBvbmVudC5fJGNvbnN0cnVjdGlvbikge1xuICAgIGlmKG5hbWVzcGFjZSkge1xuICAgICAgY29udGV4dCA9IHRoaXMubmFtZXNwYWNlKG5hbWVzcGFjZSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50Ll8kY29uc3RydWN0aW9uLmNhbGwoY29udGV4dCwgb3B0aW9ucywgbmV4dCk7XG4gIH0gZWxzZSB7XG4gICAgbmV4dCgpO1xuICB9XG59O1xuXG5waXBlbGluZS5wcm90b3R5cGUuZ2V0VUEgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAodGhpcy5yZXF1ZXN0Q29udGV4dCAmJiB0aGlzLnJlcXVlc3RDb250ZXh0LnVzZXJBZ2VudERldGFpbHMpIHx8IHt9O1xufVxuXG4vKipcbiAqXG4gKiBAcGFyYW0gY2FsY0hhc2hcbiAqIEBwYXJhbSBza2lwSlNPTlxuICogQHJldHVybiB7Kn1cbiAqL1xucGlwZWxpbmUucHJvdG90eXBlLmdldEpTT04gPSBmdW5jdGlvbihjYWxjSGFzaCwgc2tpcEpTT04pIHtcbiAgdHJ5IHtcbiAgICAvLyBub3cgbWFrZSBzdXJlIHRoZSBjb29yZGluYXRvciBzZXJpYWxpemVkIHN0YXRlIGlzIHNhZmUgZm9yIGhhc2hpbmcsIGJlY2F1c2VcbiAgICAvLyB0aGUgZGF0YSBpcyBhc3luYyB0aGUgb3JkZXIgdGhlIGRhdGEgaXMgc3RvcmVkIGluIGNvb3JkaW5hdG9yU3RhdGUuKi5pdGVtc1sqXVxuICAgIC8vIGlzIHJhbmRvbSBhbmQgdGhpcyB3aWxsIGNoYW5nZSB0aGUgaGFzaCBvZiBjdHggKHRvSlNPTikgc28gc29ydCB0aGUgYXJyYXlcbiAgICAvLyB2aWEgbWFrZUFycmF5SGFzaFNhZmUgdG8gbWFrZSBpdCBwZXJkdXJhYmxlXG4gICAgaWYoIXBlbGxldC5vcHRpb25zLmNhY2hlSGFzaElnbm9yZUFycmF5T3JkZXIpIHtcbiAgICAgIGZvciAodmFyIGkgaW4gdGhpcy5jb29yZGluYXRvclN0YXRlKSB7XG4gICAgICAgIHRoaXMuY29vcmRpbmF0b3JTdGF0ZVtpXS5pdGVtcyA9IHV0aWxzLm1ha2VBcnJheUhhc2hTYWZlKHRoaXMuY29vcmRpbmF0b3JTdGF0ZVtpXS5pdGVtcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHJlc3VsdCA9IHt9XG4gICAgICAsIGRhdGEgPSB7XG4gICAgICAgIHJlcXVlc3RDb250ZXh0OiB0aGlzLnJlcXVlc3RDb250ZXh0LFxuICAgICAgICBwcm9wczogdGhpcy5zZXJpYWxpemUsXG4gICAgICAgIGNvb3JkaW5hdG9yU3RhdGU6IHRoaXMuY29vcmRpbmF0b3JTdGF0ZVxuICAgICAgfTtcblxuICAgIGlmKGNhbGNIYXNoKSB7XG4gICAgICByZXN1bHQuaGFzaCA9IHRoaXMuJC5jYWNoZURhdGFTaWduYXR1cmUgfHwgdXRpbHMuaGFzaE9iamVjdChkYXRhLCB7aWdub3JlQXJyYXlPcmRlcjogcGVsbGV0Lm9wdGlvbnMuY2FjaGVIYXNoSWdub3JlQXJyYXlPcmRlcn0pO1xuICAgIH1cblxuICAgIGlmKCFza2lwSlNPTikge1xuICAgICAgcmVzdWx0Lmpzb24gPSBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9IGNhdGNoKGV4KSB7XG4gICAgY29uc29sZS5lcnJvcihcIkNhbm5vdCBzZXJpYWxpemUgaXNvbW9ycGhpYyBjb250ZXh0IGJlY2F1c2U6XCIsIGV4Lm1lc3NhZ2V8fGV4KTtcbiAgICB0aHJvdyBleDtcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgYSBKU09OIHN0cmluZyBhbmQgYSBoYXNoXG4gKlxuICogQHJldHVybiB7c3RyaW5nfSByZXR1cm5zIHRoZSBKU09OIHN0cmluZ1xuICovXG5waXBlbGluZS5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmdldEpTT04oZmFsc2UpLmpzb247XG59O1xuXG5waXBlbGluZS5wcm90b3R5cGUucmVsZWFzZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnJvb3RJc29sYXRvci5yZWxlYXNlKCk7XG59O1xuXG4vKipcbiAqIFNldCB0aGUgY2FjaGUgaW50ZXJmYWNlIHVzZWQgYnkgdGhlIHBpcGVsaW5lLlxuICpcbiAqIEBwYXJhbSBjYWNoZUludGVyZmFjZVxuICovXG5wZWxsZXQuc2V0RGVmYXVsdFBpcGVsaW5lQ2FjaGVJbnRlcmZhY2UgPSBmdW5jdGlvbihjYWNoZUludGVyZmFjZSkge1xuICBkZWZhdWx0Q2FjaGVJbnRlcmZhY2UgPSBjYWNoZUludGVyZmFjZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBwaXBlbGluZTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogL3Vzci9sb2NhbC9saWIvfi9wZWxsZXQvc3JjL2lzb21vcnBoaWMvcGlwZWxpbmUuanNcbiAqKiBtb2R1bGUgaWQgPSAzN1xuICoqIG1vZHVsZSBjaHVua3MgPSAyXG4gKiovIiwidmFyIGlzYXJyYXkgPSByZXF1aXJlKCdpc2FycmF5JylcblxuLyoqXG4gKiBFeHBvc2UgYHBhdGhUb1JlZ2V4cGAuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gcGF0aFRvUmVnZXhwXG5tb2R1bGUuZXhwb3J0cy5wYXJzZSA9IHBhcnNlXG5tb2R1bGUuZXhwb3J0cy5jb21waWxlID0gY29tcGlsZVxubW9kdWxlLmV4cG9ydHMudG9rZW5zVG9GdW5jdGlvbiA9IHRva2Vuc1RvRnVuY3Rpb25cbm1vZHVsZS5leHBvcnRzLnRva2Vuc1RvUmVnRXhwID0gdG9rZW5zVG9SZWdFeHBcblxuLyoqXG4gKiBUaGUgbWFpbiBwYXRoIG1hdGNoaW5nIHJlZ2V4cCB1dGlsaXR5LlxuICpcbiAqIEB0eXBlIHtSZWdFeHB9XG4gKi9cbnZhciBQQVRIX1JFR0VYUCA9IG5ldyBSZWdFeHAoW1xuICAvLyBNYXRjaCBlc2NhcGVkIGNoYXJhY3RlcnMgdGhhdCB3b3VsZCBvdGhlcndpc2UgYXBwZWFyIGluIGZ1dHVyZSBtYXRjaGVzLlxuICAvLyBUaGlzIGFsbG93cyB0aGUgdXNlciB0byBlc2NhcGUgc3BlY2lhbCBjaGFyYWN0ZXJzIHRoYXQgd29uJ3QgdHJhbnNmb3JtLlxuICAnKFxcXFxcXFxcLiknLFxuICAvLyBNYXRjaCBFeHByZXNzLXN0eWxlIHBhcmFtZXRlcnMgYW5kIHVuLW5hbWVkIHBhcmFtZXRlcnMgd2l0aCBhIHByZWZpeFxuICAvLyBhbmQgb3B0aW9uYWwgc3VmZml4ZXMuIE1hdGNoZXMgYXBwZWFyIGFzOlxuICAvL1xuICAvLyBcIi86dGVzdChcXFxcZCspP1wiID0+IFtcIi9cIiwgXCJ0ZXN0XCIsIFwiXFxkK1wiLCB1bmRlZmluZWQsIFwiP1wiLCB1bmRlZmluZWRdXG4gIC8vIFwiL3JvdXRlKFxcXFxkKylcIiAgPT4gW3VuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIFwiXFxkK1wiLCB1bmRlZmluZWQsIHVuZGVmaW5lZF1cbiAgLy8gXCIvKlwiICAgICAgICAgICAgPT4gW1wiL1wiLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIFwiKlwiXVxuICAnKFtcXFxcLy5dKT8oPzooPzpcXFxcOihcXFxcdyspKD86XFxcXCgoKD86XFxcXFxcXFwufFteKCldKSspXFxcXCkpP3xcXFxcKCgoPzpcXFxcXFxcXC58W14oKV0pKylcXFxcKSkoWysqP10pP3woXFxcXCopKSdcbl0uam9pbignfCcpLCAnZycpXG5cbi8qKlxuICogUGFyc2UgYSBzdHJpbmcgZm9yIHRoZSByYXcgdG9rZW5zLlxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqL1xuZnVuY3Rpb24gcGFyc2UgKHN0cikge1xuICB2YXIgdG9rZW5zID0gW11cbiAgdmFyIGtleSA9IDBcbiAgdmFyIGluZGV4ID0gMFxuICB2YXIgcGF0aCA9ICcnXG4gIHZhciByZXNcblxuICB3aGlsZSAoKHJlcyA9IFBBVEhfUkVHRVhQLmV4ZWMoc3RyKSkgIT0gbnVsbCkge1xuICAgIHZhciBtID0gcmVzWzBdXG4gICAgdmFyIGVzY2FwZWQgPSByZXNbMV1cbiAgICB2YXIgb2Zmc2V0ID0gcmVzLmluZGV4XG4gICAgcGF0aCArPSBzdHIuc2xpY2UoaW5kZXgsIG9mZnNldClcbiAgICBpbmRleCA9IG9mZnNldCArIG0ubGVuZ3RoXG5cbiAgICAvLyBJZ25vcmUgYWxyZWFkeSBlc2NhcGVkIHNlcXVlbmNlcy5cbiAgICBpZiAoZXNjYXBlZCkge1xuICAgICAgcGF0aCArPSBlc2NhcGVkWzFdXG4gICAgICBjb250aW51ZVxuICAgIH1cblxuICAgIC8vIFB1c2ggdGhlIGN1cnJlbnQgcGF0aCBvbnRvIHRoZSB0b2tlbnMuXG4gICAgaWYgKHBhdGgpIHtcbiAgICAgIHRva2Vucy5wdXNoKHBhdGgpXG4gICAgICBwYXRoID0gJydcbiAgICB9XG5cbiAgICB2YXIgcHJlZml4ID0gcmVzWzJdXG4gICAgdmFyIG5hbWUgPSByZXNbM11cbiAgICB2YXIgY2FwdHVyZSA9IHJlc1s0XVxuICAgIHZhciBncm91cCA9IHJlc1s1XVxuICAgIHZhciBzdWZmaXggPSByZXNbNl1cbiAgICB2YXIgYXN0ZXJpc2sgPSByZXNbN11cblxuICAgIHZhciByZXBlYXQgPSBzdWZmaXggPT09ICcrJyB8fCBzdWZmaXggPT09ICcqJ1xuICAgIHZhciBvcHRpb25hbCA9IHN1ZmZpeCA9PT0gJz8nIHx8IHN1ZmZpeCA9PT0gJyonXG4gICAgdmFyIGRlbGltaXRlciA9IHByZWZpeCB8fCAnLydcbiAgICB2YXIgcGF0dGVybiA9IGNhcHR1cmUgfHwgZ3JvdXAgfHwgKGFzdGVyaXNrID8gJy4qJyA6ICdbXicgKyBkZWxpbWl0ZXIgKyAnXSs/JylcblxuICAgIHRva2Vucy5wdXNoKHtcbiAgICAgIG5hbWU6IG5hbWUgfHwga2V5KyssXG4gICAgICBwcmVmaXg6IHByZWZpeCB8fCAnJyxcbiAgICAgIGRlbGltaXRlcjogZGVsaW1pdGVyLFxuICAgICAgb3B0aW9uYWw6IG9wdGlvbmFsLFxuICAgICAgcmVwZWF0OiByZXBlYXQsXG4gICAgICBwYXR0ZXJuOiBlc2NhcGVHcm91cChwYXR0ZXJuKVxuICAgIH0pXG4gIH1cblxuICAvLyBNYXRjaCBhbnkgY2hhcmFjdGVycyBzdGlsbCByZW1haW5pbmcuXG4gIGlmIChpbmRleCA8IHN0ci5sZW5ndGgpIHtcbiAgICBwYXRoICs9IHN0ci5zdWJzdHIoaW5kZXgpXG4gIH1cblxuICAvLyBJZiB0aGUgcGF0aCBleGlzdHMsIHB1c2ggaXQgb250byB0aGUgZW5kLlxuICBpZiAocGF0aCkge1xuICAgIHRva2Vucy5wdXNoKHBhdGgpXG4gIH1cblxuICByZXR1cm4gdG9rZW5zXG59XG5cbi8qKlxuICogQ29tcGlsZSBhIHN0cmluZyB0byBhIHRlbXBsYXRlIGZ1bmN0aW9uIGZvciB0aGUgcGF0aC5cbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9ICAgc3RyXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuZnVuY3Rpb24gY29tcGlsZSAoc3RyKSB7XG4gIHJldHVybiB0b2tlbnNUb0Z1bmN0aW9uKHBhcnNlKHN0cikpXG59XG5cbi8qKlxuICogRXhwb3NlIGEgbWV0aG9kIGZvciB0cmFuc2Zvcm1pbmcgdG9rZW5zIGludG8gdGhlIHBhdGggZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIHRva2Vuc1RvRnVuY3Rpb24gKHRva2Vucykge1xuICAvLyBDb21waWxlIGFsbCB0aGUgdG9rZW5zIGludG8gcmVnZXhwcy5cbiAgdmFyIG1hdGNoZXMgPSBuZXcgQXJyYXkodG9rZW5zLmxlbmd0aClcblxuICAvLyBDb21waWxlIGFsbCB0aGUgcGF0dGVybnMgYmVmb3JlIGNvbXBpbGF0aW9uLlxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgIGlmICh0eXBlb2YgdG9rZW5zW2ldID09PSAnb2JqZWN0Jykge1xuICAgICAgbWF0Y2hlc1tpXSA9IG5ldyBSZWdFeHAoJ14nICsgdG9rZW5zW2ldLnBhdHRlcm4gKyAnJCcpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChvYmopIHtcbiAgICB2YXIgcGF0aCA9ICcnXG5cbiAgICBvYmogPSBvYmogfHwge31cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIga2V5ID0gdG9rZW5zW2ldXG5cbiAgICAgIGlmICh0eXBlb2Yga2V5ID09PSAnc3RyaW5nJykge1xuICAgICAgICBwYXRoICs9IGtleVxuXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIHZhciB2YWx1ZSA9IG9ialtrZXkubmFtZV1cblxuICAgICAgaWYgKHZhbHVlID09IG51bGwpIHtcbiAgICAgICAgaWYgKGtleS5vcHRpb25hbCkge1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgXCInICsga2V5Lm5hbWUgKyAnXCIgdG8gYmUgZGVmaW5lZCcpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGlzYXJyYXkodmFsdWUpKSB7XG4gICAgICAgIGlmICgha2V5LnJlcGVhdCkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIFwiJyArIGtleS5uYW1lICsgJ1wiIHRvIG5vdCByZXBlYXQnKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIGlmIChrZXkub3B0aW9uYWwpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIFwiJyArIGtleS5uYW1lICsgJ1wiIHRvIG5vdCBiZSBlbXB0eScpXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB2YWx1ZS5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGlmICghbWF0Y2hlc1tpXS50ZXN0KHZhbHVlW2pdKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYWxsIFwiJyArIGtleS5uYW1lICsgJ1wiIHRvIG1hdGNoIFwiJyArIGtleS5wYXR0ZXJuICsgJ1wiJylcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBwYXRoICs9IChqID09PSAwID8ga2V5LnByZWZpeCA6IGtleS5kZWxpbWl0ZXIpICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlW2pdKVxuICAgICAgICB9XG5cbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgaWYgKCFtYXRjaGVzW2ldLnRlc3QodmFsdWUpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIFwiJyArIGtleS5uYW1lICsgJ1wiIHRvIG1hdGNoIFwiJyArIGtleS5wYXR0ZXJuICsgJ1wiJylcbiAgICAgIH1cblxuICAgICAgcGF0aCArPSBrZXkucHJlZml4ICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKVxuICAgIH1cblxuICAgIHJldHVybiBwYXRoXG4gIH1cbn1cblxuLyoqXG4gKiBFc2NhcGUgYSByZWd1bGFyIGV4cHJlc3Npb24gc3RyaW5nLlxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGVzY2FwZVN0cmluZyAoc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvKFsuKyo/PV4hOiR7fSgpW1xcXXxcXC9dKS9nLCAnXFxcXCQxJylcbn1cblxuLyoqXG4gKiBFc2NhcGUgdGhlIGNhcHR1cmluZyBncm91cCBieSBlc2NhcGluZyBzcGVjaWFsIGNoYXJhY3RlcnMgYW5kIG1lYW5pbmcuXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBncm91cFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5mdW5jdGlvbiBlc2NhcGVHcm91cCAoZ3JvdXApIHtcbiAgcmV0dXJuIGdyb3VwLnJlcGxhY2UoLyhbPSE6JFxcLygpXSkvZywgJ1xcXFwkMScpXG59XG5cbi8qKlxuICogQXR0YWNoIHRoZSBrZXlzIGFzIGEgcHJvcGVydHkgb2YgdGhlIHJlZ2V4cC5cbiAqXG4gKiBAcGFyYW0gIHtSZWdFeHB9IHJlXG4gKiBAcGFyYW0gIHtBcnJheX0gIGtleXNcbiAqIEByZXR1cm4ge1JlZ0V4cH1cbiAqL1xuZnVuY3Rpb24gYXR0YWNoS2V5cyAocmUsIGtleXMpIHtcbiAgcmUua2V5cyA9IGtleXNcbiAgcmV0dXJuIHJlXG59XG5cbi8qKlxuICogR2V0IHRoZSBmbGFncyBmb3IgYSByZWdleHAgZnJvbSB0aGUgb3B0aW9ucy5cbiAqXG4gKiBAcGFyYW0gIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZmxhZ3MgKG9wdGlvbnMpIHtcbiAgcmV0dXJuIG9wdGlvbnMuc2Vuc2l0aXZlID8gJycgOiAnaSdcbn1cblxuLyoqXG4gKiBQdWxsIG91dCBrZXlzIGZyb20gYSByZWdleHAuXG4gKlxuICogQHBhcmFtICB7UmVnRXhwfSBwYXRoXG4gKiBAcGFyYW0gIHtBcnJheX0gIGtleXNcbiAqIEByZXR1cm4ge1JlZ0V4cH1cbiAqL1xuZnVuY3Rpb24gcmVnZXhwVG9SZWdleHAgKHBhdGgsIGtleXMpIHtcbiAgLy8gVXNlIGEgbmVnYXRpdmUgbG9va2FoZWFkIHRvIG1hdGNoIG9ubHkgY2FwdHVyaW5nIGdyb3Vwcy5cbiAgdmFyIGdyb3VwcyA9IHBhdGguc291cmNlLm1hdGNoKC9cXCgoPyFcXD8pL2cpXG5cbiAgaWYgKGdyb3Vwcykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ3JvdXBzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBrZXlzLnB1c2goe1xuICAgICAgICBuYW1lOiBpLFxuICAgICAgICBwcmVmaXg6IG51bGwsXG4gICAgICAgIGRlbGltaXRlcjogbnVsbCxcbiAgICAgICAgb3B0aW9uYWw6IGZhbHNlLFxuICAgICAgICByZXBlYXQ6IGZhbHNlLFxuICAgICAgICBwYXR0ZXJuOiBudWxsXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBhdHRhY2hLZXlzKHBhdGgsIGtleXMpXG59XG5cbi8qKlxuICogVHJhbnNmb3JtIGFuIGFycmF5IGludG8gYSByZWdleHAuXG4gKlxuICogQHBhcmFtICB7QXJyYXl9ICBwYXRoXG4gKiBAcGFyYW0gIHtBcnJheX0gIGtleXNcbiAqIEBwYXJhbSAge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7UmVnRXhwfVxuICovXG5mdW5jdGlvbiBhcnJheVRvUmVnZXhwIChwYXRoLCBrZXlzLCBvcHRpb25zKSB7XG4gIHZhciBwYXJ0cyA9IFtdXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXRoLmxlbmd0aDsgaSsrKSB7XG4gICAgcGFydHMucHVzaChwYXRoVG9SZWdleHAocGF0aFtpXSwga2V5cywgb3B0aW9ucykuc291cmNlKVxuICB9XG5cbiAgdmFyIHJlZ2V4cCA9IG5ldyBSZWdFeHAoJyg/OicgKyBwYXJ0cy5qb2luKCd8JykgKyAnKScsIGZsYWdzKG9wdGlvbnMpKVxuXG4gIHJldHVybiBhdHRhY2hLZXlzKHJlZ2V4cCwga2V5cylcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBwYXRoIHJlZ2V4cCBmcm9tIHN0cmluZyBpbnB1dC5cbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHBhdGhcbiAqIEBwYXJhbSAge0FycmF5fSAga2V5c1xuICogQHBhcmFtICB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtSZWdFeHB9XG4gKi9cbmZ1bmN0aW9uIHN0cmluZ1RvUmVnZXhwIChwYXRoLCBrZXlzLCBvcHRpb25zKSB7XG4gIHZhciB0b2tlbnMgPSBwYXJzZShwYXRoKVxuICB2YXIgcmUgPSB0b2tlbnNUb1JlZ0V4cCh0b2tlbnMsIG9wdGlvbnMpXG5cbiAgLy8gQXR0YWNoIGtleXMgYmFjayB0byB0aGUgcmVnZXhwLlxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgIGlmICh0eXBlb2YgdG9rZW5zW2ldICE9PSAnc3RyaW5nJykge1xuICAgICAga2V5cy5wdXNoKHRva2Vuc1tpXSlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYXR0YWNoS2V5cyhyZSwga2V5cylcbn1cblxuLyoqXG4gKiBFeHBvc2UgYSBmdW5jdGlvbiBmb3IgdGFraW5nIHRva2VucyBhbmQgcmV0dXJuaW5nIGEgUmVnRXhwLlxuICpcbiAqIEBwYXJhbSAge0FycmF5fSAgdG9rZW5zXG4gKiBAcGFyYW0gIHtBcnJheX0gIGtleXNcbiAqIEBwYXJhbSAge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7UmVnRXhwfVxuICovXG5mdW5jdGlvbiB0b2tlbnNUb1JlZ0V4cCAodG9rZW5zLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG5cbiAgdmFyIHN0cmljdCA9IG9wdGlvbnMuc3RyaWN0XG4gIHZhciBlbmQgPSBvcHRpb25zLmVuZCAhPT0gZmFsc2VcbiAgdmFyIHJvdXRlID0gJydcbiAgdmFyIGxhc3RUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV1cbiAgdmFyIGVuZHNXaXRoU2xhc2ggPSB0eXBlb2YgbGFzdFRva2VuID09PSAnc3RyaW5nJyAmJiAvXFwvJC8udGVzdChsYXN0VG9rZW4pXG5cbiAgLy8gSXRlcmF0ZSBvdmVyIHRoZSB0b2tlbnMgYW5kIGNyZWF0ZSBvdXIgcmVnZXhwIHN0cmluZy5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgdG9rZW4gPSB0b2tlbnNbaV1cblxuICAgIGlmICh0eXBlb2YgdG9rZW4gPT09ICdzdHJpbmcnKSB7XG4gICAgICByb3V0ZSArPSBlc2NhcGVTdHJpbmcodG9rZW4pXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBwcmVmaXggPSBlc2NhcGVTdHJpbmcodG9rZW4ucHJlZml4KVxuICAgICAgdmFyIGNhcHR1cmUgPSB0b2tlbi5wYXR0ZXJuXG5cbiAgICAgIGlmICh0b2tlbi5yZXBlYXQpIHtcbiAgICAgICAgY2FwdHVyZSArPSAnKD86JyArIHByZWZpeCArIGNhcHR1cmUgKyAnKSonXG4gICAgICB9XG5cbiAgICAgIGlmICh0b2tlbi5vcHRpb25hbCkge1xuICAgICAgICBpZiAocHJlZml4KSB7XG4gICAgICAgICAgY2FwdHVyZSA9ICcoPzonICsgcHJlZml4ICsgJygnICsgY2FwdHVyZSArICcpKT8nXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2FwdHVyZSA9ICcoJyArIGNhcHR1cmUgKyAnKT8nXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNhcHR1cmUgPSBwcmVmaXggKyAnKCcgKyBjYXB0dXJlICsgJyknXG4gICAgICB9XG5cbiAgICAgIHJvdXRlICs9IGNhcHR1cmVcbiAgICB9XG4gIH1cblxuICAvLyBJbiBub24tc3RyaWN0IG1vZGUgd2UgYWxsb3cgYSBzbGFzaCBhdCB0aGUgZW5kIG9mIG1hdGNoLiBJZiB0aGUgcGF0aCB0b1xuICAvLyBtYXRjaCBhbHJlYWR5IGVuZHMgd2l0aCBhIHNsYXNoLCB3ZSByZW1vdmUgaXQgZm9yIGNvbnNpc3RlbmN5LiBUaGUgc2xhc2hcbiAgLy8gaXMgdmFsaWQgYXQgdGhlIGVuZCBvZiBhIHBhdGggbWF0Y2gsIG5vdCBpbiB0aGUgbWlkZGxlLiBUaGlzIGlzIGltcG9ydGFudFxuICAvLyBpbiBub24tZW5kaW5nIG1vZGUsIHdoZXJlIFwiL3Rlc3QvXCIgc2hvdWxkbid0IG1hdGNoIFwiL3Rlc3QvL3JvdXRlXCIuXG4gIGlmICghc3RyaWN0KSB7XG4gICAgcm91dGUgPSAoZW5kc1dpdGhTbGFzaCA/IHJvdXRlLnNsaWNlKDAsIC0yKSA6IHJvdXRlKSArICcoPzpcXFxcLyg/PSQpKT8nXG4gIH1cblxuICBpZiAoZW5kKSB7XG4gICAgcm91dGUgKz0gJyQnXG4gIH0gZWxzZSB7XG4gICAgLy8gSW4gbm9uLWVuZGluZyBtb2RlLCB3ZSBuZWVkIHRoZSBjYXB0dXJpbmcgZ3JvdXBzIHRvIG1hdGNoIGFzIG11Y2ggYXNcbiAgICAvLyBwb3NzaWJsZSBieSB1c2luZyBhIHBvc2l0aXZlIGxvb2thaGVhZCB0byB0aGUgZW5kIG9yIG5leHQgcGF0aCBzZWdtZW50LlxuICAgIHJvdXRlICs9IHN0cmljdCAmJiBlbmRzV2l0aFNsYXNoID8gJycgOiAnKD89XFxcXC98JCknXG4gIH1cblxuICByZXR1cm4gbmV3IFJlZ0V4cCgnXicgKyByb3V0ZSwgZmxhZ3Mob3B0aW9ucykpXG59XG5cbi8qKlxuICogTm9ybWFsaXplIHRoZSBnaXZlbiBwYXRoIHN0cmluZywgcmV0dXJuaW5nIGEgcmVndWxhciBleHByZXNzaW9uLlxuICpcbiAqIEFuIGVtcHR5IGFycmF5IGNhbiBiZSBwYXNzZWQgaW4gZm9yIHRoZSBrZXlzLCB3aGljaCB3aWxsIGhvbGQgdGhlXG4gKiBwbGFjZWhvbGRlciBrZXkgZGVzY3JpcHRpb25zLiBGb3IgZXhhbXBsZSwgdXNpbmcgYC91c2VyLzppZGAsIGBrZXlzYCB3aWxsXG4gKiBjb250YWluIGBbeyBuYW1lOiAnaWQnLCBkZWxpbWl0ZXI6ICcvJywgb3B0aW9uYWw6IGZhbHNlLCByZXBlYXQ6IGZhbHNlIH1dYC5cbiAqXG4gKiBAcGFyYW0gIHsoU3RyaW5nfFJlZ0V4cHxBcnJheSl9IHBhdGhcbiAqIEBwYXJhbSAge0FycmF5fSAgICAgICAgICAgICAgICAgW2tleXNdXG4gKiBAcGFyYW0gIHtPYmplY3R9ICAgICAgICAgICAgICAgIFtvcHRpb25zXVxuICogQHJldHVybiB7UmVnRXhwfVxuICovXG5mdW5jdGlvbiBwYXRoVG9SZWdleHAgKHBhdGgsIGtleXMsIG9wdGlvbnMpIHtcbiAga2V5cyA9IGtleXMgfHwgW11cblxuICBpZiAoIWlzYXJyYXkoa2V5cykpIHtcbiAgICBvcHRpb25zID0ga2V5c1xuICAgIGtleXMgPSBbXVxuICB9IGVsc2UgaWYgKCFvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IHt9XG4gIH1cblxuICBpZiAocGF0aCBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgIHJldHVybiByZWdleHBUb1JlZ2V4cChwYXRoLCBrZXlzLCBvcHRpb25zKVxuICB9XG5cbiAgaWYgKGlzYXJyYXkocGF0aCkpIHtcbiAgICByZXR1cm4gYXJyYXlUb1JlZ2V4cChwYXRoLCBrZXlzLCBvcHRpb25zKVxuICB9XG5cbiAgcmV0dXJuIHN0cmluZ1RvUmVnZXhwKHBhdGgsIGtleXMsIG9wdGlvbnMpXG59XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC91c3IvbG9jYWwvbGliL34vcGVsbGV0L34vcGF0aC10by1yZWdleHAvaW5kZXguanNcbiAqKiBtb2R1bGUgaWQgPSAzOFxuICoqIG1vZHVsZSBjaHVua3MgPSAyXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLmRlY29kZSA9IGV4cG9ydHMucGFyc2UgPSByZXF1aXJlKCcuL2RlY29kZScpO1xuZXhwb3J0cy5lbmNvZGUgPSBleHBvcnRzLnN0cmluZ2lmeSA9IHJlcXVpcmUoJy4vZW5jb2RlJyk7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqICh3ZWJwYWNrKS9+L25vZGUtbGlicy1icm93c2VyL34vcXVlcnlzdHJpbmctZXMzL2luZGV4LmpzXG4gKiogbW9kdWxlIGlkID0gMzlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMlxuICoqLyIsIi8qISBLZWZpci5qcyB2MC41LjNcbiAqICBodHRwczovL2dpdGh1Yi5jb20vcG96YWRpL2tlZmlyXG4gKi9cbjsoZnVuY3Rpb24oZ2xvYmFsKXtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIEtlZmlyID0ge307XG5cblxuZnVuY3Rpb24gYW5kKCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIGlmICghYXJndW1lbnRzW2ldKSB7XG4gICAgICByZXR1cm4gYXJndW1lbnRzW2ldO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYXJndW1lbnRzW2kgLSAxXTtcbn1cblxuZnVuY3Rpb24gb3IoKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGFyZ3VtZW50c1tpXSkge1xuICAgICAgcmV0dXJuIGFyZ3VtZW50c1tpXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGFyZ3VtZW50c1tpIC0gMV07XG59XG5cbmZ1bmN0aW9uIG5vdCh4KSB7XG4gIHJldHVybiAheDtcbn1cblxuZnVuY3Rpb24gY29uY2F0KGEsIGIpIHtcbiAgdmFyIHJlc3VsdCwgbGVuZ3RoLCBpLCBqO1xuICBpZiAoYS5sZW5ndGggPT09IDApIHsgIHJldHVybiBiICB9XG4gIGlmIChiLmxlbmd0aCA9PT0gMCkgeyAgcmV0dXJuIGEgIH1cbiAgaiA9IDA7XG4gIHJlc3VsdCA9IG5ldyBBcnJheShhLmxlbmd0aCArIGIubGVuZ3RoKTtcbiAgbGVuZ3RoID0gYS5sZW5ndGg7XG4gIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKywgaisrKSB7XG4gICAgcmVzdWx0W2pdID0gYVtpXTtcbiAgfVxuICBsZW5ndGggPSBiLmxlbmd0aDtcbiAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrLCBqKyspIHtcbiAgICByZXN1bHRbal0gPSBiW2ldO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGZpbmQoYXJyLCB2YWx1ZSkge1xuICB2YXIgbGVuZ3RoID0gYXJyLmxlbmd0aFxuICAgICwgaTtcbiAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGFycltpXSA9PT0gdmFsdWUpIHsgIHJldHVybiBpICB9XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuXG5mdW5jdGlvbiBmaW5kQnlQcmVkKGFyciwgcHJlZCkge1xuICB2YXIgbGVuZ3RoID0gYXJyLmxlbmd0aFxuICAgICwgaTtcbiAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHByZWQoYXJyW2ldKSkgeyAgcmV0dXJuIGkgIH1cbiAgfVxuICByZXR1cm4gLTE7XG59XG5cbmZ1bmN0aW9uIGNsb25lQXJyYXkoaW5wdXQpIHtcbiAgdmFyIGxlbmd0aCA9IGlucHV0Lmxlbmd0aFxuICAgICwgcmVzdWx0ID0gbmV3IEFycmF5KGxlbmd0aClcbiAgICAsIGk7XG4gIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHJlc3VsdFtpXSA9IGlucHV0W2ldO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZShpbnB1dCwgaW5kZXgpIHtcbiAgdmFyIGxlbmd0aCA9IGlucHV0Lmxlbmd0aFxuICAgICwgcmVzdWx0LCBpLCBqO1xuICBpZiAoaW5kZXggPj0gMCAmJiBpbmRleCA8IGxlbmd0aCkge1xuICAgIGlmIChsZW5ndGggPT09IDEpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0ID0gbmV3IEFycmF5KGxlbmd0aCAtIDEpO1xuICAgICAgZm9yIChpID0gMCwgaiA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoaSAhPT0gaW5kZXgpIHtcbiAgICAgICAgICByZXN1bHRbal0gPSBpbnB1dFtpXTtcbiAgICAgICAgICBqKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBpbnB1dDtcbiAgfVxufVxuXG5mdW5jdGlvbiByZW1vdmVCeVByZWQoaW5wdXQsIHByZWQpIHtcbiAgcmV0dXJuIHJlbW92ZShpbnB1dCwgZmluZEJ5UHJlZChpbnB1dCwgcHJlZCkpO1xufVxuXG5mdW5jdGlvbiBtYXAoaW5wdXQsIGZuKSB7XG4gIHZhciBsZW5ndGggPSBpbnB1dC5sZW5ndGhcbiAgICAsIHJlc3VsdCA9IG5ldyBBcnJheShsZW5ndGgpXG4gICAgLCBpO1xuICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICByZXN1bHRbaV0gPSBmbihpbnB1dFtpXSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gZm9yRWFjaChhcnIsIGZuKSB7XG4gIHZhciBsZW5ndGggPSBhcnIubGVuZ3RoXG4gICAgLCBpO1xuICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHsgIGZuKGFycltpXSkgIH1cbn1cblxuZnVuY3Rpb24gZmlsbEFycmF5KGFyciwgdmFsdWUpIHtcbiAgdmFyIGxlbmd0aCA9IGFyci5sZW5ndGhcbiAgICAsIGk7XG4gIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGFycltpXSA9IHZhbHVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvbnRhaW5zKGFyciwgdmFsdWUpIHtcbiAgcmV0dXJuIGZpbmQoYXJyLCB2YWx1ZSkgIT09IC0xO1xufVxuXG5mdW5jdGlvbiByZXN0KGFyciwgc3RhcnQsIG9uRW1wdHkpIHtcbiAgaWYgKGFyci5sZW5ndGggPiBzdGFydCkge1xuICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcnIsIHN0YXJ0KTtcbiAgfVxuICByZXR1cm4gb25FbXB0eTtcbn1cblxuZnVuY3Rpb24gc2xpZGUoY3VyLCBuZXh0LCBtYXgpIHtcbiAgdmFyIGxlbmd0aCA9IE1hdGgubWluKG1heCwgY3VyLmxlbmd0aCArIDEpLFxuICAgICAgb2Zmc2V0ID0gY3VyLmxlbmd0aCAtIGxlbmd0aCArIDEsXG4gICAgICByZXN1bHQgPSBuZXcgQXJyYXkobGVuZ3RoKSxcbiAgICAgIGk7XG4gIGZvciAoaSA9IG9mZnNldDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgcmVzdWx0W2kgLSBvZmZzZXRdID0gY3VyW2ldO1xuICB9XG4gIHJlc3VsdFtsZW5ndGggLSAxXSA9IG5leHQ7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGlzRXF1YWxBcnJheXMoYSwgYikge1xuICB2YXIgbGVuZ3RoLCBpO1xuICBpZiAoYSA9PSBudWxsICYmIGIgPT0gbnVsbCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmIChhID09IG51bGwgfHwgYiA9PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmIChhLmxlbmd0aCAhPT0gYi5sZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgZm9yIChpID0gMCwgbGVuZ3RoID0gYS5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmIChhW2ldICE9PSBiW2ldKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBzcHJlYWQoZm4sIGxlbmd0aCkge1xuICBzd2l0Y2gobGVuZ3RoKSB7XG4gICAgY2FzZSAwOiAgcmV0dXJuIGZ1bmN0aW9uKGEpIHsgIHJldHVybiBmbigpICB9O1xuICAgIGNhc2UgMTogIHJldHVybiBmdW5jdGlvbihhKSB7ICByZXR1cm4gZm4oYVswXSkgIH07XG4gICAgY2FzZSAyOiAgcmV0dXJuIGZ1bmN0aW9uKGEpIHsgIHJldHVybiBmbihhWzBdLCBhWzFdKSAgfTtcbiAgICBjYXNlIDM6ICByZXR1cm4gZnVuY3Rpb24oYSkgeyAgcmV0dXJuIGZuKGFbMF0sIGFbMV0sIGFbMl0pICB9O1xuICAgIGNhc2UgNDogIHJldHVybiBmdW5jdGlvbihhKSB7ICByZXR1cm4gZm4oYVswXSwgYVsxXSwgYVsyXSwgYVszXSkgIH07XG4gICAgZGVmYXVsdDogcmV0dXJuIGZ1bmN0aW9uKGEpIHsgIHJldHVybiBmbi5hcHBseShudWxsLCBhKSAgfTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhcHBseShmbiwgYywgYSkge1xuICB2YXIgYUxlbmd0aCA9IGEgPyBhLmxlbmd0aCA6IDA7XG4gIGlmIChjID09IG51bGwpIHtcbiAgICBzd2l0Y2ggKGFMZW5ndGgpIHtcbiAgICAgIGNhc2UgMDogIHJldHVybiBmbigpO1xuICAgICAgY2FzZSAxOiAgcmV0dXJuIGZuKGFbMF0pO1xuICAgICAgY2FzZSAyOiAgcmV0dXJuIGZuKGFbMF0sIGFbMV0pO1xuICAgICAgY2FzZSAzOiAgcmV0dXJuIGZuKGFbMF0sIGFbMV0sIGFbMl0pO1xuICAgICAgY2FzZSA0OiAgcmV0dXJuIGZuKGFbMF0sIGFbMV0sIGFbMl0sIGFbM10pO1xuICAgICAgZGVmYXVsdDogcmV0dXJuIGZuLmFwcGx5KG51bGwsIGEpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBzd2l0Y2ggKGFMZW5ndGgpIHtcbiAgICAgIGNhc2UgMDogIHJldHVybiBmbi5jYWxsKGMpO1xuICAgICAgZGVmYXVsdDogcmV0dXJuIGZuLmFwcGx5KGMsIGEpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBnZXQobWFwLCBrZXksIG5vdEZvdW5kKSB7XG4gIGlmIChtYXAgJiYga2V5IGluIG1hcCkge1xuICAgIHJldHVybiBtYXBba2V5XTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbm90Rm91bmQ7XG4gIH1cbn1cblxuZnVuY3Rpb24gb3duKG9iaiwgcHJvcCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU9iaihwcm90bykge1xuICB2YXIgRiA9IGZ1bmN0aW9uKCkge307XG4gIEYucHJvdG90eXBlID0gcHJvdG87XG4gIHJldHVybiBuZXcgRigpO1xufVxuXG5mdW5jdGlvbiBleHRlbmQodGFyZ2V0IC8qLCBtaXhpbjEsIG1peGluMi4uLiovKSB7XG4gIHZhciBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgLCBpLCBwcm9wO1xuICBmb3IgKGkgPSAxOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBmb3IgKHByb3AgaW4gYXJndW1lbnRzW2ldKSB7XG4gICAgICB0YXJnZXRbcHJvcF0gPSBhcmd1bWVudHNbaV1bcHJvcF07XG4gICAgfVxuICB9XG4gIHJldHVybiB0YXJnZXQ7XG59XG5cbmZ1bmN0aW9uIGluaGVyaXQoQ2hpbGQsIFBhcmVudCAvKiwgbWl4aW4xLCBtaXhpbjIuLi4qLykge1xuICB2YXIgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aFxuICAgICwgaTtcbiAgQ2hpbGQucHJvdG90eXBlID0gY3JlYXRlT2JqKFBhcmVudC5wcm90b3R5cGUpO1xuICBDaGlsZC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDaGlsZDtcbiAgZm9yIChpID0gMjsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgZXh0ZW5kKENoaWxkLnByb3RvdHlwZSwgYXJndW1lbnRzW2ldKTtcbiAgfVxuICByZXR1cm4gQ2hpbGQ7XG59XG5cbnZhciBOT1RISU5HID0gWyc8bm90aGluZz4nXTtcbnZhciBFTkQgPSAnZW5kJztcbnZhciBWQUxVRSA9ICd2YWx1ZSc7XG52YXIgRVJST1IgPSAnZXJyb3InO1xudmFyIEFOWSA9ICdhbnknO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxuZnVuY3Rpb24gaWQoeCkge1xuICByZXR1cm4geDtcbn1cblxuZnVuY3Rpb24gc3RyaWN0RXF1YWwoYSwgYikge1xuICByZXR1cm4gYSA9PT0gYjtcbn1cblxuZnVuY3Rpb24gZGVmYXVsdERpZmYoYSwgYikge1xuICByZXR1cm4gW2EsIGJdXG59XG5cbnZhciBub3cgPSBEYXRlLm5vdyA/XG4gIGZ1bmN0aW9uKCkgeyByZXR1cm4gRGF0ZS5ub3coKSB9IDpcbiAgZnVuY3Rpb24oKSB7IHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKSB9O1xuXG5mdW5jdGlvbiBpc0ZuKGZuKSB7XG4gIHJldHVybiB0eXBlb2YgZm4gPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKHgpIHtcbiAgcmV0dXJuIHR5cGVvZiB4ID09PSAndW5kZWZpbmVkJztcbn1cblxuZnVuY3Rpb24gaXNBcnJheUxpa2UoeHMpIHtcbiAgcmV0dXJuIGlzQXJyYXkoeHMpIHx8IGlzQXJndW1lbnRzKHhzKTtcbn1cblxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uKHhzKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeHMpID09PSAnW29iamVjdCBBcnJheV0nO1xufVxuXG52YXIgaXNBcmd1bWVudHMgPSBmdW5jdGlvbih4cykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHhzKSA9PT0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG59XG5cbi8vIEZvciBJRVxuaWYgKCFpc0FyZ3VtZW50cyhhcmd1bWVudHMpKSB7XG4gIGlzQXJndW1lbnRzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuICEhKG9iaiAmJiBvd24ob2JqLCAnY2FsbGVlJykpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHdpdGhJbnRlcnZhbChuYW1lLCBtaXhpbikge1xuXG4gIGZ1bmN0aW9uIEFub255bW91c1N0cmVhbSh3YWl0LCBhcmdzKSB7XG4gICAgU3RyZWFtLmNhbGwodGhpcyk7XG4gICAgdGhpcy5fd2FpdCA9IHdhaXQ7XG4gICAgdGhpcy5faW50ZXJ2YWxJZCA9IG51bGw7XG4gICAgdmFyICQgPSB0aGlzO1xuICAgIHRoaXMuXyRvblRpY2sgPSBmdW5jdGlvbigpIHsgICQuX29uVGljaygpICB9XG4gICAgdGhpcy5faW5pdChhcmdzKTtcbiAgfVxuXG4gIGluaGVyaXQoQW5vbnltb3VzU3RyZWFtLCBTdHJlYW0sIHtcblxuICAgIF9uYW1lOiBuYW1lLFxuXG4gICAgX2luaXQ6IGZ1bmN0aW9uKGFyZ3MpIHt9LFxuICAgIF9mcmVlOiBmdW5jdGlvbigpIHt9LFxuXG4gICAgX29uVGljazogZnVuY3Rpb24oKSB7fSxcblxuICAgIF9vbkFjdGl2YXRpb246IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5faW50ZXJ2YWxJZCA9IHNldEludGVydmFsKHRoaXMuXyRvblRpY2ssIHRoaXMuX3dhaXQpO1xuICAgIH0sXG4gICAgX29uRGVhY3RpdmF0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLl9pbnRlcnZhbElkICE9PSBudWxsKSB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5faW50ZXJ2YWxJZCk7XG4gICAgICAgIHRoaXMuX2ludGVydmFsSWQgPSBudWxsO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBfY2xlYXI6IGZ1bmN0aW9uKCkge1xuICAgICAgU3RyZWFtLnByb3RvdHlwZS5fY2xlYXIuY2FsbCh0aGlzKTtcbiAgICAgIHRoaXMuXyRvblRpY2sgPSBudWxsO1xuICAgICAgdGhpcy5fZnJlZSgpO1xuICAgIH1cblxuICB9LCBtaXhpbik7XG5cbiAgS2VmaXJbbmFtZV0gPSBmdW5jdGlvbih3YWl0KSB7XG4gICAgcmV0dXJuIG5ldyBBbm9ueW1vdXNTdHJlYW0od2FpdCwgcmVzdChhcmd1bWVudHMsIDEsIFtdKSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gd2l0aE9uZVNvdXJjZShuYW1lLCBtaXhpbiwgb3B0aW9ucykge1xuXG5cbiAgb3B0aW9ucyA9IGV4dGVuZCh7XG4gICAgc3RyZWFtTWV0aG9kOiBmdW5jdGlvbihTdHJlYW1DbGFzcywgUHJvcGVydHlDbGFzcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkgeyAgcmV0dXJuIG5ldyBTdHJlYW1DbGFzcyh0aGlzLCBhcmd1bWVudHMpICB9XG4gICAgfSxcbiAgICBwcm9wZXJ0eU1ldGhvZDogZnVuY3Rpb24oU3RyZWFtQ2xhc3MsIFByb3BlcnR5Q2xhc3MpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHsgIHJldHVybiBuZXcgUHJvcGVydHlDbGFzcyh0aGlzLCBhcmd1bWVudHMpICB9XG4gICAgfVxuICB9LCBvcHRpb25zIHx8IHt9KTtcblxuXG5cbiAgbWl4aW4gPSBleHRlbmQoe1xuICAgIF9pbml0OiBmdW5jdGlvbihhcmdzKSB7fSxcbiAgICBfZnJlZTogZnVuY3Rpb24oKSB7fSxcblxuICAgIF9oYW5kbGVWYWx1ZTogZnVuY3Rpb24oeCwgaXNDdXJyZW50KSB7ICB0aGlzLl9zZW5kKFZBTFVFLCB4LCBpc0N1cnJlbnQpICB9LFxuICAgIF9oYW5kbGVFcnJvcjogZnVuY3Rpb24oeCwgaXNDdXJyZW50KSB7ICB0aGlzLl9zZW5kKEVSUk9SLCB4LCBpc0N1cnJlbnQpICB9LFxuICAgIF9oYW5kbGVFbmQ6IGZ1bmN0aW9uKF9fLCBpc0N1cnJlbnQpIHsgIHRoaXMuX3NlbmQoRU5ELCBudWxsLCBpc0N1cnJlbnQpICB9LFxuXG4gICAgX2hhbmRsZUFueTogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xuICAgICAgICBjYXNlIFZBTFVFOiB0aGlzLl9oYW5kbGVWYWx1ZShldmVudC52YWx1ZSwgZXZlbnQuY3VycmVudCk7IGJyZWFrO1xuICAgICAgICBjYXNlIEVSUk9SOiB0aGlzLl9oYW5kbGVFcnJvcihldmVudC52YWx1ZSwgZXZlbnQuY3VycmVudCk7IGJyZWFrO1xuICAgICAgICBjYXNlIEVORDogdGhpcy5faGFuZGxlRW5kKGV2ZW50LnZhbHVlLCBldmVudC5jdXJyZW50KTsgYnJlYWs7XG4gICAgICB9XG4gICAgfSxcblxuICAgIF9vbkFjdGl2YXRpb246IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fc291cmNlLm9uQW55KHRoaXMuXyRoYW5kbGVBbnkpO1xuICAgIH0sXG4gICAgX29uRGVhY3RpdmF0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX3NvdXJjZS5vZmZBbnkodGhpcy5fJGhhbmRsZUFueSk7XG4gICAgfVxuICB9LCBtaXhpbiB8fCB7fSk7XG5cblxuXG4gIGZ1bmN0aW9uIGJ1aWxkQ2xhc3MoQmFzZUNsYXNzKSB7XG4gICAgZnVuY3Rpb24gQW5vbnltb3VzT2JzZXJ2YWJsZShzb3VyY2UsIGFyZ3MpIHtcbiAgICAgIEJhc2VDbGFzcy5jYWxsKHRoaXMpO1xuICAgICAgdGhpcy5fc291cmNlID0gc291cmNlO1xuICAgICAgdGhpcy5fbmFtZSA9IHNvdXJjZS5fbmFtZSArICcuJyArIG5hbWU7XG4gICAgICB0aGlzLl9pbml0KGFyZ3MpO1xuICAgICAgdmFyICQgPSB0aGlzO1xuICAgICAgdGhpcy5fJGhhbmRsZUFueSA9IGZ1bmN0aW9uKGV2ZW50KSB7ICAkLl9oYW5kbGVBbnkoZXZlbnQpICB9XG4gICAgfVxuXG4gICAgaW5oZXJpdChBbm9ueW1vdXNPYnNlcnZhYmxlLCBCYXNlQ2xhc3MsIHtcbiAgICAgIF9jbGVhcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIEJhc2VDbGFzcy5wcm90b3R5cGUuX2NsZWFyLmNhbGwodGhpcyk7XG4gICAgICAgIHRoaXMuX3NvdXJjZSA9IG51bGw7XG4gICAgICAgIHRoaXMuXyRoYW5kbGVBbnkgPSBudWxsO1xuICAgICAgICB0aGlzLl9mcmVlKCk7XG4gICAgICB9XG4gICAgfSwgbWl4aW4pO1xuXG4gICAgcmV0dXJuIEFub255bW91c09ic2VydmFibGU7XG4gIH1cblxuXG4gIHZhciBBbm9ueW1vdXNTdHJlYW0gPSBidWlsZENsYXNzKFN0cmVhbSk7XG4gIHZhciBBbm9ueW1vdXNQcm9wZXJ0eSA9IGJ1aWxkQ2xhc3MoUHJvcGVydHkpO1xuXG4gIGlmIChvcHRpb25zLnN0cmVhbU1ldGhvZCkge1xuICAgIFN0cmVhbS5wcm90b3R5cGVbbmFtZV0gPSBvcHRpb25zLnN0cmVhbU1ldGhvZChBbm9ueW1vdXNTdHJlYW0sIEFub255bW91c1Byb3BlcnR5KTtcbiAgfVxuXG4gIGlmIChvcHRpb25zLnByb3BlcnR5TWV0aG9kKSB7XG4gICAgUHJvcGVydHkucHJvdG90eXBlW25hbWVdID0gb3B0aW9ucy5wcm9wZXJ0eU1ldGhvZChBbm9ueW1vdXNTdHJlYW0sIEFub255bW91c1Byb3BlcnR5KTtcbiAgfVxuXG59XG5cbmZ1bmN0aW9uIHdpdGhUd29Tb3VyY2VzKG5hbWUsIG1peGluIC8qLCBvcHRpb25zKi8pIHtcblxuICBtaXhpbiA9IGV4dGVuZCh7XG4gICAgX2luaXQ6IGZ1bmN0aW9uKGFyZ3MpIHt9LFxuICAgIF9mcmVlOiBmdW5jdGlvbigpIHt9LFxuXG4gICAgX2hhbmRsZVByaW1hcnlWYWx1ZTogZnVuY3Rpb24oeCwgaXNDdXJyZW50KSB7ICB0aGlzLl9zZW5kKFZBTFVFLCB4LCBpc0N1cnJlbnQpICB9LFxuICAgIF9oYW5kbGVQcmltYXJ5RXJyb3I6IGZ1bmN0aW9uKHgsIGlzQ3VycmVudCkgeyAgdGhpcy5fc2VuZChFUlJPUiwgeCwgaXNDdXJyZW50KSAgfSxcbiAgICBfaGFuZGxlUHJpbWFyeUVuZDogZnVuY3Rpb24oX18sIGlzQ3VycmVudCkgeyAgdGhpcy5fc2VuZChFTkQsIG51bGwsIGlzQ3VycmVudCkgIH0sXG5cbiAgICBfaGFuZGxlU2Vjb25kYXJ5VmFsdWU6IGZ1bmN0aW9uKHgsIGlzQ3VycmVudCkgeyAgdGhpcy5fbGFzdFNlY29uZGFyeSA9IHggIH0sXG4gICAgX2hhbmRsZVNlY29uZGFyeUVycm9yOiBmdW5jdGlvbih4LCBpc0N1cnJlbnQpIHsgIHRoaXMuX3NlbmQoRVJST1IsIHgsIGlzQ3VycmVudCkgIH0sXG4gICAgX2hhbmRsZVNlY29uZGFyeUVuZDogZnVuY3Rpb24oX18sIGlzQ3VycmVudCkge30sXG5cbiAgICBfaGFuZGxlUHJpbWFyeUFueTogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xuICAgICAgICBjYXNlIFZBTFVFOlxuICAgICAgICAgIHRoaXMuX2hhbmRsZVByaW1hcnlWYWx1ZShldmVudC52YWx1ZSwgZXZlbnQuY3VycmVudCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgRVJST1I6XG4gICAgICAgICAgdGhpcy5faGFuZGxlUHJpbWFyeUVycm9yKGV2ZW50LnZhbHVlLCBldmVudC5jdXJyZW50KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBFTkQ6XG4gICAgICAgICAgdGhpcy5faGFuZGxlUHJpbWFyeUVuZChldmVudC52YWx1ZSwgZXZlbnQuY3VycmVudCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSxcbiAgICBfaGFuZGxlU2Vjb25kYXJ5QW55OiBmdW5jdGlvbihldmVudCkge1xuICAgICAgc3dpdGNoIChldmVudC50eXBlKSB7XG4gICAgICAgIGNhc2UgVkFMVUU6XG4gICAgICAgICAgdGhpcy5faGFuZGxlU2Vjb25kYXJ5VmFsdWUoZXZlbnQudmFsdWUsIGV2ZW50LmN1cnJlbnQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEVSUk9SOlxuICAgICAgICAgIHRoaXMuX2hhbmRsZVNlY29uZGFyeUVycm9yKGV2ZW50LnZhbHVlLCBldmVudC5jdXJyZW50KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBFTkQ6XG4gICAgICAgICAgdGhpcy5faGFuZGxlU2Vjb25kYXJ5RW5kKGV2ZW50LnZhbHVlLCBldmVudC5jdXJyZW50KTtcbiAgICAgICAgICB0aGlzLl9yZW1vdmVTZWNvbmRhcnkoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgX3JlbW92ZVNlY29uZGFyeTogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5fc2Vjb25kYXJ5ICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuX3NlY29uZGFyeS5vZmZBbnkodGhpcy5fJGhhbmRsZVNlY29uZGFyeUFueSk7XG4gICAgICAgIHRoaXMuXyRoYW5kbGVTZWNvbmRhcnlBbnkgPSBudWxsO1xuICAgICAgICB0aGlzLl9zZWNvbmRhcnkgPSBudWxsO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBfb25BY3RpdmF0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLl9zZWNvbmRhcnkgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5fc2Vjb25kYXJ5Lm9uQW55KHRoaXMuXyRoYW5kbGVTZWNvbmRhcnlBbnkpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX2FsaXZlKSB7XG4gICAgICAgIHRoaXMuX3ByaW1hcnkub25BbnkodGhpcy5fJGhhbmRsZVByaW1hcnlBbnkpO1xuICAgICAgfVxuICAgIH0sXG4gICAgX29uRGVhY3RpdmF0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLl9zZWNvbmRhcnkgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5fc2Vjb25kYXJ5Lm9mZkFueSh0aGlzLl8kaGFuZGxlU2Vjb25kYXJ5QW55KTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3ByaW1hcnkub2ZmQW55KHRoaXMuXyRoYW5kbGVQcmltYXJ5QW55KTtcbiAgICB9XG4gIH0sIG1peGluIHx8IHt9KTtcblxuXG5cbiAgZnVuY3Rpb24gYnVpbGRDbGFzcyhCYXNlQ2xhc3MpIHtcbiAgICBmdW5jdGlvbiBBbm9ueW1vdXNPYnNlcnZhYmxlKHByaW1hcnksIHNlY29uZGFyeSwgYXJncykge1xuICAgICAgQmFzZUNsYXNzLmNhbGwodGhpcyk7XG4gICAgICB0aGlzLl9wcmltYXJ5ID0gcHJpbWFyeTtcbiAgICAgIHRoaXMuX3NlY29uZGFyeSA9IHNlY29uZGFyeTtcbiAgICAgIHRoaXMuX25hbWUgPSBwcmltYXJ5Ll9uYW1lICsgJy4nICsgbmFtZTtcbiAgICAgIHRoaXMuX2xhc3RTZWNvbmRhcnkgPSBOT1RISU5HO1xuICAgICAgdmFyICQgPSB0aGlzO1xuICAgICAgdGhpcy5fJGhhbmRsZVNlY29uZGFyeUFueSA9IGZ1bmN0aW9uKGV2ZW50KSB7ICAkLl9oYW5kbGVTZWNvbmRhcnlBbnkoZXZlbnQpICB9XG4gICAgICB0aGlzLl8kaGFuZGxlUHJpbWFyeUFueSA9IGZ1bmN0aW9uKGV2ZW50KSB7ICAkLl9oYW5kbGVQcmltYXJ5QW55KGV2ZW50KSAgfVxuICAgICAgdGhpcy5faW5pdChhcmdzKTtcbiAgICB9XG5cbiAgICBpbmhlcml0KEFub255bW91c09ic2VydmFibGUsIEJhc2VDbGFzcywge1xuICAgICAgX2NsZWFyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgQmFzZUNsYXNzLnByb3RvdHlwZS5fY2xlYXIuY2FsbCh0aGlzKTtcbiAgICAgICAgdGhpcy5fcHJpbWFyeSA9IG51bGw7XG4gICAgICAgIHRoaXMuX3NlY29uZGFyeSA9IG51bGw7XG4gICAgICAgIHRoaXMuX2xhc3RTZWNvbmRhcnkgPSBudWxsO1xuICAgICAgICB0aGlzLl8kaGFuZGxlU2Vjb25kYXJ5QW55ID0gbnVsbDtcbiAgICAgICAgdGhpcy5fJGhhbmRsZVByaW1hcnlBbnkgPSBudWxsO1xuICAgICAgICB0aGlzLl9mcmVlKCk7XG4gICAgICB9XG4gICAgfSwgbWl4aW4pO1xuXG4gICAgcmV0dXJuIEFub255bW91c09ic2VydmFibGU7XG4gIH1cblxuXG4gIHZhciBBbm9ueW1vdXNTdHJlYW0gPSBidWlsZENsYXNzKFN0cmVhbSk7XG4gIHZhciBBbm9ueW1vdXNQcm9wZXJ0eSA9IGJ1aWxkQ2xhc3MoUHJvcGVydHkpO1xuXG4gIFN0cmVhbS5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbihzZWNvbmRhcnkpIHtcbiAgICByZXR1cm4gbmV3IEFub255bW91c1N0cmVhbSh0aGlzLCBzZWNvbmRhcnksIHJlc3QoYXJndW1lbnRzLCAxLCBbXSkpO1xuICB9XG5cbiAgUHJvcGVydHkucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oc2Vjb25kYXJ5KSB7XG4gICAgcmV0dXJuIG5ldyBBbm9ueW1vdXNQcm9wZXJ0eSh0aGlzLCBzZWNvbmRhcnksIHJlc3QoYXJndW1lbnRzLCAxLCBbXSkpO1xuICB9XG5cbn1cblxuLy8gU3Vic2NyaWJlcnNcblxuZnVuY3Rpb24gU3Vic2NyaWJlcnMoKSB7XG4gIHRoaXMuX2l0ZW1zID0gW107XG59XG5cbmV4dGVuZChTdWJzY3JpYmVycywge1xuICBjYWxsT25lOiBmdW5jdGlvbihmbkRhdGEsIGV2ZW50KSB7XG4gICAgaWYgKGZuRGF0YS50eXBlID09PSBBTlkpIHtcbiAgICAgIGZuRGF0YS5mbihldmVudCk7XG4gICAgfSBlbHNlIGlmIChmbkRhdGEudHlwZSA9PT0gZXZlbnQudHlwZSkge1xuICAgICAgaWYgKGZuRGF0YS50eXBlID09PSBWQUxVRSB8fCBmbkRhdGEudHlwZSA9PT0gRVJST1IpIHtcbiAgICAgICAgZm5EYXRhLmZuKGV2ZW50LnZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZuRGF0YS5mbigpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgY2FsbE9uY2U6IGZ1bmN0aW9uKHR5cGUsIGZuLCBldmVudCkge1xuICAgIGlmICh0eXBlID09PSBBTlkpIHtcbiAgICAgIGZuKGV2ZW50KTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IGV2ZW50LnR5cGUpIHtcbiAgICAgIGlmICh0eXBlID09PSBWQUxVRSB8fCB0eXBlID09PSBFUlJPUikge1xuICAgICAgICBmbihldmVudC52YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmbigpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSk7XG5cblxuZXh0ZW5kKFN1YnNjcmliZXJzLnByb3RvdHlwZSwge1xuICBhZGQ6IGZ1bmN0aW9uKHR5cGUsIGZuLCBfa2V5KSB7XG4gICAgdGhpcy5faXRlbXMgPSBjb25jYXQodGhpcy5faXRlbXMsIFt7XG4gICAgICB0eXBlOiB0eXBlLFxuICAgICAgZm46IGZuLFxuICAgICAga2V5OiBfa2V5IHx8IG51bGxcbiAgICB9XSk7XG4gIH0sXG4gIHJlbW92ZTogZnVuY3Rpb24odHlwZSwgZm4sIF9rZXkpIHtcbiAgICB2YXIgcHJlZCA9IGlzQXJyYXkoX2tleSkgP1xuICAgICAgZnVuY3Rpb24oZm5EYXRhKSB7cmV0dXJuIGZuRGF0YS50eXBlID09PSB0eXBlICYmIGlzRXF1YWxBcnJheXMoZm5EYXRhLmtleSwgX2tleSl9IDpcbiAgICAgIGZ1bmN0aW9uKGZuRGF0YSkge3JldHVybiBmbkRhdGEudHlwZSA9PT0gdHlwZSAmJiBmbkRhdGEuZm4gPT09IGZufTtcbiAgICB0aGlzLl9pdGVtcyA9IHJlbW92ZUJ5UHJlZCh0aGlzLl9pdGVtcywgcHJlZCk7XG4gIH0sXG4gIGNhbGxBbGw6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIGl0ZW1zID0gdGhpcy5faXRlbXM7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgU3Vic2NyaWJlcnMuY2FsbE9uZShpdGVtc1tpXSwgZXZlbnQpO1xuICAgIH1cbiAgfSxcbiAgaXNFbXB0eTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2l0ZW1zLmxlbmd0aCA9PT0gMDtcbiAgfVxufSk7XG5cblxuXG5cblxuLy8gRXZlbnRzXG5cbmZ1bmN0aW9uIEV2ZW50KHR5cGUsIHZhbHVlLCBjdXJyZW50KSB7XG4gIHJldHVybiB7dHlwZTogdHlwZSwgdmFsdWU6IHZhbHVlLCBjdXJyZW50OiAhIWN1cnJlbnR9O1xufVxuXG52YXIgQ1VSUkVOVF9FTkQgPSBFdmVudChFTkQsIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cblxuXG5cblxuLy8gT2JzZXJ2YWJsZVxuXG5mdW5jdGlvbiBPYnNlcnZhYmxlKCkge1xuICB0aGlzLl9zdWJzY3JpYmVycyA9IG5ldyBTdWJzY3JpYmVycygpO1xuICB0aGlzLl9hY3RpdmUgPSBmYWxzZTtcbiAgdGhpcy5fYWxpdmUgPSB0cnVlO1xufVxuS2VmaXIuT2JzZXJ2YWJsZSA9IE9ic2VydmFibGU7XG5cbmV4dGVuZChPYnNlcnZhYmxlLnByb3RvdHlwZSwge1xuXG4gIF9uYW1lOiAnb2JzZXJ2YWJsZScsXG5cbiAgX29uQWN0aXZhdGlvbjogZnVuY3Rpb24oKSB7fSxcbiAgX29uRGVhY3RpdmF0aW9uOiBmdW5jdGlvbigpIHt9LFxuXG4gIF9zZXRBY3RpdmU6IGZ1bmN0aW9uKGFjdGl2ZSkge1xuICAgIGlmICh0aGlzLl9hY3RpdmUgIT09IGFjdGl2ZSkge1xuICAgICAgdGhpcy5fYWN0aXZlID0gYWN0aXZlO1xuICAgICAgaWYgKGFjdGl2ZSkge1xuICAgICAgICB0aGlzLl9vbkFjdGl2YXRpb24oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX29uRGVhY3RpdmF0aW9uKCk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIF9jbGVhcjogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fc2V0QWN0aXZlKGZhbHNlKTtcbiAgICB0aGlzLl9hbGl2ZSA9IGZhbHNlO1xuICAgIHRoaXMuX3N1YnNjcmliZXJzID0gbnVsbDtcbiAgfSxcblxuICBfc2VuZDogZnVuY3Rpb24odHlwZSwgeCwgaXNDdXJyZW50KSB7XG4gICAgaWYgKHRoaXMuX2FsaXZlKSB7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVycy5jYWxsQWxsKEV2ZW50KHR5cGUsIHgsIGlzQ3VycmVudCkpO1xuICAgICAgaWYgKHR5cGUgPT09IEVORCkgeyAgdGhpcy5fY2xlYXIoKSAgfVxuICAgIH1cbiAgfSxcblxuICBfb246IGZ1bmN0aW9uKHR5cGUsIGZuLCBfa2V5KSB7XG4gICAgaWYgKHRoaXMuX2FsaXZlKSB7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVycy5hZGQodHlwZSwgZm4sIF9rZXkpO1xuICAgICAgdGhpcy5fc2V0QWN0aXZlKHRydWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBTdWJzY3JpYmVycy5jYWxsT25jZSh0eXBlLCBmbiwgQ1VSUkVOVF9FTkQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICBfb2ZmOiBmdW5jdGlvbih0eXBlLCBmbiwgX2tleSkge1xuICAgIGlmICh0aGlzLl9hbGl2ZSkge1xuICAgICAgdGhpcy5fc3Vic2NyaWJlcnMucmVtb3ZlKHR5cGUsIGZuLCBfa2V5KTtcbiAgICAgIGlmICh0aGlzLl9zdWJzY3JpYmVycy5pc0VtcHR5KCkpIHtcbiAgICAgICAgdGhpcy5fc2V0QWN0aXZlKGZhbHNlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgb25WYWx1ZTogIGZ1bmN0aW9uKGZuLCBfa2V5KSB7ICByZXR1cm4gdGhpcy5fb24oVkFMVUUsIGZuLCBfa2V5KSAgIH0sXG4gIG9uRXJyb3I6ICBmdW5jdGlvbihmbiwgX2tleSkgeyAgcmV0dXJuIHRoaXMuX29uKEVSUk9SLCBmbiwgX2tleSkgICB9LFxuICBvbkVuZDogICAgZnVuY3Rpb24oZm4sIF9rZXkpIHsgIHJldHVybiB0aGlzLl9vbihFTkQsIGZuLCBfa2V5KSAgICAgfSxcbiAgb25Bbnk6ICAgIGZ1bmN0aW9uKGZuLCBfa2V5KSB7ICByZXR1cm4gdGhpcy5fb24oQU5ZLCBmbiwgX2tleSkgICAgIH0sXG5cbiAgb2ZmVmFsdWU6IGZ1bmN0aW9uKGZuLCBfa2V5KSB7ICByZXR1cm4gdGhpcy5fb2ZmKFZBTFVFLCBmbiwgX2tleSkgIH0sXG4gIG9mZkVycm9yOiBmdW5jdGlvbihmbiwgX2tleSkgeyAgcmV0dXJuIHRoaXMuX29mZihFUlJPUiwgZm4sIF9rZXkpICB9LFxuICBvZmZFbmQ6ICAgZnVuY3Rpb24oZm4sIF9rZXkpIHsgIHJldHVybiB0aGlzLl9vZmYoRU5ELCBmbiwgX2tleSkgICAgfSxcbiAgb2ZmQW55OiAgIGZ1bmN0aW9uKGZuLCBfa2V5KSB7ICByZXR1cm4gdGhpcy5fb2ZmKEFOWSwgZm4sIF9rZXkpICAgIH1cblxufSk7XG5cblxuLy8gZXh0ZW5kKCkgY2FuJ3QgaGFuZGxlIGB0b1N0cmluZ2AgaW4gSUU4XG5PYnNlcnZhYmxlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkgeyAgcmV0dXJuICdbJyArIHRoaXMuX25hbWUgKyAnXScgIH07XG5cblxuXG5cblxuXG5cblxuXG4vLyBTdHJlYW1cblxuZnVuY3Rpb24gU3RyZWFtKCkge1xuICBPYnNlcnZhYmxlLmNhbGwodGhpcyk7XG59XG5LZWZpci5TdHJlYW0gPSBTdHJlYW07XG5cbmluaGVyaXQoU3RyZWFtLCBPYnNlcnZhYmxlLCB7XG5cbiAgX25hbWU6ICdzdHJlYW0nXG5cbn0pO1xuXG5cblxuXG5cblxuXG4vLyBQcm9wZXJ0eVxuXG5mdW5jdGlvbiBQcm9wZXJ0eSgpIHtcbiAgT2JzZXJ2YWJsZS5jYWxsKHRoaXMpO1xuICB0aGlzLl9jdXJyZW50ID0gTk9USElORztcbiAgdGhpcy5fY3VycmVudEVycm9yID0gTk9USElORztcbn1cbktlZmlyLlByb3BlcnR5ID0gUHJvcGVydHk7XG5cbmluaGVyaXQoUHJvcGVydHksIE9ic2VydmFibGUsIHtcblxuICBfbmFtZTogJ3Byb3BlcnR5JyxcblxuICBfc2VuZDogZnVuY3Rpb24odHlwZSwgeCwgaXNDdXJyZW50KSB7XG4gICAgaWYgKHRoaXMuX2FsaXZlKSB7XG4gICAgICBpZiAoIWlzQ3VycmVudCkge1xuICAgICAgICB0aGlzLl9zdWJzY3JpYmVycy5jYWxsQWxsKEV2ZW50KHR5cGUsIHgpKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlID09PSBWQUxVRSkgeyAgdGhpcy5fY3VycmVudCA9IHggIH1cbiAgICAgIGlmICh0eXBlID09PSBFUlJPUikgeyAgdGhpcy5fY3VycmVudEVycm9yID0geCAgfVxuICAgICAgaWYgKHR5cGUgPT09IEVORCkgeyAgdGhpcy5fY2xlYXIoKSAgfVxuICAgIH1cbiAgfSxcblxuICBfb246IGZ1bmN0aW9uKHR5cGUsIGZuLCBfa2V5KSB7XG4gICAgaWYgKHRoaXMuX2FsaXZlKSB7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVycy5hZGQodHlwZSwgZm4sIF9rZXkpO1xuICAgICAgdGhpcy5fc2V0QWN0aXZlKHRydWUpO1xuICAgIH1cbiAgICBpZiAodGhpcy5fY3VycmVudCAhPT0gTk9USElORykge1xuICAgICAgU3Vic2NyaWJlcnMuY2FsbE9uY2UodHlwZSwgZm4sIEV2ZW50KFZBTFVFLCB0aGlzLl9jdXJyZW50LCB0cnVlKSk7XG4gICAgfVxuICAgIGlmICh0aGlzLl9jdXJyZW50RXJyb3IgIT09IE5PVEhJTkcpIHtcbiAgICAgIFN1YnNjcmliZXJzLmNhbGxPbmNlKHR5cGUsIGZuLCBFdmVudChFUlJPUiwgdGhpcy5fY3VycmVudEVycm9yLCB0cnVlKSk7XG4gICAgfVxuICAgIGlmICghdGhpcy5fYWxpdmUpIHtcbiAgICAgIFN1YnNjcmliZXJzLmNhbGxPbmNlKHR5cGUsIGZuLCBDVVJSRU5UX0VORCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbn0pO1xuXG5cblxuXG5cblxuLy8gTG9nXG5cbk9ic2VydmFibGUucHJvdG90eXBlLmxvZyA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgbmFtZSA9IG5hbWUgfHwgdGhpcy50b1N0cmluZygpO1xuICB0aGlzLm9uQW55KGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIHR5cGVTdHIgPSAnPCcgKyBldmVudC50eXBlICsgKGV2ZW50LmN1cnJlbnQgPyAnOmN1cnJlbnQnIDogJycpICsgJz4nO1xuICAgIGlmIChldmVudC50eXBlID09PSBWQUxVRSB8fCBldmVudC50eXBlID09PSBFUlJPUikge1xuICAgICAgY29uc29sZS5sb2cobmFtZSwgdHlwZVN0ciwgZXZlbnQudmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhuYW1lLCB0eXBlU3RyKTtcbiAgICB9XG4gIH0sIFsnX19sb2dLZXlfXycsIHRoaXMsIG5hbWVdKTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbk9ic2VydmFibGUucHJvdG90eXBlLm9mZkxvZyA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgbmFtZSA9IG5hbWUgfHwgdGhpcy50b1N0cmluZygpO1xuICB0aGlzLm9mZkFueShudWxsLCBbJ19fbG9nS2V5X18nLCB0aGlzLCBuYW1lXSk7XG4gIHJldHVybiB0aGlzO1xufVxuXG5cblxuLy8gS2VmaXIud2l0aEludGVydmFsKClcblxud2l0aEludGVydmFsKCd3aXRoSW50ZXJ2YWwnLCB7XG4gIF9pbml0OiBmdW5jdGlvbihhcmdzKSB7XG4gICAgdGhpcy5fZm4gPSBhcmdzWzBdO1xuICAgIHZhciAkID0gdGhpcztcbiAgICB0aGlzLl9lbWl0dGVyID0ge1xuICAgICAgZW1pdDogZnVuY3Rpb24oeCkgeyAgJC5fc2VuZChWQUxVRSwgeCkgIH0sXG4gICAgICBlcnJvcjogZnVuY3Rpb24oeCkgeyAgJC5fc2VuZChFUlJPUiwgeCkgIH0sXG4gICAgICBlbmQ6IGZ1bmN0aW9uKCkgeyAgJC5fc2VuZChFTkQpICB9XG4gICAgfVxuICB9LFxuICBfZnJlZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fZm4gPSBudWxsO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBudWxsO1xuICB9LFxuICBfb25UaWNrOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9mbih0aGlzLl9lbWl0dGVyKTtcbiAgfVxufSk7XG5cblxuXG5cblxuLy8gS2VmaXIuZnJvbVBvbGwoKVxuXG53aXRoSW50ZXJ2YWwoJ2Zyb21Qb2xsJywge1xuICBfaW5pdDogZnVuY3Rpb24oYXJncykge1xuICAgIHRoaXMuX2ZuID0gYXJnc1swXTtcbiAgfSxcbiAgX2ZyZWU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2ZuID0gbnVsbDtcbiAgfSxcbiAgX29uVGljazogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fc2VuZChWQUxVRSwgdGhpcy5fZm4oKSk7XG4gIH1cbn0pO1xuXG5cblxuXG5cbi8vIEtlZmlyLmludGVydmFsKClcblxud2l0aEludGVydmFsKCdpbnRlcnZhbCcsIHtcbiAgX2luaXQ6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICB0aGlzLl94ID0gYXJnc1swXTtcbiAgfSxcbiAgX2ZyZWU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3ggPSBudWxsO1xuICB9LFxuICBfb25UaWNrOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9zZW5kKFZBTFVFLCB0aGlzLl94KTtcbiAgfVxufSk7XG5cblxuXG5cbi8vIEtlZmlyLnNlcXVlbnRpYWxseSgpXG5cbndpdGhJbnRlcnZhbCgnc2VxdWVudGlhbGx5Jywge1xuICBfaW5pdDogZnVuY3Rpb24oYXJncykge1xuICAgIHRoaXMuX3hzID0gY2xvbmVBcnJheShhcmdzWzBdKTtcbiAgICBpZiAodGhpcy5feHMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLl9zZW5kKEVORClcbiAgICB9XG4gIH0sXG4gIF9mcmVlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl94cyA9IG51bGw7XG4gIH0sXG4gIF9vblRpY2s6IGZ1bmN0aW9uKCkge1xuICAgIHN3aXRjaCAodGhpcy5feHMubGVuZ3RoKSB7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIHRoaXMuX3NlbmQoVkFMVUUsIHRoaXMuX3hzWzBdKTtcbiAgICAgICAgdGhpcy5fc2VuZChFTkQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRoaXMuX3NlbmQoVkFMVUUsIHRoaXMuX3hzLnNoaWZ0KCkpO1xuICAgIH1cbiAgfVxufSk7XG5cblxuXG5cbi8vIEtlZmlyLnJlcGVhdGVkbHkoKVxuXG53aXRoSW50ZXJ2YWwoJ3JlcGVhdGVkbHknLCB7XG4gIF9pbml0OiBmdW5jdGlvbihhcmdzKSB7XG4gICAgdGhpcy5feHMgPSBjbG9uZUFycmF5KGFyZ3NbMF0pO1xuICAgIHRoaXMuX2kgPSAtMTtcbiAgfSxcbiAgX29uVGljazogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX3hzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuX2kgPSAodGhpcy5faSArIDEpICUgdGhpcy5feHMubGVuZ3RoO1xuICAgICAgdGhpcy5fc2VuZChWQUxVRSwgdGhpcy5feHNbdGhpcy5faV0pO1xuICAgIH1cbiAgfVxufSk7XG5cblxuXG5cblxuLy8gS2VmaXIubGF0ZXIoKVxuXG53aXRoSW50ZXJ2YWwoJ2xhdGVyJywge1xuICBfaW5pdDogZnVuY3Rpb24oYXJncykge1xuICAgIHRoaXMuX3ggPSBhcmdzWzBdO1xuICB9LFxuICBfZnJlZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5feCA9IG51bGw7XG4gIH0sXG4gIF9vblRpY2s6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3NlbmQoVkFMVUUsIHRoaXMuX3gpO1xuICAgIHRoaXMuX3NlbmQoRU5EKTtcbiAgfVxufSk7XG5cbmZ1bmN0aW9uIF9BYnN0cmFjdFBvb2wob3B0aW9ucykge1xuICBTdHJlYW0uY2FsbCh0aGlzKTtcblxuICB0aGlzLl9xdWV1ZUxpbSA9IGdldChvcHRpb25zLCAncXVldWVMaW0nLCAwKTtcbiAgdGhpcy5fY29uY3VyTGltID0gZ2V0KG9wdGlvbnMsICdjb25jdXJMaW0nLCAtMSk7XG4gIHRoaXMuX2Ryb3AgPSBnZXQob3B0aW9ucywgJ2Ryb3AnLCAnbmV3Jyk7XG4gIGlmICh0aGlzLl9jb25jdXJMaW0gPT09IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ29wdGlvbnMuY29uY3VyTGltIGNhblxcJ3QgYmUgMCcpO1xuICB9XG5cbiAgdmFyICQgPSB0aGlzO1xuICB0aGlzLl8kaGFuZGxlU3ViQW55ID0gZnVuY3Rpb24oZXZlbnQpIHsgICQuX2hhbmRsZVN1YkFueShldmVudCkgIH07XG5cbiAgdGhpcy5fcXVldWUgPSBbXTtcbiAgdGhpcy5fY3VyU291cmNlcyA9IFtdO1xuICB0aGlzLl9hY3RpdmF0aW5nID0gZmFsc2U7XG59XG5cbmluaGVyaXQoX0Fic3RyYWN0UG9vbCwgU3RyZWFtLCB7XG5cbiAgX25hbWU6ICdhYnN0cmFjdFBvb2wnLFxuXG4gIF9hZGQ6IGZ1bmN0aW9uKG9iaiwgdG9PYnMpIHtcbiAgICB0b09icyA9IHRvT2JzIHx8IGlkO1xuICAgIGlmICh0aGlzLl9jb25jdXJMaW0gPT09IC0xIHx8IHRoaXMuX2N1clNvdXJjZXMubGVuZ3RoIDwgdGhpcy5fY29uY3VyTGltKSB7XG4gICAgICB0aGlzLl9hZGRUb0N1cih0b09icyhvYmopKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuX3F1ZXVlTGltID09PSAtMSB8fCB0aGlzLl9xdWV1ZS5sZW5ndGggPCB0aGlzLl9xdWV1ZUxpbSkge1xuICAgICAgICB0aGlzLl9hZGRUb1F1ZXVlKHRvT2JzKG9iaikpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9kcm9wID09PSAnb2xkJykge1xuICAgICAgICB0aGlzLl9yZW1vdmVPbGRlc3QoKTtcbiAgICAgICAgdGhpcy5fYWRkKHRvT2JzKG9iaikpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgX2FkZEFsbDogZnVuY3Rpb24ob2Jzcykge1xuICAgIHZhciAkID0gdGhpcztcbiAgICBmb3JFYWNoKG9ic3MsIGZ1bmN0aW9uKG9icykgeyAgJC5fYWRkKG9icykgIH0pO1xuICB9LFxuICBfcmVtb3ZlOiBmdW5jdGlvbihvYnMpIHtcbiAgICBpZiAodGhpcy5fcmVtb3ZlQ3VyKG9icykgPT09IC0xKSB7XG4gICAgICB0aGlzLl9yZW1vdmVRdWV1ZShvYnMpO1xuICAgIH1cbiAgfSxcblxuICBfYWRkVG9RdWV1ZTogZnVuY3Rpb24ob2JzKSB7XG4gICAgdGhpcy5fcXVldWUgPSBjb25jYXQodGhpcy5fcXVldWUsIFtvYnNdKTtcbiAgfSxcbiAgX2FkZFRvQ3VyOiBmdW5jdGlvbihvYnMpIHtcbiAgICB0aGlzLl9jdXJTb3VyY2VzID0gY29uY2F0KHRoaXMuX2N1clNvdXJjZXMsIFtvYnNdKTtcbiAgICBpZiAodGhpcy5fYWN0aXZlKSB7ICB0aGlzLl9zdWJzY3JpYmUob2JzKSAgfVxuICB9LFxuICBfc3Vic2NyaWJlOiBmdW5jdGlvbihvYnMpIHtcbiAgICB2YXIgJCA9IHRoaXM7XG4gICAgb2JzLm9uQW55KHRoaXMuXyRoYW5kbGVTdWJBbnkpO1xuICAgIG9icy5vbkVuZChmdW5jdGlvbigpIHsgICQuX3JlbW92ZUN1cihvYnMpICB9LCBbdGhpcywgb2JzXSk7XG4gIH0sXG4gIF91bnN1YnNjcmliZTogZnVuY3Rpb24ob2JzKSB7XG4gICAgb2JzLm9mZkFueSh0aGlzLl8kaGFuZGxlU3ViQW55KTtcbiAgICBvYnMub2ZmRW5kKG51bGwsIFt0aGlzLCBvYnNdKTtcbiAgfSxcbiAgX2hhbmRsZVN1YkFueTogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQudHlwZSA9PT0gVkFMVUUgfHwgZXZlbnQudHlwZSA9PT0gRVJST1IpIHtcbiAgICAgIHRoaXMuX3NlbmQoZXZlbnQudHlwZSwgZXZlbnQudmFsdWUsIGV2ZW50LmN1cnJlbnQgJiYgdGhpcy5fYWN0aXZhdGluZyk7XG4gICAgfVxuICB9LFxuXG4gIF9yZW1vdmVRdWV1ZTogZnVuY3Rpb24ob2JzKSB7XG4gICAgdmFyIGluZGV4ID0gZmluZCh0aGlzLl9xdWV1ZSwgb2JzKTtcbiAgICB0aGlzLl9xdWV1ZSA9IHJlbW92ZSh0aGlzLl9xdWV1ZSwgaW5kZXgpO1xuICAgIHJldHVybiBpbmRleDtcbiAgfSxcbiAgX3JlbW92ZUN1cjogZnVuY3Rpb24ob2JzKSB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZSkgeyAgdGhpcy5fdW5zdWJzY3JpYmUob2JzKSAgfVxuICAgIHZhciBpbmRleCA9IGZpbmQodGhpcy5fY3VyU291cmNlcywgb2JzKTtcbiAgICB0aGlzLl9jdXJTb3VyY2VzID0gcmVtb3ZlKHRoaXMuX2N1clNvdXJjZXMsIGluZGV4KTtcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICBpZiAodGhpcy5fcXVldWUubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgIHRoaXMuX3B1bGxRdWV1ZSgpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9jdXJTb3VyY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aGlzLl9vbkVtcHR5KCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBpbmRleDtcbiAgfSxcbiAgX3JlbW92ZU9sZGVzdDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fcmVtb3ZlQ3VyKHRoaXMuX2N1clNvdXJjZXNbMF0pO1xuICB9LFxuXG4gIF9wdWxsUXVldWU6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl9xdWV1ZS5sZW5ndGggIT09IDApIHtcbiAgICAgIHRoaXMuX3F1ZXVlID0gY2xvbmVBcnJheSh0aGlzLl9xdWV1ZSk7XG4gICAgICB0aGlzLl9hZGRUb0N1cih0aGlzLl9xdWV1ZS5zaGlmdCgpKTtcbiAgICB9XG4gIH0sXG5cbiAgX29uQWN0aXZhdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNvdXJjZXMgPSB0aGlzLl9jdXJTb3VyY2VzXG4gICAgICAsIGk7XG4gICAgdGhpcy5fYWN0aXZhdGluZyA9IHRydWU7XG4gICAgZm9yIChpID0gMDsgaSA8IHNvdXJjZXMubGVuZ3RoOyBpKyspIHsgIHRoaXMuX3N1YnNjcmliZShzb3VyY2VzW2ldKSAgfVxuICAgIHRoaXMuX2FjdGl2YXRpbmcgPSBmYWxzZTtcbiAgfSxcbiAgX29uRGVhY3RpdmF0aW9uOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc291cmNlcyA9IHRoaXMuX2N1clNvdXJjZXNcbiAgICAgICwgaTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgc291cmNlcy5sZW5ndGg7IGkrKykgeyAgdGhpcy5fdW5zdWJzY3JpYmUoc291cmNlc1tpXSkgIH1cbiAgfSxcblxuICBfaXNFbXB0eTogZnVuY3Rpb24oKSB7ICByZXR1cm4gdGhpcy5fY3VyU291cmNlcy5sZW5ndGggPT09IDAgIH0sXG4gIF9vbkVtcHR5OiBmdW5jdGlvbigpIHt9LFxuXG4gIF9jbGVhcjogZnVuY3Rpb24oKSB7XG4gICAgU3RyZWFtLnByb3RvdHlwZS5fY2xlYXIuY2FsbCh0aGlzKTtcbiAgICB0aGlzLl9xdWV1ZSA9IG51bGw7XG4gICAgdGhpcy5fY3VyU291cmNlcyA9IG51bGw7XG4gICAgdGhpcy5fJGhhbmRsZVN1YkFueSA9IG51bGw7XG4gIH1cblxufSk7XG5cblxuXG5cblxuLy8gLm1lcmdlKClcblxudmFyIE1lcmdlTGlrZSA9IHtcbiAgX29uRW1wdHk6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl9pbml0aWFsaXNlZCkgeyAgdGhpcy5fc2VuZChFTkQsIG51bGwsIHRoaXMuX2FjdGl2YXRpbmcpICB9XG4gIH1cbn07XG5cbmZ1bmN0aW9uIE1lcmdlKHNvdXJjZXMpIHtcbiAgX0Fic3RyYWN0UG9vbC5jYWxsKHRoaXMpO1xuICBpZiAoc291cmNlcy5sZW5ndGggPT09IDApIHsgIHRoaXMuX3NlbmQoRU5EKSAgfSBlbHNlIHsgIHRoaXMuX2FkZEFsbChzb3VyY2VzKSAgfVxuICB0aGlzLl9pbml0aWFsaXNlZCA9IHRydWU7XG59XG5cbmluaGVyaXQoTWVyZ2UsIF9BYnN0cmFjdFBvb2wsIGV4dGVuZCh7X25hbWU6ICdtZXJnZSd9LCBNZXJnZUxpa2UpKTtcblxuS2VmaXIubWVyZ2UgPSBmdW5jdGlvbihvYnNzKSB7XG4gIHJldHVybiBuZXcgTWVyZ2Uob2Jzcyk7XG59XG5cbk9ic2VydmFibGUucHJvdG90eXBlLm1lcmdlID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgcmV0dXJuIEtlZmlyLm1lcmdlKFt0aGlzLCBvdGhlcl0pO1xufVxuXG5cblxuXG4vLyAuY29uY2F0KClcblxuZnVuY3Rpb24gQ29uY2F0KHNvdXJjZXMpIHtcbiAgX0Fic3RyYWN0UG9vbC5jYWxsKHRoaXMsIHtjb25jdXJMaW06IDEsIHF1ZXVlTGltOiAtMX0pO1xuICBpZiAoc291cmNlcy5sZW5ndGggPT09IDApIHsgIHRoaXMuX3NlbmQoRU5EKSAgfSBlbHNlIHsgIHRoaXMuX2FkZEFsbChzb3VyY2VzKSAgfVxuICB0aGlzLl9pbml0aWFsaXNlZCA9IHRydWU7XG59XG5cbmluaGVyaXQoQ29uY2F0LCBfQWJzdHJhY3RQb29sLCBleHRlbmQoe19uYW1lOiAnY29uY2F0J30sIE1lcmdlTGlrZSkpO1xuXG5LZWZpci5jb25jYXQgPSBmdW5jdGlvbihvYnNzKSB7XG4gIHJldHVybiBuZXcgQ29uY2F0KG9ic3MpO1xufVxuXG5PYnNlcnZhYmxlLnByb3RvdHlwZS5jb25jYXQgPSBmdW5jdGlvbihvdGhlcikge1xuICByZXR1cm4gS2VmaXIuY29uY2F0KFt0aGlzLCBvdGhlcl0pO1xufVxuXG5cblxuXG5cblxuLy8gLnBvb2woKVxuXG5mdW5jdGlvbiBQb29sKCkge1xuICBfQWJzdHJhY3RQb29sLmNhbGwodGhpcyk7XG59XG5cbmluaGVyaXQoUG9vbCwgX0Fic3RyYWN0UG9vbCwge1xuXG4gIF9uYW1lOiAncG9vbCcsXG5cbiAgcGx1ZzogZnVuY3Rpb24ob2JzKSB7XG4gICAgdGhpcy5fYWRkKG9icyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIHVucGx1ZzogZnVuY3Rpb24ob2JzKSB7XG4gICAgdGhpcy5fcmVtb3ZlKG9icyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxufSk7XG5cbktlZmlyLnBvb2wgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBQb29sKCk7XG59XG5cblxuXG5cblxuLy8gLmJ1cygpXG5cbmZ1bmN0aW9uIEJ1cygpIHtcbiAgX0Fic3RyYWN0UG9vbC5jYWxsKHRoaXMpO1xufVxuXG5pbmhlcml0KEJ1cywgX0Fic3RyYWN0UG9vbCwge1xuXG4gIF9uYW1lOiAnYnVzJyxcblxuICBwbHVnOiBmdW5jdGlvbihvYnMpIHtcbiAgICB0aGlzLl9hZGQob2JzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgdW5wbHVnOiBmdW5jdGlvbihvYnMpIHtcbiAgICB0aGlzLl9yZW1vdmUob2JzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICBlbWl0OiBmdW5jdGlvbih4KSB7XG4gICAgdGhpcy5fc2VuZChWQUxVRSwgeCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIGVycm9yOiBmdW5jdGlvbih4KSB7XG4gICAgdGhpcy5fc2VuZChFUlJPUiwgeCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIGVuZDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fc2VuZChFTkQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbn0pO1xuXG5LZWZpci5idXMgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBCdXMoKTtcbn1cblxuXG5cblxuXG4vLyAuZmxhdE1hcCgpXG5cbmZ1bmN0aW9uIEZsYXRNYXAoc291cmNlLCBmbiwgb3B0aW9ucykge1xuICBfQWJzdHJhY3RQb29sLmNhbGwodGhpcywgb3B0aW9ucyk7XG4gIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcbiAgdGhpcy5fZm4gPSBmbiB8fCBpZDtcbiAgdGhpcy5fbWFpbkVuZGVkID0gZmFsc2U7XG4gIHRoaXMuX2xhc3RDdXJyZW50ID0gbnVsbDtcblxuICB2YXIgJCA9IHRoaXM7XG4gIHRoaXMuXyRoYW5kbGVNYWluU291cmNlID0gZnVuY3Rpb24oZXZlbnQpIHsgICQuX2hhbmRsZU1haW5Tb3VyY2UoZXZlbnQpICB9O1xufVxuXG5pbmhlcml0KEZsYXRNYXAsIF9BYnN0cmFjdFBvb2wsIHtcblxuICBfb25BY3RpdmF0aW9uOiBmdW5jdGlvbigpIHtcbiAgICBfQWJzdHJhY3RQb29sLnByb3RvdHlwZS5fb25BY3RpdmF0aW9uLmNhbGwodGhpcyk7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZSkge1xuICAgICAgdGhpcy5fYWN0aXZhdGluZyA9IHRydWU7XG4gICAgICB0aGlzLl9zb3VyY2Uub25BbnkodGhpcy5fJGhhbmRsZU1haW5Tb3VyY2UpO1xuICAgICAgdGhpcy5fYWN0aXZhdGluZyA9IGZhbHNlO1xuICAgIH1cbiAgfSxcbiAgX29uRGVhY3RpdmF0aW9uOiBmdW5jdGlvbigpIHtcbiAgICBfQWJzdHJhY3RQb29sLnByb3RvdHlwZS5fb25EZWFjdGl2YXRpb24uY2FsbCh0aGlzKTtcbiAgICB0aGlzLl9zb3VyY2Uub2ZmQW55KHRoaXMuXyRoYW5kbGVNYWluU291cmNlKTtcbiAgfSxcblxuICBfaGFuZGxlTWFpblNvdXJjZTogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQudHlwZSA9PT0gVkFMVUUpIHtcbiAgICAgIGlmICghZXZlbnQuY3VycmVudCB8fCB0aGlzLl9sYXN0Q3VycmVudCAhPT0gZXZlbnQudmFsdWUpIHtcbiAgICAgICAgdGhpcy5fYWRkKGV2ZW50LnZhbHVlLCB0aGlzLl9mbik7XG4gICAgICB9XG4gICAgICB0aGlzLl9sYXN0Q3VycmVudCA9IGV2ZW50LnZhbHVlO1xuICAgIH1cbiAgICBpZiAoZXZlbnQudHlwZSA9PT0gRVJST1IpIHtcbiAgICAgIHRoaXMuX3NlbmQoRVJST1IsIGV2ZW50LnZhbHVlLCBldmVudC5jdXJyZW50KTtcbiAgICB9XG4gICAgaWYgKGV2ZW50LnR5cGUgPT09IEVORCkge1xuICAgICAgaWYgKHRoaXMuX2lzRW1wdHkoKSkge1xuICAgICAgICB0aGlzLl9zZW5kKEVORCwgbnVsbCwgZXZlbnQuY3VycmVudCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9tYWluRW5kZWQgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBfb25FbXB0eTogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX21haW5FbmRlZCkgeyAgdGhpcy5fc2VuZChFTkQpICB9XG4gIH0sXG5cbiAgX2NsZWFyOiBmdW5jdGlvbigpIHtcbiAgICBfQWJzdHJhY3RQb29sLnByb3RvdHlwZS5fY2xlYXIuY2FsbCh0aGlzKTtcbiAgICB0aGlzLl9zb3VyY2UgPSBudWxsO1xuICAgIHRoaXMuX2xhc3RDdXJyZW50ID0gbnVsbDtcbiAgICB0aGlzLl8kaGFuZGxlTWFpblNvdXJjZSA9IG51bGw7XG4gIH1cblxufSk7XG5cbk9ic2VydmFibGUucHJvdG90eXBlLmZsYXRNYXAgPSBmdW5jdGlvbihmbikge1xuICByZXR1cm4gbmV3IEZsYXRNYXAodGhpcywgZm4pXG4gICAgLnNldE5hbWUodGhpcywgJ2ZsYXRNYXAnKTtcbn1cblxuT2JzZXJ2YWJsZS5wcm90b3R5cGUuZmxhdE1hcExhdGVzdCA9IGZ1bmN0aW9uKGZuKSB7XG4gIHJldHVybiBuZXcgRmxhdE1hcCh0aGlzLCBmbiwge2NvbmN1ckxpbTogMSwgZHJvcDogJ29sZCd9KVxuICAgIC5zZXROYW1lKHRoaXMsICdmbGF0TWFwTGF0ZXN0Jyk7XG59XG5cbk9ic2VydmFibGUucHJvdG90eXBlLmZsYXRNYXBGaXJzdCA9IGZ1bmN0aW9uKGZuKSB7XG4gIHJldHVybiBuZXcgRmxhdE1hcCh0aGlzLCBmbiwge2NvbmN1ckxpbTogMX0pXG4gICAgLnNldE5hbWUodGhpcywgJ2ZsYXRNYXBGaXJzdCcpO1xufVxuXG5PYnNlcnZhYmxlLnByb3RvdHlwZS5mbGF0TWFwQ29uY2F0ID0gZnVuY3Rpb24oZm4pIHtcbiAgcmV0dXJuIG5ldyBGbGF0TWFwKHRoaXMsIGZuLCB7cXVldWVMaW06IC0xLCBjb25jdXJMaW06IDF9KVxuICAgIC5zZXROYW1lKHRoaXMsICdmbGF0TWFwQ29uY2F0Jyk7XG59XG5cbk9ic2VydmFibGUucHJvdG90eXBlLmZsYXRNYXBDb25jdXJMaW1pdCA9IGZ1bmN0aW9uKGZuLCBsaW1pdCkge1xuICB2YXIgcmVzdWx0O1xuICBpZiAobGltaXQgPT09IDApIHtcbiAgICByZXN1bHQgPSBLZWZpci5uZXZlcigpO1xuICB9IGVsc2Uge1xuICAgIGlmIChsaW1pdCA8IDApIHsgIGxpbWl0ID0gLTEgIH1cbiAgICByZXN1bHQgPSBuZXcgRmxhdE1hcCh0aGlzLCBmbiwge3F1ZXVlTGltOiAtMSwgY29uY3VyTGltOiBsaW1pdH0pO1xuICB9XG4gIHJldHVybiByZXN1bHQuc2V0TmFtZSh0aGlzLCAnZmxhdE1hcENvbmN1ckxpbWl0Jyk7XG59XG5cblxuXG5cblxuXG4vLyAuemlwKClcblxuZnVuY3Rpb24gWmlwKHNvdXJjZXMsIGNvbWJpbmF0b3IpIHtcbiAgU3RyZWFtLmNhbGwodGhpcyk7XG4gIGlmIChzb3VyY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgIHRoaXMuX3NlbmQoRU5EKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9idWZmZXJzID0gbWFwKHNvdXJjZXMsIGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgICAgcmV0dXJuIGlzQXJyYXkoc291cmNlKSA/IGNsb25lQXJyYXkoc291cmNlKSA6IFtdO1xuICAgIH0pO1xuICAgIHRoaXMuX3NvdXJjZXMgPSBtYXAoc291cmNlcywgZnVuY3Rpb24oc291cmNlKSB7XG4gICAgICByZXR1cm4gaXNBcnJheShzb3VyY2UpID8gS2VmaXIubmV2ZXIoKSA6IHNvdXJjZTtcbiAgICB9KTtcbiAgICB0aGlzLl9jb21iaW5hdG9yID0gY29tYmluYXRvciA/IHNwcmVhZChjb21iaW5hdG9yLCB0aGlzLl9zb3VyY2VzLmxlbmd0aCkgOiBpZDtcbiAgICB0aGlzLl9hbGl2ZUNvdW50ID0gMDtcbiAgfVxufVxuXG5cbmluaGVyaXQoWmlwLCBTdHJlYW0sIHtcblxuICBfbmFtZTogJ3ppcCcsXG5cbiAgX29uQWN0aXZhdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGksIGxlbmd0aCA9IHRoaXMuX3NvdXJjZXMubGVuZ3RoO1xuICAgIHRoaXMuX2RyYWluQXJyYXlzKCk7XG4gICAgdGhpcy5fYWxpdmVDb3VudCA9IGxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuX3NvdXJjZXNbaV0ub25BbnkodGhpcy5fYmluZEhhbmRsZUFueShpKSwgW3RoaXMsIGldKTtcbiAgICB9XG4gIH0sXG5cbiAgX29uRGVhY3RpdmF0aW9uOiBmdW5jdGlvbigpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX3NvdXJjZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuX3NvdXJjZXNbaV0ub2ZmQW55KG51bGwsIFt0aGlzLCBpXSk7XG4gICAgfVxuICB9LFxuXG4gIF9lbWl0OiBmdW5jdGlvbihpc0N1cnJlbnQpIHtcbiAgICB2YXIgdmFsdWVzID0gbmV3IEFycmF5KHRoaXMuX2J1ZmZlcnMubGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2J1ZmZlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhbHVlc1tpXSA9IHRoaXMuX2J1ZmZlcnNbaV0uc2hpZnQoKTtcbiAgICB9XG4gICAgdGhpcy5fc2VuZChWQUxVRSwgdGhpcy5fY29tYmluYXRvcih2YWx1ZXMpLCBpc0N1cnJlbnQpO1xuICB9LFxuXG4gIF9pc0Z1bGw6IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fYnVmZmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHRoaXMuX2J1ZmZlcnNbaV0ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG5cbiAgX2VtaXRJZkZ1bGw6IGZ1bmN0aW9uKGlzQ3VycmVudCkge1xuICAgIGlmICh0aGlzLl9pc0Z1bGwoKSkge1xuICAgICAgdGhpcy5fZW1pdChpc0N1cnJlbnQpO1xuICAgIH1cbiAgfSxcblxuICBfZHJhaW5BcnJheXM6IGZ1bmN0aW9uKCkge1xuICAgIHdoaWxlICh0aGlzLl9pc0Z1bGwoKSkge1xuICAgICAgdGhpcy5fZW1pdCh0cnVlKTtcbiAgICB9XG4gIH0sXG5cbiAgX2JpbmRIYW5kbGVBbnk6IGZ1bmN0aW9uKGkpIHtcbiAgICB2YXIgJCA9IHRoaXM7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGV2ZW50KSB7ICAkLl9oYW5kbGVBbnkoaSwgZXZlbnQpICB9O1xuICB9LFxuXG4gIF9oYW5kbGVBbnk6IGZ1bmN0aW9uKGksIGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LnR5cGUgPT09IFZBTFVFKSB7XG4gICAgICB0aGlzLl9idWZmZXJzW2ldLnB1c2goZXZlbnQudmFsdWUpO1xuICAgICAgdGhpcy5fZW1pdElmRnVsbChldmVudC5jdXJyZW50KTtcbiAgICB9XG4gICAgaWYgKGV2ZW50LnR5cGUgPT09IEVSUk9SKSB7XG4gICAgICB0aGlzLl9zZW5kKEVSUk9SLCBldmVudC52YWx1ZSwgZXZlbnQuY3VycmVudCk7XG4gICAgfVxuICAgIGlmIChldmVudC50eXBlID09PSBFTkQpIHtcbiAgICAgIHRoaXMuX2FsaXZlQ291bnQtLTtcbiAgICAgIGlmICh0aGlzLl9hbGl2ZUNvdW50ID09PSAwKSB7XG4gICAgICAgIHRoaXMuX3NlbmQoRU5ELCBudWxsLCBldmVudC5jdXJyZW50KTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgX2NsZWFyOiBmdW5jdGlvbigpIHtcbiAgICBTdHJlYW0ucHJvdG90eXBlLl9jbGVhci5jYWxsKHRoaXMpO1xuICAgIHRoaXMuX3NvdXJjZXMgPSBudWxsO1xuICAgIHRoaXMuX2J1ZmZlcnMgPSBudWxsO1xuICAgIHRoaXMuX2NvbWJpbmF0b3IgPSBudWxsO1xuICB9XG5cbn0pO1xuXG5LZWZpci56aXAgPSBmdW5jdGlvbihzb3VyY2VzLCBjb21iaW5hdG9yKSB7XG4gIHJldHVybiBuZXcgWmlwKHNvdXJjZXMsIGNvbWJpbmF0b3IpO1xufVxuXG5PYnNlcnZhYmxlLnByb3RvdHlwZS56aXAgPSBmdW5jdGlvbihvdGhlciwgY29tYmluYXRvcikge1xuICByZXR1cm4gbmV3IFppcChbdGhpcywgb3RoZXJdLCBjb21iaW5hdG9yKTtcbn1cblxuXG5cblxuXG5cbi8vIC5zYW1wbGVkQnkoKVxuXG5mdW5jdGlvbiBTYW1wbGVkQnkocGFzc2l2ZSwgYWN0aXZlLCBjb21iaW5hdG9yKSB7XG4gIFN0cmVhbS5jYWxsKHRoaXMpO1xuICBpZiAoYWN0aXZlLmxlbmd0aCA9PT0gMCkge1xuICAgIHRoaXMuX3NlbmQoRU5EKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9wYXNzaXZlQ291bnQgPSBwYXNzaXZlLmxlbmd0aDtcbiAgICB0aGlzLl9zb3VyY2VzID0gY29uY2F0KHBhc3NpdmUsIGFjdGl2ZSk7XG4gICAgdGhpcy5fY29tYmluYXRvciA9IGNvbWJpbmF0b3IgPyBzcHJlYWQoY29tYmluYXRvciwgdGhpcy5fc291cmNlcy5sZW5ndGgpIDogaWQ7XG4gICAgdGhpcy5fYWxpdmVDb3VudCA9IDA7XG4gICAgdGhpcy5fY3VycmVudHMgPSBuZXcgQXJyYXkodGhpcy5fc291cmNlcy5sZW5ndGgpO1xuICAgIGZpbGxBcnJheSh0aGlzLl9jdXJyZW50cywgTk9USElORyk7XG4gICAgdGhpcy5fYWN0aXZhdGluZyA9IGZhbHNlO1xuICAgIHRoaXMuX2VtaXRBZnRlckFjdGl2YXRpb24gPSBmYWxzZTtcbiAgICB0aGlzLl9lbmRBZnRlckFjdGl2YXRpb24gPSBmYWxzZTtcbiAgfVxufVxuXG5cbmluaGVyaXQoU2FtcGxlZEJ5LCBTdHJlYW0sIHtcblxuICBfbmFtZTogJ3NhbXBsZWRCeScsXG5cbiAgX29uQWN0aXZhdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxlbmd0aCA9IHRoaXMuX3NvdXJjZXMubGVuZ3RoLFxuICAgICAgICBpO1xuICAgIHRoaXMuX2FsaXZlQ291bnQgPSBsZW5ndGggLSB0aGlzLl9wYXNzaXZlQ291bnQ7XG4gICAgdGhpcy5fYWN0aXZhdGluZyA9IHRydWU7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLl9zb3VyY2VzW2ldLm9uQW55KHRoaXMuX2JpbmRIYW5kbGVBbnkoaSksIFt0aGlzLCBpXSk7XG4gICAgfVxuICAgIHRoaXMuX2FjdGl2YXRpbmcgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5fZW1pdEFmdGVyQWN0aXZhdGlvbikge1xuICAgICAgdGhpcy5fZW1pdEFmdGVyQWN0aXZhdGlvbiA9IGZhbHNlO1xuICAgICAgdGhpcy5fZW1pdElmRnVsbCh0cnVlKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2VuZEFmdGVyQWN0aXZhdGlvbikge1xuICAgICAgdGhpcy5fc2VuZChFTkQsIG51bGwsIHRydWUpO1xuICAgIH1cbiAgfSxcblxuICBfb25EZWFjdGl2YXRpb246IGZ1bmN0aW9uKCkge1xuICAgIHZhciBsZW5ndGggPSB0aGlzLl9zb3VyY2VzLmxlbmd0aCxcbiAgICAgICAgaTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuX3NvdXJjZXNbaV0ub2ZmQW55KG51bGwsIFt0aGlzLCBpXSk7XG4gICAgfVxuICB9LFxuXG4gIF9lbWl0SWZGdWxsOiBmdW5jdGlvbihpc0N1cnJlbnQpIHtcbiAgICBpZiAoIWNvbnRhaW5zKHRoaXMuX2N1cnJlbnRzLCBOT1RISU5HKSkge1xuICAgICAgdmFyIGNvbWJpbmVkID0gY2xvbmVBcnJheSh0aGlzLl9jdXJyZW50cyk7XG4gICAgICBjb21iaW5lZCA9IHRoaXMuX2NvbWJpbmF0b3IoY29tYmluZWQpO1xuICAgICAgdGhpcy5fc2VuZChWQUxVRSwgY29tYmluZWQsIGlzQ3VycmVudCk7XG4gICAgfVxuICB9LFxuXG4gIF9iaW5kSGFuZGxlQW55OiBmdW5jdGlvbihpKSB7XG4gICAgdmFyICQgPSB0aGlzO1xuICAgIHJldHVybiBmdW5jdGlvbihldmVudCkgeyAgJC5faGFuZGxlQW55KGksIGV2ZW50KSAgfTtcbiAgfSxcblxuICBfaGFuZGxlQW55OiBmdW5jdGlvbihpLCBldmVudCkge1xuICAgIGlmIChldmVudC50eXBlID09PSBWQUxVRSkge1xuICAgICAgdGhpcy5fY3VycmVudHNbaV0gPSBldmVudC52YWx1ZTtcbiAgICAgIGlmIChpID49IHRoaXMuX3Bhc3NpdmVDb3VudCkge1xuICAgICAgICBpZiAodGhpcy5fYWN0aXZhdGluZykge1xuICAgICAgICAgIHRoaXMuX2VtaXRBZnRlckFjdGl2YXRpb24gPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX2VtaXRJZkZ1bGwoZXZlbnQuY3VycmVudCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGV2ZW50LnR5cGUgPT09IEVSUk9SKSB7XG4gICAgICB0aGlzLl9zZW5kKEVSUk9SLCBldmVudC52YWx1ZSwgZXZlbnQuY3VycmVudCk7XG4gICAgfVxuICAgIGlmIChldmVudC50eXBlID09PSBFTkQpIHtcbiAgICAgIGlmIChpID49IHRoaXMuX3Bhc3NpdmVDb3VudCkge1xuICAgICAgICB0aGlzLl9hbGl2ZUNvdW50LS07XG4gICAgICAgIGlmICh0aGlzLl9hbGl2ZUNvdW50ID09PSAwKSB7XG4gICAgICAgICAgaWYgKHRoaXMuX2FjdGl2YXRpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuX2VuZEFmdGVyQWN0aXZhdGlvbiA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3NlbmQoRU5ELCBudWxsLCBldmVudC5jdXJyZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgX2NsZWFyOiBmdW5jdGlvbigpIHtcbiAgICBTdHJlYW0ucHJvdG90eXBlLl9jbGVhci5jYWxsKHRoaXMpO1xuICAgIHRoaXMuX3NvdXJjZXMgPSBudWxsO1xuICAgIHRoaXMuX2N1cnJlbnRzID0gbnVsbDtcbiAgICB0aGlzLl9jb21iaW5hdG9yID0gbnVsbDtcbiAgfVxuXG59KTtcblxuS2VmaXIuc2FtcGxlZEJ5ID0gZnVuY3Rpb24ocGFzc2l2ZSwgYWN0aXZlLCBjb21iaW5hdG9yKSB7XG4gIHJldHVybiBuZXcgU2FtcGxlZEJ5KHBhc3NpdmUsIGFjdGl2ZSwgY29tYmluYXRvcik7XG59XG5cbk9ic2VydmFibGUucHJvdG90eXBlLnNhbXBsZWRCeSA9IGZ1bmN0aW9uKG90aGVyLCBjb21iaW5hdG9yKSB7XG4gIHJldHVybiBLZWZpci5zYW1wbGVkQnkoW3RoaXNdLCBbb3RoZXJdLCBjb21iaW5hdG9yIHx8IGlkKTtcbn1cblxuXG5cblxuLy8gLmNvbWJpbmUoKVxuXG5LZWZpci5jb21iaW5lID0gZnVuY3Rpb24oc291cmNlcywgY29tYmluYXRvcikge1xuICByZXR1cm4gbmV3IFNhbXBsZWRCeShbXSwgc291cmNlcywgY29tYmluYXRvcikuc2V0TmFtZSgnY29tYmluZScpO1xufVxuXG5PYnNlcnZhYmxlLnByb3RvdHlwZS5jb21iaW5lID0gZnVuY3Rpb24ob3RoZXIsIGNvbWJpbmF0b3IpIHtcbiAgcmV0dXJuIEtlZmlyLmNvbWJpbmUoW3RoaXMsIG90aGVyXSwgY29tYmluYXRvcik7XG59XG5cbmZ1bmN0aW9uIHByb2R1Y2VTdHJlYW0oU3RyZWFtQ2xhc3MsIFByb3BlcnR5Q2xhc3MpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkgeyAgcmV0dXJuIG5ldyBTdHJlYW1DbGFzcyh0aGlzLCBhcmd1bWVudHMpICB9XG59XG5mdW5jdGlvbiBwcm9kdWNlUHJvcGVydHkoU3RyZWFtQ2xhc3MsIFByb3BlcnR5Q2xhc3MpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkgeyAgcmV0dXJuIG5ldyBQcm9wZXJ0eUNsYXNzKHRoaXMsIGFyZ3VtZW50cykgIH1cbn1cblxuXG5cbi8vIC50b1Byb3BlcnR5KClcblxud2l0aE9uZVNvdXJjZSgndG9Qcm9wZXJ0eScsIHtcbiAgX2luaXQ6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICBpZiAoYXJncy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLl9zZW5kKFZBTFVFLCBhcmdzWzBdKTtcbiAgICB9XG4gIH1cbn0sIHtwcm9wZXJ0eU1ldGhvZDogcHJvZHVjZVByb3BlcnR5LCBzdHJlYW1NZXRob2Q6IHByb2R1Y2VQcm9wZXJ0eX0pO1xuXG5cblxuLy8gLndpdGhEZWZhdWx0IChEZXByZWNhdGVkKVxuXG5TdHJlYW0ucHJvdG90eXBlLndpdGhEZWZhdWx0ID0gU3RyZWFtLnByb3RvdHlwZS50b1Byb3BlcnR5O1xuUHJvcGVydHkucHJvdG90eXBlLndpdGhEZWZhdWx0ID0gUHJvcGVydHkucHJvdG90eXBlLnRvUHJvcGVydHk7XG5cblxuXG5cblxuLy8gLmNoYW5nZXMoKVxuXG53aXRoT25lU291cmNlKCdjaGFuZ2VzJywge1xuICBfaGFuZGxlVmFsdWU6IGZ1bmN0aW9uKHgsIGlzQ3VycmVudCkge1xuICAgIGlmICghaXNDdXJyZW50KSB7XG4gICAgICB0aGlzLl9zZW5kKFZBTFVFLCB4KTtcbiAgICB9XG4gIH0sXG4gIF9oYW5kbGVFcnJvcjogZnVuY3Rpb24oeCwgaXNDdXJyZW50KSB7XG4gICAgaWYgKCFpc0N1cnJlbnQpIHtcbiAgICAgIHRoaXMuX3NlbmQoRVJST1IsIHgpO1xuICAgIH1cbiAgfVxufSwge1xuICBzdHJlYW1NZXRob2Q6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfSxcbiAgcHJvcGVydHlNZXRob2Q6IHByb2R1Y2VTdHJlYW1cbn0pO1xuXG5cblxuXG4vLyAud2l0aEhhbmRsZXIoKVxuXG53aXRoT25lU291cmNlKCd3aXRoSGFuZGxlcicsIHtcbiAgX2luaXQ6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICB0aGlzLl9oYW5kbGVyID0gYXJnc1swXTtcbiAgICB0aGlzLl9mb3JjZWRDdXJyZW50ID0gZmFsc2U7XG4gICAgdmFyICQgPSB0aGlzO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSB7XG4gICAgICBlbWl0OiBmdW5jdGlvbih4KSB7ICAkLl9zZW5kKFZBTFVFLCB4LCAkLl9mb3JjZWRDdXJyZW50KSAgfSxcbiAgICAgIGVycm9yOiBmdW5jdGlvbih4KSB7ICAkLl9zZW5kKEVSUk9SLCB4LCAkLl9mb3JjZWRDdXJyZW50KSAgfSxcbiAgICAgIGVuZDogZnVuY3Rpb24oKSB7ICAkLl9zZW5kKEVORCwgbnVsbCwgJC5fZm9yY2VkQ3VycmVudCkgIH1cbiAgICB9XG4gIH0sXG4gIF9mcmVlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9oYW5kbGVyID0gbnVsbDtcbiAgICB0aGlzLl9lbWl0dGVyID0gbnVsbDtcbiAgfSxcbiAgX2hhbmRsZUFueTogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB0aGlzLl9mb3JjZWRDdXJyZW50ID0gZXZlbnQuY3VycmVudDtcbiAgICB0aGlzLl9oYW5kbGVyKHRoaXMuX2VtaXR0ZXIsIGV2ZW50KTtcbiAgICB0aGlzLl9mb3JjZWRDdXJyZW50ID0gZmFsc2U7XG4gIH1cbn0pO1xuXG5cblxuXG4vLyAuZmxhdHRlbihmbilcblxud2l0aE9uZVNvdXJjZSgnZmxhdHRlbicsIHtcbiAgX2luaXQ6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICB0aGlzLl9mbiA9IGFyZ3NbMF0gPyBhcmdzWzBdIDogaWQ7XG4gIH0sXG4gIF9mcmVlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9mbiA9IG51bGw7XG4gIH0sXG4gIF9oYW5kbGVWYWx1ZTogZnVuY3Rpb24oeCwgaXNDdXJyZW50KSB7XG4gICAgdmFyIHhzID0gdGhpcy5fZm4oeCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5fc2VuZChWQUxVRSwgeHNbaV0sIGlzQ3VycmVudCk7XG4gICAgfVxuICB9XG59KTtcblxuXG5cblxuXG5cblxuLy8gLnRyYW5zZHVjZSh0cmFuc2R1Y2VyKVxuXG5mdW5jdGlvbiB4Zm9ybUZvck9icyhvYnMpIHtcbiAgcmV0dXJuIHtcbiAgICBzdGVwOiBmdW5jdGlvbihyZXMsIGlucHV0KSB7XG4gICAgICBvYnMuX3NlbmQoVkFMVUUsIGlucHV0LCBvYnMuX2ZvcmNlZEN1cnJlbnQpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcbiAgICByZXN1bHQ6IGZ1bmN0aW9uKHJlcykge1xuICAgICAgb2JzLl9zZW5kKEVORCwgbnVsbCwgb2JzLl9mb3JjZWRDdXJyZW50KTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfTtcbn1cblxud2l0aE9uZVNvdXJjZSgndHJhbnNkdWNlJywge1xuICBfaW5pdDogZnVuY3Rpb24oYXJncykge1xuICAgIHRoaXMuX3hmb3JtID0gYXJnc1swXSh4Zm9ybUZvck9icyh0aGlzKSk7XG4gIH0sXG4gIF9mcmVlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl94Zm9ybSA9IG51bGw7XG4gIH0sXG4gIF9oYW5kbGVWYWx1ZTogZnVuY3Rpb24oeCwgaXNDdXJyZW50KSB7XG4gICAgdGhpcy5fZm9yY2VkQ3VycmVudCA9IGlzQ3VycmVudDtcbiAgICBpZiAodGhpcy5feGZvcm0uc3RlcChudWxsLCB4KSAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5feGZvcm0ucmVzdWx0KG51bGwpO1xuICAgIH1cbiAgICB0aGlzLl9mb3JjZWRDdXJyZW50ID0gZmFsc2U7XG4gIH0sXG4gIF9oYW5kbGVFbmQ6IGZ1bmN0aW9uKF9fLCBpc0N1cnJlbnQpIHtcbiAgICB0aGlzLl9mb3JjZWRDdXJyZW50ID0gaXNDdXJyZW50O1xuICAgIHRoaXMuX3hmb3JtLnJlc3VsdChudWxsKTtcbiAgICB0aGlzLl9mb3JjZWRDdXJyZW50ID0gZmFsc2U7XG4gIH1cbn0pO1xuXG5cblxuXG5cbnZhciB3aXRoRm5BcmdNaXhpbiA9IHtcbiAgX2luaXQ6IGZ1bmN0aW9uKGFyZ3MpIHsgIHRoaXMuX2ZuID0gYXJnc1swXSB8fCBpZCAgfSxcbiAgX2ZyZWU6IGZ1bmN0aW9uKCkgeyAgdGhpcy5fZm4gPSBudWxsICB9XG59O1xuXG5cblxuLy8gLm1hcChmbilcblxud2l0aE9uZVNvdXJjZSgnbWFwJywgZXh0ZW5kKHtcbiAgX2hhbmRsZVZhbHVlOiBmdW5jdGlvbih4LCBpc0N1cnJlbnQpIHtcbiAgICB0aGlzLl9zZW5kKFZBTFVFLCB0aGlzLl9mbih4KSwgaXNDdXJyZW50KTtcbiAgfVxufSwgd2l0aEZuQXJnTWl4aW4pKTtcblxuXG5cblxuLy8gLm1hcEVycm9ycyhmbilcblxud2l0aE9uZVNvdXJjZSgnbWFwRXJyb3JzJywgZXh0ZW5kKHtcbiAgX2hhbmRsZUVycm9yOiBmdW5jdGlvbih4LCBpc0N1cnJlbnQpIHtcbiAgICB0aGlzLl9zZW5kKEVSUk9SLCB0aGlzLl9mbih4KSwgaXNDdXJyZW50KTtcbiAgfVxufSwgd2l0aEZuQXJnTWl4aW4pKTtcblxuXG5cbi8vIC5lcnJvcnNUb1ZhbHVlcyhmbilcblxuZnVuY3Rpb24gZGVmYXVsdEVycm9yc1RvVmFsdWVzSGFuZGxlcih4KSB7XG4gIHJldHVybiB7XG4gICAgY29udmVydDogdHJ1ZSxcbiAgICB2YWx1ZTogeFxuICB9O1xufVxuXG53aXRoT25lU291cmNlKCdlcnJvcnNUb1ZhbHVlcycsIGV4dGVuZCh7XG4gIF9pbml0OiBmdW5jdGlvbihhcmdzKSB7XG4gICAgdGhpcy5fZm4gPSBhcmdzWzBdIHx8IGRlZmF1bHRFcnJvcnNUb1ZhbHVlc0hhbmRsZXI7XG4gIH0sXG4gIF9mcmVlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9mbiA9IG51bGw7XG4gIH0sXG4gIF9oYW5kbGVFcnJvcjogZnVuY3Rpb24oeCwgaXNDdXJyZW50KSB7XG4gICAgdmFyIHJlc3VsdCA9IHRoaXMuX2ZuKHgpO1xuICAgIHZhciB0eXBlID0gcmVzdWx0LmNvbnZlcnQgPyBWQUxVRSA6IEVSUk9SO1xuICAgIHZhciBuZXdYID0gcmVzdWx0LmNvbnZlcnQgPyByZXN1bHQudmFsdWUgOiB4O1xuICAgIHRoaXMuX3NlbmQodHlwZSwgbmV3WCwgaXNDdXJyZW50KTtcbiAgfVxufSkpO1xuXG5cblxuLy8gLnZhbHVlc1RvRXJyb3JzKGZuKVxuXG5mdW5jdGlvbiBkZWZhdWx0VmFsdWVzVG9FcnJvcnNIYW5kbGVyKHgpIHtcbiAgcmV0dXJuIHtcbiAgICBjb252ZXJ0OiB0cnVlLFxuICAgIGVycm9yOiB4XG4gIH07XG59XG5cbndpdGhPbmVTb3VyY2UoJ3ZhbHVlc1RvRXJyb3JzJywgZXh0ZW5kKHtcbiAgX2luaXQ6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICB0aGlzLl9mbiA9IGFyZ3NbMF0gfHwgZGVmYXVsdFZhbHVlc1RvRXJyb3JzSGFuZGxlcjtcbiAgfSxcbiAgX2ZyZWU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2ZuID0gbnVsbDtcbiAgfSxcbiAgX2hhbmRsZVZhbHVlOiBmdW5jdGlvbih4LCBpc0N1cnJlbnQpIHtcbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5fZm4oeCk7XG4gICAgdmFyIHR5cGUgPSByZXN1bHQuY29udmVydCA/IEVSUk9SIDogVkFMVUU7XG4gICAgdmFyIG5ld1ggPSByZXN1bHQuY29udmVydCA/IHJlc3VsdC5lcnJvciA6IHg7XG4gICAgdGhpcy5fc2VuZCh0eXBlLCBuZXdYLCBpc0N1cnJlbnQpO1xuICB9XG59KSk7XG5cblxuXG5cbi8vIC5maWx0ZXIoZm4pXG5cbndpdGhPbmVTb3VyY2UoJ2ZpbHRlcicsIGV4dGVuZCh7XG4gIF9oYW5kbGVWYWx1ZTogZnVuY3Rpb24oeCwgaXNDdXJyZW50KSB7XG4gICAgaWYgKHRoaXMuX2ZuKHgpKSB7XG4gICAgICB0aGlzLl9zZW5kKFZBTFVFLCB4LCBpc0N1cnJlbnQpO1xuICAgIH1cbiAgfVxufSwgd2l0aEZuQXJnTWl4aW4pKTtcblxuXG5cblxuLy8gLmZpbHRlckVycm9ycyhmbilcblxud2l0aE9uZVNvdXJjZSgnZmlsdGVyRXJyb3JzJywgZXh0ZW5kKHtcbiAgX2hhbmRsZUVycm9yOiBmdW5jdGlvbih4LCBpc0N1cnJlbnQpIHtcbiAgICBpZiAodGhpcy5fZm4oeCkpIHtcbiAgICAgIHRoaXMuX3NlbmQoRVJST1IsIHgsIGlzQ3VycmVudCk7XG4gICAgfVxuICB9XG59LCB3aXRoRm5BcmdNaXhpbikpO1xuXG5cblxuXG4vLyAudGFrZVdoaWxlKGZuKVxuXG53aXRoT25lU291cmNlKCd0YWtlV2hpbGUnLCBleHRlbmQoe1xuICBfaGFuZGxlVmFsdWU6IGZ1bmN0aW9uKHgsIGlzQ3VycmVudCkge1xuICAgIGlmICh0aGlzLl9mbih4KSkge1xuICAgICAgdGhpcy5fc2VuZChWQUxVRSwgeCwgaXNDdXJyZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc2VuZChFTkQsIG51bGwsIGlzQ3VycmVudCk7XG4gICAgfVxuICB9XG59LCB3aXRoRm5BcmdNaXhpbikpO1xuXG5cblxuXG5cbi8vIC50YWtlKG4pXG5cbndpdGhPbmVTb3VyY2UoJ3Rha2UnLCB7XG4gIF9pbml0OiBmdW5jdGlvbihhcmdzKSB7XG4gICAgdGhpcy5fbiA9IGFyZ3NbMF07XG4gICAgaWYgKHRoaXMuX24gPD0gMCkge1xuICAgICAgdGhpcy5fc2VuZChFTkQpO1xuICAgIH1cbiAgfSxcbiAgX2hhbmRsZVZhbHVlOiBmdW5jdGlvbih4LCBpc0N1cnJlbnQpIHtcbiAgICB0aGlzLl9uLS07XG4gICAgdGhpcy5fc2VuZChWQUxVRSwgeCwgaXNDdXJyZW50KTtcbiAgICBpZiAodGhpcy5fbiA9PT0gMCkge1xuICAgICAgdGhpcy5fc2VuZChFTkQsIG51bGwsIGlzQ3VycmVudCk7XG4gICAgfVxuICB9XG59KTtcblxuXG5cblxuXG4vLyAuc2tpcChuKVxuXG53aXRoT25lU291cmNlKCdza2lwJywge1xuICBfaW5pdDogZnVuY3Rpb24oYXJncykge1xuICAgIHRoaXMuX24gPSBNYXRoLm1heCgwLCBhcmdzWzBdKTtcbiAgfSxcbiAgX2hhbmRsZVZhbHVlOiBmdW5jdGlvbih4LCBpc0N1cnJlbnQpIHtcbiAgICBpZiAodGhpcy5fbiA9PT0gMCkge1xuICAgICAgdGhpcy5fc2VuZChWQUxVRSwgeCwgaXNDdXJyZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbi0tO1xuICAgIH1cbiAgfVxufSk7XG5cblxuXG5cbi8vIC5za2lwRHVwbGljYXRlcyhbZm5dKVxuXG53aXRoT25lU291cmNlKCdza2lwRHVwbGljYXRlcycsIHtcbiAgX2luaXQ6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICB0aGlzLl9mbiA9IGFyZ3NbMF0gfHwgc3RyaWN0RXF1YWw7XG4gICAgdGhpcy5fcHJldiA9IE5PVEhJTkc7XG4gIH0sXG4gIF9mcmVlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9mbiA9IG51bGw7XG4gICAgdGhpcy5fcHJldiA9IG51bGw7XG4gIH0sXG4gIF9oYW5kbGVWYWx1ZTogZnVuY3Rpb24oeCwgaXNDdXJyZW50KSB7XG4gICAgaWYgKHRoaXMuX3ByZXYgPT09IE5PVEhJTkcgfHwgIXRoaXMuX2ZuKHRoaXMuX3ByZXYsIHgpKSB7XG4gICAgICB0aGlzLl9zZW5kKFZBTFVFLCB4LCBpc0N1cnJlbnQpO1xuICAgICAgdGhpcy5fcHJldiA9IHg7XG4gICAgfVxuICB9XG59KTtcblxuXG5cblxuXG4vLyAuc2tpcFdoaWxlKGZuKVxuXG53aXRoT25lU291cmNlKCdza2lwV2hpbGUnLCB7XG4gIF9pbml0OiBmdW5jdGlvbihhcmdzKSB7XG4gICAgdGhpcy5fZm4gPSBhcmdzWzBdIHx8IGlkO1xuICAgIHRoaXMuX3NraXAgPSB0cnVlO1xuICB9LFxuICBfZnJlZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fZm4gPSBudWxsO1xuICB9LFxuICBfaGFuZGxlVmFsdWU6IGZ1bmN0aW9uKHgsIGlzQ3VycmVudCkge1xuICAgIGlmICghdGhpcy5fc2tpcCkge1xuICAgICAgdGhpcy5fc2VuZChWQUxVRSwgeCwgaXNDdXJyZW50KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCF0aGlzLl9mbih4KSkge1xuICAgICAgdGhpcy5fc2tpcCA9IGZhbHNlO1xuICAgICAgdGhpcy5fZm4gPSBudWxsO1xuICAgICAgdGhpcy5fc2VuZChWQUxVRSwgeCwgaXNDdXJyZW50KTtcbiAgICB9XG4gIH1cbn0pO1xuXG5cblxuXG5cbi8vIC5kaWZmKGZuLCBzZWVkKVxuXG53aXRoT25lU291cmNlKCdkaWZmJywge1xuICBfaW5pdDogZnVuY3Rpb24oYXJncykge1xuICAgIHRoaXMuX2ZuID0gYXJnc1swXSB8fCBkZWZhdWx0RGlmZjtcbiAgICB0aGlzLl9wcmV2ID0gYXJncy5sZW5ndGggPiAxID8gYXJnc1sxXSA6IE5PVEhJTkc7XG4gIH0sXG4gIF9mcmVlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9wcmV2ID0gbnVsbDtcbiAgICB0aGlzLl9mbiA9IG51bGw7XG4gIH0sXG4gIF9oYW5kbGVWYWx1ZTogZnVuY3Rpb24oeCwgaXNDdXJyZW50KSB7XG4gICAgaWYgKHRoaXMuX3ByZXYgIT09IE5PVEhJTkcpIHtcbiAgICAgIHRoaXMuX3NlbmQoVkFMVUUsIHRoaXMuX2ZuKHRoaXMuX3ByZXYsIHgpLCBpc0N1cnJlbnQpO1xuICAgIH1cbiAgICB0aGlzLl9wcmV2ID0geDtcbiAgfVxufSk7XG5cblxuXG5cblxuLy8gLnNjYW4oZm4sIHNlZWQpXG5cbndpdGhPbmVTb3VyY2UoJ3NjYW4nLCB7XG4gIF9pbml0OiBmdW5jdGlvbihhcmdzKSB7XG4gICAgdGhpcy5fZm4gPSBhcmdzWzBdO1xuICAgIGlmIChhcmdzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHRoaXMuX3NlbmQoVkFMVUUsIGFyZ3NbMV0sIHRydWUpO1xuICAgIH1cbiAgfSxcbiAgX2ZyZWU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2ZuID0gbnVsbDtcbiAgfSxcbiAgX2hhbmRsZVZhbHVlOiBmdW5jdGlvbih4LCBpc0N1cnJlbnQpIHtcbiAgICBpZiAodGhpcy5fY3VycmVudCAhPT0gTk9USElORykge1xuICAgICAgeCA9IHRoaXMuX2ZuKHRoaXMuX2N1cnJlbnQsIHgpO1xuICAgIH1cbiAgICB0aGlzLl9zZW5kKFZBTFVFLCB4LCBpc0N1cnJlbnQpO1xuICB9XG59LCB7c3RyZWFtTWV0aG9kOiBwcm9kdWNlUHJvcGVydHl9KTtcblxuXG5cblxuXG4vLyAucmVkdWNlKGZuLCBzZWVkKVxuXG53aXRoT25lU291cmNlKCdyZWR1Y2UnLCB7XG4gIF9pbml0OiBmdW5jdGlvbihhcmdzKSB7XG4gICAgdGhpcy5fZm4gPSBhcmdzWzBdO1xuICAgIHRoaXMuX3Jlc3VsdCA9IGFyZ3MubGVuZ3RoID4gMSA/IGFyZ3NbMV0gOiBOT1RISU5HO1xuICB9LFxuICBfZnJlZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fZm4gPSBudWxsO1xuICAgIHRoaXMuX3Jlc3VsdCA9IG51bGw7XG4gIH0sXG4gIF9oYW5kbGVWYWx1ZTogZnVuY3Rpb24oeCkge1xuICAgIHRoaXMuX3Jlc3VsdCA9ICh0aGlzLl9yZXN1bHQgPT09IE5PVEhJTkcpID8geCA6IHRoaXMuX2ZuKHRoaXMuX3Jlc3VsdCwgeCk7XG4gIH0sXG4gIF9oYW5kbGVFbmQ6IGZ1bmN0aW9uKF9fLCBpc0N1cnJlbnQpIHtcbiAgICBpZiAodGhpcy5fcmVzdWx0ICE9PSBOT1RISU5HKSB7XG4gICAgICB0aGlzLl9zZW5kKFZBTFVFLCB0aGlzLl9yZXN1bHQsIGlzQ3VycmVudCk7XG4gICAgfVxuICAgIHRoaXMuX3NlbmQoRU5ELCBudWxsLCBpc0N1cnJlbnQpO1xuICB9XG59KTtcblxuXG5cblxuLy8gLm1hcEVuZChmbilcblxud2l0aE9uZVNvdXJjZSgnbWFwRW5kJywge1xuICBfaW5pdDogZnVuY3Rpb24oYXJncykge1xuICAgIHRoaXMuX2ZuID0gYXJnc1swXTtcbiAgfSxcbiAgX2ZyZWU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2ZuID0gbnVsbDtcbiAgfSxcbiAgX2hhbmRsZUVuZDogZnVuY3Rpb24oX18sIGlzQ3VycmVudCkge1xuICAgIHRoaXMuX3NlbmQoVkFMVUUsIHRoaXMuX2ZuKCksIGlzQ3VycmVudCk7XG4gICAgdGhpcy5fc2VuZChFTkQsIG51bGwsIGlzQ3VycmVudCk7XG4gIH1cbn0pO1xuXG5cblxuXG4vLyAuc2tpcFZhbHVlKClcblxud2l0aE9uZVNvdXJjZSgnc2tpcFZhbHVlcycsIHtcbiAgX2hhbmRsZVZhbHVlOiBmdW5jdGlvbigpIHt9XG59KTtcblxuXG5cbi8vIC5za2lwRXJyb3IoKVxuXG53aXRoT25lU291cmNlKCdza2lwRXJyb3JzJywge1xuICBfaGFuZGxlRXJyb3I6IGZ1bmN0aW9uKCkge31cbn0pO1xuXG5cblxuLy8gLnNraXBFbmQoKVxuXG53aXRoT25lU291cmNlKCdza2lwRW5kJywge1xuICBfaGFuZGxlRW5kOiBmdW5jdGlvbigpIHt9XG59KTtcblxuXG5cbi8vIC5lbmRPbkVycm9yKGZuKVxuXG53aXRoT25lU291cmNlKCdlbmRPbkVycm9yJywgZXh0ZW5kKHtcbiAgX2hhbmRsZUVycm9yOiBmdW5jdGlvbih4LCBpc0N1cnJlbnQpIHtcbiAgICB0aGlzLl9zZW5kKEVSUk9SLCB4LCBpc0N1cnJlbnQpO1xuICAgIHRoaXMuX3NlbmQoRU5ELCBudWxsLCBpc0N1cnJlbnQpO1xuICB9XG59KSk7XG5cblxuXG4vLyAuc2xpZGluZ1dpbmRvdyhtYXhbLCBtaW5dKVxuXG53aXRoT25lU291cmNlKCdzbGlkaW5nV2luZG93Jywge1xuICBfaW5pdDogZnVuY3Rpb24oYXJncykge1xuICAgIHRoaXMuX21heCA9IGFyZ3NbMF07XG4gICAgdGhpcy5fbWluID0gYXJnc1sxXSB8fCAwO1xuICAgIHRoaXMuX2J1ZmYgPSBbXTtcbiAgfSxcbiAgX2ZyZWU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2J1ZmYgPSBudWxsO1xuICB9LFxuICBfaGFuZGxlVmFsdWU6IGZ1bmN0aW9uKHgsIGlzQ3VycmVudCkge1xuICAgIHRoaXMuX2J1ZmYgPSBzbGlkZSh0aGlzLl9idWZmLCB4LCB0aGlzLl9tYXgpO1xuICAgIGlmICh0aGlzLl9idWZmLmxlbmd0aCA+PSB0aGlzLl9taW4pIHtcbiAgICAgIHRoaXMuX3NlbmQoVkFMVUUsIHRoaXMuX2J1ZmYsIGlzQ3VycmVudCk7XG4gICAgfVxuICB9XG59KTtcblxuXG5cblxuLy8gLmJ1ZmZlcldoaWxlKFtwcmVkaWNhdGVdLCBbb3B0aW9uc10pXG5cbndpdGhPbmVTb3VyY2UoJ2J1ZmZlcldoaWxlJywge1xuICBfaW5pdDogZnVuY3Rpb24oYXJncykge1xuICAgIHRoaXMuX2ZuID0gYXJnc1swXSB8fCBpZDtcbiAgICB0aGlzLl9mbHVzaE9uRW5kID0gZ2V0KGFyZ3NbMV0sICdmbHVzaE9uRW5kJywgdHJ1ZSk7XG4gICAgdGhpcy5fYnVmZiA9IFtdO1xuICB9LFxuICBfZnJlZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fYnVmZiA9IG51bGw7XG4gIH0sXG4gIF9mbHVzaDogZnVuY3Rpb24oaXNDdXJyZW50KSB7XG4gICAgaWYgKHRoaXMuX2J1ZmYgIT09IG51bGwgJiYgdGhpcy5fYnVmZi5sZW5ndGggIT09IDApIHtcbiAgICAgIHRoaXMuX3NlbmQoVkFMVUUsIHRoaXMuX2J1ZmYsIGlzQ3VycmVudCk7XG4gICAgICB0aGlzLl9idWZmID0gW107XG4gICAgfVxuICB9LFxuICBfaGFuZGxlVmFsdWU6IGZ1bmN0aW9uKHgsIGlzQ3VycmVudCkge1xuICAgIHRoaXMuX2J1ZmYucHVzaCh4KTtcbiAgICBpZiAoIXRoaXMuX2ZuKHgpKSB7XG4gICAgICB0aGlzLl9mbHVzaChpc0N1cnJlbnQpO1xuICAgIH1cbiAgfSxcbiAgX2hhbmRsZUVuZDogZnVuY3Rpb24oeCwgaXNDdXJyZW50KSB7XG4gICAgaWYgKHRoaXMuX2ZsdXNoT25FbmQpIHtcbiAgICAgIHRoaXMuX2ZsdXNoKGlzQ3VycmVudCk7XG4gICAgfVxuICAgIHRoaXMuX3NlbmQoRU5ELCBudWxsLCBpc0N1cnJlbnQpO1xuICB9XG59KTtcblxuXG5cblxuXG4vLyAuZGVib3VuY2Uod2FpdCwge2ltbWVkaWF0ZX0pXG5cbndpdGhPbmVTb3VyY2UoJ2RlYm91bmNlJywge1xuICBfaW5pdDogZnVuY3Rpb24oYXJncykge1xuICAgIHRoaXMuX3dhaXQgPSBNYXRoLm1heCgwLCBhcmdzWzBdKTtcbiAgICB0aGlzLl9pbW1lZGlhdGUgPSBnZXQoYXJnc1sxXSwgJ2ltbWVkaWF0ZScsIGZhbHNlKTtcbiAgICB0aGlzLl9sYXN0QXR0ZW1wdCA9IDA7XG4gICAgdGhpcy5fdGltZW91dElkID0gbnVsbDtcbiAgICB0aGlzLl9sYXRlclZhbHVlID0gbnVsbDtcbiAgICB0aGlzLl9lbmRMYXRlciA9IGZhbHNlO1xuICAgIHZhciAkID0gdGhpcztcbiAgICB0aGlzLl8kbGF0ZXIgPSBmdW5jdGlvbigpIHsgICQuX2xhdGVyKCkgIH07XG4gIH0sXG4gIF9mcmVlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9sYXRlclZhbHVlID0gbnVsbDtcbiAgICB0aGlzLl8kbGF0ZXIgPSBudWxsO1xuICB9LFxuICBfaGFuZGxlVmFsdWU6IGZ1bmN0aW9uKHgsIGlzQ3VycmVudCkge1xuICAgIGlmIChpc0N1cnJlbnQpIHtcbiAgICAgIHRoaXMuX3NlbmQoVkFMVUUsIHgsIGlzQ3VycmVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2xhc3RBdHRlbXB0ID0gbm93KCk7XG4gICAgICBpZiAodGhpcy5faW1tZWRpYXRlICYmICF0aGlzLl90aW1lb3V0SWQpIHtcbiAgICAgICAgdGhpcy5fc2VuZChWQUxVRSwgeCk7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMuX3RpbWVvdXRJZCkge1xuICAgICAgICB0aGlzLl90aW1lb3V0SWQgPSBzZXRUaW1lb3V0KHRoaXMuXyRsYXRlciwgdGhpcy5fd2FpdCk7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMuX2ltbWVkaWF0ZSkge1xuICAgICAgICB0aGlzLl9sYXRlclZhbHVlID0geDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIF9oYW5kbGVFbmQ6IGZ1bmN0aW9uKF9fLCBpc0N1cnJlbnQpIHtcbiAgICBpZiAoaXNDdXJyZW50KSB7XG4gICAgICB0aGlzLl9zZW5kKEVORCwgbnVsbCwgaXNDdXJyZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuX3RpbWVvdXRJZCAmJiAhdGhpcy5faW1tZWRpYXRlKSB7XG4gICAgICAgIHRoaXMuX2VuZExhdGVyID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3NlbmQoRU5EKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIF9sYXRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxhc3QgPSBub3coKSAtIHRoaXMuX2xhc3RBdHRlbXB0O1xuICAgIGlmIChsYXN0IDwgdGhpcy5fd2FpdCAmJiBsYXN0ID49IDApIHtcbiAgICAgIHRoaXMuX3RpbWVvdXRJZCA9IHNldFRpbWVvdXQodGhpcy5fJGxhdGVyLCB0aGlzLl93YWl0IC0gbGFzdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3RpbWVvdXRJZCA9IG51bGw7XG4gICAgICBpZiAoIXRoaXMuX2ltbWVkaWF0ZSkge1xuICAgICAgICB0aGlzLl9zZW5kKFZBTFVFLCB0aGlzLl9sYXRlclZhbHVlKTtcbiAgICAgICAgdGhpcy5fbGF0ZXJWYWx1ZSA9IG51bGw7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5fZW5kTGF0ZXIpIHtcbiAgICAgICAgdGhpcy5fc2VuZChFTkQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSk7XG5cblxuXG5cblxuLy8gLnRocm90dGxlKHdhaXQsIHtsZWFkaW5nLCB0cmFpbGluZ30pXG5cbndpdGhPbmVTb3VyY2UoJ3Rocm90dGxlJywge1xuICBfaW5pdDogZnVuY3Rpb24oYXJncykge1xuICAgIHRoaXMuX3dhaXQgPSBNYXRoLm1heCgwLCBhcmdzWzBdKTtcbiAgICB0aGlzLl9sZWFkaW5nID0gZ2V0KGFyZ3NbMV0sICdsZWFkaW5nJywgdHJ1ZSk7XG4gICAgdGhpcy5fdHJhaWxpbmcgPSBnZXQoYXJnc1sxXSwgJ3RyYWlsaW5nJywgdHJ1ZSk7XG4gICAgdGhpcy5fdHJhaWxpbmdWYWx1ZSA9IG51bGw7XG4gICAgdGhpcy5fdGltZW91dElkID0gbnVsbDtcbiAgICB0aGlzLl9lbmRMYXRlciA9IGZhbHNlO1xuICAgIHRoaXMuX2xhc3RDYWxsVGltZSA9IDA7XG4gICAgdmFyICQgPSB0aGlzO1xuICAgIHRoaXMuXyR0cmFpbGluZ0NhbGwgPSBmdW5jdGlvbigpIHsgICQuX3RyYWlsaW5nQ2FsbCgpICB9O1xuICB9LFxuICBfZnJlZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fdHJhaWxpbmdWYWx1ZSA9IG51bGw7XG4gICAgdGhpcy5fJHRyYWlsaW5nQ2FsbCA9IG51bGw7XG4gIH0sXG4gIF9oYW5kbGVWYWx1ZTogZnVuY3Rpb24oeCwgaXNDdXJyZW50KSB7XG4gICAgaWYgKGlzQ3VycmVudCkge1xuICAgICAgdGhpcy5fc2VuZChWQUxVRSwgeCwgaXNDdXJyZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGN1clRpbWUgPSBub3coKTtcbiAgICAgIGlmICh0aGlzLl9sYXN0Q2FsbFRpbWUgPT09IDAgJiYgIXRoaXMuX2xlYWRpbmcpIHtcbiAgICAgICAgdGhpcy5fbGFzdENhbGxUaW1lID0gY3VyVGltZTtcbiAgICAgIH1cbiAgICAgIHZhciByZW1haW5pbmcgPSB0aGlzLl93YWl0IC0gKGN1clRpbWUgLSB0aGlzLl9sYXN0Q2FsbFRpbWUpO1xuICAgICAgaWYgKHJlbWFpbmluZyA8PSAwKSB7XG4gICAgICAgIHRoaXMuX2NhbmNlbFRyYWxpbmcoKTtcbiAgICAgICAgdGhpcy5fbGFzdENhbGxUaW1lID0gY3VyVGltZTtcbiAgICAgICAgdGhpcy5fc2VuZChWQUxVRSwgeCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX3RyYWlsaW5nKSB7XG4gICAgICAgIHRoaXMuX2NhbmNlbFRyYWxpbmcoKTtcbiAgICAgICAgdGhpcy5fdHJhaWxpbmdWYWx1ZSA9IHg7XG4gICAgICAgIHRoaXMuX3RpbWVvdXRJZCA9IHNldFRpbWVvdXQodGhpcy5fJHRyYWlsaW5nQ2FsbCwgcmVtYWluaW5nKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIF9oYW5kbGVFbmQ6IGZ1bmN0aW9uKF9fLCBpc0N1cnJlbnQpIHtcbiAgICBpZiAoaXNDdXJyZW50KSB7XG4gICAgICB0aGlzLl9zZW5kKEVORCwgbnVsbCwgaXNDdXJyZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuX3RpbWVvdXRJZCkge1xuICAgICAgICB0aGlzLl9lbmRMYXRlciA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9zZW5kKEVORCk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBfY2FuY2VsVHJhbGluZzogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX3RpbWVvdXRJZCAhPT0gbnVsbCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVvdXRJZCk7XG4gICAgICB0aGlzLl90aW1lb3V0SWQgPSBudWxsO1xuICAgIH1cbiAgfSxcbiAgX3RyYWlsaW5nQ2FsbDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fc2VuZChWQUxVRSwgdGhpcy5fdHJhaWxpbmdWYWx1ZSk7XG4gICAgdGhpcy5fdGltZW91dElkID0gbnVsbDtcbiAgICB0aGlzLl90cmFpbGluZ1ZhbHVlID0gbnVsbDtcbiAgICB0aGlzLl9sYXN0Q2FsbFRpbWUgPSAhdGhpcy5fbGVhZGluZyA/IDAgOiBub3coKTtcbiAgICBpZiAodGhpcy5fZW5kTGF0ZXIpIHtcbiAgICAgIHRoaXMuX3NlbmQoRU5EKTtcbiAgICB9XG4gIH1cbn0pO1xuXG5cblxuXG5cbi8vIC5kZWxheSgpXG5cbndpdGhPbmVTb3VyY2UoJ2RlbGF5Jywge1xuICBfaW5pdDogZnVuY3Rpb24oYXJncykge1xuICAgIHRoaXMuX3dhaXQgPSBNYXRoLm1heCgwLCBhcmdzWzBdKTtcbiAgICB0aGlzLl9idWZmID0gW107XG4gICAgdmFyICQgPSB0aGlzO1xuICAgIHRoaXMuXyRzaGlmdEJ1ZmYgPSBmdW5jdGlvbigpIHsgICQuX3NlbmQoVkFMVUUsICQuX2J1ZmYuc2hpZnQoKSkgIH1cbiAgfSxcbiAgX2ZyZWU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2J1ZmYgPSBudWxsO1xuICAgIHRoaXMuXyRzaGlmdEJ1ZmYgPSBudWxsO1xuICB9LFxuICBfaGFuZGxlVmFsdWU6IGZ1bmN0aW9uKHgsIGlzQ3VycmVudCkge1xuICAgIGlmIChpc0N1cnJlbnQpIHtcbiAgICAgIHRoaXMuX3NlbmQoVkFMVUUsIHgsIGlzQ3VycmVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2J1ZmYucHVzaCh4KTtcbiAgICAgIHNldFRpbWVvdXQodGhpcy5fJHNoaWZ0QnVmZiwgdGhpcy5fd2FpdCk7XG4gICAgfVxuICB9LFxuICBfaGFuZGxlRW5kOiBmdW5jdGlvbihfXywgaXNDdXJyZW50KSB7XG4gICAgaWYgKGlzQ3VycmVudCkge1xuICAgICAgdGhpcy5fc2VuZChFTkQsIG51bGwsIGlzQ3VycmVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciAkID0gdGhpcztcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7ICAkLl9zZW5kKEVORCkgIH0sIHRoaXMuX3dhaXQpO1xuICAgIH1cbiAgfVxufSk7XG5cbi8vIEtlZmlyLmZyb21CaW5kZXIoZm4pXG5cbmZ1bmN0aW9uIEZyb21CaW5kZXIoZm4pIHtcbiAgU3RyZWFtLmNhbGwodGhpcyk7XG4gIHRoaXMuX2ZuID0gZm47XG4gIHRoaXMuX3Vuc3Vic2NyaWJlID0gbnVsbDtcbn1cblxuaW5oZXJpdChGcm9tQmluZGVyLCBTdHJlYW0sIHtcblxuICBfbmFtZTogJ2Zyb21CaW5kZXInLFxuXG4gIF9vbkFjdGl2YXRpb246IGZ1bmN0aW9uKCkge1xuICAgIHZhciAkID0gdGhpc1xuICAgICAgLCBpc0N1cnJlbnQgPSB0cnVlXG4gICAgICAsIGVtaXR0ZXIgPSB7XG4gICAgICAgIGVtaXQ6IGZ1bmN0aW9uKHgpIHsgICQuX3NlbmQoVkFMVUUsIHgsIGlzQ3VycmVudCkgIH0sXG4gICAgICAgIGVycm9yOiBmdW5jdGlvbih4KSB7ICAkLl9zZW5kKEVSUk9SLCB4LCBpc0N1cnJlbnQpICB9LFxuICAgICAgICBlbmQ6IGZ1bmN0aW9uKCkgeyAgJC5fc2VuZChFTkQsIG51bGwsIGlzQ3VycmVudCkgIH1cbiAgICAgIH07XG4gICAgdGhpcy5fdW5zdWJzY3JpYmUgPSB0aGlzLl9mbihlbWl0dGVyKSB8fCBudWxsO1xuXG4gICAgLy8gd29yayBhcm91bmQgaHR0cHM6Ly9naXRodWIuY29tL3BvemFkaS9rZWZpci9pc3N1ZXMvMzVcbiAgICBpZiAoIXRoaXMuX2FjdGl2ZSAmJiB0aGlzLl91bnN1YnNjcmliZSAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5fdW5zdWJzY3JpYmUoKTtcbiAgICAgIHRoaXMuX3Vuc3Vic2NyaWJlID0gbnVsbDtcbiAgICB9XG5cbiAgICBpc0N1cnJlbnQgPSBmYWxzZTtcbiAgfSxcbiAgX29uRGVhY3RpdmF0aW9uOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5fdW5zdWJzY3JpYmUgIT09IG51bGwpIHtcbiAgICAgIHRoaXMuX3Vuc3Vic2NyaWJlKCk7XG4gICAgICB0aGlzLl91bnN1YnNjcmliZSA9IG51bGw7XG4gICAgfVxuICB9LFxuXG4gIF9jbGVhcjogZnVuY3Rpb24oKSB7XG4gICAgU3RyZWFtLnByb3RvdHlwZS5fY2xlYXIuY2FsbCh0aGlzKTtcbiAgICB0aGlzLl9mbiA9IG51bGw7XG4gIH1cblxufSlcblxuS2VmaXIuZnJvbUJpbmRlciA9IGZ1bmN0aW9uKGZuKSB7XG4gIHJldHVybiBuZXcgRnJvbUJpbmRlcihmbik7XG59XG5cblxuXG5cblxuXG4vLyBLZWZpci5lbWl0dGVyKClcblxuZnVuY3Rpb24gRW1pdHRlcigpIHtcbiAgU3RyZWFtLmNhbGwodGhpcyk7XG59XG5cbmluaGVyaXQoRW1pdHRlciwgU3RyZWFtLCB7XG4gIF9uYW1lOiAnZW1pdHRlcicsXG4gIGVtaXQ6IGZ1bmN0aW9uKHgpIHtcbiAgICB0aGlzLl9zZW5kKFZBTFVFLCB4KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgZXJyb3I6IGZ1bmN0aW9uKHgpIHtcbiAgICB0aGlzLl9zZW5kKEVSUk9SLCB4KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgZW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9zZW5kKEVORCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn0pO1xuXG5LZWZpci5lbWl0dGVyID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgRW1pdHRlcigpO1xufVxuXG5LZWZpci5FbWl0dGVyID0gRW1pdHRlcjtcblxuXG5cblxuXG5cblxuLy8gS2VmaXIubmV2ZXIoKVxuXG52YXIgbmV2ZXJPYmogPSBuZXcgU3RyZWFtKCk7XG5uZXZlck9iai5fc2VuZChFTkQpO1xubmV2ZXJPYmouX25hbWUgPSAnbmV2ZXInO1xuS2VmaXIubmV2ZXIgPSBmdW5jdGlvbigpIHsgIHJldHVybiBuZXZlck9iaiAgfVxuXG5cblxuXG5cbi8vIEtlZmlyLmNvbnN0YW50KHgpXG5cbmZ1bmN0aW9uIENvbnN0YW50KHgpIHtcbiAgUHJvcGVydHkuY2FsbCh0aGlzKTtcbiAgdGhpcy5fc2VuZChWQUxVRSwgeCk7XG4gIHRoaXMuX3NlbmQoRU5EKTtcbn1cblxuaW5oZXJpdChDb25zdGFudCwgUHJvcGVydHksIHtcbiAgX25hbWU6ICdjb25zdGFudCdcbn0pXG5cbktlZmlyLmNvbnN0YW50ID0gZnVuY3Rpb24oeCkge1xuICByZXR1cm4gbmV3IENvbnN0YW50KHgpO1xufVxuXG5cblxuXG4vLyBLZWZpci5jb25zdGFudEVycm9yKHgpXG5cbmZ1bmN0aW9uIENvbnN0YW50RXJyb3IoeCkge1xuICBQcm9wZXJ0eS5jYWxsKHRoaXMpO1xuICB0aGlzLl9zZW5kKEVSUk9SLCB4KTtcbiAgdGhpcy5fc2VuZChFTkQpO1xufVxuXG5pbmhlcml0KENvbnN0YW50RXJyb3IsIFByb3BlcnR5LCB7XG4gIF9uYW1lOiAnY29uc3RhbnRFcnJvcidcbn0pXG5cbktlZmlyLmNvbnN0YW50RXJyb3IgPSBmdW5jdGlvbih4KSB7XG4gIHJldHVybiBuZXcgQ29uc3RhbnRFcnJvcih4KTtcbn1cblxuXG4vLyAuc2V0TmFtZVxuXG5PYnNlcnZhYmxlLnByb3RvdHlwZS5zZXROYW1lID0gZnVuY3Rpb24oc291cmNlT2JzLCBzZWxmTmFtZSAvKiBvciBqdXN0IHNlbGZOYW1lICovKSB7XG4gIHRoaXMuX25hbWUgPSBzZWxmTmFtZSA/IHNvdXJjZU9icy5fbmFtZSArICcuJyArIHNlbGZOYW1lIDogc291cmNlT2JzO1xuICByZXR1cm4gdGhpcztcbn1cblxuXG5cbi8vIC5tYXBUb1xuXG5PYnNlcnZhYmxlLnByb3RvdHlwZS5tYXBUbyA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiB0aGlzLm1hcChmdW5jdGlvbigpIHsgIHJldHVybiB2YWx1ZSAgfSkuc2V0TmFtZSh0aGlzLCAnbWFwVG8nKTtcbn1cblxuXG5cbi8vIC5wbHVja1xuXG5PYnNlcnZhYmxlLnByb3RvdHlwZS5wbHVjayA9IGZ1bmN0aW9uKHByb3BlcnR5TmFtZSkge1xuICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB4W3Byb3BlcnR5TmFtZV07XG4gIH0pLnNldE5hbWUodGhpcywgJ3BsdWNrJyk7XG59XG5cblxuXG4vLyAuaW52b2tlXG5cbk9ic2VydmFibGUucHJvdG90eXBlLmludm9rZSA9IGZ1bmN0aW9uKG1ldGhvZE5hbWUgLyosIGFyZzEsIGFyZzIuLi4gKi8pIHtcbiAgdmFyIGFyZ3MgPSByZXN0KGFyZ3VtZW50cywgMSk7XG4gIHJldHVybiB0aGlzLm1hcChhcmdzID9cbiAgICBmdW5jdGlvbih4KSB7ICByZXR1cm4gYXBwbHkoeFttZXRob2ROYW1lXSwgeCwgYXJncykgIH0gOlxuICAgIGZ1bmN0aW9uKHgpIHsgIHJldHVybiB4W21ldGhvZE5hbWVdKCkgIH1cbiAgKS5zZXROYW1lKHRoaXMsICdpbnZva2UnKTtcbn1cblxuXG5cblxuLy8gLnRpbWVzdGFtcFxuXG5PYnNlcnZhYmxlLnByb3RvdHlwZS50aW1lc3RhbXAgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uKHgpIHsgIHJldHVybiB7dmFsdWU6IHgsIHRpbWU6IG5vdygpfSAgfSkuc2V0TmFtZSh0aGlzLCAndGltZXN0YW1wJyk7XG59XG5cblxuXG5cbi8vIC50YXBcblxuT2JzZXJ2YWJsZS5wcm90b3R5cGUudGFwID0gZnVuY3Rpb24oZm4pIHtcbiAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uKHgpIHtcbiAgICBmbih4KTtcbiAgICByZXR1cm4geDtcbiAgfSkuc2V0TmFtZSh0aGlzLCAndGFwJyk7XG59XG5cblxuXG4vLyAuYW5kXG5cbktlZmlyLmFuZCA9IGZ1bmN0aW9uKG9ic2VydmFibGVzKSB7XG4gIHJldHVybiBLZWZpci5jb21iaW5lKG9ic2VydmFibGVzLCBhbmQpLnNldE5hbWUoJ2FuZCcpO1xufVxuXG5PYnNlcnZhYmxlLnByb3RvdHlwZS5hbmQgPSBmdW5jdGlvbihvdGhlcikge1xuICByZXR1cm4gdGhpcy5jb21iaW5lKG90aGVyLCBhbmQpLnNldE5hbWUoJ2FuZCcpO1xufVxuXG5cblxuLy8gLm9yXG5cbktlZmlyLm9yID0gZnVuY3Rpb24ob2JzZXJ2YWJsZXMpIHtcbiAgcmV0dXJuIEtlZmlyLmNvbWJpbmUob2JzZXJ2YWJsZXMsIG9yKS5zZXROYW1lKCdvcicpO1xufVxuXG5PYnNlcnZhYmxlLnByb3RvdHlwZS5vciA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gIHJldHVybiB0aGlzLmNvbWJpbmUob3RoZXIsIG9yKS5zZXROYW1lKCdvcicpO1xufVxuXG5cblxuLy8gLm5vdFxuXG5PYnNlcnZhYmxlLnByb3RvdHlwZS5ub3QgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMubWFwKG5vdCkuc2V0TmFtZSh0aGlzLCAnbm90Jyk7XG59XG5cblxuXG4vLyAuYXdhaXRpbmdcblxuT2JzZXJ2YWJsZS5wcm90b3R5cGUuYXdhaXRpbmcgPSBmdW5jdGlvbihvdGhlcikge1xuICByZXR1cm4gS2VmaXIubWVyZ2UoW1xuICAgIHRoaXMubWFwVG8odHJ1ZSksXG4gICAgb3RoZXIubWFwVG8oZmFsc2UpXG4gIF0pLnNraXBEdXBsaWNhdGVzKCkudG9Qcm9wZXJ0eShmYWxzZSkuc2V0TmFtZSh0aGlzLCAnYXdhaXRpbmcnKTtcbn1cblxuXG5cblxuLy8gLmZyb21DYWxsYmFja1xuXG5LZWZpci5mcm9tQ2FsbGJhY2sgPSBmdW5jdGlvbihjYWxsYmFja0NvbnN1bWVyKSB7XG4gIHZhciBjYWxsZWQgPSBmYWxzZTtcbiAgcmV0dXJuIEtlZmlyLmZyb21CaW5kZXIoZnVuY3Rpb24oZW1pdHRlcikge1xuICAgIGlmICghY2FsbGVkKSB7XG4gICAgICBjYWxsYmFja0NvbnN1bWVyKGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgZW1pdHRlci5lbWl0KHgpO1xuICAgICAgICBlbWl0dGVyLmVuZCgpO1xuICAgICAgfSk7XG4gICAgICBjYWxsZWQgPSB0cnVlO1xuICAgIH1cbiAgfSkuc2V0TmFtZSgnZnJvbUNhbGxiYWNrJyk7XG59XG5cblxuXG5cbi8vIC5mcm9tTm9kZUNhbGxiYWNrXG5cbktlZmlyLmZyb21Ob2RlQ2FsbGJhY2sgPSBmdW5jdGlvbihjYWxsYmFja0NvbnN1bWVyKSB7XG4gIHZhciBjYWxsZWQgPSBmYWxzZTtcbiAgcmV0dXJuIEtlZmlyLmZyb21CaW5kZXIoZnVuY3Rpb24oZW1pdHRlcikge1xuICAgIGlmICghY2FsbGVkKSB7XG4gICAgICBjYWxsYmFja0NvbnN1bWVyKGZ1bmN0aW9uKGVycm9yLCB4KSB7XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgIGVtaXR0ZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVtaXR0ZXIuZW1pdCh4KTtcbiAgICAgICAgfVxuICAgICAgICBlbWl0dGVyLmVuZCgpO1xuICAgICAgfSk7XG4gICAgICBjYWxsZWQgPSB0cnVlO1xuICAgIH1cbiAgfSkuc2V0TmFtZSgnZnJvbU5vZGVDYWxsYmFjaycpO1xufVxuXG5cblxuXG4vLyAuZnJvbVByb21pc2VcblxuS2VmaXIuZnJvbVByb21pc2UgPSBmdW5jdGlvbihwcm9taXNlKSB7XG4gIHZhciBjYWxsZWQgPSBmYWxzZTtcbiAgcmV0dXJuIEtlZmlyLmZyb21CaW5kZXIoZnVuY3Rpb24oZW1pdHRlcikge1xuICAgIGlmICghY2FsbGVkKSB7XG4gICAgICB2YXIgb25WYWx1ZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgZW1pdHRlci5lbWl0KHgpO1xuICAgICAgICBlbWl0dGVyLmVuZCgpO1xuICAgICAgfTtcbiAgICAgIHZhciBvbkVycm9yID0gZnVuY3Rpb24oeCkge1xuICAgICAgICBlbWl0dGVyLmVycm9yKHgpO1xuICAgICAgICBlbWl0dGVyLmVuZCgpO1xuICAgICAgfTtcbiAgICAgIHZhciBfcHJvbWlzZSA9IHByb21pc2UudGhlbihvblZhbHVlLCBvbkVycm9yKTtcblxuICAgICAgLy8gcHJldmVudCBwcm9taXNlL0ErIGxpYnJhcmllcyBsaWtlIFEgdG8gc3dhbGxvdyBleGNlcHRpb25zXG4gICAgICBpZiAoX3Byb21pc2UgJiYgaXNGbihfcHJvbWlzZS5kb25lKSkge1xuICAgICAgICBfcHJvbWlzZS5kb25lKCk7XG4gICAgICB9XG5cbiAgICAgIGNhbGxlZCA9IHRydWU7XG4gICAgfVxuICB9KS50b1Byb3BlcnR5KCkuc2V0TmFtZSgnZnJvbVByb21pc2UnKTtcbn1cblxuXG5cblxuXG5cbi8vIC5mcm9tU3ViVW5zdWJcblxuS2VmaXIuZnJvbVN1YlVuc3ViID0gZnVuY3Rpb24oc3ViLCB1bnN1YiwgdHJhbnNmb3JtZXIpIHtcbiAgcmV0dXJuIEtlZmlyLmZyb21CaW5kZXIoZnVuY3Rpb24oZW1pdHRlcikge1xuICAgIHZhciBoYW5kbGVyID0gdHJhbnNmb3JtZXIgPyBmdW5jdGlvbigpIHtcbiAgICAgIGVtaXR0ZXIuZW1pdChhcHBseSh0cmFuc2Zvcm1lciwgdGhpcywgYXJndW1lbnRzKSk7XG4gICAgfSA6IGVtaXR0ZXIuZW1pdDtcbiAgICBzdWIoaGFuZGxlcik7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkgeyAgdW5zdWIoaGFuZGxlcikgIH07XG4gIH0pO1xufVxuXG5cblxuXG4vLyAuZnJvbUV2ZW50XG5cbnZhciBzdWJVbnN1YlBhaXJzID0gW1xuICBbJ2FkZEV2ZW50TGlzdGVuZXInLCAncmVtb3ZlRXZlbnRMaXN0ZW5lciddLFxuICBbJ2FkZExpc3RlbmVyJywgJ3JlbW92ZUxpc3RlbmVyJ10sXG4gIFsnb24nLCAnb2ZmJ11cbl07XG5cbktlZmlyLmZyb21FdmVudCA9IGZ1bmN0aW9uKHRhcmdldCwgZXZlbnROYW1lLCB0cmFuc2Zvcm1lcikge1xuICB2YXIgcGFpciwgc3ViLCB1bnN1YjtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN1YlVuc3ViUGFpcnMubGVuZ3RoOyBpKyspIHtcbiAgICBwYWlyID0gc3ViVW5zdWJQYWlyc1tpXTtcbiAgICBpZiAoaXNGbih0YXJnZXRbcGFpclswXV0pICYmIGlzRm4odGFyZ2V0W3BhaXJbMV1dKSkge1xuICAgICAgc3ViID0gcGFpclswXTtcbiAgICAgIHVuc3ViID0gcGFpclsxXTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGlmIChzdWIgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBFcnJvcigndGFyZ2V0IGRvblxcJ3Qgc3VwcG9ydCBhbnkgb2YgJyArXG4gICAgICAnYWRkRXZlbnRMaXN0ZW5lci9yZW1vdmVFdmVudExpc3RlbmVyLCBhZGRMaXN0ZW5lci9yZW1vdmVMaXN0ZW5lciwgb24vb2ZmIG1ldGhvZCBwYWlyJyk7XG4gIH1cblxuICByZXR1cm4gS2VmaXIuZnJvbVN1YlVuc3ViKFxuICAgIGZ1bmN0aW9uKGhhbmRsZXIpIHsgIHRhcmdldFtzdWJdKGV2ZW50TmFtZSwgaGFuZGxlcikgIH0sXG4gICAgZnVuY3Rpb24oaGFuZGxlcikgeyAgdGFyZ2V0W3Vuc3ViXShldmVudE5hbWUsIGhhbmRsZXIpICB9LFxuICAgIHRyYW5zZm9ybWVyXG4gICkuc2V0TmFtZSgnZnJvbUV2ZW50Jyk7XG59XG5cbnZhciB3aXRoVHdvU291cmNlc0FuZEJ1ZmZlck1peGluID0ge1xuICBfaW5pdDogZnVuY3Rpb24oYXJncykge1xuICAgIHRoaXMuX2J1ZmYgPSBbXTtcbiAgICB0aGlzLl9mbHVzaE9uRW5kID0gZ2V0KGFyZ3NbMF0sICdmbHVzaE9uRW5kJywgdHJ1ZSk7XG4gIH0sXG4gIF9mcmVlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9idWZmID0gbnVsbDtcbiAgfSxcbiAgX2ZsdXNoOiBmdW5jdGlvbihpc0N1cnJlbnQpIHtcbiAgICBpZiAodGhpcy5fYnVmZiAhPT0gbnVsbCAmJiB0aGlzLl9idWZmLmxlbmd0aCAhPT0gMCkge1xuICAgICAgdGhpcy5fc2VuZChWQUxVRSwgdGhpcy5fYnVmZiwgaXNDdXJyZW50KTtcbiAgICAgIHRoaXMuX2J1ZmYgPSBbXTtcbiAgICB9XG4gIH0sXG5cbiAgX2hhbmRsZVByaW1hcnlFbmQ6IGZ1bmN0aW9uKF9fLCBpc0N1cnJlbnQpIHtcbiAgICBpZiAodGhpcy5fZmx1c2hPbkVuZCkge1xuICAgICAgdGhpcy5fZmx1c2goaXNDdXJyZW50KTtcbiAgICB9XG4gICAgdGhpcy5fc2VuZChFTkQsIG51bGwsIGlzQ3VycmVudCk7XG4gIH1cbn07XG5cblxuXG53aXRoVHdvU291cmNlcygnYnVmZmVyQnknLCBleHRlbmQoe1xuXG4gIF9vbkFjdGl2YXRpb246IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3ByaW1hcnkub25BbnkodGhpcy5fJGhhbmRsZVByaW1hcnlBbnkpO1xuICAgIGlmICh0aGlzLl9hbGl2ZSAmJiB0aGlzLl9zZWNvbmRhcnkgIT09IG51bGwpIHtcbiAgICAgIHRoaXMuX3NlY29uZGFyeS5vbkFueSh0aGlzLl8kaGFuZGxlU2Vjb25kYXJ5QW55KTtcbiAgICB9XG4gIH0sXG5cbiAgX2hhbmRsZVByaW1hcnlWYWx1ZTogZnVuY3Rpb24oeCwgaXNDdXJyZW50KSB7XG4gICAgdGhpcy5fYnVmZi5wdXNoKHgpO1xuICB9LFxuXG4gIF9oYW5kbGVTZWNvbmRhcnlWYWx1ZTogZnVuY3Rpb24oeCwgaXNDdXJyZW50KSB7XG4gICAgdGhpcy5fZmx1c2goaXNDdXJyZW50KTtcbiAgfSxcblxuICBfaGFuZGxlU2Vjb25kYXJ5RW5kOiBmdW5jdGlvbih4LCBpc0N1cnJlbnQpIHtcbiAgICBpZiAoIXRoaXMuX2ZsdXNoT25FbmQpIHtcbiAgICAgIHRoaXMuX3NlbmQoRU5ELCBudWxsLCBpc0N1cnJlbnQpO1xuICAgIH1cbiAgfVxuXG59LCB3aXRoVHdvU291cmNlc0FuZEJ1ZmZlck1peGluKSk7XG5cblxuXG5cbndpdGhUd29Tb3VyY2VzKCdidWZmZXJXaGlsZUJ5JywgZXh0ZW5kKHtcblxuICBfaGFuZGxlUHJpbWFyeVZhbHVlOiBmdW5jdGlvbih4LCBpc0N1cnJlbnQpIHtcbiAgICB0aGlzLl9idWZmLnB1c2goeCk7XG4gICAgaWYgKHRoaXMuX2xhc3RTZWNvbmRhcnkgIT09IE5PVEhJTkcgJiYgIXRoaXMuX2xhc3RTZWNvbmRhcnkpIHtcbiAgICAgIHRoaXMuX2ZsdXNoKGlzQ3VycmVudCk7XG4gICAgfVxuICB9LFxuXG4gIF9oYW5kbGVTZWNvbmRhcnlFbmQ6IGZ1bmN0aW9uKHgsIGlzQ3VycmVudCkge1xuICAgIGlmICghdGhpcy5fZmx1c2hPbkVuZCAmJiAodGhpcy5fbGFzdFNlY29uZGFyeSA9PT0gTk9USElORyB8fCB0aGlzLl9sYXN0U2Vjb25kYXJ5KSkge1xuICAgICAgdGhpcy5fc2VuZChFTkQsIG51bGwsIGlzQ3VycmVudCk7XG4gICAgfVxuICB9XG5cbn0sIHdpdGhUd29Tb3VyY2VzQW5kQnVmZmVyTWl4aW4pKTtcblxuXG5cblxuXG53aXRoVHdvU291cmNlcygnZmlsdGVyQnknLCB7XG5cbiAgX2hhbmRsZVByaW1hcnlWYWx1ZTogZnVuY3Rpb24oeCwgaXNDdXJyZW50KSB7XG4gICAgaWYgKHRoaXMuX2xhc3RTZWNvbmRhcnkgIT09IE5PVEhJTkcgJiYgdGhpcy5fbGFzdFNlY29uZGFyeSkge1xuICAgICAgdGhpcy5fc2VuZChWQUxVRSwgeCwgaXNDdXJyZW50KTtcbiAgICB9XG4gIH0sXG5cbiAgX2hhbmRsZVNlY29uZGFyeUVuZDogZnVuY3Rpb24oX18sIGlzQ3VycmVudCkge1xuICAgIGlmICh0aGlzLl9sYXN0U2Vjb25kYXJ5ID09PSBOT1RISU5HIHx8ICF0aGlzLl9sYXN0U2Vjb25kYXJ5KSB7XG4gICAgICB0aGlzLl9zZW5kKEVORCwgbnVsbCwgaXNDdXJyZW50KTtcbiAgICB9XG4gIH1cblxufSk7XG5cblxuXG53aXRoVHdvU291cmNlcygnc2tpcFVudGlsQnknLCB7XG5cbiAgX2hhbmRsZVByaW1hcnlWYWx1ZTogZnVuY3Rpb24oeCwgaXNDdXJyZW50KSB7XG4gICAgaWYgKHRoaXMuX2xhc3RTZWNvbmRhcnkgIT09IE5PVEhJTkcpIHtcbiAgICAgIHRoaXMuX3NlbmQoVkFMVUUsIHgsIGlzQ3VycmVudCk7XG4gICAgfVxuICB9LFxuXG4gIF9oYW5kbGVTZWNvbmRhcnlFbmQ6IGZ1bmN0aW9uKF9fLCBpc0N1cnJlbnQpIHtcbiAgICBpZiAodGhpcy5fbGFzdFNlY29uZGFyeSA9PT0gTk9USElORykge1xuICAgICAgdGhpcy5fc2VuZChFTkQsIG51bGwsIGlzQ3VycmVudCk7XG4gICAgfVxuICB9XG5cbn0pO1xuXG5cblxud2l0aFR3b1NvdXJjZXMoJ3Rha2VVbnRpbEJ5Jywge1xuXG4gIF9oYW5kbGVTZWNvbmRhcnlWYWx1ZTogZnVuY3Rpb24oeCwgaXNDdXJyZW50KSB7XG4gICAgdGhpcy5fc2VuZChFTkQsIG51bGwsIGlzQ3VycmVudCk7XG4gIH1cblxufSk7XG5cblxuXG53aXRoVHdvU291cmNlcygndGFrZVdoaWxlQnknLCB7XG5cbiAgX2hhbmRsZVByaW1hcnlWYWx1ZTogZnVuY3Rpb24oeCwgaXNDdXJyZW50KSB7XG4gICAgaWYgKHRoaXMuX2xhc3RTZWNvbmRhcnkgIT09IE5PVEhJTkcpIHtcbiAgICAgIHRoaXMuX3NlbmQoVkFMVUUsIHgsIGlzQ3VycmVudCk7XG4gICAgfVxuICB9LFxuXG4gIF9oYW5kbGVTZWNvbmRhcnlWYWx1ZTogZnVuY3Rpb24oeCwgaXNDdXJyZW50KSB7XG4gICAgdGhpcy5fbGFzdFNlY29uZGFyeSA9IHg7XG4gICAgaWYgKCF0aGlzLl9sYXN0U2Vjb25kYXJ5KSB7XG4gICAgICB0aGlzLl9zZW5kKEVORCwgbnVsbCwgaXNDdXJyZW50KTtcbiAgICB9XG4gIH0sXG5cbiAgX2hhbmRsZVNlY29uZGFyeUVuZDogZnVuY3Rpb24oX18sIGlzQ3VycmVudCkge1xuICAgIGlmICh0aGlzLl9sYXN0U2Vjb25kYXJ5ID09PSBOT1RISU5HKSB7XG4gICAgICB0aGlzLl9zZW5kKEVORCwgbnVsbCwgaXNDdXJyZW50KTtcbiAgICB9XG4gIH1cblxufSk7XG5cblxuXG5cbndpdGhUd29Tb3VyY2VzKCdza2lwV2hpbGVCeScsIHtcblxuICBfaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5faGFzRmFsc2V5RnJvbVNlY29uZGFyeSA9IGZhbHNlO1xuICB9LFxuXG4gIF9oYW5kbGVQcmltYXJ5VmFsdWU6IGZ1bmN0aW9uKHgsIGlzQ3VycmVudCkge1xuICAgIGlmICh0aGlzLl9oYXNGYWxzZXlGcm9tU2Vjb25kYXJ5KSB7XG4gICAgICB0aGlzLl9zZW5kKFZBTFVFLCB4LCBpc0N1cnJlbnQpO1xuICAgIH1cbiAgfSxcblxuICBfaGFuZGxlU2Vjb25kYXJ5VmFsdWU6IGZ1bmN0aW9uKHgsIGlzQ3VycmVudCkge1xuICAgIHRoaXMuX2hhc0ZhbHNleUZyb21TZWNvbmRhcnkgPSB0aGlzLl9oYXNGYWxzZXlGcm9tU2Vjb25kYXJ5IHx8ICF4O1xuICB9LFxuXG4gIF9oYW5kbGVTZWNvbmRhcnlFbmQ6IGZ1bmN0aW9uKF9fLCBpc0N1cnJlbnQpIHtcbiAgICBpZiAoIXRoaXMuX2hhc0ZhbHNleUZyb21TZWNvbmRhcnkpIHtcbiAgICAgIHRoaXMuX3NlbmQoRU5ELCBudWxsLCBpc0N1cnJlbnQpO1xuICAgIH1cbiAgfVxuXG59KTtcblxuXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoW10sIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIEtlZmlyO1xuICAgIH0pO1xuICAgIGdsb2JhbC5LZWZpciA9IEtlZmlyO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIGV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEtlZmlyO1xuICAgIEtlZmlyLktlZmlyID0gS2VmaXI7XG4gIH0gZWxzZSB7XG4gICAgZ2xvYmFsLktlZmlyID0gS2VmaXI7XG4gIH1cblxufSh0aGlzKSk7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAvdXNyL2xvY2FsL2xpYi9+L3BlbGxldC9+L2tlZmlyL2Rpc3Qva2VmaXIuanNcbiAqKiBtb2R1bGUgaWQgPSA0MVxuICoqIG1vZHVsZSBjaHVua3MgPSAyXG4gKiovIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxuLy8gSWYgb2JqLmhhc093blByb3BlcnR5IGhhcyBiZWVuIG92ZXJyaWRkZW4sIHRoZW4gY2FsbGluZ1xuLy8gb2JqLmhhc093blByb3BlcnR5KHByb3ApIHdpbGwgYnJlYWsuXG4vLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9qb3llbnQvbm9kZS9pc3N1ZXMvMTcwN1xuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihxcywgc2VwLCBlcSwgb3B0aW9ucykge1xuICBzZXAgPSBzZXAgfHwgJyYnO1xuICBlcSA9IGVxIHx8ICc9JztcbiAgdmFyIG9iaiA9IHt9O1xuXG4gIGlmICh0eXBlb2YgcXMgIT09ICdzdHJpbmcnIHx8IHFzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBvYmo7XG4gIH1cblxuICB2YXIgcmVnZXhwID0gL1xcKy9nO1xuICBxcyA9IHFzLnNwbGl0KHNlcCk7XG5cbiAgdmFyIG1heEtleXMgPSAxMDAwO1xuICBpZiAob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy5tYXhLZXlzID09PSAnbnVtYmVyJykge1xuICAgIG1heEtleXMgPSBvcHRpb25zLm1heEtleXM7XG4gIH1cblxuICB2YXIgbGVuID0gcXMubGVuZ3RoO1xuICAvLyBtYXhLZXlzIDw9IDAgbWVhbnMgdGhhdCB3ZSBzaG91bGQgbm90IGxpbWl0IGtleXMgY291bnRcbiAgaWYgKG1heEtleXMgPiAwICYmIGxlbiA+IG1heEtleXMpIHtcbiAgICBsZW4gPSBtYXhLZXlzO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgIHZhciB4ID0gcXNbaV0ucmVwbGFjZShyZWdleHAsICclMjAnKSxcbiAgICAgICAgaWR4ID0geC5pbmRleE9mKGVxKSxcbiAgICAgICAga3N0ciwgdnN0ciwgaywgdjtcblxuICAgIGlmIChpZHggPj0gMCkge1xuICAgICAga3N0ciA9IHguc3Vic3RyKDAsIGlkeCk7XG4gICAgICB2c3RyID0geC5zdWJzdHIoaWR4ICsgMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGtzdHIgPSB4O1xuICAgICAgdnN0ciA9ICcnO1xuICAgIH1cblxuICAgIGsgPSBkZWNvZGVVUklDb21wb25lbnQoa3N0cik7XG4gICAgdiA9IGRlY29kZVVSSUNvbXBvbmVudCh2c3RyKTtcblxuICAgIGlmICghaGFzT3duUHJvcGVydHkob2JqLCBrKSkge1xuICAgICAgb2JqW2tdID0gdjtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkob2JqW2tdKSkge1xuICAgICAgb2JqW2tdLnB1c2godik7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9ialtrXSA9IFtvYmpba10sIHZdO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59O1xuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHhzKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeHMpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogKHdlYnBhY2spL34vbm9kZS1saWJzLWJyb3dzZXIvfi9xdWVyeXN0cmluZy1lczMvZGVjb2RlLmpzXG4gKiogbW9kdWxlIGlkID0gNDJcbiAqKiBtb2R1bGUgY2h1bmtzID0gMlxuICoqLyIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBzdHJpbmdpZnlQcmltaXRpdmUgPSBmdW5jdGlvbih2KSB7XG4gIHN3aXRjaCAodHlwZW9mIHYpIHtcbiAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgcmV0dXJuIHY7XG5cbiAgICBjYXNlICdib29sZWFuJzpcbiAgICAgIHJldHVybiB2ID8gJ3RydWUnIDogJ2ZhbHNlJztcblxuICAgIGNhc2UgJ251bWJlcic6XG4gICAgICByZXR1cm4gaXNGaW5pdGUodikgPyB2IDogJyc7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuICcnO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iaiwgc2VwLCBlcSwgbmFtZSkge1xuICBzZXAgPSBzZXAgfHwgJyYnO1xuICBlcSA9IGVxIHx8ICc9JztcbiAgaWYgKG9iaiA9PT0gbnVsbCkge1xuICAgIG9iaiA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGlmICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBtYXAob2JqZWN0S2V5cyhvYmopLCBmdW5jdGlvbihrKSB7XG4gICAgICB2YXIga3MgPSBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKGspKSArIGVxO1xuICAgICAgaWYgKGlzQXJyYXkob2JqW2tdKSkge1xuICAgICAgICByZXR1cm4gbWFwKG9ialtrXSwgZnVuY3Rpb24odikge1xuICAgICAgICAgIHJldHVybiBrcyArIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUodikpO1xuICAgICAgICB9KS5qb2luKHNlcCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4ga3MgKyBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKG9ialtrXSkpO1xuICAgICAgfVxuICAgIH0pLmpvaW4oc2VwKTtcblxuICB9XG5cbiAgaWYgKCFuYW1lKSByZXR1cm4gJyc7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKG5hbWUpKSArIGVxICtcbiAgICAgICAgIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUob2JqKSk7XG59O1xuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHhzKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeHMpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxuZnVuY3Rpb24gbWFwICh4cywgZikge1xuICBpZiAoeHMubWFwKSByZXR1cm4geHMubWFwKGYpO1xuICB2YXIgcmVzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICByZXMucHVzaChmKHhzW2ldLCBpKSk7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cblxudmFyIG9iamVjdEtleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqKSB7XG4gIHZhciByZXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSByZXMucHVzaChrZXkpO1xuICB9XG4gIHJldHVybiByZXM7XG59O1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAod2VicGFjaykvfi9ub2RlLWxpYnMtYnJvd3Nlci9+L3F1ZXJ5c3RyaW5nLWVzMy9lbmNvZGUuanNcbiAqKiBtb2R1bGUgaWQgPSA0M1xuICoqIG1vZHVsZSBjaHVua3MgPSAyXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChhcnIpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhcnIpID09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAvdXNyL2xvY2FsL2xpYi9+L3BlbGxldC9+L3BhdGgtdG8tcmVnZXhwL34vaXNhcnJheS9pbmRleC5qc1xuICoqIG1vZHVsZSBpZCA9IDQ0XG4gKiogbW9kdWxlIGNodW5rcyA9IDJcbiAqKi8iXSwic291cmNlUm9vdCI6IiIsImZpbGUiOiJjb21wb25lbnQuanMifQ==