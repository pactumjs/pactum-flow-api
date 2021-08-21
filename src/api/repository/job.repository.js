const Job = require('../models/job.model');

class JobRepository {

  getJobs() {
    return Job.find(null, null, { lean: true });
  }

  getJobById(_id) {
    return Job.findById({ _id }, null, { lean: true });
  }

  updateJob(data) {
    return Job.updateOne({ _id: data._id }, data, { upsert: true, lean: true });
  }

  deleteJobById(_id) {
    return Job.deleteOne({ _id }, { lean: true });
  }

  deleteJobsByProjectId(projectId) {
    return Job.deleteMany({ projectId }, { lean: true });
  }

}

module.exports = JobRepository;