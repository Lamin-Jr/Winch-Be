exports.boot = () => {
  const mongoose = require('mongoose');
  const Realm = require('../api/models/realm');
  const S2SCtrl = require('../api/controllers/s2s');

  const mongooseMixins = require('../api/middleware/mongoose-mixins')

  //
  // init constant-value fields
  const baseJson = {
    enabled: true,
    ...mongooseMixins.makeCreator(new mongoose.Types.ObjectId(process.env.WCH_AUTHZ_SYSTEM_ID), process.env.WCH_AUTHZ_SYSTEM_ROLE)
  };

  let filterCheck;

  //
  // admin@winch
  filterCheck = {
    role: process.env.WCH_AUTHZ_ADMIN_ROLE,
    'app-name': 'winch'
  };
  Realm.countDocuments(filterCheck)
    .exec()
    .then(countResult => {
      if (countResult !== 0) {
        console.log(`${filterCheck.role}@${filterCheck['app-name']} check succeeded`);
      } else {
        const winchAdminRealm = new Realm({
          _id: new mongoose.Types.ObjectId(),
          'correlation-id': new mongoose.Types.ObjectId(process.env.WCH_AUTHZ_ADMIN_ID)
        });

        // set/overwrite readonly fields
        Object.assign(winchAdminRealm, baseJson);

        // set other fields
        Object.assign(winchAdminRealm, filterCheck);
        winchAdminRealm.groups = [];

        winchAdminRealm
          .save()
          .then(createResult => {
            console.log(`${winchAdminRealm['correlation-id']} is now ${filterCheck.role}@${filterCheck['app-name']}`
            );
          })
          .catch(createError => {
            console.error(`unable to assign ${filterCheck.role}@${filterCheck['app-name']}: ${createError}`);
          });
      }
    })
    .catch(countError => {
      console.error(`unable to check ${filterCheck.role}@${filterCheck['app-name']}: ${countError}`);
    });

  //
  // OrangeSL API token
  const orangeSlApiToken = 'fec89532-76ff-4896-9e6f-6aabdd57555b'
  S2SCtrl.activateApiToken(orangeSlApiToken)
  .then((createResult) => { 
    console.log(`API Token ${orangeSlApiToken} activated`)
  })
  .catch(activationError => {
    console.error(`unable to create API Token ${orangeSlApiToken}: ${activationError}`);
  });

};
