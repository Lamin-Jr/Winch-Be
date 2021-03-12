const {
  DmsEngine,
} = require('../dms');


const fsUtil = require('../fs')


class LocalFsTemplateEngine extends DmsEngine {
  constructor () {
    super();
  }

  copy (actionContext = {}, engineContext = { mode: undefined }) {
    return fsUtil.copyFile(actionContext.srcFilePath, actionContext.destFilePath, engineContext.mode);
  }

  load (actionContext = {}, engineContext = { options: { encoding: 'binary' } }) {
    return fsUtil.loadFile(actionContext.srcFilePath, engineContext);
  }

  store (actionContext = {}, engineContext = {}) {
    if (actionContext.forceDirCreation === true) {
      return fsUtil.createDir(fsUtil.legacy.path.dirname(actionContext.srcFilePath))
        .then(() => fsUtil.storeFile(actionContext.srcFilePath, actionContext.data, engineContext));
    } else {
      return fsUtil.storeFile(actionContext.srcFilePath, actionContext.data, engineContext);
    }
  }

  test (actionContext = {}, engineContext = undefined) {
    return fsUtil.fileExists(actionContext.srcFilePath);
  }
}


module.exports = LocalFsTemplateEngine;
