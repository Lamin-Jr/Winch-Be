const {
  Handler,
} = require('../../../../../api/lib/util/handler')

const {
  initPdfMaker,
  buildBasicDocumentOption,
  buildLandscapePageSetup,
} = require('../pdf')

const {
  NumberFormatter,
  DateFormatter,
} = require('../../../../../api/lib/util/formatter')


class SummaryBaseHandler extends Handler {
  constructor () {
    super();
  }

  handle (context) {
    return new Promise((resolve, reject) => {
      try {
        initPdfMaker()
          .then(maker => {
            const formatter = {
              zeroDigitFraction: NumberFormatter.buildFixedDecimalFormatter(context.locale, 0),
              twoDigitFraction: NumberFormatter.buildFixedDecimalFormatter(context.locale, 2),
            }
            formatter.percentual = v => `${formatter.twoDigitFraction(100 * v)}%`;

            const reportTitle = `Summary report of ${context.period.to}`;

            const plantsInfo = Object.values(context.startOfBusinessDatesByPlantId);
            const countries = [...new Set(plantsInfo.map(entryValue => entryValue.country))];
            const projects = [...new Set(plantsInfo.map(entryValue => entryValue.project))];
            const plantsTotals = plantsInfo.reduce((previousValue, currentValue) => {
              return {
                pvCap: previousValue.pvCap + currentValue.pvCap,
                battCap: previousValue.battCap + currentValue.battCap,
              };
            });

            const eFcstSample = context.eForecast[context.eForecast.length - 1];
            const eFcstDiff = 100 * (eFcstSample['fm-real-cum-tccy'] - eFcstSample['fm-fcst-cum-tccy']) / eFcstSample['fm-fcst-cum-tccy'];
            const eFcstDiffStyle = eFcstDiff < 0 ? 'tableCellBodyNumberNegative' : 'tableCellBodyNumber'
            const battFcstSample = context.battForecast[context.battForecast.length - 1];
            const battFcstDiff = 100 * (battFcstSample['fm-real-cum-tccy'] - battFcstSample['fm-fcst-cum-tccy']) / battFcstSample['fm-fcst-cum-tccy'];
            const battFcstDiffStyle = battFcstDiff < 0 ? 'tableCellBodyNumberNegative' : 'tableCellBodyNumber'
            const totForecast = eFcstSample['fm-fcst-cum-tccy'] + battFcstSample['fm-fcst-cum-tccy']
            const totActual = eFcstSample['fm-real-cum-tccy'] + battFcstSample['fm-real-cum-tccy']
            const totDiff = 100 * (totActual - totForecast) / totForecast;
            const totDiffStyle = totDiff < 0 ? 'tableCellBodyNumberNegative' : 'tableCellBodyNumber'

            const content = {
              info: {
                title: `[PDF] ${reportTitle}`
              },
              ...buildBasicDocumentOption({
                ...buildLandscapePageSetup([27, 48 + 50, 27, 48], 'A3'),
                locale: context.locale
              }),
              content: [
                // title
                { text: 'Report:', alignment: 'left', bold: true, fontSize: 16, margin: [150, -50 - 25, 0, 0] },
                { text: reportTitle, alignment: 'left', fontSize: 14, margin: [150, 10, 0, 48] },
                { text: 'Brief information', style: 'parTitle' },
                // recap tables
                {
                  layout: 'noBorders',
                  margin: [0, 0, 0, 24],
                  table: {
                    widths: ['*', 'auto', '*', 'auto', '*'],
                    body: [[
                      '',
                      {
                        table: {
                          headerRows: 1,
                          widths: ['auto', 'auto'],
                          body: [
                            [
                              { text: `Countr${countries.length === 1 ? 'y' : 'ies'}: `, style: 'recapTableColHead' },
                              { text: countries.join(', '), style: 'recapTableCellBody' },
                            ],
                            [
                              { text: `Project${countries.length === 1 ? '' : 's'}: `, style: 'recapTableColHead' },
                              { text: projects.join(', '), style: 'recapTableCellBody' },
                            ],
                            [
                              { text: 'Period begin: ', style: 'recapTableColHead' },
                              { text: extractPeriodBegin(plantsInfo), style: 'recapTableCellBody' },
                            ],
                            [
                              { text: 'Period end: ', style: 'recapTableColHead' },
                              { text: extractPeriodEnd(context.daily), style: 'recapTableCellBody' },
                            ],
                            [
                              { text: 'Average tariff [SLL/kWh]: ', style: 'recapTableColHead' },
                              { text: NumberFormatter.formatNumberOrDefault(7596, formatter.twoDigitFraction), style: 'recapTableCellBodyNumber' },
                            ],
                            [
                              { text: 'Exchange rate [SLL/USD]: ', style: 'recapTableColHead' },
                              { text: NumberFormatter.formatNumberOrDefault(9400, formatter.twoDigitFraction), style: 'recapTableCellBodyNumber' },
                            ],
                            [
                              { text: 'Total PV capacity [kWp]: ', style: 'recapTableColHead' },
                              { text: NumberFormatter.formatNumberOrDefault(plantsTotals.pvCap, formatter.twoDigitFraction), style: 'recapTableCellBodyNumber' },
                            ],
                            [
                              { text: 'Total battery capacity [kWh@C10]: ', style: 'recapTableColHead' },
                              { text: NumberFormatter.formatNumberOrDefault(plantsTotals.battCap, formatter.twoDigitFraction), style: 'recapTableCellBodyNumber' },
                            ],
                          ]
                        }
                      },
                      '',
                      {
                        table: {
                          headerRows: 1,
                          widths: ['auto', 'auto'],
                          body: [
                            [
                              { text: 'Plants list', alignment: 'center', colSpan: 2, style: 'recapTableRowHead' },
                              {}
                            ],
                            [
                              { text: 'Name', style: 'recapTableRowHead' },
                              { text: 'Begin of commercial activities', style: 'recapTableRowHead' },
                            ],
                            ...plantsInfo.map(entryValue => [
                              { text: entryValue.name, style: 'recapTableCellBody' },
                              { text: entryValue.date, alignment: 'center', style: 'recapTableCellBody' },
                            ]),
                          ]
                        }
                      },
                      '',
                    ]],
                  },
                },
                { text: 'Financial performance', style: 'parTitle2' },
                // forecast table
                {
                  layout: 'noBorders',
                  margin: [0, 0, 0, 24],
                  table: {
                    widths: ['*', 'auto', '*'],
                    body: [[
                      '',
                      {
                        table: {
                          widths: ['auto', 200, 200, 200, 175],
                          body: [
                            [
                              { text: '', border: [false, false, true, false] },
                              { text: 'Sales forecast', border: [true, true, true, false], style: ['tableHeader', 'forecastTableColHeaderColored'] },
                              { text: 'Actual sales', border: [true, true, true, false], style: ['tableHeader', 'forecastTableColHeaderColored'] },
                              { text: 'Difference', border: [true, true, true, false], style: ['tableHeader', 'forecastTableColHeaderColored'] },
                              { text: 'Note', border: [true, true, true, false], style: 'tableHeader' },
                            ],
                            [
                              { text: '', border: [false, false, true, true], style: 'forecastTableColSubHeaderLower' },
                              { text: 'US$', border: [true, false, true, true], style: ['forecastTableColHeaderColored', 'forecastTableColSubHeaderLower'] },
                              { text: 'US$', border: [true, false, true, true], style: ['forecastTableColHeaderColored', 'forecastTableColSubHeaderLower'] },
                              { text: '%', border: [true, false, true, true], style: ['forecastTableColHeaderColored', 'forecastTableColSubHeaderLower'] },
                              { text: '', border: [true, false, true, true], style: 'forecastTableColSubHeaderLower' },
                            ],
                            [
                              { text: 'Energy', style: 'forecastTableRowHeader' },
                              { text: NumberFormatter.formatNumberOrDefault(eFcstSample['fm-fcst-cum-tccy'], formatter.twoDigitFraction), style: 'tableCellBodyNumber' },
                              { text: NumberFormatter.formatNumberOrDefault(eFcstSample['fm-real-cum-tccy'], formatter.twoDigitFraction), style: 'tableCellBodyNumber' },
                              { text: `${NumberFormatter.formatNumberOrDefault(eFcstDiff, formatter.twoDigitFraction)}%`, style: eFcstDiffStyle },
                              { text: `Last update: ${eFcstSample._id}\nTotal energy sold: ${NumberFormatter.formatNumberOrDefault(eFcstSample['es-real-cum'], formatter.twoDigitFraction)} kWh\nForecast figures take in account the ramp-up curve.`, style: 'forecastTableCellBodyNote' },
                            ],
                            [
                              { text: 'Battery rental', style: 'forecastTableRowHeader' },
                              { text: NumberFormatter.formatNumberOrDefault(battFcstSample['fm-fcst-cum-tccy'], formatter.twoDigitFraction), style: 'tableCellBodyNumber' },
                              { text: NumberFormatter.formatNumberOrDefault(battFcstSample['fm-real-cum-tccy'], formatter.twoDigitFraction), style: 'tableCellBodyNumber' },
                              { text: `${NumberFormatter.formatNumberOrDefault(battFcstDiff, formatter.twoDigitFraction)}%`, style: battFcstDiffStyle },
                              { text: `Last update: ${battFcstSample._id}\nTotal rentals: ${battFcstSample['tx-p-cum']}.\nOperator: mopo`, style: 'forecastTableCellBodyNote' },
                            ],
                            [
                              { text: 'Totals', alignment: 'right', style: 'tableHeader' },
                              { text: NumberFormatter.formatNumberOrDefault(totForecast, formatter.twoDigitFraction), style: ['tableHeader', 'tableCellBodyNumber'] },
                              { text: NumberFormatter.formatNumberOrDefault(totActual, formatter.twoDigitFraction), style: ['tableHeader', 'tableCellBodyNumber'] },
                              { text: `${NumberFormatter.formatNumberOrDefault(totDiff, formatter.twoDigitFraction)}%`, style: ['tableHeader', totDiffStyle] },
                              {},
                            ],
                          ],
                        }
                      },
                      '',
                    ]],
                  },
                },
                { text: 'Energy sold and revenues - long/mid-term: yearly, monthly, and weekly overview', pageBreak: 'before', style: 'parTitle' },
                // yearly table
                {
                  margin: [0, 0, 0, 24],
                  table: {
                    widths: buildPeriodTableWidths(),
                    body: [
                      ...buildPeriodTableHeadRows('Year'),
                      ...buildPeriodTableBodyRows({
                        periodSamples: context.yearly,
                        buildGenSampleKey: sample => sample._id.b.split('-', 1)[0],
                        buildGenPeriodBeginDate: sample => new Date(sample._id.b),
                        buildGenPeriodEndDate: sample => new Date(sample._id.e),
                        buildDelivSampleKey: sample => sample._id.b.split('-', 1)[0],
                        buildDelivPeriodBeginDate: sample => new Date(sample._id.b),
                        buildDelivPeriodEndDate: sample => new Date(sample._id.e),
                        formatter,
                      }),
                    ],
                  },
                },
                // monthly table
                {
                  margin: [0, 0, 0, 24],
                  table: {
                    widths: buildPeriodTableWidths(),
                    body: [
                      ...buildPeriodTableHeadRows('Month'),
                      ...buildPeriodTableBodyRows({
                        periodSamples: context.monthly,
                        buildGenSampleKey: sample => {
                          const dateTokens = sample._id.b.split('-');
                          return `${dateTokens[0]}-${dateTokens[1]}`;
                        },
                        buildGenPeriodBeginDate: sample => new Date(sample._id.b),
                        buildGenPeriodEndDate: sample => new Date(sample._id.e),
                        buildDelivSampleKey: sample => {
                          const dateTokens = sample._id.b.split('-');
                          return `${dateTokens[0]}-${dateTokens[1]}`;
                        },
                        buildDelivPeriodBeginDate: sample => new Date(sample._id.b),
                        buildDelivPeriodEndDate: sample => new Date(sample._id.e),
                        formatter,
                      }),
                    ],
                  },
                },
                // weekly table
                {
                  margin: [0, 0, 0, 24],
                  table: {
                    widths: buildPeriodTableWidths(),
                    body: [
                      ...buildPeriodTableHeadRows('Week'),
                      ...buildPeriodTableBodyRows({
                        periodSamples: context.weekly,
                        buildGenSampleKey: sample => `${sample._id.b}\n${sample._id.e}`,
                        buildGenPeriodBeginDate: sample => new Date(sample._id.b),
                        buildGenPeriodEndDate: sample => new Date(sample._id.e),
                        buildDelivSampleKey: sample => `${sample._id.b}\n${sample._id.e}`,
                        buildDelivPeriodBeginDate: sample => new Date(sample._id.b),
                        buildDelivPeriodEndDate: sample => new Date(sample._id.e),
                        formatter,
                      }),
                    ],
                  },
                },
                { text: 'Energy sold and revenues - shot-term: daily overview (last 31 days)', pageBreak: 'before', style: 'parTitle' },
                // daily table
                {
                  margin: [0, 0, 0, 24],
                  table: {
                    widths: buildPeriodTableWidths(),
                    body: [
                      ...buildPeriodTableHeadRows('Day'),
                      ...buildPeriodTableBodyRows({
                        periodSamples: context.daily,
                        buildGenSampleKey: sample => sample._id.d,
                        buildGenPeriodBeginDate: sample => new Date(new Date(sample._id.d).setDate(new Date(sample._id.d).getDate() - 1)),
                        buildGenPeriodEndDate: sample => new Date(sample._id.d),
                        buildDelivSampleKey: sample => sample._id.d,
                        buildDelivPeriodBeginDate: sample => new Date(new Date(sample._id.d).setDate(new Date(sample._id.d).getDate() - 1)),
                        buildDelivPeriodEndDate: sample => new Date(sample._id.d),
                        formatter,
                      }),
                    ],
                  },
                },
              ],
              styles: {
                // shared
                parTitle: {
                  bold: true,
                  fontSize: 13,
                  margin: [0, 0, 0, 24],
                },
                parTitle2: {
                  bold: true,
                  fontSize: 12,
                  margin: [0, 0, 0, 20],
                },
                tableHeader: {
                  bold: true
                },
                tableCellBodyNumber: {
                  alignment: 'right'
                },
                tableCellBodyNumberNegative: {
                  alignment: 'right',
                  color: 'red',
                },
                // specialized
                recapTableRowHead: {
                  bold: true, color: 'white', fillColor: '#027BE3', fontSize: 13,
                },
                recapTableColHead: {
                  alignment: 'right', bold: true, color: 'white', fillColor: '#027BE3', fontSize: 13,
                },
                recapTableCellBody: {
                },
                recapTableCellBodyNumber: {
                  alignment: 'right',
                },
                infoTableRowHeader: {
                  bold: true, fontSize: 9,
                },
                infoTableRowSubHeader: {
                  alignment: 'right',
                },
                infoTableRowHeaderEnergy: {
                  color: 'white', fillColor: '#8c9eff',
                },
                infoTableRowHeaderCurrency: {
                  color: 'black', fillColor: '#81c784',
                },
                infoTableRowHeaderStats: {
                  color: 'black', fillColor: '#ffe0b2',
                },
                forecastTableColHeaderColored: {
                  bold: true, fillColor: '#85BB65',
                },
                forecastTableColSubHeaderLower: {
                  alignment: 'right',
                },
                forecastTableRowHeader: {
                  bold: true, color: 'white', fillColor: '#027BE3',
                },
                forecastTableCellBodyNote: {
                  fontSize: 7,
                },
              },
            };

          /*const doc = */maker.createPdf(content).getBuffer(pdfBuffer => resolve(pdfBuffer));
          });
      } catch (error) {
        reject(error);
      }
    });
  }
}


