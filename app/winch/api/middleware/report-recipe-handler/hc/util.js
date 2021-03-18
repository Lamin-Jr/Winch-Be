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

exports.notifyAll = (xlsMaker, localContext) => new Promise((resolve, reject) => {
  Promise.all(localContext.notifications.map(notification => notify(xlsMaker, {
    notification,
    period: localContext.period,
    templateKey: localContext.templateKey,
  })))
    .then(promiseAllResult => {
      notifyResult = {
        status: 200,
        errors: [],
      }
      promiseAllResult.forEach((promiseResult, index) => {
        if (!promiseResult.outcome) {
          notifyResult.errors.push({
            notification: index,
            error: promiseResult.error
          });
        }
      });
      if (notifyResult.errors.length) {
        notifyResult.status = notifyResult.errors.length === promiseAllResult.length
          ? 500
          : 409;
      }
      resolve(notifyResult);
    })
    .catch(error => reject(error))
});

exports.buildNotifyError = (notifyResult) => {
  const error = new Error(`unable to notify report, ${notifyResult.errors.length} error${notifyResult.errors.length !== 1 ? 's' : ''} encountered`);
  error.status = notifyResult.status;
  return error
}

//
// private part

const notify = (xlsMaker, localContext) => new Promise((resolve, reject) => {
  try {
    const dmsInstance = require("../../dms")
      .getInstance(localContext.notification.address.substring('winch://dms/'.length));
    if (!dmsInstance) {
      const error = new Error(`unsupported report recipient, fix it!`);
      error.status = 500;
      resolve({
        outcome: false,
        error,
      });
    }
    const basePathKey = dmsInstance.context.getBasePathKey(localContext.templateKey);
    const subPathSegments = dmsInstance.context.pathSegment.oReport.oHc.fGenerated(2021, 1);
    dmsInstance.context.createWorkDirSubPath(basePathKey, false, ...subPathSegments)
      .then(dirPath => {
        setTimeout(() => {
          return xlsMaker.writeFile(dmsInstance.context.buildPathFromWorkDir(basePathKey, ...subPathSegments, `${localContext.templateKey}.xlsx`));
        }, 100 * subPathSegments.length);
      })
      .then(() => resolve({
        outcome: true,
      }))
      .catch(error => resolve({
        outcome: false,
        error,
      }));
  } catch (error) {
    resolve({
      outcome: false,
      error,
    });
  }
});