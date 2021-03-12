const express = require('express');
const router = express.Router();

const ReportNotificationCtrl = require('../../controllers/report/notification');

const checkAuth = require('../../../../../api/middleware/check-auth');
const retrieveUserProfile = require('../../../../../api/middleware/retrieve-user-profile');

const setAppName = require('../../middleware/rest/set-app-name');


//
// public
// -> nothing for now

//
// token-protected
router.post('/:handlerId', checkAuth, setAppName, retrieveUserProfile, ReportNotificationCtrl.notify_by_handler_id);


module.exports = router;
