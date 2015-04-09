(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
	 * @param {number} minWords Minimum number of words required to count toward overall page word count
	 * @param {number} minChars Minimum number of characters required to count a word as a word (exclude "a", "and", "or" etc.)
	 * @return {number} The word count
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
	 * @param {array} discountedSelectors A list of selectors to discount
	 * @return {number} The word count
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
	 * @param {number} wpm The number
	 * @param {mixed} w The number of words or a string
	 * @return {number} The estimated time, in minutes, to read
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
	}
};
},{}],2:[function(require,module,exports){
/**
 * auto_detect.js is responsible for automatically detecting the proper events to track for any given page.
 * It calls functions within Tbp as necessary by analyzing what's on the page.
 * 
*/
module.exports = {
	autoDetectEvents: function() {
		if(this.opts.debug === true) {
			console.dir('Tbp.autoDetectEvents() Analyzing the page to watch for events');
		}
		var tbpContext = this;

		// Detect outbound link clicks.
		$ki('a').on('click', function(e) {
			// TODO: Detect social share URLs and discount those when tracking outbound links. Those will get tracked under social.js as shares using a different GA method.
			
			// If the link is not opening in another window or frame, etc. then stop propagation. 
			// Otherwise, there might not be enough time to record the event.
			if(this.target !== '_blank') {
				e.preventDefault();
				e.stopPropagation();
			}

			if((this.href).substr(0, 4).toLowerCase() == 'http') {
				tbpContext.linkOut({
					"url": this.href,
					"trackDomainOnly": true,
					// Return the URL, stopping the redirect in the linkOut() function if opening in a new window.
					// Otherwise if the link is opening in a new window, there's no reason to redirect and the event will 
					// be recorded because there's plenty of time on the page still.
					"returnUrl": (this.target === '_blank')
				});
			}
		});

		// Detect full page read.
		var count = tbpContext.analysis.paragraphPageWordCount();
		tbpContext.read({
			minTime: (tbpContext.analysis.readTime(count) * 60)
		});

	}
};
},{}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
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
	*/
	read: function(opts, onSend) {
		opts = this.extend({
			"minTime": 10,
			"selector": "body",
			"category": "page",
			"action": "read",
			"label": "engagements",
			"xMin": 0,
			"yMin": 1
		}, opts);
		// If not set, take from Tbp opts.
		if(!opts.hasOwnProperty('debug')) {
			opts.debug = this.opts.debug;
		}
		onSend = (onSend === undefined) ? function(opts){}:onSend;

		var start = new Date().getTime();
		var enoughTimeHasPassed = false;
		var sentEvent = false;
		var hasScrolledFarEnough = false;

		// Every 2 seconds, check the conditions and send the event if satisfied.
		setInterval(function(){
			var end = new Date().getTime();
			if((end - start) > (opts.minTime*1000)) {
				if(opts.debug && !enoughTimeHasPassed) {
					console.log("Tbp.read() " + opts.minTime + " seconds have passed");
				}
				enoughTimeHasPassed = true;
			}

			if(hasScrolledFarEnough === true && enoughTimeHasPassed === true) {
				// Send an event to Google Analytics.
				if(sentEvent === false) {
					if(opts.debug) {
						console.log("Tbp.read() Logging page read event");
					}
					ga('send', {
						'hitType': 'event',
						'eventCategory': opts.category,
						'eventAction': opts.action,
						'eventLabel': opts.label,
						'hitCallback': onSend(opts)
					});
				}
				sentEvent = true;
			}
		},(2*1000));

		var elem = $ki(opts.selector).first();
		$ki(document).on('scroll', function(e) {
			if(opts.selector == "body") {
				if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
					$ki(document).off('scroll');
					if(opts.debug) {
						console.log("Tbp.read() The user has scrolled to the bottom of the page");
					}
					hasScrolledFarEnough = true;
				}
			} else {
				if(elem.isOnScreen(opts.xMin,opts.yMin)) {
					$ki(document).off('scroll');
					if(opts.debug) {
						console.log("Tbp.read() The user has scrolled far enough down the page");
					}
					hasScrolledFarEnough = true;
				}
			}
		});

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
	 *         returnUrl: 		Just return the URL and don't actually redirect
	 *         trackDomainOnly: Just send the domain name to Google Analytics as the label instead of the full URL
	 *         category: 		The Google Analytics Event category
	 *         action: 			The Google Analytics Event action
	 *         label: 			The Google Analytics Event label (optional, this will be the URL by default)
	 *         debug: 			Logs information to the console
	 * @return redirect
	 */
	linkOut: function(opts, onSend) {
		opts = this.extend({
			"url": "",
			"returnUrl": false,
			"trackDomainOnly": false,
			"category": "outbound",
			"action": "navigate",
			"label": ""
		}, opts);
		// If not set, take from Tbp opts.
		if(!opts.hasOwnProperty('debug')) {
			opts.debug = this.opts.debug;
		}
		onSend = (onSend === undefined) ? false:onSend;

		if(opts.url === "") {
			return false;
		}

		// By default the label is going to be the link out.
		var label = opts.url;
		if(opts.trackDomainOnly === true) {
			var tmp = document.createElement ('a');
			tmp.href = opts.url;
			label = tmp.hostname;
		}
		// But that can be overridden by the call by passing a label value.
		if(opts.label !== "") {
			label = opts.label;
		}

		ga('send', {
			'hitType': 'event',
			'eventCategory': opts.category,
			'eventAction': opts.action,
			'eventLabel': label,
			'hitCallback':function() {
				if(opts.debug) {
					console.log("Tbp.linkOut() Recording outbound navigate for " + label);
					// First, use the onComplete callback if defined (which always returns the URL).
					if(typeof(onSend) == 'function') {
						return onSend(opts.url);
					}

					// Then either return the URL or redirect based on the options passed.
					if(opts.returnUrl === false) {
						console.log("Tbp.linkOut() The user will now be redirected to " + opts.url);
						return setTimeout(function(){
							window.location.href = opts.url;
						}, 5000);
					}
					return opts.url;
				} else {
					// First, use the onComplete callback if defined (which always returns the URL).
					if(typeof(onSend) == 'function') {
						return onSend(opts.url);
					}

					// Then either return the URL or redirect based on the options passed.
					if(opts.returnUrl === false) {
						window.location.href = opts.url;
					}
					return opts.url;
				}
			}
		});

		// Just in case
		if(opts.returnUrl === true) {
			return opts.url;
		}
	}
};
},{}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
// Make ki available as $ki not $ (to avoid jQuery conflict) and because ki.ie8.js references $ki global.
// TODO: Maybe address that, but I don't care if there's a simple selector hanging out.
window.$ki = require('./ki.ie8.js');

