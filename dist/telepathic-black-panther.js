(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 * Cookies.js - 1.2.1
 * https://github.com/ScottHamper/Cookies
 *
 * This is free and unencumbered software released into the public domain.
 */
(function (global, undefined) {
    'use strict';

    var factory = function (window) {
        if (typeof window.document !== 'object') {
            throw new Error('Cookies.js requires a `window` with a `document` object');
        }

        var Cookies = function (key, value, options) {
            return arguments.length === 1 ?
                Cookies.get(key) : Cookies.set(key, value, options);
        };

        // Allows for setter injection in unit tests
        Cookies._document = window.document;

        // Used to ensure cookie keys do not collide with
        // built-in `Object` properties
        Cookies._cacheKeyPrefix = 'cookey.'; // Hurr hurr, :)
        
        Cookies._maxExpireDate = new Date('Fri, 31 Dec 9999 23:59:59 UTC');

        Cookies.defaults = {
            path: '/',
            secure: false
        };

        Cookies.get = function (key) {
            if (Cookies._cachedDocumentCookie !== Cookies._document.cookie) {
                Cookies._renewCache();
            }

            return Cookies._cache[Cookies._cacheKeyPrefix + key];
        };

        Cookies.set = function (key, value, options) {
            options = Cookies._getExtendedOptions(options);
            options.expires = Cookies._getExpiresDate(value === undefined ? -1 : options.expires);

            Cookies._document.cookie = Cookies._generateCookieString(key, value, options);

            return Cookies;
        };

        Cookies.expire = function (key, options) {
            return Cookies.set(key, undefined, options);
        };

        Cookies._getExtendedOptions = function (options) {
            return {
                path: options && options.path || Cookies.defaults.path,
                domain: options && options.domain || Cookies.defaults.domain,
                expires: options && options.expires || Cookies.defaults.expires,
                secure: options && options.secure !== undefined ?  options.secure : Cookies.defaults.secure
            };
        };

        Cookies._isValidDate = function (date) {
            return Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime());
        };

        Cookies._getExpiresDate = function (expires, now) {
            now = now || new Date();

            if (typeof expires === 'number') {
                expires = expires === Infinity ?
                    Cookies._maxExpireDate : new Date(now.getTime() + expires * 1000);
            } else if (typeof expires === 'string') {
                expires = new Date(expires);
            }

            if (expires && !Cookies._isValidDate(expires)) {
                throw new Error('`expires` parameter cannot be converted to a valid Date instance');
            }

            return expires;
        };

        Cookies._generateCookieString = function (key, value, options) {
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
        };

        Cookies._getCacheFromString = function (documentCookie) {
            var cookieCache = {};
            var cookiesArray = documentCookie ? documentCookie.split('; ') : [];

            for (var i = 0; i < cookiesArray.length; i++) {
                var cookieKvp = Cookies._getKeyValuePairFromCookieString(cookiesArray[i]);

                if (cookieCache[Cookies._cacheKeyPrefix + cookieKvp.key] === undefined) {
                    cookieCache[Cookies._cacheKeyPrefix + cookieKvp.key] = cookieKvp.value;
                }
            }

            return cookieCache;
        };

        Cookies._getKeyValuePairFromCookieString = function (cookieString) {
            // "=" is a valid character in a cookie value according to RFC6265, so cannot `split('=')`
            var separatorIndex = cookieString.indexOf('=');

            // IE omits the "=" when the cookie value is an empty string
            separatorIndex = separatorIndex < 0 ? cookieString.length : separatorIndex;

            return {
                key: decodeURIComponent(cookieString.substr(0, separatorIndex)),
                value: decodeURIComponent(cookieString.substr(separatorIndex + 1))
            };
        };

        Cookies._renewCache = function () {
            Cookies._cache = Cookies._getCacheFromString(Cookies._document.cookie);
            Cookies._cachedDocumentCookie = Cookies._document.cookie;
        };

        Cookies._areEnabled = function () {
            var testKey = 'cookies.js';
            var areEnabled = Cookies.set(testKey, 1).get(testKey) === '1';
            Cookies.expire(testKey);
            return areEnabled;
        };

        Cookies.enabled = Cookies._areEnabled();

        return Cookies;
    };

    var cookiesExport = typeof global.document === 'object' ? factory(global) : factory;

    // AMD support
    if (typeof define === 'function' && define.amd) {
        define(function () { return cookiesExport; });
    // CommonJS/Node.js support
    } else if (typeof exports === 'object') {
        // Support Node.js specific `module.exports` (which can be a function)
        if (typeof module === 'object' && typeof module.exports === 'object') {
            exports = module.exports = cookiesExport;
        }
        // But always support CommonJS module 1.1.1 spec (`exports` cannot be a function)
        exports.Cookies = cookiesExport;
    } else {
        global.Cookies = cookiesExport;
    }
})(typeof window === 'undefined' ? this : window);
},{}],2:[function(require,module,exports){
/*! minibus - v3.1.0 - 2014-11-22
 * https://github.com/axelpale/minibus
 *
 * Copyright (c) 2014 Akseli Palen <akseli.palen@gmail.com>;
 * Licensed under the MIT license */

(function (root, factory) {
  'use strict';
  // UMD pattern commonjsStrict.js
  // https://github.com/umdjs/umd
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['exports'], factory);
  } else if (typeof exports === 'object') {
    // CommonJS & Node
    factory(exports);
  } else {
    // Browser globals
    factory((root.Minibus = {}));
  }
}(this, function (exports) {
  'use strict';

// Minibus

//**************
// Constructor *
//**************

var Bus = function () {
  // event string -> sub route map
  this.eventMap = {};

  // route string -> route object
  this.routeMap = {};

  // free namespace shared between the event handlers on the bus.
  this.busContext = {};
};

exports.create = function () {
  return new Bus();
};

// For extendability.
// Usage: Minibus.extension.myFunction = function (...) {...};
exports.extension = Bus.prototype;



//*******************
// Helper functions *
//*******************

var isArray = function (v) {
  return Object.prototype.toString.call(v) === '[object Array]';
};

var isEmpty = function (obj) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      return false;
    }
  }
  return true;
};



//*************
// Exceptions *
//*************

var InvalidEventStringError = function (eventString) {
  // Usage
  //   throw new InvalidEventStringError(eventString)
  this.name = 'InvalidEventStringError';
  this.message = 'Invalid event string given: ' + eventString;
};

var InvalidRouteStringError = function (routeString) {
  // Usage
  //   throw new InvalidRouteStringError(routeString)
  this.name = 'InvalidRouteStringError';
  this.message = 'Invalid route string given: ' + routeString;
};

var InvalidEventHandlerError = function (eventHandler) {
  // Usage
  //   throw new InvalidEventHandlerError(eventHandler)
  this.name = 'InvalidEventHandlerError';
  this.message = 'Invalid event handler function given: ' + eventHandler;
};



//*******************************************
// Member functions. They all are mutators. *
//*******************************************

var _emit = function (eventString) {
  // Emit an event to execute the bound event handler functions.
  // The event handlers are executed immediately.
  //
  // Parameter
  //   eventString
  //     Event string or array of event strings.
  //   arg1 (optional)
  //     Argument to be passed to the handler functions.
  //   arg2 (optional)
  //   ...
  //
  // Return
  //   nothing
  //
  // Throw
  //   InvalidEventStringError
  //     if given event string is not a string or array of strings.
  //
  var emitArgs, i, subRouteMap, routeString, eventHandlers, busContext;

  // Turn to array for more general code.
  if (!isArray(eventString)) {
    eventString = [eventString];
  }

  // Validate all eventStrings before mutating anything.
  // This makes the on call more atomic.
  for (i = 0; i < eventString.length; i += 1) {
    if (typeof eventString[i] !== 'string') {
      throw new InvalidEventStringError(eventString[i]);
    }
  }

  // Collect passed arguments after the eventString argument.
  emitArgs = [];
  for (i = 1; i < arguments.length; i += 1) {
    emitArgs.push(arguments[i]);
  }

  // Collect all the event handlers bound to the given eventString
  eventHandlers = [];
  for (i = 0; i < eventString.length; i += 1) {
    if (this.eventMap.hasOwnProperty(eventString[i])) {
      subRouteMap = this.eventMap[eventString[i]];
      for (routeString in subRouteMap) {
        if (subRouteMap.hasOwnProperty(routeString)) {
          eventHandlers.push(subRouteMap[routeString].eventHandler);
        }
      }
    }
  }

  // Apply the event handlers.
  // All event handlers on the bus share a same bus context.
  busContext = this.busContext;
  for (i = 0; i < eventHandlers.length; i += 1) {
    eventHandlers[i].apply(busContext, emitArgs);
  }
};

