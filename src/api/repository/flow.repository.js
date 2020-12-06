const Flow = require('../models/flow.model');

class FlowRepository {

  get(query) {
    return Flow.find(query);
  }

  getById(_id) {
    return Flow.findById({_id});
  }

  async save(data) {
    const flow = new Flow(data);
    const doc = await flow.save();
    return doc;
  }

  delete(id) {
    return Flow.deleteOne({ _id: id });
  }

}

module.exports = FlowRepository;