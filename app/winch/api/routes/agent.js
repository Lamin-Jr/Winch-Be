const express = require('express');
const router = express.Router();

const AgentCtrl = require('../controllers/agent');
const checkAuth = require('../../../../api/middleware/check-auth');
const retrieveUserProfile = require('../../../../api/middleware/retrieve-user-profile');
const queryParser = require('../../../../api/middleware/parse-query');

const setAppName = require('../middleware/rest/set-app-name');


//
// public
// -> nothing for now

//
// token-protected
router.get('/', checkAuth, setAppName, retrieveUserProfile, queryParser, AgentCtrl.read_by_query);

router.get('/autocomplete', checkAuth, setAppName, retrieveUserProfile, queryParser, AgentCtrl.autocomplete);

// router.post('/', checkAuth, setAppName, retrieveUserProfile, AgentCtrl.create);

// router.patch('/', checkAuth, setAppName, retrieveUserProfile, queryParser, AgentCtrl.update);

// router.put('/', checkAuth, setAppName, retrieveUserProfile, queryParser, AgentCtrl.replace);

// router.delete('/', checkAuth, setAppName, retrieveUserProfile, AgentCtrl.delete_by_query);


module.exports = router;
