const {
  DateFormatter,
} = require('../../../../../api/lib/util/formatter')
const fsUtil = require("../../../../../api/lib/util/fs");
const {
  // JsonObjectTypes,
  JsonObjectHelper,
} = require('../../../../../api/lib/util/json-util');
const {
  WellKnownJsonRes,
  // JsonResWriter,
} = require('../../../../../api/middleware/json-response-util');
// const {
//   BasicRead,
//   BasicWrite,
// } = require('../../../../../api/middleware/crud');


const dms = require("../../../../../app/winch/api/middleware/dms");
const dmsEngineContext = dms.getInstance('local-fs').context;

const fileNameDateFormatter = DateFormatter.buildFileNameDateFormatter(false);


//
// endpoint-related

// cRud/list
exports.list = (req, res, next) => {
  if (req.query.download && req.query.download === 'true') {
    // download resources
    listSessionDirFiles(req.userData['user-id'], req.params.sessionId)
      .then(fileList => {
        const zipList = [];
        const fileFilterDelegate = getFileFilter(req)();
        Object.entries(fileList).forEach(fileListEntry => {
          fileListEntry[1].forEach(fileName => {
            if (fileFilterDelegate(fileName)) {
              zipList.push({
                path: getSessionFilePath(req.userData['user-id'], fileListEntry[0], fileName),
                name: fsUtil.legacy.path.join(fileListEntry[0], fileName),
              });
            }
          });
        });

        if (zipList.length) {
          try {
            if (zipList.length === 1) {
              res.download(zipList[0].path);
            } else {
              res.zip(zipList, `Winch_Reports_${DateFormatter.formatDateOrDefault(new Date(), fileNameDateFormatter)}`);
            }
          } catch (error) {
            WellKnownJsonRes.error(res, 500, ['unable to complete download file list']);
          }
        } else {
          WellKnownJsonRes.okEmpty(res);
        }
      })
      .catch(fsError => {
        if (fsError.code === 'ENOENT') {
          WellKnownJsonRes.okEmpty(res);
        } else {
          WellKnownJsonRes.error(res, 500, ['unable to download file list']);
        }
      });
  } else {
    // list resources
    listSessionDirFiles(req.userData['user-id'], req.params.sessionId)
      .then(fileList => JsonObjectHelper.isEmpty(fileList)
        ? WellKnownJsonRes.okEmpty(res)
        : WellKnownJsonRes.okSingle(res, fileList))
      .catch(fsError => {
        if (fsError.code === 'ENOENT') {
          WellKnownJsonRes.okEmpty(res);
        } else {
          WellKnownJsonRes.error(res, 500, ['unable to retrieve file list']);
        }
      });
  }
}


//
// private part

const getSessionFilePath = (userId, sessionId, fileName) => {
  return `${fsUtil.legacy.path.join(getUserSessionsBaseDir(userId, sessionId), fileName)}`;
}

const getUserSessionsBaseDir = (userId, sessionId) => {
  return dmsEngineContext.buildReportSessionsBaseDirPath(userId, sessionId);
}

const listSessionDirFiles = (userId, sessionId) => new Promise((resolve, reject) => {
  dmsEngineContext.buildReportSessionContentAsyncTask(userId, sessionId)
    .then(promiseAllResult => resolve(promiseAllResult))
    .catch(dmsError => reject(dmsError));
});

const getFileFilter = (req) => {
  if (req.query.matchFilter) {
    const matcher = req.query.matchFilter.split(/\s*,\s*/);
    return () => {
      return sample => {
        return matcher.includes(sample);
      }
    }
  }

  return () => {
    return val => true
  }
}
