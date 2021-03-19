const {
  Handler,
} = require('../../../../../../api/lib/util/handler');

const {
  initExcelJS,
  buildBasicDocumentOption,
  buildPortraitPageSetup,
} = require('../../xls');


class ProjectOverviewHandler extends Handler {
  constructor () {
    super();
  }

  handle (context) {
    return new Promise((resolve, reject) => {
      try {
        // 
        // 1a. perform preliminary operations upon context
        // -> nothing to do

        // 
        // 1b. init processing resources
        const ExcelJS = initExcelJS();
        const workbook = new ExcelJS.Workbook();
        buildBasicDocumentOption(workbook);
        buildPortraitPageSetup(workbook);

        const sheetRef = {};
        const eDelivQueryTasks = [];

        // 
        // 2. fill in report resource
        Object.entries(context.data.plant).forEach(plantEntry => {
          sheetRef[plantEntry[0]] = workbook.addWorksheet(plantEntry[1].name);
          sheetRef[plantEntry[0]].columns = [
            {
              header: 'Date',
              key: 'date',
              width: 15,
            },
            {
              header: 'Total energy consumption\n[kWh]',
              key: 'all',
              width: 15,
              style: {
                numFmt: '#,##0.00',
              },
            },
            {
              header: 'Commercial consumption\n[kWh]',
              key: 'commercial',
              width: 15,
              style: {
                numFmt: '#,##0.00',
              },
            },
            {
              header: 'CHC consumption\n[kWh]',
              key: 'chc',
              width: 15,
              style: {
                numFmt: '#,##0.00',
              },
            },
            {
              header: 'Household consumption\n[kWh]',
              key: 'household',
              width: 15,
              style: {
                numFmt: '#,##0.00',
              },
            },
            {
              header: 'MoPo consumption\n[kWh]',
              key: 'mopo',
              width: 15,
              style: {
                numFmt: '#,##0.00',
              },
            },
            {
              header: 'Productive consumption\n[kWh]',
              key: 'productive',
              width: 15,
              style: {
                numFmt: '#,##0.00',
              },
            },
            {
              header: 'Public consumption\n[kWh]',
              key: 'public',
              width: 15,
              style: {
                numFmt: '#,##0.00',
              },
            }
          ];
          eDelivQueryTasks.push(new Promise(resolve => {
            plantEntry[1].eDelivQueryTask
              .then(eDelivSamples => resolve({
                sheetRef: plantEntry[1].name,
                samples: eDelivSamples
              }));
          }));
        });

        Promise.all(eDelivQueryTasks)
          .then(sheetsData => new Promise(resolve => {
            sheetsData.forEach(sheetData => {
              const virtualRows = {};
              const subTotalIndexes = [];
              const pods = {
              };
              let rowIndex = 1;
              let startSubTotIndex = 1;
              let lastMonth = null;
              sheetData.samples.forEach(sample => {
                if (!virtualRows[sample._id.d]) {
                  const rowKey = new Date(sample._id.d);
                  rowIndex++;
                  if (lastMonth === null || lastMonth !== rowKey.getMonth()) {
                    if (lastMonth !== null) {
                      virtualRows[`${Object.keys(virtualRows).reverse()[0]}_subtotal`] = {
                        all: { formula: `SUM(B${startSubTotIndex + 1}:B${rowIndex - 1})` },
                        commercial: { formula: `SUM(C${startSubTotIndex + 1}:C${rowIndex - 1})` },
                        chc: { formula: `SUM(D${startSubTotIndex + 1}:D${rowIndex - 1})` },
                        household: { formula: `SUM(E${startSubTotIndex + 1}:E${rowIndex - 1})` },
                        mopo: { formula: `SUM(F${startSubTotIndex + 1}:F${rowIndex - 1})` },
                        productive: { formula: `SUM(G${startSubTotIndex + 1}:G${rowIndex - 1})` },
                        public: { formula: `SUM(H${startSubTotIndex + 1}:H${rowIndex - 1})` },
                      };
                      subTotalIndexes.push(rowIndex);
                      startSubTotIndex = rowIndex;
                      rowIndex++;
                    }
                    lastMonth = rowKey.getMonth();
                  }
                  virtualRows[sample._id.d] = {
                    date: rowKey,
                  };
                }
                virtualRows[sample._id.d][sample._id.ct] = sample.es + sample.ep;
                // sample value for all
                // virtualRows[sample._id.d].all = (virtualRows[sample._id.d].all || 0) + virtualRows[sample._id.d][sample._id.ct];
                // calculated value for all
                virtualRows[sample._id.d].all = { formula: `SUM(C${rowIndex}+D${rowIndex}+E${rowIndex}+F${rowIndex}+G${rowIndex}+H${rowIndex})` };
                pods[subTotalIndexes.length] = pods[subTotalIndexes.length] || {
                  all: {
                    t: 0,
                    c: 0,
                  },
                }
                pods[subTotalIndexes.length][sample._id.ct] = pods[subTotalIndexes.length][sample._id.ct] || {
                  t: 0,
                  c: 0,
                };
                pods[subTotalIndexes.length][sample._id.ct].t += sample.cnt;
                pods[subTotalIndexes.length][sample._id.ct].c += 1;
                pods[subTotalIndexes.length].all.t += sample.cnt;
                pods[subTotalIndexes.length].all.c += 1;
              });

              const lastRowKey = Object.keys(virtualRows).reverse()[0];
              if (lastMonth !== null && virtualRows[lastRowKey].date) {
                virtualRows[`${lastRowKey}_subtotal`] = {
                  all: { formula: `SUM(B${startSubTotIndex + 1}:B${rowIndex})` },
                  commercial: { formula: `SUM(C${startSubTotIndex + 1}:C${rowIndex})` },
                  chc: { formula: `SUM(D${startSubTotIndex + 1}:D${rowIndex})` },
                  household: { formula: `SUM(E${startSubTotIndex + 1}:E${rowIndex})` },
                  mopo: { formula: `SUM(F${startSubTotIndex + 1}:F${rowIndex})` },
                  productive: { formula: `SUM(G${startSubTotIndex + 1}:G${rowIndex})` },
                  public: { formula: `SUM(H${startSubTotIndex + 1}:H${rowIndex})` },
                };
                subTotalIndexes.push(rowIndex + 1);
                startSubTotIndex = rowIndex;
                rowIndex++;
              }

              if (subTotalIndexes.length) {
                virtualRows['total'] = {
                  all: { formula: `SUM(B${subTotalIndexes.join(', B')})` },
                  commercial: { formula: `SUM(C${subTotalIndexes.join(', C')})` },
                  chc: { formula: `SUM(D${subTotalIndexes.join(', D')})` },
                  household: { formula: `SUM(E${subTotalIndexes.join(', E')})` },
                  mopo: { formula: `SUM(F${subTotalIndexes.join(', F')})` },
                  productive: { formula: `SUM(G${subTotalIndexes.join(', G')})` },
                  public: { formula: `SUM(H${subTotalIndexes.join(', H')})` },
                };
                rowIndex++;
              }

              virtualRows['empty01'] = {};
              virtualRows['empty02'] = {};
              virtualRows[`header02`] = {
                date: 'Month',
                all: 'All categories\ndaily\npro capite energy\n[kWh]',
                commercial: 'Commercial\ndaily\npro capite energy\n[kWh]',
                chc: 'CHC\ndaily\npro capite energy\n[kWh]',
                household: 'Household\ndaily\npro capite energy\n[kWh]',
                mopo: 'MoPo\ndaily\npro capite energy\n[kWh]',
                productive: 'Productive\ndaily\npro capite energy\n[kWh]',
                public: 'Public\ndaily\npro capite energy\n[kWh]',
              };
              rowIndex += 3;
              const header02RowIndex = rowIndex;

              Object.values(pods).forEach(podValue => {
                podValue.all.c /= (Object.keys(podValue).length - 1);
              });
              subTotalIndexes.forEach((subTotalIndex, index) => {
                virtualRows[`pro-cap-${subTotalIndex}`] = {
                  date: {
                    formula: `TEXT(A${subTotalIndex - 1}, "mmm")&" "&YEAR(A${subTotalIndex - 1})`
                  },
                  all: { formula: `B${subTotalIndex}/${pods[index].all.t}` },
                  commercial: pods[index]['commercial']
                    ? { formula: `C${subTotalIndex}/${pods[index].commercial.t}` }
                    : 0,
                  chc: pods[index]['chc']
                    ? { formula: `D${subTotalIndex}/${pods[index].chc.t}` }
                    : 0,
                  household: pods[index]['household']
                    ? { formula: `E${subTotalIndex}/${pods[index].household.t}` }
                    : 0,
                  mopo: pods[index]['mopo']
                    ? { formula: `F${subTotalIndex}/${pods[index].mopo.t}` }
                    : 0,
                  productive: pods[index]['productive']
                    ? { formula: `G${subTotalIndex}/${pods[index].productive.t}` }
                    : 0,
                  public: pods[index]['public']
                    ? { formula: `H${subTotalIndex}/${pods[index].public.t}` }
                    : 0,
                };
              });

              const sheet = workbook
                .getWorksheet(sheetData.sheetRef);

              sheet.lastRow.alignment = {
                wrapText: true
              };
              sheet.lastRow.font = {
                bold: true
              }
              sheet.lastRow.height = 50;
              sheet.lastRow.commit();

              sheet.addRows(Object.values(virtualRows));

              const header02Row = sheet.getRow(header02RowIndex);
              header02Row.alignment = {
                wrapText: true
              };
              header02Row.font = {
                bold: true
              }
              header02Row.height = 80;
              header02Row.commit();
            });

            resolve();
          }))
          .then(() => {
            // 
            // 3. return report resource
            resolve(
              workbook.xlsx
            );
          })
          .catch(error => reject(error));
      } catch (error) {
        reject(error);
      }
    });
  }
}


module.exports = ProjectOverviewHandler;
