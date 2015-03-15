;(function(angular){
  'use strict';
  var indexOf = [].indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (i in this && this[i] === item) return i;
    }
    return -1;
  };

  function isDescendant(parent, child) {
    var node = child.parentNode;
    while (node !== null) {
      if (node === parent) return true;
      node = node.parentNode;
    }
    return false;
  }

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

      function getPartName(part) {
        switch (part) {
          case 'dd':   return 'day';
          case 'MM':   return 'month';
          case 'yyyy': return 'year';
        }
      }

      return {
        parseDate: function(dateString, format) {
          if (!dateString) return;
          if (angular.isDate(dateString)) return new Date(dateString);

          format = format || 'yyyy-MM-dd';

          var formatRegex = '(dd|MM|yyyy)',
              separator   = format.match(/[-|/]/)[0],
              dateParts   = dateString.split(separator),
              regexp      = new RegExp([formatRegex, formatRegex, formatRegex].join(separator)),
              formatParts = format.match(regexp),
              dateObj     = {};

          formatParts.shift();

          angular.forEach(formatParts, function(part, i) {
            dateObj[getPartName(part)] = parseInt(dateParts[i], 10);
          });

          if (isNaN(dateObj.year) || isNaN(dateObj.month) || isNaN(dateObj.day)) return;

          return new Date(dateObj.year, dateObj.month - 1, dateObj.day, 3);
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

    .directive('pickadate', ['$locale', '$sce', '$compile', '$document', '$window', 'pickadateUtils',
      'pickadateI18n', 'dateFilter', function($locale, $sce, $compile, $document, $window, dateUtils, i18n, dateFilter) {

      var TEMPLATE =
        '<div class="pickadate" ng-show="displayPicker" ng-style="styles">' +
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
                '<li ng-repeat="d in dates" ng-click="setDate(d)" ng-class="classesFor(d)">' +
                  '{{d.dateObj | date:"d"}}' +
                '</li>' +
              '</ul>' +
            '</div>' +
          '</div>' +
        '</div>';

      return {
        require: 'ngModel',
        scope: {
          defaultDate: '=',
          minDate: '=',
          maxDate: '=',
          disabledDates: '=',
          weekStartsOn: '=',
        },

        link: function(scope, element, attrs, ngModel)  {
          var noExtraRows   = attrs.hasOwnProperty('noExtraRows'),
              allowMultiple = attrs.hasOwnProperty('multiple'),
              weekStartsOn  = scope.weekStartsOn,
              selectedDates = [],
              wantsModal    = element[0] instanceof HTMLInputElement,
              compiledHtml  = $compile(TEMPLATE)(scope),
              format        = (attrs.format || 'yyyy-MM-dd').replace(/m/g, 'M'),
              minDate, maxDate;

          scope.displayPicker = !wantsModal;

          if (!angular.isNumber(weekStartsOn) || weekStartsOn < 0 || weekStartsOn > 6) {
            weekStartsOn = 0;
          }

          scope.setDate = function(dateObj) {
            if (isOutOfRange(dateObj.dateObj) || isDateDisabled(dateObj.date)) return;
            selectedDates = allowMultiple ? toggleDate(dateObj.date, selectedDates) : [dateObj.date];
            setViewValue(selectedDates);
            scope.displayPicker = !wantsModal;
          };

          var $render = ngModel.$render = function(options) {
            options = options || {};

            if (angular.isArray(ngModel.$viewValue)) {
              selectedDates = ngModel.$viewValue;
            } else if (ngModel.$viewValue) {
              selectedDates = [ngModel.$viewValue];
            }

            scope.currentDate = dateUtils.parseDate(scope.defaultDate, format) ||
              dateUtils.parseDate(selectedDates[0], format) || new Date();

            selectedDates = enabledDatesOf(selectedDates);

            setViewValue(selectedDates, options);
            render();
          };

          scope.classesFor = function(date) {
            var extraClasses = indexOf.call(selectedDates, date.date) >= 0 ? 'pickadate-active' : null;
            return date.classNames.concat(extraClasses);
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
            return angular.toJson([scope.minDate, scope.maxDate, scope.disabledDates]);
          }, function() {
            minDate = dateUtils.parseDate(scope.minDate, format) || new Date(0);
            maxDate = dateUtils.parseDate(scope.maxDate, format) || new Date(99999999999999);

            $render();
          });

          // Insert datepicker into DOM
          if (wantsModal) {
            var togglePicker = function(toggle) {
              scope.displayPicker = toggle;
              scope.$apply();
            };

            element.on('focus', function() {
              var supportPageOffset = $window.pageXOffset !== undefined,
                  isCSS1Compat = (($document.compatMode || "") === "CSS1Compat"),
                  scrollX = supportPageOffset ? $window.pageXOffset : isCSS1Compat ? $document.documentElement.scrollLeft : $document.body.scrollLeft,
                  scrollY = supportPageOffset ? $window.pageYOffset : isCSS1Compat ? $document.documentElement.scrollTop : $document.body.scrollTop,
                  innerWidth = $window.innerWidth || $document.documentElement.clientWidth || $document.body.clientWidth;

              scope.styles = { top: scrollY + element[0].getBoundingClientRect().bottom + 'px' };

              if ((innerWidth - element[0].getBoundingClientRect().left ) >= 300) {
                scope.styles.left = scrollX + element[0].getBoundingClientRect().left  + 'px';
              } else {
                scope.styles.right = innerWidth - element[0].getBoundingClientRect().right - scrollX + 'px';
              }

              togglePicker(true);
            });

            element.on('keydown', function(e) {
              if (indexOf.call([9, 13, 27], e.keyCode) >= 0) togglePicker(false);
            });

            // if the user types a date, update the picker and set validity
            scope.$watch(function() {
              return ngModel.$viewValue;
            }, function(val) {
              var isValidDate = dateUtils.parseDate(val, format);

              if (isValidDate) $render({ skipRenderInput: true });
              ngModel.$setValidity('date', !!isValidDate);
            });

            $document.on('click', function(e) {
              if (isDescendant(compiledHtml[0], e.target) || e.target === element[0]) return;
              togglePicker(false);
            });

            // if the input element has a value, set it as the ng-model
            scope.$$postDigest(function() {
              if (attrs.value) { ngModel.$viewValue = attrs.value; $render(); }
            });

            element.after(compiledHtml.addClass('pickadate-modal'));
          } else {
            element.append(compiledHtml);
          }

          function render() {
            var initialDate   = new Date(scope.currentDate.getFullYear(), scope.currentDate.getMonth(), 1, 3),
                currentMonth  = initialDate.getMonth() + 1,
                allDates      = dateUtils.buildDates(initialDate, { weekStartsOn: weekStartsOn, noExtraRows: noExtraRows }),
                dates         = [],
                today         = dateFilter(new Date(), format);

            var nextMonthInitialDate = new Date(initialDate);
            nextMonthInitialDate.setMonth(currentMonth);

            scope.allowPrevMonth = !minDate || initialDate > minDate;
            scope.allowNextMonth = !maxDate || nextMonthInitialDate <= maxDate;
            scope.dayNames       = dateUtils.buildDayNames(weekStartsOn);

            for (var i = 0; i < allDates.length; i++) {
              var classNames = [],
                  dateObj    = allDates[i],
                  date       = dateFilter(dateObj, format),
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

          function setViewValue(value, options) {
            options = options || {};

            if (allowMultiple) {
              ngModel.$setViewValue(value);
            } else {
              ngModel.$setViewValue(value[0]);
            }
            if (!options.skipRenderInput) element.val(ngModel.$viewValue);
          }

          function enabledDatesOf(dateArray) {
            var resultArray = [];

            for (var i = 0; i < dateArray.length; i++) {
              var date = dateArray[i];

              if (!isDateDisabled(date) && !isOutOfRange(dateUtils.parseDate(date, format))) {
                resultArray.push(date);
              }
            }

            return resultArray;
          }

          function isOutOfRange(date) {
            return date < minDate || date > maxDate || dateFilter(date, 'M') !== dateFilter(scope.currentDate, 'M');
          }

          function isDateDisabled(date) {
            return indexOf.call(scope.disabledDates || [], date) >= 0;
          }

          function toggleDate(date, dateArray) {
            var index = indexOf.call(dateArray, date);
            if (index === -1) {
              dateArray.push(date);
            }
            else {
              dateArray.splice(index, 1);
            }
            return dateArray;
          }
        }
      };
    }]);
})(window.angular);
