const plantRefIdSchema = {
  type: Object,
  properties: {
    m: {
      type: String,
      required: true,
    },
    t: {
      type: String,
      required: true,
    }
  }
}

function buildPlantRefId (plantId, id) {
  return {
    m: plantId,
    t: id,
  }
}


//
// plant service

const plantServiceIdSchema = {
  ...plantRefIdSchema,
  i: String,
}

function buildPlantServiceId (plantId, tag, item = undefined) {
  const result = buildPlantRefId(plantId, tag)

  if (item) {
    result.i = item
  }

  return result
}

const plantServiceTags = [
  'chrg-batt',
  'chrg-phn',
  'chrg-lapt',
  'cold-room',
  'cold-drnk',
  'copy',
  'rent-batt',
  'scan',
  'print',
  'inet-wifi',
]

function buildPlantServicesDriversSubSchema () {
  const result = {}

  plantServiceTags.forEach(tag => result[tag] = String)

  return result
}


//
// plant service tariff

const plantServiceTariffIdSchema = {
  ...plantServiceIdSchema,
  v: Number,
}

function buildPlantServiceTariffId (v, plantId, tag, item = undefined) {
  const result = buildPlantServiceId(plantId, tag, item);

  result.v = v;
  
  return result;
}


//
// plant stat

const plantStatIdSchema = plantRefIdSchema

function buildPlantStatId (plantId, tag) {
  return buildPlantRefId(plantId, tag)
}


module.exports = {
  plantServiceTags,
  buildPlantServicesDriversSubSchema,
  plantServiceIdSchema,
  buildPlantServiceId,
  plantServiceTariffIdSchema,
  buildPlantServiceTariffId,
  plantStatIdSchema,
  buildPlantStatId,
}
