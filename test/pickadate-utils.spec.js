/* jshint expr: true */

describe('pickadateUtils', function () {
  'use strict';
  var utils = null;

  beforeEach(module("pickadate"));

  beforeEach(inject(function (_pickadateUtils_) {
    utils = _pickadateUtils_;
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
            date = utils.parseDate(dateString, format[1]);

        expect(date.getDate()).to.equal(4);
        expect(date.getMonth()).to.equal(1);
        expect(date.getFullYear()).to.equal(2014);
        expect(date.getHours()).to.equal(3);
      });

    });

    it("returns undefined if a falsey object is passed", function() {
      expect(utils.parseDate(null)).to.be.undefined;
      expect(utils.parseDate(undefined)).to.be.undefined;
    });

    it("returns undefined if an invalid date is passed", function() {
      expect(utils.parseDate('2014-02-')).to.be.undefined;
    });

    it("returns a new date if a date object is passed", function() {
      var date = new Date();

      expect(utils.parseDate(date).getTime()).to.equal(date.getTime());
    });

  });

  describe('buildDayNames', function() {

    it('builds the days', function() {
      var expectedResult = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      expect(utils.buildDayNames()).to.deep.equal(expectedResult);
    });

    it('rotates the days', function() {
      var expectedResult = ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'];
      expect(utils.buildDayNames(3)).to.deep.equal(expectedResult);

      expectedResult = ['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
      expect(utils.buildDayNames(5)).to.deep.equal(expectedResult);
    });

  });

  describe('buildDates', function() {
    var date,
        weekStartsOn,
        d = function(date) {
          return utils.parseDate(date);
        };

    beforeEach(function() {
      date = d('2015-01-01');
      weekStartsOn = 0;
    });

    it('returns the correct dates', function() {
      var dates = utils.buildDates(date, { weekStartsOn: weekStartsOn });

      expect(dates[0]).to.deep.equal(d('2014-12-28'));
      expect(dates[3]).to.deep.equal(d('2014-12-31'));
      expect(dates[4]).to.deep.equal(d('2015-01-01'));
      expect(dates[34]).to.deep.equal(d('2015-01-31'));
      expect(dates[35]).to.deep.equal(d('2015-02-01'));
      expect(dates.slice(-1)[0]).to.deep.equal(d('2015-02-07'));
    });

    it('has 6 rows of dates by default', function() {
      expect(utils.buildDates(date, { weekStartsOn: weekStartsOn })).to.have.length(6 * 7);
    });

    it('should not add empty rows when told not to', function() {
      expect(utils.buildDates(date, { weekStartsOn: weekStartsOn, noExtraRows: true })).to.have.length(5 * 7);
    });

    it('adds 2 extra rows when required', function() {
      var date = d('2015-02-01');

      expect(utils.buildDates(date, { weekStartsOn: weekStartsOn, noExtraRows: false })).to.have.length(6 * 7);
      expect(utils.buildDates(date, { weekStartsOn: weekStartsOn, noExtraRows: true })).to.have.length(4 * 7);
      expect(utils.buildDates(date, { weekStartsOn: 1, noExtraRows: true })).to.have.length(5 * 7);
    });

    it('works when the week starts on monday', function() {
      var dates = utils.buildDates(date, { weekStartsOn: 1 });

      expect(dates[0]).to.deep.equal(d('2014-12-29'));
      expect(dates[3]).to.deep.equal(d('2015-01-01'));
      expect(dates[33]).to.deep.equal(d('2015-01-31'));
      expect(dates.slice(-1)[0]).to.deep.equal(d('2015-02-08'));
    });

    it('works when the week starts on saturday', function() {
      var dates = utils.buildDates(date, { weekStartsOn: 6 });

      expect(dates[0]).to.deep.equal(d('2014-12-27'));
      expect(dates[5]).to.deep.equal(d('2015-01-01'));
      expect(dates[35]).to.deep.equal(d('2015-01-31'));
      expect(dates.slice(-1)[0]).to.deep.equal(d('2015-02-06'));
    });

  });

});
