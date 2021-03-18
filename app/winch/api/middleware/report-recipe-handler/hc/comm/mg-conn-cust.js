const {
  Handler,
} = require('../../../../../../../api/lib/util/handler')

// TODO
// const {
//   // NumberFormatter,
//   DateFormatter,
// } = require('../../../../../../../api/lib/util/formatter');
// const {
//   buildPlantFilters,
//   buildPlantFiltersRepo
// } = require('../../../../controllers/plant/_shared');
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

        //
        // 2. call report resource handler
        const xlsReportHandlersRegistry = require('../../../xls-report-handlers-registry');
        xlsReportHandlersRegistry.handle('mg-conn-cust', {
          in: context,
          // locale: context.i18n.locale || 'en-GB',
          // timeZone: context.i18n.timeZone || 'Europe/London',
          // period: context.period,
          // filterSource: context.filter,
          // yearly: {
          //   period: context.period.yearly,
          //   gen: promiseAllResult[4],
          //   deliv: promiseAllResult[0],
          // },
          // monthly: {
          //   period: context.period.monthly,
          //   gen: promiseAllResult[5],
          //   deliv: promiseAllResult[1],
          // },
          // weekly: {
          //   period: context.period.weekly,
          //   gen: promiseAllResult[6],
          //   deliv: promiseAllResult[2],
          // },
          // daily: {
          //   period: context.period.daily,
          //   gen: promiseAllResult[7],
          //   deliv: promiseAllResult[3],
          // },
          // startOfBusinessDatesByPlantId: promiseAllResult[8],
          // eForecast: promiseAllResult[10],
          // battForecast: promiseAllResult[9],
        })
          // 
          // 3. notify report resource
          .then(xlsMaker => localUtil.notifyAll(
            xlsMaker,
            {
              notifications: context.notifications,
              period: context.selection.period,
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
      } catch (error) {
        reject(error);
      }
    });
  }
}

//
// private part 


// TODO
// return new Promise((resolve, reject) => {
//   const dateFormatter = DateFormatter.buildISOZoneDateFormatter();

//   // ensure defaults
//   context.period = context.period || {};
//   context.period.to = context.period.to || DateFormatter.formatDateOrDefault(new Date(), dateFormatter);

//   // build date ranges per period
//   const endDateRef = new Date(context.period.to);
//   const endMonthRef = new Date(new Date(endDateRef).setDate(1));
//   const endWeekRef = new Date(new Date(endDateRef).setDate(endDateRef.getDate() - (endDateRef.getDay() + 6) % 7));
//   context.period.yearly = {
//     tsFrom: `${endDateRef.getFullYear() - 3}-01-01`,
//     tsTo: `${endDateRef.getFullYear()}-01-01`,
//   };
//   context.period.monthly = {
//     tsFrom: DateFormatter.formatDateOrDefault(new Date(new Date(endMonthRef).setMonth(endMonthRef.getMonth() - 2)), dateFormatter),
//     tsTo: DateFormatter.formatDateOrDefault(endMonthRef, dateFormatter),
//   };
//   context.period.weekly = {
//     tsFrom: DateFormatter.formatDateOrDefault(new Date(new Date(endWeekRef).setDate(endWeekRef.getDate() - 28)), dateFormatter),
//     tsTo: DateFormatter.formatDateOrDefault(endWeekRef, dateFormatter),
//   };
//   context.period.daily = {
//     tsFrom: DateFormatter.formatDateOrDefault(new Date(new Date(endDateRef).setDate(endDateRef.getDate() - 31)), dateFormatter),
//     tsTo: context.period.to,
//   };
//   context.period.dailyClusters = {
//     tsFrom: DateFormatter.formatDateOrDefault(new Date(new Date(endDateRef).setDate(endDateRef.getDate() - 15)), dateFormatter),
//     tsTo: context.period.to,
//   };
//   const sharedDelivCatReqContext = {
//     aggregator: 'categories',
//   };
//   const sharedGenReqContext = {
//     aggregator: 'plants',
//   };

