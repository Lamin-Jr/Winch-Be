const express = require('express');
const router = express.Router();

const PlantServiceCardCtrl = require('../../../controllers/plant/service/card');

const checkAuth = require('../../../../../../api/middleware/check-auth');
const retrieveUserProfile = require('../../../../../../api/middleware/retrieve-user-profile');
const queryParser = require('../../../../../../api/middleware/parse-query');

const setAppName = require('../../../middleware/rest/set-app-name');


//
// public
// -> nothing for now

//
// token-protected
router.post('/list', checkAuth, setAppName, retrieveUserProfile, queryParser, PlantServiceCardCtrl.list);


module.exports = router;
