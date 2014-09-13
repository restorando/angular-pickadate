describe('pickadateUtils', function () {
  'use strict';
  var utils = null;

  beforeEach(module("pickadate"));

  beforeEach(inject(function (_pickadateUtils_) {
    utils = _pickadateUtils_;
  }));


  describe('stringToDate', function() {

    it("parses the string and return a date object", function() {
      var dateString = "2014-02-04",
          date = utils.stringToDate(dateString);

      expect(date.getDate()).to.equal(4);
      expect(date.getMonth()).to.equal(1);
      expect(date.getFullYear()).to.equal(2014);
      expect(date.getHours()).to.equal(3);
    });

    it("returns a new date if a date object is passed", function() {
      var date = new Date();

      expect(utils.stringToDate(date).getTime()).to.equal(date.getTime());
    });

  });

  describe('dateRange', function() {
    var date = new Date(1391493600000);

    it("returns an array of date strings given start, end and initial params", function() {
      expect(utils.dateRange(0, 5, date)).to.deep.equal(['2014-02-04', '2014-02-05', '2014-02-06',
                                                         '2014-02-07', '2014-02-08']);

      expect(utils.dateRange(-1, 5, date)).to.deep.equal(['2014-02-03', '2014-02-04', '2014-02-05',
                                                          '2014-02-06', '2014-02-07', '2014-02-08']);
    });

    it("formats the dates using the given format", function() {
      expect(utils.dateRange(0, 2, date, 'dd/MM/yyyy')).to.deep.equal(['04/02/2014', '05/02/2014']);
    });

  });
});
