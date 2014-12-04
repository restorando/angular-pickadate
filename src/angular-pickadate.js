;(function(angular){
  'use strict';
  var indexOf = [].indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (i in this && this[i] === item) return i;
    }
    return -1;
  };

  angular.module('pickadate', [])

    .provider('pickadateI18n', function () {
      var defaults = {
        'prev': 'prev',
        'next': 'next'
      };

      this.translations = {};

      this.$get = function () {
        var translations = this.translations;

        return {
          t: function (key) {
            return translations[key] || defaults[key];
          }
        };
      };
    })

    .provider('pickadateOption', function () {
      this.defaults = {
        clickThroughMonths: false
      };
      this.$get = function () {
        return this.defaults;
      };
    })

    .factory('pickadateUtils', ['$locale', 'dateFilter', function($locale, dateFilter) {
      return {
        isDate: function(obj) {
          return Object.prototype.toString.call(obj) === '[object Date]';
        },

        stringToDate: function (dateString) {
          if (this.isDate(dateString)) return new Date(dateString);
          var dateParts = dateString.split('-'),
            year  = dateParts[0],
            month = dateParts[1],
            day   = dateParts[2];

          // set hour to 3am to easily avoid DST change
          return new Date(year, month - 1, day, 3);
        },

        dateRange: function (first, last, initial, format) {
          var date, i, _i, dates = [];

          if (!format) format = 'yyyy-MM-dd';

          for (i = _i = first; first <= last ? _i < last : _i > last; i = first <= last ? ++_i : --_i) {
            date = this.stringToDate(initial);
            date.setDate(date.getDate() + i);
            dates.push(dateFilter(date, format));
          }
          return dates;
        },

        buildDates: function(date, options) {
          var dates = [],
              lastDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 3);

          options = options || {};
          date = new Date(date);

          while (date.getDay() !== options.weekStartsOn) {
            date.setDate(date.getDate() - 1);
          }

          for (var i = 0; i < 42; i++) {  // 42 == 6 rows of dates
            if (options.noExtraRows && date.getDay() === options.weekStartsOn && date > lastDate) break;

            dates.push(new Date(date));
            date.setDate(date.getDate() + 1);
          }

          return dates;
        },


        buildDayNames: function(weekStartsOn) {
          var dayNames = $locale.DATETIME_FORMATS.SHORTDAY;

          if (weekStartsOn) {
            dayNames = dayNames.slice(0);
            for (var i = 0; i < weekStartsOn; i++) {
              dayNames.push(dayNames.shift());
            }
          }
          return dayNames;
        },

        toIso: function (date) {
          if (this.isDate(date)) {
            return dateFilter(date, 'yyyy-MM-dd');
          }
          return date;
        }
      };
    }])

    .directive('pickadate', ['$locale', 'pickadateUtils', 'pickadateI18n', 'pickadateOption', 'dateFilter', function($locale, dateUtils, i18n, defaultOpts, dateFilter) {
      return {
        require: 'ngModel',
        scope: {
          opts: '=pickadate',
          date: '=ngModel',
          minDate: '=',
          maxDate: '=',
          disabledDates: '=',
          weekStartsOn: '='
        },
        template:
          '<div class="pickadate" ng-class="optClasses()">' +
            '<div class="pickadate-header">' +
              '<div class="pickadate-controls">' +
                '<a href="" class="pickadate-prev" ng-click="changeMonth(-1)" ng-show="allowPrevMonth">{{t("prev")}}</a>' +
                '<a href="" class="pickadate-next" ng-click="changeMonth(1)" ng-show="allowNextMonth">{{t("next")}}</a>' +
              '</div>'+
              '<h3 class="pickadate-centered-heading">' +
                '{{currentDate | date:"MMMM yyyy"}}' +
              '</h3>' +
            '</div>' +
            '<div class="pickadate-body">' +
              '<div class="pickadate-main">' +
                '<ul class="pickadate-cell">' +
                  '<li class="pickadate-head" ng-repeat="dayName in dayNames">' +
                    '{{dayName}}' +
                  '</li>' +
                '</ul>' +
                '<ul class="pickadate-cell">' +
                  '<li ng-repeat="d in dates" ng-click="setDate(d)" class="{{d.className}}" ng-class="{\'pickadate-active\': date == d.date}">' +
                    '{{d.dateObj | date:"d"}}' +
                  '</li>' +
                '</ul>' +
              '</div>' +
            '</div>' +
          '</div>',

        link: function(scope, element, attrs, ngModel)  {
          var weekStartsOn  = scope.weekStartsOn || 0,
              noExtraRows   = attrs.hasOwnProperty('noExtraRows'),
              currentDate   = (scope.displayMonth && dateUtils.stringToDate(scope.displayMonth)) || new Date(),
              defaultOpts   = { clickThroughMonths: false },
              opts          = angular.extend(defaultOpts, scope.opts || {});

          if (scope.opts) {
            opts = angular.extend(scope.opts, opts);
          }

          if (!angular.isNumber(weekStartsOn) || weekStartsOn < 0 || weekStartsOn > 6) {
            weekStartsOn = 0;
          }

          scope.dayNames    = dateUtils.buildDayNames(weekStartsOn);
          scope.currentDate = currentDate;
          scope.t           = i18n.t;

          scope.$watch('displayMonth', function (newVal, oldVal) {
            if (newVal !== oldVal) {
              scope.currentDate = currentDate = dateUtils.stringToDate(newVal);
              scope.render(currentDate);
            }
          });

          scope.optClasses = function () {
            var classes = [];
            if (opts.clickThroughMonths) {
              classes.push('pickadate-click-through');
            }
            return classes;
          };

          scope.render = function (initialDate) {
            initialDate = new Date(initialDate.getFullYear(), initialDate.getMonth(), 1, 3);

            var currentMonth    = initialDate.getMonth() + 1,
              allDates          = dateUtils.buildDates(initialDate, { weekStartsOn: weekStartsOn, noExtraRows: noExtraRows }),
              dates             = [],
              today             = dateFilter(new Date(), 'yyyy-MM-dd'),
              minDate           = scope.minDate && dateUtils.stringToDate(scope.minDate),
              maxDate           = scope.maxDate && dateUtils.stringToDate(scope.maxDate);

            // Add an extra row if needed to make the calendar to have 6 rows
            if (allDates.length / 7 < 6) {
              allDates = allDates.concat(dateUtils.dateRange(1, 8, allDates[allDates.length - 1]));
            }

            var nextMonthInitialDate = new Date(initialDate);
            nextMonthInitialDate.setMonth(currentMonth);

            scope.allowPrevMonth = !minDate || initialDate > minDate;
            scope.allowNextMonth = !maxDate || nextMonthInitialDate <= maxDate;

            for (var i = 0; i < allDates.length; i++) {
              var className = '',
                  dateObj   = allDates[i],
                  date      = dateFilter(dateObj, 'yyyy-MM-dd');

              if (date < scope.minDate || date > scope.maxDate || dateFilter(dateObj, 'M') !== currentMonth.toString()) {
                className = 'pickadate-disabled pickadate-out-of-range';
              } else {
                if (indexOf.call(scope.disabledDates, date) >= 0) {
                  className = 'pickadate-disabled pickadate-unavailable';
                }
                if (dateFilter(date, 'M') !== currentMonth.toString()) {
                  className = 'pickadate-disabled pickadate-out-of-month';
                }
                if (className === '') {
                  className = 'pickadate-enabled';
                }
              }

              if (date === today) {
                className += ' pickadate-today';
              }

              dates.push({date: date, dateObj: dateObj, className: className});
            }

            scope.dates = dates;
          };

          scope.setDate = function (dateObj) {
            if (isDateDisabled(dateObj)) return;
            ngModel.$setViewValue(dateObj.date);
          };

          ngModel.$render = function () {
            var date;
            if ((date = ngModel.$modelValue) && (indexOf.call(scope.disabledDates, date) === -1)) {
              scope.currentDate = currentDate = dateUtils.stringToDate(date);
              scope.displayMonth = dateUtils.toIso(currentDate);
            } else if (date) {
              // if the initial date set by the user is in the disabled dates list, unset it
              scope.setDate({});
            }
            scope.render(currentDate);
          };

          scope.changeMonth = function (offset) {
            // If the current date is January 31th, setting the month to date.getMonth() + 1
            // sets the date to March the 3rd, since the date object adds 30 days to the current
            // date. Settings the date to the 2nd day of the month is a workaround to prevent this
            // behaviour
            currentDate.setDate(1);
            currentDate.setMonth(currentDate.getMonth() + offset);
            scope.displayMonth = dateUtils.toIso(currentDate);
            scope.render(currentDate);
          };

          function getMonthDelta(target, current) {
            var targetMonth = target.getFullYear() * 12 + target.getMonth(),
                currentMonth = current.getFullYear() * 12 + current.getMonth();
            return targetMonth - currentMonth;
          }

          function isDateDisabled(dateObj) {
            if (opts.clickThroughMonths && /pickadate-out-of-month/.test(dateObj.className)) {
              scope.changeMonth(getMonthDelta(dateUtils.stringToDate(dateObj.date), currentDate));
              return false;
            }
            return (/pickadate-disabled/.test(dateObj.className));
          }
        }
      };
    }]);
})(window.angular);
