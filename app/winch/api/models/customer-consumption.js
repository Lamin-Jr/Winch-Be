const mongoose = require('mongoose');
const Double = require('@mongoosejs/double')

const customerConsumptionSchema = mongoose.Schema({
  _id: String,
  credit: Double,
  'e-sold-kwh-daily-avg': Double,
  'e-sold-local-ccy-daily-avg': Double,
  'e-sold-target-ccy-daily-avg': Double,
  'local-ccy': String,
  'e-sold-kwh-monthly-avg': Double,
  'e-sold-local-ccy-monthly-avg': Double,
  'e-sold-target-ccy-monthly-avg': Double,
}, { 
  collection: 'customers-consumption',
});


const model = require('../middleware/mongoose-db-conn').winchDBConn.model('CustomerConsumption', customerConsumptionSchema);


module.exports = model;
