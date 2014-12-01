Date.prototype.getDOY = function () {
    var onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((this - onejan) / 86400000) + 1;
};

Date.prototype.getWeekNumber = function () {
    var d = new Date(+this);
    d.setHours(0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    return Math.ceil((((d - new Date(d.getFullYear(), 0, 1)) / 8.64e7) + 1) / 7);
};

Date.prototype.strftime = function (fmt) {

    // formatting for day
    var abDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        abMonth = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        month = ["January", "February", "Mararch", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    fmt = fmt.replace(/%a/g, abDays[this.getDay()]);
    fmt = fmt.replace(/%A/g, days[this.getDay()]);
    fmt = fmt.replace(/%d/g, this.getDate() < 10 ? ("0" + this.getDate()) : this.getDate());
    fmt = fmt.replace(/%e/g, this.getDate() < 10 ? (" " + this.getDate()) : this.getDate());
    fmt = fmt.replace(/%j/g, this.getDOY() < 100 && this.getDOY() > 10 ? ("0" + this.getDOY()) : this.getDOY() < 10 ? ("00" + this.getDOY()) : this.getDOY());

    day = this.getDay();
    day = day == 0 && 7;

    fmt = fmt.replace(/%u/g, day);
    fmt = fmt.replace(/%w/g, this.getDay());

    // formatting for week
    fmt = fmt.replace(/%U/g, this.getWeekNumber());

    // formatting for month
    fmt = fmt.replace(/%b/g, abMonth[this.getMonth()]);
    fmt = fmt.replace(/%B/g, month[this.getMonth()]);
    fmt = fmt.replace(/%m/g, (this.getMonth() + 1) < 10 ? ("0" + (this.getMonth() + 1)) : (this.getMonth() + 1));

    // formatting for year
    fmt = fmt.replace(/%C/g, Math.floor(this.getFullYear() / 100 + 1, 0));
    fmt = fmt.replace(/%g/g, this.getFullYear().toString().substr(2, 2));
    fmt = fmt.replace(/%G/g, this.getFullYear());
    fmt = fmt.replace(/%y/g, this.getFullYear().toString().substr(2, 2));
    fmt = fmt.replace(/%Y/g, this.getFullYear());

    return fmt;
};

Date.prototype.getDaysInMonth = function () {
    var m = this.getMonth() + 1,
        y = this.getFullYear();
    return /8|3|5|10/.test(--m) ? 30 : m == 1 ? (!(y % 4) && y % 100) || !(y % 400) ? 29 : 28 : 31;
};

Date.prototype.addHours = function (h) {
    this.setHours(this.getHours() + h);
    return this;
};

// credit to Mosho, StakOverflow JS Chat
Date.prototype.clone = function () {
    return new Date(this.toString());
};

Date.prototype.toMidnight = function () {
    this.setHours(0);
    this.setMinutes(0);
    this.setSeconds(0);
    return this;
};

Date.prototype.compareDate = function (date, operation) {
    var retVal,
        tmpDateOrig = this.clone(),
        tmpDateCpr = date.clone(),
        greaterThan = function () {
            return this.toMidnight().getTime() > tmpDateCpr.toMidnight().getTime();
        },
        lessThan = function () {
            return this.toMidnight().getTime() < tmpDateCpr.toMidnight().getTime();
        },
        equalTo = function () {
            return this.toMidnight().getTime() === tmpDateCpr.toMidnight().getTime();
        },
        notEqual = function () {
            return this.toMidnight().getTime() !== tmpDateCpr.toMidnight().getTime();
        };

    switch (operation) {
    case "greaterThan":
        retVal = greaterThan.call(tmpDateOrig);
        break;
    case "greaterThanEqualTo":
        retVal = greaterThan.call(tmpDateOrig) || equalTo.call(tmpDateOrig);
        break;
    case "lessThan":
        retVal = lessThan.call(tmpDateOrig);
        break;
    case "lessThanEqualTo":
        retVal = lessThan.call(tmpDateOrig) || equalTo.call(tmpDateOrig);
        break;
    case "notEqual":
        retVal = notEqual.call(tmpDateOrig);
        break;
    case "equalTo":
    default:
        retVal = equalTo.call(tmpDateOrig);
        break;
    }

    return retVal;
};
