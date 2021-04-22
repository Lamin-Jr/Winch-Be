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

  let s2sSetupPromises = [];

  //
  // winchenergy.com
  {
    const target = 'winchenrgy.com';
    if (process.env.S2S_WINCHENERGY_COM_API_KEY) {
      s2sSetupPromises.push({
        target,
        promise: S2SCtrl.activateApiToken(process.env.S2S_WINCHENERGY_COM_API_KEY)
      });
    }
    else {
      console.error(`wrong S2S credentials setup for ${target}, fix it!`);
    }
  }

  //
  // OrangeSL
  {
    const target = 'OrangeSL';
    if (process.env.S2S_ORANGE_SL_API_KEY) {
      s2sSetupPromises.push({
        target,
        promise: S2SCtrl.activateApiToken(process.env.S2S_ORANGE_SL_API_KEY)
      });
    }
    else {
      console.error(`wrong S2S credentials setup for ${target}, fix it!`);
    }
  }

  //
  // Winch SL controller
  {
    const target = 'Winch SL controller';
    const signKeyRef = 'WCH_SL_CTRL';
    if (process.env.S2S_WCH_SL_CTRL_API_KEY
      && process.env.S2S_WCH_SL_CTRL_API_APP
      && process.env[S2SCtrl.buildSignKeyRef(signKeyRef)]) {
      s2sSetupPromises.push({
        target,
        promise: S2SCtrl.activateApiToken(process.env.S2S_WCH_SL_CTRL_API_KEY, {
          appName: process.env.S2S_WCH_SL_CTRL_API_APP,
          signKeyRef,
        })
      });
    }
    else {
      console.error(`wrong S2S credentials setup for ${target}, fix it!`);
    }
  }

  Promise.all(s2sSetupPromises.map(item => item.promise))
    .then(promiseAllResult => {
      promiseAllResult.forEach((activationResult, index) => {
        if (activationResult.exists) {
          console.warn(`S2S credentials for ${s2sSetupPromises[index].target} already activated, check compliance`);
        } else {
          console.log(`S2S credentials for ${s2sSetupPromises[index].target} activated`);
        }
      })

      S2SCtrl.checkTotalActivations(s2sSetupPromises.length)
        .then(checkResult => checkResult.ok
          ? console.log(`total ${s2sSetupPromises.length} S2S credentials activated`)
          : console.error(`found ${checkResult.total} rather than ${checkResult.expected} S2S credentials expected, fix it`))
        .catch(checkError => {
          console.error(`unable check total S2S credentials activation -> ${checkError}`);
        });
    })
    .catch(activationsError => {
      console.error(`unable to complete S2S credentials setup -> ${activationsError}`);
    });

};
