/* jshint expr: true */

describe('pickadate', function () {
  'use strict';

  var element,
      $scope,
      $compile,
      html = '<div pickadate ng-model="date" min-date="minDate" max-date="maxDate"' +
             'disabled-dates="disabledDates" week-starts-on="weekStartsOn">' +
             '</div>';

  beforeEach(module("pickadate"));

  beforeEach(function() {
    inject(function($rootScope, _$compile_){
      $scope = $rootScope.$new();
      $compile = _$compile_;
    });
  });

  function compile(elem) {
    element = angular.element(elem);
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
      compile(html);
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
      compile(html);
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
        compile(html);
      });

      it("adds the 'pickadate-unavailable' class to the disabled dates", function() {
        expect($('li:contains(20)')).to.have.class('pickadate-unavailable');
        expect($('li:contains(26)')).to.have.class('pickadate-unavailable');
      });

    });

  });

  describe('Month Navigation', function() {

    beforeEach(function() {
      $scope.date = '2014-05-17';
    });

    it("renders the current month", function(){
      compile(html);
      expect($('.pickadate-centered-heading')).to.have.text('May 2014');
    });

    it("changes to the previous month", function() {
      compile(html);

      browserTrigger($('.pickadate-prev'), 'click');
      expect($('.pickadate-centered-heading')).to.have.text('April 2014');

      browserTrigger($('.pickadate-prev'), 'click');
      expect($('.pickadate-centered-heading')).to.have.text('March 2014');
    });

    it("changes to the next month", function() {
      compile(html);

      browserTrigger($('.pickadate-next'), 'click');
      expect($('.pickadate-centered-heading')).to.have.text('June 2014');

      browserTrigger($('.pickadate-next'), 'click');
      expect($('.pickadate-centered-heading')).to.have.text('July 2014');
    });

    describe('Disabled months', function() {

      it("doesn't render the prev button if prev month < minDate", function() {
        $scope.minDate = '2014-04-04';
        compile(html);

        expect($('.pickadate-prev')).not.to.have.class('ng-hide');

        browserTrigger($('.pickadate-prev'), 'click');
        expect($('.pickadate-centered-heading')).to.have.text('April 2014');

        expect($('.pickadate-prev')).to.have.class('ng-hide');
      });

      it("doesn't render the next button if next month > maxDate", function() {
        $scope.maxDate = '2014-06-04';
        compile(html);

        expect($('.pickadate-next')).not.to.have.class('ng-hide');

        browserTrigger($('.pickadate-next'), 'click');
        expect($('.pickadate-centered-heading')).to.have.text('June 2014');

        expect($('.pickadate-next')).to.have.class('ng-hide');
      });

      it("renders the next button if maxDate is set to the beginning of a month", function() {
        $scope.date    = '2014-08-31';
        $scope.maxDate = '2014-09-01';
        compile(html);

        expect($('.pickadate-next')).not.to.have.class('ng-hide');
      });

    });
  });

  describe('Configure the first day of the week', function() {
    var defaultDay;

    var firstCalendarDay = function(weekStartsOn) {
      $scope.weekStartsOn = weekStartsOn;
      compile(html);
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

  describe('Multiple calendars', function() {
    var htmlMulti = '<div pickadate ng-model="firstDate"></div>' +
           '<div pickadate ng-model="secondDate" min-date="firstDate"></div>';

    it('observes min-date and update model if value is greater', function() {
      $scope.firstDate = '2014-01-01';
      $scope.secondDate = '2014-01-03';

      compile(htmlMulti);

      $scope.firstDate = '2014-01-10';

      $scope.$digest();

      expect($scope.firstDate).to.equal('2014-01-10');
      expect($scope.secondDate).to.equal('2014-01-10');
    });
  });

});
