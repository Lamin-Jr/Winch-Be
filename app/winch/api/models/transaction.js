// [GP] MADE
const mongoose = require('mongoose');
const Double = require('@mongoosejs/double');

const mongooseMixins = require('../../../../api/middleware/mongoose-mixins')
const Customer = require('./customer')

const transactionSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    ...mongooseMixins.fullCrudActors,
    enabled: Boolean,
    payer: {
        label: {
            type: String,
            required: true,
        },
        customer: Customer.schema,
        sysid:{}, // cosa si mette
    },
    producer: {
        channel: {
            type: String,
            required: true
        },
        label: {
            type: String,
            required: true
        },
        id: {}, //
        sysid: {} // cosa si mette
    },
    payed: {
        amt: {
            type: Double,
            required: true
        },
        ccy: {
            type: String,
            required: true
        }
    }
}, {
    collection: 'transactions',
  ...mongooseMixins.fullCrudActorsTs
});

const model = require('../middleware/mongoose-db-conn').winchDBConn.model('Transaction', transactionSchema );

module.exports(model);