//   // perform required queries
//   const PlantLogCtrl = require('../../../../controllers/plant/log');
//   const PlantCtrl = require('../../../../controllers/plant');
//   const PlantServiceLogCtrl = require('../../../../controllers/plant/service/log');
//   const plantFilters = buildPlantFilters(context.filter);
//   Promise.all([
//     // 0) del.1
//     PlantLogCtrl.aggregateDeliveryByCustomerCategory(
//       'yearly',
//       {
//         ...context.filter,
//         ...context.period.yearly,
//       },
//       sharedDelivCatReqContext),
//     // 1) del.2
//     PlantLogCtrl.aggregateDeliveryByCustomerCategory(
//       'monthly',
//       {
//         ...context.filter,
//         ...context.period.monthly,
//       },
//       sharedDelivCatReqContext),
//     // 2) del.3
//     PlantLogCtrl.aggregateDeliveryByCustomerCategory(
//       'weekly',
//       {
//         ...context.filter,
//         ...context.period.weekly,
//       },
//       sharedDelivCatReqContext),
//     // 3) del.4
//     PlantLogCtrl.aggregateDeliveryByCustomerCategory(
//       'daily',
//       {
//         ...context.filter,
//         ...context.period.daily,
//       },
//       sharedDelivCatReqContext),
//     // 4) gen.1
//     PlantLogCtrl.aggregateGen(
//       'yearly',
//       buildPlantFiltersRepo(
//         {
//           ...context.filter,
//           ...context.period.yearly,
//         },
//         false
//       ),
//       sharedGenReqContext),
//     // 5) gen.2
//     PlantLogCtrl.aggregateGen(
//       'monthly',
//       buildPlantFiltersRepo(
//         {
//           ...context.filter,
//           ...context.period.monthly,
//         },
//         false
//       ),
//       sharedGenReqContext),
//     // 6) gen.3
//     PlantLogCtrl.aggregateGen(
//       'weekly',
//       buildPlantFiltersRepo(
//         {
//           ...context.filter,
//           ...context.period.weekly,
//         },
//         false
//       ),
//       sharedGenReqContext),
//     // 7) gen.4
//     PlantLogCtrl.aggregateGen(
//       'daily',
//       buildPlantFiltersRepo(
//         {
//           ...context.filter,
//           ...context.period.daily,
//         },
//         true
//       ),
//       sharedGenReqContext),
//     // 8) plants
//     PlantCtrl.filteredPlants(
//       plantFilters.plantsFilter,
//       plantFilters.plantsStatusFilter,
//       plantFilters.plantsLocationsFilter || {},
//       {
//         name: 1,
//         'village.country': 1,
//         'village.name': 1,
//         'dates.business': 1,
//         'project.id': 1,
//         setup: 1,
//       },
//       { 'dates.business': 1, name: 1 },
//       true),
//     // 9) fsct.2.all-services
//     PlantServiceLogCtrl.aggregateSales(
//       'daily',
//       buildPlantFiltersRepo(
//         {
//           ...context.filter,
//           ...context.period.daily,
//         },
//         true,
//       ),
//       ['rent-batt'],
//     ),
//   ])
//     .then(promiseAllResult => resolve(Promise.all([
//       // 0) del.1
//       promiseAllResult[0].model.aggregate(promiseAllResult[0].aggregation.pipeline()).exec(),
//       // 1) del.2
//       promiseAllResult[1].model.aggregate(promiseAllResult[1].aggregation.pipeline()).exec(),
//       // 2) del.3
//       promiseAllResult[2].model.aggregate(promiseAllResult[2].aggregation.pipeline()).exec(),
//       // 3) del.4
//       promiseAllResult[3].model.aggregate(promiseAllResult[3].aggregation.pipeline()).exec(),
//       // 4) gen.1
//       new Promise(resolve => resolve(promiseAllResult[4].readResult)),
//       // 5) gen.2
//       new Promise(resolve => resolve(promiseAllResult[5].readResult)),
//       // 6) gen.3
//       new Promise(resolve => resolve(promiseAllResult[6].readResult)),
//       // 7) gen.4
//       new Promise(resolve => resolve(promiseAllResult[7].readResult)),
//       // 8) plants
//       new Promise(resolve => {
//         const startOfBusinessDatesByPlantId = {};
//         promiseAllResult[8].forEach(startOfBusinessDateItem => {
//           startOfBusinessDatesByPlantId[startOfBusinessDateItem._id] = {
//             name: startOfBusinessDateItem.name,
//             date: startOfBusinessDateItem.dates.business
//               ? DateFormatter.formatDateOrDefault(startOfBusinessDateItem.dates.business, dateFormatter)
//               : 'n.a.',
//             country: startOfBusinessDateItem.village.country['default-name'],
//             village: startOfBusinessDateItem.village.name,
//             project: startOfBusinessDateItem.project.id,
//             pvCap: startOfBusinessDateItem.setup.pv.cpty,
//             battCap: startOfBusinessDateItem.setup.batt.cpty,
//             genset: startOfBusinessDateItem.setup.genset.cpty,
//           }
//         })
//         resolve(startOfBusinessDatesByPlantId);
//       }),
//       // 9) fsct.2.all-services
//       new Promise(resolve => resolve(promiseAllResult[9].readResult)),
//       // 10) fcst.2.hierarcical-electricity
//       new Promise(resolve => {
//         const clusterizedForecastPromises = []
//         const clusterizer = new PlantsClusterizer(promiseAllResult[8]);
//         // per-country e-forecasts
//         if (!clusterizer.hasSingleCountry()) {
//           Object.entries(clusterizer.countryClusters()).forEach(countryCluster => {
//             clusterizedForecastPromises.push(
//               PlantLogCtrl.aggregateForecast(
//                 'daily',
//                 buildPlantFiltersRepo(
//                   {
//                     plants: countryCluster[1],
//                     ...context.period.dailyClusters,
//                   },
//                   true,
//                 )
//               )
//                 .then(clusterizedForecastResult => new Promise(resolve => {
//                   resolve({
//                     tag: 'country',
//                     cnt: countryCluster[1].length,
//                     key: countryCluster[0],
//                     value: clusterizedForecastResult.readResult
//                   })
//                 })));
//           });
//         }
//         // per-project e-forecasts
//         if (!clusterizer.hasSingleProject()) {
//           Object.entries(clusterizer.projectClusters()).forEach(projectCluster => {
//             clusterizedForecastPromises.push(
//               PlantLogCtrl.aggregateForecast(
//                 'daily',
//                 buildPlantFiltersRepo(
//                   {
//                     plants: projectCluster[1],
//                     ...context.period.dailyClusters,
//                   },
//                   true,
//                 )
//               )
//                 .then(clusterizedForecastResult => new Promise(resolve => {
//                   resolve({
//                     tag: 'project',
//                     cnt: projectCluster[1].length,
//                     key: projectCluster[0],
//                     value: clusterizedForecastResult.readResult
//                   })
//                 })));
//           });
//         }
//         // per-plant e-forecasts
//         if (!clusterizer.hasSinglePlant()) {
//           Object.entries(clusterizer.plantClusters()).forEach(plantCluster => {
//             clusterizedForecastPromises.push(
//               PlantLogCtrl.aggregateForecast(
//                 'daily',
//                 buildPlantFiltersRepo(
//                   {
//                     plants: plantCluster[1],
//                     ...context.period.dailyClusters,
//                   },
//                   true,
//                 )
//               )
//                 .then(clusterizedForecastResult => new Promise(resolve => {
//                   resolve({
//                     tag: 'plant',
//                     cnt: plantCluster[1].length,
//                     key: plantCluster[0],
//                     value: clusterizedForecastResult.readResult
//                   })
//                 })));
//           });
//         }
//         resolve(Promise.all(clusterizedForecastPromises)
//           .then(promiseAllResult => new Promise(resolve => {
//             const uncoveredPlants = new Set([...clusterizer.plantList()]);
//             const eForecastCluster = {
//               clusterizer,
//               totalizer: {
//                 sampleDates: {
//                   min: undefined,
//                   max: undefined,
//                 },
//                 finModel: {
//                   forecast: 0.0,
//                   actual: 0.0,
//                 },
//                 energy: {
//                   forecast: 0.0,
//                   actual: 0.0,
//                 }
//               }
//             }
//             promiseAllResult.forEach(clusterizedForecastResult => {
//               eForecastCluster[clusterizedForecastResult.tag] = eForecastCluster[clusterizedForecastResult.tag] || {}
//               eForecastCluster[clusterizedForecastResult.tag][clusterizedForecastResult.key] = {
//                 totalPlants: clusterizedForecastResult.cnt,
//                 value: clusterizedForecastResult.value
//               }
//               if (clusterizedForecastResult.value.length) {
//                 uncoveredPlants.delete(clusterizedForecastResult.key)
//                 const sampleIndex = clusterizedForecastResult.value.length - 1;
//                 const sampleDate = new Date(clusterizedForecastResult.value[sampleIndex]['_id']);
//                 if (!eForecastCluster.totalizer.sampleDates.min || eForecastCluster.totalizer.sampleDates.min > sampleDate) {
//                   eForecastCluster.totalizer.sampleDates.min = sampleDate;
//                 }
//                 if (!eForecastCluster.totalizer.sampleDates.max || eForecastCluster.totalizer.sampleDates.max < sampleDate) {
//                   eForecastCluster.totalizer.sampleDates.max = sampleDate;
//                 }
//                 eForecastCluster.totalizer.finModel.forecast += clusterizedForecastResult.value[sampleIndex]['fm-fcst-cum-tccy']
//                 eForecastCluster.totalizer.finModel.actual += clusterizedForecastResult.value[sampleIndex]['fm-real-cum-tccy']
//                 eForecastCluster.totalizer.energy.forecast += clusterizedForecastResult.value[sampleIndex]['es-fcst-cum']
//                 eForecastCluster.totalizer.energy.actual += clusterizedForecastResult.value[sampleIndex]['es-real-cum']
//               }
//             });
//             resolve({
//               uncoveredPlants,
//               eForecastCluster,
//             })
//           }))
//           .then(eForecastClusterResult => new Promise(resolve => {
//             const uncoveredClusterizedForecastPromises = [
//               new Promise(resolve => resolve(eForecastClusterResult.eForecastCluster))
//             ];
//             eForecastClusterResult.uncoveredPlants.forEach(uncoveredClusterKey => {
//               uncoveredClusterizedForecastPromises.push(
//                 PlantLogCtrl.aggregateForecast(
//                   'daily',
//                   buildPlantFiltersRepo(
//                     {
//                       // tsTo: context.period.dailyClusters.tsTo,
//                       tsTo: DateFormatter.formatDateOrDefault(new Date(new Date(context.period.dailyClusters.tsTo).setDate(new Date(context.period.dailyClusters.tsTo).getDate() - 1)), dateFormatter),
//                       plants: clusterizer.plantClusters()[uncoveredClusterKey],
//                     },
//                     true,
//                   ),
//                   {},
//                   {
//                     limit: 1,
//                     sort: {
//                       ts: -1
//                     }
//                   }
//                 )
//                   .then(uncoveredPlantClusterForecastResult => new Promise(resolve => {
//                     resolve({
//                       key: uncoveredClusterKey,
//                       value: uncoveredPlantClusterForecastResult.readResult
//                     })
//                   })));
//             });
//             resolve(Promise.all(uncoveredClusterizedForecastPromises))
//           }))
//           .then(promiseAllResult => new Promise(resolve => {
//             for (let index = 1; index < promiseAllResult.length; index++) {
//               if (promiseAllResult[index].value.length) {
//                 promiseAllResult[0]['plant'] = promiseAllResult[0]['plant'] || {}
//                 promiseAllResult[0]['plant'][promiseAllResult[index].key] = {
//                   totalPlants: 1,
//                   value: promiseAllResult[index].value
//                 };
//                 const sampleDate = new Date(promiseAllResult[index].value[0]['_id']);
//                 if (!promiseAllResult[0].totalizer.sampleDates.min || promiseAllResult[0].totalizer.sampleDates.min > sampleDate) {
//                   promiseAllResult[0].totalizer.sampleDates.min = sampleDate;
//                 }
//                 if (!promiseAllResult[0].totalizer.sampleDates.max || promiseAllResult[0].totalizer.sampleDates.max < sampleDate) {
//                   promiseAllResult[0].totalizer.sampleDates.max = sampleDate;
//                 }
//                 promiseAllResult[0].totalizer.finModel.forecast += promiseAllResult[index].value[0]['fm-fcst-cum-tccy'];
//                 promiseAllResult[0].totalizer.finModel.actual += promiseAllResult[index].value[0]['fm-real-cum-tccy'];
//                 promiseAllResult[0].totalizer.energy.forecast += promiseAllResult[index].value[0]['es-fcst-cum'];
//                 promiseAllResult[0].totalizer.energy.actual += promiseAllResult[index].value[0]['es-real-cum'];
//               }
//             }
//             promiseAllResult[0].totalizer.diff += 100 * (promiseAllResult[0].totalizer.actual - promiseAllResult[0].totalizer.forecast) / promiseAllResult[0].totalizer.forecast;
//             resolve(promiseAllResult[0])
//           }))
//         );
//       }),
//     ])))
// })
//   .then(promiseAllResult => new Promise(resolve => {
//     const pdfReportHandlersRegistry = require('../../../pdf-report-handlers-registry');
//     promiseAllResult[0];
//     resolve(pdfReportHandlersRegistry.handle('summary-base', {
//       locale: context.i18n.locale || 'en-GB',
//       timeZone: context.i18n.timeZone || 'Europe/London',
//       period: context.period,
//       filterSource: context.filter,
//       yearly: {
//         period: context.period.yearly,
//         gen: promiseAllResult[4],
//         deliv: promiseAllResult[0],
//       },
//       monthly: {
//         period: context.period.monthly,
//         gen: promiseAllResult[5],
//         deliv: promiseAllResult[1],
//       },
//       weekly: {
//         period: context.period.weekly,
//         gen: promiseAllResult[6],
//         deliv: promiseAllResult[2],
//       },
//       daily: {
//         period: context.period.daily,
//         gen: promiseAllResult[7],
//         deliv: promiseAllResult[3],
//       },
//       startOfBusinessDatesByPlantId: promiseAllResult[8],
//       eForecast: promiseAllResult[10],
//       battForecast: promiseAllResult[9],
//     }));
//   }))
//   .then(pdfReportBlob => new Promise(resolve => resolve([
//     {
//       filename: `Report_WP1summary_${context.period.to}.pdf`,
//       content: pdfReportBlob
//     }
//   ])))
//   .then(attachments => new Promise((resolve, reject) => {
//     try {
//       const Notifier = require('../../../notifier')

