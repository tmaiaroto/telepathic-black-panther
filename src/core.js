module.exports = {
	/**
	 * In milliseconds, when this script has loaded. Not quite on DOM ready, but close.
	 * Useful in mitigating false engagements, etc.
	 * 
	 * @type {Date}
	*/
	loadTime: (new Date()).getTime(),
	/**
	 * Returns how long it's been since this script was loaded.
	 * 
	 * @return {number} Time elapsed in milliseconds
	*/
	timeSinceLoad: function() {
		return ((new Date()).getTime() - this.loadTime);
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
	 * Returns a string value for use as an "target" in an "action:target" value.
	 * We can't always assume elements on the page have an ID, so we need to use
	 * a value that gives as much detail to the reporter as possible for helping them
	 * identify the element on the page involved in the event.
	 *
	 * This isn't necessary if a specific action value is passed in the options 
	 * to any event, but for automation purposes this will be used.
	 * 
	 * @return {string} The target value to be combined, for example; "action:" + target
	 */
	getTargetName: function(element) {
		var tgtStr = "";
		if(element) {
			// $ki() can return an array. If there's only one item in it. Try that.
			if(element.tagName === undefined && element.length == 1) {
				element = element[0];
			}
			if(element.tagName !== undefined) {
				// The element can have a ```panther-target``` attribute for this case. Prefer that if set.
				// This, of course, is not automatic and requires some manual HTML adjustment. 
				if(element.getAttribute("panther-target")) {
					tgtStr = element.getAttribute("panther-target");
				} else {
					// If not, we'll use the best guess we have. Note that this may not be as user friendly 
					// depending on how many similar elements are on the page. If we're talking about a "div" 
					// for example...Good luck...
					
					// First, always begin with the tag name.
					tgtStr = element.tagName;

					// Then the ID if set and we're done since there's only one ID per page. Simple.
					if(element.id !== "") {
						tgtStr += "#" + element.id;
					} else {
						// Try the classList. Of course it's very possible for many elements to use the same class(es).
						if(element.className) {
							tgtStr += "." + element.className;
						} else {
							// No classes? Position on page? -- this could vary greatly and is up to the client device...so no.
							// var offset = $ki(element).offset();
							// tgtStr += "(x=" + offset.left + ",y=" + offset.top + ")";
						}
					}
				}
			}
		}
		return tgtStr;
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
	},
	/**
	 * 
	 * @param target can be any DOM Element or other EventTarget
	 * @param type Event type (i.e. 'click')
	 * @param doc Placeholder for document
	 * @param event Placeholder for creating an Event
	*/
	triggerEvent: function(target, type, doc, event) {
		doc = document;
		if(doc.createEvent) {
			event = new Event(type);
			event.preventLoop = true;
			target.dispatchEvent(event);
		} else {
			event = doc.createEventObject();
			event.preventLoop = true;
			target.fireEvent('on' + type, event);
		}
	},
	addEvent: function(element,type,callback){
		try {
			element.addEventListener(type,callback,!1);
		} catch(d) {
			element.attachEvent('on'+type,callback);
		}
	}
};