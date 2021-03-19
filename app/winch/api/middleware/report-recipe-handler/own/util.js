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
    period: {
    }
  };

  if (context.selection.period.from) {
    context.selection.period.from = new Date(context.selection.period.from);
  }
  if (context.selection.period.to) {
    context.selection.period.to = new Date(context.selection.period.to);
  }
}

exports.notifyAll = (xlsMaker, localContext) => new Promise((resolve, reject) => {
  Promise.all(localContext.notifications.map(notification => notify(xlsMaker, {
    ...localContext,
    notification,
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
    const subPathSegments = dmsInstance.context.pathSegment.oReport.oOwn.fGenerated(localContext.project);
    dmsInstance.context.createRootDirSubPath(false, ...subPathSegments)
      .then(dirPath => {
        setTimeout(() => {
          return xlsMaker.writeFile(dmsInstance.context.buildPathFromRootDir(...subPathSegments, `${localContext.project}-${localContext.templateKey}.xlsx`));
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