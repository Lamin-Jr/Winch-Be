exports.boot = () => {
  const client = require('../app/winch/api/clients/spm');
  const mongooseDbConn = require('../app/winch/api/middleware/mongoose-db-conn');
  const schemaDriverConf = require(`../app/winch/api/schemas/readings/meter-reading-conf-api`);
  mongooseDbConn.driverDBConnRegistry.on("connection", driverCode => {
    if (driverCode !== 'spm') {
      return;
    }

    const DriverConf = mongooseDbConn.driverDBConnRegistry
      .get(driverCode)
      .model(`DriverConf`, schemaDriverConf);

    DriverConf.find({
      $or: [ { enabled: { $eq: true } }, { _id: { $eq: 'sites/DEMO' } } ],
      api: { $exists: true }
    })
      .exec()
      .then((findDriverResult) => {
        if (!findDriverResult.length) {
          console.info('Sparkmeter client preload has no configurations available');
          return;
        }

        findDriverResult.forEach((driverConf) => {
          client.preloadInstance({
            key: driverConf.plant.id,
            setup: {
              site: driverConf.api.site,
              at: driverConf.api.token,
              meta: {
                ccy: driverConf.site.ccy,
              },
            }
          })
            ? console.info(`Sparkmeter client preload: ${driverConf.plant.id}/${driverConf.api.site} site done`)
            : console.error(`Sparkmeter client preload: ${driverConf.plant.id}/${driverConf.api.site} site error => ${readError}`);
        });
      })
      .catch((readError) => {
        console.error(`Sparkmeter client preload error => ${readError}`);
      })
  });
};