//       context.notifications.forEach(recipient => {
//         Notifier[`send_${recipient.channel}_a_dt`]({
//           recipients: recipient.address,
//           template: context.mailTemplate,
//           templateContext: {
//             reportType: 'WP1 Summary',
//             title: 'WP1 Summary report',
//           },
//           attachments,
//         });
//       });

//       resolve();
//     } catch (error) {
//       if (process.env.DEV) {
//         /* eslint-disable-next-line no-console */
//         console.error(`error sending mail with dynamic template -> ${error.message}`)
//       }
//       reject(error);
//     }
//   }))
//   .catch(error => reject(error));
//     }
// }


module.exports = MgConnCustHandler;

//
// private part

// TODO
// class PlantsClusterizer {
//   constructor (plantList) {
//     this._inputPlantList = plantList || []
//     this._countryList = undefined
//     this._projectList = undefined
//     this._plantList = undefined
//   }

//   countryList () {
//     if (!this._countryList) {
//       this._countryList = [...new Set(this._inputPlantList.map(plantInfo => plantInfo.village.country['default-name']))]
//     }
//     return this._countryList
//   }

//   countryClusters () {
//     return this.buildCluster(plantInfo => plantInfo.village.country['default-name'])
//   }

//   projectList () {
//     if (!this._projectList) {
//       this._projectList = [...new Set(this._inputPlantList.map(plantInfo => plantInfo.project.id))]
//     }
//     return this._projectList
//   }

