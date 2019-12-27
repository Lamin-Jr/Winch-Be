const mongoose = require('mongoose');

const PlantGenerationLog = require('../models/plant-generation-log');
// FIXME const PlantCtrl = require('./plant');

const {
  WellKnownJsonRes,
  // JsonResWriter,
} = require('../../../../api/middleware/json-response-util');
const { 
  BasicRead,
  // FIXME BasicWrite,
} = require('../../../../api/middleware/crud');

//
// endpoint-related

// cRud
exports.read_by_query = (req, res, next) => {
  BasicRead.all(req, res, next, PlantGenerationLog, req._q.filter, req._q.skip, req._q.limit, req._q.proj, req._q.sort);
};

// Crud
exports.create = (req, res, next) => {
  const plantId = req.params.plantId;
  if (!plantId) {
    // this is a bug
    WellKnownJsonRes.error(res);
    return;
  }

  WellKnownJsonRes.error(res, 501);
  // FIXME here old model is considered
  // PlantCtrl.plant_exists_by_id(plantId)
  // .then(() => {
  //   const plantGenerationLog = new PlantGenerationLog({
  //     _id: new mongoose.Types.ObjectId(),
  //     'ts-measure': req.body['ts-measure'],
  //     irradiance: req.body.irradiance,
  //     'ambient-temperature': req.body['ambient-temperature'],
  //     'internal-temperature': req.body['internal-temperature'],
  //     'soc-batteries': req.body['soc-batteries'],
  //     'battery-voltage': req.body['battery-voltage'],
  //     'battery-temperature': req.body['battery-temperature'],
  //     'energy-delivered': req.body['energy-delivered'],
  //     'energy-generated': req.body['energy-generated'],
  //     'modules-temperature': req.body['modules-temperature'],
  //     'current-from-batteries': req.body['current-from-batteries'],
  //     'current-to-batteries': req.body['current-to-batteries'],
  //     'energy-air-conditioning-subsystem': req.body['energy-air-conditioning-subsystem'],
  //     'energy-fan': req.body['energy-fan'],
  //     'self-consumption': req.body['self-consumption'],
  //   });
  
  //   BasicWrite.create(req, res, next, plantGenerationLog);
  // })
  // .catch(checkError => {
  //   WellKnownJsonRes.conflict(res);
  // });
};
