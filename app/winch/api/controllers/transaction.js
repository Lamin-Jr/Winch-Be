// [GP] MADE
const mongoose = require('mongoose');

const Transaction = require('../models/transaction');

const { BasicRead, BasicWrite } = require('../../../../api/middleware/crud');
const mongooseMixins = require('../../../../api/middleware/mongoose-mixins');

// cRud
exports.read_by_query = (req, res, next) => {
    BasicRead.all(req, res, next, Transaction, req._q.filter, req._q.skip, req._q.limit, req._q.proj, req._q.sort);
};

// cRud/autocompleteOnName
exports.autocomplete = (req, res, next) => {
    BasicRead.autocomplete(req, res, next, Transaction, '_id', req._q.filterAcSimple, req._q.filter, req._q.skip, req._q.limit, req._q.proj, req._q.sort);
};


// Crud
exports.create = (req, res, next) => {
    const id = new mongoose.Types.ObjectId();
    const transact = new Transaction({
        _id: id,
        ...mongooseMixins.makeCreatorByUserData(req.userData),
        ...mongooseMixins.makeHistoryOnCreate(now, id),
        payer: {
            label: req.body.payerLabel,
            customer: {}
        },
        
        producer: {
            channel: req.body.producerChannel,
            label: req.body.producerLabel,
            id: {}, //
            sysid: {} // cosa si mette
        },
        payed: {
            amt: req.body.payedAmt,
            ccy: req.body.payedCcy
        }

    })

   
};
