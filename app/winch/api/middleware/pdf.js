module.exports.initPdfMaker = () => {
  return new Promise((resolve, reject) => {
    try {
      let pdfMake = require('pdfmake/build/pdfmake')
      if (pdfMake.vfs === undefined) {
        let pdfFonts = require('pdfmake/build/vfs_fonts')
        pdfMake.vfs = pdfFonts.pdfMake.vfs
      }
      resolve(pdfMake)
    } catch (error) {
      reject(error)
    }
  })
}

module.exports.buildBasicDocumentOption = (pageSetup) => {
  const isPortrait = pageSetup.orientation === 'portrait'
  return {
    pageOrientation: pageSetup.orientation,
    pageSize: pageSetup.size,
    pageMargins: pageSetup.margins,
    header:
    {
      columns: [{
        svg: '<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1132.25 620.26"><defs><style>.cls-1{fill:#1d2f7b;}.cls-2{fill:#7d7dba;}.cls-3{fill:#f7942e;}.cls-4{fill:#70238e;}.cls-5{fill:#d70d2a;}.cls-6{fill:#9d0117;}.cls-7{fill:#f7da00;}.cls-8{fill:#fdba30;}</style></defs><title>Winch Energy Master RGB lockup</title><path class="cls-1" d="M33.76,629.49h27.3l8.71,46.39c2.35,13.57,4.7,28.3,6.37,39.52h.34c1.84-12.22,4.69-25.79,7.54-39.68l9.54-46.23h27.13l9.22,47.74c2.18,13.06,4.18,25.12,5.86,37.68h.33c1.68-12.56,4.19-25.79,6.54-39.19l9-46.23H177.8L148.65,742.38H121l-9.55-48.58c-2.34-11.22-4-21.93-5.53-34.84h-.33c-1.84,12.91-3.68,23.62-6.19,35L88.53,742.38H60.39Z" transform="translate(-33.76 -123.95)"/><path class="cls-1" d="M191,629.49h25.62V742.38H191Z" transform="translate(-33.76 -123.95)"/><path class="cls-1" d="M238.78,629.49h29.81l23.28,41.38a330.28,330.28,0,0,1,18.59,38.67h.5a418.74,418.74,0,0,1-2.18-47.22V629.49h23.46V742.38H305.6L281.32,699c-6.7-12.22-14.24-26.63-19.6-39.86H261c.84,14.91,1.18,31,1.18,49.41v33.83H238.78Z" transform="translate(-33.76 -123.95)"/><path class="cls-1" d="M410.78,627.81c13.23,0,23.45,2.52,27.81,5l-5.35,20.09A53.59,53.59,0,0,0,412,648.75c-20.1,0-36,12.23-36,37.35,0,22.61,13.4,36.85,36.17,36.85a63.68,63.68,0,0,0,21.27-3.69l3.85,20.1c-4.69,2.17-15.24,4.86-29,4.86-39,0-59.12-24.45-59.12-56.62C349.15,649.08,376.61,627.81,410.78,627.81Z" transform="translate(-33.76 -123.95)"/><path class="cls-1" d="M454,629.49h25.62v43.37h42V629.49h25.46V742.38H521.67V695.14h-42v47.24H454Z" transform="translate(-33.76 -123.95)"/><path class="cls-2" d="M615.3,629.49h61.13v12.06H630V677.4h43.71v12.05H630v40.86h48.9v12.07H615.3Z" transform="translate(-33.76 -123.95)"/><path class="cls-2" d="M697.54,629.49h16.08l36.18,57.12a363.43,363.43,0,0,1,20.26,36.84l.34-.34c-1.34-15.07-1.68-28.8-1.68-46.22v-47.4h13.73V742.38H767.71l-35.84-57.29c-7.87-12.56-15.58-25.46-21.1-37.67l-.5.16c.83,14.24,1.17,27.8,1.17,46.55v48.25h-13.9Z" transform="translate(-33.76 -123.95)"/><path class="cls-2" d="M807.75,629.49h61.13v12.06H822.49V677.4H866.2v12.05H822.49v40.86h48.9v12.07H807.75Z" transform="translate(-33.76 -123.95)"/><path class="cls-2" d="M890,631a155.46,155.46,0,0,1,28.15-2.34c15.4,0,25.62,2.84,32.65,9.21,5.53,5,8.88,12.74,8.88,21.61,0,14.74-9.38,24.63-21.27,28.64v.49c8.71,3,13.9,11.23,16.58,22.79,3.68,15.9,6.37,26.63,8.71,31H948.44c-1.67-3.2-4.36-12.9-7.37-27-3.35-15.4-9.38-21.43-22.6-21.93H904.73v48.91H890Zm29.65,51.42c15.58,0,25.29-8.55,25.29-21.44,0-14.58-10.56-20.94-25.8-21.1-7.19,0-12.05.67-14.4,1.34v41.2Z" transform="translate(-33.76 -123.95)"/><path class="cls-2" d="M973.57,686.6c0-33.5,23.28-58.28,61.13-58.28,12.89,0,23.28,3,28.13,5.18l-3.51,11.9c-6-2.69-13.56-4.86-25-4.86-27.46,0-45.39,17.09-45.39,45.39,0,28.64,17.08,45.55,43.54,45.55,9.55,0,15.91-1.33,19.26-3V694.8H1029V683.09h37.19v54.26a101,101,0,0,1-34.67,6.2c-17.08,0-31.15-4.36-42.21-14.91C979.61,719.25,973.57,704.18,973.57,686.6Z" transform="translate(-33.76 -123.95)"/><path class="cls-2" d="M1113.58,694.64l-35.67-65.16h16.75l15.74,31.15c4.36,8.55,7.71,15.4,11.22,23.28h.34c3-7.37,7-14.74,11.4-23.28l16.24-31.15H1166l-37.68,64.82v48.07h-14.74Z" transform="translate(-33.76 -123.95)"/><polygon class="cls-3" points="402.09 0 474.53 202.17 406.52 402.06 405.71 402.06 335.5 195.71 402.09 0"/><polygon class="cls-4" points="684.19 0 825.43 0 688.63 402.06 687.81 402.06 615.66 201.4 684.19 0"/><polygon class="cls-5" points="615.66 201.4 547.4 402.06 546.57 402.06 474.53 202.17 543.3 0.07 615.66 201.4"/><polygon class="cls-6" points="402.09 0 543.28 0 543.3 0.07 474.53 202.17 402.09 0 402.09 0"/><polygon class="cls-1" points="688.63 402.06 546.57 402.06 615.66 201.4 688.63 402.06"/><polygon class="cls-7" points="268.91 0 335.5 195.71 265.29 402.06 264.47 402.06 127.68 0 268.91 0"/><polygon class="cls-8" points="406.52 402.06 264.47 402.06 335.5 195.71 406.52 402.06"/><polygon class="cls-6" points="863.44 0.03 831.21 0 818.6 36.73 796.75 101.05 997 101.05 1031.67 0.03 863.44 0.03"/><polygon class="cls-3" points="779.57 150.61 745.24 251.66 944.99 251.66 979.64 150.64 779.57 150.61"/><polygon class="cls-7" points="729.1 301.21 694.77 402.27 894.02 402.27 928.67 301.24 729.1 301.21"/></svg>',
        width: 90,
        height: 50
      }],
      margin: isPortrait ? [20, 30] : [30, 20]
    },
    footer: { text: `Export date: ${new Date().toLocaleString(pageSetup.locale)} `, margin: [20, 0], alignment: 'right' }
  }
}

module.exports.buildPortraitPageSetup = (margins = [48, 27], size = 'A4') => {
  return buildPageSetup('portrait', margins, size)
}

module.exports.buildLandscapePageSetup = (margins = [27, 48], size = 'A4') => {
  return buildPageSetup('landscape', margins, size)
}

//
// private part

const buildPageSetup = (orientation, margins, size) => {
  return {
    margins,
    orientation,
    size
  }
}
