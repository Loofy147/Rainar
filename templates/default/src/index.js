import config from '../config/index.js';
import logger from './logger.js';

logger.info(`Starting application in ${config.env} mode.`);
logger.info(`Listening on port ${config.port}.`);
