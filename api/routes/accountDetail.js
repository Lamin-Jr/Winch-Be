const express = require('express');
const router = express.Router();

const AccountDetailCtrl = require('../controllers/accountDetail');

const checkAuth = require('../middleware/check-auth');


router.post('/', checkAuth, AccountDetailCtrl.create_by_jwt);

router.get('/', checkAuth, AccountDetailCtrl.read_one_by_jwt);

router.patch('/', checkAuth, AccountDetailCtrl.update_one_by_jwt);

// router.delete('/', checkAuth, AccountDetailCtrl.delete_by_jwt);


module.exports = router;
