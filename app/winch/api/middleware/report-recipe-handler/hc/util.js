const {
  // NumberFormatter,
  DateFormatter,
} = require('../../../../../../api/lib/util/formatter');

exports.applyConventionOverConfiguration = (context) => {
  context.i18n = {
    ...{
      locale: 'en-GB',
      timeZone: 'Europe/London',
    },
    ...context.i18n,
  };

  context.selection = context.selection || {
    plant: {

    },
    period: {
    }
  };

  context.selection.plant = context.selection.plant || {};

  if (!context.selection.period || !context.selection.period.from || !context.selection.period.to) {
    const dateFormatter = DateFormatter.buildISOZoneDateFormatter();
    const endMonthRef = new Date(
      new Date(
        // endDateRef
        new Date(context.selection.period.to || DateFormatter.formatDateOrDefault(new Date(), dateFormatter))
      ).setDate(1)
    );

    context.selection.period.from = DateFormatter.formatDateOrDefault(new Date(new Date(endMonthRef).setMonth(endMonthRef.getMonth() - 1)), dateFormatter);
    // FIXME // this calculate first outer day (1st next month) // context.selection.period.to = DateFormatter.formatDateOrDefault(endMonthRef, dateFormatter);
    context.selection.period.to = DateFormatter.formatDateOrDefault(new Date(new Date(endMonthRef).setDate(endMonthRef.getDate() - 1)), dateFormatter);
  }
}