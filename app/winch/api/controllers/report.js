const mongoose = require('mongoose');

const Report = require('../models/report');

// const { 
// JsonObjectTypes,
// JsonObjectHelper, 
// } = require('../../../../api/lib/util/json-util');
const {
  WellKnownJsonRes,
  // JsonResWriter,
} = require('../../../../api/middleware/json-response-util');
const {
  BasicRead,
  // BasicWrite,
} = require('../../../../api/middleware/crud');


//
// endpoint-related

// cRud
exports.read_by_query = (req, res, next) => {
  BasicRead.all(req, res, next, Report, req._q.filter, req._q.skip, req._q.limit, req._q.proj, req._q.sort);
};

// // cRud/autocompleteOnDefaultName
// exports.autocomplete = (req, res, next) => {
//   // TODO
//   // BasicRead.autocomplete(req, res, next, Report, 'fullName', req._q.filterAcSimple, req._q.filter, req._q.skip, req._q.limit, req._q.proj, req._q.sort);
// };

// // Crud
// exports.create = (req, res, next) => {
//   // TODO
//   // const report = new Report({
//   // });

//   // BasicWrite.create(req, res, next, report);
// };

// notifyById
exports.notify_by_id = (req, res, next) => {
  Report.findOne({
    _id: req.params.reportId
  }).exec()
    .then((readResult) => {
      if (!readResult) {
        WellKnownJsonRes.notFound(res);
        return;
      }
      if (!readResult.handler || !readResult.handler.name) {
        WellKnownJsonRes.error(res, 500, ['invalid template recipe']);
        return;
      }
      readResult.handler.params = {
        // merge request body first
        ...(req.body || {}),
        // override request body with value from db
        ...(readResult.handler.params || {}),
        notifications: [...(readResult['notifications'] || [])],
      }
      const reportRecipeHandlersRegistry = require('../middleware/report-recipe-handlers-registry');
      reportRecipeHandlersRegistry
        .handle(readResult.handler.name, readResult.handler.params)
        .then(() => {
          WellKnownJsonRes.created(res);
        })
        .catch(handleError => {
          WellKnownJsonRes.errorDebug(res, handleError);
        });
    })
    .catch((readError) => {
      WellKnownJsonRes.errorDebug(res, readError);
    })
};

//
// utils

// // cRud/existsById
// exports.report_exists_by_id = (reportId) => {
//   return new Promise((resolve, reject) => {
//     Report.countDocuments({ _id: reportId }).exec()
//     .then(countResult => {
//       countResult === 0
//         ? reject(new Error(`report '${reportId}' does not exist`))
//         : resolve();
//     })
//     .catch(countError => {
//       reject(countError)
//     })
//   });
// }
