const {
  Handler,
} = require('../../../../../../../api/lib/util/handler');


const {
  initExcelJS,
  buildBasicDocumentOption,
  buildPortraitPageSetup,
} = require('../../../xls');


class MgConnCustHandler extends Handler {
  constructor () {
    super();
  }

  handle (context) {
    return new Promise((resolve, reject) => {
      try {
        // TODO test working with following, then delete and code!
        console.log('MgConnCustHandler (XLS)', context);

        // TODO
        // perform preliminary operations upon context
        if (!context.in.fileTemplate) {
          const error = new Error('missing file template source information, fix it!');
          error.status = 500;
          reject(error);
        } else if (context.in.fileTemplate.channel !== 'storage') {
          const error = new Error(`unsupported channel ${context.in.fileTemplate.channel} for template source, fix it!`);
          error.status = 500;
          reject(error);
        } else if (!context.in.fileTemplate.address) {
          const error = new Error('missing address field within file template source information, fix it!');
          error.status = 500;
          reject(error);
        } else if (!context.in.fileTemplate.address.startsWith('winch://dms/')) {
          const error = new Error(`unsupported channel ${context.in.fileTemplate.address} for template source, fix it!`);
          error.status = 500;
          reject(error);
        }
        const dmsInstance = require("../../../dms")
          .getInstance(context.in.fileTemplate.address.substring('winch://dms/'.length));
        if (!dmsInstance) {
          const error = new Error(`unsupported template source, fix it!`);
          error.status = 500;
          reject(error);
        }
        const dmsEngineContext = dmsInstance.context;

        // TODO
        // fill in report resource
        const ExcelJS = initExcelJS();
        const workbook = new ExcelJS.Workbook();

        //
        // return report resource
        resolve(
          workbook.xlsx.readFile(dmsEngineContext.buildPathFromWorkDir(
            dmsEngineContext.basePathKey.HC_COMM,
            ...dmsEngineContext.pathSegment.oReport.oHc.vTemplate,
            'mg-conn-cust.xlsx'))
            .then(workbook => new Promise((resolve, reject) => {
              buildBasicDocumentOption(workbook);
              buildPortraitPageSetup(workbook);
              resolve(workbook.xlsx);
            }))
            .catch(error => reject(error))
        );

      } catch (error) {
        reject(error);
      }
    });
  }
}


module.exports = MgConnCustHandler;
