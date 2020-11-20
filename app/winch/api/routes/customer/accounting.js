const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');

const CustomerAccountingCtrl = require('../../controllers/customer/accounting');

const S2SCtrl = require('../../../../../api/controllers/s2s');

const {
  WellKnownJsonRes
  // JsonResWriter,
} = require('../../../../../api/middleware/json-response-util');


const checkApiToken = (req, res, next) => {
  const apiTokenChecks = [];
  // POST json body
  if (req.is('application/json') && req.body['apiKey']) {
    req.userData = {
      'api-token': req.body['apiKey'],
    }
    apiTokenChecks.push(S2SCtrl.apiTokenExists(req.body['apiKey']))
  }
  // POST form body
  if (req.is('application/x-www-form-urlencoded') && req.body['api_key']) {
    req.userData = {
      'api-token': req.body['api_key'],
    }
    apiTokenChecks.push(S2SCtrl.apiTokenExists(req.body['api_key']));
  }
  if (apiTokenChecks.length !== 1) {
    WellKnownJsonRes.unauthorized(res);
    return;
  }
  apiTokenChecks[0]
    .then(apiTokenCheckResult => {
      if (apiTokenCheckResult === false) {
        WellKnownJsonRes.unauthorized(res);
        return;
      }
      S2SCtrl.getByApiToken(req.userData['api-token'])
        .then(s2sCredential => {
          req.userData['app-name'] = s2sCredential['app-name'];
          req.userData['sign-key-ref'] = s2sCredential['sign-key-ref'];
          next();
        })
        .catch(apiTokenReadError => {
          WellKnownJsonRes.error(res, 500, ['unable to retrieve credentials']);
        })
    })
    .catch(apiTokenChecksError => {
      WellKnownJsonRes.unauthorized(res);
    })
};

const decodeRequest = (req, res, next) => {
  try {
    req.userData['decoded-req'] = jwt.verify(req.body.req, process.env[S2SCtrl.buildSignKeyRef(req.userData['sign-key-ref'])]);
    next();
  } catch (error) {
    WellKnownJsonRes.error(res, 400, ['invalid request']);
  }
}

const dispatchRequest = (req, res, next) => {
  const opMapping = {
    status: 'user_status',
  }
  req.userData['ctrl-method-ref'] = opMapping[req.userData['decoded-req'].op]

  if (!CustomerAccountingCtrl[req.userData['ctrl-method-ref']]) {
    WellKnownJsonRes.error(res, 400, ['invalid request']);
    return;
  }

  CustomerAccountingCtrl[req.userData['ctrl-method-ref']](req, res, next);
}

//
// dedicated-api-token-protected
router.post('/', checkApiToken, decodeRequest, dispatchRequest);


module.exports = router;
