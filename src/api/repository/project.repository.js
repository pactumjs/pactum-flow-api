const Project = require('../models/project.model');

class ProjectRepository {

  get(query) {
    return Project.find(query, null, { lean: true });
  }

  getById(_id) {
    return Project.findById({ _id }, null, { lean: true });
  }

  async save(data) {
    const project = new Project(data);
    const doc = await project.save();
    return doc;
  }

  delete(id) {
    return Project.deleteOne({ _id: id });
  }

}

module.exports = ProjectRepository;