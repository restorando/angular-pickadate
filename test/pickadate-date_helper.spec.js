/* jshint expr: true */

describe('pickadate.dateHelper', function () {
  'use strict';
  var dateHelper = null,
      format = 'yyyy-MM-dd';

  beforeEach(module("pickadate"));

  beforeEach(inject(function (_pickadateDateHelper_) {
    dateHelper = _pickadateDateHelper_;
  }));


  describe('parseDate', function() {

    [
      ['2014-02-04', null],
      ['2014-02-04', 'yyyy-MM-dd'],
      ['2014-04-02', 'yyyy-dd-MM'],
      ['2014/02/04', 'yyyy/MM/dd'],
      ['2014/04/02', 'yyyy/dd/MM'],
      ['04/02/2014', 'dd/MM/yyyy'],
      ['04-02-2014', 'dd-MM-yyyy']
    ].forEach(function(format) {

      it("parses the string in " + format[1] + " format and return a date object", function() {
        var dateString = format[0],
            date = dateHelper(format[1]).parseDate(dateString);

        expect(date.getDate()).to.equal(4);
        expect(date.getMonth()).to.equal(1);
        expect(date.getFullYear()).to.equal(2014);
        expect(date.getHours()).to.equal(3);
      });

    });

    it("returns undefined if a falsey object is passed", function() {
      expect(dateHelper().parseDate(null)).to.be.undefined;
      expect(dateHelper().parseDate(undefined)).to.be.undefined;
    });

    it("returns undefined if an invalid date is passed", function() {
      expect(dateHelper().parseDate('2014-02-')).to.be.undefined;
    });

    it("returns a new date if a date object is passed", function() {
      var date = new Date();

      expect(dateHelper().parseDate(date).getTime()).to.equal(date.getTime());
    });

  });

  describe('buildDayNames', function() {

    it('builds the days', function() {
      var expectedResult = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      expect(dateHelper().buildDayNames()).to.deep.equal(expectedResult);
    });

    it('rotates the days', function() {
      var expectedResult = ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'];
      expect(dateHelper(format, { weekStartsOn: 3 }).buildDayNames()).to.deep.equal(expectedResult);

      expectedResult = ['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
      expect(dateHelper(format, { weekStartsOn: 5 }).buildDayNames()).to.deep.equal(expectedResult);
    });

  });

  describe('buildDates', function() {

    function d(date) { return dateHelper().parseDate(date); }

    it('returns the correct dates', function() {
      var dates = dateHelper().buildDates(2015, 0, { weekStartsOn: 0 });

      expect(dates[0].date).to.deep.equal(d('2014-12-28'));
      expect(dates[3].date).to.deep.equal(d('2014-12-31'));
      expect(dates[4].date).to.deep.equal(d('2015-01-01'));
      expect(dates[34].date).to.deep.equal(d('2015-01-31'));
      expect(dates[35].date).to.deep.equal(d('2015-02-01'));
      expect(dates.slice(-1)[0].date).to.deep.equal(d('2015-02-07'));
    });

    it('has 6 rows of dates by default', function() {
      expect(dateHelper(format, { weekStartsOn: 0 }).buildDates(2015, 0)).to.have.length(6 * 7);
    });

    it('should not add empty rows when told not to', function() {
      expect(dateHelper(format, { weekStartsOn: 0, noExtraRows: true }).buildDates(2015, 0)).to.have.length(5 * 7);
    });

    it('adds 2 extra rows when required', function() {
      expect(dateHelper(format, { noExtraRows: false }).buildDates(2015, 1)).to.have.length(6 * 7);
      expect(dateHelper(format, { noExtraRows: true }).buildDates(2015, 1)).to.have.length(4 * 7);
      expect(dateHelper(format, { weekStartsOn: 1, noExtraRows: true }).buildDates(2015, 1)).to.have.length(5 * 7);
    });

    it('works when the week starts on monday', function() {
      var dates = dateHelper(format, { weekStartsOn: 1 }).buildDates(2015, 0);

      expect(dates[0].date).to.deep.equal(d('2014-12-29'));
      expect(dates[3].date).to.deep.equal(d('2015-01-01'));
      expect(dates[33].date).to.deep.equal(d('2015-01-31'));
      expect(dates.slice(-1)[0].date).to.deep.equal(d('2015-02-08'));
    });

    it('works when the week starts on saturday', function() {
      var dates = dateHelper(format, { weekStartsOn: 6 }).buildDates(2015, 0);

      expect(dates[0].date).to.deep.equal(d('2014-12-27'));
      expect(dates[5].date).to.deep.equal(d('2015-01-01'));
      expect(dates[35].date).to.deep.equal(d('2015-01-31'));
      expect(dates.slice(-1)[0].date).to.deep.equal(d('2015-02-06'));
    });

  });

});
