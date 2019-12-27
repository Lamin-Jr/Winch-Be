const express = require('express');
const router = express.Router();

const AccountCtrl = require('../controllers/account');

const checkAuth = require('../middleware/check-auth');


router.post('/signup', AccountCtrl.create);

router.post('/login', AccountCtrl.login);
router.get('/login', checkAuth, AccountCtrl.login_info);
router.put('/login', checkAuth, AccountCtrl.login_refresh);

router.put('/:accountId/enabled', checkAuth, AccountCtrl.enabled);
router.delete('/:accountId/enabled', checkAuth, AccountCtrl.enabled);

router.delete('/oblivion', checkAuth, AccountCtrl.oblivion);


module.exports = router;
