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
  mongooseUtil.defaultArgs
);


module.exports = winchDBConn;
