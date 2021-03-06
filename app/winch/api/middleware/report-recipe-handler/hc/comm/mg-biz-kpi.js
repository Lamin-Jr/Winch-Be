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
        //
        // 1. prepare data for relevant report resource handler
        localUtil.applyConventionOverConfiguration(context);

        const dateFormatter = DateFormatter.buildISOZoneDateFormatter();

        // perform required queries
        const PlantCtrl = require('../../../../controllers/plant');
        const plantFilters = buildPlantFilters(context.selection.plant);
        const PlantLogCtrl = require('../../../../controllers/plant/log');
        const PlantCounterCtrl = require('../../../../controllers/plant/counter');

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
                      eCustCount: {
                        ...localUtil.buildECustCountPeriodFilter(context, plantItem.dates.business),
                        plants: [plantItem._id],
                      },
                      eDeliv: {
                        ...localUtil.buildEDelivPeriodFilter(context, plantItem.dates.business),
                        plants: [plantItem._id],
                      }
                    },
                    byPeriod: {},
                  }
                }
              });

              resolve({ // plantsMgConnRepo
                list: plantList,
                byProject: plantsByProject,
                months: {},
                tariffsRepo,
              });
            }))
            .then(plantsMgConnRepo => new Promise(resolve => {
              const eCustCountsMonthlyQueryTasks = [];
              const eDelivMonthlyByCommCatQueryTasks = [];
              const eDelivMonthlyByCustQueryTasks = [];
              const eCustCountsDailyQueryTasks = [];
              Object.values(plantsMgConnRepo.byProject).forEach(plantsById => {
                Object.entries(plantsById).forEach(plantEntry => {
                  eCustCountsMonthlyQueryTasks.push(
                    PlantCounterCtrl.aggregateECustomersByPeriod(
                      'monthly',
                      plantEntry[1].samples.queryFilter.eCustCount,
                      {
                        aggregator: 'categories',
                      }
                    )
                      .then(eCustCountsByPeriod => new Promise(resolve => {
                        eCustCountsByPeriod.forEach(sample => {
                          plantsMgConnRepo.months[sample._id.b] = plantsMgConnRepo.months[sample._id.b]
                            || localUtil.getTotalDaysOfMonth(sample._id.b);
                          plantEntry[1].samples.byPeriod[sample._id.b] = plantEntry[1].samples.byPeriod[sample._id.b] || {};
                          plantEntry[1].samples.byPeriod[sample._id.b][sample._id.ct] = plantEntry[1].samples.byPeriod[sample._id.b][sample._id.ct] || {}
                          plantEntry[1].samples.byPeriod[sample._id.b][sample._id.ct].eCustCounters = sample;
                        });
                        resolve();
                      }))
                  );
                  eDelivMonthlyByCommCatQueryTasks.push(
                    PlantLogCtrl.aggregateDeliveryByCustomerCategory(
                      'monthly',
                      plantEntry[1].samples.queryFilter.eDeliv,
                      {
                        aggregator: 'categories',
                      }
                    )
                      .then(aggregationMeta => aggregationMeta.model.aggregate(aggregationMeta.aggregation.pipeline()).exec())
                      .then(eDeliveryByCustomerCategory => new Promise(resolve => {
                        eDeliveryByCustomerCategory.forEach(sample => {
                          plantsMgConnRepo.months[sample._id.b] = plantsMgConnRepo.months[sample._id.b]
                            || (new Date(new Date(sample._id.b).setMonth(new Date(sample._id.b).getMonth() + 1)).getTime() - new Date(sample._id.b).getTime()) / (1000 * 60 * 60 * 24);
                          plantEntry[1].samples.byPeriod[sample._id.b] = plantEntry[1].samples.byPeriod[sample._id.b] || {};
                          plantEntry[1].samples.byPeriod[sample._id.b][sample._id.ct] = plantEntry[1].samples.byPeriod[sample._id.b][sample._id.ct] || {}
                          plantEntry[1].samples.byPeriod[sample._id.b][sample._id.ct].eDeliv = sample;
                        })
                        resolve();
                      }))
                  );
                  eDelivMonthlyByCustQueryTasks.push(
                    PlantLogCtrl.aggregateDeliveryByCustomerCategory(
                      'monthly',
                      plantEntry[1].samples.queryFilter.eDeliv,
                      {
                        aggregator: 'customers',
                      }
                    )
                      .then(aggregationMeta => aggregationMeta.model.aggregate(aggregationMeta.aggregation.pipeline()).exec())
                      .then(eDeliveryByCustomerCategory => new Promise(resolve => {
                        eDeliveryByCustomerCategory.forEach(sample => {
                          plantsMgConnRepo.months[sample._id.b] = plantsMgConnRepo.months[sample._id.b]
                            || (new Date(new Date(sample._id.b).setMonth(new Date(sample._id.b).getMonth() + 1)).getTime() - new Date(sample._id.b).getTime()) / (1000 * 60 * 60 * 24);
                          plantEntry[1].samples.byPeriod[sample._id.b] = plantEntry[1].samples.byPeriod[sample._id.b] || {};
                          if (sample.ct.length > 1) {
                            console.warn(`periodic e-deliv sample ${JSON.stringify(sample._id)} with multiple categories [${sample.ct.join(', ')}], fix it!`);
                          }
                          const selectedCommCat = sample.ct[0];
                          plantEntry[1].samples.byPeriod[sample._id.b] = plantEntry[1].samples.byPeriod[sample._id.b] || {};
                          plantEntry[1].samples.byPeriod[sample._id.b][selectedCommCat] = plantEntry[1].samples.byPeriod[sample._id.b][selectedCommCat] || {};
                          plantEntry[1].samples.byPeriod[sample._id.b][selectedCommCat].pods = plantEntry[1].samples.byPeriod[sample._id.b][selectedCommCat].pods || [];
                          plantEntry[1].samples.byPeriod[sample._id.b][selectedCommCat].pods.push(sample);
                        })
                        resolve();
                      }))
                  );
                  eCustCountsDailyQueryTasks.push(
                    PlantCounterCtrl.aggregateECustomersByPeriod(
                      'daily',
                      plantEntry[1].samples.queryFilter.eCustCount,
                      {
                        aggregator: 'customers',
                      }
                    )
                      .then(eCustCountsByPeriod => new Promise(resolve => {
                        eCustCountsByPeriod.forEach(sample => {
                          let dateKey = sample._id.d;
                          const sampleDate = new Date(sample._id.d);
                          if (sampleDate.getDate() !== 1) {
                            dateKey = DateFormatter.formatDateOrDefault(new Date(sampleDate.setDate(1)), dateFormatter);
                          }
                          plantsMgConnRepo.months[dateKey] = plantsMgConnRepo.months[dateKey]
                            || (new Date(new Date(dateKey).setMonth(new Date(dateKey).getMonth() + 1)).getTime() - new Date(dateKey).getTime()) / (1000 * 60 * 60 * 24);
                          plantEntry[1].samples.byPeriod[dateKey] = plantEntry[1].samples.byPeriod[dateKey] || {};
                          plantEntry[1].samples.byPeriod[dateKey][sample.ctList[0]] = plantEntry[1].samples.byPeriod[dateKey][sample.ctList[0]] || {}
                          plantEntry[1].samples.byPeriod[dateKey][sample.ctList[0]].dailyStats = plantEntry[1].samples.byPeriod[dateKey][sample.ctList[0]].dailyStats || {
                            pod: {},
                          };
                          plantEntry[1].samples.byPeriod[dateKey][sample.ctList[0]].dailyStats.pod[sample._id.pod] = plantEntry[1].samples.byPeriod[dateKey][sample.ctList[0]].dailyStats.pod[sample._id.pod] || 0;
                          plantEntry[1].samples.byPeriod[dateKey][sample.ctList[0]].dailyStats.pod[sample._id.pod] += (sample.consumingBySelling + sample.consumingByService);
                        });
                        resolve();
                      }))
                  );
                });
              });

              const connFeeQueryTask = PlantCounterCtrl.eCustomersConnectionFees({
                plants: plantsMgConnRepo.list.map(plant => plant._id),
              })
                .then(eConnFeesHistByPlant => new Promise(resolve => {
                  tariffsRepo.loadConnFeesHist(eConnFeesHistByPlant);
                  resolve();
                }));

              Promise.all([
                ...eCustCountsMonthlyQueryTasks,
                ...eDelivMonthlyByCommCatQueryTasks,
                ...eDelivMonthlyByCustQueryTasks,
                ...eCustCountsDailyQueryTasks,
                connFeeQueryTask,
              ])
                .then((/* promiseAllResult */) => resolve(plantsMgConnRepo));
            })),
        ])
          .then(promiseAllResult => new Promise((resolve, reject) => {
            //
            // 2. call report resource handler
            const xlsReportHandlersRegistry = require('../../../xls-report-handlers-registry');
            xlsReportHandlersRegistry.handle(`mg-biz-kpi${context.variant && context.variant.length ? `-${context.variant}` : ''}`, {
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
                  fileNameBuilder: function (fileNameBuilderContext) {
                    return `Schedule3_PartB_1_a__MG-KPIs__${fileNameBuilderContext.year}-${fileNameBuilderContext.month}`
                  },
                  session: context.session,
                  templateKey: 'mg-biz-kpi',
                }
              ))
              .then(notifyResult => {
                if (notifyResult.status === 200) {
                  resolve(notifyResult.session
                    ? { session: notifyResult.session }
                    : undefined);
                } else {
                  reject(localUtil.buildNotifyError(notifyResult));
                }
              })
              .catch(error => reject(error));
          }))
          .then(handleResult => resolve(handleResult))
          .catch(error => reject(error));
      } catch (error) {
        reject(error);
      }
    });
  }
}


