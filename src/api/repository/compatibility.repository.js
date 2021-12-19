const Compatibility = require('../models/compatibility.model');

class CompatibilityRepository {

  save(contract) {
    const query = {
      consumer: contract.consumer,
      consumerVersion: contract.consumerVersion,
      provider: contract.provider,
      providerVersion: contract.providerVersion
    };
    return Compatibility.updateOne(query, { $set: contract }, { upsert: true, lean: true });
  }

  get(query) {
    return Compatibility.find(query, null, { lean: true });
  }

  delete(query) {
    return Compatibility.deleteMany(query);
  }

}

module.exports = CompatibilityRepository;