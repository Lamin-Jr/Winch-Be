const express = require('express');
const router = express.Router();

const PlantCardCtrl = require('../../controllers/plant/card');

const checkAuth = require('../../../../../api/middleware/check-auth');
const retrieveUserProfile = require('../../../../../api/middleware/retrieve-user-profile');
const queryParser = require('../../../../../api/middleware/parse-query');

const setAppName = require('../../middleware/rest/set-app-name');


//
// public
// -> nothing for now

//
// token-protected
router.post('/list', checkAuth, setAppName, retrieveUserProfile, queryParser, PlantCardCtrl.list);
router.post('/detailed', checkAuth, setAppName, retrieveUserProfile, queryParser, PlantCardCtrl.detailed);


module.exports = router;
