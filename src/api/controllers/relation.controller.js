const RelationService = require('../services/relation.service');

function getRelations(req, res) {
  new RelationService(req, res).getRelationsResponse();
}

module.exports = {
  getRelations
};