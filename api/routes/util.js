const express = require('express');
const router = express.Router();

const UtilCtrl = require('../controllers/util');

const checkAuth = require('../middleware/check-auth');


router.post('/flat-json', UtilCtrl.flat_json);

router.post('/encoded-json', UtilCtrl.encode_json);

router.post('/decoded-json', UtilCtrl.decode_json);


module.exports = router;
