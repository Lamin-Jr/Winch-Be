const mongoose = require('mongoose');

const Part = require('./part');

const plantPartSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  'plant':  {
    type: String,
    required: true
  },
  qty: { 
    type: Number,
    required: true
  },
  part: {
    type: Part.schema,
    required: true
  },
  info: {
    type: Array,
    items: {
      serial: String,
      warrantyExpiration: Date
    }
  }
}, { 
  collection: 'plants-parts'
});

plantPartSchema.index({
  plantId: 1,
}, {
  name: 'plant-asc',
  background: true
});
plantPartSchema.index({
  'part._id': 1,
}, {
  name: 'part_id-asc',
  background: true
});

const model = require('../middleware/mongoose').model('PlantPart', plantPartSchema);


module.exports = model;
