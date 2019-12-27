const express = require('express');
const router = express.Router();

const PlantGenerationLogCtrl = require('../controllers/plant-generation-log');

const checkAuth = require('../../../../api/middleware/check-auth');
const retrieveUserProfile = require('../../../../api/middleware/retrieve-user-profile');
const queryParser = require('../../../../api/middleware/parse-query');

const setAppName = require('../middleware/set-app-name');


const applyInternalFilter = (req, res, next) => {
  req._q.filter['plant'] = req._parentParams.plantId || null;
  next();
};

const applyParentParams = (req, res, next) => {
  Object.assign(req.params, req._parentParams);
  next();
};


//
// public
router.get('/', queryParser, applyInternalFilter, PlantGenerationLogCtrl.read_by_query);

//
// token-protected
router.post('/', checkAuth, setAppName, retrieveUserProfile, applyParentParams, PlantGenerationLogCtrl.create);

// router.patch('/', checkAuth, setAppName, retrieveUserProfile, queryParser, PlantGenerationLogCtrl.update);

// router.put('/', checkAuth, setAppName, retrieveUserProfile, queryParser, PlantGenerationLogCtrl.replace);

// router.delete('/', checkAuth, setAppName, retrieveUserProfile, PlantGenerationLogCtrl.delete_by_query);


module.exports = router;
