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

// development environment specific operations
if (isLocalEnv) {
  // development environment / load dotenv
  require('dotenv').config({

  });
  // // development environment / attach morgan to express
  // const morgan = require('morgan');
  // app.use(morgan('combined'));
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
require('./middleware/sparkmeter-client-boot').boot();
require('./middleware/handlers-registries-boot').boot();

//
// CORS handling
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.API_CORS_ORIGIN);
  res.header('Access-Control-Allow-Headers', process.env.API_CORS_ALLOW_HEADERS);
  res.header('Access-Control-Expose-Headers', process.env.API_CORS_EXPOSE_HEADERS);
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
app.use('/accounts', require('./api/routes/account'));
// - admin
app.use('/account', require('./api/routes/accountDetail'));
// - utils
app.use('/util', require('./api/routes/util'));
// - app: winch
const propagatePlantId = require('./app/winch/api/middleware/rest/propagate-plant-id');
//   - plant detail: cards, logs, counters
app.use('/winch/v1/plants/cards', require('./app/winch/api/routes/plant/card'));
app.use('/winch/v1/plants/logs', require('./app/winch/api/routes/plant/log'));
app.use('/winch/v1/plants/counters', require('./app/winch/api/routes/plant/counter'));
//   - plant aux services: log, counters
app.use('/winch/v1/plants/services/cards', require('./app/winch/api/routes/plant/service/card'));
app.use('/winch/v1/plants/services/logs', require('./app/winch/api/routes/plant/service/log'));
//   - plant CRUDs: plants, villages, countries
app.use('/winch/v1/plants', require('./app/winch/api/routes/plant'));
app.use('/winch/v1/villages', require('./app/winch/api/routes/village'));
app.use('/winch/v1/countries', require('./app/winch/api/routes/country'));
// DEPRECATED
app.use('/winch/plants/:plantId/parts', propagatePlantId, require('./app/winch/api/routes/plant-part'));
app.use('/winch/plants/aggregates', require('./app/winch/api/routes/plant-aggregate'));
app.use('/winch/plants', require('./app/winch/api/routes/plant'));
app.use('/winch/villages', require('./app/winch/api/routes/village'));
app.use('/winch/countries', require('./app/winch/api/routes/country'));
app.use('/winch/poles', require('./app/winch/api/routes/pole'));
app.use('/winch/tariffs', require('./app/winch/api/routes/tariff'));
app.use('/winch/meters', require('./app/winch/api/routes/meter'));
app.use('/winch/customers/accounting', require('./app/winch/api/routes/customer/accounting'));
app.use('/winch/customers', require('./app/winch/api/routes/customer'));
app.use('/winch/exchange-rates', require('./app/winch/api/routes/exchange-rate'));
app.use('/winch/reports', require('./app/winch/api/routes/report'));
// app.use('/winch/transactions', require('./app/winch/api/routes/transaction'));
app.use('/winch/agents', require('./app/winch/api/routes/agent'));
app.use('/winch/app', require('./app/winch/api/routes/app'));
app.use('/demo/e-sell', require('./app/winch/api/routes/features/e-sell'));
//

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
    messages: [error.message]
  });
});

//
// CUSTOM PART II - end
//

// start server on the specified port and binding host
app.listen(process.env.NODE_PORT, '0.0.0.0', function () {
  if (isLocalEnv) {
    // print a message when the server starts listening
    console.log(`server starting on ${process.env.NODE_PORT}`);
  }
});
