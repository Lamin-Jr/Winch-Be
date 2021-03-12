const {
  Handler,
} = require('../../../../../../../api/lib/util/handler')

// const {
//   // NumberFormatter,
//   DateFormatter,
// } = require('../../../../../../../api/lib/util/formatter');
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
        console.log('TemplateHandler (recipe)', context);

        // TODO
        // prepare data for relevant report resource handler

        // TODO
        // call report resource handler

        // TODO
        // notify report resource

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}


module.exports = TemplateHandler;

//
// private part
