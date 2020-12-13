import * as winston from "winston";

export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
//        winston.format.timestamp(),
        winston.format.colorize()
        //        winston.format.json(),
    ),
    defaultMeta: { service: 'byoskill-code-generator' },
    transports: [
        //
        // - Write all logs with level `error` and below to `error.log`
        // - Write all logs with level `info` and below to `combined.log`
        //        
        new winston.transports.File({ filename: 'codegeneration.log' }),
    ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  exports.logger.add(new winston.transports.Console({
    level: 'info',
    format: winston.format.combine(winston.format.splat(), winston.format.colorize(), winston.format.simple())
  }))
} else {
  exports.logger.add(new winston.transports.Console({
    level: 'info'
  }))
}
exports.logger.info('Logger is configured')
// # sourceMappingURL=logger.js.map