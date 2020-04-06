const mongoose = require('mongoose');

// const { 
//   // JsonObjectTypes,
//   JsonObjectHelper, 
// } = require('../../../../api/lib/util/json-util');
const {
  WellKnownJsonRes,
  // JsonResWriter,
} = require('../../../../api/middleware/json-response-util');
// const { 
//   BasicRead,
//   BasicWrite,
// } = require('../../../../api/middleware/crud');


//
// endpoint-related

// cRud/byMarkerId
exports.read_by_marker_id = (req, res, next) => {
  const missingParams = new Set();
  if (!req.body.filter) {
    missingParams.add('filter');
  } else {
    if (!req.body.filter['driver']) {
      missingParams.add('driver');
    }
    if (!req.body.filter['plant']) {
      missingParams.add('plant');
    }
  }
  if (missingParams.size !== 0) {
      WellKnownJsonRes.error(res, 400, [`missing required params: \'${[...missingParams].join('\', \'')}\'`]);
      return;
  }

  // select driver db key and site
  //
  const mongooseDbConn = require('../middleware/mongoose-db-conn');
  const driverDbKey = req.body.filter['driver'];
  const schemaDriverConf = require(`../schemas/readings/gen-reading-conf`);
  const DriverConf = mongooseDbConn.driverDBConnRegistry
    .get(driverDbKey)
    .model(`DriverConf`, schemaDriverConf);

  DriverConf.find({
    'plant.id': req.body.filter['plant']
  })
    .select({ '_id': 1 })
    .exec()
    .then(findDriverResult => {
      if (!findDriverResult.length) {
        WellKnownJsonRes.okMulti(res);
        return;
      }

      return Promise.all([
        new Promise((resolve) => {
          resolve(findDriverResult[0]._id.split('/')[1]);
        }),
        // ExchangeRateCtrl.exchange_rate_by_id(findDriverResult[0].site.ccy.concat('/USD'), { rate: 1 })
      ]);
    })
    .then(promiseAllResult => {
      // perform actual query
      //
      const driverDbSite = promiseAllResult[0];
      const schemaMeterMarker = require('../schemas/readings/meter-marker');
      const MeterMarker = mongooseDbConn.driverDBConnRegistry
        .get(driverDbKey, driverDbSite)
        .model(`MeterMarker`, schemaMeterMarker);

      MeterMarker.find({
        '_id.mkr': req.params['markerId'],
        ...req._q.filter,
      })
        .select(req._q.proj)
        .skip(req._q.skip)
        .limit(req._q.limit)
        .sort(req._q.sort)
        .exec()
        .then(findMeterMarkersResult => {
          WellKnownJsonRes.okMulti(res, findMeterMarkersResult.length, findMeterMarkersResult);
        });
    })
    .catch(readError => {
      WellKnownJsonRes.error(res, 500, [ `error encountered on retrieving meter markers`, readError.message ]);
      return;
    });
};
