const {
  Handler,
} = require('../../../../../../../api/lib/util/handler')

const {
  DateFormatter,
} = require('../../../../../../../api/lib/util/formatter');
const {
  buildPlantFilters,
} = require('../../../../controllers/plant/_shared');
const localUtil = require('../util');


class MgConnCustHandler extends Handler {
  constructor () {
    super();
  }

  handle (context) {
    return new Promise((resolve, reject) => {
      try {
        // TODO:
        // 1. prepare data for relevant report resource handler
        localUtil.applyConventionOverConfiguration(context);

        const dateFormatter = DateFormatter.buildISOZoneDateFormatter();

        // perform required queries
        const PlantCtrl = require('../../../../../../../app/winch/api/controllers/plant');
        const plantFilters = buildPlantFilters(context.selection.plant);
        const PlantLogCtrl = require('../../../../../../../app/winch/api/controllers/plant/log');
        const PlantCounterCtrl = require('../../../../../../../app/winch/api/controllers/plant/counter');

        Promise.all([
          // Promise #0.0) plants by projects
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
              const plantsByProject = {};

              plantList.forEach(plantItem => {
                plantsByProject[plantItem.project.id] = plantsByProject[plantItem.project.id] || {};

                plantsByProject[plantItem.project.id][plantItem._id] = {
                  name: plantItem.name,
                  date: plantItem.dates.business
                    ? DateFormatter.formatDateOrDefault(plantItem.dates.business, dateFormatter)
                    : 'n.a.',
                  country: plantItem.village.country['default-name'],
                  village: plantItem.village.name,
                  project: plantItem.project.id,
                  pvCap: plantItem.setup.pv.cpty,
                  battCap: plantItem.setup.batt.cpty,
                  genset: plantItem.setup.genset.cpty,
                  samples: {
                    queryFilter: {
                      ...localUtil.buildPeriodFilter(context, plantItem.dates.business),
                      plants: [plantItem._id],
                    },
                    byPeriod: {},
                  }
                }
              });

              resolve({ // plantsMgConnRepo
                list: plantList,
                byProject: plantsByProject,
                periods: new Set(),
              });
            }))
            .then(plantsMgConnRepo => new Promise(resolve => {
              const eCustCountsQueryTasks = [];
              const eDelivQueryTasks = [];
              Object.values(plantsMgConnRepo.byProject).forEach(plantsById => {
                Object.entries(plantsById).forEach(plantEntry => {
                  eCustCountsQueryTasks.push(
                    PlantCounterCtrl.aggregateECustomersByPeriod(
                      'monthly',
                      plantEntry[1].samples.queryFilter,
                      {
                        aggregator: 'categories',
                      }
                    )
                      .then(eCustomersByPeriod => new Promise(resolve => {
                        eCustomersByPeriod.forEach(sample => {
                          plantsMgConnRepo.periods.add(sample._id.b);
                          plantEntry[1].samples.byPeriod[sample._id.b] = plantEntry[1].samples.byPeriod[sample._id.b] || {};
                          plantEntry[1].samples.byPeriod[sample._id.b][sample._id.ct] = plantEntry[1].samples.byPeriod[sample._id.b][sample._id.ct] || {}
                          plantEntry[1].samples.byPeriod[sample._id.b][sample._id.ct].eCustCounters = sample;
                        });
                        resolve();
                      }))
                  );
                  eDelivQueryTasks.push(
                    PlantLogCtrl.aggregateDeliveryByCustomerCategory(
                      'monthly',
                      plantEntry[1].samples.queryFilter,
                      {
                        aggregator: 'categories',
                      }
                    )
                      .then(aggregationMeta => aggregationMeta.model.aggregate(aggregationMeta.aggregation.pipeline()).exec())
                      .then(eDeliveryByCustomerCategory => new Promise(resolve => {
                        eDeliveryByCustomerCategory.forEach(sample => {
                          plantsMgConnRepo.periods.add(sample._id.b);
                          plantEntry[1].samples.byPeriod[sample._id.b] = plantEntry[1].samples.byPeriod[sample._id.b] || {};
                          plantEntry[1].samples.byPeriod[sample._id.b][sample._id.ct] = plantEntry[1].samples.byPeriod[sample._id.b][sample._id.ct] || {}
                          plantEntry[1].samples.byPeriod[sample._id.b][sample._id.ct].eDeliv = sample;
                        })
                        resolve();
                      }))
                  );
                });
              });

              Promise.all([
                ...eCustCountsQueryTasks,
                ...eDelivQueryTasks,
              ])
                .then((/* promiseAllResult */) => resolve(plantsMgConnRepo));
            })),
        ])
          .then(promiseAllResult => new Promise((resolve, reject) => {
            //
            // 2. call report resource handler
            const xlsReportHandlersRegistry = require('../../../xls-report-handlers-registry');
            xlsReportHandlersRegistry.handle('mg-conn-cust', {
              in: context,
              // plantsMgConnRepo
              data: promiseAllResult[0],
            })
              // 
              // 3. notify report resource
              .then(xlsOutContextList => localUtil.notifyAll(
                xlsOutContextList,
                {
                  notifications: context.notifications,
                  templateKey: 'mg-conn-cust',
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
          }))
          .then(() => resolve())
          .catch(error => reject(error));
      } catch (error) {
        reject(error);
      }
    });
  }
}


module.exports = MgConnCustHandler;
