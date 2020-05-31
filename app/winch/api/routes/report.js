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
router.get('/', checkAuth, setAppName, retrieveUserProfile, queryParser, ReportCtrl.read_by_query);

// router.get('/autocomplete', checkAuth, setAppName, retrieveUserProfile, queryParser, ReportCtrl.autocomplete);

// router.post('/', checkAuth, setAppName, retrieveUserProfile, ReportCtrl.create);

// router.patch('/', checkAuth, setAppName, retrieveUserProfile, queryParser, ReportCtrl.update);

// router.put('/', checkAuth, setAppName, retrieveUserProfile, queryParser, ReportCtrl.replace);

// router.delete('/', checkAuth, setAppName, retrieveUserProfile, ReportCtrl.delete_by_query);

router.post('/:reportId/notifications', checkAuth, setAppName, retrieveUserProfile, ReportCtrl.notify_by_id);


module.exports = router;
