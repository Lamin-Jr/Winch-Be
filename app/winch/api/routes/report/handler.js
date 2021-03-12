const express = require('express');
const router = express.Router();

const ReportHandlerCtrl = require('../../controllers/report/handler');

const checkAuth = require('../../../../../api/middleware/check-auth');
const retrieveUserProfile = require('../../../../../api/middleware/retrieve-user-profile');
const queryParser = require('../../../../../api/middleware/parse-query');

const setAppName = require('../../middleware/rest/set-app-name');


//
// public
// -> nothing for now

//
// token-protected
router.get('/list', checkAuth, setAppName, retrieveUserProfile, queryParser, ReportHandlerCtrl.list);
router.get('/detailed/:handlerId', checkAuth, setAppName, retrieveUserProfile, queryParser, ReportHandlerCtrl.detailed);


module.exports = router;
