const mongoose = require('mongoose');
const Double = require('@mongoosejs/double')

const mongooseMixins = require('../../../../api/middleware/mongoose-mixins')

const exchangeRateSchema = mongoose.Schema({
    _id: {
        type: String,
        match: /[A-Z]{3}\/[A-Z]{3}/
    },
    rate: {
        type: Double,
        required: true
    },
    validity: {
        from: {
            type: Date,
            required: true,
            default: new Date()
        },
        to: {
            type: Date,
            required: true,
            default: new Date(process.env.DATE_MAX)
        }
    }
}, {
    collection: 'exchange-rates',
    ...mongooseMixins.fullCrudActorsTs,
})

const model = require('../middleware/mongoose').model('ExchangeRate', exchangeRateSchema);


module.exports = model;