;(function(angular){
  var indexOf = [].indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (i in this && this[i] === item) return i;
    }
    return -1;
  };

  var Today = '2013-11-22';

  angular.module('pickadate', [])

    .factory('dateUtils', ['dateFilter', function(dateFilter) {
      return {
        isDate: function(obj) {
          return Object.prototype.toString.call(obj) === '[object Date]';
        },

        stringToDate: function(dateString) {
          if (this.isDate(dateString)) return new Date(dateString);
          var dateParts = dateString.split('-'),
            year  = dateParts[0],
            month = dateParts[1],
            day   = dateParts[2];

          // set hour to 3am to easily avoid DST change
          return new Date(year, month - 1, day, 3);
        },

        dateRange: function(first, last, initial, format) {
          var date, i, _i, dates = [];

          if (!format) format = 'yyyy-MM-dd';

          for (i = _i = first; first <= last ? _i < last : _i > last; i = first <= last ? ++_i : --_i) {
            date = this.stringToDate(initial);
            date.setDate(date.getDate() + i);
            dates.push(dateFilter(date, format));
          }
          return dates;
        }
      };
    }])

    .directive('pickadate', ['$locale', 'dateUtils', 'dateFilter', function($locale, dateUtils, dateFilter) {
      return {
        require: 'ngModel',

        template:
          '<div class="angular-pickadate">' +
            '<div class="calendar-header">' +
              '<div class="controls">' +
                '<button class="prev icons-light-arrow-prev" ng-click="changeMonth(-1)" ng-show="allowPrevMonth">prev</button>' +
                '<button class="next icons-light-arrow-next" ng-click="changeMonth(1)" ng-show="allowNextMonth">next</button>' +
              '</div>'+
              '<h3 class="centered-heading">' +
                '{{currentDate | date:"MMMM yyyy"}}' +
              '</h3>' +
            '</div>' +
            '<div class="calendar-body">' +
              '<div class="calendar">' +
                '<ul class="calendar-cell">' +
                  '<li class="head" ng-repeat="dayName in dayNames">' +
                    '{{dayName}}' +
                  '</li>' +
                '</ul>' +
                '<ul class="calendar-cell">' +
                  '<li ng-repeat="d in dates" class="{{d.className}}" ng-class="{active: date == d.date}">' +
                    '<a href="#" data-value="{{d.date}}" ng-click="setDate(d.date)" ng-if="!isDateDisabled(d)">' +
                      '{{d.date | date:"d"}}' +
                    '</a>' +
                    '<span ng-if="isDateDisabled(d)">' +
                      '{{d.date | date:"d"}}' +
                    '</span>' +
                  '</li>' +
                '</ul>' +
              '</div>' +
            '</div>' +
          '</div>',

        link: function(scope, element, attrs, ngModel)  {
          var currentDate = dateUtils.stringToDate(Today);

          scope.dayNames = $locale.DATETIME_FORMATS['SHORTDAY'];
          scope.date     = Today;
          scope.currentDate = currentDate;

          scope.render = function(initialDate) {
            var currentMonth = initialDate.getMonth() + 1;
            initialDate = new Date(initialDate.getFullYear(), initialDate.getMonth(), 1, 3);
            var dayCount = new Date(initialDate.getFullYear(), initialDate.getMonth() + 1, 0, 3).getDate();

            var prevDates = dateUtils.dateRange(-initialDate.getDay(), 0, initialDate);
            var currentMonthDates = dateUtils.dateRange(0, dayCount, initialDate);
            var lastDate = dateUtils.stringToDate(currentMonthDates[currentMonthDates.length - 1]);
            var nextMonthDates = dateUtils.dateRange(1, 7 - lastDate.getDay(), lastDate);

            var allDates = prevDates.concat(currentMonthDates, nextMonthDates);
            var unavailableDates = scope.$eval(attrs.disabledDates) || [];

            // Add an extra row if needed to make the calendar to have 6 rows
            if (allDates.length / 7 < 6) {
              allDates = allDates.concat(dateUtils.dateRange(1, 8, allDates[allDates.length - 1]));
            }

            scope.allowPrevMonth = !attrs.minDate || currentMonth > parseInt(dateFilter(attrs.minDate, "M"), 10);
            scope.allowNextMonth = !attrs.maxDate || currentMonth < parseInt(dateFilter(attrs.maxDate, "M"), 10);

            var dates = [];

            for (var i = 0; i < allDates.length; i++) {
              var className = null, date = allDates[i];

              if (date < attrs.minDate || date > attrs.maxDate || dateFilter(date, 'M') !== currentMonth.toString()) {
                className = 'disabled';
              } else if (indexOf.call(unavailableDates, date) >= 0) {
                className = 'disabled unavailable';
              } else if (date === Today) {
                className = 'today';
              }

              dates.push({date: date, className: className});
            }

            scope.dates = dates;
          };

          scope.setDate = function(date) {
            ngModel.$setViewValue(date);
          };

          scope.changeMonth = function (offset) {
            currentDate.setMonth(currentDate.getMonth() + offset);
            scope.render(currentDate);
          };

          scope.isDateDisabled = function(dateObj) {
            /^disabled/.test(dateObj.className);
          };

          scope.render(currentDate);
        }
      };
    }]);
})(window.angular);
