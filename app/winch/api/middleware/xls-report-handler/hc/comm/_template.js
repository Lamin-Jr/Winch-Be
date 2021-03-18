const {
  Handler,
} = require('../../../../../../../api/lib/util/handler')

const {
  initExcelJS,
  buildBasicDocumentOption,
  buildPortraitPageSetup,
} = require('../../../xls');

// TODO
// const {
//   NumberFormatter,
//   DateFormatter,
// } = require('../../../../../../../api/lib/util/formatter')
// TODO other internal lib here


const { loadDmsInstance } = require('../util');


// TODO apply 'TemplateHandler' replacement (2+1_temp tokens)
class TemplateHandler extends Handler {
  constructor () {
    super();
  }

  handle (context) {
    return new Promise((resolve, reject) => {
      try {
        // TODO:
        // 0. test working with following, then delete and code!
        console.log('TemplateHandler (xls)', context);

        // TODO:
        // 1a. perform preliminary operations upon context
        const dmsInstance = loadDmsInstance(context);
        const dmsEngineContext = dmsInstance.context;

        // 1b. init processing resources
        const ExcelJS = initExcelJS();
        const workbook = new ExcelJS.Workbook();

        //
        // 3. return report resource
        resolve(
          // 
          // 2. fill in report resource
          workbook.xlsx.readFile(dmsEngineContext.buildPathFromWorkDir(
            dmsEngineContext.basePathKey["<TODO: replace with .HC_COMM or .HC_OM>"],
            ...dmsEngineContext.pathSegment.oReport.oHc.vTemplate,
            "<TODO: replace with template-name>.xlsx"))
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


module.exports = TemplateHandler;
