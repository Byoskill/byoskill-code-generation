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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var handlebars_1 = __importDefault(require("handlebars"));
var logger_1 = require("./logger");
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var Template = /** @class */ (function () {
    function Template(project) {
        this.project = project;
    }
    Template.prototype.handlebars = function (templateName, payload) {
        logger_1.logger.debug("Generation using the template " + templateName);
        var templateFile = path.join(this.project.templates, templateName);
        if (!fs.existsSync(templateFile)) {
            throw new Error("Resource " + templateFile + " not found");
        }
        logger_1.logger.debug("Location of the " + templateFile);
        var template = fs.readFileSync(templateFile) + '';
        var hb = handlebars_1.default.compile(template);
        var renderedContent = hb(payload);
        if (payload.postRender) {
            logger_1.logger.warn('Post treatment is requested...');
            renderedContent = handlebars_1.default.compile(renderedContent)(payload);
        }
        if (payload && payload.debug) {
            logger_1.logger.info("Content : \n" + renderedContent);
        }
        return renderedContent;
    };
    return Template;
}());
exports.default = Template;
