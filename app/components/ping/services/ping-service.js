class PingService {
  get ({ logger }) {
    logger.debug('[PING_SERVICE] :: get');
    return {};
  }
}

module.exports = PingService;
