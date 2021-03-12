"use strict";

class WellKnownJsonRes {

  static _genericDebug (res, status, debugJson = undefined) {
    new JsonResWriter(status)
      ._debug(debugJson)
      .applyTo(res);
  }

  static badRequest (res, debugJson = undefined) {
    WellKnownJsonRes._genericDebug(res, 400, debugJson);
  }

  static conflict (res, debugJson = undefined) {
    WellKnownJsonRes._genericDebug(res, 409, debugJson);
  }

  static count (res, total = 0) {
    new JsonResWriter(200)
      ._total(total)
      .applyTo(res);
  }

  static created (res, debugJson = undefined) {
    WellKnownJsonRes._genericDebug(res, 201, debugJson);
  }

  static error (res, status = 500, messages = undefined, debugJson = undefined) {
    // res.status(<status>).json({
    //   status: <status>,
    //   messages: <messages>
    //   _debug: <debugJson>
    // });
    new JsonResWriter(status)
      ._messages(messages)
      ._debug(debugJson)
      .applyTo(res);
  }

  static errorDebug (res, debugJson = undefined) {
    // res.status(500).json({
    //   status: 500,
    //   _debug: <debugJson>
    // });
    WellKnownJsonRes._genericDebug(res, 500, debugJson);
  }

  static notImplemented (res, message = undefined) {
    // res.status(501).json({
    //   status: 501,
    //   messages: [ <message> ]
    // });
    this.error(res, 501, message ? [message] : message);
  }

  static okNoContent (res) {
    new JsonResWriter(204)
      .applyTo(res);
  }

  static okEmpty (res) {
    WellKnownJsonRes.okMulti(res);
  }

  static okSingle (res, jsonItem, status = 200, debugJson = undefined, messages = undefined) {
    // res.status(<status>).json({
    //   status: <status>,
    //   total: 1,
    //   skip: 0,
    //   limit: 0,
    //   set: [ jsonItem ]
    // });
    new JsonResWriter(status)
      ._total(1)
      ._skip(0)
      ._limit(0)
      ._addToResultSet(jsonItem)
      ._debug(debugJson)
      ._messages(messages)
      .applyTo(res);
  }

  static okMulti (res, total = 0, jsonItems = [], skip = 0, limit = 0, status = 200) {
    // res.status(<status>).json({
    //   status: <status>,
    //   total: <total>,
    //   skip: <skip>,
    //   limit: <limit>,
    //   set: <jsonItems>
    // });
    new JsonResWriter(status)
      ._total(total)
      ._skip(skip)
      ._limit(limit)
      ._resultSet(jsonItems)
      .applyTo(res);
  }

  static okAutocomplete (res, jsonItems = [], hasNext = false, skip = 0, limit = 0, status = 200) {
    // res.status(<status>).json({
    //   status: <status>,
    //   next: <hasNext>,
    //   skip: <skip>,
    //   limit: <limit>,
    //   set: <jsonItems>
    // });
    new JsonResWriter(status)
      ._next(hasNext)
      ._skip(skip)
      ._limit(limit)
      ._resultSet(jsonItems)
      .applyTo(res);
  }

  static notFound (res, skip = 0, limit = 0) {
    // res.status(404).json({
    //   status: 404,
    //   total: 0,
    //   skip: <skip>,
    //   limit: <limit>,
    //   set: []
    // });
    new JsonResWriter(404)
      ._total(0)
      ._skip(skip)
      ._limit(limit)
      .applyTo(res);
  }

  static unauthorized (res, messages = ['Unauthorized'], debugJson = undefined) {
    // return res.status(401).json({
    //   status: 401,
    //   messages: <messages>,
    //   _debug: <debug>
    // });
    WellKnownJsonRes.error(res, 401, messages, debugJson);
  }

}

class JsonResWriter {
  constructor (status) {
    this.status = status;
  }

  _status (status) {
    this.status = status;
    return this;
  }
  _total (total) {
    this.total = total;
    return this;
  }
  _skip (skip) {
    this.skip = skip;
    return this;
  }
  _limit (limit) {
    this.limit = limit;
    return this;
  }
  _next (next) {
    this.next = next;
    return this;
  }
  _resultSet (set) {
    this.set = set
    return this;
  }
  _addToResultSet (item) {
    if (this.set === undefined) {
      this.set = [];
    }
    if (item !== undefined) {
      this.set.push(item);
    }
    return this;
  }
  _messages (messages) {
    this.messages = messages;
    return this;
  }
  _addMessage (message) {
    if (this.messages === undefined) {
      this.messages = [];
    }
    this.messages.push(message);
    return this;
  }
  _debug (_debug) {
    this._debug = _debug;
    return this;
  }
  _addToDebug (key, value) {
    if (this._debug === undefined) {
      this._debug = {};
    }
    this._debug[key] = value;
    return this;
  }
  _add (key, value) {
    return this._addAll({
      [key]: value
    });
  }
  _addAll (jsonPartial) {
    if (this.customFields === undefined) {
      this.customFields = {};
    }
    Object.assign(this.customFields, jsonPartial);
    return this;
  }

  applyTo (res) {
    if (!res) {
      return;
    }

    if (this.status == 204) {
      res.status(this.status).json();
      return;
    }

    const jsonBody = {};

    jsonBody.status = this.status;

    if (this.messages !== undefined) {
      jsonBody.messages = this.messages;
    }

    if (this.total !== undefined) {
      jsonBody.total = this.total;
    }

    if (this.skip !== undefined) {
      jsonBody.skip = this.skip;
    }

    if (this.limit !== undefined) {
      jsonBody.limit = this.limit;
    }

    if (this.next !== undefined) {
      jsonBody.next = this.next;
    }

    if (this.set !== undefined) {
      jsonBody.set = this.set;
    }

    if (this.customFields !== undefined) {
      Object.assign(jsonBody, this.customFields);
    }

    if (this._debug !== undefined) {
      jsonBody._debug = this._debug;
    }

    res.status(this.status).json(jsonBody);
  }
}


module.exports = {
  WellKnownJsonRes,
  JsonResWriter
};
