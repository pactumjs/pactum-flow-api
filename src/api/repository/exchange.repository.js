const { RequestSchema, ResponseSchema } = require('../models/exchange.model');

function stringify(data, ignore) {
  if (data && typeof data === 'object') {
    if (Object.keys(data).length > 0) {
      return JSON.stringify(data);
    } else {
      if (ignore) return JSON.stringify(data);
      return;
    }
  }
  return data;
}

function parse(data) {
  if (data) {
    try {
      return JSON.parse(data);
    } catch (error) {
      return data;
    }
  }
}

function sanitize(data) {
  const qp = stringify(data.queryParams);
  if (qp) {
    data.queryParams = qp;
  } else {
    delete data.queryParams;
  }
  const pp = stringify(data.pathParams);
  if (pp) {
    data.pathParams = pp;
  } else {
    delete data.pathParams;
  }
  const hr = stringify(data.headers);
  if (hr) {
    data.headers = hr;
  } else {
    delete data.headers;
  }
  const body = stringify(data.body, true);
  if (body) {
    data.body = body;
  } else {
    delete data.body;
  }
  const mr = stringify(data.matchingRules);
  if (mr) {
    data.matchingRules = mr;
  } else {
    delete data.matchingRules;
  }
  return data;
}

function unSanitize(data) {
  if (data.queryParams) {
    data.queryParams = parse(data.queryParams);
  }
  if (data.pathParams) {
    data.pathParams = parse(data.pathParams);
  }
  if (data.headers) {
    data.headers = parse(data.headers);
  }
  if (data.body) {
    data.body = parse(data.body);
  }
  if (data.matchingRules) {
    data.matchingRules = parse(data.matchingRules);
  }
  return data;
}

class ExchangeRepository {

  async getRequestById(_id) {
    const doc = await RequestSchema.findById({ _id });
    if (doc) {
      return unSanitize(doc.toObject());
    } else {
      return doc;
    }
  }

  async getResponseById(_id) {
    const doc = await ResponseSchema.findById({ _id });
    if (doc) {
      return unSanitize(doc.toObject());
    } else {
      return doc;
    }
  }

  async saveRequest(data) {
    data = sanitize(data);
    const request = new RequestSchema(data);
    const doc = await request.save();
    return doc;
  }

  async saveResponse(data) {
    data = sanitize(data);
    const response = new ResponseSchema(data);
    const doc = await response.save();
    return doc;
  }

  deleteRequestByProjectId(id) {
    return RequestSchema.deleteMany({ projectId: id });
  }

  deleteResponseByProjectId(id) {
    return ResponseSchema.deleteMany({ projectId: id });
  }

  deleteRequestByAnalysisId(id) {
    return RequestSchema.deleteMany({ analysisId: id });
  }

  deleteResponseByAnalysisId(id) {
    return ResponseSchema.deleteMany({ analysisId: id });
  }

}

module.exports = ExchangeRepository;