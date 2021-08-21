const BaseService = require('./base.service');

class JobService extends BaseService {

  constructor(req, res) {
    super(req, res);
  }

  async getJobs() {
    try {
      const jobs = await this.$repo.job.getJobs();
      this.res.status(200).json(jobs);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getJobById() {
    try {
      const id = this.req.swagger.params.id.value;
      const job = await this.$repo.job.getJobById(id);
      this.res.status(200).json(job);
    } catch (error) {
      this.handleError(error);
    }
  }

}

module.exports = JobService;