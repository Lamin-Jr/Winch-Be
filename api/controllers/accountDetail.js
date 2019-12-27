const mongoose = require('mongoose');

const AccountDetail = require('../models/accountDetail');

const {
  WellKnownJsonRes,
  JsonResWriter
} = require('../middleware/json-response-util');

const {
  JsonObjectHelper
} = require('../lib/util/json-util');

// Crud/byJWT
exports.create_by_jwt = (req, res, next) => {
  const id = req.userData._id;

  AccountDetail.findById(id).exec()
    .then(readResult => {
      if (readResult) {
        WellKnownJsonRes.created(res);
      } else {
        this.init_by_account(res, id);
      }
    })
    .catch(readError => {
      WellKnownJsonRes.errorDebug(res, readError);
    });
};

// cRud/byJWT
exports.read_one_by_jwt = (req, res, next) => {
  const id = req.userData._id;

  AccountDetail.findById(id).exec()
    .then(readResult => {
      if (readResult) {
        WellKnownJsonRes.okSingle(res, readResult);
      } else {
        WellKnownJsonRes.notFound(res);
      }
    })
    .catch(readError => {
      WellKnownJsonRes.errorDebug(res, readError);
    });
};

// crUd/byJWT
exports.update_one_by_jwt = (req, res, next) => {
  const id = req.userData._id;

  const updateFilter = {
    _id: id
  };
  const updateStatement = {
    $set: JsonObjectHelper.buildFlattenJson(req.body)
  };

  AccountDetail.update(updateFilter, updateStatement).exec()
    .then(updateResult => {
      WellKnownJsonRes.okSingle(res, updateFilter, 200, updateResult);
    })
    .catch(updateError => {
      WellKnownJsonRes.errorDebug(res, updateError);
    });
};

// others/init_by_account
exports.init_by_account = (res, id, parentDebug = undefined) => {
  const accountDetail = new AccountDetail({
    _id: id
  });

  accountDetail.save()
    .then(createResult => {
      WellKnownJsonRes.created(res, parentDebug);
    })
    .catch(createError => {
      WellKnownJsonRes.errorDebug(res, createError);
    });
};

// others/delete_by_account
exports.delete_by_account = (res, id, parentDebug = undefined) => {
  AccountDetail.remove({
      _id: id
    }).exec()
    .then(deleteResult => {
      WellKnownJsonRes._genericDebug(res, 200, parentDebug);
    })
    .catch(deleteError => {
      WellKnownJsonRes.errorDebug(res, deleteError);
    });

};
