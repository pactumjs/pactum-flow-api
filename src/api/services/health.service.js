class HealthService {

  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

  getResponse() {
    this.res.status(200).json({ message: 'OK' });
  }

}

module.exports = HealthService;