// See Node.js events.EventEmitter.emit
Bus.prototype.emit = _emit;

// See Backbone.js Events.trigger
Bus.prototype.trigger = _emit;

// See Mozilla Web API EventTarget.dispatchEvent
// See http://stackoverflow.com/a/10085161/638546
// Uncomment to enable. Too lengthy to be included by default.
//Bus.prototype.dispatchEvent = _emit;

// See http://stackoverflow.com/a/9672223/638546
// Uncomment to enable. Too rare to be included by default.
//Bus.prototype.fireEvent = _emit;



var _on = function (eventString, eventHandler) {
  // Bind an event string(s) to an event handler function.
  //
  // Parameter
  //   eventString
  //     Event string or array of event strings.
  //     Empty array is ok but does nothing.
  //   eventHandler
  //     Event handler function to be executed when the event is emitted.
  //
  // Throw
  //   InvalidEventStringError
  //   InvalidEventHandlerError
  //
  // Return
  //   a route string or an array of route strings
  //
  var wasArray, i, routeObject, routeString, routeStringArray;

  // Turn to array for more general code.
  // Store whether parameter was array to return right type of value.
  wasArray = isArray(eventString);
  if (!wasArray) {
    eventString = [eventString];
  }

  // Validate all eventStrings before mutating anything.
  // This makes the on call more atomic.
  for (i = 0; i < eventString.length; i += 1) {
    if (typeof eventString[i] !== 'string') {
      throw new InvalidEventStringError(eventString[i]);
    }
  }

  // Validate the eventHandler
  if (typeof eventHandler !== 'function') {
    throw new InvalidEventHandlerError(eventHandler);
  }

  routeStringArray = [];
  for (i = 0; i < eventString.length; i += 1) {
    routeObject = {
      eventString: eventString[i],
      eventHandler: eventHandler
    };

    routeString = Identity.create();
    routeStringArray.push(routeString);

    if (!this.eventMap.hasOwnProperty(eventString[i])) {
      this.eventMap[eventString[i]] = {};
    }
    this.eventMap[eventString[i]][routeString] = routeObject;
    this.routeMap[routeString] = routeObject;
  }

  if (wasArray) {
    return routeStringArray;
  } // else
  return routeStringArray[0];
};

// See Backbone.js Events.on
// See Node.js events.EventEmitter.on
Bus.prototype.on = _on;

// See http://stackoverflow.com/a/9672223/638546
Bus.prototype.listen = _on;

// See Node.js events.EventEmitter.addListener
// Uncomment to enable. Too lengthy to be included by default.
//Bus.prototype.addListener = _on;

// See Mozilla Web API EventTarget.addEventListener
// See http://stackoverflow.com/a/11237657/638546
// Uncomment to enable. Too lengthy to be included by default.
//Bus.prototype.addEventListener = _on;



var _once = function (eventString, eventHandler) {
  // Like _on but reacts to emit only once.
  //
  // Parameter
  //   See _on
  //
  // Return
  //   See _on
  //
  // Throw
  //   InvalidEventStringError
  //   InvalidEventHandlerError
  //
  var that, routeString, called;

  // Validate the eventHandler. On does the validation also.
  // Duplicate validation is required because a wrapper function
  // is feed into on instead the given eventHandler.
  if (typeof eventHandler !== 'function') {
    throw new InvalidEventHandlerError(eventHandler);
  }

  that = this;
  called = false;
  routeString = this.on(eventString, function () {
    if (!called) {
      called = true; // Required to prevent duplicate sync calls
      that.off(routeString);
      // Apply. Use the context given by emit to embrace code dryness.
      eventHandler.apply(this, arguments);
    }
  });
  return routeString;
};

// See Node.js events.EventEmitter.once
// See Backbone.js Events.once
Bus.prototype.once = _once;



var _off = function (routeString) {
  // Unbind one or many event handlers.
  //
  // Parameter
  //   routeString
  //     A route string or an array of route strings or
  //     an array of arrays of route strings.
  //     The route to be shut down.
  //
  // Parameter (Alternative)
  //   eventString
  //     An event string or an array of event strings or
  //     an array of arrays of event strings.
  //     Shut down all the routes with this event string.
  //
  // Parameter (Alternative)
  //   (nothing)
  //     Shut down all the routes i.e. unbind all the event handlers.
  //
  // Throws
  //   InvalidRouteStringError
  //
  // Return
  //   nothing
  //
  var noArgs, i, routeObject, eventString, subRouteMap, rs;

  noArgs = (typeof routeString === 'undefined');
  if (noArgs) {
    this.routeMap = {};
    this.eventMap = {};
    return;
  }

  // Turn to array for more general code.
  if (!isArray(routeString)) {
    routeString = [routeString];
  }

  // Flatten arrays to allow arrays of arrays of route strings.
  // This is needed if user wants to off an array of routes. Some routes
  // might be arrays or route strings because 'on' interface.
  // http://stackoverflow.com/a/10865042/638546
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/
  //   Reference/Global_Objects/Array/concat
  var flat = [];
  flat = flat.concat.apply(flat, routeString);
  routeString = flat;

  // Validate all routeStrings before mutating anything.
  // This makes the off call more atomic.
  for (i = 0; i < routeString.length; i += 1) {
    if (typeof routeString[i] !== 'string') {
      throw new InvalidRouteStringError(routeString[i]);
    }
  }

  for (i = 0; i < routeString.length; i += 1) {
    if (this.routeMap.hasOwnProperty(routeString[i])) {
      routeObject = this.routeMap[routeString[i]];
      delete this.routeMap[routeString[i]];
      delete this.eventMap[routeObject.eventString][routeString[i]];
      // Remove sub route map from the event map if it is empty.
      // This prevents outdated eventStrings piling up on the eventMap.
      if (isEmpty(this.eventMap[routeObject.eventString])) {
        delete this.eventMap[routeObject.eventString];
      }
    } else {
      // As eventString
      eventString = routeString[i];
      if (this.eventMap.hasOwnProperty(eventString)) {
        subRouteMap = this.eventMap[eventString];
        for (rs in subRouteMap) {
          if (subRouteMap.hasOwnProperty(rs)) {
            delete this.routeMap[rs];
          }
        }
        delete this.eventMap[eventString];
      }
    }
  }
  // Assert: event handlers and their routes removed.
};

// Backbone.js Events.off
Bus.prototype.off = _off;

// Node.js events.EventEmitter.removeListener
Bus.prototype.removeListener = _off;

// See Mozilla Web API EventTarget.removeEventListener
// Uncomment to enable. Too lengthy to be included by default.
//Bus.prototype.removeEventListener = _off;


var Identity = (function () {
  // A utility for creating unique strings for identification.
  // Abstracts how uniqueness is archieved.
  //
  // Usages
  //   >>> Identity.create();
  //   '532402059994638'
  //   >>> Identity.create();
  //   '544258285779506'
  //
  var exports = {};
  /////////////////

  exports.create = function () {
    return Math.random().toString().substring(2);
  };

  ///////////////
  return exports;
}());


  // Version
  exports.version = '3.1.0';


