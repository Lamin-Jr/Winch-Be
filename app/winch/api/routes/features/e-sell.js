const express = require('express');
const router = express.Router();

const ESellCtrl = require('../../controllers/features/e-sell');

const {
  WellKnownJsonRes
  // JsonResWriter,
} = require('../../../../../api/middleware/json-response-util');

const checkApiToken = (req, res, next) => {
  try {
    // FIXME if (req.headers['x-winch-esell-api-token'] !== process.env.WCH_AUTHZ_SUPPLIERS_API_TOKEN) {
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
// token-protected
router.get('/stats', checkApiToken, ESellCtrl.api_stats);

router.get('/', checkApiToken, ESellCtrl.user_status);

router.post('/form', checkApiToken, ESellCtrl.top_up_by_form);

router.post('/json', checkApiToken, ESellCtrl.top_up_by_rest);


module.exports = router;
