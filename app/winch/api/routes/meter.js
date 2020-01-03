const express = require('express');
const router = express.Router();

const MeterCtrl = require('../controllers/meter');

const checkAuth = require('../../../../api/middleware/check-auth');
const retrieveUserProfile = require('../../../../api/middleware/retrieve-user-profile');
const queryParser = require('../../../../api/middleware/parse-query');

const setAppName = require('../middleware/set-app-name');


//
// public
// -> nothing for now

//
// token-protected
router.get('/', checkAuth, setAppName, retrieveUserProfile, queryParser, MeterCtrl.read_by_query);

// router.get('/autocomplete', checkAuth, setAppName, retrieveUserProfile, queryParser, MeterCtrl.autocomplete);

// router.post('/', checkAuth, setAppName, retrieveUserProfile, MeterCtrl.create);

// router.patch('/', checkAuth, setAppName, retrieveUserProfile, queryParser, MeterCtrl.update);

// router.put('/', checkAuth, setAppName, retrieveUserProfile, queryParser, MeterCtrl.replace);

// router.delete('/', checkAuth, setAppName, retrieveUserProfile, MeterCtrl.delete_by_query);


module.exports = router;
