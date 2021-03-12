const mongoose = require('mongoose');

const Report = require('../../models/report');

// const { 
// JsonObjectTypes,
// JsonObjectHelper, 
// } = require('../../../../../api/lib/util/json-util');
const {
  WellKnownJsonRes,
  // JsonResWriter,
} = require('../../../../../api/middleware/json-response-util');
// const {
//   BasicRead,
//   BasicWrite,
// } = require('../../../../../api/middleware/crud');


//
// endpoint-related

// notifyByHandlerId
exports.notify_by_handler_id = (req, res, next) => {
  Report.findOne({
    _id: req.params.handlerId
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
      const reportRecipeHandlersRegistry = require('../../middleware/report-recipe-handlers-registry');
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
