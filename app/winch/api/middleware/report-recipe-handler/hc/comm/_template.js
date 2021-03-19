const {
  Handler,
} = require('../../../../../../../api/lib/util/handler');

// const {
//   // NumberFormatter,
//   DateFormatter,
// } = require('../../../../../../../api/lib/util/formatter');
// TODO: other internal lib here
const localUtil = require('../util');


// TODO: apply 'TemplateHandler' replacement (2+1_temp tokens)
class TemplateHandler extends Handler {
  constructor () {
    super();
  }

  handle (context) {
    return new Promise((resolve, reject) => {
      try {
        // TODO:
        // 0. test working with following, then delete and code!
        console.log('TemplateHandler (recipe)', context);

        // TODO:
        // 1. prepare data for relevant report resource handler
        localUtil.applyConventionOverConfiguration(context);

        // TODO:
        // 2. call report resource handler
        const xlsReportHandlersRegistry = require('../../../xls-report-handlers-registry');
        xlsReportHandlersRegistry.handle("<TODO: replace with template slug>", {
          in: context,
        })
          // 
          // 3. notify report resource
          .then(xlsMaker => localUtil.notifyAll(
            xlsMaker,
            {
              notifications: context.notifications,
              period: context.selection.period,
              templateKey: "<TODO: replace with template slug>",
            }
          ))
          .then(notifyResult => {
            if (notifyResult.status === 200) {
              resolve();
            } else {
              reject(localUtil.buildNotifyError(notifyResult));
            }
          })
          .catch(error => reject(error));
      } catch (error) {
        reject(error);
      }
    });
  }
}


module.exports = TemplateHandler;

//
// private part
