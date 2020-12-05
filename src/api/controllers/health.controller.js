function getHealth(req, res) {
  res.status(200).json({ message: 'OK' });
}

module.exports = {
  getHealth
};