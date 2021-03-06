/**
 * auto_detect.js is responsible for automatically detecting the proper events to track for any given page.
 * It calls functions within Tbp as necessary by analyzing what's on the page.
 *
 * NOTE: The types of events to be automatically detected and logged can be configured via the global options
 * under the `autoDetect` key value which would be an array of strings. These would be "linkOut" and "read"
 * and "scrolledPage" and so on.
 *
*/
module.exports = {
	autoDetectEvents: function() {
		var tbpContext = this;
		var methods = (typeof(this.config.autoDetect) === 'object') ? this.config.autoDetect:'all';

		tbpContext.log("Tbp.autoDetectEvents() Analyzing the page to watch for the following methods:", methods);

		// Detect outbound link clicks.
		if(methods.indexOf('linkOut') >= 0 || methods === 'all') {
			tbpContext.$('a').on('click', function(e) {
				// TODO: Detect social share URLs and discount those when tracking outbound links. Those will get tracked under social.js as shares using a different GA method.

				if((this.href).substr(0, 4).toLowerCase() === 'http') {
					tbpContext.linkOut({
						"url": this.href,
						"element": this,
						"elementEvent": e,
						"trackDomainOnly": true
					});
				} else {
					return;
				}
			});
		}

		// Detect full page read.
		if(methods.indexOf('read') >= 0 || methods === 'all') {
			var count = tbpContext.analysis.paragraphPageWordCount();
			tbpContext.read({
				minTime: (tbpContext.analysis.readTime(count) * 60)
			});
		}

		// Detect page scroll percentage.
		if(methods.indexOf('scrolledPage') >= 0 || methods === 'all') {
			tbpContext.scrolledPage();
		}

		// Detect if mouse cursor leaves the page (toward the top)
		if(methods.indexOf('leave') >= 0 || methods === 'all') {
			tbpContext.leave();
		}

		// Detect history navigation state change (backward/forward buttons in browser)
		if(methods.indexOf('historyNavigate') >= 0 || methods === 'all') {
			tbpContext.historyNavigate();
		}

		// Detect hashbang change, many long pages have section navgiation for example. Or, single page JavaScript apps will use these.
		if(methods.indexOf('hashChange') >= 0 || methods === 'all') {
			tbpContext.hashChange();
		}

		// Detect set periods of inactivity (1 min, 3 min, and 5 min by default). 
		if(methods.indexOf('inactivity') >= 0 || methods === 'all') {
			tbpContext.inactivity();
		}
		
		// Detect time to engage the form(s) on the page.
		if(methods.indexOf('timeToEngage') >= 0 || methods === 'all') {
			tbpContext.$('form').each(function(el) {
				tbpContext.timeToEngage({element: el});
			});
		}
		
		// Detect form abandonment.
		if(methods.indexOf('formAbandonment') >= 0 || methods === 'all') {
			// tbpContext.formAbandonment();
		}
	}
};