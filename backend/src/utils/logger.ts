import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize({ all: false }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console()
  ],
});

export default {
  info: (message: string) => logger.info(message),

  warn: (message: string) => logger.warn(message),

  debug: (message: string) => logger.debug(message),

  error: (message: string, error?: any) => {
    if (error) {
      logger.error(`${message} - ${error.message || error}`);
      if (error.stack) {
        logger.error(error.stack);
      }
    } else {
      logger.error(message);
    }
  }
};
