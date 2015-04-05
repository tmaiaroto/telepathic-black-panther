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