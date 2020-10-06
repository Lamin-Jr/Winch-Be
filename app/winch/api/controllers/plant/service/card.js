const mongoose = require('mongoose');

const PlantService = require('../../../models/plant-service');

const PlantCtrl = require('../../../controllers/plant');

const {
  // JsonObjectTypes,
  JsonObjectHelper,
} = require('../../../../../../api/lib/util/json-util');
const {
  WellKnownJsonRes,
  // JsonResWriter,
} = require('../../../../../../api/middleware/json-response-util');
const {
  BasicRead,
  // BasicWrite,
} = require('../../../../../../api/middleware/crud');
// const mongooseMixins = require('../../../../../api/middleware/mongoose-mixins');

const {
  buildPlantFilters,
} = require('../_shared')


//
// endpoint-related

// cRud/basic
exports.list = (req, res, next) => {
  const plantFilters = buildPlantFilters(req.body.filter);

  Promise.all([
    PlantService.countDocuments().exec(),
    PlantCtrl.filteredPlantIds(plantFilters.plantsFilter, plantFilters.plantsStatusFilter, plantFilters.plantsLocationsFilter),
  ])
    .then(promiseAllResult => {
      const countResult = promiseAllResult[0]
      const readResult = promiseAllResult[1]

      if (!countResult || !readResult.length) {
        WellKnownJsonRes.okMulti(res, countResult, [], req._q.skip, req._q.limit)
        return;
      }

      const readingsPlantIdsOrList = readResult.map(itemBody => itemBody._id);

      const localFilter = {
        '_id.m': readingsPlantIdsOrList.length == 1
          ? readingsPlantIdsOrList[0]
          : { $in: readingsPlantIdsOrList }
      }

      if (JsonObjectHelper.isEmpty(req._q.proj)) {
        req._q.proj = { __v: 0 };
      }

      BasicRead.all(req, res, next, PlantService, localFilter, req._q.skip, req._q.limit, req._q.proj, req._q.sort);
    })
    .catch(readError => WellKnownJsonRes.errorDebug(res, readError));
};


//
// private part

