const mongoose = require('mongoose');

const S2S = require('../models/s2s');

const mongooseMixins = require('../middleware/mongoose-mixins');

//
// endpoint-related
// -> nothing for now

//
// utils

// cRud/exists
exports.apiTokenExists = (token, logic = true, appName = undefined) => {
  return new Promise((resolve, reject) => {
    const countQuery = appName
      ? {
          _id: token,
          'app-names': { $eq: appName },
        }
      : {
          _id: token,
          'app-names': { $exists: false }
        };
    S2S.countDocuments(countQuery)
      .exec()
      .then((countResult) => {
        countResult === 0
          ? logic
            ? reject(new Error(`api token '${token}' does not exist`))
            : resolve()
          : logic
          ? resolve()
          : reject(new Error(`api token '${token}' already exists`));
      })
      .catch((countError) => {
        reject(countError);
      });
  });
};

// Crud/activateApiToken
exports.activateApiToken = (token, expiresAt = undefined, appNames = undefined) => {
  return new Promise((resolve, reject) => {
    this.apiTokenExists(token, false)
      .then(() => {
        return new Promise((resolve /*, reject*/) => {
          const newToken = { _id: token };
          if (expiresAt) {
            newToken['expires-at'] = expiresAt;
          }
          if (appNames && appNames.length) {
            newToken['app-names'] = appNames;
          }
          resolve(newToken);
        });
      })
      .then((newToken) => resolve(S2S.create(newToken)))
      .catch((activationError) => {
        reject(activationError);
      });
  });
};
