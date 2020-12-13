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
var path = __importStar(require("path"));
var fs = __importStar(require("fs"));
var recursive_readdir_1 = __importDefault(require("recursive-readdir"));
var logger_1 = require("./logger");
/**
 * This class is a wrapper over the catalog resources.
 */
var Catalog = /** @class */ (function () {
    function Catalog(catalogPath) {
        this.catalogPath = catalogPath;
        if (!fs.existsSync(this.catalogPath)) {
            throw new Error("The path does not exist " + this.catalogPath);
        }
    }
    /**
     * Returns the catalog path if the path is a file.
     */
    Catalog.prototype.expectFile = function () {
        var stat = fs.statSync(this.catalogPath);
        if (stat.isDirectory()) {
            throw new Error("The catalog path provided is a directory and not a file : " + this.catalogPath);
        }
        return this.catalogPath;
    };
    Catalog.prototype.expectJsonObjectFile = function () {
        logger_1.logger.info("Loading the whole catalog as a JSON file " + this.catalogPath);
        var stat = fs.statSync(this.catalogPath);
        if (stat.isDirectory()) {
            throw new Error("The catalog path provided is a directory and not a file : " + this.catalogPath);
        }
        return JSON.parse(fs.readFileSync(this.catalogPath).toString());
    };
    /**
     * Computes a catalog absolute path from a relative path argument.
     * @param {*} relativePath
     */
    Catalog.prototype.getResourcePath = function (relativePath) {
        return path.join(this.catalogPath, relativePath);
    };
    /**
     * Scan for all resources in the catalog folder.
     * @return A promise is returned with the list of files.
     */
    Catalog.prototype.getResources = function () {
        var stat = fs.statSync(this.catalogPath);
        if (stat.isDirectory()) {
            // Scan recursively folders for resources
            return recursive_readdir_1.default(this.catalogPath);
        }
        // Returns the file.
        return Promise.resolve([this.catalogPath]);
    };
    /**
     * Reads a JSON resource.
     * @param {*} relativePath
     */
    Catalog.prototype.json = function (relativePath) {
        try {
            var resourcePath = this.getResourcePath(relativePath);
            if (!fs.existsSync(resourcePath)) {
                throw new Error("JSON " + resourcePath + " not found");
            }
            var buffer = fs.readFileSync(resourcePath);
            return JSON.parse(buffer.toString());
        }
        catch (e) {
            logger_1.logger.error('Cannot read json resource', e);
            throw new Error("Cannot read json resource " + relativePath);
        }
    };
    return Catalog;
}());
exports.default = Catalog;
