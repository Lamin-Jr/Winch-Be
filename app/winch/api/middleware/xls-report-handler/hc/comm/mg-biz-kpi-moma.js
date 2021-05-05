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
            header: {
              issueDate: 3,
              period: 4,
              country: 5,
              project: 6,
              miniGrid: 7,
            },
            potCust: 15,
            onBrdCust: 16,
            connCust: 17,
            histCust: { // 18
              active: 19,
              notActive: 20,
            },
            subscriptionDays: {
              tot: 21 //,
              // avg: 22,
              // salePrice: 23
            },
            usageDays: {
              tot: 24 //,
              // avg: 25
            },
            consumption: {
              tot: 26 //,
              // avg: 27,
              // salePrice: 28,
              // perUsageDays: 29
            },
            // revenues: {
            //   avgPerActiveUser: 30,
            //   avgPerConnCust: 31
            // },
            nonPaid: {
              consRatio: 32,
              daysOfServiceRatio: 33,
            },
            monthlyRevs: { // 44
              vatRate: 10,
              exchangeRate: 11,
              fees: {
                lccy: 35,
                tccy: 35,
              },
              eSold: {
                lccy: 36,
                tccy: 36,
              },
              cash: {
                lccy: 40,
                tccy: 40,
              },
              mobileMoney: {
                lccy: 41,
                tccy: 41,
              },
              connectionFees: {
                lccy: 43,
                tccy: 43,
              },
              total: {
                lccy: 45,
                tccy: 45,
              },
            },
          },
          col: {
            header: 'C',
            dimUnit: 'C',
            total: 'D',
            chc: 'E',
            commercial: 'F',
            household: 'G',
            public: 'H',
            productive: 'I',
            notes: 'J',
          },
        };
        const tariffsCache = {};

        // Periods loop
        Object.entries(context.data.months).forEach(monthEntry => {
          const period = monthEntry[0];
          const daysWithinPeriod = monthEntry[1];
          const projectSampledCommCatOverMonth = new Set();
          const summaryWsReferences = {
          };

          // Single project workbook loop
          Object.entries(context.data.byProject).forEach(plantByProjectEntry => {
            const projectName = plantByProjectEntry[0];
            const plantById = plantByProjectEntry[1];
            const projectWithinPeriodWorkbook = new ExcelJS.Workbook();

            let xlsOutputTask = projectWithinPeriodWorkbook.xlsx.readFile(
              dmsEngineContext.buildPathFromWorkDir(
                dmsEngineContext.basePathKey.HC_COMM,
                ...dmsEngineContext.pathSegment.oReport.oHc.vTemplate,
                'mg-biz-kpi-moma.xlsx'
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

                const issueDateCell = sheetRef.summary.getCell(`${cellMapping.col.header}${cellMapping.row.header.issueDate}`);
                issueDateCell.name = 'issueDate';
                issueDateCell.value = now;
                const periodCell = sheetRef.summary.getCell(`${cellMapping.col.header}${cellMapping.row.header.period}`);
                periodCell.name = 'period';
                periodCell.value = new Date(period);
                const countryCell = sheetRef.summary.getCell(`${cellMapping.col.header}${cellMapping.row.header.country}`)
                countryCell.name = 'country';
                const projectCell = sheetRef.summary.getCell(`${cellMapping.col.header}${cellMapping.row.header.project}`);
                projectCell.name = 'project';
                projectCell.value = projectName;
                const miniGridCell = sheetRef.summary.getCell(`${cellMapping.col.header}${cellMapping.row.header.miniGrid}`);
                miniGridCell.name = 'miniGrid';

                const vatRateCell = sheetRef.summary.getCell(`${cellMapping.col.header}${cellMapping.row.monthlyRevs.vatRate}`);
                vatRateCell.name = 'vatRate';
                vatRateCell.value = context.data.tariffsRepo.getVatAtYearMonth(tariffsCache, projectName, period);
                const exchangeRateCell = sheetRef.summary.getCell(`${cellMapping.col.header}${cellMapping.row.monthlyRevs.exchangeRate}`);
                exchangeRateCell.name = 'exchangeRate';
                exchangeRateCell.value = context.data.tariffsRepo.getExchangeRate(projectName);

                const localCcyCell = sheetRef.summary.getCell(`${cellMapping.col.dimUnit}${cellMapping.row.monthlyRevs.total.lccy}`);
                localCcyCell.name = 'localCcy';
                localCcyCell.value = context.data.tariffsRepo.getLocalCurrency(projectName);

                const perProjectAvgCalculator = {
                  reverseColRefs: {
                    [cellMapping.col.total]: 'all',
                  },
                  all: {
                    eCons: 0.0,
                    eSoldLccy: 0.0,
                    totSubscriptionFeeLccy: 0.0,
                    samplesCount: 0,
                  },
                  addMonthlySample: function (commCat, colRef, eCons, eSoldLccy, subscriptionFeeLccy, activeCustomersCount) {
                    this.reverseColRefs[colRef] = commCat;
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
                  getAverageTariffFormula: function (colRef = cellMapping.col.total) {
                    const commCat = this.reverseColRefs[colRef];
                    return this[commCat].eCons === 0
                      ? null
                      : {
                        formula: `${this[commCat].eSoldLccy} / ${this[commCat].eCons}`
                      };
                  },
                  getArpuFormula: function (colRef = cellMapping.col.total) {
                    const commCat = this.reverseColRefs[colRef];
                    return this[commCat].eCons === 0
                      ? null
                      : {
                        formula: `(${this[commCat].totSubscriptionFeeLccy} + ${this[commCat].eSoldLccy}) / ${cellMapping.col[commCat === 'all' ? 'total' : commCat]}${cellMapping.row.histCust.active}`
                      };
                  },
                  checkExpectedSamplesCount (expectedSamplesCount, colRef = cellMapping.col.total) {
                    const commCat = this.reverseColRefs[colRef];
                    return this[commCat].samplesCount === expectedSamplesCount;
                  },
                  getTotalSubcriptionFees: function (colRef = cellMapping.col.total) {
                    const commCat = this.reverseColRefs[colRef];
                    return this[commCat].eCons === 0
                      ? null
                      : this[commCat].totSubscriptionFeeLccy;
                  },
                  getTotalEnergySold: function (colRef = cellMapping.col.total) {
                    const commCat = this.reverseColRefs[colRef];
                    return this[commCat].eCons === 0
                      ? null
                      : this[commCat].eSoldLccy;
                  },
                };

                // Single plant worksheet loop
                Object.entries(plantById).forEach(plantEntry => {
                  const plantCellNameRef = plantEntry[1].name.replace(/\s/g, '').toLowerCase();
                  countries.add(plantEntry[1].country);

                  // duplicate worksheet for current plant
                  sheetRef[plantEntry[0]] = workbook.addWorksheet(plantEntry[1].name);
                  sheetRef[plantEntry[0]].model = Object.assign(JSON.parse(JSON.stringify(sheetRef.summary.model)), {
                    mergeCells: sheetRef.summary.model.merges
                  });
                  sheetRef[plantEntry[0]].name = plantEntry[1].name;

                  // fix references to constant values
                  sheetRef[plantEntry[0]].getCell(`${cellMapping.col.header}${cellMapping.row.header.issueDate}`).value = { formula: issueDateCell.name };
                  sheetRef[plantEntry[0]].getCell(`${cellMapping.col.header}${cellMapping.row.header.period}`).value = { formula: periodCell.name };
                  sheetRef[plantEntry[0]].getCell(`${cellMapping.col.header}${cellMapping.row.header.country}`).value = { formula: countryCell.name };
                  sheetRef[plantEntry[0]].getCell(`${cellMapping.col.header}${cellMapping.row.header.project}`).value = { formula: projectCell.name };
                  sheetRef[plantEntry[0]].getCell(`${cellMapping.col.header}${cellMapping.row.header.miniGrid}`).value = plantEntry[1].name;
                  sheetRef[plantEntry[0]].getCell(`${cellMapping.col.header}${cellMapping.row.monthlyRevs.vatRate}`).value = {
                    formula: vatRateCell.name,
                  };
                  sheetRef[plantEntry[0]].getCell(`${cellMapping.col.header}${cellMapping.row.monthlyRevs.exchangeRate}`).value = {
                    formula: exchangeRateCell.name,
                  };

                  sheetRef[plantEntry[0]].getCell(`${cellMapping.col.dimUnit}${cellMapping.row.monthlyRevs.total.lccy}`).value = {
                    formula: localCcyCell.name,
                  };

                  const selectedSamples = plantEntry[1].samples.byPeriod[period];
                  if (selectedSamples) {
                    const sampledCommCat = new Set();
                    const perPlantAvgCalculator = {
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
                        };
                      },
                      getArpuFormula: function (commCat = 'all') {
                        return {
                          formula: `(${this[commCat].totSubscriptionFeeLccy} + ${this[commCat].eSoldLccy}) / ${cellMapping.col[commCat === 'all' ? 'total' : commCat]}${cellMapping.row.histCust.active}`
                        };
                      },
                      checkExpectedSamplesCount (expectedSamplesCount, commCat = 'all') {
                        return this[commCat].samplesCount === expectedSamplesCount;
                      },
                      getTotalSubcriptionFees: function (commCat = 'all') {
                        return this[commCat].totSubscriptionFeeLccy;
                      },
                      getTotalEnergySold: function (commCat = 'all') {
                        return this[commCat].eSoldLccy;
                      },
                      getTotalConsumption (commCat = 'all') {
                        return this[commCat].eCons;
                      }
                    };

                    // Single category column (e.g. Clinic (CHC), Commercial, etc.) loop
                    Object.entries(selectedSamples).forEach(sampleEntry => {
                      if (!cellMapping.col[sampleEntry[0]]) {
                        // exclude don't care categories (e.g. MoPo)
                        return;
                      }
                      sampledCommCat.add(cellMapping.col[sampleEntry[0]]);
                      const commCatColRef = cellMapping.col[sampleEntry[0]];
                      if (commCatColRef) {
                        const activeCustomersCount = sampleEntry[1].eCustCounters.consumingBySelling;
                        const monthlySubscrptionFee = context.data.tariffsRepo.getStandingChargeAtYearMonth(tariffsCache, projectName, sampleEntry[0], period);

                        if (activeCustomersCount) {
                          projectSampledCommCatOverMonth.add(cellMapping.col[sampleEntry[0]]);
                        }

                        let cellRef;
                        {
                          // Connected Customers
                          cellRef = `${commCatColRef}${cellMapping.row.connCust}`;
                          const connCustCell = sheetRef[plantEntry[0]].getCell(cellRef);
                          connCustCell.name = `${plantCellNameRef}${cellRef}`;
                          connCustCell.value = sampleEntry[1].eCustCounters.connected;
                          summaryWsReferences[cellRef] = summaryWsReferences[cellRef] || {
                            func: 'SUM',
                            samples: [],
                          };
                          summaryWsReferences[cellRef].samples.push(connCustCell.name);
                        }
                        {
                          // Historically Active Customers / Active Users
                          cellRef = `${commCatColRef}${cellMapping.row.histCust.active}`;
                          const activeCustCell = sheetRef[plantEntry[0]].getCell(cellRef);
                          activeCustCell.name = `${plantCellNameRef}${cellRef}`;
                          activeCustCell.value = activeCustomersCount;
                          summaryWsReferences[cellRef] = summaryWsReferences[cellRef] || {
                            func: 'SUM',
                            samples: [],
                          };
                          summaryWsReferences[cellRef].samples.push(activeCustCell.name);
                        }
                        {
                          // Historically Active Customers / Zero Users
                          cellRef = `${commCatColRef}${cellMapping.row.histCust.notActive}`;
                          const notActiveCustCell = sheetRef[plantEntry[0]].getCell(cellRef);
                          notActiveCustCell.name = `${plantCellNameRef}${cellRef}`;
                          notActiveCustCell.value = sampleEntry[1].eCustCounters.connected - activeCustomersCount;
                          summaryWsReferences[cellRef] = summaryWsReferences[cellRef] || {
                            func: 'SUM',
                            samples: [],
                          };
                          summaryWsReferences[cellRef].samples.push(notActiveCustCell.name);
                        }

                        if (activeCustomersCount) {
                          // Total days of subscription 
                          cellRef = `${commCatColRef}${cellMapping.row.subscriptionDays.tot}`;
                          const totSubscriptionDaysCell = sheetRef[plantEntry[0]].getCell(cellRef);
                          totSubscriptionDaysCell.name = `${plantCellNameRef}${cellRef}`;
                          totSubscriptionDaysCell.value = {
                            formula: `${daysWithinPeriod}*${commCatColRef}${cellMapping.row.histCust.active}`
                          };
                          summaryWsReferences[cellRef] = summaryWsReferences[cellRef] || {
                            func: 'SUM',
                            samples: [],
                          };
                          summaryWsReferences[cellRef].samples.push(totSubscriptionDaysCell.name);
                        }

                        if (sampleEntry[1].dailyStats) {
                          const dailyUsage = Object.values(sampleEntry[1].dailyStats.pod).filter(days => days > 0);
                          if (dailyUsage.length) {
                            // Total days of use
                            cellRef = `${commCatColRef}${cellMapping.row.usageDays.tot}`;
                            const totUsageDaysCell = sheetRef[plantEntry[0]].getCell(cellRef);
                            totUsageDaysCell.name = `${plantCellNameRef}${cellRef}`;
                            totUsageDaysCell.value = dailyUsage.reduce((acc, current) => (acc + current));
                            summaryWsReferences[cellRef] = summaryWsReferences[cellRef] || {
                              func: 'SUM',
                              samples: [],
                            };
                            summaryWsReferences[cellRef].samples.push(totUsageDaysCell.name);
                          }

                          {
                            // Non-paid electricity consumption ratio
                            sheetRef[plantEntry[0]].getCell(`${commCatColRef}${cellMapping.row.nonPaid.consRatio}`).value = 0;
                          }
                          {
                            // Non-paid days of service ratio
                            sheetRef[plantEntry[0]].getCell(`${commCatColRef}${cellMapping.row.nonPaid.daysOfServiceRatio}`).value = 0;
                          }
                        }

                        if (sampleEntry[1].eDeliv) {
                          perPlantAvgCalculator.addMonthlySample(sampleEntry[0], sampleEntry[1].eDeliv['es'], sampleEntry[1].eDeliv['r-es-lccy'], monthlySubscrptionFee, activeCustomersCount);
                          perProjectAvgCalculator.addMonthlySample(sampleEntry[0], cellMapping.col[sampleEntry[0]], sampleEntry[1].eDeliv['es'], sampleEntry[1].eDeliv['r-es-lccy'], monthlySubscrptionFee, activeCustomersCount);
                          // if required to have tariff for the period: context.data.tariffsRepo.getTariffPerKwhAtYearMonth(tariffsCache, projectName, sampleEntry[0], period);

                          if (activeCustomersCount) {
                            {
                              // Total consumed energy
                              cellRef = `${commCatColRef}${cellMapping.row.consumption.tot}`;
                              const monthlyRevsESoldCell = sheetRef[plantEntry[0]].getCell(cellRef);
                              monthlyRevsESoldCell.name = `${plantCellNameRef}${cellRef}`;
                              monthlyRevsESoldCell.value = perPlantAvgCalculator.getTotalConsumption(sampleEntry[0]);
                              summaryWsReferences[cellRef] = summaryWsReferences[cellRef] || {
                                func: 'SUM',
                                samples: [],
                              };
                              summaryWsReferences[cellRef].samples.push(monthlyRevsESoldCell.name);
                            }
                            {
                              // Monthly Customer Credit Expenses / Subscription fees
                              cellRef = `${commCatColRef}${cellMapping.row.monthlyRevs.fees.lccy}`;
                              const monthlyRevsSubscriptionFeesCell = sheetRef[plantEntry[0]].getCell(cellRef);
                              monthlyRevsSubscriptionFeesCell.name = `${plantCellNameRef}${cellRef}`;
                              monthlyRevsSubscriptionFeesCell.value = perPlantAvgCalculator.getTotalSubcriptionFees(sampleEntry[0]);
                              summaryWsReferences[cellRef] = summaryWsReferences[cellRef] || {
                                func: 'SUM',
                                samples: [],
                              };
                              summaryWsReferences[cellRef].samples.push(monthlyRevsSubscriptionFeesCell.name);
                            }
                            {
                              // Monthly Customer Credit Expenses / Energy sold
                              cellRef = `${commCatColRef}${cellMapping.row.monthlyRevs.eSold.lccy}`;
                              const monthlyRevsESoldCell = sheetRef[plantEntry[0]].getCell(cellRef);
                              monthlyRevsESoldCell.name = `${plantCellNameRef}${cellRef}`;
                              monthlyRevsESoldCell.value = perPlantAvgCalculator.getTotalEnergySold(sampleEntry[0]);
                              summaryWsReferences[cellRef] = summaryWsReferences[cellRef] || {
                                func: 'SUM',
                                samples: [],
                              };
                              summaryWsReferences[cellRef].samples.push(monthlyRevsESoldCell.name);
                            }
                            {
                              // Customer Credit Incomes / Cash collections
                              cellRef = `${commCatColRef}${cellMapping.row.monthlyRevs.cash.lccy}`;
                              const monthlyRevsCashCell = sheetRef[plantEntry[0]].getCell(cellRef);
                              monthlyRevsCashCell.name = `${plantCellNameRef}${cellRef}`;
                              monthlyRevsCashCell.value = sampleEntry[0] === 'chc'
                                ? 0
                                : sampleEntry[1].eDeliv['tx-es-lccy'];
                              summaryWsReferences[cellRef] = summaryWsReferences[cellRef] || {
                                func: 'SUM',
                                samples: [],
                              };
                              summaryWsReferences[cellRef].samples.push(monthlyRevsCashCell.name);
                            }
                            {
                              // Customer Credit Incomes / Mobile Money collections
                              cellRef = `${commCatColRef}${cellMapping.row.monthlyRevs.mobileMoney.lccy}`;
                              const monthlyRevsMoMoCell = sheetRef[plantEntry[0]].getCell(cellRef);
                              monthlyRevsMoMoCell.name = `${plantCellNameRef}${cellRef}`;
                              monthlyRevsMoMoCell.value = 0;
                              summaryWsReferences[cellRef] = summaryWsReferences[cellRef] || {
                                func: 'SUM',
                                samples: [],
                              };
                              summaryWsReferences[cellRef].samples.push(monthlyRevsMoMoCell.name);
                            }
                          }
                        }
                      }
                    });

                    // write ALL CATEGORIES column once at least one category sample exists 
                    if (sampledCommCat.size) {
                      sheetRef[plantEntry[0]].getCell(`${cellMapping.col.total}${cellMapping.row.nonPaid.consRatio}`).value = 0;
                      sheetRef[plantEntry[0]].getCell(`${cellMapping.col.total}${cellMapping.row.nonPaid.daysOfServiceRatio}`).value = 0;
                    }
                  } else {
                    // TODO: add note on missing data for current plant on summary ws
                  }
                });

                // Refinements on summary worksheet once required calculation has been completed on other partial per-plant worksheets
                countryCell.value = [...countries].join(', ');
                miniGridCell.value = `${Object.keys(plantById).length} site${Object.keys(plantById).length ? 's' : ''}`;

                Object.entries(summaryWsReferences).forEach(summaryWsReferenceEntry => {
                  sheetRef.summary.getCell(summaryWsReferenceEntry[0]).value = {
                    formula: `${summaryWsReferenceEntry[1].func}(${summaryWsReferenceEntry[1].samples.join(', ')})`
                  };
                });

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
