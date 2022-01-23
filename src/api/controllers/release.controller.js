const ReleaseService = require('../services/release.service');

function getRelease(req, res) {
  new ReleaseService(req, res).getReleaseResponse();
}

function getReleases(req, res) {
  new ReleaseService(req, res).getReleasesResponse();
}

function postRelease(req, res) {
  new ReleaseService(req, res).postReleaseResponse();
}

function deleteRelease(req, res) {
  new ReleaseService(req, res).deleteReleaseResponse();
}


module.exports = {
  getRelease,
  getReleases,
  postRelease,
  deleteRelease
};