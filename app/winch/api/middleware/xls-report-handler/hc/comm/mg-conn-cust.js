const {
  Handler,
} = require('../../../../../../../api/lib/util/handler');


const {
  initExcelJS,
  buildBasicDocumentOption,
  buildPortraitPageSetup,
} = require('../../../xls');


const { loadDmsInstance } = require('../util');


class MgConnCustHandler extends Handler {
  constructor () {
    super();
  }

  handle (context) {
    return new Promise((resolve, reject) => {
      try {
        //
        // 1a. perform preliminary operations upon context
        const dmsInstance = loadDmsInstance(context);
        const dmsEngineContext = dmsInstance.context;

        //
        // 1b. init processing resources
        const ExcelJS = initExcelJS();
        const now = new Date();
        const xlsWbOutputTasks = [];
        const cellMapping = {
          row: {
            histCust: {
              active: 14,
              notActive: 15,
            },
            avg: {
              dailyUsage: 17,
              subscriptionSalePrice: {
                lccy: 18,
                tccy: 19,
              },
              consumption: 20,
              eSalePrice: {
                lccy: 21,
                tccy: 22,
              },
              perUserRevenue: {
                lccy: 23,
                tccy: 24,
              },
            },
            nonPaid: {
              consRatio: 25,
              daysOfServiceRatio: 26,
            },
            monthlyRevs: {
              cash: {
                lccy: 29,
                tccy: 36,
              },
              mobileMoney: {
                lccy: 30,
                tccy: 37,
              },
              connectionFees: {
                lccy: 31,
                tccy: 38,
              },
              total: {
                lccy: 32,
                tccy: 39,
              },
              exchangeRate: 34,
            },
          },
          col: {
            dimUnit: 'E',
            total: 'F',
            chc: 'G',
            commercial: 'H',
            household: 'I',
            public: 'J',
            productive: 'K',
            notes: 'L',
          },
        };
        const tariffsCache = {};

        Object.entries(context.data.months).forEach(monthEntry => {
          const period = monthEntry[0];
          const daysWithinPeriod = monthEntry[1];

          Object.entries(context.data.byProject).forEach(plantByProjectEntry => {
            const projectName = plantByProjectEntry[0];
            const plantById = plantByProjectEntry[1];
            const projectWithinPeriodWorkbook = new ExcelJS.Workbook();

            let xlsOutputTask = projectWithinPeriodWorkbook.xlsx.readFile(
              dmsEngineContext.buildPathFromWorkDir(
                dmsEngineContext.basePathKey.HC_COMM,
                ...dmsEngineContext.pathSegment.oReport.oHc.vTemplate,
                'mg-conn-cust.xlsx'
              )
            )
              .then(workbook => new Promise(resolve => {
                // 
                // 2. fill in report resource (single project)
                buildBasicDocumentOption(workbook);
                buildPortraitPageSetup(workbook);

                const sheetRef = {
                  summary: workbook.getWorksheet(1),
                };
                const countries = new Set();

                const issueDateCell = sheetRef.summary.getCell('C5');
                issueDateCell.name = 'issueDate';
                issueDateCell.value = now;
                const periodCell = sheetRef.summary.getCell('C6');
                periodCell.name = 'period';
                periodCell.value = new Date(period);
                const countryCell = sheetRef.summary.getCell('C7')
                countryCell.name = 'country';
                const projectCell = sheetRef.summary.getCell('C8');
                projectCell.name = 'project';
                projectCell.value = projectName;
                const miniGridCell = sheetRef.summary.getCell('C9');
                miniGridCell.name = 'miniGrid'

                const localCcyCell = sheetRef.summary.getCell(`${cellMapping.col.dimUnit}${cellMapping.row.monthlyRevs.total.lccy}`);
                localCcyCell.name = 'localCcy';
                localCcyCell.value = context.data.tariffsRepo.getLocalCurrency(projectName);
                const exchageRateCell = sheetRef.summary.getCell(`D${cellMapping.row.monthlyRevs.exchangeRate}`);
                exchageRateCell.name = 'exchangeRate';
                exchageRateCell.value = context.data.tariffsRepo.getExchangeRate(projectName);

                Object.entries(plantById).forEach(plantEntry => {
                  countries.add(plantEntry[1].country);
                  sheetRef[plantEntry[0]] = workbook.addWorksheet(plantEntry[1].name);
                  sheetRef[plantEntry[0]].model = Object.assign(JSON.parse(JSON.stringify(sheetRef.summary.model)), {
                    mergeCells: sheetRef.summary.model.merges
                  });
                  sheetRef[plantEntry[0]].name = plantEntry[1].name;

                  sheetRef[plantEntry[0]].getCell('C5').value = { formula: issueDateCell.name };
                  sheetRef[plantEntry[0]].getCell('C6').value = { formula: periodCell.name };
                  sheetRef[plantEntry[0]].getCell('C7').value = { formula: countryCell.name };
                  sheetRef[plantEntry[0]].getCell('C8').value = { formula: projectCell.name };
                  sheetRef[plantEntry[0]].getCell('C9').value = plantEntry[1].name;

                  sheetRef[plantEntry[0]].getCell(`${cellMapping.col.dimUnit}${cellMapping.row.monthlyRevs.total.lccy}`).value = {
                    formula: localCcyCell.name,
                  };
                  sheetRef[plantEntry[0]].getCell(`D${cellMapping.row.monthlyRevs.exchangeRate}`).value = {
                    formula: exchageRateCell.name,
                  };

                  const selectedSamples = plantEntry[1].samples.byPeriod[period];
                  if (selectedSamples) {
                    const sampledCommCat = new Set();
                    const avgCalculator = {
                      all: {
                        eCons: 0.0,
                        eSoldLccy: 0.0,
                        totSubscriptionFeeLccy: 0.0,
                        samplesCount: 0,
                      },
                      addMonthlySample: function (commCat, eCons, eSoldLccy, subscriptionFeeLccy, activeCustomersCount) {
                        this[commCat] = this[commCat] || {
                          eCons: 0.0,
                          eSoldLccy: 0.0,
                          totSubscriptionFeeLccy: 0.0,
                          samplesCount: 0,
                        };
                        const totSubscriptionFeeLccy = subscriptionFeeLccy * activeCustomersCount;
                        this[commCat].eCons += eCons;
                        this[commCat].eSoldLccy += eSoldLccy;
                        this[commCat].totSubscriptionFeeLccy += totSubscriptionFeeLccy;
                        this[commCat].samplesCount++;
                        this.all.eCons += eCons;
                        this.all.eSoldLccy += eSoldLccy;
                        this.all.totSubscriptionFeeLccy += totSubscriptionFeeLccy;
                        this.all.samplesCount++;
                      },
                      getAverageTariffFormula: function (commCat = 'all') {
                        return {
                          formula: `${this[commCat].eSoldLccy} / ${this[commCat].eCons}`
                        }
                      },
                      getArpuFormula: function (commCat = 'all') {
                        return {
                          formula: `(${this[commCat].totSubscriptionFeeLccy} + ${this[commCat].eSoldLccy}) / ${cellMapping.col[commCat === 'all' ? 'total' : commCat]}${cellMapping.row.histCust.active}`
                        }
                      },
                      checkExpectedSamplesCount (expectedSamplesCount, commCat = 'all') {
                        return this[commCat].samplesCount === expectedSamplesCount;
                      }
                    };

                    Object.entries(selectedSamples).forEach(sampleEntry => {
                      if (!cellMapping.col[sampleEntry[0]]) {
                        // excelude don't care categories (e.g. MoPo)
                        return;
                      }
                      sampledCommCat.add(cellMapping.col[sampleEntry[0]]);
                      const commCatColRef = cellMapping.col[sampleEntry[0]];
                      if (commCatColRef) {
                        const activeCustomersCount = sampleEntry[1].eCustCounters.consumingBySelling;
                        const monthlySubscrptionFee = context.data.tariffsRepo.getStandingChargeAtYearMonth(tariffsCache, projectName, sampleEntry[0], period);

                        sheetRef[plantEntry[0]].getCell(`${commCatColRef}${cellMapping.row.histCust.active}`).value = activeCustomersCount;
                        sheetRef[plantEntry[0]].getCell(`${commCatColRef}${cellMapping.row.histCust.notActive}`).value = sampleEntry[1].eCustCounters.connected - activeCustomersCount;

                        if (sampleEntry[1].eDeliv) {
                          if (sampleEntry[0] === 'chc') {
                            // TODO: define right value to write on CHC column
                            // sheetRef[plantEntry[0]].getCell(`${commCatColRef}${cellMapping.row.monthlyRevs.cash.lccy}`).value = sampleEntry[1].eDeliv['r-es-lccy'];
                          } else {
                            sheetRef[plantEntry[0]].getCell(`${commCatColRef}${cellMapping.row.monthlyRevs.cash.lccy}`).value = sampleEntry[1].eDeliv['tx-es-lccy'];
                          }

                          avgCalculator.addMonthlySample(sampleEntry[0], sampleEntry[1].eDeliv['es'], sampleEntry[1].eDeliv['r-es-lccy'], monthlySubscrptionFee, activeCustomersCount);
                          // if required to have tariff for the period: context.data.tariffsRepo.getTariffPerKwhAtYearMonth(tariffsCache, projectName, sampleEntry[0], period);
                          if (activeCustomersCount) {
                            sheetRef[plantEntry[0]].getCell(`${commCatColRef}${cellMapping.row.avg.eSalePrice.lccy}`).value = avgCalculator.getAverageTariffFormula(sampleEntry[0]);
                            sheetRef[plantEntry[0]].getCell(`${commCatColRef}${cellMapping.row.avg.perUserRevenue.lccy}`).value = avgCalculator.getArpuFormula(sampleEntry[0]);
                          }
                        }

                        if (sampleEntry[1].dailyStats) {
                          const dailyUsage = Object.values(sampleEntry[1].dailyStats.pod).filter(days => days > 0);
                          if (dailyUsage.length) {
                            sheetRef[plantEntry[0]].getCell(`${commCatColRef}${cellMapping.row.avg.dailyUsage}`).value = dailyUsage.reduce((acc, current) => (acc + current)) / dailyUsage.length;
                          }

                          if (activeCustomersCount) {
                            sheetRef[plantEntry[0]].getCell(`${commCatColRef}${cellMapping.row.avg.subscriptionSalePrice.lccy}`).value = {
                              formula: `${monthlySubscrptionFee}/${commCatColRef}${cellMapping.row.avg.dailyUsage}`
                            };

                            if (sampleEntry[1].pods) {
                              let commCatAvgDailyConsumption = 0.0, podSamplesCount = 0;
                              sampleEntry[1].pods.forEach(pod => {
                                if (sampleEntry[1].dailyStats.pod[pod._id.pod] > 0) {
                                  commCatAvgDailyConsumption += (pod['es'] + pod['ep']) / sampleEntry[1].dailyStats.pod[pod._id.pod];
                                  podSamplesCount++;
                                }
                              });
                              if (activeCustomersCount !== podSamplesCount) {
                                console.warn(`no match between active customers (${activeCustomersCount}) and pod-related samples (${podSamplesCount}) in ${sampleEntry[0]} cat. of ${plantEntry[1].name}/${period}, fix it!`);
                              }
                              sheetRef[plantEntry[0]].getCell(`${commCatColRef}${cellMapping.row.avg.consumption}`).value = {
                                formula: `${commCatAvgDailyConsumption}/${commCatColRef}${cellMapping.row.histCust.active}`
                              };

                              sheetRef[plantEntry[0]].getCell(`${commCatColRef}${cellMapping.row.nonPaid.consRatio}`).value = 0;
                              sheetRef[plantEntry[0]].getCell(`${commCatColRef}${cellMapping.row.nonPaid.daysOfServiceRatio}`).value = 0;
                            }
                          }
                        }
                      }
                    });
                    if (sampledCommCat.size) {
                      let dailyUsageSumProd = '';
                      let subscriptionSalePriceSumProd = '';
                      let consumptionSumProd = '';
                      [...sampledCommCat].forEach(colWithValues => {
                        dailyUsageSumProd += `+${colWithValues}${cellMapping.row.avg.dailyUsage}*${colWithValues}${cellMapping.row.histCust.active}`;
                        subscriptionSalePriceSumProd += `+${colWithValues}${cellMapping.row.avg.subscriptionSalePrice.lccy}*${colWithValues}${cellMapping.row.histCust.active}`;
                        consumptionSumProd += `+${colWithValues}${cellMapping.row.avg.consumption}*${colWithValues}${cellMapping.row.histCust.active}`;
                      });
                      sheetRef[plantEntry[0]].getCell(`${cellMapping.col.total}${cellMapping.row.avg.dailyUsage}`).value = {
                        formula: `(${dailyUsageSumProd})/${cellMapping.col.total}${cellMapping.row.histCust.active}`,
                      };
                      sheetRef[plantEntry[0]].getCell(`${cellMapping.col.total}${cellMapping.row.avg.subscriptionSalePrice.lccy}`).value = {
                        formula: `(${subscriptionSalePriceSumProd})/${cellMapping.col.total}${cellMapping.row.histCust.active}`,
                      };
                      sheetRef[plantEntry[0]].getCell(`${cellMapping.col.total}${cellMapping.row.avg.consumption}`).value = {
                        formula: `(${consumptionSumProd})/${cellMapping.col.total}${cellMapping.row.histCust.active}`,
                      };
                      sheetRef[plantEntry[0]].getCell(`${cellMapping.col.total}${cellMapping.row.avg.eSalePrice.lccy}`).value = avgCalculator.getAverageTariffFormula();
                      sheetRef[plantEntry[0]].getCell(`${cellMapping.col.total}${cellMapping.row.avg.perUserRevenue.lccy}`).value = avgCalculator.getArpuFormula();
                      sheetRef[plantEntry[0]].getCell(`${cellMapping.col.total}${cellMapping.row.nonPaid.consRatio}`).value = 0;
                      sheetRef[plantEntry[0]].getCell(`${cellMapping.col.total}${cellMapping.row.nonPaid.daysOfServiceRatio}`).value = 0;
                    }
                  } else {
                    // TODO: add note on missing data for current plant on summary ws
                  }
                });

                countryCell.value = [...countries].join(', ');
                miniGridCell.value = `All ${Object.keys(plantById).length} (see other sheets)`;

                resolve({
                  workbook,
                  sheetRef,
                });
              }));

            xlsOutputTask = xlsOutputTask
              .then((/*promiseAllResult*/) => {
                //
                // 3. return report resource (single project)
                return {
                  xlsMaker: projectWithinPeriodWorkbook.xlsx,
                  period,
                };
              }
              );

            xlsWbOutputTasks.push(xlsOutputTask);
          });
        });


        // 
        // 2. fill in report resource (all)
        Promise.all(xlsWbOutputTasks)
          .then(promiseAllResult =>
            //
            // 3. return report resource (all)
            resolve(promiseAllResult)
          )
          .catch(error => reject(error))
      } catch (error) {
        reject(error);
      }
    });
  }
}


module.exports = MgConnCustHandler;