module.exports = MgConnCustHandler;


//
// private part

const tariffsRepo = {
  byProject: {
    'WP1': {
      lccy: 'SLL',
      exchangeRate: 9400.0,
      element: {
        vat: {
          all: {
            start: 0.15,
          },
        },
        connFee: {
          chc: {
            start: 0.0,
          },
          commercial: {
            start: 150000.0,
            '2020-11-01': 193739.0,
          },
          household: {
            start: 150000.0,
            '2020-11-01': 193739.0,
          },
          public: {
            start: 150000.0,
            '2020-11-01': 193739.0,
          },
          productive: {
            start: 150000.0,
            '2020-11-01': 193739.0,
          },
        },
        scLccy: {
          chc: {
            start: 0.0,
          },
          commercial: {
            start: 23000.0,
            '2020-11-01': 12923.7,
          },
          household: {
            start: 23000.0,
            '2020-11-01': 12923.7,
          },
          public: {
            start: 23000.0,
            '2020-11-01': 12923.7,
          },
          productive: {
            start: 23000.0,
            '2020-11-01': 12923.7,
          },
        },
        kcLccy: {
          chc: {
            start: 7596,
            '2020-11-01': 8428.35,
          },
          commercial: {
            start: 7596,
            '2020-11-01': 8428.35,
          },
          household: {
            start: 7596,
            '2020-11-01': 8428.35,
          },
          public: {
            start: 7596,
            '2020-11-01': 8428.35,
          },
          productive: {
            start: 7596,
            '2020-11-01': 8428.35,
          },
        },
      },
    },
  },
  byPlant: {
  },
  loadConnFeesHist: function (eConnFeesHistByPlant) {
    eConnFeesHistByPlant.forEach(eConnFeesHistItem => {
      this.byPlant[eConnFeesHistItem._id.m] = this.byPlant[eConnFeesHistItem._id.m] || {}
      this.byPlant[eConnFeesHistItem._id.m].connFee = this.byPlant[eConnFeesHistItem._id.m].connFee || {}
      this.byPlant[eConnFeesHistItem._id.m].connFee[eConnFeesHistItem._id.ct] = this.byPlant[eConnFeesHistItem._id.m].connFee[eConnFeesHistItem._id.ct] || {}
      this.byPlant[eConnFeesHistItem._id.m].connFee[eConnFeesHistItem._id.ct][eConnFeesHistItem._id.d] = eConnFeesHistItem.cnt
    });
  },
  getLocalCurrency: function (project) {
    return this.byProject[project].lccy;
  },
  getExchangeRate: function (project) {
    return this.byProject[project].exchangeRate;
  },
  getVatAtYearMonth: function (
    cache,
    project,
    rawTargetDate,
  ) {
    return this.getTariffElementAtYearMonth(
      cache,
      project,
      'all',
      'vat',
      rawTargetDate,
    );
  },
  getStandingChargeAtYearMonth: function (
    cache,
    project,
    commCat,
    rawTargetDate,

  ) {
    return this.getTariffElementAtYearMonth(
      cache,
      project,
      commCat,
      'scLccy',
      rawTargetDate,
    );
  },
  getTariffPerKwhAtYearMonth: function (
    cache,
    project,
    commCat,
    rawTargetDate,
  ) {
    return this.getTariffElementAtYearMonth(
      cache,
      project,
      commCat,
      'kcLccy',
      rawTargetDate,
    );
  },
  getTariffElementAtYearMonth: function (
    cache,
    project,
    commCat,
    element,
    rawTargetDate,
  ) {
    if (!cache[project]) { cache[project] = {}; }
    if (!cache[project][commCat]) { cache[project][commCat] = {}; }
    if (!cache[project][commCat][rawTargetDate]) { cache[project][commCat][rawTargetDate] = {} }
    let result = cache[project][commCat][rawTargetDate][element];

    if (!result) {
      result = this.byProject[project].element[element][commCat].start;

      const tariffChangeRawDates = Object.keys(this.byProject[project].element[element][commCat]);
      let index = 1;
      while (index < tariffChangeRawDates.length && (new Date(rawTargetDate).getTime() > new Date(tariffChangeRawDates[index]).getTime())) {
        result = this.byProject[project].element[element][commCat][tariffChangeRawDates[index]];
        index++;
      }

      cache[project][commCat][rawTargetDate][element] = result;
    }

    return result;
  },
  getTotalConnFeesAtYearMonth: function (
    cache,
    project,
    plant,
    commCat,
    rawTargetDate,
  ) {
    if (!cache[plant]) { cache[plant] = {}; }
    if (!cache[plant][commCat]) { cache[plant][commCat] = {}; }
    let result = cache[plant][commCat][rawTargetDate];

    if (!result) {
      const totalCustomers = this.byPlant[plant].connFee[commCat][rawTargetDate]

      if (!totalCustomers) {
        result = {
          total: 0.0,
          getCellValue () {
            return this.total;
          }
        };
      } else {
        const connFeeAtPeriod = this.getTariffElementAtYearMonth(cache, project, commCat, 'connFee', rawTargetDate);
        result = {
          total: connFeeAtPeriod * totalCustomers,
          getCellValue () {
            return {
              formula: `${connFeeAtPeriod} * ${totalCustomers}`,
            };
          },
        };
      }

      cache[plant][commCat][rawTargetDate] = result;
    }

    return result;
  },
};
