const JobService = require('../services/job.service');

function getJobs(req, res) {
  new JobService(req, res).getJobs();
}

function getJobById(req, res) {
  new JobService(req, res).getJobById();
}

module.exports = {
  getJobs,
  getJobById
};