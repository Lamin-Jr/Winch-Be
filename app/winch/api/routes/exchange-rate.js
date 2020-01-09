const express = require('express');
const router = express.Router();

const exchangeRateCtrl = require('../controllers/exchange-rate');

const checkAuth = require('../../../../api/middleware/check-auth');
// const retrieveUserProfile = require('../../../../api/middleware/retrieve-user-profile');
const queryParser = require('../../../../api/middleware/parse-query');

// const setAppName = require('../middleware/set-app-name');

router.get('/', checkAuth, queryParser, exchangeRateCtrl.read_by_query)


module.exports = router;