const extractPeriodBegin = (plantsInfo) => {
  return plantsInfo.reduce((acc, current) => !acc
    ? new Date(current.date)
    : (new Date(acc) < new Date(current.date)
      ? acc
      : current.date)
  )
}

const extractPeriodEnd = (dailySamples) => {
  const latestGenDate = dailySamples.gen[dailySamples.gen.length - 1];
  const latestDelivDate = dailySamples.deliv[dailySamples.deliv.length - 1];

  if (!latestGenDate && !latestDelivDate) {
    return DateFormatter.formatDateOrDefault(new Date(), DateFormatter.buildISOZoneDateFormatter());
  } else if (!latestGenDate && latestDelivDate) {
    return latestDelivDate._id.d;
  } else if (latestGenDate && !latestDelivDate) {
    return latestGenDate._id.d;
  }

  return new Date(latestGenDate._id.d) > new Date(latestDelivDate._id.d)
    ? latestGenDate._id.d
    : latestDelivDate._id.d;
}

const buildPeriodTableWidths = () => {
  return ['*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*'];
}

const buildPeriodTableHeadRows = (periodLabel) => {
  return [
    [
      { text: periodLabel, border: [true, true, true, false], style: ['infoTableRowHeader', 'infoTableRowHeaderEnergy'] },
      { text: 'Theoretical PV energy', border: [true, true, true, false], style: ['infoTableRowHeader', 'infoTableRowHeaderEnergy'] },
      { text: 'AV', border: [true, true, true, false], style: ['infoTableRowHeader', 'infoTableRowHeaderEnergy'] },
      { text: 'Energy delivered', border: [true, true, true, false], style: ['infoTableRowHeader', 'infoTableRowHeaderEnergy'] },
      { text: 'Energy sold', border: [true, true, true, false], style: ['infoTableRowHeader', 'infoTableRowHeaderEnergy'] },
      { text: 'Energy sold', border: [true, true, true, false], style: ['infoTableRowHeader', 'infoTableRowHeaderCurrency'] },
      { text: 'Standing charge', border: [true, true, true, false], style: ['infoTableRowHeader', 'infoTableRowHeaderCurrency'] },
      { text: 'Total energy revenues', border: [true, true, true, false], style: ['infoTableRowHeader', 'infoTableRowHeaderCurrency'] },
      { text: 'Cash', border: [true, true, true, false], style: ['infoTableRowHeader', 'infoTableRowHeaderCurrency'] },
      { text: 'Self consumption', border: [true, true, true, false], style: ['infoTableRowHeader', 'infoTableRowHeaderEnergy'] },
      { text: 'Dumping', border: [true, true, true, false], style: ['infoTableRowHeader', 'infoTableRowHeaderEnergy'] },
      { text: 'Total customers', border: [true, true, true, false], style: ['infoTableRowHeader', 'infoTableRowHeaderEnergy'] },
      { text: 'Avg. community consumption', border: [true, true, true, false], style: ['infoTableRowHeader', 'infoTableRowHeaderStats'] },
      { text: 'Avg. self consumption', border: [true, true, true, false], style: ['infoTableRowHeader', 'infoTableRowHeaderStats'] },
    ],
    [
      { text: '', border: [true, false, true, true], style: ['infoTableRowHeader', 'infoTableRowHeaderEnergy', 'infoTableRowSubHeader'] },
      { text: 'kWh', border: [true, false, true, true], style: ['infoTableRowHeader', 'infoTableRowHeaderEnergy', 'infoTableRowSubHeader'] },
      { text: '%', border: [true, false, true, true], style: ['infoTableRowHeader', 'infoTableRowHeaderEnergy', 'infoTableRowSubHeader'] },
      { text: 'kWh', border: [true, false, true, true], style: ['infoTableRowHeader', 'infoTableRowHeaderEnergy', 'infoTableRowSubHeader'] },
      { text: 'kWh', border: [true, false, true, true], style: ['infoTableRowHeader', 'infoTableRowHeaderEnergy', 'infoTableRowSubHeader'] },
      { text: 'US$', border: [true, false, true, true], style: ['infoTableRowHeader', 'infoTableRowHeaderCurrency', 'infoTableRowSubHeader'] },
      { text: 'US$', border: [true, false, true, true], style: ['infoTableRowHeader', 'infoTableRowHeaderCurrency', 'infoTableRowSubHeader'] },
      { text: 'US$', border: [true, false, true, true], style: ['infoTableRowHeader', 'infoTableRowHeaderCurrency', 'infoTableRowSubHeader'] },
      { text: 'US$', border: [true, false, true, true], style: ['infoTableRowHeader', 'infoTableRowHeaderCurrency', 'infoTableRowSubHeader'] },
      { text: 'kWh', border: [true, false, true, true], style: ['infoTableRowHeader', 'infoTableRowHeaderEnergy', 'infoTableRowSubHeader'] },
      { text: '%', border: [true, false, true, true], style: ['infoTableRowHeader', 'infoTableRowHeaderEnergy', 'infoTableRowSubHeader'] },
      { text: '', border: [true, false, true, true], style: ['infoTableRowHeader', 'infoTableRowHeaderEnergy', 'infoTableRowSubHeader'] },
      { text: 'kWh', border: [true, false, true, true], style: ['infoTableRowHeader', 'infoTableRowHeaderStats', 'infoTableRowSubHeader'] },
      { text: 'kWh', border: [true, false, true, true], style: ['infoTableRowHeader', 'infoTableRowHeaderStats', 'infoTableRowSubHeader'] },
    ]
  ];
}

