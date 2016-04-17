# angular-pickadate [![Build Status](https://travis-ci.org/restorando/angular-pickadate.svg?branch=master)](https://travis-ci.org/restorando/angular-pickadate)


A simple and fluid inline datepicker for AngularJS with no extra dependencies.

![pickadate](http://img.ctrlv.in/img/5294e96436552.jpg)

### Demo

<a href="http://embed.plnkr.co/gXP8xdsdP9nJIr0fi1RQ/preview" target="_blank">View demo in a new window</a>

### Installation

1) Add the `pickadate` module to your dependencies

```javascript
angular.module('myApp', ['pickadate']);
```

2) Use the `pickadate` directive in any element

```html
<div pickadate ng-model="date"></div>
```

If the element is an `<input>`, it will display the datepicker as a modal. Otherwise, it will be rendered inline.

Pickadate is fluid, so it will take the width of the parent container.

### Pickadate options

#### format

You can specify the date format using the `format` attribute. Supported formats must have the year, month and day parts, and the separator must be `-` or `/`.

```html
<div pickadate ng-model="date" format="dd/mm/yyyy"></div>
```

Format string can be composed of the following elements:

* `'yyyy;`: 4 digit representation of year (e.g. AD 1 => 0001, AD 2010 => 2010)
* `'mm'` or `'MM'`: Month in year, padded (01-12)
* `'dd'`: Day in month, padded (01-31)

Every option that receives a date as the input (e.g. min-date, max-date, etc) should be entered using the same format.

#### min-date, max-date

```html
<div pickadate ng-model="date" min-date="minDate" max-date="maxDate"></div>
```

```javascript
function MyAppController($scope) {
    $scope.minDate = '2013-11-10';
    $scope.maxDate = '2013-12-31';
}
```

`min-date` and `max-date` take angular expressions, so if you want to specify the values inline, don't forget the quotes!

```html
<div pickadate ng-model="date" min-date="'2013-11-10'" max-date="'2013-12-31'"></div>
```

#### disabled-dates

You can specify a function that will determine if a date is disabled or not. You can pass `formattedDate` as an argument to receive the date formatted in the current locale, or `date` to receive the date object. You can pass both of them if you need.

```html
<div pickadate ng-model="date" disabled-dates="disabledDatesFn(formattedDate)"></div>
```

```javascript
function MyAppController($scope) {
    $scope.disabledDatesFn = function(formattedDate) {
        return ['2013-11-10', '2013-11-15', '2013-11-19'].indexOf(formattedDate) > -1;
    }
}
```

This is handy if you want to disable dates programatically.

```html
<div pickadate ng-model="date" disabled-dates="disabledDatesFn(date)"></div>
```

```javascript
function MyAppController($scope) {
    $scope.disabledDatesFn = function(date) {
        return date.getDay() === 6; // Disable every Sunday
    }
}
```

#### default-date

Allows you to preset the calendar to a particular month without setting the chosen date.

```html
<div pickadate default-date="presetDate"></div>
```

```javascript
function MyAppController($scope) {
    $scope.presetDate = '2013-12-01';
}
```

#### week-starts-on

Sets the first day of the week. The default is 0 for Sunday.

```html
<div pickadate week-starts-on="1"></div>
```

#### no-extra-rows

The calendar will have between 4 and 6 rows if this attribute is present. By default it will always have 6 rows.

```html
<div pickadate no-extra-rows></div>
```

#### multiple

The calendar will support selecting multiple dates. NgModel will be set as an array of date strings

```html
<div pickadate multiple></div>
```
#### select-other-months

This attribute can take the following string values:

- `next`: the calendar will allow selecting dates from the next month
- `previous`: same as the one before, but for previous month dates
- `both`: the calendar will allow selecting dates from both the next and previous month

```html
<div pickadate select-other-months="next"></div>
```

### I18n & Icons

Pickadate uses angular `$locale` module for the date translations. If you want to have the calendar in any other language, please include the corresponding AngularJS i18n files. You can get them here: [https://code.angularjs.org/1.3.0/i18n/](https://code.angularjs.org/1.3.0/i18n/).

For the remaining translations you can configure the `pickadateI18nProvider`.

```javascript
angular.module('testApp', ['pickadate'])

    .config(function(pickadateI18nProvider) {
        pickadateI18nProvider.translations = {
            prev: '<i class="icon-chevron-left"></i> ant',
            next: 'sig <i class="icon-chevron-right"></i>'
        }
    });
```

The translations can contain custom html code, useful to include custom icons in the calendar controls.

## License

Copyright (c) 2013 Restorando

MIT License

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

