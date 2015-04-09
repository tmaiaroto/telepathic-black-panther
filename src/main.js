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