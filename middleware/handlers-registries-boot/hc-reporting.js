exports.bootReportRecipes = (slug, registry) => {
  let handlerType;
  let registryRef;
  let HandlerClass;

  handlerType = 'comm'

  registryRef = 'mg-conn-cust'
  HandlerClass = require(`../../app/winch/api/middleware/${slug}-handler/hc/${handlerType}/${registryRef}`);
  registry.boot(registryRef, new HandlerClass());

  handlerType = 'om'

  // TODO om report recipes
}

exports.bootXlsRecipes = (slug, registry) => {
  let handlerType;
  let registryRef;
  let HandlerClass;

  handlerType = 'comm'

  registryRef = 'mg-conn-cust'
  HandlerClass = require(`../../app/winch/api/middleware/${slug}-handler/hc/${handlerType}/${registryRef}`);
  registry.boot(registryRef, new HandlerClass());

  handlerType = 'om'

  // TODO om xls recipes
}
