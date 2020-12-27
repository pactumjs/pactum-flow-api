const { ClientRequestError } = require('../../utils/errors');

class BaseService {

  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

  handleError(error) {
    if (error instanceof ClientRequestError) {
      this.res.status(error.code).json({ error: error.message });
    } else {
      console.log(error);
      this.res.status(500).json({ error: "Internal Server Error" });
    }
  }

}

module.exports = BaseService;