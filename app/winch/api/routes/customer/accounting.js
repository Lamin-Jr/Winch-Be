const express = require('express');
const router = express.Router();

const CustomerAccountingCtrl = require('../../controllers/customer/accounting');

const S2SCtrl = require('../../../../../api/controllers/s2s');

const checkAuth = require('../../../../../api/middleware/check-auth');
const retrieveUserProfile = require('../../../../../api/middleware/retrieve-user-profile');

const setAppName = require('../../middleware/rest/set-app-name');

const {
  WellKnownJsonRes
  // JsonResWriter,
} = require('../../../../../api/middleware/json-response-util');

const {
  json,
  text,
} = require('../../../../../api/middleware/check-accept-header');

const checkApiToken = (req, res, next) => {
  const apiTokenChecks = []
  // POST form body
  if (req.body['api-token']) {
    apiTokenChecks.push(S2SCtrl.apiTokenExists(req.body['api-token']/* TODO , true, req.userData['app-name'] */))
  }
  // POST json body
  if (req.body['apiToken']) {
    apiTokenChecks.push(S2SCtrl.apiTokenExists(req.body['apiToken']/* TODO , true, req.userData['app-name'] */))
  }
  // GET query param
  if (req.query['api_token']) {
    apiTokenChecks.push(S2SCtrl.apiTokenExists(req.query['api_token']/* TODO , true, req.userData['app-name'] */))
  }
  // GET header
  if (req.headers['x-winch-esell-api-token']) {
    apiTokenChecks.push(S2SCtrl.apiTokenExists(req.headers['x-winch-esell-api-token']/* TODO , true, req.userData['app-name'] */))
  }
  if (!apiTokenChecks.length) {
    WellKnownJsonRes.unauthorized(res);
    return;
  }
  Promise.all(apiTokenChecks)
    .then((outcomes) => {
      req.userData = {}
      next()
    })
    .catch((apiTokenChecksError) => {
      WellKnownJsonRes.unauthorized(res);
    })
};


//
// public
router.post('/subscriptions', checkAuth, setAppName, retrieveUserProfile, CustomerAccountingCtrl.subscribe);

// TODO decide if useful
// router.post('/subscriptions/channels', checkAuth, setAppName, retrieveUserProfile, CustomerAccountingCtrl.add_channel_to_subscription);
// router.delete('/subscriptions/channels', checkAuth, setAppName, retrieveUserProfile, CustomerAccountingCtrl.remove_channel_from_subscription);

// TODO decide if useful
// router.post('/subscriptions/messages/status', checkAuth, setAppName, retrieveUserProfile, CustomerAccountingCtrl.send_subscription_status);


//
// dedicated-api-token-protected
router.get('/', checkApiToken, setAppName, CustomerAccountingCtrl.user_status);

router.post('/credit', text, checkApiToken, setAppName, CustomerAccountingCtrl.top_up_by_form);

router.post('/credit', json, checkApiToken, setAppName, CustomerAccountingCtrl.top_up_by_rest);


module.exports = router;
