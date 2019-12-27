const {
  FilterHelper
} = require('../lib/tp/mongodb');
const {
  JsonObjectTypes,
  JsonObjectHelper
} = require('../lib/util/json-util');

const {
  WellKnownJsonRes
} = require('../middleware/json-response-util');


module.exports = (req, res, next) => {

  let phase = 'instantiate query obj';

  try {

    req._q = {};

    phase = 'decode filter';
    if (req.headers['x-martio-q-filter']) {
      req._q.filter = JsonObjectHelper.decode(req.headers['x-martio-q-filter']);
    } else {
      req._q.filter = {};
    }

    phase = 'decode autocomplete specific filters';
    if (req.headers['x-martio-q-filter-ac-simple']) {
      req._q.filterAcSimple = req.headers['x-martio-q-filter-ac-simple'];
    }
    if (req.headers['x-martio-q-filter-ac']) {
      const filterAC = JsonObjectHelper.decode(req.headers['x-martio-q-filter-ac']);
      phase = 'merge autocomplete specific filter (and)';
      for (const filterACItem of Object.entries(filterAC)) {
        Object.assign(req._q.filter, FilterHelper.buildAutocompleteFilter(filterACItem[0], filterACItem[1]));
      }
    }
    if (req.headers['x-martio-q-filter-ac-or']) {
      const filterAC = JsonObjectHelper.decode(req.headers['x-martio-q-filter-ac-or']);
      phase = 'merge autocomplete specific filter (or)';
      const orFilterACArray = [];
      for (const filterACItem of Object.entries(filterAC)) {
        orFilterACArray.push(FilterHelper.buildAutocompleteFilter(filterACItem[0], filterACItem[1]));
      }
      Object.assign(req._q.filter, {'$or': orFilterACArray});
    }

    phase = 'decode distinct specific filter';
    if (req.headers['x-martio-q-filter-distinct']) {
      req._q.distinct = JsonObjectHelper.decode(req.headers['x-martio-q-filter-distinct']);
    }

    phase = 'decode skip';
    if (req.headers['x-martio-q-skip']) {
      if (!JsonObjectTypes.isPositiveInteger(req.headers['x-martio-q-skip'])) {
        return WellKnownJsonRes.error(res, 401, ['invalid skip value, must be a positive integer number']);
      }
      req._q.skip = parseInt(req.headers['x-martio-q-skip']);
    } else {
      req._q.skip = 0;
    }

    phase = 'decode limit';
    if (req.headers['x-martio-q-limit']) {
      if (!JsonObjectTypes.isPositiveInteger(req.headers['x-martio-q-limit'])) {
        return WellKnownJsonRes.error(res, 401, ['invalid limit value, must be a positive integer number']);
      }
      req._q.limit = parseInt(req.headers['x-martio-q-limit']);
    } else {
      req._q.limit = 0;
    }

    phase = 'decode projection';
    if (req.headers['x-martio-q-proj']) {
      req._q.proj = JsonObjectHelper.decode(req.headers['x-martio-q-proj']);
    } else {
      req._q.proj = {};
    }

    phase = 'decode sort';
    if (req.headers['x-martio-q-sort']) {
      req._q.sort = JsonObjectHelper.decode(req.headers['x-martio-q-sort']);
    } else {
      req._q.sort = {};
    }

    next();

  } catch (e) {
    return WellKnownJsonRes.error(res, 400, ['[query parsing] error encountered at ' + phase + ' stage', e.toString()]);
  }

};
