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
            potCust: 13,
            onBrdCust: 14,
            histCust: { // 15
              active: 16,
              notActive: 17,
            },
            avg: {
              dailyUsage: 18,
              subscriptionSalePrice: {
                lccy: 19,
                tccy: 20,
              },
              consumption: 21,
              eSalePrice: {
                lccy: 22,
                tccy: 23,
              },
              perUserRevenue: {
                lccy: 24,
                tccy: 25,
              },
            },
            nonPaid: {
              consRatio: 26,
              daysOfServiceRatio: 27,
            },
            // 28, 39 are empty rows used as separators
            monthlyRevs: { // 29, 41
              fees: {
                lccy: 31,
                tccy: 43,
              },
              eSold: {
                lccy: 32,
                tccy: 44,
              },
              cash: {
                lccy: 35,
                tccy: 47,
              },
              mobileMoney: {
                lccy: 36,
                tccy: 48,
              },
              connectionFees: {
                lccy: 37,
                tccy: 49,
              },
              total: {
                lccy: 38,
                tccy: 50,
              },
              exchangeRate: 40,
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
                'mg-biz-kpi.xlsx'
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
                miniGridCell.name = 'miniGrid';

                const avgDaysOfSubscriptionCell = sheetRef.summary.getCell(`${cellMapping.col.total}${cellMapping.row.avg.dailyUsage}`);
                avgDaysOfSubscriptionCell.name = 'avgDaysOfSubscription';
                avgDaysOfSubscriptionCell.value = daysWithinPeriod;
                sheetRef.summary.getCell(`${cellMapping.col.chc}${cellMapping.row.avg.dailyUsage}`).value = {
                  formula: `IF(${cellMapping.col.chc}${cellMapping.row.histCust.active}>0, ${avgDaysOfSubscriptionCell.name}, "")`
                };
                sheetRef.summary.getCell(`${cellMapping.col.commercial}${cellMapping.row.avg.dailyUsage}`).value = {
                  formula: `IF(${cellMapping.col.commercial}${cellMapping.row.histCust.active}>0, ${avgDaysOfSubscriptionCell.name}, "")`
                };
                sheetRef.summary.getCell(`${cellMapping.col.household}${cellMapping.row.avg.dailyUsage}`).value = {
                  formula: `IF(${cellMapping.col.household}${cellMapping.row.histCust.active}>0, ${avgDaysOfSubscriptionCell.name}, "")`
                };
                sheetRef.summary.getCell(`${cellMapping.col.public}${cellMapping.row.avg.dailyUsage}`).value = {
                  formula: `IF(${cellMapping.col.public}${cellMapping.row.histCust.active}>0, ${avgDaysOfSubscriptionCell.name}, "")`
                };
                sheetRef.summary.getCell(`${cellMapping.col.productive}${cellMapping.row.avg.dailyUsage}`).value = {
                  formula: `IF(${cellMapping.col.productive}${cellMapping.row.histCust.active}>0, ${avgDaysOfSubscriptionCell.name}, "")`
                };

                const localCcyCell = sheetRef.summary.getCell(`${cellMapping.col.dimUnit}${cellMapping.row.monthlyRevs.total.lccy}`);
                localCcyCell.name = 'localCcy';
                localCcyCell.value = context.data.tariffsRepo.getLocalCurrency(projectName);
                const exchageRateCell = sheetRef.summary.getCell(`D${cellMapping.row.monthlyRevs.exchangeRate}`);
                exchageRateCell.name = 'exchangeRate';
                exchageRateCell.value = context.data.tariffsRepo.getExchangeRate(projectName);

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
                  sheetRef[plantEntry[0]].getCell('C5').value = { formula: issueDateCell.name };
                  sheetRef[plantEntry[0]].getCell('C6').value = { formula: periodCell.name };
                  sheetRef[plantEntry[0]].getCell('C7').value = { formula: countryCell.name };
                  sheetRef[plantEntry[0]].getCell('C8').value = { formula: projectCell.name };
                  sheetRef[plantEntry[0]].getCell('C9').value = plantEntry[1].name;

                  sheetRef[plantEntry[0]].getCell(`${cellMapping.col.total}${cellMapping.row.avg.dailyUsage}`).value = null;

                  sheetRef[plantEntry[0]].getCell(`${cellMapping.col.dimUnit}${cellMapping.row.monthlyRevs.total.lccy}`).value = {
                    formula: localCcyCell.name,
                  };
                  sheetRef[plantEntry[0]].getCell(`D${cellMapping.row.monthlyRevs.exchangeRate}`).value = {
                    formula: exchageRateCell.name,
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
                          // On-boarded Customers
                          cellRef = `${commCatColRef}${cellMapping.row.onBrdCust}`;
                          const onBoardedCustCell = sheetRef[plantEntry[0]].getCell(cellRef);
                          onBoardedCustCell.name = `${plantCellNameRef}${cellRef}`;
                          onBoardedCustCell.value = sampleEntry[1].eCustCounters.connected;
                          summaryWsReferences[cellRef] = summaryWsReferences[cellRef] || {
                            func: 'SUM',
                            samples: [],
                          };
                          summaryWsReferences[cellRef].samples.push(onBoardedCustCell.name);
                        }
                        {
                          // Historically Active Customers / Currently Active Customers
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
                          // Historically Active Customers / No-more Active Customer
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

                        // use days in a month as NeoT specific request (see comments marked with (*) below on original calculation)
                        sheetRef[plantEntry[0]].getCell(`${commCatColRef}${cellMapping.row.avg.dailyUsage}`).value = {
                          formula: avgDaysOfSubscriptionCell.name,
                        };

                        if (sampleEntry[1].dailyStats) {
                          // (*) the following calculates daily usage for a category considering Currently Active Customers only
                          // by doing average of customers day of usage (e.g. cust01: 29 days, cust02: 30 days => value is 29.5 days)
                          // const dailyUsage = Object.values(sampleEntry[1].dailyStats.pod).filter(days => days > 0);
                          // if (dailyUsage.length) {
                          //   sheetRef[plantEntry[0]].getCell(`${commCatColRef}${cellMapping.row.avg.dailyUsage}`).value = dailyUsage.reduce((acc, current) => (acc + current)) / dailyUsage.length;
                          // }

                          if (activeCustomersCount) {
                            {
                              // Average day of subscription sale price
                              cellRef = `${commCatColRef}${cellMapping.row.avg.subscriptionSalePrice.lccy}`;
                              const subscriptionSalePriceCell = sheetRef[plantEntry[0]].getCell(cellRef);
                              subscriptionSalePriceCell.name = `${plantCellNameRef}${cellRef}`;
                              subscriptionSalePriceCell.value = {
                                formula: `${monthlySubscrptionFee}/${commCatColRef}${cellMapping.row.avg.dailyUsage}`
                              };
                              summaryWsReferences[cellRef] = summaryWsReferences[cellRef] || {
                                func: 'AVERAGE',
                                samples: [],
                              };
                              summaryWsReferences[cellRef].samples.push(subscriptionSalePriceCell.name);
                            }

                            if (sampleEntry[1].pods) {
                              {
                                let commCatAvgDailyConsumption = 0.0, podSamplesCount = 0;
                                sampleEntry[1].pods.forEach(pod => {
                                  if (sampleEntry[1].dailyStats.pod[pod._id.pod] > 0) {
                                    commCatAvgDailyConsumption += ((pod['es'] + pod['ep']) / sampleEntry[1].dailyStats.pod[pod._id.pod]);
                                    podSamplesCount++;
                                  }
                                });
                                if (activeCustomersCount !== podSamplesCount) {
                                  console.warn(`no match between active customers (${activeCustomersCount}) and pod-related samples (${podSamplesCount}) in ${sampleEntry[0]} cat. of ${plantEntry[1].name}/${period}, fix it!`);
                                }
                                // Average electricity consumption
                                cellRef = `${commCatColRef}${cellMapping.row.avg.consumption}`;
                                const avgDailyConsumptionCell = sheetRef[plantEntry[0]].getCell(cellRef);
                                avgDailyConsumptionCell.name = `${plantCellNameRef}${cellRef}`;
                                avgDailyConsumptionCell.value = {
                                  formula: `${commCatAvgDailyConsumption}/${commCatColRef}${cellMapping.row.histCust.active}`
                                };
                                summaryWsReferences[cellRef] = summaryWsReferences[cellRef] || {
                                  func: 'AVERAGE',
                                  samples: [],
                                };
                                summaryWsReferences[cellRef].samples.push(avgDailyConsumptionCell.name);
                              }
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
                        }

                        if (sampleEntry[1].eDeliv) {
                          perPlantAvgCalculator.addMonthlySample(sampleEntry[0], sampleEntry[1].eDeliv['es'], sampleEntry[1].eDeliv['r-es-lccy'], monthlySubscrptionFee, activeCustomersCount);
                          perProjectAvgCalculator.addMonthlySample(sampleEntry[0], cellMapping.col[sampleEntry[0]], sampleEntry[1].eDeliv['es'], sampleEntry[1].eDeliv['r-es-lccy'], monthlySubscrptionFee, activeCustomersCount);
                          // if required to have tariff for the period: context.data.tariffsRepo.getTariffPerKwhAtYearMonth(tariffsCache, projectName, sampleEntry[0], period);
                          if (activeCustomersCount) {
                            {
                              // Average electricity sale price
                              cellRef = `${commCatColRef}${cellMapping.row.avg.eSalePrice.lccy}`;
                              const eSalePriceCell = sheetRef[plantEntry[0]].getCell(cellRef);
                              eSalePriceCell.value = perPlantAvgCalculator.getAverageTariffFormula(sampleEntry[0]);
                            }
                            {
                              // ARPU
                              cellRef = `${commCatColRef}${cellMapping.row.avg.perUserRevenue.lccy}`;
                              const arpuCell = sheetRef[plantEntry[0]].getCell(cellRef);
                              arpuCell.value = perPlantAvgCalculator.getArpuFormula(sampleEntry[0]);
                            }

                            {
                              // Monthly revenues / Accruals / Subscription fees
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
                              // Monthly revenues / Accruals / Energy sold
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
                              // Monthly revenues / Sales / Cash collections
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
                              // Monthly revenues / Sales / Cash collections
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
                      sheetRef[plantEntry[0]].getCell(`${cellMapping.col.total}${cellMapping.row.avg.dailyUsage}`).value = {
                        formula: avgDaysOfSubscriptionCell.name,
                      };

                      // (*) following previous comment, this is the weighted average of days per category against its Currently Active Customers
                      // let dailyUsageSumProd = '';
                      let subscriptionSalePriceSumProd = '';
                      let consumptionSumProd = '';
                      [...sampledCommCat].forEach(colWithValues => {
                        // (*) following previous comment, this is the weighted average of days per category against its Currently Active Customers
                        // dailyUsageSumProd += `+${colWithValues}${cellMapping.row.avg.dailyUsage}*${colWithValues}${cellMapping.row.histCust.active}`;
                        subscriptionSalePriceSumProd += `+${colWithValues}${cellMapping.row.avg.subscriptionSalePrice.lccy}*${colWithValues}${cellMapping.row.histCust.active}`;
                        consumptionSumProd += `+${colWithValues}${cellMapping.row.avg.consumption}*${colWithValues}${cellMapping.row.histCust.active}`;
                      });
                      // (*) following previous comment, this is the weighted average of days per category against its Currently Active Customers
                      // sheetRef[plantEntry[0]].getCell(`${cellMapping.col.total}${cellMapping.row.avg.dailyUsage}`).value = {
                      //   formula: `(${dailyUsageSumProd})/${cellMapping.col.total}${cellMapping.row.histCust.active}`,
                      // };
                      sheetRef[plantEntry[0]].getCell(`${cellMapping.col.total}${cellMapping.row.avg.subscriptionSalePrice.lccy}`).value = {
                        formula: `(${subscriptionSalePriceSumProd})/${cellMapping.col.total}${cellMapping.row.histCust.active}`,
                      };
                      sheetRef[plantEntry[0]].getCell(`${cellMapping.col.total}${cellMapping.row.avg.consumption}`).value = {
                        formula: `(${consumptionSumProd})/${cellMapping.col.total}${cellMapping.row.histCust.active}`,
                      };
                      sheetRef[plantEntry[0]].getCell(`${cellMapping.col.total}${cellMapping.row.avg.eSalePrice.lccy}`).value = perPlantAvgCalculator.getAverageTariffFormula();
                      sheetRef[plantEntry[0]].getCell(`${cellMapping.col.total}${cellMapping.row.avg.perUserRevenue.lccy}`).value = perPlantAvgCalculator.getArpuFormula();
                      sheetRef[plantEntry[0]].getCell(`${cellMapping.col.total}${cellMapping.row.nonPaid.consRatio}`).value = 0;
                      sheetRef[plantEntry[0]].getCell(`${cellMapping.col.total}${cellMapping.row.nonPaid.daysOfServiceRatio}`).value = 0;
                    }
                  } else {
                    // TODO: add note on missing data for current plant on summary ws
                  }
                });

                // Refinements on summary worksheet once required calculation has been completed on other partial per-plant worksheets
                countryCell.value = [...countries].join(', ');
                miniGridCell.value = `All ${Object.keys(plantById).length} (see other sheets)`;

                Object.entries(summaryWsReferences).forEach(summaryWsReferenceEntry => {
                  sheetRef.summary.getCell(summaryWsReferenceEntry[0]).value = {
                    formula: `${summaryWsReferenceEntry[1].func}(${summaryWsReferenceEntry[1].samples.join(', ')})`
                  };
                });

                if (projectSampledCommCatOverMonth.size) {
                  let subscriptionSalePriceSumProd = '';
                  let consumptionSumProd = '';
                  [...projectSampledCommCatOverMonth].forEach(colWithValues => {
                    subscriptionSalePriceSumProd += `+${colWithValues}${cellMapping.row.avg.subscriptionSalePrice.lccy}*${colWithValues}${cellMapping.row.histCust.active}`;
                    consumptionSumProd += `+${colWithValues}${cellMapping.row.avg.consumption}*${colWithValues}${cellMapping.row.histCust.active}`;
                    sheetRef.summary.getCell(`${colWithValues}${cellMapping.row.avg.eSalePrice.lccy}`).value = perProjectAvgCalculator.getAverageTariffFormula(colWithValues);
                    sheetRef.summary.getCell(`${colWithValues}${cellMapping.row.avg.perUserRevenue.lccy}`).value = perProjectAvgCalculator.getArpuFormula(colWithValues);
                    sheetRef.summary.getCell(`${colWithValues}${cellMapping.row.nonPaid.consRatio}`).value = 0;
                    sheetRef.summary.getCell(`${colWithValues}${cellMapping.row.nonPaid.daysOfServiceRatio}`).value = 0;
                  });
                  sheetRef.summary.getCell(`${cellMapping.col.total}${cellMapping.row.avg.subscriptionSalePrice.lccy}`).value = {
                    formula: `(${subscriptionSalePriceSumProd})/${cellMapping.col.total}${cellMapping.row.histCust.active}`,
                  };
                  sheetRef.summary.getCell(`${cellMapping.col.total}${cellMapping.row.avg.consumption}`).value = {
                    formula: `(${consumptionSumProd})/${cellMapping.col.total}${cellMapping.row.histCust.active}`,
                  };

                  sheetRef.summary.getCell(`${cellMapping.col.total}${cellMapping.row.avg.eSalePrice.lccy}`).value = perProjectAvgCalculator.getAverageTariffFormula();
                  sheetRef.summary.getCell(`${cellMapping.col.total}${cellMapping.row.avg.perUserRevenue.lccy}`).value = perProjectAvgCalculator.getArpuFormula();

                  sheetRef.summary.getCell(`${cellMapping.col.total}${cellMapping.row.nonPaid.consRatio}`).value = 0;
                  sheetRef.summary.getCell(`${cellMapping.col.total}${cellMapping.row.nonPaid.daysOfServiceRatio}`).value = 0;
                }

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
