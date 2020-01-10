const express = require('express');
const router = express.Router();

const PoleCtrl = require('../controllers/pole');

const checkAuth = require('../../../../api/middleware/check-auth');
const retrieveUserProfile = require('../../../../api/middleware/retrieve-user-profile');
const queryParser = require('../../../../api/middleware/parse-query');

const setAppName = require('../middleware/rest/set-app-name');

//
// public
router.get('/', checkAuth, setAppName, queryParser, PoleCtrl.read_by_query);

router.get('/autocomplete', checkAuth, setAppName, retrieveUserProfile, queryParser, PoleCtrl.autocomplete);

//
// token-protected
router.post('/', checkAuth, setAppName, retrieveUserProfile, PoleCtrl.create);

// router.patch('/', checkAuth, setAppName, retrieveUserProfile, queryParser, PoleCtrl.update);

// router.put('/', checkAuth, setAppName, retrieveUserProfile, queryParser, PoleCtrl.replace);

// router.delete('/', checkAuth, setAppName, retrieveUserProfile, PoleCtrl.delete_by_query);


module.exports = router;
