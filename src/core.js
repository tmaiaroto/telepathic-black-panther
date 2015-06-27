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