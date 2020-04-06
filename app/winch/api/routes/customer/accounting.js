const express = require('express');
const router = express.Router();

const CustomerAccountingCtrl = require('../../controllers/customer/accounting');

const {
  WellKnownJsonRes
  // JsonResWriter,
} = require('../../../../../api/middleware/json-response-util');

const {
  json,
  text,
} = require('../../../../../api/middleware/check-accept-header');

const checkApiToken = (req, res, next) => {
  try {
    // TODO use process.env.WCH_AUTHZ_CUSTOMER_ACCOUNTING) {
    if (req.body['api-token'] !== 'fec89532-76ff-4896-9e6f-6aabdd57555b'
      && req.body['apiToken'] !== 'fec89532-76ff-4896-9e6f-6aabdd57555b'
      && req.headers['x-winch-esell-api-token'] !== 'fec89532-76ff-4896-9e6f-6aabdd57555b') {
      throw new Error('Unauthorized')
    }
    next();
  } catch (e) {
    // return res.status(401).json({
    //   status: 401,
    //   message: 'Unauthorized'
    // });
    WellKnownJsonRes.unauthorized(res);
  }
};


//
// public
// -> nothing for now

//
// dedicated-api-token-protected
router.get('/', checkApiToken, CustomerAccountingCtrl.user_status);

router.post('/credit', text, checkApiToken, CustomerAccountingCtrl.top_up_by_form);

router.post('/credit', json, checkApiToken, CustomerAccountingCtrl.top_up_by_rest);


module.exports = router;
