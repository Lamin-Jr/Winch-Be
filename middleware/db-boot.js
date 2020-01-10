const mongoose = require('mongoose');
const mongooseUtil = require('../api/middleware/mongoose-util');

function handleInitialConnectionError(dbConnKey, error) {
  console.error(`MongoDB startup connection '${dbConnKey}' error => ${error}`);
}

function handleAfterConnectionError(dbConnKey) {
  console.error(`MongoDB connection '${dbConnKey}' error`);
}

function handleConnectionUp(dbConnKey) {
  console.info(`MongoDB connection '${dbConnKey}' is up`);
}

function handleConnectionDown(dbConnKey) {
  console.info(`MongoDB connection '${dbConnKey}' is down`);
}

/*const mainDBConn = */ mongoose
  .connect(
    mongooseUtil.buildConnectionString({
      scheme: process.env.MAIN_DB_SCHEME,
      user: process.env.MAIN_DB_USER,
      scrt: process.env.MAIN_DB_PW,
      host: process.env.MAIN_DB_HOST,
      dbName: process.env.MAIN_DB_NAME,
      args: process.env.MAIN_DB_ARGS
    }),
    mongooseUtil.defaultConnectionOptions
  )
  .then(
    () => {
      /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
      handleConnectionUp('main');
      mongoose.connection.on('error', () => handleAfterConnectionError('main'));
      mongoose.connection.on('connected', () => handleConnectionUp('main'));
      mongoose.connection.on('disconnected', () => handleConnectionDown('main'));
    },
    err => {
      /** handle initial connection error */
      handleInitialConnectionError('main', err);
    }
  );

const {
  winchDBConn,
  driverDBConnRegistry
} = require('../app/winch/api/middleware/mongoose-db-conn');

driverDBConnRegistry.add('spm', {
  'error': handleAfterConnectionError,
  'connected': handleConnectionUp,
  'disconnected': handleConnectionDown
});

exports.boot = () => {
  winchDBConn
    .then(workingWinchDBConn => {
      const dbConnKey = 'winch';
      handleConnectionUp(dbConnKey);
      workingWinchDBConn.on('error', () => handleAfterConnectionError(dbConnKey));
      workingWinchDBConn.on('connected', () => handleConnectionUp(dbConnKey));
      workingWinchDBConn.on('disconnected', () => handleConnectionDown(dbConnKey));
    })
    .catch(error => handleInitialConnectionError(dbConnKey, error));
};
