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
	}
};