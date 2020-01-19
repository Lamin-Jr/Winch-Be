/*eslint-env node*/

// This application uses express as its web server
// for more info, see: http://expressjs.com
const express = require('express');

// create a new express server
const app = express();

//
// CUSTOM PART - begin
//

// get the app environment
const env = process.env.NODE_ENV || 'dev';
const isLocalEnv = env === 'dev'

// load dotenv on development environment
if (isLocalEnv) {
  require('dotenv').config({

  });
}

const bodyParser = require('body-parser');
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());

//
// boot section
require('./middleware/db-boot').boot();
require('./middleware/realm-boot').boot();
require('./middleware/winch-boot').boot();

//
// CORS handling
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.API_CORS_ORIGIN);
  res.header('Access-Control-Allow-Headers', process.env.API_CORS_HEADERS);
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', process.env.API_CORS_METHODS);
    return res.status(200).json({});
  }
  // res.header("Set-Cookie", "HttpOnly;Secure;SameSite=Strict");
  next();
});

//
// Response Headers handling
app.disable('x-powered-by');

// here there are rest services routes
// - basics
const accountRoutes = require('./api/routes/account');
app.use('/accounts', accountRoutes);
// - admin
const accountDetailRoutes = require('./api/routes/accountDetail');
app.use('/account', accountDetailRoutes);
// - utils
const utilRoutes = require('./api/routes/util');
app.use('/util', utilRoutes);
// - app: winch
const propagatePlantId = require('./app/winch/api/middleware/rest/propagate-plant-id');
// TODO app.use('/winch/plants/:plantId/logs/generation', propagatePlantId, require('./app/winch/api/routes/plant-generation-log'));
app.use('/winch/plants/:plantId/parts', propagatePlantId, require('./app/winch/api/routes/plant-part'));
app.use('/winch/plants/aggregates', require('./app/winch/api/routes/plant-aggregate'));
app.use('/winch/plants', require('./app/winch/api/routes/plant'));
app.use('/winch/villages', require('./app/winch/api/routes/village'));
app.use('/winch/countries', require('./app/winch/api/routes/country'));
app.use('/winch/poles', require('./app/winch/api/routes/pole'));
app.use('/winch/tariffs', require('./app/winch/api/routes/tariff'));
app.use('/winch/meters', require('./app/winch/api/routes/meter'));
app.use('/winch/customers', require('./app/winch/api/routes/customer'));
app.use('/winch/exchange-rates', require('./app/winch/api/routes/exchange-rate')); // [GP]
app.use('/winch/reports', require('./app/winch/api/routes/report'))
// app.use('/winch/transactions', require('./app/winch/api/routes/transaction'));
// app.use('/winch/agents', require('./app/winch/api/routes/agents'));
app.use('/winch/app', require('./app/winch/api/routes/app'));

//
// CUSTOM PART I - end
//

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

//
// CUSTOM PART II - begin
//

app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    status: error.status,
    message: error.message
  });
});

//
// CUSTOM PART II - end
//

// start server on the specified port and binding host
app.listen(process.env.NODE_PORT, '0.0.0.0', function() {
  if (isLocalEnv) {
    // print a message when the server starts listening
    console.log(`server starting on ${process.env.NODE_PORT}`);
  }
});
