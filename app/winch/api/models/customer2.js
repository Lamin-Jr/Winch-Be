const mongoose = require('mongoose');

const mongooseMixins = require('../../../../api/middleware/mongoose-mixins')

const customer2Schema = mongoose.Schema({
  _id: String,
  driver: {
    type: String,
    required: true,
  },
  meter: {
    type: String,
    required: true,
  },
  plant: {
    type: String,
    required: true,
  },
  pod: {
    type: String,
    required: true,
  },
  service: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
  },
  cid: {
    type: String,
    required: true,
  },
  commCat: {
    type: String,
    required: true,
  },
  contacts: {
    type: Array,
    items: {
      type: Object,
      properties: {
        ...mongooseMixins.makeContactModel(),
        verified: Boolean,
      },
    }
  },
  fullName: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  hasReadings: {
    type: Boolean,
    required: true,
  },
  lastUpdate: {
    type: Date,
    required: true,
  },
  tariff: {
    type: Object,

  },
  tsFrom: {
    type: Date,
    required: true,
  },
  tsTo: Date,
}, {
  collection: 'customers2',
});

// customer2Schema.index({
//   meter: 1,
// }, {
//   name: 'meter-asc',
//   background: true,
// });
customer2Schema.index({
  plant: 1,
}, {
  name: 'plant-asc',
  background: true,
});
// customer2Schema.index({
//   pod: 1,
// }, {
//   name: 'pod-asc',
//   background: true,
// });
// customer2Schema.index({
//   commCat: 1,
// }, {
//   name: 'comm-cat-asc',
//   background: true,
// });


const model = require('../middleware/mongoose-db-conn').winchDBConn.model('Customer2', customer2Schema);


module.exports = model;
