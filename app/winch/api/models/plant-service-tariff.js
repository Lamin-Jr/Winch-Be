const mongoose = require('mongoose');
const Double = require('@mongoosejs/double')

const {
  buildHistoryModel
} = require('../../../../api/middleware/mongoose-mixins')

const {
  plantServiceTariffIdSchema,
} = require('./shared/plant');


const plantServiceTariffSchema = mongoose.Schema({
  _id: plantServiceTariffIdSchema,
  ...buildHistoryModel(plantServiceTariffIdSchema),
  'unit-price': {
    amt: {
      type: Double,
      required: true,
    },
    ccy: {
      type: String,
      required: true,
    }
  },
  share: {
    ag: Double,
    op: Double,
  },
}, {
  collection: 'plants-services-tariffs',
  versionKey: false,
});

plantServiceTariffSchema.index({
  name: 1
}, {
  name: 'name-asc',
  background: true
});

const model = require('../middleware/mongoose-db-conn').winchDBConn.model('PlantServiceTariff', plantServiceTariffSchema);


module.exports = model;
