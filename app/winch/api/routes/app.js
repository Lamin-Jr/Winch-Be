const express = require('express');
const router = express.Router();

const AppCtrl = require('../controllers/app');

const checkAuth = require('../../../../api/middleware/check-auth');
const retrieveUserProfile = require('../../../../api/middleware/retrieve-user-profile');

const setAppName = require('../middleware/rest/set-app-name');

const checkAdminRole = (req, res, next) => {
    if (req.userData.role === process.env.WCH_AUTHZ_ADMIN_ROLE) {
        next()
    } else {
        WellKnownJsonRes.unauthorized(res);
    }
}

const putUsernameInBody = (req, res, next) => {
    req.body.username = req.params.username
    next()
}

//
// public
// -> nothing for now

//
// token-protected
router.post('/registration', checkAuth, setAppName, retrieveUserProfile, checkAdminRole, AppCtrl.accept_signup);
router.delete('/registration/:username', checkAuth, setAppName, retrieveUserProfile, checkAdminRole, putUsernameInBody, AppCtrl.accept_signup);


module.exports = router;
