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
					// There is no response from GA so we can't tell if this was really successful...
					ga('send', 'event', opts.category, opts.action, opts.label);
				}
				sentEvent = true;
				// ...but we can assume it sent and return
				return onSend(opts);
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

	}
};