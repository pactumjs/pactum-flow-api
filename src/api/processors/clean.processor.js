const config = require('../../config');
const AnalysisService = require('../services/analysis.service');

class CleanProcessor {

  constructor(repo, log) {
    this.$repo = repo;
    this.log = log;

    this.project_id = '';

    this.max_versions = parseInt(config.housekeeping.maxVersions);
    this.max_results = parseInt(config.housekeeping.maxResults);

    this.releases = [];
  }

  async run() {
    try {
      await this.setReleases();
      await this.removeVersions();
      await this.removeResults();
    } catch (error) {
      this.log.error(error);
    }
  }

  async setReleases() {
    this.releases = await this.$repo.release.get();
  }

  async removeVersions() {
    const analyses = await this.$repo.analysis.get({ projectId: this.project_id });
    let no_analyses_to_delete = analyses.length - this.max_versions;
    this.log.info(`No of versions to clean: ${no_analyses_to_delete} | Project: ${this.project_id}`);
    if (no_analyses_to_delete <= 0) {
      return;
    }
    const all_release_analyses = new Set(this.releases.map(_release => _release.analysisId.toString()));
    const sorted_analyses = analyses.sort((analysis_one, analysis_two) => {
      return new Date(analysis_one.createdAt) - new Date(analysis_two.createdAt)
    });
    const analysis_service = new AnalysisService();
    for (let i = 0; i < sorted_analyses.length; i++) {
      if (no_analyses_to_delete <= 0) {
        break;
      }
      const analysis = sorted_analyses[i];
      if (all_release_analyses.has(analysis._id.toString())) {
        continue;
      }
      this.log.info(`Cleaning version: ${analysis.version} | Project: ${this.project_id}`);
      await analysis_service.cleanAnalysis(analysis._id);
      no_analyses_to_delete--;
    }
  }

  async removeResults() {
    const release_project_versions = new Set(this.releases.map(_release => _release.projectId + '::' + _release.version));
    await this.removeConsumerResults(release_project_versions);
    await this.removeProviderResults(release_project_versions);
  }

  async removeConsumerResults(release_project_versions) {
    const consumer_results = await this.$repo.compatibility.get({ consumer: this.project_id });
    const sorted_consumer_results = consumer_results.sort((result_one, result_two) => {
      return new Date(result_one.verifiedAt) - new Date(result_two.verifiedAt)
    });
    const providers_set = new Set(sorted_consumer_results.map(_result => _result.provider));
    const providers = Array.from(providers_set);
    const ids = [];
    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      const consumer_provider_results = sorted_consumer_results.filter(_result => _result.provider === provider);
      let no_results_to_delete = consumer_provider_results.length - this.max_results;
      this.log.info(`No of results to clean: ${no_results_to_delete} | Consumer: ${this.project_id} | Provider: ${provider}`);
      if (no_results_to_delete <= 0) {
        continue;
      }
      for (let j = 0; j < consumer_provider_results.length; j++) {
        const result = consumer_provider_results[j];
        if (no_results_to_delete <= 0) {
          break;
        }
        if (release_project_versions.has(`${result.consumer}::${result.consumerVersion}`)) {
          continue;
        }
        if (release_project_versions.has(`${result.provider}::${result.providerVersion}`)) {
          continue;
        }
        this.log.info(`Cleaning results | Consumer: ${result.consumer} | Version: ${result.consumerVersion} | Provider: ${result.provider} | Version: ${result.providerVersion}`);
        ids.push(result._id);
        no_results_to_delete--;
      }
    }
    if (ids.length > 0) {
      await this.$repo.compatibility.delete({ _id: { $in: ids } });
    }
  }

  async removeProviderResults(release_project_versions) {
    const provider_results = await this.$repo.compatibility.get({ provider: this.project_id });
    const sorted_provider_results = provider_results.sort((result_one, result_two) => {
      return new Date(result_one.verifiedAt) - new Date(result_two.verifiedAt)
    });
    const consumers_set = new Set(sorted_provider_results.map(_result => _result.consumer));
    const consumers = Array.from(consumers_set);
    const ids = [];
    for (let i = 0; i < consumers.length; i++) {
      const consumer = consumers[i];
      const provider_consumer_results = sorted_provider_results.filter(_result => _result.provider === consumer);
      let no_results_to_delete = provider_consumer_results.length - this.max_results;
      this.log.info(`No of results to clean: ${no_results_to_delete} | Provider: ${this.project_id} | Consumer: ${consumer}`);
      if (no_results_to_delete <= 0) {
        continue;
      }
      for (let j = 0; j < provider_consumer_results.length; j++) {
        const result = provider_consumer_results[j];
        if (no_results_to_delete <= 0) {
          break;
        }
        if (release_project_versions.has(`${result.consumer}::${result.consumerVersion}`)) {
          continue;
        }
        if (release_project_versions.has(`${result.provider}::${result.providerVersion}`)) {
          continue;
        }
        this.log.info(`Cleaning results | Consumer: ${result.consumer} | Version: ${result.consumerVersion} | Provider: ${result.provider} | Version: ${result.providerVersion}`);
        ids.push(result._id);
        no_results_to_delete--;
      }
    }
    if (ids.length > 0) {
      await this.$repo.compatibility.delete({ _id: { $in: ids } });
    }
  }

}

module.exports = CleanProcessor;