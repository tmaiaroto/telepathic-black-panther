/**
 * Figures things out.
*/
module.exports = {
	/**
	 * Returns the word count for any given page based on the paragraph elements.
	 * This cuts out a lot of noise, though not every page uses paragraph tags (silly) and 
	 * sometimes pages use paragraph tags within the footer or header or even navigation menus. 
	 * So this function also has a simple threshold for what gets counted or not based on 
	 * a minimum number of words.
	 *
	 * Note: All of the word count functions are approximations, so the use case should  
	 * be something that works well with such approximations.
	 *
	 * @param  {number} minWords Minimum number of words required to count toward overall page word count
	 * @param  {number} minChars Minimum number of characters required to count a word as a word (exclude "a", "and", "or" etc.)
	 * @return {number} 		 The word count
	*/
	paragraphPageWordCount: function(minWords, minChars) {
		minWords = (typeof(minWords) !== 'number') ? 2:minWords;
		minChars = (typeof(minChars) !== 'number') ? 3:minChars;
		var pageWordCount = 0;
		$ki('p').each(function(el) {
			var pText = el.innerText || el.textContent || "";
			var pWords = pText.split(/\s+/);
			var pWordCount = pWords.length;
			for(var w in pWords) {
				// Discount if the word is too short.
				if(pWords[w].length < minChars) {
					pWordCount -= 1;
				}
			}
			// Count if the paragraph element's contents meets the minimum number of words.
			if(pWordCount > minWords) {
				pageWordCount += pWordCount;
			}
		});
		return pageWordCount;
	},
	/**
	 * A more simple approach to counting the words on a page.
	 *
	 * @param  {array} discountedSelectors A list of selectors to discount
	 * @return {number} 				   The word count
	*/
	pageWordCount: function(discountedSelectors) {
		// discount obvious selectors (so we don't count text in the footer, nav, navbar, etc.)
		discountedSelectors = (typeof(discountedSelectors) !== 'object') ? ['.footer', '.navbar', '.nav', '.header', '.ad', '.advertisement']:discountedSelectors;
		
		var bodyInnerText = $ki('body')[0].innerText || $ki('body')[0].textContent || "";
		var bodyWordCount = bodyInnerText.split(/\s+/).length;
		for(var i in discountedSelectors) {
			s = discountedSelectors[i];
			if($ki(s)[0] !== undefined) {
				var t = ($ki(s)[0].innerText || $ki(s)[0].textContent || "");
				bodyWordCount -= t.split(/\s+/).length;
			}
		}
		return bodyWordCount;
	},
	/**
	 * Estimates reading time in minutes.
	 *
	 * @param  {number} wpm The number
	 * @param  {mixed}  w   The number of words or a string
	 * @return {number}     The estimated time, in minutes, to read
	*/
	readTime: function(w, wpm) {
		wpm = (typeof(wpm) !== 'number') ? 250:wpm;
		wpm = wpm < 1 ? 1:wpm; // no divide by zero. no, don't disassemble number 5.
		var readTime = 0;
		var wc = 0;
		if(w !== undefined) {
			switch(typeof(w)) {
				case 'string':
					wc = w.split(/\s+/).length;
				break;
				case 'number':
					wc = w;
				break;
			}
			readTime = wc / wpm;
		}
		
		return readTime;
	},
	/**
	 * Returns how far down the visitor has scrolled on the page in pixels or optionally as a percentage.
	 *
	 * @param  {boolean} percentage If true, a decmial percentage will be returned instead of a pixel value
	 * @return {number} 		    Pixels or percentage
	*/
	currentScrollPosition: function(percentage) {
		var top = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
		var scrollPosition = top + window.innerHeight;
		if(percentage !== true) {
			return scrollPosition;
		}
		return (scrollPosition / this.pageHeight()).toFixed(2);
	},
	/**
	 * Gets the current page's height.
	 *
	 * @return {number} The page height in pixels
	*/
	pageHeight: function() {
		var body = document.body;
		var html = document.documentElement;
		return Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
	} 
};