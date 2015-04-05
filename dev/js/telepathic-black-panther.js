(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
	 * Just a wrapper around Google Analytics ga() with some defaults and a check 
	 * to ensure a label has been set (which is typically optional, but in our case required).
	 * This shortens the amount of code written.
	 * 
	 * So for example, to track a click on some welcome video on a page:
	 * blackprintTrack.event({"label": "welcome video"})
	 *
	 * Or if that's to be tracked as a "watch" then:
	 * blackprintTrack.event({"label": "welcome video", "action": "watch"})
	 *
	 * The default category here is "object" which tells the reporter that we're talking about 
	 * some object on the page; an image, video, button, etc.
	 * However, even the category can be changed.
	 * 
	 * @param  {Object} opts
	*/
	event: function(opts) {
		opts = this.extend(this.opts, opts);
		if(opts.label !== "" && opts.label !== null) {
			return this.ga('send', 'event', opts.category, opts.action, opts.label, opts.value);
		}
		return false;
	}
};
},{}],2:[function(require,module,exports){
/*!
 * ki.js - jQuery-like API super-tiny JavaScript library
 * Copyright (c) 2014 Denis Ciccale (@tdecs)
 * Released under MIT license
 * Original source: https://github.com/dciccale/ki.js
 *
 * This was modified (not forked, though maybe) to keep $ out from global space.
 * The reason is to avoid conflicts with jQuery, etc.
 * Browserify is also used, so we export $ for use elsewhere.
 * 
 * Aside from scoping, a few semicolons were added along with two returns to satify jslint warnings.
 */
var $;
(function (b, c, d, e, f) {

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
   * $ main function
   * a = css selector, dom object, or function
   * http://www.dustindiaz.com/smallest-domready-ever
   * returns instance or executes function on ready
   */
  $ = function (a) {
    return /^f/.test(typeof a) ? /in/.test(b.readyState) ? setTimeout('$('+a+')', 9) : a() : new i(a);
  };

  // set ki prototype
  $[d] = i[d] = {

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
})(document, [], 'prototype', 'EventListener');

module.exports = {"$":$};
},{}],3:[function(require,module,exports){
(function() {
	window.Tbp = (function() {
		var defaults = {
			// For events
			category: "object",
			action: "click",
			label: null,
			value: null,
			// Visitor info
			clientId: null,
		};

		function Tbp(opts) {
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
			return this;
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
			}
		};

		// Merge from modules
		Tbp.prototype.extend(Tbp.prototype, require('./core.js'));
		Tbp.prototype.extend(Tbp.prototype, require('./social.js'));
		Tbp.prototype.extend(Tbp.prototype, require('./ki.ie8.js'));

		return Tbp;
	})();
	module.exports = Tbp;
})();
},{"./core.js":1,"./ki.ie8.js":2,"./social.js":4}],4:[function(require,module,exports){
module.exports = {
	foo: "bar"
};
},{}]},{},[1,2,3,4]);
