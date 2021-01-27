const undefinedChecker = v => v === undefined;
const numberChecker = v => undefinedChecker(v) || isNaN(v);
const dateChecker = v => numberChecker(v) || !(v instanceof Date);


class BaseFormatter {

  static formatValueOrDefault (value, formatter, defaultIfInvalid = '', invalidChecker = undefinedChecker) {
    return invalidChecker(value)
      ? defaultIfInvalid
      : formatter(value);
  }

}

class NumberFormatter extends BaseFormatter {

  static buildFixedDecimalFormatter (locale, totalDecimals) {
    return v => Intl.NumberFormat(locale, { style: 'decimal', maximumFractionDigits: totalDecimals, minimumFractionDigits: totalDecimals }).format(v);
  }

  static buildCurrencyFormatter (locale, currency) {
    return v => Intl.NumberFormat(locale, { style: 'currency', currency }).format(v);
  }

  static formatNumberOrDefault (value, formatter, defaultIfInvalid = '', invalidChecker = numberChecker) {
    return BaseFormatter.formatValueOrDefault(value, formatter, defaultIfInvalid, invalidChecker);
  }

  static roundToDecimals (val, totalDecimals = 2) {
    return +(Math.round(val + `e+${totalDecimals}`) + `e-${totalDecimals}`);
  }

}

class DateFormatter extends BaseFormatter {

  static buildDateAtZoneFormatter (locale, timeZone) {
    return v => v.toLocaleString(locale, { timeZone });
  }

  static buildISODateFormatter (onlyDate = true) {
    return v => {
      let result = v.toISOString();
      if (onlyDate) {
        result = result.split('T', 1)[0];
      }
      return result
    }
  }

  static buildISOZoneDateFormatter (onlyDate = true) {
    return v => `${v.getFullYear()}-${new String(v.getMonth() + 1).padStart(2, '0')}-${new String(v.getDate()).padStart(2, '0')}${onlyDate ? '' : `T${new String(v.getHours()).padStart(2, '0')}:${new String(v.getMinutes()).padStart(2, '0')}:${new String(v.getSeconds()).padStart(2, '0')}.${(v.getMilliseconds() / 1000).toFixed(3).slice(2, 5)}Z`}`;
  }

  static formatDateOrDefault (value = new Date(), formatter, defaultIfInvalid = '', invalidChecker = dateChecker) {
    return BaseFormatter.formatValueOrDefault(value, formatter, defaultIfInvalid, invalidChecker)
  }

}


module.exports = {
  NumberFormatter,
  DateFormatter,
};
