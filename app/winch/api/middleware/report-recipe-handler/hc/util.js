const {
  v4: uuidv4,
  version: uuidVersion,
  validate: uuidValidate,
} = require('uuid');

const {
  // NumberFormatter,
  DateFormatter,
} = require('../../../../../../api/lib/util/formatter');

const {
  legacy: fsLegacy
} = require('../../../../../../api/lib/util/fs');

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
}

exports.notifyAll = (xlsOutContextList, localContext) => new Promise((resolve, reject) => {
  localContext.session.id = localContext.session.open === true || localContext.session.id
    ? uuidValidate(localContext.session.id) && uuidVersion(localContext.session.id) === 4
      ? localContext.session.id
      : uuidv4()
    : undefined
  Promise.all(xlsOutContextList.map(xlsOutContext => Promise.all(localContext.notifications.map(notification => notify(xlsOutContext.xlsMaker, {
    notification,
    fileNameBuilder: localContext.fileNameBuilder,
    period: xlsOutContext.period,
    project: xlsOutContext.project,
    session: localContext.session,
    templateKey: localContext.templateKey,
  })))
    .then(promiseAllResult => new Promise(resolve => {
      const notifyResult = {
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
    }))
    .catch(error => reject(error))
  ))
    .then(promiseAllResult => {
      if (promiseAllResult.length === 1) {
        resolve({
          ...promiseAllResult[0],
          session: localContext.session.id,
        });
        return;
      }
      const notifyResult = {
        status: 200,
        session: localContext.session.id,
        errors: [],
      }
      let errorCounter = 0;
      promiseAllResult.forEach((promiseResult, index) => {
        if (promiseResult.status !== 200) {
          errorCounter++;
        }
        notifyResult.errors.push(...promiseResult.errors);
      });
      if (notifyResult.errors.length) {
        notifyResult.status = errorCounter === promiseAllResult.length
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

exports.buildECustCountPeriodFilter = (context, businessStartDate, now = new Date()) => {
  const result = buildPeriodFilter(context, businessStartDate, now);
  let adjustedToDate = new Date(result.tsTo);
  // bring to next month
  adjustedToDate = new Date(new Date(adjustedToDate).setMonth(adjustedToDate.getMonth() + 1))
  // set date to 1
  adjustedToDate = new Date(new Date(adjustedToDate).setDate(1))
  // bring to one day before (actual end of month)
  adjustedToDate = new Date(new Date(adjustedToDate).setDate(adjustedToDate.getDate() - 1))
  // format results
  const dateFormatter = DateFormatter.buildISOZoneDateFormatter();
  result.tsFrom = DateFormatter.formatDateOrDefault(result.tsFrom, dateFormatter);
  result.tsTo = DateFormatter.formatDateOrDefault(adjustedToDate, dateFormatter);
  return result;
}

exports.buildEDelivPeriodFilter = (context, businessStartDate, now = new Date()) => {
  const result = buildPeriodFilter(context, businessStartDate, now);
  let adjustedToDate = new Date(result.tsTo);
  // bring to next month
  adjustedToDate = new Date(new Date(adjustedToDate).setMonth(adjustedToDate.getMonth() + 1))
  // set date to 1
  adjustedToDate = new Date(new Date(adjustedToDate).setDate(1))
  // format results
  const dateFormatter = DateFormatter.buildISOZoneDateFormatter();
  result.tsFrom = DateFormatter.formatDateOrDefault(result.tsFrom, dateFormatter);
  result.tsTo = DateFormatter.formatDateOrDefault(adjustedToDate, dateFormatter);
  return result;
}

exports.getTotalDaysOfMonth = (targetDate) => {
  return (new Date(new Date(targetDate).setMonth(new Date(targetDate).getMonth() + 1)).getTime() - new Date(targetDate).getTime()) / (1000 * 60 * 60 * 24)
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
    const periodAsDate = new Date(localContext.period);
    const year = periodAsDate.getFullYear().toString();
    const month = (periodAsDate.getMonth() + 1).toString().padStart(2, '0');
    const fileName = `${localContext.fileNameBuilder({ year, month })}.xlsx`;
    let subPathSegments;
    let creteDirPromise;
    if (localContext.session.id) {
      subPathSegments = [...dmsInstance.context.pathSegment.oReport.vSession];
      subPathSegments.push(localContext.session.owner);
      subPathSegments.push(localContext.session.id);
      creteDirPromise = dmsInstance.context.createRootDirSubPath(false, ...subPathSegments);
    } else {
      subPathSegments = dmsInstance.context.pathSegment.oReport.oHc.fGeneratedByProject(localContext.project);
      creteDirPromise = dmsInstance.context.createWorkDirSubPath(basePathKey, false, ...subPathSegments);
    }
    creteDirPromise
      .then(dirPath => {
        setTimeout(() => {
          // FIXME:
          console.log('writing...', fsLegacy.path.join(dirPath, fileName));
          return xlsMaker.writeFile(fsLegacy.path.join(dirPath, fileName));
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

const getActualPeriodFrom = (inputDate, businessStartDate, now = new Date()) => {
  return !inputDate || businessStartDate.getTime() > inputDate.getTime()
    ? businessStartDate
    : now.getTime() > inputDate.getTime()
      ? inputDate
      : now;
}

const getActualPeriodTo = (inputDate, businessStartDate, now = new Date()) => {
  return !inputDate || inputDate.getTime() > now.getTime()
    ? now
    : inputDate.getTime() >= businessStartDate.getTime()
      ? inputDate
      : businessStartDate;
}

const buildPeriodFilter = (context, businessStartDate, now = new Date()) => {
  const actualPeriodFrom = getActualPeriodFrom(
    context.selection.period.from
      ? new Date(context.selection.period.from)
      : now,
    businessStartDate,
    now
  );
  const actualPeriodTo = getActualPeriodTo(
    context.selection.period.to
      ? new Date(context.selection.period.to)
      : now,
    businessStartDate,
    now
  );

  if (actualPeriodFrom.getTime() > actualPeriodTo.getTime()) {
    throw new Error('invalid period filter')
  }

  return {
    tsFrom: new Date(new Date(actualPeriodFrom).setDate(1)),
    tsTo: actualPeriodTo,
  };
}
