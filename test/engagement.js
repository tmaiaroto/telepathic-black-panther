Tbp = require('../src/main.js');
var panther = new Tbp();

describe('read', function () {
	it('should be function', function () {
		expect(typeof(panther.read)).toMatch('function');
	});
	
	// TODO: Add these kind of tests, but they are only going to work when using actual browsers (not PhantomJS). Much sadness.
	// it('should return true', function () {
	// 	var result = function(opts) {
	// 		expect(opts).not.toBeUndefined();
	// 	};
	// 	panther.read(result);

	// 	var webPage = require('webpage');
	// 	var page = webPage.create();

	// 	page.scrollPosition = {
	// 		top: 100,
	// 		left: 0
	// 	};
		
	// });
});