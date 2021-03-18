const fsUtil = require("../../../../../api/lib/util/fs");
const {
  JsonObjectTypes,
  // JsonObjectHelper,
} = require('../../../../../api/lib/util/json-util');
const {
  WellKnownJsonRes,
  // JsonResWriter,
} = require('../../../../../api/middleware/json-response-util');


const dms = require("../../../../../app/winch/api/middleware/dms");
const dmsEngineContext = dms.getInstance('local-fs').context;


// CrUd/upload
exports.upload = (req, res, next) => {
  const uploadResult = {};

  if (!req.files || Object.keys(req.files).length === 0) {
    WellKnownJsonRes.okNoContent(res);
    return;
  }

  try {
    const validTemplates = [];
    let totalFiles = 0, storedFiles = 0;

    if (!JsonObjectTypes.isArray(req.files.templates)) {
      // transform single file upload object with singleton array
      req.files.templates = [req.files.templates]
    }

    const maxAllowedSize = (parseInt(process.env.WCH_STO_RPT_TMPL_MAX_UPLOAD_MB) << 20);

    // first loop: fill in basic response
    req.files.templates.forEach(templateUpload => {
      totalFiles++;
      uploadResult[templateUpload.name] = {
        stored: false
      };
      if (!dmsEngineContext.isSupportedMymeType(getTemplateKey(templateUpload.name), templateUpload.mimetype.toLowerCase())) {
        uploadResult[templateUpload.name].reason = `invalid ${templateUpload.mimetype} mimetype`;
        return;
      }
      if (templateUpload.truncated === true || templateUpload.size > maxAllowedSize) {
        uploadResult[templateUpload.name].reason = `files too large, max size allowed is ${process.env.WCH_STO_RPT_TMPL_MAX_UPLOAD_MB} MB`;
        return;
      }
      if (templateUpload.size == 0) {
        uploadResult[templateUpload.name].reason = `the file is empty`;
        return;
      }
      validTemplates.push(templateUpload);
    });

    // second loop: record uploaded files
    validTemplates.forEach(templateUpload => {
      templateUpload.mv(getTemplateFilePath(templateUpload.name));
      storedFiles++;
      uploadResult[templateUpload.name].stored = true
      uploadResult[templateUpload.name].name = templateUpload.name
      uploadResult[templateUpload.name].mimetype = templateUpload.mimetype
      uploadResult[templateUpload.name].size = templateUpload.size
    });

    if (storedFiles === totalFiles) {
      WellKnownJsonRes.okSingle(res, uploadResult);
    } else if (storedFiles === 0) {
      WellKnownJsonRes.badRequest(res, uploadResult);
    } else {
      WellKnownJsonRes.conflict(res, uploadResult);
    }
  } catch (error) {
    WellKnownJsonRes.errorDebug(res, { error: error.message, partialResponse: uploadResult });
  } finally {
    emptyTempDir()
      .then(() => { })
      .catch(error => console.log(error));
  }
}

// cRud/list
exports.list = (req, res, next) => {
  listUploadDirFiles()
    .then(fileList => fileList.length === 0
      ? WellKnownJsonRes.okEmpty(res)
      : WellKnownJsonRes.okSingle(res, fileList.map(file => { return { _id: file } })))
    .catch(fsError => {
      if (fsError.code === 'ENOENT') {
        WellKnownJsonRes.okEmpty(res);
      } else {
        WellKnownJsonRes.error(res, 500, ['unable to retrieve template file list']);
      }
    });
}

// cRud/upload
exports.download = (req, res, next) => {
  const filePath = getTemplateFilePath(req.params.templateId);
  fsUtil.legacy.fs.access(filePath)
    .then(() => res.download(filePath))
    .catch(fsError => {
      if (fsError.code === 'ENOENT') {
        WellKnownJsonRes.error(res, 404, ['template file not found']);
      } else {
        WellKnownJsonRes.error(res, 500, ['unable to retrieve template file']);
      }
    });
}

//
// private part

const getTemplateKey = (uploadedTemplateFile) => {
  return uploadedTemplateFile.replace(/\.[^/.]+$/, '')
}

const getTemplateFilePath = (uploadedTemplateFileName) => {
  return `${fsUtil.legacy.path.join(getTemplateBaseDir(uploadedTemplateFileName), uploadedTemplateFileName)}`;
}

const getTemplateBaseDir = (uploadedTemplateFileName) => {
  return dmsEngineContext.buildReportTemplatesBaseDirPath(getTemplateKey(uploadedTemplateFileName));
}

const emptyTempDir = () => dmsEngineContext.cleanWorkDirFiles(dmsEngineContext.basePathKey.TMP_UPLOADS);

const listUploadDirFiles = () => new Promise((resolve, reject) => {
  Promise.all(dmsEngineContext.buildReportTemplatesListAsyncTasks())
    .then(promiseAllResult => {
      resolve([
        ...promiseAllResult[0],
        ...promiseAllResult[1],
        ...promiseAllResult[2],
      ]);
    })
    .catch(dmsError => reject(dmsError));
});
