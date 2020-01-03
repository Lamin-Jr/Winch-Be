const mongoose = require('mongoose');
const mongooseUtil = require('../api/middleware/mongoose-util');

function handleInitialConnectionError(dbConnKey, error) {
  console.error(`MongoDB startup connection '${dbConnKey}' error => ${error}`);
}

function handleAfterConnectionError(dbConnKey) {
  console.error(`MongoDB connection '${dbConnKey}' error`);
}

function handleConnectionUp(dbConnKey) {
  console.log(`MongoDB connection '${dbConnKey}' is up`);
}

function handleConnectionDown(dbConnKey) {
  console.log(`MongoDB connection '${dbConnKey}' is down`);
}

const mainDBConn = mongoose
  .connect(
    mongooseUtil.buildConnectionString({
      scheme: process.env.MAIN_DB_SCHEME,
      user: process.env.MAIN_DB_USER,
      scrt: process.env.MAIN_DB_PW,
      host: process.env.MAIN_DB_HOST,
      dbName: process.env.MAIN_DB_NAME,
      args: process.env.MAIN_DB_ARGS
    }),
    mongooseUtil.defaultArgs
  )
  .then(
    () => {
      /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
      handleConnectionUp('main')
      mongoose.connection.on('error', () => handleAfterConnectionError('main'));
      mongoose.connection.on('connected', () => handleConnectionUp('main'));
      mongoose.connection.on('disconnected', () => handleConnectionDown('main'));
    },
    err => {
      /** handle initial connection error */
      handleInitialConnectionError('main', err);
    }
  );

const winchDBConn = require('../app/winch/api/middleware/mongoose');

exports.boot = () => {
  const otherDbConnections = {
    winch: winchDBConn
  };

  Object.keys(otherDbConnections).forEach(dbConnKey => {
    const connection = otherDbConnections[dbConnKey];
    connection.catch((error) => handleInitialConnectionError(dbConnKey, error))
    connection.on('error', () => handleAfterConnectionError(dbConnKey))
    connection.on('connected', () => handleConnectionUp(dbConnKey));
    connection.on('disconnected', () => handleConnectionDown(dbConnKey));
  });
};
