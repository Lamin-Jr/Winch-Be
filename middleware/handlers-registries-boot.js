const ownHandlersRegistriesBoot = require('./handlers-registries-boot/own-reporting');
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
  reportRecipeHandlersRegistry.boot(registryRef, new HandlerClass());
  // report recipe - boot imported
  ownHandlersRegistriesBoot.bootReportRecipes(handlerSlug, reportRecipeHandlersRegistry);
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
  ownHandlersRegistriesBoot.bootXlsRecipes(handlerSlug, xlsReportHandlersRegistry);
  holdCoHandlersRegistriesBoot.bootXlsRecipes(handlerSlug, xlsReportHandlersRegistry);
};
