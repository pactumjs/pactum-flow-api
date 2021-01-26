const Contract = require('../models/contract.model');

class ContractRepository {

  save(contract) {
    const query = {
      consumer: contract.consumer,
      consumerVersion: contract.consumerVersion,
      provider: contract.provider,
      providerVersion: contract.providerVersion
    };
    return Contract.updateOne(query, { $set: contract }, { upsert: true });
  }

  get(query) {
    return Contract.find(query, null, { lean: true });
  }

}

module.exports = ContractRepository;