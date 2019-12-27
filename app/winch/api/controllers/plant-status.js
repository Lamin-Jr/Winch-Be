const mongoose = require('mongoose');

const PlantStatus = require('../models/plant-status');
const PlantCtrl = require('./plant');

const {
  WellKnownJsonRes,
  // JsonResWriter,
} = require('../../../../api/middleware/json-response-util');
const { 
  BasicRead,
  BasicWrite,
} = require('../../../../api/middleware/crud');


//
// endpoint-related

// cRud
exports.read_by_query = (req, res, next) => {
  BasicRead.all(req, res, next, PlantStatus, req._q.filter, req._q.skip, req._q.limit, req._q.proj, req._q.sort);
};

// cRud/byPlantId
exports.read_by_plant_id = (req, res, next) => {
  const plantId = req.params.plantId;
  if (!plantId) {
    // this is a bug
    WellKnownJsonRes.error(res);
    return;
  }

  BasicRead.byId(req, res, next, PlantStatus, plantId, req._q.proj)
};

// Crud
exports.create = (req, res, next) => {
  const plantId = req.params.plantId;
  if (!plantId) {
    // this is a bug
    WellKnownJsonRes.error(res);
    return;
  }

  PlantCtrl.plant_exists_by_id(plantId)
  .then(() => {
    const plantStatus = new PlantStatus({
      _id: plantId,
      status: req.body.status,
      messages: req.body.messages
    });
  
    BasicWrite.create(req, res, next, plantStatus);
  })
  .catch(checkError => {
    WellKnownJsonRes.conflict(res);
  });
};

// crUd/byPlantId
exports.update_by_plant_id = (req, res, next) => {
  const plantId = req.params.plantId;
  if (!plantId) {
    // this is a bug
    WellKnownJsonRes.error(res);
    return;
  }

  const updateBody = {
    _id: plantId,
    status: req.body.status,
    messages: req.body.messages
  };

  BasicWrite.updateByIdInMemory(req, res, next, PlantStatus, updateBody)
}