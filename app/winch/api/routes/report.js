const express = require('express');
const router = express.Router();

const ReportCtrl = require('../controllers/report');

const checkAuth = require('../../../../api/middleware/check-auth');
const retrieveUserProfile = require('../../../../api/middleware/retrieve-user-profile');
const queryParser = require('../../../../api/middleware/parse-query');

const setAppName = require('../middleware/rest/set-app-name');


//
// public
// -> nothing for now


//
// token-protected
router.post('/generation', checkAuth, setAppName, retrieveUserProfile, queryParser, ReportCtrl.generation);
router.post('/delivery', checkAuth, setAppName, retrieveUserProfile, queryParser, ReportCtrl.delivery);


module.exports = router;
