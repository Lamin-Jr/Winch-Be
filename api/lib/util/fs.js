const { access, copyFile, readdir, readFile, lstat, mkdir, unlink, writeFile } = require('fs').promises;
const { dirname, join } = require('path');

//
// legacy
exports.legacy = {
  fs: {
    access,
  },
  path: {
    dirname,
    join,
  }
}

//
// path

exports.pathJoin = (...pathSegments) => new Promise((resolve, reject) => {
  try {
    resolve(join(...pathSegments));
  } catch (pathError) {
    reject(pathError);
  }
});

//
// directory

exports.dirExists = (dirPath) => new Promise((resolve, reject) => {
  readdir(dirPath)
    .then(() => resolve(true))
    .catch(fsError => resolve(false));
});

exports.createDir = (dirPath) => new Promise((resolve, reject) => {
  lstat(dirPath)
    .then(stats => {
      if (stats.isDirectory) {
        mkdir(dirPath, { recursive: true })
          .then(resolve(dirPath))
          .catch(mkdirError => reject(mkdirError));
      }
      else {
        reject(new Error('directory file required but another resource has been found'));
      }
    })
    .catch(lstatError => lstatError.code && lstatError.code === 'ENOENT'
      ? mkdir(dirPath, { recursive: true })
        .then(resolve(dirPath))
        .catch(mkdirError => reject(mkdirError))
      : reject(lstatError));
});

exports.listDirFiles = (dirPath) => new Promise((resolve, reject) => {
  getFileList(dirPath)
    .then(fileList => resolve(fileList))
    .catch(createDirError => reject(createDirError));
});

exports.emptyDir = (dirPath) => new Promise((resolve, reject) => {
  // avoid unwanted dir claening from development fs
  if ((process.env.NODE_ENV || 'dev') === 'dev' && !dirPath.startsWith('/tmp')) {
    reject(new Error(`empty command for ${dirPath} directory aborted`));
  }
  getFileList(dirPath)
    .then(fileList => Promise.all(fileList.map(file => unlink(join(dirPath, file)))))
    .then((/* promiseAllResult */) => resolve())
    .catch(fsError => reject(fsError));
});

//
// file

exports.fileExists = (filePath) => new Promise((resolve, reject) => {
  access(filePath)
    .then(() => resolve(true))
    .catch(fsError => resolve(false));
});

exports.copyFile = copyFile;

exports.loadFile = readFile;

exports.storeFile = writeFile;

//
// private part

const getFileList = (dirPath, options = { forceDirCreation: false }) => new Promise((resolve, reject) => {
  const startingPromise = options.forceDirCreation
    ? createDir(dirPath)
      .then(readdir(dirPath))
    : readdir(dirPath);

  startingPromise
    .then(fileList => resolve(fileList))
    .catch(createDirError => {
      console.warn(`request for file list returns empty as the underlying call failed => ${createDirError.message}`);
      resolve([]);
    })
});
