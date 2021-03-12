const express = require('express');
const router = express.Router();

const ReportTemplateCtrl = require('../../controllers/report/template');

const checkAuth = require('../../../../../api/middleware/check-auth');
const retrieveUserProfile = require('../../../../../api/middleware/retrieve-user-profile');

const setAppName = require('../../middleware/rest/set-app-name');


//
// public
// -> nothing for now

//
// token-protected
router.post('/', checkAuth, setAppName, retrieveUserProfile, ReportTemplateCtrl.upload);
router.get('/', checkAuth, setAppName, retrieveUserProfile, ReportTemplateCtrl.list);
router.get('/:templateId', checkAuth, setAppName, retrieveUserProfile, ReportTemplateCtrl.download);


module.exports = router;
