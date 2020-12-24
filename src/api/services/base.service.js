class BaseService {

  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

  handleError(error) {
    console.log(error);
    this.res.status(500).json({ error: "Internal Server Error" });
  }

}

module.exports = BaseService;