const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Account = require('../models/account');

const AccountDetailCtrl = require('../controllers/accountDetail');

const {
  WellKnownJsonRes,
  JsonResWriter
} = require('../middleware/json-response-util');

const {
  BasicRead,
  BasicWrite,
} = require('../middleware/crud');

// Crud
exports.create = (req, res, next) => {
  Account.countDocuments({
      '$or': [{
        username: req.body.username
      }, {
        registration_email: req.body.registration_email
      }]
    }).exec()
    .then(totalConflicts => {
      if (totalConflicts > 0) {
        WellKnownJsonRes.conflict(res, {
          message: `Total conflicts occurred: ${totalConflicts}`
        });
        return;
      } else {
        bcrypt.hash(req.body.secret, 10, (err, hash) => {
          if (err) {
            WellKnownJsonRes.errorDebug(res, err);
          } else {
            const account = new Account({
              _id: new mongoose.Types.ObjectId,
              provider: req.body.provider,
              username: req.body.username,
              nickname: req.body.nickname,
              secret: hash,
              registration_email: req.body.registration_email,
              contact_email: req.body.contact_email
            });
            // set/overwrite readonly fields
            const now = new Date();
            const sysUser = '$$system';
            const sysRole = '$$admin';
            account.creator = sysUser;
            account.creator_ts = now;
            account.creator_role = sysRole;
            account.last_update_by = null;
            account.last_update_ts = null;
            account.last_updater_role = null;
            account.correlation_id = account._id;

            account.save()
              .then(createResult => {
                // to only create account: WellKnownJsonRes.created(res, createResult);
                // instead let's create empty account detail
                AccountDetailCtrl.init_by_account(res, createResult._id, createResult);
              })
              .catch(createError => {
                WellKnownJsonRes.errorDebug(res, createError);
              });
          }
        });
      }
    })
    .catch(readExistingAccountError => {
      WellKnownJsonRes.errorDebug(res, readExistingAccountError);
    });
};

// others/login
exports.login = (req, res, next) => {
  Account.findOne({
      username: req.body.username,
      enabled: true
    }).exec()
    .then(account => {
      if (!account) {
        WellKnownJsonRes.unauthorized(res, ['Auth failed'], {
          message: 'no account available as per request'
        });
        return res;
      }

      bcrypt.compare(req.body.secret, account.secret, (err, secretCompareSucceded) => {
        if (err) {
          WellKnownJsonRes.unauthorized(res, ['Auth failed'], {
            messages: ['password checking failed']
          });
          return res;
        }
        if (secretCompareSucceded) {
          const token = jwt.sign({
              _id: account._id,
              ['user-id']: account.correlation_id
            },
            process.env.JWT_KEY, {
              expiresIn: 14400 // 4h in seconds
            });
          new JsonResWriter(200)
            ._messages(['Auth succeeded for ' + req.body.username])
            ._add('token', token)
            .applyTo(res);
          return res;
        }
        WellKnownJsonRes.unauthorized(res, ['Auth failed']);
        return res;
      });
    })
    .catch(loginError => {
      WellKnownJsonRes.errorDebug(res, loginError);
    });
};

// others/login_info
exports.login_info = (req, res, next) => {
  const id = req.userData._id;

  BasicRead.byId(req, res, next, Account, id, { username: 1, nickname: 1, registration_email: 1 })
}

// others/login_refresh
exports.login_refresh = (req, res, next) => {
  const id = req.userData._id;
  const userId = jwt.decode(req.headers.authorization.split(" ")[1])['user-id']

  Account.findById(id).exec()
    .then(account => {
      if (!account) {
        WellKnownJsonRes.unauthorized(res, ['Refresh token failed'], {
          message: 'no account available as per request'
        });
        return res;
      }

      const token = jwt.sign({
        _id: account._id,
        ['user-id']: userId
      },
        process.env.JWT_KEY, {
        expiresIn: 7200 // 2h in seconds
      });

      new JsonResWriter(200)
        ._messages(['Auth succeeded for ' + req.body.username])
        ._add('token', token)
        .applyTo(res);
    })
    .catch(readError => {
      WellKnownJsonRes.errorDebug(res, readError);
    });
};

// others/enabled
exports.enabled = (req, res, next) => {
  const enabledValue = req.method === 'PUT'
  BasicWrite.update(req, res, next, Account, {
    username: req.params.accountId,
    enabled: !enabledValue
  }, {
    enabled: enabledValue
  });
};

// others/oblivion
exports.oblivion = (req, res, next) => {
  const id = req.userData._id;

  Account.remove({
      _id: id
    }).exec()
    .then(deleteResult => {
      AccountDetailCtrl.delete_by_account(res, id, deleteResult);
    })
    .catch(deleteError => {
      WellKnownJsonRes.errorDebug(res, deleteError);
    });
};

//
// utils

// cRud/existsById
exports.accountExistsById = (accountId) => {
  return new Promise((resolve, reject) => {
    Account.countDocuments({ _id: accountId }).exec()
    .then(countResult => {
      countResult === 0
        ? reject(new Error(`account '${accountId}' does not exist`))
        : resolve();
    })
    .catch(countError => {
      reject(countError)
    })
  });
}

// cRud/existsByUsername
exports.accountExistsByUsername = (username) => {
  return new Promise((resolve, reject) => {
    Account.countDocuments({ username: username }).exec()
    .then(countResult => {
      countResult === 0
        ? reject(new Error(`account with username '${username}' does not exist`))
        : resolve();
    })
    .catch(countError => {
      reject(countError)
    })
  });
}

exports.getCorrelationIdByUsername = (username) => {
  return new Promise((resolve, reject) => {
    Account.findOne({ username: username }, { 'correlation_id': 1 }).exec()
    .then(findOneResult => {
      if (!findOneResult) {
        reject(new Error(`account with username '${username}' does not exist`))
      }
      resolve(findOneResult['correlation_id'])
    })
    .catch(findOneError => {
      reject(findOneError)
    })
  });
}