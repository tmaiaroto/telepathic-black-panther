var panther = new Tbp();

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
});