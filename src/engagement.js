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
	 * @param  {function} onSend Optional callback
	 * @return {function}
	*/
	read: function(opts, onSend) {
		opts = this.extend({
			"minTime": 10,
			"selector": "body",
			"category": "page",
			"action": "read",
			"label": "",
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
	 * @param  {object}   opts   
	 *         minTime:  The amount of time, in seconds, that must pass before the event is considered valid (estimated time to read the content?).
	 *         category: The Google Analytics category
	 *         action:   The Google Analytics action
	 *         
	 * @param  {function} onSend Optional callback
	 * @return {function}
	*/
	scrolledPage: function(opts, onSend) {
		opts = this.extend({
			"minTime": 2,
			"category": "page",
			"action": "scroll"
		}, opts);
		// If not set, take from Tbp opts.
		if(!opts.hasOwnProperty('debug')) {
			opts.debug = this.opts.debug;
		}
		onSend = (onSend === undefined) ? function(opts){}:onSend;

		var tbpContext = this;
		var sent = {
			"25": false,
			"50": false,
			"75": false,
			"100": false
		};
		var send = function(label) {
			opts.label = label;
			if(opts.debug) {
				console.log("Tbp.scrolledPage() Logging page scroll event, label: " + label);
			}
			ga('send', {
				'hitType': 'event',
				'eventCategory': opts.category,
				'eventAction': opts.action,
				'eventLabel': opts.label,
				'hitCallback': onSend(opts)
			});
		};

		// Check for this every two seconds. In fact, check the current scroll position each time rather than at any point.
		// This would negate situations where a user quickly scrolled down and back up again. While we aren't concerned with 
		// an actual "read" per se, we also want to do the best we can to avoid inaccuracies.
		// The "minTime" option also helps avoid tracking a user who comes to the page, scrolls real quick and leaves.
		// Again, not a "read" and so that "minTime" is meant to be short, but not zero. Though it could be set to zero of course.
		// One last reason here -- Google Analytics will throttle events if too many are sent too quickly.
		setTimeout(function() {
			var intervalId = setInterval(function() {
				var percent = tbpContext.analysis.currentScrollPosition(true);
				if(sent["25"] === false && percent >= 0.25) {
					send("25%");
					sent["25"] = true;
				}
				if(sent["50"] === false && percent >= 0.5) {
					send("50%");
					sent["50"] = true;
				}
				if(sent["75"] === false && percent >= 0.75) {
					send("75%");
					sent["75"] = true;
				}
				// Note: 98% will be considered close enough to 100% - there may even be times 100% isn't possible.
				if(sent["100"] === false && percent >= 0.98) {
					send("100%");
					sent["100"] = true;
					// We can also stop checking at this point. It is theoretically possible the user quickly scrolled to the bottom of the page
					// and could still hit a lower scroll percentage, but it's better to stop checking to not get in the way of anything else
					// that may be running on the page.
					clearInterval(intervalId);
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
	 *         returnUrl: 		Just return the URL and don't actually redirect
	 *         trackDomainOnly: Just send the domain name to Google Analytics as the label instead of the full URL
	 *         category: 		The Google Analytics Event category
	 *         action: 			The Google Analytics Event action
	 *         label: 			The Google Analytics Event label (optional, this will be the URL by default)
	 *         debug: 			Logs information to the console
	 *         
	 * @param  {function} onSend Optional callback
	 * @return {function}	 	If a callback was specified, otherwise it redirects the user
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