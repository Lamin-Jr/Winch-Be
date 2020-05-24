const undefinedChecker = v => v === undefined;
const numberChecker = v => undefinedChecker(v) || isNaN(v);
const dateChecker = v => numberChecker(v) || !(v instanceof Date);


class BaseFormatter {

  static formatValueOrDefault(value, formatter, defaultIfInvalid = '', invalidChecker = undefinedChecker) {
    return invalidChecker(value)
      ? defaultIfInvalid
      : formatter(value);
  }
  
}

class NumberFormatter extends BaseFormatter {

  static buildFixedDecimalFormatter(locale, totalDecimals) {
    return v => Intl.NumberFormat(locale, { style: 'decimal', maximumFractionDigits: totalDecimals, minimumFractionDigits: totalDecimals }).format(v);
  }

  static buildCurrencyFormatter(locale, currency) {
    return v => Intl.NumberFormat(locale, { style: 'currency', currency }).format(v);
  }

  static formatNumberOrDefault(value, formatter, defaultIfInvalid = '', invalidChecker = numberChecker) {
    return BaseFormatter.formatValueOrDefault(value, formatter, defaultIfInvalid, invalidChecker);
  }

}

class DateFormatter extends BaseFormatter {

  static buildDateAtZoneFormatter(locale, timezone) {
    return v => v.toLocaleString(locale, { timeZone: timezone });
  }

  static formatDateOrDefault(value = new Date(), formatter, defaultIfInvalid = '', invalidChecker = dateChecker) {
    return BaseFormatter.formatValueOrDefault(value, formatter, defaultIfInvalid, invalidChecker)
  }

}


module.exports = {
  NumberFormatter,
  DateFormatter,
};
