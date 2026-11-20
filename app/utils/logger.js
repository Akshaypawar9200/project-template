const winston = require('winston');
const { name } = require('../../package.json');

function initLogger (logLevel) {
  if (!logLevel) throw new Error('logLevel value is Empty');
  return winston.createLogger({
    exitOnError: false,
    level: logLevel,
    format: winston.format.combine(
      winston.format.label({ label: name }),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.printf((info) => {
        let line = `${info.level.toUpperCase()} - ${info.timestamp} - `;
        if (info.userId) line += `U_${info.userId} - `;
        if (info.sessionId) line += `S_${info.sessionId} - `;
        if (info.requestId) line += `R_${info.requestId} - `;
        return line + info.message;
      })
    ),
    transports: [new winston.transports.Console()],
  });
}

module.exports = { initLogger };
