import pino from 'pino';
import config from '../config/index.js';

const logger = pino({
  level: config.logLevel,
  transport: {
    target: 'pino-pretty',
  },
});

export default logger;