// End of intro
}));

},{}],3:[function(require,module,exports){
/**
 * Figures things out.
*/
module.exports = {
	/**
	 * Returns the word count for any given page based on the paragraph elements.
	 * This cuts out a lot of noise, though not every page uses paragraph tags (silly) and 
	 * sometimes pages use paragraph tags within the footer or header or even navigation menus. 
	 * So this function also has a simple threshold for what gets counted or not based on 
	 * a minimum number of words.
	 *
	 * Note: All of the word count functions are approximations, so the use case should  
	 * be something that works well with such approximations.
	 *
	 * @param  {number} minWords Minimum number of words required to count toward overall page word count
	 * @param  {number} minChars Minimum number of characters required to count a word as a word (exclude "a", "and", "or" etc.)
	 * @return {number} 		 The word count
	*/
	paragraphPageWordCount: function(minWords, minChars) {
		minWords = (typeof(minWords) !== 'number') ? 2:minWords;
		minChars = (typeof(minChars) !== 'number') ? 3:minChars;
		var pageWordCount = 0;
		$ki('p').each(function(el) {
			var pText = el.innerText || el.textContent || "";
			var pWords = pText.split(/\s+/);
			var pWordCount = pWords.length;
			for(var w in pWords) {
				// Discount if the word is too short.
				if(pWords[w].length < minChars) {
					pWordCount -= 1;
				}
			}
			// Count if the paragraph element's contents meets the minimum number of words.
			if(pWordCount > minWords) {
				pageWordCount += pWordCount;
			}
		});
		return pageWordCount;
	},
	/**
	 * A more simple approach to counting the words on a page.
	 *
	 * @param  {array} discountedSelectors A list of selectors to discount
	 * @return {number} 				   The word count
	*/
	pageWordCount: function(discountedSelectors) {
		// discount obvious selectors (so we don't count text in the footer, nav, navbar, etc.)
		discountedSelectors = (typeof(discountedSelectors) !== 'object') ? ['.footer', '.navbar', '.nav', '.header', '.ad', '.advertisement']:discountedSelectors;
		
		var bodyInnerText = $ki('body')[0].innerText || $ki('body')[0].textContent || "";
		var bodyWordCount = bodyInnerText.split(/\s+/).length;
		for(var i in discountedSelectors) {
			s = discountedSelectors[i];
			if($ki(s)[0] !== undefined) {
				var t = ($ki(s)[0].innerText || $ki(s)[0].textContent || "");
				bodyWordCount -= t.split(/\s+/).length;
			}
		}
		return bodyWordCount;
	},
	/**
	 * Estimates reading time in minutes.
	 *
	 * @param  {number} wpm The number
	 * @param  {mixed}  w   The number of words or a string
	 * @return {number}     The estimated time, in minutes, to read
	*/
	readTime: function(w, wpm) {
		wpm = (typeof(wpm) !== 'number') ? 250:wpm;
		wpm = wpm < 1 ? 1:wpm; // no divide by zero. no, don't disassemble number 5.
		var readTime = 0;
		var wc = 0;
		if(w !== undefined) {
			switch(typeof(w)) {
				case 'string':
					wc = w.split(/\s+/).length;
				break;
				case 'number':
					wc = w;
				break;
			}
			readTime = wc / wpm;
		}
		
		return readTime;
	},
	/**
	 * Returns how far down the visitor has scrolled on the page in pixels or optionally as a percentage.
	 *
	 * @param  {boolean} percentage If true, a decmial percentage will be returned instead of a pixel value
	 * @return {number} 		    Pixels or percentage
	*/
	currentScrollPosition: function(percentage) {
		var top = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
		var scrollPosition = top + window.innerHeight;
		if(percentage !== true) {
			return scrollPosition;
		}
		return (scrollPosition / this.pageHeight()).toFixed(2);
	},
	/**
	 * Just returns the top of the current viewport.
	 * 
	 * @return {number} Pixels
	*/
	windowTop: function() {
		return (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
	},
	/**
	 * Gets the current page's height.
	 *
	 * @return {number} The page height in pixels
	*/
	pageHeight: function() {
		var body = document.body;
		var html = document.documentElement;
		return Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
	} 
};
},{}],4:[function(require,module,exports){
/**
 * auto_detect.js is responsible for automatically detecting the proper events to track for any given page.
 * It calls functions within Tbp as necessary by analyzing what's on the page.
 *
 * NOTE: The types of events to be automatically detected and logged can be configured via the global options
 * under the `autoDetect` key value which would be an array of strings. These would be "linkOut" and "read"
 * and "scrolledPage" and so on.
 *
*/
module.exports = {
	autoDetectEvents: function() {
		var tbpContext = this;
		var methods = (typeof(this.opts.autoDetect) === 'object') ? methods:'all';

		tbpContext.log("Tbp.autoDetectEvents() Analyzing the page to watch for the following methods:", methods);

		// Detect outbound link clicks.
		if(methods.indexOf('linkOut') >= 0 || methods === 'all') {
			$ki('a').on('click', function(e) {
				// TODO: Detect social share URLs and discount those when tracking outbound links. Those will get tracked under social.js as shares using a different GA method.

				if((this.href).substr(0, 4).toLowerCase() === 'http') {
					return tbpContext.linkOut({
						"url": this.href,
						"element": this,
						"elementEvent": e,
						"trackDomainOnly": true
					});
				}
				return;
			});
		}

		// Detect full page read.
		if(methods.indexOf('read') >= 0 || methods === 'all') {
			var count = tbpContext.analysis.paragraphPageWordCount();
			tbpContext.read({
				minTime: (tbpContext.analysis.readTime(count) * 60)
			});
		}

		// Detect page scroll percentage.
		if(methods.indexOf('scrolledPage') >= 0 || methods === 'all') {
			tbpContext.scrolledPage();
		}

		// Detect if mouse cursor leaves the page (toward the top)
		if(methods.indexOf('leave') >= 0 || methods === 'all') {
			tbpContext.leave();
		}

		// Detect history navigation state change (backward/forward buttons in browser)
		if(methods.indexOf('historyNavigate') >= 0 || methods === 'all') {
			tbpContext.historyNavigate();
		}

		// Detect hashbang change, many long pages have section navgiation for example. Or, single page JavaScript apps will use these.
		if(methods.indexOf('hashChange') >= 0 || methods === 'all') {
			tbpContext.hashChange();
		}

		// Detect set periods of inactivity (1 min, 3 min, and 5 min by default). 
		if(methods.indexOf('inactivity') >= 0 || methods === 'all') {
			tbpContext.inactivity();
		}
		
		// Detect form abandonment.
		if(methods.indexOf('formAbandonment') >= 0 || methods === 'all') {
			// tbpContext.formAbandonment();
		}
		

	}
};
},{}],5:[function(require,module,exports){
module.exports = {
	/**
	 * In miliseconds, when this script has loaded. Not quite on DOM ready, but close.
	 * Useful in mitigating false engagements, etc.
	 * 
	 * @type {Date}
	*/
	loadTime: (new Date()).getTime(),
	/**
	 * Returns how long it's been since this script was loaded.
	 * 
	 * @return {number} Time elapsed in miliseconds
	*/
	timeSinceLoad: function() {
		return ((new Date()).getTime() - this.loadTime);
	},
	/**
	 * A wrapper around minibus that automatically adds the time the event occurred. 
	 * This way, each funcion calling emit() doesn't need to pass it in the options.
	 * Eeach emitted event also carries with it the visitor's first time seen for 
	 * convenience.
	 * 
	 * The reason for this extra information is so that when users tap into the bus, 
	 * they can take action on things and know when things happened.
	 * Also, panther.do will use this data for conditions to take action.
	 *
	 * @param {Object} event The event object
	*/
	emitEvent: function(event) {
		event._occurred = new Date();
		event._firstVisit = new Date(parseInt(this.cookies.get("_tbp_fv")));
		this.bus.emit('event', event);
	}
};
},{}],6:[function(require,module,exports){
/**
 * "do" is one of Telepathic Black Panther's coolest features.
 * While TBP can just run by itself without the user having to write any complex code or do anyhting at all really...
 * It's understood that some users will want to be more hands on.
 *
 * It is possible to work with TBP. Not just through the panther bus, but also through this semantic interface here.
 * To be clear, you can obtain the same results by listening to the bus though. This is just a faster way to do 
 * some common things.
 * 
 * For example:
 * panther.do.onPageVisit(10).action(function(visitorEvents){
 * 	// Your code here is executed when a visitor has come to your page for the 10th time
 * });
 *
 * ...Or if you want the 10th visit to the entire site:
 * panther.do.onSiteVisit(10).action(function(visitorEvents){...});
 *
 * You'll notice `visitorEvents` being passed to your callback. This contains all events triggered by the user.
 * Ever. Since the very first time they came to your site (provided TBP was in use then).
 *
 * This relies heavily upon cookies and localstorage. It is of course possible for the visitor clear their cookies
 * and localstorage, so this is only as accurate as possible.
 *
 * This also allows the idea of "plugins" or extensions to be used here. All one need do is extend the "do" object.
 * For example, someone might add a plugin that displays a modal with configurable content when some visitor takes
 * a series of actions. Such things are outside the scope of Telepathic Black Panther, but TBP could drive that.
 * 
 * TODO
 * 
 */
},{}],7:[function(require,module,exports){
/**
 * The engagement.js module includes functions that track events related to engagement.
 * How are visitors engaging with a page? Are they reading the content? Commenting?
 * Filling out forms? Or are they getting stuck on forms? Do they abandom them?
 * These kind of questions are answered by the events this module sends to GA.
 * 
*/
module.exports = {
	/**
	 * Tracks a "read" event when users have spent enough time on a page and scrolled far enough.
	 * 
	 * @param  {Object} opts
	 *         minTime:  The amount of time, in seconds, that must pass before the event is considered valid (estimated time to read the content?).
	 *         selector: The element selector (class, id, etc.) that is measured for scrolling.
	 *         category: The Google Analytics Event category.
	 *         action:   The Google Analytics Event action (likely no reason to change this given what the function is for).
	 *         label:    The Google Analytics Event label (useful for categorizing events).
	 *         debug: 	 Logs information to the console
	 *         xMin: 	 The minimum amount of the element to be visible in the viewport to count (if the selector is "body" then this can't be set and will be bottom of page)
	 *         yMin: 	 The minimum amount of the element to be visible in the viewport to count (if the selector is "body" then this can't be set and will be bottom of page)
	 *         
	 * @return {function}
	*/
	read: function(opts) {
		opts = this.extend({
			"_method": "read",
			"minTime": 10,
			"selector": "body",
			"xMin": 0,
			"yMin": 1,
			// for GA events specifically
			"category": "page",
			"action": "read",
			"label": ""
		}, opts);

		var start = new Date().getTime();
		var enoughTimeHasPassed = false;
		var sentEvent = false;
		var hasScrolledFarEnough = false;
		var tbpContext = this;

		// Every 2 seconds, check the conditions and send the event if satisfied.
		setInterval(function(){
			var end = new Date().getTime();
			if((end - start) > (opts.minTime*1000)) {
				if(!enoughTimeHasPassed) {
					tbpContext.log("Tbp.read() " + opts.minTime + " seconds have passed", "info");
				}
				enoughTimeHasPassed = true;
			}

			if(hasScrolledFarEnough === true && enoughTimeHasPassed === true) {
				// Send an event to Google Analytics.
				if(sentEvent === false) {
					// Note: All options get on the bus. This way anything that's listening gets a report back of what options were passed
					// to the method as well as which Telephatic Black Panther method was called (via the "_method" option).
					tbpContext.emitEvent(opts);
				}
				sentEvent = true;
			}
		},(2*1000));

		var elem = $ki(opts.selector).first();
		$ki(document).on('scroll', function() {
			if(opts.selector === "body") {
				if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
					$ki(document).off('scroll');
					tbpContext.log("Tbp.read() The user has scrolled to the bottom of the page", "info");
					hasScrolledFarEnough = true;
				}
			} else {
				if(elem.isOnScreen(opts.xMin,opts.yMin)) {
					$ki(document).off('scroll');
					tbpContext.log("Tbp.read() The user has scrolled far enough down the page", "info");
					hasScrolledFarEnough = true;
				}
			}
		});

	},
	/**
	 * Reports how much of the page came into the browser's viewport in a series of percentages.
	 * 25%, 50%, 75%, and 100%
	 *
	 * Unlike the read() function, this one does not take time into account. It only cares how far 
	 * down the page a user scrolled. It could be useful for building aggregate reports that could 
	 * shed light on how much of a site is seen/used. It could also shed light on abandonment; perhaps 
	 * a page has too much text on it and readers give up after a certain point.
	 *
	 * Note: This won't work for well for short pages. It will simply report 100% of the page came into 
	 * view or perhaps 50% and then 100%.
	 * 
	 * @param  {object}     opts   
	 *         minTime:     		  The amount of time, in seconds, that must pass before the event is considered valid (estimated time to read the content?)
	 *         initialScrollRequired: If the user first must scroll in order for anything to count (default is true, this helps with short pages)
	 *         category:    		  The Google Analytics category
	 *         action:      		  The Google Analytics action
	 *         hitCallback: 		  Optional callback function
	 *         
	 * @return {function}
	*/
	scrolledPage: function(opts) {
		opts = this.extend({
			"_method": "scrolledPage",
			"minTime": 2,
			"initialScrollRequired": true,
			"category": "page",
			"action": "scroll"
		}, opts);

		var tbpContext = this;
		var sent = {};
		var send = function(label) {
			opts.label = label;
			if(sent[label] === undefined) {
				sent[label] = true;
				// tbpContext.log("Tbp.scrolledPage() Logging page scroll event, label: " + label);
				tbpContext.emitEvent(opts);			
			}
		};

		var percent = 0;
		var hasScrolled = false;
		var hasScrolledFn = function() {
			hasScrolled = true;
		};
		window.addEventListener("scroll", hasScrolledFn);

		// TODO: Think about checking if the window position started at the top of the page...
		// The idea was to prevent events from being logged about 25% scroll when the user started at the bottom of the page (a refresh for example or perhaps anhor link)
		// Though the page technically has scrolled down that far. It's the semantic difference between "has scrolled to this point" vs. "has seen up to this point"
		// ...which is of course completely different yet from "has actually read everything up to this point"
		// console.dir(tbpContext.windowTopOnLoad);

		// Check for this every two seconds. In fact, check the current scroll position each time rather than at any point.
		// This would negate situations where a user quickly scrolled down and back up again. While we aren't concerned with 
		// an actual "read" per se, we also want to do the best we can to avoid inaccuracies.
		// The "minTime" option also helps avoid tracking a user who comes to the page, scrolls real quick and leaves.
		// Again, not a "read" and so that "minTime" is meant to be short, but not zero. Though it could be set to zero of course.
		// One last reason here -- Google Analytics will throttle events if too many are sent too quickly.
		setTimeout(function() {
			var intervalId = setInterval(function() {
				// Only actually send something if the user has scrolled. If the user has not yet scrolled, don't do anything.
				// hasScrolled wil lbe true if the user has scrolled yet and it gets checked on this function's interval (every 2 seconds).
				// The reason for this check is because shorter pages may immediately meet the conditions for 25%, 50%, 75%, even 100% and
				// otherwise be automatically recorded when the user didn't actaully scroll. This may be desireable though, so the options
				// can bypass this check with `opts.initialScrollRequired` set to false.
				if(hasScrolled || !opts.initialScrollRequired) {
					percent = tbpContext.analysis.currentScrollPosition(true);
					if(percent >= 0.25) {
						send("25%");
					}
					if(percent >= 0.5) {
						send("50%");
					}
					if(percent >= 0.75) {
						send("75%");
					}
					// Note: 98% will be considered close enough to 100% - there may even be times 100% isn't possible.
					if(percent >= 0.98) {
						send("100%");
						// We can also stop checking at this point. It is theoretically possible the user quickly scrolled to the bottom of the page
						// and could still hit a lower scroll percentage, but it's better to stop checking to not get in the way of anything else
						// that may be running on the page.
						clearInterval(intervalId);
						window.removeEventListener("scroll", hasScrolledFn);
					}
				}
			},(2*1000));
		},(opts.minTime*1000));
	},
	/**
	 * Tracks a click on a link/button that takes a user away from the page.
	 * This ensures the hit is recorded before directing the user onward.
	 * NOTE: Web crawlers will still rely on the "href" attribute being an actual URL.
	 * If this function is used without that attribute, then web crawlers may not properly index 
	 * those linked pages (which may not matter if they are not on the same domain anyway).
	 * So use the "onClick" attribute to call this function instead or register an event listener.
	 *
	 * Kept under engagement.js, though this is kind of a disengagement, right?
	 * 
	 * @param  {Object} opts
	 *         url: 			The URL to redirect to once done tracking
	 *         trackDomainOnly: Just send the domain name to Google Analytics as the label instead of the full URL
	 *         category: 		The Google Analytics Event category
	 *         action: 			The Google Analytics Event action
	 *         label: 			The Google Analytics Event label (optional, this will be the URL by default)
	 *         debug: 			Logs information to the console
	 *         
	 * @return {function}	 	If a callback was specified, otherwise it redirects the user
	*/
	linkOut: function(opts) {
		opts = this.extend({
			"_method": "linkOut",
			"url": "",
			"element": false,
			"elementEvent": false,
			"trackDomainOnly": false,
			"category": "outbound",
			"action": "navigate",
			"label": ""
		}, opts);

		if(opts.url === "") {
			return false;
		}

		// preventDefault() if the link target is not _blank because we need to ensure the event is sent to GA and handled 
		// by anything else before the page disappears.
		if(opts.element && opts.elementEvent) {
			if(opts.element.target !== '_blank') {
				opts.elementEvent.preventDefault();
				opts.elementEvent.stopPropagation();
			}
		}

		// By default the label is going to be the link out.
		var label = opts.url;
		var tmp = document.createElement ('a');
		tmp.href = opts.url;
		// Check to ensure this is an outbound link
		if(tmp.hostname.toLowerCase() === window.location.host.toLowerCase()) {
			window.location.href = opts.url;
			return;
		}

		if(opts.trackDomainOnly === true) {
			label = tmp.hostname;
		}
		// But that can be overridden by the call by passing a label value.
		if(opts.label !== "") {
			label = opts.label;
		}
		// Set label (whatever it is at this point) to opts so it can be passed to the panther bus as part of a single object.
		opts.label = label;

		var tbpContext = this;
		opts.hitCallback = opts.hitCallback || function() {
			// Redirect if target is not _blank, on this callback (after the event has been emitted).
			if(opts.element && opts.element.target !== '_blank') {
				// tbpContext.log("Tbp.linkOut() The user will now be redirected to " + opts.url);
				if(tbpContext.opts.debug) {
					return setTimeout(function(){
						window.location.href = opts.url;
					}, 5000);
				} else {
					window.location.href = opts.url;
					return;
				}
			} else {
				window.location.href = opts.url;
				return;
			}
		};

		tbpContext.emitEvent(opts);

		// Just in case
		if(opts.returnUrl === true) {
			return opts.url;
		}
	},
	/**
	 * Detects a chance in the URL hash. This is common for single-page JavaScript apps with 
	 * routing such as AngularJS.
	 * 
	 * Google Analytics doesn't track these by default (Google Tag Manager has some support around it though).
	 * It's also useful for anchor links on page, #about #sectionA #sectionB etc.
	 * Sometimes pages contain various sections with an index up top. These are considered separate but are
	 * on the same page so GA doens't see that. In addition to seeing how far down the page a visitor scrolled, 
	 * this will help show what content was consumed by a visitor.
	 * 
	 * @param {Object} opts
	*/
	hashChange: function(opts) {
		opts = this.extend({
			"_method": "hashChange",
			"category": "page",
			"action": "navigate",
			"label": ""
		}, opts);
		var tbpContext = this;

		window.onhashchange = function() {
			// The label will be the hash value and the event will only be emitted if the hash value exists. It will include and start with #.
			opts.label = window.location.hash;
			if(opts.label && opts.label.length > 1) {
				tbpContext.emitEvent(opts);
			}
		};
	},
	/**
	 * Detects when a user presses forward or backward on their browser.
	 * This can be useful in understanding if a web site has good UX or not.
	 * If a user can't navigate their way around the site with ease, they may feel the need to use
	 * their browser's back/forward button. Arguably this is why browsers have such buttons, but the
	 * counter argument to that is it's not very easy to do that on mobile devices where the browser bar
	 * (and back/forward controls) are often hidden in favor of screen space. Android devices do allow the
	 * system back button to navigate backwards (though there's no system forward button).
	 *
	 * So the backward/forward button press can actually be important and telling of UX depending on the situation.
	 *
	 * Like linkOut() the label in this case will be the URL. This 
	 *
	 * @param {Object} opts
	*/
	historyNavigate: function(opts) {
		opts = this.extend({
			"_method": "historyNavigate",
			"category": "history",
			"action": "navigate",
			"label": ""
		}, opts);
		var tbpContext = this;

		// http://stackoverflow.com/questions/4570093/how-to-get-notified-about-changes-of-the-history-via-history-pushstate
		// I'm not sure this will be supported in IE9...
		// Perhaps hashchange: https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onhashchange
		// But for now I think this will work. It is supported well enough to be statistically relevant and helpful.
		// There is also: https://github.com/browserstate/history.js - but that's a good bit of code to bring in.
		// Google Tag Manager can also track this stuff: http://www.simoahava.com/analytics/google-tag-manager-history-listener/
		(function(history){
		    var pushState = history.pushState;
		    history.pushState = function(state) {
		        if (typeof history.onpushstate === "function") {
		            history.onpushstate({state: state});
		        }
		        // ... whatever else you want to do
		        // maybe call onhashchange e.handler
		        return pushState.apply(history, arguments);
		    };
		})(window.history);
		window.onpopstate = history.onpushstate = function(e) {
			// Can't tell if we went forward or backward. Just that the history state has changed.
			tbpContext.emitEvent(opts);
		};
	},
	/**
	 * Detects when the mouse cursor has left a particular element on the page (or the page itself).
	 * Basically a proxy to the browser's `mouseleave` event with some configurable conditions.
	 * 
	 * By default, the entire document. This loosely detects the user's disinterest or attempt to use their navbar 
	 * since it looks at mouseleave with regard to the y axis. If the user moves their mouse out of the window 
	 * at the top, this sends an event.
	 * 
	 * It's how ouibounce works (https://github.com/carlsednaoui/ouibounce) and it's the best guess that can be made.
	 * There are many uncaught scenarios.
	 *
	 * Of course don't forget visitors can go to another site by clicking on a link on the page too.
	 * Though TBP knows about that through other functions.
	 *
	 * The problem here is that a user could also be bookmarking the site =) That's not exactly disinterest or abandonment.
	 * Even if a timer is used here, it could take time for the user to organize the bookmark. It takes no time at all
	 * to click the browser's "home" button or "back" button. So a timer would have missed those.
	 * 
	 * The only real guaranteed way is through `onbeforeunload` - the browser's event on exit, but that dialog can't be styled.
	 *
	 * Regardless, it is possible to respond to the `mouseleave` event fired by browsers and emit that as an event.
	 *
	 * Note: The "delay" option here makes 
	 *
	 * @param {Object} opts Various options including the category, action, label for the event (for GA)
	 *                      trackOnce: If true (default), sets a cookie so the event may only occur once.
	 *                      
	 *                      perPage:   If true, the "trackOnce" is per page not site wide (cookie path gets set).
	 *                      
	 *                      delay:     An important one to note, it sets a time (ms) to count the leave, if a user moves their 
	 *                      	       mouse back into the element before the delay, it resets. So in order to "count" as a "leave"
	 *                      	       the user must have left and not came back for this period of time (default 1 second).
	 *                      	       
	 *                      minTime:   Like delay, except this is the minimum amount of time that must pass before even considering
	 *                      		   something to be a valid mouseleave. Meaning, the page must be loaded for this period of time.
	 *                      		   This prevents mouseleave events on non-engagement. If a visitor loads the page but navigates 
	 *                      		   away real quick, it shouldn't be counted. Or should it? This adjusts that (default: 3 seconds).
	 *                      		   Note: This isn't on DOM ready, this timer starts upon this function being called.
	 *                      		   
	 *                      proximity: How close the mouse cursor needs to be from the edge of the element {top: 0, right: 0, bottom: 0, left: 0}
	 *                      
	 *                      element:   Which element to watch (by default the entire page frame is watched)
	 *
	 * 						label:     Set this to a string that makes sense for the element. You'll want to use it to segment your analytics and 
	 * 								   run reports, so make sure it's something useful and relevant.
	*/
	leave: function(opts) {
		opts = this.extend({
			"_method": "leave",
			"category": "behavior",
			"action": "mouseleave",
			"label": "page",
			"trackOnce": true,
			"perPage": true,
			"delay": 1000,
			"minTime": 3000,
			// TODO: Proximity.
			"proximity": {top: 0, right: 0, bottom: 0, left: 0},
			"element": document.documentElement
		}, opts);

		var tbpContext = this;

		// The best we can do, probably not a good idea to pass an element without an id. Unless it's unique HTML code (which <html> and <body> will be of course).
		var elemId = opts.element.id || opts.element.outerHTML;
		var leaveKey = '_tbp_' + this.hashCode("leave_" + elemId, true);
		var path = opts.perPage ? window.location.pathname:"/";
		var _delayTimer = null;
		
		var cookies = this.cookies;
		setTimeout(function() {
			setTimeout(function() {
				opts.element.addEventListener('mouseleave', function(e) {
					// TODO:
					// Need to get the position of the element on the page and its bounding box to get the boundaries relative to the page then then subtract
					// from the cursor position which is already relative to the page to get distance to the edge of the element.
					// Then check against the proximity.
					// 
					// if(e.clientY > opts.proximity.top || e.clientY < opts.proximity.bottom || e.clientX > opts.proximity.right || e.clientX < opts.proximity.left) {
					// 	console.log("Not pushing event yet");
					// 	console.log("Y: " + e.clientY + " X: " + e.clientX);
					// 	return;
					// }

					// In the meantime, this will work just like ouibounce. Just set it when looking at the entire document.
					// This default scenario is like ouibounce in that we are looking at when the visitor moves their cursor up toward the address bar
					// or to a navigation button or perhaps even the menu or close button in their browser. Who knows...It's a guess really.
					if(opts.element === document.documentElement) {
						if(e.clientY > opts.proximity.top) {
							return;
						}
					}

					_delayTimer = setTimeout(function() {
						if(!cookies.get(leaveKey)) {
							tbpContext.log("Sending event for leaving.", "info");
							tbpContext.emitEvent(opts);
						} else {
							tbpContext.log("Left, but event already sent.", "info");
						}
						if(opts.trackOnce) {
							cookies.set(leaveKey, true, {path: path, expires: Infinity});
						}
					}, opts.delay);
				});

				opts.element.addEventListener('mouseenter', function() {
					if (_delayTimer) {
						clearTimeout(_delayTimer);
						_delayTimer = null;
					}
				});
			}, opts.delay);
		}, opts.minTime);
	},
	/**
	 * Determines if a user has engaged with a form, but then abandoned 
	 * it or had a difficult time completing it.
	 *
	 * Probably extremely handy on a checkout page.
	 *
	 * Maybe also have another function for time to fill out form.
	 * Or, similar to inactivity, a "hesitation" timer. Once a visitor clicks on a form, how long does it take them to complete it?
	 * Or once the mouse enters a button or certain section of a page, how long does it take for the visitor to click the CTA?
	 * For that matter, many of these events might be useful: http://www.clicktale.com/products/mouse-tracking-suite/link-analytics
	 * The problem in GA is matching the links to the data then telling/visually showing a reporter which link it was.
	 *
	 * Same issue exists for forms too...How many forms are on the page? How are they referenced/named?
	 * We can simply say, "A form on this page was abandoned" but what if there are multiple?
	 * So this may not be such an auotmatic thing...unless each form has an id of course.
	 * 
	 * 
	 * @param {Object} opts
	*/
	formAbandonment: function(opts) {
		opts = this.extend({
			"_method": "formAbandonment",
			"category": "behavior",
			"action": "formAbandonment",
			"label": "",
			"element": null
		}, opts);

		var tbpContext = this;

		// We need a form element to be passed.
		if(!opts.element) {
			return;
		}



	},
	/**
	 * Emits events for the period of time it took to complete a form.
	 *
	 * This can shed light on forms that may confuse visitors or otherwise create friction.
	 * Forms that take a long time to complete may need to be broken up or made easier for better UX.
	 *
	 * @param {Object} opts
	*/
	formCompletionTime: function(opts) {
		opts = this.extend({
			"_method": "formCompletionTime",
			"category": "behavior",
			"action": "formCompletionTime",
			"label": "",
			"element": null
		}, opts);

		var tbpContext = this;

		// We need a form element to be passed.
		if(!opts.element) {
			return;
		}

	},
	/**
	 * Emits events for periods of inactivity on a page.
	 * 
	 * If the visitor does not move their mouse or scroll or click or do anything at all for specific 
	 * intervals of time, events get emitted. These periods of time are configurable, by default they 
	 * are 1 minute, 3 minute, and 5 minutes.
	 *
	 * Note: It is possible that the visitor is reading or watching a video. Though if they are reading, 
	 * they likely should be moving their mouse or scroll the page. So adjust the timing accordingly.
	 *
	 * Though in the case of a video, this "inactivity" could actually be engagement. It could mean that 
	 * the visitor is watching the video and therefore not moving their mouse.
	 *
	 * This inactivity timer can be paused in such cases:
	 * http://stackoverflow.com/questions/16755129/detect-fullscreen-mode
	 * https://gist.github.com/helgri/1336232
	 *
	 * Can also check for HTML5 video and if it is playing or not:
	 * http://stackoverflow.com/questions/8599076/detect-if-html5-video-element-is-playing
	 * By using: var stream = document.getElementsByTagName('video');
	 * Then looping those (might be multiple, but an array is always returned of course) and checking
	 * stream[0].paused  ... if paused is false, then media is playing on the page.
	 *
	 * So when media is playing or when the browser is perhaps fullscreen we can stop this inactivity counter.
	 * We know the visitor is very likely engaged, just not moving their mouse around.
	 *
	 * Knowing when the page loaded (or when TBP was listening) we can also determine "true time on page"
	 * in that we can figure out how long until the visitor went inactive. Google Analytics reports time on 
	 * page and it's a bit inaccurate. It's inaccurate if a user leaves their computer open while they are at lunch.
	 * It's inaccurate (I think) if visitors switch tabs because the timer is still going...But the visitor isn't
	 * actually looking at the page.
	 *
	 * If there is no mouse movmement, keys pressed, or scrolling...Then we know they aren't paying attention.
	 * We can assume the visitor left their computer to do something else physically. Or minimized the window.
	 * So we can record our own time on page event and provide some accuracy over Google Analytics.
	 *
	 * This also shows something interesting. If a visitor has a web page open in a tab they value it.
	 * They wanted to save it for later essentially. Possibly the immediate future. By looking at the pages
	 * where there was inactivity one might be able to make those more engaging. We know visitors are interested
	 * in these pages...Enough that they keep them open (just aren't actively looking at them). So how do we keep
	 * the visitor more engaged? If we incrased engagment on the page, would it help (determined by other data)?
	 * So this becomes a pretty cool metric. 
	 *
	 * Of course the web page can also listen for this event and do something upon inactivity. Maybe encourage
	 * the visitor to engage...
	 * 
	 * @param {Object} opts
	*/
	inactivity: function(opts) {
		opts = this.extend({
			"_method": "inactivity",
			"category": "behavior",
			"action": "inactive",
			"label": "",
			"periods": [60, 180, 300],
			// "timeToDisengage": 60, // can take lowest period for this. an event will be emitted that takes time since load to the period. 
			// that is how long it took a visitor to become inactive...so analytics reports can segment this. users are inactive after 3 minutes let's say.
			// and then we can ignore the fact that time on page was 10 minutes. because google's time on page is inaccurate in that case.
			"checkInterval": 2
		}, opts);

		var tbpContext = this;

		var sent = {};
		var timeSinceLastAcitivty = (new Date()).getTime();
		var active = false;
		var setActiveOnInput = function() {
			active = true;
			timeSinceLastAcitivty = (new Date()).getTime();
		};
		// All the events that tell us a visitor is actively engaging with the page.
		window.addEventListener("scroll", setActiveOnInput);
		window.addEventListener("mousemove", setActiveOnInput);
		window.addEventListener("keypress", setActiveOnInput);
		window.addEventListener("click", setActiveOnInput);

		// Checks for inactivity on the `opts.checkInterval` which can be tuned for performance.
		var inactivityCheck = setInterval(function() {
			// Check to see if active is false, if so - there has been no activity.
			if(!active) {
				// Then check if enough time has passed for the periods defined in `opts.periods`
				for(var i in opts.periods) {
					if(opts.periods.hasOwnProperty(i)) {
						var periodStr = opts.periods[i].toString();
						if(!sent.hasOwnProperty(periodStr)) {
							sent[periodStr] = false;
						}
						var now = (new Date()).getTime();
						if(sent[periodStr] === false && ((now - timeSinceLastAcitivty) >= (opts.periods[i] * 1000))) {
							opts.label = periodStr;
							tbpContext.emitEvent(opts);
							sent[periodStr] = true;
						}
					}
				}

				// watch all periods and once all have been reached. stop inactivityCheck and remove event listeners.
				var stopWatching = true;
				for(var j in sent) {
					if(sent[j] === false) {
						stopWatching = false;
					}
				}
				if(stopWatching) {
					// Keep it clean. Having all of these listeneers and the inactivity interval can affect performance.
					tbpContext.log("Stop watching for activity, events for all periods have been sent.", "info");
					clearInterval(inactivityCheck);
					window.removeEventListener("scroll", setActiveOnInput);
					window.removeEventListener("mousemove", setActiveOnInput);
					window.removeEventListener("keypress", setActiveOnInput);
					window.removeEventListener("click", setActiveOnInput);
				}
				
			}

			// Set active to false. It will get set back to true if there is activity before the next pass.
			active = false;
		}, opts.checkInterval*1000);
	}
};
},{}],8:[function(require,module,exports){
/*!
 * ki.js - jQuery-like API super-tiny JavaScript library
 * Copyright (c) 2014 Denis Ciccale (@tdecs)
 * Released under MIT license
 * Original source: https://github.com/dciccale/ki.js
 *
 * This was modified (not forked, though maybe it will be) to avoid conflicts with jQuery.
 * $ was changed to $ki
 * JSLint ignore comments were also added as well as a module.exports.
 * 
 */
/* jshint ignore:start */
!function (b, c, d, e, f) {

  // addEventListener support?
  f = b['add' + e];

  /*
   * init function (internal use)
   * a = selector, dom element or function
   * d = placeholder for matched elements
   * i = placeholder for length of matched elements
   */
  function i(a, d, i) {
    for(d = (a && a.nodeType ? [a] : '' + a === a ? b.querySelectorAll(a) : c), i = d.length; i--; c.unshift.call(this, d[i]));
  }

  /*
   * $ki main function
   * a = css selector, dom object, or function
   * http://www.dustindiaz.com/smallest-domready-ever
   * returns instance or executes function on ready
   */
  $ki = function (a) {
    return /^f/.test(typeof a) ? /in/.test(b.readyState) ? setTimeout('$ki('+a+')', 9) : a() : new i(a);
  };

  // set ki prototype
  $ki[d] = i[d] = {

    // default length
    length: 0,

    /*
     * on method
     * a = string event type i.e 'click'
     * b = function
     * return this
     */
    on: function (a, b) {
      return this.each(function (c) {
        return f ? c['add' + e](a, b, false) : c.attachEvent('on' + a, b);
      });
    },

    /*
     * off method
     * a = string event type i.e 'click'
     * b = function
     * return this
     */
    off: function (a, b) {
      return this.each(function (c) {
        return f ? c['remove' + e](a, b) : c.detachEvent('on' + a, b);
      });
    },

    /*
     * each method
     * a = the function to call on each iteration
     * b = the this value for that function (the current iterated native dom element by default)
     * return this
     */
    each: function (a, b) {
      for (var c = this, d = 0, e = c.length; d < e; ++d) {
        a.call(b || c[d], c[d], d, c);
      }
      return c;
    },

    // for some reason is needed to get an array-like
    // representation instead of an object
    splice: c.splice
  };
}(document, [], 'prototype', 'EventListener');
/* jshint ignore:end */

module.exports = $ki;
},{}],9:[function(require,module,exports){
module.exports = {
	first: function() {
		return $ki(this[0]);
	},
	last: function() {
		return $ki(this[this.length - 1]);
	},
	outerHeight: function() {
		this.each(function(b) {
			b.outerHeight = b.offsetHeight;
			var style = getComputedStyle(b);
			b.outerHeight += parseInt(style.marginTop) + parseInt(style.marginBottom);
		});
		return this.length > 1 ? this : this[0].outerHeight;
	},
	outerWidth: function() {
		this.each(function(b) {
			b.outerWidth = b.offsetWidth;
			var style = getComputedStyle(b);
			b.outerWidth += parseInt(style.marginLeft) + parseInt(style.marginRight);
		});
		return this.length > 1 ? this : this[0].outerWidth;
	},
	html: function(a) {
		return a === []._ ? this[0].innerHTML : this.each(function(b) {
			b.innerHTML = a;
		});
	},
	offset: function() {
		this.each(function(b) {
			var rect = b.getBoundingClientRect();
			b.offset = {
			  top: rect.top + document.body.scrollTop,
			  left: rect.left + document.body.scrollLeft
			};
		});
		return this.length > 1 ? this : this[0].offset;
	},
	hasClass: function(a) {
		return this[0].classList.contains(a);
	},
	/**
	 * Determines if an element falls within the browser's viewport.
	 * 
	 * @param  {number}  x How much of the element must be visible along the x axis as a percentage (0, 0.5, 1, etc.)
	 * @param  {number}  y How much of the element must be visible along the y axis as a percentage (0, 0.5, 1, etc.)
	 * @return {boolean}   Whether or not enough of the element is visible on the screen to count
	*/
	isOnScreen: function(x, y) {
		if(x === null || typeof x === 'undefined') { x = 1; }
	    if(y === null || typeof y === 'undefined') { y = 1; }
	    
	    var viewport = {};
	    viewport.left = (window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft;
		viewport.top = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;

	    viewport.right = viewport.left + window.innerWidth;
	    viewport.bottom = viewport.top + window.innerHeight;
	    
	    var height = this.outerHeight();
	    var width = this.outerWidth();
	 
	    if(!width || !height){
	        return false;
	    }
	    
	    var bounds = this.offset();
	    bounds.right = bounds.left + width;
	    bounds.bottom = bounds.top + height;
	    
	    var visible = (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
	    
	    if(!visible){
	        return false;   
	    }
	    
	    var deltas = {
	        top : Math.min( 1, ( bounds.bottom - viewport.top ) / height),
	        bottom : Math.min(1, ( viewport.bottom - bounds.top ) / height),
	        left : Math.min(1, ( bounds.right - viewport.left ) / width),
	        right : Math.min(1, ( viewport.right - bounds.left ) / width)
	    };
	    
	    return (deltas.left * deltas.right) >= x && (deltas.top * deltas.bottom) >= y;
	}
};
},{}],10:[function(require,module,exports){
// Make ki available as $ki not $ (to avoid jQuery conflict) and because ki.ie8.js references $ki global.
// TODO: Maybe address that, but I don't care if there's a simple selector hanging out.
window.$ki = require('./ki.ie8.js');

(function() {
	
	Tbp = (function() {
		var defaults = {
			debug: false,
			autoDetect: true,
			// The default use case is to send events to Google Analytics, but that can be disabled...
			ga: true,
			// We also, by default, push events to the dataLayer (commonly used by GTM and many other things) 
			// pass an array in here, `dataLayer` || [] used by default if this is true
			dataLayer: true,
			// For events
			category: "object",
			action: "click",
			label: null,
			value: null,
			// Visitor info
			clientId: null,
		};

		/**
		 * Telepathic Black Panther
		 * 
		 * @param {object} opts Some options used by Tbp in various places
		*/
		function Tbp(opts) {
			// Tbp() or new Tbp() will work this way.
			if (!(this instanceof Tbp)) return new Tbp(opts);

			if (typeof window.ga === "undefined") {
				console.warn("Google Analytics not found.");
				this.ga = function(){};
			} else {
				this.ga = window.ga;
			}

			this.ga(function(tracker) {
				defaults.clientId = tracker.get('clientId');
			});

			// Extend defaults with options.
			this.opts = this.extend(defaults, opts);

			// Setup auto detection for everything. If an array was passed then only on those defined methods (names of functions).
			if(this.opts.autoDetect === true) {
				this.autoDetectEvents();
			} else if (typeof(this.opts.autoDetect) === 'object') {
				this.autoDetectEvents(autoDetect);
			}

			// Cookie the user. Set the first time Telepathic Black Panther spotted them (trying to keep cookie names short, fv = first visit).
			if(!this.cookies.get("_tbp_fv")) {
				this.cookies.set("_tbp_fv", (new Date().getTime()), {expires: Infinity});
			}

			// Setup the panther bus
			this.bus = this.minibus.create();

			// There's going to be a few closures coming up here...
			var tbpContext = this;

			// Automatically submit to Google Analytics (unless configured otherwise) and log the event to console if debug was set true.
			// Also push on to the dataLayer if told to do so and emit an event for that through the bus too.
			// Anything else a user can handle via the bus.
			this.bus.on('event', function(event) {
				tbpContext.log("Emitted Event", event);

				// Push to the dataLayer
				if(typeof(tbpContext.opts.dataLayer) === "object") {
					tbpContext.opts.dataLayer.push(event);
				} else if(tbpContext.opts.dataLayer === true) {
					if(typeof(dataLayer) === "object") {
						dataLayer.push(event);
					}
				}

				// Push to Google Analytics
				if(tbpContext.opts.ga && tbpContext.opts.label !== "" && tbpContext.opts.label !== null) {
					tbpContext.log("Sending event to Google Analytics", "info");
					ga('send', {
						'hitType': 'event',
						'eventCategory': event.category,
						'eventAction': event.action,
						'eventLabel': event.label,
						'hitCallback': event.hitCallback || null
					});
				} else {
					// Regardless of whether or not Google Analytics is in use, call "hitCallback" if it was defined.
					// This is particularly important for the `linkOut` method as that one must stop the browser from navigating 
					// in order to allow the event to be pushed. Then after the event has been pushed, it can continue.
					if(typeof(event.hitCallback) === "function") {
						event.hitCallback(event);
					}
				}
			});

			// Here's how one could watch the dataLayer for anything Telepathic Black Panther pushes to it.
			// this.bus.on('dataLayer', function(event, theDataLayer) {
			// 	console.dir(event);
			// 	console.dir(theDataLayer);
			// });

			// Override push() on the dataLayer to catch changes to it.
			if(this.opts.dataLayer) {
				var handleDataLayerPush = function () {
					for (var i = 0, n = this.length, l = arguments.length; i < l; i++, n++) {
						tbpContext.bus.emit('dataLayer', this[n] = arguments[i], this);
						//RaiseMyEvent(this, n, this[n] = arguments[i]); // assign/raise your event
					}
					return n;
				};

				// Hopefully `dataLayer` will be an array already defined. However, some people may want to name it something different 
				// and that's ok too because `this.opts.dataLayer` can be passed an array to use instead. If `dataLayer` doesn't exist yet, 
				// just make a new empty array to use.
				if(typeof(this.opts.dataLayer) === "object") {
					Object.defineProperty(this.opts.dataLayer, "push", {
						configurable: false,
						enumerable: false, // hide from for...in
						writable: false,
						value: handleDataLayerPush
					});
				} else if(this.opts.dataLayer === true) {
					if(typeof(dataLayer) === "object") {
						Object.defineProperty(dataLayer, "push", {
							configurable: false,
							enumerable: false, // hide from for...in
							writable: false,
							value: handleDataLayerPush
						});
					}
				}
			}

		}

		Tbp.prototype = {
			/**
			 * Simple extend to mimic jQuery's because we don't want a dep on jQuery for just this.
			 * That'd be sillyness.
			 * 
			 * @return {Object} Returns an extended object
			*/
			extend: function() {
				for(var i=1; i<arguments.length; i++) {
					for(var key in arguments[i]) {
						if(arguments[i].hasOwnProperty(key)) {
							arguments[0][key] = arguments[i][key];
						}
					}
				}
				return arguments[0];
			},
			/**
			 * A simple hash function.
			 *
			 * @param  {String}  str    String to hash
			 * @param  {Boolean} retStr Return a string if true, else number
			 * @return {mixed} 			Hashed string as a numeric value -2^31 to 2^31
			 */
			hashCode: function(str, retStr) {
				for(var ret = 0, i = 0, len = str.length; i < len; i++) {
					ret = (31 * ret + str.charCodeAt(i)) << 0;
				}
				return retStr ? parseInt(ret):ret;
			},
			/**
			 * A simple console log wrapper that first checks if debug mode is on.
			 *
			 * @var {mixed} message The string message to log
			 * @var {mixed} obj     Either an object to log out or a string that will be matched for a log level that might change the color of the message
			*/
			log: function(message, obj) {
				if(this.opts.debug && console !== undefined) {
					var style = "";
					switch(obj) {
						case "warn":
							style = "color:orange;";
							break;
						case "error":
							style = "color:red;font-weight:bold;";
							break;
						case "info":
							style = "color:blue;";
							break;
						case "success":
							style = "color:green;";
							break;
					}
					if(style !== "") {
						console.log("%c" + message, style);
					} else {
						console.log(message, obj);
					}
				}
			},
			/**
			 * Another simple wrapper for displaying an object as a collapsible tree via console.dir().
			 * 
			 * @param  {mixed} obj Object to print to the console
			 */
			dir: function(obj) {
				if(this.opts.debug && console !== undefined) {
					console.dir(obj);
				}
			}
		};
		
		// Extend ki to include some more functions.
		Tbp.prototype.extend($ki.prototype, require('./ki.plugins.js'));
		Tbp.prototype.$ = $ki;

		// Merge from modules
		Tbp.prototype.extend(Tbp.prototype, require('./core.js'));
		Tbp.prototype.extend(Tbp.prototype, require('./engagement.js'));
		Tbp.prototype.extend(Tbp.prototype, require('./social.js'));
		Tbp.prototype.extend(Tbp.prototype, require('./auto_detect.js'));

		// Add some more modules tucked out of the way
		Tbp.prototype.minibus = require('../node_modules/minibus/minibus.js');
		Tbp.prototype.analysis = require('./analysis.js');
		Tbp.prototype.cookies = require('../node_modules/cookies-js/src/cookies.js');

		return Tbp;
	})();
	module.exports = Tbp;
})();
},{"../node_modules/cookies-js/src/cookies.js":1,"../node_modules/minibus/minibus.js":2,"./analysis.js":3,"./auto_detect.js":4,"./core.js":5,"./engagement.js":7,"./ki.ie8.js":8,"./ki.plugins.js":9,"./social.js":11}],11:[function(require,module,exports){
/**
 * The social.js module includes functions that track events related to social media.
 * For example, when visitors click social share buttons on the page.
 * 
*/
module.exports = {
};
},{}]},{},[3,4,5,6,7,8,9,10,11,1]);
