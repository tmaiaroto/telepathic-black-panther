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
				if(tbpContext.opts.ga && event.label !== "" && event.label !== null) {
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