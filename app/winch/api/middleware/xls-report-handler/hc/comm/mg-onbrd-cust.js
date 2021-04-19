const { ValueType } = require('exceljs');
const { DateFormatter } = require('../../../../../../../api/lib/util/formatter');
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
            start: 13
          },
          col: {
            regDate: 'B',
            fullName: 'C',
            phone: 'D',
            address: 'E',
            businessActivity: 'F',
            commCat: 'G',
            serviceLocation: 'H',
            serviceType: 'I',
            serviceId: 'J',
            subscription: 'K',
            upfrontPaymentDone: 'L',
            startDate: 'M',
            endDate: 'N',
            notes: 'O',
          },
          style: {
            borderFactory: function (top = false, left = false, bottom = false, right = false) {
              return {
                top: { style: top ? 'thick' : 'thin' },
                left: { style: left ? 'thick' : 'thin' },
                bottom: { style: bottom ? 'thick' : 'thin' },
                right: { style: right ? 'thick' : 'thin' }
              }
            }
          }
        };

        Object.entries(context.data.months).forEach(monthEntry => {
          const period = monthEntry[0];
          const periodAsDate = new Date(period);
          // const daysWithinPeriod = monthEntry[1];

          Object.entries(context.data.byProject).forEach(plantByProjectEntry => {
            const projectName = plantByProjectEntry[0];
            const plantById = plantByProjectEntry[1];
            const projectWithinPeriodWorkbook = new ExcelJS.Workbook();

            let xlsOutputTask = projectWithinPeriodWorkbook.xlsx.readFile(
              dmsEngineContext.buildPathFromWorkDir(
                dmsEngineContext.basePathKey.HC_COMM,
                ...dmsEngineContext.pathSegment.oReport.oHc.vTemplate,
                'mg-onbrd-cust.xlsx'
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

                let mainWorksheetRowPos = cellMapping.row.start;

                Object.entries(plantById).forEach(plantEntry => {
                  const businessStartDate = new Date(plantEntry[1].date)

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

                  let plantWorksheetRowPos = cellMapping.row.start;
                  plantEntry[1].samples.customers.forEach(customer => {
                    if (['mopo'].includes(customer.commCat)) {
                      // exclude don't care categories (e.g. MoPo)
                      return;
                    }

                    const tsFromDateOnly = new Date(Date.UTC(customer.tsFrom.getFullYear(), customer.tsFrom.getMonth(), customer.tsFrom.getDate()));

                    if (customer.tsFrom.getFullYear() > periodAsDate.getFullYear() ||
                      (customer.tsFrom.getFullYear() === periodAsDate.getFullYear() &&
                        customer.tsFrom.getMonth() > periodAsDate.getMonth())) {
                      // exclude customers not subscribed yet in the reference period
                      return;
                    }

                    const regDate = new Date(
                      tsFromDateOnly.getTime() < businessStartDate.getTime()
                        ? businessStartDate
                        : tsFromDateOnly
                    );

                    const plantWorksheetRow = sheetRef[plantEntry[0]].insertRow(plantWorksheetRowPos);

                    plantWorksheetRow.getCell(cellMapping.col.regDate).value = regDate;
                    plantWorksheetRow.getCell(cellMapping.col.fullName).value = customer.fullName;
                    if (customer.contacts.length) {
                      plantWorksheetRow.getCell(cellMapping.col.phone).value = customer.contacts[0].address;
                    }
                    plantWorksheetRow.getCell(cellMapping.col.address).value = customer.address;
                    // row.getCell(cellMapping.col.businessActivity).value = customer.;
                    plantWorksheetRow.getCell(cellMapping.col.commCat).value = customer.commCat;
                    plantWorksheetRow.getCell(cellMapping.col.serviceLocation).value = plantEntry[1].name;
                    plantWorksheetRow.getCell(cellMapping.col.serviceType).value = 'Mini-grid';
                    plantWorksheetRow.getCell(cellMapping.col.serviceId).value = customer.pod;
                    plantWorksheetRow.getCell(cellMapping.col.subscription).value = customer.tariff.name;
                    plantWorksheetRow.getCell(cellMapping.col.upfrontPaymentDone).value = 'Y';
                    plantWorksheetRow.getCell(cellMapping.col.startDate).value = regDate;
                    if (!customer.active) {
                      plantWorksheetRow.getCell(cellMapping.col.endDate).value = customer.tsTo;
                    }

                    plantWorksheetRowPos++;

                    const mainWorksheetRow = sheetRef.summary.insertRow(mainWorksheetRowPos);

                    // Object.values(cellMapping.col).forEach(colRef => {
                    //   mainWorksheetRow.getCell(colRef).value = plantWorksheetRow.getCell(colRef).value;
                    // })
                    mainWorksheetRow.getCell(cellMapping.col.regDate).value = regDate;
                    mainWorksheetRow.getCell(cellMapping.col.fullName).value = customer.fullName;
                    if (customer.contacts.length) {
                      mainWorksheetRow.getCell(cellMapping.col.phone).value = customer.contacts[0].address;
                    }
                    mainWorksheetRow.getCell(cellMapping.col.address).value = customer.address;
                    // mainWorksheetRow.getCell(cellMapping.col.businessActivity).value = ;
                    mainWorksheetRow.getCell(cellMapping.col.commCat).value = customer.commCat;
                    mainWorksheetRow.getCell(cellMapping.col.serviceLocation).value = plantEntry[1].name;
                    mainWorksheetRow.getCell(cellMapping.col.serviceType).value = 'Mini-grid';
                    mainWorksheetRow.getCell(cellMapping.col.serviceId).value = customer.pod;
                    mainWorksheetRow.getCell(cellMapping.col.subscription).value = customer.tariff.name;
                    mainWorksheetRow.getCell(cellMapping.col.upfrontPaymentDone).value = 'Y';
                    mainWorksheetRow.getCell(cellMapping.col.startDate).value = regDate;
                    if (!customer.active) {
                      mainWorksheetRow.getCell(cellMapping.col.endDate).value = customer.tsTo;
                    }

                    mainWorksheetRowPos++;
                  });

                  for (let styleRowIndex = cellMapping.row.start; styleRowIndex < plantWorksheetRowPos; styleRowIndex++) {
                    const top = styleRowIndex === cellMapping.row.start;
                    const bottom = styleRowIndex === plantWorksheetRowPos - 1;
                    Object.values(cellMapping.col).forEach(colRef => {
                      sheetRef[plantEntry[0]].getCell(`${colRef}${styleRowIndex}`).border = cellMapping.style.borderFactory(top, colRef === cellMapping.col.regDate, bottom, colRef === cellMapping.col.notes)
                    })
                  }
                });

                countryCell.value = [...countries].join(', ');
                miniGridCell.value = `All ${Object.keys(plantById).length} (see other sheets)`;

                for (let styleRowIndex = cellMapping.row.start; styleRowIndex < mainWorksheetRowPos; styleRowIndex++) {
                  const top = styleRowIndex === cellMapping.row.start;
                  const bottom = styleRowIndex === mainWorksheetRowPos - 1;
                  Object.values(cellMapping.col).forEach(colRef => {
                    sheetRef.summary.getCell(`${colRef}${styleRowIndex}`).border = cellMapping.style.borderFactory(top, colRef === cellMapping.col.regDate, bottom, colRef === cellMapping.col.notes)
                  })
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
