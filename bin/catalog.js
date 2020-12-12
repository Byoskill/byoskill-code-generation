"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require('path');
var fs = require('fs');
var logger = require('./logger').logger;
var recursive = require('recursive-readdir');
/**
 * This class is a wrapper over the catalog resources.
 */
var Catalog = /** @class */ (function () {
    function Catalog(catalogPath) {
        this.catalogPath = catalogPath;
    }
    /**
     * Returns the catalog path if the path is a file.
     */
    Catalog.prototype.expectFile = function () {
        var stat = fs.statSync(this.catalogPath);
        if (stat.isDirectory) {
            throw new Error("The catalog path provided is a directory and not a file : " + this.catalogPath);
        }
        return this.catalogPath;
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
        if (stat.isDirectory) {
            // Scan recursively folders for resources
            return recursive(this.catalogPath);
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
            return JSON.parse(fs.readFileSync(resourcePath));
        }
        catch (e) {
            logger.error('Cannot read json resource', e);
            throw new Error("Cannot read json resource " + relativePath);
        }
    };
    return Catalog;
}());
exports.default = Catalog;
