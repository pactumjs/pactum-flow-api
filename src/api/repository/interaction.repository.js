const Interaction = require('../models/interaction.model');

class InteractionRepository {

  get(query) {
    return Interaction.find(query);
  }

  getById(_id) {
    return Interaction.findById({_id});
  }

  getByIds(ids) {
    return Interaction.find({ _id: { $in: ids } });
  }

  async save(data) {
    const interaction = new Interaction(data);
    const doc = await interaction.save();
    return doc;
  }

  delete(id) {
    return Interaction.deleteOne({ _id: id });
  }

}

module.exports = InteractionRepository;