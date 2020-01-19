const express = require('express');
const router = express.Router();

const CustomerCtrl = require('../controllers/customer');

const checkAuth = require('../../../../api/middleware/check-auth');
const retrieveUserProfile = require('../../../../api/middleware/retrieve-user-profile');
const queryParser = require('../../../../api/middleware/parse-query');

const setAppName = require('../middleware/rest/set-app-name');


//
// public
// -> nothing for now

//
// token-protected
router.get('/', checkAuth, setAppName, retrieveUserProfile, queryParser, CustomerCtrl.read_by_query);

// router.get('/autocomplete', checkAuth, setAppName, retrieveUserProfile, queryParser, CustomerCtrl.autocomplete);

// router.post('/', checkAuth, setAppName, retrieveUserProfile, CustomerCtrl.create);

// router.patch('/', checkAuth, setAppName, retrieveUserProfile, queryParser, CustomerCtrl.update);

// router.put('/', checkAuth, setAppName, retrieveUserProfile, queryParser, CustomerCtrl.replace);

// router.delete('/', checkAuth, setAppName, retrieveUserProfile, CustomerCtrl.delete_by_query);


module.exports = router;
