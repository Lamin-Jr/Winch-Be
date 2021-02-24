const mongoose = require('mongoose');


exports.buildPlantFiltersRepo = (inputFilter, isDailyModel, targetFilter = {}) => {
  if (inputFilter) {
    // date range
    //
    if (inputFilter.tsFrom) {
      targetFilter.ts = targetFilter.ts || {};
      targetFilter.ts['$gte'] = new Date(inputFilter.tsFrom);
    }
    if (inputFilter.tsTo) {
      const toFieldName = isDailyModel
        ? 'ts'
        : 'tst';
      targetFilter[toFieldName] = targetFilter[toFieldName] || {};
      targetFilter[toFieldName]['$lte'] = new Date(inputFilter.tsTo);
    }
  }

  const plantFilters = exports.buildPlantFilters(inputFilter, targetFilter);

  return {
    targetFilter,
    ...plantFilters,
  };
};


exports.buildPlantFilters = (inputFilter, targetFilter = {}) => {
  const plantsFilter = {
    enabled: true
  };
  let plantsStatusFilter = undefined;
  let plantsLocationsFilter = undefined;

  if (inputFilter) {
    if (inputFilter.plants && inputFilter.plants.length) {
      Object.assign(plantsFilter, {
        _id: { '$in': inputFilter.plants }
      })
    }
    if (inputFilter.projects && inputFilter.projects.length) {
      Object.assign(plantsFilter, {
        'project.id': { '$in': inputFilter.projects }
      })
    }
    if (inputFilter['plants-status'] && inputFilter['plants-status'].length) {
      plantsStatusFilter = {
        'monitor.status': { '$in': inputFilter['plants-status'] }
      }
    }
    if (inputFilter.villages && inputFilter.villages.length) {
      plantsLocationsFilter = {
        'village._id': { '$in': inputFilter.villages.map(idAsString => new mongoose.Types.ObjectId(idAsString)) }
      }
    }
    if (inputFilter.countries && inputFilter.countries.length) {
      if (!plantsLocationsFilter) {
        plantsLocationsFilter = {}
      }
      Object.assign(plantsLocationsFilter, {
        'village.country': { '$in': inputFilter.countries }
      })
    }
    if (inputFilter.categories && inputFilter.categories.length) {
      targetFilter.ct = inputFilter.categories.length === 1
        ? inputFilter.categories[0]
        : { $in: inputFilter.categories };
    }
    if (inputFilter.pods && inputFilter.pods.length) {
      targetFilter.pod = inputFilter.pods.length === 1
        ? inputFilter.pods[0]
        : { $in: inputFilter.pods };
    }
  }

  return {
    targetFilter,
    plantsFilter,
    plantsStatusFilter,
    plantsLocationsFilter,
  }
}