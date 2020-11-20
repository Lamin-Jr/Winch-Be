const mongoose = require('mongoose');

const S2S = require('../models/s2s');

const mongooseMixins = require('../middleware/mongoose-mixins');

//
// endpoint-related
// -> nothing for now

//
// utils

// cRud/getByApiToken
exports.getByApiToken = (token) => {
  return S2S.findOne({ _id: token, }).exec();
}

// cRud/apiTokenExists
exports.apiTokenExists = (token, logic = true) => {
  return new Promise((resolve, reject) => {
    S2S.countDocuments({ _id: token, })
      .exec()
      .then((countResult) => {
        countResult === 0
          ? logic
            ? resolve(false)
            : resolve(true)
          : logic
            ? resolve(true)
            : resolve(false);
      })
      .catch((countError) => {
        reject(countError);
      });
  });
};

// Crud/activateApiToken
exports.activateApiToken = (token, options = {}) => {
  return new Promise((resolve, reject) => {
    const newToken = { _id: token };
    if (options.expiresAt) {
      newToken['expires-at'] = options.expiresAt;
    }
    if (options.appName && options.appName.length) {
      newToken['app-name'] = options.appName;
    }
    if (options.signKeyRef) {
      newToken['sign-key-ref'] = options.signKeyRef;
    }

    S2S.create(newToken)
      .then(createResult => resolve({
        created: true,
        createResult,
      }))
      .catch(createError => {
        createError.name === 'MongoError' && createError.code === 11000
          ? resolve({
            exists: true,
          })
          : reject(createError);
      });
  });
};

// cRud/checkTotalActivations
exports.checkTotalActivations = (expectedCount) => {
  return new Promise((resolve, reject) => {
    S2S.countDocuments().exec()
      .then(countResult => {
        const result = countResult === expectedCount;
        resolve({
          ok: result,
          expected: result ? undefined : expectedCount,
          total: result ? undefined : countResult,
        })
      })
      .catch(checkError => reject(checkError));
  });
}

exports.buildSignKeyRef = (target) => `S2S_${target.toUpperCase()}_SIGN_KEY`;