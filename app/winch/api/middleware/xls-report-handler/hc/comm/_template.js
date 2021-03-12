const {
  Handler,
} = require('../../../../../../../api/lib/util/handler')

// TODO import libs to generate report resource: pdf, xls, etc
// const {
//   initExcelJS,
//   buildBasicDocumentOption,
//   buildPortraitPageSetup,
// } = require('../../../xls')

// TODO
// const {
//   NumberFormatter,
//   DateFormatter,
// } = require('../../../../../../../api/lib/util/formatter')
// TODO other internal lib here


// TODO apply 'TemplateHandler' replacement (2+1_temp tokens)
class TemplateHandler extends Handler {
  constructor () {
    super();
  }

  handle (context) {
    return new Promise((resolve, reject) => {
      try {
        // TODO test working with following, then delete and code!
        console.log('TemplateHandler (xls)', context);

        // TODO
        // perform preliminary operations upon context

        // TODO
        // fill in report resource

        // TODO
        // return report resource
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}


module.exports = TemplateHandler;
