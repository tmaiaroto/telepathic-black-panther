Tbp = require('../src/main.js');
var panther = new Tbp();

describe('loadTime', function () {
    it('should be greater than zero', function () {
        expect(panther.loadTime).toBeGreaterThan(0);
    });
});

describe('timeSinceLoad', function () {
    it('should return greater than zero', function () {
        expect(panther.timeSinceLoad()).toBeGreaterThan(0);
    });
});

describe('gaProxy', function () {
    it('should be function', function () {
        expect(typeof(panther.ga)).toMatch('function');
    });
});

describe('event', function () {
    it('should be function', function () {
        expect(typeof(panther.event)).toMatch('function');
    });

    it('should return false', function () {
        expect(panther.event()).toBeFalsy();
    });

    it('should return undefined', function () {
        expect(panther.event({label: "test"})).toBeUndefined();
    });
});