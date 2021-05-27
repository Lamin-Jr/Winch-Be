const express = require('express');
const router = express.Router();

const ReportSessionCtrl = require('../../controllers/report/session');

const checkAuth = require('../../../../../api/middleware/check-auth');
const retrieveUserProfile = require('../../../../../api/middleware/retrieve-user-profile');

const setAppName = require('../../middleware/rest/set-app-name');


//
// public
// -> nothing for now

//
// token-protected
router.get('/', checkAuth, setAppName, retrieveUserProfile, ReportSessionCtrl.list);
router.get('/:sessionId', checkAuth, setAppName, retrieveUserProfile, ReportSessionCtrl.list);

module.exports = router;
