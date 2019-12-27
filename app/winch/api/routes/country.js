const express = require('express');
const router = express.Router();

const CountryCtrl = require('../controllers/country');

const checkAuth = require('../../../../api/middleware/check-auth');
const queryParser = require('../../../../api/middleware/parse-query');

//
// public
router.get('/', queryParser, CountryCtrl.read_by_query);

router.get('/autocomplete', queryParser, CountryCtrl.autocomplete);

//
// token-protected
router.post('/', checkAuth, CountryCtrl.create);

// router.patch('/', checkAuth, queryParser, CountryCtrl.update);

// router.put('/', checkAuth, queryParser, CountryCtrl.replace);

// router.delete('/', checkAuth, CountryCtrl.delete_by_query);


module.exports = router;
