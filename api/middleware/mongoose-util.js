module.exports = {
  defaultArgs: {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
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
  }
};
