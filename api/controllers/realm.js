const mongoose = require('mongoose');

const Realm = require('../models/realm');

const mongooseMixins = require('../middleware/mongoose-mixins')

//
// endpoint-related
// -> nothing for now

//
// utils

// cRud/existsByCorrelationIdAndAppName
exports.realmExistsByCorrelationIdAndAppName = (correlationId, appName, logic = true) => {
  return new Promise((resolve, reject) => {
    Realm.countDocuments({ 
      'correlation-id': correlationId,
      'app-name': appName,
    }).exec()
    .then(countResult => {
      countResult === 0
      ? logic 
        ? reject(new Error(`realm with correlationId '${correlationId}' and appName '${appName}' does not exist`))
        : resolve()
      : logic 
        ? resolve()
        : reject(new Error(`realm with correlationId '${correlationId}' and appName '${appName}' already exists`));
    })
    .catch(countError => {
      reject(countError)
    })
  });
}

// cRud/
exports.enrichUserDataWithPermissionsMeta = (userData = {}, logic = true) => {
  return new Promise((resolve, reject) => {
    // {
    //   const missingParams = new Set();
    //   if (!userData['user-id']) {
    //       missingParams.add('username');
    //   }
    //   if (!userData['app-name']) {
    //       missingParams.add('role');
    //   }
    //   if (missingParams.size !== 0) {
    //     reject(new Error(`missing required params: \'${[...missingParams].join('\', \'')}\'`))
    //   }
    // }

    const findOneFilter = {
      'correlation-id': new mongoose.Types.ObjectId(userData['user-id']),
      'app-name': userData['app-name']
    };

    Realm.findOne(findOneFilter)
      .select({ role: 1, groups: 1 })
      .exec()
      .then(findOneResult => {
        if (!findOneResult) {
          reject(new Error(`realm with correlationId '${findOneFilter['correlation-id']}' and appName '${findOneFilter['app-name']}' does not exist`));
        }
        userData.role = findOneResult.role;
        userData.groups = findOneResult.groups;    
        resolve();
      })
      .catch(findOneError => reject(findOneError));
  });
}

// Crud/activateUserWithRole
exports.activateUserWithRole = (userData, correlationId, appName, role) => {
  return Realm.create({
    _id: new mongoose.Types.ObjectId(),
    ...mongooseMixins.makeCreatorByUserData(userData),
    enabled: true,
    'correlation-id': correlationId,
    'app-name': appName,
    role: role,
    groups: []
  });
}
