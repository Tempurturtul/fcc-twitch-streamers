describe('dataservice', function() {
  beforeEach(module('app.core'));

  var dataservice;

  beforeEach(inject(function(_dataservice_) {
    dataservice = _dataservice_;
  }));

  it('should be registered', function() {
    expect(dataservice).to.not.equal(undefined);
  });

  describe('getStreamers function', function () {
    it('should exist', function () {
      expect(dataservice.getStreamers).to.not.equal(undefined);
    });
  });
});
