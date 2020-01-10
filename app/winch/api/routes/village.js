const express = require('express');
const router = express.Router();

const VillageCtrl = require('../controllers/village');

const checkAuth = require('../../../../api/middleware/check-auth');
const retrieveUserProfile = require('../../../../api/middleware/retrieve-user-profile');
const queryParser = require('../../../../api/middleware/parse-query');

const setAppName = require('../middleware/rest/set-app-name');


//
// public
router.get('/', queryParser, VillageCtrl.read_by_query);

router.get('/autocomplete', queryParser, VillageCtrl.autocomplete);

//
// token-protected
router.post('/', checkAuth, setAppName, retrieveUserProfile, VillageCtrl.create);

// router.patch('/', checkAuth, setAppName, retrieveUserProfile, queryParser, VillageCtrl.update);

// router.put('/', checkAuth, setAppName, retrieveUserProfile, queryParser, VillageCtrl.replace);

// router.delete('/', checkAuth, setAppName, retrieveUserProfile, VillageCtrl.delete_by_query);


module.exports = router;
