const FlowService = require('../services/flow.service');

function getFlow(req, res) {
  new FlowService(req, res).getFlowResponse();
}

function getFlows(req, res) {
  new FlowService(req, res).getFlowsResponse();
}

function postFlows(req, res) {
  new FlowService(req, res).postFlowsResponse();
}

module.exports = {
  getFlow,
  getFlows,
  postFlows
};