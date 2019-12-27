const express = require('express');
const router = express.Router();

const PlantCtrl = require('../controllers/plant');
const PlantStatusCtrl = require('../controllers/plant-status');

const checkAuth = require('../../../../api/middleware/check-auth');
const retrieveUserProfile = require('../../../../api/middleware/retrieve-user-profile');
const queryParser = require('../../../../api/middleware/parse-query');

const setAppName = require('../middleware/set-app-name');


//
// public
router.get('/', queryParser, PlantCtrl.read_by_query);

router.get('/autocomplete', queryParser, PlantCtrl.autocomplete);

router.get('/:plantId/status', checkAuth, setAppName, retrieveUserProfile, queryParser, PlantStatusCtrl.read_by_plant_id);


//
// token-protected
router.post('/', checkAuth, setAppName, retrieveUserProfile, PlantCtrl.create);

// router.patch('/', checkAuth, setAppName, retrieveUserProfile, queryParser, PlantCtrl.update);

// router.put('/', checkAuth, setAppName, retrieveUserProfile, queryParser, PlantCtrl.replace);

// router.delete('/', checkAuth, setAppName, retrieveUserProfile, PlantCtrl.delete_by_query);

router.put('/:plantId/status', checkAuth, setAppName, retrieveUserProfile, PlantStatusCtrl.update_by_plant_id);


module.exports = router;
