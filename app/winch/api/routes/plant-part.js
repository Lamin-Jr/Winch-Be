const express = require('express');
const router = express.Router();

const PlantPartCtrl = require('../controllers/plant-part');

const checkAuth = require('../../../../api/middleware/check-auth');
const retrieveUserProfile = require('../../../../api/middleware/retrieve-user-profile');
const queryParser = require('../../../../api/middleware/parse-query');

const setAppName = require('../middleware/rest/set-app-name');


//
// public
router.get('/', queryParser, PlantPartCtrl.read_by_query);

router.get('/autocomplete', queryParser, PlantPartCtrl.autocomplete);

//
// token-protected
router.post('/', checkAuth, setAppName, retrieveUserProfile, PlantPartCtrl.create);

// router.patch('/', checkAuth, setAppName, retrieveUserProfile, queryParser, PlantPartCtrl.update);

// router.put('/', checkAuth, setAppName, retrieveUserProfile, queryParser, PlantPartCtrl.replace);

// router.delete('/', checkAuth, setAppName, retrieveUserProfile, PlantPartCtrl.delete_by_query);


module.exports = router;
