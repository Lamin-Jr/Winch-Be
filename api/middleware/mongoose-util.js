module.exports = {
  // connection
  buildConnectionString: (connParams) => {
    let result = connParams.scheme.concat('://');
    let credSep = undefined
    if (connParams.user) {
      result = result.concat(connParams.user)
      credSep = '@'
    }
    if (connParams.scrt) {
      result = result.concat(':').concat(connParams.scrt)
      credSep = '@'
    }
    if (credSep) {
      result = result.concat(credSep)
    }
    result = result.concat(connParams.host)
    if (connParams.dbName) {
      result = result.concat('/').concat(connParams.dbName)
    }
    if (connParams.args) {
      result = result.concat('?').concat(connParams.args)
    }
    return result;
  },
  defaultConnectionOptions: {
    connectTimeoutMS: 7000,
    keepAlive: true,
    keepAliveInitialDelay: 300000,
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  buildConnectionOptions(customConnOptions = {}) {
    return {
      ...this.defaultConnectionOptions,
      ...customConnOptions
    }
  },
  defaultUseDbOptions: {
    useCache: true
  },
  // crUd
  defaultUpdateOptions: {
    new: true,
    upsert: false,
    useFindAndModify: false
  },
  buildUpdateOptions(customUpdateOptions = {}) {
    return {
      ...this.defaultUpdateOptions,
      ...customUpdateOptions
    }
  },
  defaultUpsertOptions: {
    new: true,
    upsert: true,
    useFindAndModify: false
  },
  buildUpsertOptions(customUpsertOptions = {}) {
    return {
      ...this.defaultUpsertOptions,
      ...customUpsertOptions
    }
  },
};
