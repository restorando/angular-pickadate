;(function(angular){
  'use strict';
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
        'next': 'next'
      };

      this.translations = {};

      this.$get = function() {
        var translations = this.translations;

        return {
          t: function(key) {
            return translations[key] || defaults[key];
          }
        };
      };
    })

    .factory('pickadateUtils', ['$locale', function($locale) {
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
        }
      };
    }])

    .directive('pickadate', ['$locale', 'pickadateUtils', 'pickadateI18n', 'dateFilter', function($locale, dateUtils, i18n, dateFilter) {
      return {
        require: 'ngModel',
        scope: {
          date: '=ngModel',
          defaultDate: '=',
          minDate: '=',
          maxDate: '=',
          disabledDates: '=',
          weekStartsOn: '='
        },
        template:
          '<div class="pickadate">' +
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
          var noExtraRows   = attrs.hasOwnProperty('noExtraRows'),
              currentDate   = (scope.defaultDate && dateUtils.stringToDate(scope.defaultDate)) || new Date();

          scope.t           = i18n.t;

          scope.setDate = function(dateObj) {
            if (isDateDisabled(dateObj)) return;
            ngModel.$setViewValue(dateObj.date);
          };

          ngModel.$render = function() {
            var date, weekStartsOn = scope.weekStartsOn;

            if (!angular.isNumber(weekStartsOn) || weekStartsOn < 0 || weekStartsOn > 6) {
              scope.weekStartsOn = 0;
            }

            if ((date = ngModel.$modelValue) && (indexOf.call(scope.disabledDates || [], date) === -1)) {
              scope.currentDate = currentDate = scope.currentDate || dateUtils.stringToDate(date);
            } else if (date) {
              // if the initial date set by the user is in the disabled dates list, unset it
              scope.setDate({});
            }
            render();
          };

          scope.changeMonth = function(offset) {
            // If the current date is January 31th, setting the month to date.getMonth() + 1
            // sets the date to March the 3rd, since the date object adds 30 days to the current
            // date. Settings the date to the 2nd day of the month is a workaround to prevent this
            // behaviour
            currentDate.setDate(1);
            currentDate.setMonth(currentDate.getMonth() + offset);
            render();
          };

          // Workaround to watch multiple properties. XXX use $scope.$watchGroup in angular 1.3
          scope.$watch(function(){
            return angular.toJson([scope.minDate, scope.maxDate, scope.disabledDates, scope.weekStartsOn]);
          }, ngModel.$render);

          function render() {
            var initialDate   = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 3),
                currentMonth  = initialDate.getMonth() + 1,
                allDates      = dateUtils.buildDates(initialDate, { weekStartsOn: scope.weekStartsOn, noExtraRows: noExtraRows }),
                dates         = [],
                today         = dateFilter(new Date(), 'yyyy-MM-dd'),
                minDate       = scope.minDate && dateUtils.stringToDate(scope.minDate),
                maxDate       = scope.maxDate && dateUtils.stringToDate(scope.maxDate);

            var nextMonthInitialDate = new Date(initialDate);
            nextMonthInitialDate.setMonth(currentMonth);

            scope.allowPrevMonth = !minDate || initialDate > minDate;
            scope.allowNextMonth = !maxDate || nextMonthInitialDate <= maxDate;
            scope.dayNames       = dateUtils.buildDayNames(scope.weekStartsOn);

            for (var i = 0; i < allDates.length; i++) {
              var className = "",
                  dateObj   = allDates[i],
                  date      = dateFilter(dateObj, 'yyyy-MM-dd');

              if (dateObj < minDate || dateObj > maxDate || dateFilter(dateObj, 'M') !== currentMonth.toString()) {
                className = 'pickadate-disabled';
              } else if (indexOf.call(scope.disabledDates || [], date) >= 0) {
                className = 'pickadate-disabled pickadate-unavailable';
              } else {
                className = 'pickadate-enabled';
              }

              if (date === today) {
                className += ' pickadate-today';
              }

              dates.push({date: date, dateObj: dateObj, className: className});
            }

            scope.dates = dates;
          }

          function isDateDisabled(dateObj) {
            return (/pickadate-disabled/.test(dateObj.className));
          }
        }
      };
    }]);
})(window.angular);
