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

    .directive('pickadate', ['$locale', '$sce', 'pickadateUtils', 'pickadateI18n', 'dateFilter', function($locale, $sce, dateUtils, i18n, dateFilter) {
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
                '<a href="" class="pickadate-prev" ng-click="changeMonth(-1)" ng-show="allowPrevMonth">' +
                  $sce.trustAsHtml(i18n.t('prev')) +
                '</a>' +
                '<a href="" class="pickadate-next" ng-click="changeMonth(1)" ng-show="allowNextMonth">' +
                  $sce.trustAsHtml(i18n.t('next')) +
                '</a>' +
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
                  '<li ng-repeat="d in dates" ng-click="setDate(d)" ng-class="d.classNames.concat(date == d.date ? \'pickadate-active\' : null)">' +
                    '{{d.dateObj | date:"d"}}' +
                  '</li>' +
                '</ul>' +
              '</div>' +
            '</div>' +
          '</div>',

        link: function(scope, element, attrs, ngModel)  {
          var noExtraRows   = attrs.hasOwnProperty('noExtraRows');

          scope.t = i18n.t;
          scope.currentDate = scope.defaultDate && dateUtils.stringToDate(scope.defaultDate);

          scope.setDate = function(dateObj) {
            if (isOutOfRange(dateObj.dateObj) || isDateDisabled(dateObj.date)) return;
            ngModel.$setViewValue(dateObj.date);
          };

          ngModel.$render = function() {
            var date = ngModel.$modelValue,
                dateObj = date && dateUtils.stringToDate(date),
                weekStartsOn = scope.weekStartsOn;

            scope.currentDate = scope.currentDate || dateObj;
            scope.minDate     = scope.minDate && dateUtils.stringToDate(scope.minDate) || new Date(0);
            scope.maxDate     = scope.maxDate && dateUtils.stringToDate(scope.maxDate) || new Date(99999999999999);

            if (!angular.isNumber(weekStartsOn) || weekStartsOn < 0 || weekStartsOn > 6) {
              scope.weekStartsOn = 0;
            }

            // if the initial date set by the user is in the disabled dates list, unset it
            if (date && (isDateDisabled(date) || isOutOfRange(dateObj))) {
              ngModel.$setViewValue(undefined);
            }

            render();
          };

          scope.changeMonth = function(offset) {
            // If the current date is January 31th, setting the month to date.getMonth() + 1
            // sets the date to March the 3rd, since the date object adds 30 days to the current
            // date. Settings the date to the 2nd day of the month is a workaround to prevent this
            // behaviour
            scope.currentDate.setDate(1);
            scope.currentDate.setMonth(scope.currentDate.getMonth() + offset);
            render();
          };

          // Workaround to watch multiple properties. XXX use $scope.$watchGroup in angular 1.3
          scope.$watch(function(){
            return angular.toJson([scope.minDate, scope.maxDate, scope.disabledDates, scope.weekStartsOn]);
          }, ngModel.$render);

          if (!scope.date) {
            scope.setDate({date: dateFilter(new Date(), 'yyyy-MM-dd')});
          }

          function render() {
            var initialDate   = new Date(scope.currentDate.getFullYear(), scope.currentDate.getMonth(), 1, 3),
                currentMonth  = initialDate.getMonth() + 1,
                allDates      = dateUtils.buildDates(initialDate, { weekStartsOn: scope.weekStartsOn, noExtraRows: noExtraRows }),
                dates         = [],
                today         = dateFilter(new Date(), 'yyyy-MM-dd');

            var nextMonthInitialDate = new Date(initialDate);
            nextMonthInitialDate.setMonth(currentMonth);

            scope.allowPrevMonth = !scope.minDate || initialDate > scope.minDate;
            scope.allowNextMonth = !scope.maxDate || nextMonthInitialDate <= scope.maxDate;
            scope.dayNames       = dateUtils.buildDayNames(scope.weekStartsOn);

            for (var i = 0; i < allDates.length; i++) {
              var classNames = [],
                  dateObj    = allDates[i],
                  date       = dateFilter(dateObj, 'yyyy-MM-dd'),
                  isDisabled = isDateDisabled(date);

              if (isOutOfRange(dateObj) || isDisabled) {
                classNames.push('pickadate-disabled');
              } else {
                classNames.push('pickadate-enabled');
              }

              if (isDisabled)     classNames.push('pickadate-unavailable');
              if (date === today) classNames.push('pickadate-today');

              dates.push({date: date, dateObj: dateObj, classNames: classNames});
            }

            scope.dates = dates;
          }

          function isOutOfRange(date) {
            return date < scope.minDate || date > scope.maxDate || dateFilter(date, 'M') !== dateFilter(scope.currentDate, 'M');
          }

          function isDateDisabled(date) {
            return indexOf.call(scope.disabledDates || [], date) >= 0;
          }
        }
      };
    }]);
})(window.angular);
