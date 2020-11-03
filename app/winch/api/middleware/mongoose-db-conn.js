const EventEmitter = require('events');

const mongoose = require('mongoose');

const mongooseUtil = require('../../../../api/middleware/mongoose-util');

const winchDBConn = mongoose.createConnection(
  mongooseUtil.buildConnectionString({
    scheme: process.env.WCH_DB_SCHEME,
    user: process.env.WCH_DB_USER,
    scrt: process.env.WCH_DB_PW,
    host: process.env.WCH_DB_HOST,
    dbName: process.env.WCH_DB_NAME,
    args: process.env.WCH_DB_ARGS
  }),
  mongooseUtil.defaultConnectionOptions
);

class DriverDBConnRegistry extends EventEmitter {
  constructor () {
    super();
    this._registry = {}
  }

  add (driverCode,
    eventHandlers,
    connPromiseErrorHandler = (driverCode, error) => { console.error(`[DriverDBConnRegistry][${driverCode}] startup connection error => ${error}`); }) {
    const baseDBName = `${process.env.WCH_DRV_DB_BASE_NAME}${driverCode}`;
    const connString = mongooseUtil.buildConnectionString({
      scheme: process.env.WCH_DRV_DB_SCHEME,
      user: process.env.WCH_DRV_DB_USER,
      scrt: process.env.WCH_DRV_DB_PW,
      host: process.env.WCH_DRV_DB_HOST,
      // use aggregates db name
      dbName: baseDBName,
      args: process.env.WCH_DRV_DB_ARGS
    });

    if (this._registry[driverCode]) {
      console.warn(`[DriverDBConnRegistry][${driverCode}] skip further add request => ${connString}`);
      return;
    }

    console.info(`[DriverDBConnRegistry][${driverCode}] process add request => ${connString}`);

    mongoose.createConnection(connString, mongooseUtil.defaultConnectionOptions)
      .then(workingConnection => {
        Object.keys(eventHandlers).forEach(event => {
          console.info(`[DriverDBConnRegistry][${driverCode}] setup '${event}' event`);
          workingConnection.on(event, () => eventHandlers[event](driverCode));
        });

        this._registry[driverCode] = {
          conn: workingConnection,
          baseDBName: baseDBName,
          selectedDBName: baseDBName,
        };

        console.info(`[DriverDBConnRegistry][${driverCode}] connection successfully created`);

        this.emit("connection", `${driverCode}`);
      })
      .catch(error => {
        connPromiseErrorHandler(driverCode, error);
      });
  }

  get (driverCode, site = undefined) {
    const dbConnItem = this._registry[driverCode];

    if (!dbConnItem) {
      console.error(`[DriverDBConnRegistry][${driverCode}] unable to retrieve connection${!site ? '' : ` for ${site}`}`);
      return undefined
    }

    let dbName = dbConnItem.baseDBName;
    if (site) {
      dbName = dbName.concat('_', site)
    }

    let connection;
    if (dbConnItem.selectedDBName === dbName) {
      console.info(`[DriverDBConnRegistry][${driverCode}] get '${dbName}'`);
      connection = dbConnItem.conn;
    } else {
      dbConnItem.selectedDBName = dbName;
      console.info(`[DriverDBConnRegistry][${driverCode}] switch to '${dbName}'`);
      connection = dbConnItem.conn.useDb(dbName, mongooseUtil.defaultUseDbOptions);
    }

    return connection;
  }
}

const driverDBConnRegistry = new DriverDBConnRegistry();


module.exports = {
  winchDBConn,
  driverDBConnRegistry,
};
