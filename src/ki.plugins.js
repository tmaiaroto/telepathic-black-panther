module.exports = {
	first: function() {
		return $ki(this[0]);
	},
	last: function() {
		return $ki(this[this.length - 1]);
	},
	outerHeight: function() {
		this.each(function(b) {
			b.outerHeight = b.offsetHeight;
			var style = getComputedStyle(b);
			b.outerHeight += parseInt(style.marginTop) + parseInt(style.marginBottom);
		});
		return this.length > 1 ? this : this[0].outerHeight;
	},
	outerWidth: function() {
		this.each(function(b) {
			b.outerWidth = b.offsetWidth;
			var style = getComputedStyle(b);
			b.outerWidth += parseInt(style.marginLeft) + parseInt(style.marginRight);
		});
		return this.length > 1 ? this : this[0].outerWidth;
	},
	html: function(a) {
		return a === []._ ? this[0].innerHTML : this.each(function(b) {
			b.innerHTML = a;
		});
	},
	offset: function() {
		this.each(function(b) {
			var rect = b.getBoundingClientRect();
			b.offset = {
			  top: rect.top + document.body.scrollTop,
			  left: rect.left + document.body.scrollLeft
			};
		});
		return this.length > 1 ? this : this[0].offset;
	},
	hasClass: function(a) {
		return this[0].classList.contains(a);
	},
	/**
	 * Determines if an element falls within the browser's viewport.
	 * 
	 * @param  {number}  x How much of the element must be visible along the x axis as a percentage (0, 0.5, 1, etc.)
	 * @param  {number}  y How much of the element must be visible along the y axis as a percentage (0, 0.5, 1, etc.)
	 * @return {boolean}   Whether or not enough of the element is visible on the screen to count
	*/
	isOnScreen: function(x, y) {
		if(x === null || typeof x === 'undefined') { x = 1; }
	    if(y === null || typeof y === 'undefined') { y = 1; }
	    
	    var viewport = {};
	    viewport.left = (window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft;
		viewport.top = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;

	    viewport.right = viewport.left + window.innerWidth;
	    viewport.bottom = viewport.top + window.innerHeight;
	    
	    var height = this.outerHeight();
	    var width = this.outerWidth();
	 
	    if(!width || !height){
	        return false;
	    }
	    
	    var bounds = this.offset();
	    bounds.right = bounds.left + width;
	    bounds.bottom = bounds.top + height;
	    
	    var visible = (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
	    
	    if(!visible){
	        return false;   
	    }
	    
	    var deltas = {
	        top : Math.min( 1, ( bounds.bottom - viewport.top ) / height),
	        bottom : Math.min(1, ( viewport.bottom - bounds.top ) / height),
	        left : Math.min(1, ( bounds.right - viewport.left ) / width),
	        right : Math.min(1, ( viewport.right - bounds.left ) / width)
	    };
	    
	    return (deltas.left * deltas.right) >= x && (deltas.top * deltas.bottom) >= y;
	}
};