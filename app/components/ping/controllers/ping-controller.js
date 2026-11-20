const PingService = require('../services/ping-service');

class PingController {
  constructor () {
    this.pingService = new PingService();
  }

  get (req, res, next) {
    const { logger } = req.locals;
    try {
      const result = this.pingService.get({ logger });
      result.message = req.user?.id ? `pong hi, ${req.user.id}` : 'pong';
      return res.status(200).send(result);
    } catch (err) {
      return next(err);
    }
  }

  pingSecured (req, res, next) {
    try {
      return res.status(200).send(this.pingService.get({ logger: req.locals.logger }));
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new PingController();
