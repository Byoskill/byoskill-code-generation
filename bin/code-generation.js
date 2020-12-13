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
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var handlebars_1 = __importDefault(require("handlebars"));
var fs_extra_1 = __importDefault(require("fs-extra"));
var logger_1 = require("./logger");
var template_renderer_1 = __importDefault(require("./template-renderer"));
var catalog_1 = __importDefault(require("./catalog"));
var GLOBAL_JS = 'globals.js';
var CodeGeneration = /** @class */ (function () {
    function CodeGeneration(argv) {
        this.argv = argv;
        logger_1.logger.info("Project sources are " + argv.project);
        this.projectInformation = {
            project: argv.project,
            templates: path.join(argv.project, 'templates'),
            partials: path.join(argv.project, 'partials'),
            helpers: path.join(argv.project, 'helpers'),
            assets: path.join(argv.project, 'assets'),
            script: path.join(argv.project, 'generation.js')
        };
        this.catalog = new catalog_1.default(argv.catalog);
        var catalogStat = fs.lstatSync(argv.catalog);
        if (!catalogStat.isDirectory)
            throw new Error('Catalog parameter expects a folder');
        var projectStat = fs.lstatSync(argv.project);
        if (!projectStat.isDirectory)
            throw new Error('Project parameter expects a folder');
    }
    CodeGeneration.prototype.readScript = function (scriptPath) {
        return fs.readFileSync(scriptPath, 'utf8').toString();
    };
    CodeGeneration.prototype.loadPartials = function () {
        var _this = this;
        var files = fs.readdirSync(this.projectInformation.partials);
        // listing all files using forEach
        files.forEach(function (fileName) {
            // Do whatever you want to do with the file
            var absPath = path.join(_this.projectInformation.partials, fileName);
            var partialName = path.parse(fileName).name;
            logger_1.logger.info("Registering partial " + partialName + " from " + absPath);
            var partialContent = _this.readScript(absPath) + '';
            handlebars_1.default.registerPartial(partialName, partialContent);
        });
    };
    CodeGeneration.prototype.loadHelpers = function (globalsObject, contextObject) {
        var _this = this;
        var files = fs.readdirSync(this.projectInformation.helpers);
        // listing all files using forEach
        files.forEach(function (fileName) {
            // Do whatever you want to do with the file
            var absPath = path.join(_this.projectInformation.helpers, fileName);
            var partialName = path.parse(fileName).name;
            logger_1.logger.info("Registering helper " + partialName + " from " + absPath);
            var partialContent = _this.readScript(absPath) + '';
            var globals = globalsObject;
            var context = contextObject;
            console.log(globalsObject);
            var helper = eval(partialContent);
            handlebars_1.default.registerHelper(partialName, helper);
        });
    };
    CodeGeneration.prototype.loadGlobals = function () {
        logger_1.logger.info('Read globals.');
        var partialContent = this.readScript(path.join(this.projectInformation.project, GLOBAL_JS)) + '';
        var globals = eval(partialContent);
        return globals;
    };
    CodeGeneration.prototype.copyAssets = function (projectPath) {
        // To copy a folder or file
        logger_1.logger.info("Copying assets from " + this.projectInformation.assets + " to " + projectPath);
        // Sync:
        try {
            fs_extra_1.default.copySync(this.projectInformation.assets, projectPath);
            logger_1.logger.info('Assets are copied');
        }
        catch (err) {
            logger_1.logger.error('Cannot copy the assets');
            console.error(err);
            throw err;
        }
    };
    CodeGeneration.prototype.requireResource = function (modulePath) {
        var modAbsPath = path.join(this.argv.project, modulePath);
        logger_1.logger.info("Requiring resource with path " + modAbsPath);
        return require(modAbsPath);
    };
    CodeGeneration.prototype.generate = function () {
        var _this = this;
        logger_1.logger.debug('Loading catalog from ', this.argv.catalog);
        logger_1.logger.debug('Generation project from ', this.argv.project);
        logger_1.logger.info('Project output path is  ', this.argv.output);
        logger_1.logger.info('Compilation of the template');
        try {
            var context = {
                // Imports
                path: path,
                fs: fs,
                Handlebars: handlebars_1.default,
                log: logger_1.logger,
                globals: this.loadGlobals()(),
                // Context of the execution
                catalog: this.catalog,
                generationInfo: this.projectInformation,
                script: this.readScript(this.projectInformation.script),
                output: this.argv.output,
                project: this.argv.project,
                template: new template_renderer_1.default(this.projectInformation),
                requires: function (modulePath) { return _this.requireResource(modulePath); }
            };
            logger_1.logger.info('Provided globals are', context.globals);
            this.loadPartials();
            this.loadHelpers(context.globals, context);
            logger_1.logger.info('Copying assets');
            this.copyAssets(context.output);
            logger_1.logger.info('Execution of the code generation script');
            var GenerationClass = eval(context.script);
            var generationClass = new GenerationClass(context);
            generationClass.generate();
        }
        catch (e) {
            logger_1.logger.error("Cannot generate the code " + e);
            console.log(e);
        }
    };
    return CodeGeneration;
}());
exports.default = CodeGeneration;
