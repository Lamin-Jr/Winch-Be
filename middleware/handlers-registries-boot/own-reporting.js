exports.bootReportRecipes = (slug, registry) => {
  let registryRef;
  let HandlerClass;

  registryRef = 'project-overview'
  HandlerClass = require(`../../app/winch/api/middleware/${slug}-handler/own/${registryRef}`);
  registry.boot(registryRef, new HandlerClass());
}

exports.bootXlsRecipes = (slug, registry) => {
  let registryRef;
  let HandlerClass;

  registryRef = 'project-overview'
  HandlerClass = require(`../../app/winch/api/middleware/${slug}-handler/own/${registryRef}`);
  registry.boot(registryRef, new HandlerClass());
}
