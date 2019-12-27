exports.boot = () => {
  const mongoose = require('mongoose');
  const Realm = require('../api/models/realm');

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
};
