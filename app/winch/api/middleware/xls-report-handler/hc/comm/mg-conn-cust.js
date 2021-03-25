const { promiseImpl } = require('ejs');
const { response } = require('express');
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
            active: 14,
            notActive: 15,
          },
          col: {
            chc: 'G',
            commercial: 'H',
            household: 'I',
            public: 'J',
            productive: 'K',
          },
        };

        context.data.periods.forEach(period => {
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

                Object.entries(plantById).forEach(plantEntry => {
                  countries.add(plantEntry[1].country);
                  sheetRef[plantEntry[0]] = workbook.addWorksheet(plantEntry[1].name);
                  sheetRef[plantEntry[0]].model = Object.assign(sheetRef.summary.model, {
                    mergeCells: sheetRef.summary.model.merges
                  });
                  sheetRef[plantEntry[0]].name = plantEntry[1].name;

                  sheetRef[plantEntry[0]].getCell('C5').value = { formula: issueDateCell.name };
                  sheetRef[plantEntry[0]].getCell('C6').value = { formula: periodCell.name };
                  sheetRef[plantEntry[0]].getCell('C7').value = { formula: countryCell.name };
                  sheetRef[plantEntry[0]].getCell('C8').value = { formula: projectCell.name };
                  sheetRef[plantEntry[0]].getCell('C9').value = plantEntry[1].name;

                  const selectedSamples = plantEntry[1].samples.byPeriod[period];
                  if (selectedSamples) {
                    Object.entries(selectedSamples).forEach(sampleEntry => {
                      const row = cellMapping.col[sampleEntry[0]];
                      if (!row) {
                        return;
                      }
                      console.log('active :>> ', `${row}${cellMapping.row.active}`);
                      console.log('notActive :>> ', `${row}${cellMapping.row.notActive}`);
                      sheetRef[plantEntry[0]].getCell(`${row}${cellMapping.row.active}`).value = sampleEntry[1].eCustCounters.consumingBySelling;
                      sheetRef[plantEntry[0]].getCell(`${row}${cellMapping.row.notActive}`).value = sampleEntry[1].eCustCounters.connected - sampleEntry[1].eCustCounters.consumingBySelling;
                    });
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
              // .then(wbRepo => Promise.all(xlsWsPlantPeriodOutputSubTasks.map(task => task(wbRepo))))
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
        // FIXME: Promise.all(Object.values(context.out.xls).map(xlsLocalContext => xlsLocalContext.redactXlsTask))
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
