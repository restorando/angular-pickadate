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

  describe('rotateDayNames', function() {
    var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        firstDay = 3;

    it('rotates the days', function() {
      var expectedResult = ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'];
      expect(utils.rotateDayNames(dayNames, firstDay)).to.deep.equal(expectedResult);
    });

    it('is does not alter the original array', function() {
      utils.rotateDayNames(dayNames, firstDay);
      expect(dayNames).to.deep.equal(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    });

  });

  describe('visibleDates', function() {
    var date = new Date('2015-01-01'),
        firstDay = 0;

    it('returns the correct dates', function() {
      var dates = utils.visibleDates(date, firstDay);

      expect(dates[0]).to.deep.equal(new Date('2014-12-28'));
      expect(dates[3]).to.deep.equal(new Date('2014-12-31'));
      expect(dates[4]).to.deep.equal(new Date('2015-01-01'));
      expect(dates[34]).to.deep.equal(new Date('2015-01-31'));
      expect(dates[35]).to.deep.equal(new Date('2015-02-01'));
      expect(dates.slice(-1)[0]).to.deep.equal(new Date('2015-02-07'));
    });

    it('has 6 rows of dates by default', function() {
      expect(utils.visibleDates(date, firstDay).length).to.equal(6 * 7);
    });

    it('should not add empty rows when told not to', function() {
      expect(utils.visibleDates(date, firstDay, true).length).to.equal(5 * 7);
    });

    it('adds 2 extra rows when required', function() {
      var date = new Date('2015-02-01');

      expect(utils.visibleDates(date, firstDay, false).length).to.equal(6 * 7);
      expect(utils.visibleDates(date, firstDay, true ).length).to.equal(4 * 7);
      expect(utils.visibleDates(date, 1,        true ).length).to.equal(5 * 7);
    });

    it('works when the first day of the week is monday', function() {
      var dates = utils.visibleDates(date, 1);

      expect(dates[0]).to.deep.equal(new Date('2014-12-29'));
      expect(dates[3]).to.deep.equal(new Date('2015-01-01'));
      expect(dates[33]).to.deep.equal(new Date('2015-01-31'));
      expect(dates.slice(-1)[0]).to.deep.equal(new Date('2015-02-08'));
    });

    it('works when the first day of the week is saturday', function() {
      var dates = utils.visibleDates(date, 6);

      expect(dates[0]).to.deep.equal(new Date('2014-12-27'));
      expect(dates[5]).to.deep.equal(new Date('2015-01-01'));
      expect(dates[35]).to.deep.equal(new Date('2015-01-31'));
      expect(dates.slice(-1)[0]).to.deep.equal(new Date('2015-02-06'));
    });

  });

});
