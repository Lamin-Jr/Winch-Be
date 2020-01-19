const express = require('express');
const router = express.Router();

const TariffCtrl = require('../controllers/tariff');

const checkAuth = require('../../../../api/middleware/check-auth');
const retrieveUserProfile = require('../../../../api/middleware/retrieve-user-profile');
const queryParser = require('../../../../api/middleware/parse-query');

const setAppName = require('../middleware/rest/set-app-name');


//
// public
router.get('/', checkAuth, setAppName, retrieveUserProfile, queryParser, TariffCtrl.read_by_query);

router.get('/autocomplete', checkAuth, setAppName, retrieveUserProfile, queryParser, TariffCtrl.autocomplete);

//
// token-protected
router.post('/', checkAuth, setAppName, retrieveUserProfile, TariffCtrl.create);

// router.patch('/', checkAuth, setAppName, retrieveUserProfile, queryParser, TariffCtrl.update);

// router.put('/', checkAuth, setAppName, retrieveUserProfile, queryParser, TariffCtrl.replace);

// router.delete('/', checkAuth, setAppName, retrieveUserProfile, TariffCtrl.delete_by_query);


module.exports = router;
