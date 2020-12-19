const InteractionService = require('../services/interaction.service');

function getInteractions(req, res) {
  new InteractionService(req, res).getInteractionsResponse();
}

function postInteractions(req, res) {
  new InteractionService(req, res).postInteractionsResponse();
}

function getInteractionById(req, res) {
  new InteractionService(req, res).getInteractionByIdResponse();
}

module.exports = {
  getInteractions,
  postInteractions,
  getInteractionById
};