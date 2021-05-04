const dms = require("../app/winch/api/middleware/dms");

const LocalFsDmsEngine = require("../api/lib/util/dms/localFsDmsEngine");
const fsUtil = require("../api/lib/util/fs");

exports.boot = () => new Promise((resolve, reject) => {
  let dmsEngineKey, markers, context;

  //
  // local-fs

  dmsEngineKey = 'local-fs';
  markers = ['boot', dmsEngineKey];
  context = {
    basePathsMapping: {},
    basePathKey: {
      'HC_COMM': 'HC_COMM',
      'HC_OM': 'HC_OM',
      'TMP_UPLOADS': 'TMP_UPLOADS',
    },
    rootBasePath: '', // boot will assign a concrete value
    pathSegment: {
      oReport: {
        vTemplate: ['reporting', 'templates'],
        oOwn: {
          fGenerated: function (project, ...subPathSegments) {
            return ['projects', project, ...subPathSegments];
          },
        },
        oHc: {
          vTemplate: ['templates'],
          fGenerated: function (year, month, ...subPathSegments) {
            return ['repo', year.toString(), month.toString().padStart(2, '0'), ...subPathSegments];
          }
        }
      }
    },
    buildPathFromRootDir: function (...subPathSegments) {
      return fsUtil.legacy.path.join(this.rootBasePath, ...subPathSegments)
    },
    buildPathFromWorkDir: function (basePathKey, ...subPathSegments) {
      return fsUtil.legacy.path.join(this.basePathsMapping[basePathKey], ...subPathSegments);
    },
    cleanWorkDirFiles: function (basePathKey, ...subPathSegments) {
      return fsUtil.emptyDir(this.buildPathFromWorkDir(basePathKey, ...subPathSegments));
    },
    createRootDirSubPath: function (isFile, ...subPathSegments) {
      let path = this.buildPathFromRootDir(...subPathSegments);
      if (isFile === true) {
        path = fsUtil.legacy.path.dirname(path);
      }
      return fsUtil.createDir(path);
    },
    createWorkDirSubPath: function (basePathKey, isFile, ...subPathSegments) {
      let path = this.buildPathFromWorkDir(basePathKey, ...subPathSegments);
      if (isFile === true) {
        path = fsUtil.legacy.path.dirname(path);
      }
      return fsUtil.createDir(path);
    },
    listRootDirFiles: function (...subPathSegments) {
      return fsUtil.listDirFiles(this.buildPathFromRootDir(...subPathSegments));
    },
    listWorkDirFiles: function (basePathKey, ...subPathSegments) {
      return fsUtil.listDirFiles(this.buildPathFromWorkDir(basePathKey, ...subPathSegments));
    },
    buildReportTemplatesListAsyncTasks () {
      return [
        this.listWorkDirFiles(this.basePathKey.HC_COMM, ...this.pathSegment.oReport.oHc.vTemplate),
        this.listWorkDirFiles(this.basePathKey.HC_OM, ...this.pathSegment.oReport.oHc.vTemplate),
        this.listRootDirFiles(...this.pathSegment.oReport.vTemplate),
      ]
    },
    getBasePathKey: function (templateKey) {
      return ({
        'mg-pot-cust': this.basePathKey.HC_COMM,
        'mg-onbrd-cust': this.basePathKey.HC_COMM,
        'mg-biz-kpi': this.basePathKey.HC_COMM,
        'mg-day-cons': this.basePathKey.HC_COMM,
        'om-genfac-op': this.basePathKey.HC_OM,
        'om-batt-op': this.basePathKey.HC_OM,
      })[templateKey];
    },
    buildReportTemplatesBaseDirPath: function (templateKey) {
      return this.buildPathFromWorkDir(this.getBasePathKey(templateKey), ...this.pathSegment.oReport.oHc.vTemplate)
        || this.buildPathFromRootDir(...this.pathSegment.oReport.vTemplate)
    },
    getReportTemplatesAllowedMimeTypes: function () {
      return (process.env.WCH_STO_RPT_TMPL_ALLOW_MIMETYPES || '').split(/\s*,\s*/);
    },
    isSupportedMymeType: function (templateKey, mimeType) {
      const reportTemplatesAllowedMimeTypes = this.getReportTemplatesAllowedMimeTypes();
      const wellKnownMiMeTypes = ({
        // DEPRECATED
        'mg-pot-cust': reportTemplatesAllowedMimeTypes,
        'mg-onbrd-cust': reportTemplatesAllowedMimeTypes,
        'mg-conn-cust': reportTemplatesAllowedMimeTypes,
        'mg-day-cons': reportTemplatesAllowedMimeTypes,
        'om-genfac-op': reportTemplatesAllowedMimeTypes,
        'om-batt-op': reportTemplatesAllowedMimeTypes,
        // NEW
        'mg-biz-kpi': reportTemplatesAllowedMimeTypes,
      })[templateKey] || [
          ...reportTemplatesAllowedMimeTypes
        ];
      return wellKnownMiMeTypes.includes(mimeType);
    },
  };
  dms.bootInstance(dmsEngineKey, new LocalFsDmsEngine(), context);

  if (process.env.WCH_STO_DMS_LFS_WORK_DIR) {
    fsUtil.createDir(process.env.WCH_STO_DMS_LFS_WORK_DIR)
      .then(rootBasePath => {
        context.rootBasePath = rootBasePath;
        const basePathEntries = Object.entries(context.basePathKey);
        basePathEntries.forEach((basePathEntry, index) => {
          const basePathValue = process.env[`WCH_STO_DMS_LFS_BPK_${basePathEntry[1]}`];
          if (!basePathValue) {
            console.error(textWithPreamble(`no value provided for required DMS working dir key ${basePathEntry[0]}`, markers))
            return;
          }
          fsUtil.pathJoin(rootBasePath, basePathValue)
            .then((dirBasePath) => fsUtil.createDir(dirBasePath))
            .then((dirBasePath) => {
              context.basePathsMapping[basePathEntry[0]] = dirBasePath;
              console.info(textWithPreamble(`DMS working dir ${basePathValue} is ready`, markers));
            })
            .catch(fsError => {
              console.error(textWithPreamble(`unable to create DMS working dir ${basePathValue} => ${fsError.message}`, markers))
              reject(error);
            })
            .finally(() => {
              if (index === basePathEntries.length - 1) {
                resolve();
              }
            });
        });
      })
      .catch(createDirError => {
        console.error(textWithPreamble(`unable to create DMS root dir ${basePathValue} => ${createDirError.message}`, markers));
        reject(error);
      })
  } else {
    reject(new Error(textWithPreamble('no local fs base dir has been provided', markers)));
  }
});


//
// private part

const textWithPreamble = (text, markers = []) => {
  return `[DMS]${markers.reduce((acc, current) => acc.startsWith('[') ? `${acc}[${current}]` : `[${acc}][${current}]`)} ${text}`;
}
