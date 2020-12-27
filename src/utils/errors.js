const { Error } = require("mongoose");

class ClientRequestError extends Error {
  constructor(msg, code) {
    super(msg);
    this.code = code || 400;
  }
}

module.exports = {
  ClientRequestError
};