const buildPeriodTableBodyRows = (context) => {
  const rowsByPeriod = new Map();

  const accumulate = (acc, current) => {
    return (isNaN(acc) ? 0 : acc) + current;
  }
  const notAvailablePlaceholder = 'N.A.';

  context.periodSamples.gen.forEach(genSample => {
    const key = context.buildGenSampleKey(genSample);

    const sampleRow = rowsByPeriod.get(key) || buildPeriodTableEmptyBodyRow(key, context.buildGenPeriodBeginDate(genSample), context.buildGenPeriodEndDate(genSample));
    sampleRow.data[1].text = accumulate(sampleRow.data[1].text, genSample['e-theoretical']);
    sampleRow.data[3].text = accumulate(sampleRow.data[3].text, genSample['e-delivered']);
    sampleRow.data[9].text = accumulate(sampleRow.data[9].text, genSample['e-self-cons']);
    sampleRow.data[13].text = accumulate(sampleRow.data[13].text, genSample['e-self-cons']);

    rowsByPeriod.set(key, sampleRow);
  });

  context.periodSamples.deliv.forEach(delivSample => {
    const key = context.buildDelivSampleKey(delivSample);

    const sampleRow = rowsByPeriod.get(key) || buildPeriodTableEmptyBodyRow(key, context.buildDelivPeriodBeginDate(delivSample), context.buildDelivPeriodEndDate(delivSample));
    sampleRow.data[2].text = accumulate(sampleRow.data[2].text, delivSample['av']);
    sampleRow.data[4].text = accumulate(sampleRow.data[4].text, delivSample['es']);
    sampleRow.data[5].text = accumulate(sampleRow.data[5].text, delivSample['r-es-tccy']);
    sampleRow.data[6].text = accumulate(sampleRow.data[6].text, delivSample['r-sg-tccy']);
    sampleRow.data[7].text = accumulate(sampleRow.data[7].text, delivSample['r-es-tccy'] + delivSample['r-sg-tccy']);
    sampleRow.data[8].text = accumulate(sampleRow.data[8].text, delivSample['tx-es-tccy']);
    sampleRow.data[11].text = accumulate(sampleRow.data[11].text, delivSample['cc']);
    sampleRow.data[12].text = accumulate(sampleRow.data[12].text, delivSample['es']);

    sampleRow.meta.totAvSamples++;

    rowsByPeriod.set(key, sampleRow);
  });

  const rows = [];
  const totalRequired = rowsByPeriod.size > 1
  const totalRow = totalRequired
    ? buildPeriodTableEmptyTotalRow()
    : undefined;

  rowsByPeriod.forEach(sampleRow => {
    sampleRow.data[2].text /= sampleRow.meta.totAvSamples;
    sampleRow.data[12].text /= sampleRow.meta.daysInterval;
    sampleRow.data[13].text /= sampleRow.meta.daysInterval;

    if (totalRequired) {
      totalRow.data[1].text += parseFloat(sampleRow.data[1].text.toFixed(2));
      totalRow.data[2].text += parseFloat(sampleRow.data[2].text.toFixed(2));
      totalRow.data[3].text += parseFloat(sampleRow.data[3].text.toFixed(2));
      totalRow.data[4].text += parseFloat(sampleRow.data[4].text.toFixed(2));
      totalRow.data[5].text += parseFloat(sampleRow.data[5].text.toFixed(2));
      totalRow.data[6].text += parseFloat(sampleRow.data[6].text.toFixed(2));
      totalRow.data[7].text += parseFloat(sampleRow.data[7].text.toFixed(2));
      totalRow.data[8].text += parseFloat(sampleRow.data[8].text.toFixed(2));
      totalRow.data[9].text += parseFloat(sampleRow.data[9].text.toFixed(2));
      totalRow.data[10].text += parseFloat(sampleRow.data[10].text.toFixed(2));
      totalRow.data[11].text += sampleRow.data[11].text;
    }

    sampleRow.data[1].text = NumberFormatter.formatNumberOrDefault(sampleRow.data[1].text, context.formatter.twoDigitFraction, notAvailablePlaceholder);
    sampleRow.data[2].text = NumberFormatter.formatNumberOrDefault(sampleRow.data[2].text, context.formatter.percentual, notAvailablePlaceholder);
    sampleRow.data[3].text = NumberFormatter.formatNumberOrDefault(sampleRow.data[3].text, context.formatter.twoDigitFraction, notAvailablePlaceholder);
    sampleRow.data[4].text = NumberFormatter.formatNumberOrDefault(sampleRow.data[4].text, context.formatter.twoDigitFraction, notAvailablePlaceholder);
    sampleRow.data[5].text = NumberFormatter.formatNumberOrDefault(sampleRow.data[5].text, context.formatter.twoDigitFraction, notAvailablePlaceholder);
    sampleRow.data[6].text = NumberFormatter.formatNumberOrDefault(sampleRow.data[6].text, context.formatter.twoDigitFraction, notAvailablePlaceholder);
    sampleRow.data[7].text = NumberFormatter.formatNumberOrDefault(sampleRow.data[7].text, context.formatter.twoDigitFraction, notAvailablePlaceholder);
    sampleRow.data[8].text = NumberFormatter.formatNumberOrDefault(sampleRow.data[8].text, context.formatter.twoDigitFraction, notAvailablePlaceholder);
    sampleRow.data[9].text = NumberFormatter.formatNumberOrDefault(sampleRow.data[9].text, context.formatter.twoDigitFraction, notAvailablePlaceholder);
    sampleRow.data[10].text = NumberFormatter.formatNumberOrDefault(sampleRow.data[10].text, context.formatter.percentual, notAvailablePlaceholder);
    sampleRow.data[11].text = NumberFormatter.formatNumberOrDefault(sampleRow.data[11].text, context.formatter.zeroDigitFraction, notAvailablePlaceholder);
    sampleRow.data[12].text = NumberFormatter.formatNumberOrDefault(sampleRow.data[12].text, context.formatter.twoDigitFraction, notAvailablePlaceholder);
    sampleRow.data[13].text = NumberFormatter.formatNumberOrDefault(sampleRow.data[13].text, context.formatter.twoDigitFraction, notAvailablePlaceholder);

    rows.push(sampleRow.data);
  });

  if (totalRequired) {
    // finalize means
    totalRow.data[2].text /= rowsByPeriod.size;
    totalRow.data[10].text /= rowsByPeriod.size;
    totalRow.data[11].text /= rowsByPeriod.size;

    totalRow.data[1].text = NumberFormatter.formatNumberOrDefault(totalRow.data[1].text, context.formatter.twoDigitFraction, notAvailablePlaceholder);
    totalRow.data[2].text = NumberFormatter.formatNumberOrDefault(totalRow.data[2].text, context.formatter.percentual, notAvailablePlaceholder);
    totalRow.data[3].text = NumberFormatter.formatNumberOrDefault(totalRow.data[3].text, context.formatter.twoDigitFraction, notAvailablePlaceholder);
    totalRow.data[4].text = NumberFormatter.formatNumberOrDefault(totalRow.data[4].text, context.formatter.twoDigitFraction, notAvailablePlaceholder);
    totalRow.data[5].text = NumberFormatter.formatNumberOrDefault(totalRow.data[5].text, context.formatter.twoDigitFraction, notAvailablePlaceholder);
    totalRow.data[6].text = NumberFormatter.formatNumberOrDefault(totalRow.data[6].text, context.formatter.twoDigitFraction, notAvailablePlaceholder);
    totalRow.data[7].text = NumberFormatter.formatNumberOrDefault(totalRow.data[7].text, context.formatter.twoDigitFraction, notAvailablePlaceholder);
    totalRow.data[8].text = NumberFormatter.formatNumberOrDefault(totalRow.data[8].text, context.formatter.twoDigitFraction, notAvailablePlaceholder);
    totalRow.data[9].text = NumberFormatter.formatNumberOrDefault(totalRow.data[9].text, context.formatter.twoDigitFraction, notAvailablePlaceholder);
    totalRow.data[10].text = NumberFormatter.formatNumberOrDefault(100 * totalRow.data[10].text, context.formatter.percentual, notAvailablePlaceholder);
    totalRow.data[11].text = NumberFormatter.formatNumberOrDefault(totalRow.data[11].text, context.formatter.zeroDigitFraction, notAvailablePlaceholder);

    rows.push(totalRow.data)
  }

  return rows;
}

