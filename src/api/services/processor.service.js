const BaseService = require('./base.service');
const AnalysisProcessor = require('../processors/analysis.processor');

class ProcessorService extends BaseService {

  constructor(req, res) {
    super(req, res);
  }

  async postProcessAnalysisResponse() {
    try {
      const id = this.req.body.id;
      const analysis = await this.$repo.analysis.getById(id);
      if (analysis) {
        if (!analysis.processed) {
          const processor = new AnalysisProcessor(analysis, this.$repo);
          processor.process();
          this.res.status(202).json({ id });
        } else {
          this.res.status(400).json({ message: 'Analysis already processed' });
        }
      } else {
        this.res.status(404).json({ message: 'Analysis Not Found' });
      }
    } catch (error) {
      this.handleError(error);
    }
  }

}

module.exports = ProcessorService;