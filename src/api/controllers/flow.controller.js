const FlowService = require('../services/flow.service');

function getFlow(req, res) {
  new FlowService(req, res).getFlowResponse();
}

function getFlows(req, res) {
  new FlowService(req, res).getFlowsResponse();
}

function postFlow(req, res) {
  new FlowService(req, res).postFlowResponse();
}

function postFlowsSearch(req, res) {
  new FlowService(req, res).postFlowsSearchResponse();
}

function deleteFlow(req, res) {
  new FlowService(req, res).deleteFlowResponse();
}

module.exports = {
  getFlow,
  getFlows,
  postFlow,
  postFlowsSearch,
  deleteFlow
};