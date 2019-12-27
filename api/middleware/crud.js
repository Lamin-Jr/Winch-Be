"use strict";

const {
  FilterHelper
} = require('../lib/tp/mongodb');
const {
  JsonObjectHelper
} = require('../lib/util/json-util');
const {
  WellKnownJsonRes
} = require('../middleware/json-response-util');

class BasicRead {

  // cRud
  static all(req, res, next, model, filter = {}, skip = 0, limit = 0, projection = {}, sort = {}) {
    model
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .select(projection)
      .exec()
      .then(readResult => {
        if (readResult) {
          if (limit > 0 && (readResult.length == limit || skip > 0)) {
            // when limit is specified, total items count can differ from size of result
            // in these cases a count query is necessary to get the correct value
            model.countDocuments(filter).exec()
              .then(countResult => {
                WellKnownJsonRes.okMulti(res, countResult, readResult, skip, limit);
              })
              .catch(countError => {
                WellKnownJsonRes.errorDebug(res, countError);
              });

            // exit because response has been fulfilled at this stage
            return;
          }
          WellKnownJsonRes.okMulti(res, readResult.length, readResult, skip, limit);
        } else {
          WellKnownJsonRes.notFound(res);
        }
      })
      .catch(readError => {
        WellKnownJsonRes.errorDebug(res, readError);
      });
  }

  // cRud/autocomplete
  static autocomplete(req, res, next, model, textFieldName, textSearch, filter = {}, skip = 0, limit = 10, projection = {}, sort = {}, maxResults = 10) {
    if (textSearch) {
      Object.assign(filter, FilterHelper.buildAutocompleteFilter(textFieldName, textSearch))
    }

    if (limit === 0 || limit > maxResults) {
      limit = maxResults;
    }
    // take one more to check if there is next
    const limitToCheckNext = limit + 1;

    model
      .find(filter)
      .skip(skip)
      .limit(limitToCheckNext)
      .select(projection)
      .sort(sort)
      .exec()
      .then(readResult => {
        if (readResult) {
          const hasNext = readResult.length === limitToCheckNext && readResult.pop() !== undefined;
          WellKnownJsonRes.okAutocomplete(res, readResult, hasNext, skip, limit);
        } else {
          WellKnownJsonRes.okAutocomplete(res);
        }
      })
      .catch(readError => {
        WellKnownJsonRes.errorDebug(res, readError);
      });
  }

  // cRud/aggregate
  static aggregate(req, res, next, model, aggregation, skip = 0, limit = 0) {
    this.aggregateExt(req, res, next, model, aggregation, undefined, skip, limit);
  }

  // cRud/aggregate
  static aggregateExt(req, res, next, model, aggregation, aggregationCount = undefined, skip = 0, limit = 0) {
    if (!aggregation) {
      // this is a bug
      WellKnownJsonRes.error(res);
    } else if (!aggregationCount) {
      aggregationCount = model.aggregate(aggregation.pipeline()).count('count');
    }

    aggregationCount
    .exec()
    .then(readCountResult => {
      if (readCountResult.length === 0 || readCountResult[0].count === 0) {
        WellKnownJsonRes.okMulti(res, 0, [], skip, limit);
        return;
      }

      if (skip > 0) {
        aggregation = aggregation.skip(skip)
      }
      if (limit > 0) {
        aggregation = aggregation.limit(limit)
      }

      aggregation.exec()
        .then(readResult => {
          WellKnownJsonRes.okMulti(res, readCountResult[0].count, readResult, skip, limit);
        })
        .catch(readError => {
          WellKnownJsonRes.errorDebug(res, readError);
        })
    })
    .catch(readCountError => {
      WellKnownJsonRes.errorDebug(res, readCountError);
    });
  }

  // cRud/byId
  static byId(req, res, next, model, id, projection = {}) {
    model.findById(id).select(projection).exec()
      .then(readResult => {
        if (readResult) {
          WellKnownJsonRes.okSingle(res, readResult);
        } else {
          WellKnownJsonRes.notFound(res);
        }
      })
      .catch(readError => {
        WellKnownJsonRes.errorDebug(res, readError);
      });
  }