(function() {
	
	Tbp = (function() {
		var defaults = {
			debug: false,
			autoDetect: true,
			// For events
			category: "object",
			action: "click",
			label: null,
			value: null,
			// Visitor info
			clientId: null,
		};

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

			if(this.opts.autoDetect === true) {
				this.autoDetectEvents();
			}

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
		
		// Extend ki to include some more functions.
		Tbp.prototype.extend($ki.prototype, require('./ki.plugins.js'));
		Tbp.prototype.$ = $ki;

		// Reference it on Tbp.
		//Tbp.prototype.$ = $ki;
		// window.$ba = require('./balalaika.js');

		// Merge from modules
		Tbp.prototype.extend(Tbp.prototype, require('./core.js'));
		Tbp.prototype.extend(Tbp.prototype, require('./engagement.js'));
		Tbp.prototype.extend(Tbp.prototype, require('./social.js'));
		Tbp.prototype.extend(Tbp.prototype, require('./auto_detect.js'));

		// Add some more modules tucked out of the way
		Tbp.prototype.analysis = require('./analysis.js');
		
		return Tbp;
	})();
	module.exports = Tbp;
})();
},{"./analysis.js":1,"./auto_detect.js":2,"./core.js":3,"./engagement.js":4,"./ki.ie8.js":5,"./ki.plugins.js":6,"./social.js":8}],8:[function(require,module,exports){
/**
 * The social.js module includes functions that track events related to social media.
 * For example, when visitors click social share buttons on the page.
 * 
*/
module.exports = {
};
},{}]},{},[1,2,3,4,5,6,7,8]);
