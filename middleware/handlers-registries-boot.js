exports.boot = () => {
  let handlerSlug;
  let HandlerClass;
  let registryRef;

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
};