  // cRud/byKeyFields
  static byKeyFields(req, res, next, model, filter = {}) {
    model.findOne(filter).exec()
      .then(readResult => {
        if (readResult) {
          WellKnownJsonRes.okSingle(res, readResult);
        } else {
          WellKnownJsonRes.notFound(res);
        }
      })
      .catch(readError => {
        WellKnownJsonRes.errorDebug(res, readError);
      });
  }

  // cRud/count
  static count(req, res, next, model, filter = {}) {
    model.countDocuments(filter).exec()
      .then(countResult => {
        WellKnownJsonRes.count(res, countResult);
      })
      .catch(countError => {
        WellKnownJsonRes.errorDebug(res, countError);
      });
  }

}

class BasicWrite {

  // Crud
  static create(req, res, next, model, conflictOnDuplicatedKeyError = true) {
    model.save()
      .then(createResult => {
        WellKnownJsonRes.created(res, createResult)
      })
      .catch(createError => {
        if (conflictOnDuplicatedKeyError && createError.name === 'MongoError' && createError.code === 11000) {
          WellKnownJsonRes.conflict(res, createError)
        } else {
          WellKnownJsonRes.errorDebug(res, createError);
        }
      });
  }

  // crUd
  static update(req, res, next, schema, updateFilter, updateBody) {
    if (!updateFilter) {
      WellKnownJsonRes.error(res);
    }
    const updateStatement = {
      $set: JsonObjectHelper.buildFlattenJson(updateBody)
    };

    schema.updateMany(updateFilter, updateStatement).exec()
      .then(updateResult => {
        WellKnownJsonRes.okSingle(res, updateFilter, 200, updateResult);
      })
      .catch(updateError => {
        WellKnownJsonRes.errorDebug(res, updateError);
      });
  }

  // crUd
  static updateRaw(req, res, next, model, updateFilter, updateStatement) {
    if (!updateFilter) {
      WellKnownJsonRes.error(res);
    }

    model.schema.updateMany(updateFilter, updateStatement).exec()
      .then(updateResult => {
        WellKnownJsonRes.okSingle(res, updateFilter, 200, updateResult);
      })
      .catch(updateError => {
        WellKnownJsonRes.errorDebug(res, updateError);
      });
  }

  // crUd/byId
  static updateByIdInMemory(req, res, next, schema, updateBody) {
    const id = updateBody._id;
    schema.findById(id).exec()
      .then(readResult => {
        Object.assign(readResult, updateBody);
        readResult.save()
        .then(updateResult => {
          WellKnownJsonRes.okSingle(res, { _id: id }, 200, updateResult);
        })
        .catch(updateError => {
          WellKnownJsonRes.errorDebug(res, updateError);
        });          
      })
      .catch(readError => {
        WellKnownJsonRes.notFound(res)
      });
  }

  // crUd/byId
  static updateByIdAtomic(req, res, next, schema, updateBody, options = { useFindAndModify: false }) {
    const id = updateBody._id;
    schema.findByIdAndUpdate(id, updateBody, options).exec()
      .then(updateResult => {
        WellKnownJsonRes.okSingle(res, { _id: id }, 200, updateResult);
      })
      .catch(updateError => {
        WellKnownJsonRes.errorDebug(res, updateError);
      });
  }

  // cruD
  static delete (res = {}, model, filter = {}) {
    model.remove(filter).exec()
      .then(deleteResult => {
        WellKnownJsonRes._genericDebug(res, 200, deleteResult)
      })
      .catch(deleteError => {
        WellKnownJsonRes.errorDebug(res, deleteError)
      })
  }

  // cruD/byId
  static deleteById (res = {}, model, id) {
    delete (res, model, {
      _id: id
    })
  }

}


module.exports = {
  BasicRead,
  BasicWrite
};
