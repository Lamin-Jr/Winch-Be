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
        // const PlantLogCtrl = require('../../../../controllers/plant/log');
        // const PlantCounterCtrl = require('../../../../controllers/plant/counter');
        const Customer2 = require('../../../../models/customer2');

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

                const period = localUtil.buildECustCountPeriodFilter(context, plantItem.dates.business)

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
                    period,
                    queryFilter: {
                      eCustCards: {
                        plant: plantItem._id,
                      },
                    },
                    customers: [],
                  }
                }
              });

              resolve({ // plantsMgOnbrdRepo
                list: plantList,
                byProject: plantsByProject,
                months: {},
              });
            }))
            .then(plantsMgOnbrdRepo => new Promise(resolve => {
              const monthsCalculator = {
                min: null,
                max: null,
                addSample: function (from, to) {
                  if (this.min == null || new Date(from).getTime() < new Date(this.min).getTime()) {
                    this.min = from;
                  }
                  if (this.max == null || new Date(this.max).getTime() < new Date(to).getTime()) {
                    this.max = to;
                  }
                },
                calculate () {
                  const result = {};
                  let monthIndex = this.min
                  while (new Date(monthIndex).getTime() <= new Date(this.max).getTime()) {
                    result[monthIndex] = localUtil.getTotalDaysOfMonth(monthIndex);
                    const monthIndexAsDate = new Date(monthIndex);
                    monthIndex = DateFormatter.formatDateOrDefault(new Date(monthIndexAsDate.setMonth(monthIndexAsDate.getMonth() + 1)), dateFormatter);
                  }
                  return result;
                }
              }
              const eCustCardsQueryTasks = [];
              Object.values(plantsMgOnbrdRepo.byProject).forEach(plantsById => {
                Object.entries(plantsById).forEach(plantEntry => {
                  monthsCalculator.addSample(plantEntry[1].samples.period.tsFrom, plantEntry[1].samples.period.tsTo);

                  eCustCardsQueryTasks.push(
                    Customer2.find({ plant: plantEntry[0], active: true }).sort({ pod: 1 }).exec()
                      .then(eCustCardsByPlant => new Promise(resolve => {
                        eCustCardsByPlant.forEach(sample => {
                          plantEntry[1].samples.customers.push(sample)
                        });
                        resolve();
                      }))
                  );
                });
              });

              plantsMgOnbrdRepo.months = monthsCalculator.calculate();

              Promise.all([
                ...eCustCardsQueryTasks,
              ])
                .then((/* promiseAllResult */) => resolve(plantsMgOnbrdRepo));
            })),
        ])
          .then(promiseAllResult => new Promise((resolve, reject) => {
            //
            // 2. call report resource handler
            const xlsReportHandlersRegistry = require('../../../xls-report-handlers-registry');
            xlsReportHandlersRegistry.handle('mg-onbrd-cust', {
              in: context,
              // plantsMgOnbrdRepo
              data: promiseAllResult[0],
            })
              // 
              // 3. notify report resource
              .then(xlsOutContextList => localUtil.notifyAll(
                xlsOutContextList,
                {
                  notifications: context.notifications,
                  templateKey: 'mg-onbrd-cust',
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


//
// private part

const tariffsRepo = {
  byProject: {
    'WP1': {
      lccy: 'SLL',
      exchangeRate: 9400.0,
      element: {
        scLccy: {
          chc: {
            start: 0,
          },
          commercial: {
            start: 23000,
            '2020-11-01': 12923.7,
          },
          household: {
            start: 23000,
            '2020-11-01': 12923.7,
          },
          public: {
            start: 23000,
            '2020-11-01': 12923.7,
          },
          productive: {
            start: 23000,
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
  getLocalCurrency: function (project) {
    return this.byProject[project].lccy;
  },
  getExchangeRate: function (project) {
    return this.byProject[project].exchangeRate;
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
  }
};

// TODO: to add custom notes
const notesRepo = {
  cell: {
    row: {
      start: 45,
      offset: 11,
    },
    col: {
      start: 2,
      span: 11,
    },
  },
};