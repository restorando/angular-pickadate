/* jshint expr: true */

describe('pickadate', function () {
  'use strict';

  var element,
      $scope,
      $compile,
      pickadateI18nProvider,
      defaultHtml = '<div pickadate ng-model="date" min-date="minDate" max-date="maxDate"' +
                      'disabled-dates="disabledDates" week-starts-on="weekStartsOn" default-date="defaultDate">' +
                    '</div>';

  beforeEach(module('pickadate'));

  beforeEach(module(function(_pickadateI18nProvider_) {
    pickadateI18nProvider = _pickadateI18nProvider_;
  }));

  beforeEach(function() {
    inject(function($rootScope, _$compile_){
      $scope = $rootScope.$new();
      $compile = _$compile_;
    });
  });

  function compile(html) {
    element = angular.element(html || defaultHtml);
    $compile(element)($scope);
    $scope.$digest();
  }

  function $(selector) {
    return jQuery(selector, element);
  }

  describe('Model binding', function() {

    beforeEach(function() {
      $scope.date = '2014-05-17';
      $scope.disabledDates = ['2014-05-26'];
      compile();
    });

    it("updates the ngModel value when a date is clicked", function() {
      expect($scope.date).to.equal('2014-05-17');
      browserTrigger($('.pickadate-enabled:contains(27)'), 'click');
      expect($scope.date).to.equal('2014-05-27');
    });

    it("doesn't allow an unavailable date to be clicked", function() {
      expect($scope.date).to.equal('2014-05-17');
      browserTrigger($('.pickadate-enabled:contains(26)'), 'click');
      expect($scope.date).to.equal('2014-05-17');
    });

    it("sets the ngModel as undefined if the model date is in the disabled list", function() {
      $scope.date = '2014-05-26';
      $scope.$digest();
      expect($scope.date).to.be.undefined;
    });

  });

  describe('Rendering', function() {

    beforeEach(function() {
      $scope.date = '2014-05-17';
      $scope.disabledDates = ['2014-05-26'];
      compile();
    });

    describe('Selected date', function() {

      it("adds the 'pickadate-active' class for the selected date", function() {
        expect($('.pickadate-active')).to.have.text('17');
        expect($('.pickadate-active').length).to.equal(1);

        browserTrigger($('.pickadate-enabled:contains(27)'), 'click');

        expect($('.pickadate-active')).to.have.text('27');
        expect($('.pickadate-active').length).to.equal(1);
      });

      it("doesn't have an element with the 'pickadate-active' class for the next month", function() {
        browserTrigger($('.pickadate-next'), 'click');
        expect($('.pickadate-active').length).to.be.empty;
      });

      it("doesn't change the active element when a disabled date is clicked", function() {
        browserTrigger($('.pickadate-enabled:contains(26)'), 'click');
        expect($('.pickadate-active')).to.have.text('17');
        expect($('.pickadate-active').length).to.equal(1);
      });

    });

    describe('Disabled dates', function() {

      beforeEach(function() {
        $scope.disabledDates = ['2014-05-20', '2014-05-26'];
        compile();
      });

      it("adds the 'pickadate-unavailable' class to the disabled dates", function() {
        expect($('li:contains(20)')).to.have.class('pickadate-unavailable');
        expect($('li:contains(26)')).to.have.class('pickadate-unavailable');
      });

      it("doesn't change the selected date if an unavailable one is clicked", function() {
        browserTrigger($('.pickadate-unavailable:contains(20)'), 'click');
        expect($scope.date).to.equal('2014-05-17');
      });

    });

    describe('Watchers', function() {

      describe('Min && max date', function() {

        beforeEach(function() {
          $scope.minDate = '2014-04-20';
          $scope.maxDate = '2014-06-20';
          $scope.date    = '2014-05-17';
          compile();
        });

        it("re-renders the calendar if min-date is updated", function() {
          expect($('li:contains(14)')).not.to.have.class('pickadate-disabled');

          $scope.minDate = '2014-05-15';
          $scope.$digest();

          expect($('li:contains(14)')).to.have.class('pickadate-disabled');
          expect($('li:contains(15)')).not.to.have.class('pickadate-disabled');
        });

        it("re-renders the calendar if max-date is updated", function() {
          expect($('li:contains(23)')).not.to.have.class('pickadate-disabled');

          $scope.maxDate = '2014-05-22';
          $scope.$digest();

          expect($('li:contains(22)')).not.to.have.class('pickadate-disabled');
          expect($('li:contains(23)')).to.have.class('pickadate-disabled');
        });

        it("unselects the current date if it's not in the min-date - max-date range", function() {
          $scope.minDate = '2014-05-19';
          $scope.$digest();

          expect($scope.date).to.be.undefined;
        });

      });

      describe('Disabled dates', function() {

        it("re-renders the calendar if disabled-dates is updated", function() {
          compile();
          expect($('li:contains(26)')).to.have.class('pickadate-unavailable');

          $scope.disabledDates.pop();
          $scope.$digest();

          expect($('li:contains(26)')).not.to.have.class('pickadate-unavailable');
        });

      });

    });

  });

  describe('Month Navigation', function() {

    beforeEach(function() {
      $scope.date = '2014-05-17';
    });

    it("renders the current month", function(){
      compile();
      expect($('.pickadate-centered-heading')).to.have.text('May 2014');
    });

    it("changes to the previous month", function() {
      compile();

      browserTrigger($('.pickadate-prev'), 'click');
      expect($('.pickadate-centered-heading')).to.have.text('April 2014');

      browserTrigger($('.pickadate-prev'), 'click');
      expect($('.pickadate-centered-heading')).to.have.text('March 2014');
    });

    it("changes to the next month", function() {
      compile();

      browserTrigger($('.pickadate-next'), 'click');
      expect($('.pickadate-centered-heading')).to.have.text('June 2014');

      browserTrigger($('.pickadate-next'), 'click');
      expect($('.pickadate-centered-heading')).to.have.text('July 2014');
    });

    describe('Disabled months', function() {

      it("doesn't render the prev button if prev month < minDate", function() {
        $scope.minDate = '2014-04-04';
        compile();

        expect($('.pickadate-prev')).not.to.have.class('ng-hide');

        browserTrigger($('.pickadate-prev'), 'click');
        expect($('.pickadate-centered-heading')).to.have.text('April 2014');

        expect($('.pickadate-prev')).to.have.class('ng-hide');
      });

      it("doesn't render the next button if next month > maxDate", function() {
        $scope.maxDate = '2014-06-04';
        compile();

        expect($('.pickadate-next')).not.to.have.class('ng-hide');

        browserTrigger($('.pickadate-next'), 'click');
        expect($('.pickadate-centered-heading')).to.have.text('June 2014');

        expect($('.pickadate-next')).to.have.class('ng-hide');
      });

      it("renders the next button if maxDate is set to the beginning of a month", function() {
        $scope.date    = '2014-08-31';
        $scope.maxDate = '2014-09-01';
        compile();

        expect($('.pickadate-next')).not.to.have.class('ng-hide');
      });

    });
  });

  describe('Configure the first day of the week', function() {
    var defaultDay;

    var firstCalendarDay = function(weekStartsOn) {
      $scope.weekStartsOn = weekStartsOn;
      compile();
      return $('ul:last-child li:first-child').text();
    };

    beforeEach(function() {
      defaultDay = firstCalendarDay(0);
    });

    it('changes the first day of the week', function() {
      for (var weekStartsOn = 1; weekStartsOn < 7; weekStartsOn++) {
        expect(firstCalendarDay(weekStartsOn)).to.not.equal(defaultDay);
      }
    });

    it('sets weekStartsOn to 0 if it is invalid', function() {
      angular.forEach([7, -1, 'foo'], function(weekStartsOn) {
        expect(firstCalendarDay(weekStartsOn)).to.equal(defaultDay);
      });
    });

  });

  describe('Default date', function() {
    beforeEach(function() {
      this.clock = sinon.useFakeTimers(1431025777408);
    });

    afterEach(function() {
      this.clock.restore();
    });

    it("renders the specified yearMonth by default if no date is selected", function() {
      $scope.defaultDate = '2014-11-10';
      compile();

      expect($('.pickadate-centered-heading')).to.have.text('November 2014');
    });

    it("renders the specified yearMonth by default even if a date is selected", function() {
      $scope.defaultDate = '2014-11-10';
      $scope.date        = '2014-03-01';
      compile();

      expect($('.pickadate-centered-heading')).to.have.text('November 2014');
    });

    it("renders the current month if no date is selected and no default date is specified ", function() {
      compile();

      expect($('.pickadate-centered-heading')).to.have.text('May 2015');
    });

    it("renders the selected date month if no default date is specified", function() {
      $scope.date = '2014-08-03';
      compile();

      expect($('.pickadate-centered-heading')).to.have.text('August 2014');
    });

  });

  describe('Translations', function() {

    it('uses the default translations if not translations are specified', function() {
      compile();
      expect($('.pickadate-prev')).to.have.text('prev');
      expect($('.pickadate-next')).to.have.text('next');
    });

    it('uses the translations previously set in the pickadateI18nProvider', function() {
      pickadateI18nProvider.translations = {
        prev: 'ant',
        next: 'sig'
      };
      compile();
      expect($('.pickadate-prev')).to.have.text('ant');
      expect($('.pickadate-next')).to.have.text('sig');
    });

    it('accepts valid html translations', function() {
      pickadateI18nProvider.translations = {
        prev: '<i class="icon-chevron-left"></i> ant',
        next: 'sig <i class="icon-chevron-right"></i>'
      };
      compile();
      expect($('.pickadate-prev')).to.have.html('<i class="icon-chevron-left"></i> ant');
      expect($('.pickadate-next')).to.have.html('sig <i class="icon-chevron-right"></i>');
    });

  });

  describe('Using only required scope properties', function() {

    it("doesn't throw an error if only the required scope properties are being binded", function() {
      expect(function(){
        compile('<div pickadate ng-model="date"></div>');
      }).not.to.throw();

    });

  });

  describe('Multiple dates', function() {

    beforeEach(function() {
      this.clock = sinon.useFakeTimers(1431025777408);
      compile('<div pickadate ng-model="date" multiple disabled-dates="disabledDates"></div>');
    });

    afterEach(function() {
      this.clock.restore();
    });

    it('sets the current ngModel to an empty array if its undefined', function() {
      expect($scope.date).to.be.empty;
    });

    it('adds the selected date to the ngModel array', function() {
      browserTrigger($('.pickadate-enabled:contains(20)'), 'click');
      browserTrigger($('.pickadate-enabled:contains(22)'), 'click');
      expect($scope.date).to.deep.equal(['2015-05-20', '2015-05-22']);
    });

    it('removes the selected date of the ngModel array if it was previously selected', function() {
      browserTrigger($('.pickadate-enabled:contains(7)'), 'click');
      expect($scope.date).to.deep.equal(['2015-05-07']);

      browserTrigger($('.pickadate-enabled:contains(7)'), 'click');
      expect($scope.date).to.be.empty;
    });

    describe('Rendering', function() {

      it('renders the multiple dates', function() {
        $scope.date = ['2015-05-07', '2015-05-10', '2015-05-13'];
        $scope.$digest();

        expect($('.pickadate-active').get()).to.have.length(3);
        expect($('.pickadate-active:eq(0)')).to.have.text('7');
        expect($('.pickadate-active:eq(1)')).to.have.text('10');
        expect($('.pickadate-active:eq(2)')).to.have.text('13');
      });

    });

    describe('Disabled dates', function() {

      it("removes the disabled dates from the initial date array", function() {
        $scope.date = ['2015-05-07', '2015-05-10', '2015-05-13'];
        $scope.disabledDates = ['2015-05-10'];
        $scope.$digest();

        expect($('.pickadate-active').get()).to.have.length(2);
        expect($('.pickadate-active:eq(0)')).to.have.text('7');
        expect($('.pickadate-active:eq(1)')).to.have.text('13');
      });

      it("removes the disabled date if the ngModel is updated and contains disabled dates", function() {
        $scope.disabledDates = ['2015-05-10', '2015-05-13'];
        $scope.$digest();

        $scope.date = ['2015-05-07', '2015-05-10', '2015-05-13'];
        $scope.$digest();

        expect($('.pickadate-active').get()).to.have.length(1);
        expect($('.pickadate-active:eq(0)')).to.have.text('7');
      });

    });

  });

});
