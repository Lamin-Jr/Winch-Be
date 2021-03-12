const holdCoHandlersRegistriesBoot = require('./handlers-registries-boot/hc-reporting');

exports.boot = () => {
  let handlerSlug;
  let registryRef;
  let HandlerClass;

  //
  // report recipe
  handlerSlug = 'report-recipe';
  const reportRecipeHandlersRegistry = require(`../app/winch/api/middleware/${handlerSlug}-handlers-registry`);
  registryRef = 'e-sold-base'
  HandlerClass = require(`../app/winch/api/middleware/${handlerSlug}-handler/${registryRef}`);
  reportRecipeHandlersRegistry.boot(registryRef, new HandlerClass());
  registryRef = 'summary-base'
  HandlerClass = require(`../app/winch/api/middleware/${handlerSlug}-handler/${registryRef}`);
  // report recipe - boot imported
  holdCoHandlersRegistriesBoot.bootReportRecipes(handlerSlug, reportRecipeHandlersRegistry);

  //
  // pdf report
  handlerSlug = 'pdf-report';
  const pdfReportHandlersRegistry = require(`../app/winch/api/middleware/${handlerSlug}-handlers-registry`);
  registryRef = 'e-sold-base'
  HandlerClass = require(`../app/winch/api/middleware/${handlerSlug}-handler/${registryRef}`);
  pdfReportHandlersRegistry.boot(registryRef, new HandlerClass());
  registryRef = 'summary-base'
  HandlerClass = require(`../app/winch/api/middleware/${handlerSlug}-handler/${registryRef}`);
  pdfReportHandlersRegistry.boot(registryRef, new HandlerClass());

  //
  // xml report
  handlerSlug = 'xls-report';
  const xlsReportHandlersRegistry = require(`../app/winch/api/middleware/${handlerSlug}-handlers-registry`);
  // xml report - boot imported
  holdCoHandlersRegistriesBoot.bootXlsRecipes(handlerSlug, xlsReportHandlersRegistry);
};
