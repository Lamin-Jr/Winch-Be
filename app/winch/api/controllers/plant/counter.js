const mongoose = require('mongoose');

// const Plant = require('../../models/plant');

const PlantCtrl = require('../../controllers/plant');

// const {
//   DateFormatter,
// } = require('../../../../../api/lib/util/formatter');
// const {
//   // JsonObjectTypes,
//   JsonObjectHelper,
// } = require('../../../../../api/lib/util/json-util');
const {
  WellKnownJsonRes,
  // JsonResWriter,
} = require('../../../../../api/middleware/json-response-util');
// const {
//   BasicRead,
//   // BasicWrite,
// } = require('../../../../../api/middleware/crud');
// const mongooseMixins = require('../../../../../api/middleware/mongoose-mixins');

const {
  buildPlantFiltersRepo
} = require('./_shared')


//
// endpoint-related

// cRud/basic
exports.eCustomers = (req, res, next) => {
  const plantFiltersRepo = buildPlantFiltersRepo(req.body.filter, true);

  PlantCtrl.filteredDriverPlants(plantFiltersRepo.plantsFilter, plantFiltersRepo.plantsStatusFilter, plantFiltersRepo.plantsLocationsFilter)
    .then(readResult => {
      if (!readResult.length) {
        WellKnownJsonRes.okSingle(res, {
          consuming: 0,
          working: 0,
        });
        return;
      } else if (readResult.length !== 1) {
        WellKnownJsonRes.notImplemented(res, 'unable to query more than one driver at once');
        return;
      }

      Object.assign(plantFiltersRepo.targetFilter, {
        '_id.m': readResult[0].plants.length == 1
          ? readResult[0].plants[0]
          : { $in: readResult[0].plants },
      });
      console.log(`PD TGTF: ${JSON.stringify(plantFiltersRepo.targetFilter)}`)

      // perform actual aggregation
      //
      const schema = require(`../../../api/schemas/readings/customer-daily-log`);
      const CustomerPeriodModel = require('../../middleware/mongoose-db-conn').driverDBConnRegistry
        .get(readResult[0]._id)
        .model(`CustomerDaily`, schema);
      const aggregation = CustomerPeriodModel.aggregate()
        .match(plantFiltersRepo.targetFilter)
        .group({
          _id: {
            ms: '$_id.ms',
            d: '$d'
          },
          consuming: {
            $sum: {
              $cond: [ { $gt: ["$es", 0.0] }, 1, 0 ]
            }
          },
          working: { $sum: 1 },
        })
        .group({
          _id: '$_id.d',
          consuming: { $sum: "$consuming" },
          working: { $sum: '$working' },
        })
        .sort({
          _id: 1,
        })
        //
        ;

      aggregation
        .then(readResult => {
          WellKnownJsonRes.okMulti(res, readResult.length, readResult);
        })
        .catch(readError => WellKnownJsonRes.errorDebug(res, readError));
    })
    .catch(readError => WellKnownJsonRes.errorDebug(res, readError));
};
