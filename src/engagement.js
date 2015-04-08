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