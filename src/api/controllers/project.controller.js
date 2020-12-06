const ProjectService = require('../services/project.service');

function getProject(req, res) {
  new ProjectService(req, res).getProjectResponse();
}

function getProjects(req, res) {
  new ProjectService(req, res).getProjectsResponse();
}

function postProject(req, res) {
  new ProjectService(req, res).postProjectResponse();
}

function deleteProject(req, res) {
  new ProjectService(req, res).deleteProjectResponse();
}

module.exports = {
  getProject,
  getProjects,
  postProject,
  deleteProject
};