//   projectClusters () {
//     return this.buildCluster(plantInfo => plantInfo.project.id)
//   }

//   plantList () {
//     if (!this._plantList) {
//       this._plantList = [...new Set(this._inputPlantList.map(plantInfo => plantInfo.name))]
//     }
//     return this._plantList
//   }

//   plantClusters () {
//     return this.buildCluster(plantInfo => plantInfo.name)
//   }

//   hasSingleCountry () {
//     return this.countryList().length === 1
//   }

//   hasSingleProject () {
//     return this.projectList().length === 1
//   }

//   hasSinglePlant () {
//     return this.plantList().length === 1
//   }

//   buildCluster (keyExtractor, valueExtractor = plantInfo => plantInfo._id) {
//     const result = {}
//     this._inputPlantList.forEach(plantInfo => {
//       const key = keyExtractor(plantInfo)
//       result[key] = result[key] || []
//       result[key].push(valueExtractor(plantInfo))
//     })
//     return result
//   }

//   projectClustersByCountry (country) {
//     const projectsByCountry = [...new Set(this.buildCluster(plantInfo => plantInfo.village.country['default-name'], plantInfo => plantInfo.project.id)[country])]
//     const cluster = {}
//     projectsByCountry.forEach(clusterKey => {
//       cluster[clusterKey] = this.projectClusters()[clusterKey]
//     })
//     return cluster
//   }

//   plantClustersByProject (project) {
//     const plantsByProject = [...new Set(this.buildCluster(plantInfo => plantInfo.project.id, plantInfo => plantInfo.name)[project])]
//     const cluster = {}
//     plantsByProject.forEach(clusterKey => {
//       cluster[clusterKey] = this.plantClusters()[clusterKey]
//     })
//     return cluster
//   }
// }
