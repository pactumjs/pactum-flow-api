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

}

module.exports = ContractRepository;