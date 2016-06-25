/**
 * Tests for main.js and core.js
 * 
*/
Tbp = require('../src/main.js');
var panther = new Tbp({autoDetect: false});

describe('config', function() {
	it('should have configuration overridden by passed options', function() {
		expect(panther.config.autoDetect).toMatch(false);
	});

	it('should have a `dataLayer` array', function() {
		expect(panther.config.dataLayer).toMatch([]);
	});
});

describe('gaProxy()', function() {
    it('should be function', function() {
        expect(typeof(panther.ga)).toMatch('function');
    });
});

describe('loadTime', function() {
    it('should be greater than zero', function() {
        expect(panther.loadTime).toBeGreaterThan(0);
    });
});

describe('timeSinceLoad()', function() {
    it('should return greater than zero', function() {
        expect(panther.timeSinceLoad()).toBeGreaterThan(0);
    });
});

describe('hashCode()', function() {
	it('should be function', function() {
        expect(typeof(panther.hashCode)).toMatch('function');
    });

	it('should return number', function() {
		expect(panther.hashCode("foo")).toMatch(101574);
	});

	it('should return string', function() {
		expect(panther.hashCode("foo", true)).toMatch("101574");
	});
});

describe('getTargetName()', function() {
	it('should return the element tag name with the id value', function() {
		var elem = document.createElement('div');
		elem.setAttribute("id", "MyDiv");
		expect(panther.getTargetName(elem)).toMatch('DIV#MyDiv');
	});

	it('should return a custom name if a `panther-target` attribute was set on the element', function() {
		var elem = document.createElement('div');
		elem.setAttribute("panther-target", "Custom Name");
		expect(panther.getTargetName(elem)).toMatch('Custom Name');
	});

	it('should return an element tag name with its class names if there was no id or `panther-target` attribute', function() {
		var elem = document.createElement('div');
		elem.setAttribute("class", "one two");
		expect(panther.getTargetName(elem)).toMatch('DIV.one two');
	});
});

// describe('triggerEvent', function() {
// 	var elem = document.createElement('a');
// 	elem.setAttribute("rel", "test");
// 	panther.addEvent(elem, 'click', function(){ elem.setAttribute("rel", "change"); });
// 	panther.triggerEvent(elem, 'click');
// 	it('should trigger an event on an element', function() {
// 		expect(elem.getAttribute("rel")).toMatch('change');
// 	});
// });




