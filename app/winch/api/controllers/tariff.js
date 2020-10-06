const mongoose = require('mongoose');

const Tariff = require('../models/tariff');
const PlantCtrl = require('./plant');

// const {
  // WellKnownJsonRes,
  // JsonResWriter,
// } = require('../../../../api/middleware/json-response-util');
const { BasicRead, BasicWrite } = require('../../../../api/middleware/crud');
const mongooseMixins = require('../../../../api/middleware/mongoose-mixins')


//
// endpoint-related

// cRud
exports.read_by_query = (req, res, next) => {
  BasicRead.all(req, res, next, Tariff, req._q.filter, req._q.skip, req._q.limit, req._q.proj, req._q.sort);
};

// cRud/autocompleteOnName
exports.autocomplete = (req, res, next) => {
  BasicRead.autocomplete(req, res, next, Tariff, 'name', req._q.filterAcSimple, req._q.filter, req._q.skip, req._q.limit, req._q.proj, req._q.sort);
};


// Crud
exports.create = (req, res, next) => {
  PlantCtrl.plantExistsById(req.body.plant)
    .then(() => {
      const id = new mongoose.Types.ObjectId();
      const now = new Date();
      const tariff = new Tariff({
        _id: id,
        //
        // set/overwrite readonly fields
        ...mongooseMixins.makeCreatorByUserData(req.userData),
        ...mongooseMixins.makeHistoryOnCreate(now, id),
        //
        // set user fields
        name: req.body.name,
        currency: req.body.currency,
        validity: req.body.validity,
        'conn-fee': req.body['conn-fee'],
        base: req.body.base,
        volumes: req.body.volumes,
        'standing-charge': req.body['standing-charge'],
        limit: req.body.limit,
        plant: req.body.plant,
      });

      BasicWrite.create(req, res, next, tariff);
    })
    .catch(checkError => {
      WellKnownJsonRes.conflict(res);
    })
};
