const Project = require('../models/project.model');

class ProjectRepository {

  get(query) {
    return Project.find(query);
  }

  getById(_id) {
    return Project.findById({ _id });
  }

  async save(data) {
    const project = new Project(data);
    const doc = await project.save();
    return doc;
  }

  delete(id) {
    return Project.deleteOne({ _id: id });
  }

  addAnalysis(_id, analysis) {
    const { branch, _id: aId } = analysis;
    if (!branch || branch === 'main' || branch === 'master') {
      return Project.updateOne({ _id }, { $push: { "analysis.main": aId } });
    } else {
      return Project.updateOne({ _id }, { $push: { "analysis.branch": aId } });
    }
  }

  deleteAnalysis(_id, analysis) {
    const { branch, _id: aId } = analysis;
    if (!branch || branch === 'main' || branch === 'master') {
      return Project.updateOne({ _id }, { $pull: { "analysis.main": aId } });
    } else {
      return Project.updateOne({ _id }, { $pull: { "analysis.branch": aId } });
    }
  }

}

module.exports = ProjectRepository;