"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
var winston = __importStar(require("winston"));
exports.logger = winston.createLogger({
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
    }));
}
else {
    exports.logger.add(new winston.transports.Console({
        level: 'info'
    }));
}
exports.logger.info('Logger is configured');
// # sourceMappingURL=logger.js.map
