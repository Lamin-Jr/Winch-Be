/*eslint-env node*/

// get the app environment
const env = process.env.NODE_ENV || 'dev';
const isLocalEnv = env === 'dev'

// development environment specific operations
if (isLocalEnv) {
  // development environment / load dotenv
  require('dotenv').config({
  });
}

//
// boot section
require('./middleware/db-boot').boot();
require('./middleware/realm-boot').boot();
require('./middleware/winch-boot').boot();
require('./middleware/sparkmeter-client-boot').boot();
require('./middleware/handlers-registries-boot').boot();
require('./middleware/dms-boot').boot()
  .then(() => require('./middleware/express-boot').boot(isLocalEnv))
  .catch(expressBootError => {
    console.error(expressBootError);
    setTimeout(() => {
      const exitCode = expressBootError.code || -1;
      console.error(`exit with code ${exitCode}`);
      process.exit(exitCode);
    }, 5000);
  });
