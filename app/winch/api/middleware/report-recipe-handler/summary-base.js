const {
  Handler,
} = require('../../../../../api/lib/util/handler')

const {
  // NumberFormatter,
  DateFormatter,
} = require('../../../../../api/lib/util/formatter');
const {
  buildPlantFilters,
  buildPlantFiltersRepo
} = require('../../controllers/plant/_shared');


class SummaryBaseHandler extends Handler {
  constructor () {
    super();
  }

  handle (context) {
    return new Promise((resolve, reject) => {
      const dateFormatter = DateFormatter.buildISOZoneDateFormatter();

      // ensure defaults
      context.period = context.period || {};
      context.period.to = context.period.to || DateFormatter.formatDateOrDefault(new Date(), dateFormatter);

      // build date ranges per period
      const endDateRef = new Date(context.period.to);
      const endMonthRef = new Date(new Date(endDateRef).setDate(1));
      const endWeekRef = new Date(new Date(endDateRef).setDate(endDateRef.getDate() - (endDateRef.getDay() + 6) % 7));
      context.period.yearly = {
        tsFrom: `${endDateRef.getFullYear() - 3}-01-01`,
        tsTo: `${endDateRef.getFullYear()}-01-01`,
      };
      context.period.monthly = {
        tsFrom: DateFormatter.formatDateOrDefault(new Date(new Date(endMonthRef).setMonth(endMonthRef.getMonth() - 2)), dateFormatter),
        tsTo: DateFormatter.formatDateOrDefault(endMonthRef, dateFormatter),
      };
      context.period.weekly = {
        tsFrom: DateFormatter.formatDateOrDefault(new Date(new Date(endWeekRef).setDate(endWeekRef.getDate() - 28)), dateFormatter),
        tsTo: DateFormatter.formatDateOrDefault(endWeekRef, dateFormatter),
      };
      context.period.daily = {
        tsFrom: DateFormatter.formatDateOrDefault(new Date(new Date(endDateRef).setDate(endDateRef.getDate() - 31)), dateFormatter),
        tsTo: context.period.to,
      };
      const sharedDelivCatReqContext = {
        aggregator: 'categories',
      };
      const sharedGenReqContext = {
        aggregator: 'plants',
      };

      // perform required queries
      const PlantLogCtrl = require('../../../../../app/winch/api/controllers/plant/log');
      const PlantCtrl = require('../../../../../app/winch/api/controllers/plant');
      const PlantServiceLogCtrl = require('../../../../../app/winch/api/controllers/plant/service/log');
      const plantFilters = buildPlantFilters(context.filter);
      Promise.all([
        PlantLogCtrl.aggregateDeliveryByCustomerCategory(
          'yearly',
          {
            ...context.filter,
            ...context.period.yearly,
          },
          sharedDelivCatReqContext),
        PlantLogCtrl.aggregateDeliveryByCustomerCategory(
          'monthly',
          {
            ...context.filter,
            ...context.period.monthly,
          },
          sharedDelivCatReqContext),
        PlantLogCtrl.aggregateDeliveryByCustomerCategory(
          'weekly',
          {
            ...context.filter,
            ...context.period.weekly,
          },
          sharedDelivCatReqContext),
        PlantLogCtrl.aggregateDeliveryByCustomerCategory(
          'daily',
          {
            ...context.filter,
            ...context.period.daily,
          },
          sharedDelivCatReqContext),
        PlantLogCtrl.aggregateGen(
          'yearly',
          buildPlantFiltersRepo(
            {
              ...context.filter,
              ...context.period.yearly,
            },
            false
          ),
          sharedGenReqContext),
        PlantLogCtrl.aggregateGen(
          'monthly',
          buildPlantFiltersRepo(
            {
              ...context.filter,
              ...context.period.monthly,
            },
            false
          ),
          sharedGenReqContext),
        PlantLogCtrl.aggregateGen(
          'weekly',
          buildPlantFiltersRepo(
            {
              ...context.filter,
              ...context.period.weekly,
            },
            false
          ),
          sharedGenReqContext),
        PlantLogCtrl.aggregateGen(
          'daily',
          buildPlantFiltersRepo(
            {
              ...context.filter,
              ...context.period.daily,
            },
            true
          ),
          sharedGenReqContext),
        PlantCtrl.filteredPlants(
          plantFilters.plantsFilter,
          plantFilters.plantsStatusFilter,
          plantFilters.plantsLocationsFilter || {},
          {
            name: 1,
            'village.country': 1,
            'village.name': 1,
            'dates.business': 1,
            'project.id': 1,
            setup: 1,
          },
          { 'dates.business': 1, name: 1 }),
        PlantLogCtrl.aggregateForecast(
          'daily',
          buildPlantFiltersRepo(
            {
              ...context.filter,
              ...context.period.daily,
            },
            true,
          )
        ),
        PlantServiceLogCtrl.aggregateSales(
          'daily',
          buildPlantFiltersRepo(
            {
              ...context.filter,
              ...context.period.daily,
            },
            true,
          ),
          ['rent-batt'],
        ),
      ])
        .then(promiseAllResult => resolve(Promise.all([
          promiseAllResult[0].model.aggregate(promiseAllResult[0].aggregation.pipeline()).exec(),
          promiseAllResult[1].model.aggregate(promiseAllResult[1].aggregation.pipeline()).exec(),
          promiseAllResult[2].model.aggregate(promiseAllResult[2].aggregation.pipeline()).exec(),
          promiseAllResult[3].model.aggregate(promiseAllResult[3].aggregation.pipeline()).exec(),
          new Promise(resolve => resolve(promiseAllResult[4].readResult)),
          new Promise(resolve => resolve(promiseAllResult[5].readResult)),
          new Promise(resolve => resolve(promiseAllResult[6].readResult)),
          new Promise(resolve => resolve(promiseAllResult[7].readResult)),
          new Promise(resolve => {
            const startOfBusinessDatesByPlantId = {};
            promiseAllResult[8].forEach(startOfBusinessDateItem => {
              startOfBusinessDatesByPlantId[startOfBusinessDateItem._id] = {
                name: startOfBusinessDateItem.name,
                date: startOfBusinessDateItem.dates.business
                  ? DateFormatter.formatDateOrDefault(startOfBusinessDateItem.dates.business, dateFormatter)
                  : 'n.a.',
                country: startOfBusinessDateItem.village.country,
                village: startOfBusinessDateItem.village.name,
                project: startOfBusinessDateItem.project.id,
                pvCap: startOfBusinessDateItem.setup.pv.cpty,
                battCap: startOfBusinessDateItem.setup.batt.cpty,
                genset: startOfBusinessDateItem.setup.genset.cpty,
              }
            })
            resolve(startOfBusinessDatesByPlantId);
          }),
          new Promise(resolve => resolve(promiseAllResult[9].readResult)),
          new Promise(resolve => resolve(promiseAllResult[10].readResult)),
        ])))
    })
      .then(promiseAllResult => new Promise(resolve => {
        const pdfReportHandlersRegistry = require('../pdf-report-handlers-registry');
        promiseAllResult[0];
        resolve(pdfReportHandlersRegistry.handle('summary-base', {
          locale: context.i18n.locale || 'en-GB',
          timeZone: context.i18n.timeZone || 'Europe/London',
          period: context.period,
          filterSource: context.filter,
          yearly: {
            period: context.period.yearly,
            gen: promiseAllResult[4],
            deliv: promiseAllResult[0],
          },
          monthly: {
            period: context.period.monthly,
            gen: promiseAllResult[5],
            deliv: promiseAllResult[1],
          },
          weekly: {
            period: context.period.weekly,
            gen: promiseAllResult[6],
            deliv: promiseAllResult[2],
          },
          daily: {
            period: context.period.daily,
            gen: promiseAllResult[7],
            deliv: promiseAllResult[3],
          },
          startOfBusinessDatesByPlantId: promiseAllResult[8],
          eForecast: promiseAllResult[9],
          battForecast: promiseAllResult[10],
        }));
      }))
      .then(pdfReportBlob => new Promise(resolve => resolve([
        {
          filename: `Report_WP1summary_${context.period.to}.pdf`,
          content: pdfReportBlob
        }
      ])))
      .then(attachments => new Promise((resolve, reject) => {
        try {
          const Notifier = require('../notifier')

          context.notifications.forEach(recipient => {
            Notifier[`send_${recipient.channel}_a_dt`]({
              recipients: recipient.address,
              template: context.mailTemplate,
              templateContext: {
                reportType: 'WP1 Summary',
                title: 'WP1 Summary report',
              },
              attachments,
            });
          });

          resolve();
        } catch (error) {
          if (process.env.DEV) {
            /* eslint-disable-next-line no-console */
            console.error(`error sending mail with dynamic template -> ${error.message}`)
          }
          reject(error);
        }
      }))
      .catch(error => reject(error));
  }
}


module.exports = SummaryBaseHandler;
