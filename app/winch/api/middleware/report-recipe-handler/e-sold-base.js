const {
  Handler,
} = require('../../../../../api/lib/util/handler')


class ESoldBaseHandler extends Handler {
  constructor() {
    super();
  }

  handle(context) {
    return new Promise((resolve, reject) => {
      const PlantCtrl = require('../../../../../app/winch/api/controllers/plant');

      const filterDate = new Date();
      filterDate.setDate(filterDate.getDate()-1);
      context.filter['tsTo'] = filterDate.toISOString().split('T', 1)[0];
      filterDate.setDate(filterDate.getDate()-6);
      context.filter['tsFrom'] = filterDate.toISOString().split('T', 1)[0]

      PlantCtrl.aggregateDelivery(context.period, context.filter)
      .then(aggregationMeta => aggregationMeta.aggregation.exec())
      .then(readResult => new Promise(resolve => {
        const pdfReportHandlersRegistry = require('../../../../../app/winch/api/middleware/pdf-report-handlers-registry');
        resolve(pdfReportHandlersRegistry.handle('e-sold-base', {
          locale: 'en-GB',
          timeZone: 'UTC',
          filterSource: context.filter,
          tableSource: readResult,
        }));
      }))
      .then(pdfReportBlob => new Promise(resolve => resolve([
        {
          filename: 'WP1_brief_report.pdf',
          content: pdfReportBlob
        }
      ])))
      .then(attachments => {
        try {
          const Notifier = require('../../../../../app/winch/api/middleware/notifier')

          context.notifications.forEach(recipient => {
            Notifier[`send_${recipient.channel}_a_t`]({
              recipients: recipient.address,
              template: context.mailTemplate,
              attachments: attachments,
            });
          });
  
          resolve();            
        } catch (error) {
          reject(error);
        }
      })
      .catch(error => reject(error));
    });
  }
}


module.exports = ESoldBaseHandler;
