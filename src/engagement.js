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