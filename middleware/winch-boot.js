const { buildCountries } = require('./winch-boot/country')
const { buildVillages } = require('./winch-boot/village')
const { buildPlants } = require('./winch-boot/plant')
const { buildPlantsServices } = require('./winch-boot/plant-service')
const { buildPlantsServiceTariffs } = require('./winch-boot/plant-service-tariff')
const { buildPlantsStatus } = require('./winch-boot/plant-status')
const { buildPlantParts } = require('./winch-boot/plant-part')
const { buildPoles } = require('./winch-boot/pole')
const { buildExchangeRates } = require('./winch-boot/exchange-rate')
const { buildAgents } = require('./winch-boot/agent')
const { buildRepresentatives } = require('./winch-boot/representative')
const { buildPlantDrivers } = require('./winch-boot/plant-driver')


exports.boot = () => {
  buildCountries()
  .then(() => buildVillages())
  .then(() => buildPlants())
  .then(() => buildPlantsServices())
  .then(() => buildPlantsServiceTariffs())
  .then(() => buildPlantsStatus())
  .then(() => buildPlantParts())
  .then(() => buildPoles())
  .then(() => buildExchangeRates())
  .then(() => buildAgents())
  .then(() => buildRepresentatives())
  .then(() => buildPlantDrivers())
  .catch(error => {
    console.error(`errors encountered during winch database population: ${error}`);
  })

};
