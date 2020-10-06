const mongoose = require('mongoose');

const PlantPart = require('../models/plant-part');
const PartCtrl = require('./part');

const {
  WellKnownJsonRes,
  // JsonResWriter,
} = require('../../../../api/middleware/json-response-util');
const { 
  BasicRead,
  // BasicWrite,
} = require('../../../../api/middleware/crud');
const mongooseMixins = require('../../../../api/middleware/mongoose-mixins')


//
// endpoint-related

// cRud
exports.read_by_query = (req, res, next) => {
  BasicRead.all(req, res, next, Plant, req._q.filter, req._q.skip, req._q.limit, req._q.proj, req._q.sort);
};

// cRud/autocompleteOnPartLabel
exports.autocomplete = (req, res, next) => {
  BasicRead.autocomplete(req, res, next, Plant, 'part.label', req._q.filterAcSimple, req._q.filter, req._q.skip, req._q.limit, req._q.proj, req._q.sort);
};

// Crud
exports.create = (req, res, next) => {
  PartCtrl.part_read_by_id(req.body.part)
    .then((readByIdResult) => {
      const plantPart = new PlantPart({
        _id: new mongoose.Types.ObjectId(),
        //
        // set/overwrite readonly fields
        part: readByIdResult,
        //
        // set user fields
        quantity: req.body.quantity,
        info: req.body.info,
      });

      BasicWrite.create(req, res, next, plantPart);
    })
    .catch(readByIdError => {
      WellKnownJsonRes.conflict(res);
    });
};


//
// utils

// cRud/existsById
exports.plant_part_exists_by_id = plantId => {
  return new Promise((resolve, reject) => {
    PlantPart.countDocuments({ plant: plantId })
      .exec()
      .then(countResult => {
        countResult === 0
          ? reject(new Error(`part plant with plant id '${plantId}' does not exist`))
          : resolve();
      })
      .catch(countError => {
        reject(countError);
      });
  });
};
