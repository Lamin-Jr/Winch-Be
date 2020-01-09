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
  PlantCtrl.plant_exists_by_id(req.body.plant)
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
        validity: req.body.validity, // new date
        'conn-fee': req.body.connfee, // cost: {double}
        base: req.body.base, // this contain flat { const: double, amount: double, unit: string}
        volumes: req.body.volumes, // array json data volume [{form: double, to: double, factor: double }]
        'standing-charge': req.body.standing, // cost: double, amount: double, unit: string, 'allow-overbooking': boolean, 'cycle-start': number
        'limit': req.body.limit, // e: {daily: double} , p: {flat: { max: double}, scheduled: [{from: string, to: string, max: double}]} 
        plant: req.body.plant
      });

      BasicWrite.create(req, res, next, tariff);
    })
    .catch(checkError => {
      WellKnownJsonRes.conflict(res);
    })
};
