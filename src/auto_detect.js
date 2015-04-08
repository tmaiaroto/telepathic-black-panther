/**
 * auto_detect.js is responsible for automatically detecting the proper events to track for any given page.
 * It calls functions within Tbp as necessary by analyzing what's on the page.
 * 
*/
module.exports = {
	autoDetectEvents: function() {
		if(this.opts.debug === true) {
			console.dir('Tbp.autoDetectEvents() Analyzing the page to watch for events');
		}
		var tbpContext = this;

		// Detect outbound link clicks.
		$ki('a').on('click', function(e) {
			// TODO: Detect social share URLs and discount those when tracking outbound links. Those will get tracked under social.js as shares using a different GA method.
			
			// If the link is not opening in another window or frame, etc. then stop propagation. 
			// Otherwise, there might not be enough time to record the event.
			if(this.target !== '_blank') {
				e.preventDefault();
				e.stopPropagation();
			}

			if((this.href).substr(0, 4).toLowerCase() == 'http') {
				tbpContext.linkOut({
					"url": this.href,
					"trackDomainOnly": true,
					// Return the URL, stopping the redirect in the linkOut() function if opening in a new window.
					// Otherwise if the link is opening in a new window, there's no reason to redirect and the event will 
					// be recorded because there's plenty of time on the page still.
					"returnUrl": (this.target === '_blank')
				});
			}
		});

		// Detect full page read.
		var count = tbpContext.paragraphPageWordCount();
		//console.dir(count);
		
		//console.dir(bodyInnerText);
		//console.dir(bodyWordCount);

		// now look again at all text div by div on the page. 
		// discount anything with small amounts of text
		


		tbpContext.read();
	}
};