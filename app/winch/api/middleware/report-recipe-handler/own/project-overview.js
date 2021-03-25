const {
  Handler,
} = require('../../../../../../api/lib/util/handler')

const {
  buildPlantFilters,
} = require('../../../controllers/plant/_shared');

const {
  DateFormatter,
} = require('../../../../../../api/lib/util/formatter');

const localUtil = require('./util');


class ProjectOverviewHandler extends Handler {
  constructor () {
    super();
  }

  handle (context) {
    return new Promise((resolve, reject) => {
      try {
        // 
        // 1. prepare data for relevant report resource handler
        localUtil.applyConventionOverConfiguration(context);

        if (!context.selection.project) {
          const error = new Error('missing required context.selection.project body parameter');
          error.status = 400;
          reject(error);
          return;
        }

        const dateFormatter = DateFormatter.buildISOZoneDateFormatter();

        // perform required queries
        const PlantLogCtrl = require('../../../../../../app/winch/api/controllers/plant/log');
        const PlantCtrl = require('../../../../../../app/winch/api/controllers/plant');
        const inputFilter = {
          projects: [context.selection.project],
        };
        const plantFilters = buildPlantFilters(inputFilter);
        const eDelivFilter = {
          ...inputFilter,
        }
        if (context.selection.period.from) {
          eDelivFilter.tsFrom = context.selection.period.from;
        }
        if (context.selection.period.to) {
          eDelivFilter.tsTo = context.selection.period.to;
        }
        Promise.all([
          // Promise #0.0) plants and relevant e-delivery query task
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
            { 'dates.business': 1, name: 1 },
            true)
            .then(plantList => new Promise(resolve => {
              const startOfBusinessDatesByPlantId = {};

              plantList.forEach(startOfBusinessDateItem => {
                startOfBusinessDatesByPlantId[startOfBusinessDateItem._id] = {
                  name: startOfBusinessDateItem.name,
                  date: startOfBusinessDateItem.dates.business
                    ? DateFormatter.formatDateOrDefault(startOfBusinessDateItem.dates.business, dateFormatter)
                    : 'n.a.',
                  country: startOfBusinessDateItem.village.country['default-name'],
                  village: startOfBusinessDateItem.village.name,
                  project: startOfBusinessDateItem.project.id,
                  pvCap: startOfBusinessDateItem.setup.pv.cpty,
                  battCap: startOfBusinessDateItem.setup.batt.cpty,
                  genset: startOfBusinessDateItem.setup.genset.cpty,
                  eDelivQueryTask: PlantLogCtrl.aggregateDeliveryByCustomerCategory(
                    'daily',
                    {
                      plants: [startOfBusinessDateItem._id],
                      ...eDelivFilter,
                    },
                    {
                      aggregator: 'categories',
                    })
                    .then(aggregationMeta => aggregationMeta.model.aggregate(aggregationMeta.aggregation.pipeline()).exec())
                }
              });

              resolve(startOfBusinessDatesByPlantId);
            })),
        ])
          .then(promiseAllResult => new Promise((resolve, reject) => {
            // 
            // 2. call report resource handler
            const xlsReportHandlersRegistry = require('../../xls-report-handlers-registry');
            xlsReportHandlersRegistry.handle('project-overview', {
              in: context,
              data: {
                // Promise #0.0) plants and relevant e-delivery query task
                plant: promiseAllResult[0],
              },
            })
              // 
              // 3. notify report resource
              .then(xlsMaker => localUtil.notifyAll(
                xlsMaker,
                {
                  notifications: context.notifications,
                  project: context.selection.project,
                  period: context.selection.period,
                  templateKey: 'project-overview',
                }
              ))
              .then(notifyResult => {
                if (notifyResult.status === 200) {
                  resolve();
                } else {
                  reject(localUtil.buildNotifyError(notifyResult));
                }
              })
          }))
          .then(() => resolve())
          .catch(error => reject(error));
      } catch (error) {
        reject(error);
      }
    });
  }
}


module.exports = ProjectOverviewHandler;
