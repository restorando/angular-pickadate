;(function(angular){
  var indexOf = [].indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (i in this && this[i] === item) return i;
    }
    return -1;
  };

  angular.module('pickadate', [])

    .provider('pickadateI18n', function() {
      var defaults = {
        'prev': 'prev',
        'next': 'next',
        'prev year': 'prev year',
        'next year': 'next year'
      };

      this.translations = {};

      this.$get = function() {
        var translations = this.translations;

        return {
          t: function(key) {
            return translations[key] || defaults[key];
          }
        }
      }
    })

    .factory('pickadateUtils', ['dateFilter', function(dateFilter) {
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

    .directive('pickadate', ['$locale', 'pickadateUtils', 'pickadateI18n', 'dateFilter', function($locale, dateUtils, i18n, dateFilter) {
      return {
        require: 'ngModel',
        scope: {
          date: '=ngModel',
          minDate: '=',
          maxDate: '=',
          disabledDates: '=',
          showYearNav: '='
        },
        template:
          '<div class="pickadate">' +
            '<div class="pickadate-header">' +
              '<div class="pickadate-controls">' +
                '<div class="pickadate-prev">' +
                  '<a href="" ng-click="changeYear(-1)" ng-show="showYearNav && allowPrevYear">{{t("prev year")}}</a> ' +
                  '<a href="" ng-click="changeMonth(-1)" ng-show="allowPrevMonth">{{t("prev")}}</a>' +
                '</div>' +
                '<div class="pickadate-next">' +
                  '<a href="" ng-click="changeMonth(1)" ng-show="allowNextMonth">{{t("next")}}</a> ' +
                  '<a href="" ng-click="changeYear(1)" ng-show="showYearNav && allowNextYear">{{t("next year")}}</a>' +
                '</div>' +
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
                    '{{d.date | date:"d"}}' +
                  '</li>' +
                '</ul>' +
              '</div>' +
            '</div>' +
          '</div>',

        link: function(scope, element, attrs, ngModel)  {
          var minDate       = scope.minDate && dateUtils.stringToDate(scope.minDate),
              maxDate       = scope.maxDate && dateUtils.stringToDate(scope.maxDate),
              disabledDates = scope.disabledDates || [],
              currentDate   = new Date();

          scope.dayNames    = $locale.DATETIME_FORMATS['SHORTDAY'];
          scope.currentDate = currentDate;
          scope.t           = i18n.t;

          scope.render = function(initialDate) {
            initialDate = new Date(initialDate.getFullYear(), initialDate.getMonth(), 1, 3);

            var currentMonth    = initialDate.getMonth() + 1,
              dayCount          = new Date(initialDate.getFullYear(), initialDate.getMonth() + 1, 0, 3).getDate(),
              prevDates         = dateUtils.dateRange(-initialDate.getDay(), 0, initialDate),
              currentMonthDates = dateUtils.dateRange(0, dayCount, initialDate),
              lastDate          = dateUtils.stringToDate(currentMonthDates[currentMonthDates.length - 1]),
              nextMonthDates    = dateUtils.dateRange(1, 7 - lastDate.getDay(), lastDate),
              allDates          = prevDates.concat(currentMonthDates, nextMonthDates),
              dates             = [],
              today             = dateFilter(new Date(), 'yyyy-MM-dd');

            // Add an extra row if needed to make the calendar to have 6 rows
            if (allDates.length / 7 < 6) {
              allDates = allDates.concat(dateUtils.dateRange(1, 8, allDates[allDates.length - 1]));
            }

            var nextMonthInitialDate = new Date(initialDate);
            nextMonthInitialDate.setMonth(currentMonth);

            scope.allowPrevYear  = !minDate || initialDate.getFullYear() > minDate.getFullYear();
            scope.allowPrevMonth = !minDate || initialDate > minDate;
            scope.allowNextMonth = !maxDate || nextMonthInitialDate < maxDate;
            scope.allowNextYear  = !maxDate || initialDate.getFullYear() < maxDate.getFullYear();

            for (var i = 0; i < allDates.length; i++) {
              var className = "", date = allDates[i];

              if (date < scope.minDate || date > scope.maxDate || dateFilter(date, 'M') !== currentMonth.toString()) {
                className = 'pickadate-disabled';
              } else if (indexOf.call(disabledDates, date) >= 0) {
                className = 'pickadate-disabled pickadate-unavailable';
              } else {
                className = 'pickadate-enabled';
              }

              if (date === today) {
                className += ' pickadate-today';
              }

              dates.push({date: date, className: className});
            }

            scope.dates = dates;
          };

          scope.setDate = function(dateObj) {
            if (isDateDisabled(dateObj)) return;
            ngModel.$setViewValue(dateObj.date);
          };

          ngModel.$render = function () {
            if ((date = ngModel.$modelValue) && (indexOf.call(disabledDates, date) === -1)) {
              scope.currentDate = currentDate = dateUtils.stringToDate(date);
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
            scope.render(currentDate);
          };

          scope.changeYear = function (offset) {
            currentDate.setFullYear(currentDate.getFullYear() + offset);

            if (currentDate > maxDate) {
              currentDate.setTime(maxDate.getTime());
            } else if (currentDate < minDate) {
              currentDate.setTime(minDate.getTime());
            }

            scope.render(currentDate);
          }

          function isDateDisabled(dateObj) {
            return (/pickadate-disabled/.test(dateObj.className));
          }
        }
      };
    }]);
})(window.angular);