const buildPeriodTableEmptyBodyRow = (periodLabel, beginDate, endDate) => {
  return {
    meta: {
      availableData: false,
      daysInterval: (endDate.getTime() - beginDate.getTime()) / (1000 * 3600 * 24),
      totAvSamples: 0,
    },
    data: [
      { text: periodLabel, style: { alignment: 'center' } },
      { text: NaN, style: ['tableCellBodyNumber'] },
      { text: NaN, style: ['tableCellBodyNumber'] },
      { text: NaN, style: ['tableCellBodyNumber'] },
      { text: NaN, style: ['tableCellBodyNumber'] },
      { text: NaN, style: ['tableCellBodyNumber'] },
      { text: NaN, style: ['tableCellBodyNumber'] },
      { text: NaN, style: ['tableCellBodyNumber'] },
      { text: NaN, style: ['tableCellBodyNumber'] },
      { text: NaN, style: ['tableCellBodyNumber'] },
      { text: NaN, style: ['tableCellBodyNumber'] },
      { text: NaN, style: ['tableCellBodyNumber'] },
      { text: NaN, style: ['tableCellBodyNumber'] },
      { text: NaN, style: ['tableCellBodyNumber'] },
    ]
  }
}

const buildPeriodTableEmptyTotalRow = () => {
  return {
    data: [
      { text: 'Total/Avg.', style: ['tableHeader', { alignment: 'right', bold: true }] },
      { text: 0.0, style: ['tableHeader', 'tableCellBodyNumber'] },
      { text: 0, style: ['tableHeader', 'tableCellBodyNumber'] },
      { text: 0.0, style: ['tableHeader', 'tableCellBodyNumber'] },
      { text: 0.0, style: ['tableHeader', 'tableCellBodyNumber'] },
      { text: 0.0, style: ['tableHeader', 'tableCellBodyNumber'] },
      { text: 0.0, style: ['tableHeader', 'tableCellBodyNumber'] },
      { text: 0.0, style: ['tableHeader', 'tableCellBodyNumber'] },
      { text: 0.0, style: ['tableHeader', 'tableCellBodyNumber'] },
      { text: 0.0, style: ['tableHeader', 'tableCellBodyNumber'] },
      { text: 0.0, style: ['tableHeader', 'tableCellBodyNumber'] },
      { text: 0, style: ['tableHeader', 'tableCellBodyNumber'] },
      { text: '', style: ['tableHeader', 'tableCellBodyNumber'] },
      { text: '', style: ['tableHeader', 'tableCellBodyNumber'] },
    ]
  }
}


module.exports = SummaryBaseHandler;
