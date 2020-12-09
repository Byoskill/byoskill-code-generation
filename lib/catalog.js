const path = require('path')
const fs = require('fs')
const { logger } = require('./logger')

/**
 * This class is a wrapper over the catalog resources.
 */
class Catalog {
  constructor (catalogPath) {
    this.catalogPath = catalogPath
  }

  /**
   * Computes a catalog absolute path from a relative path argument.
   * @param {*} relativePath
   */
  getResourcePath (relativePath) {
    return path.join(this.catalogPath, relativePath)
  }

  /**
   * Reads a JSON resource.
   * @param {*} relativePath
   */
  json (relativePath) {
    try {
      const resourcePath = this.getResourcePath(relativePath)
      if (!fs.existsSync(resourcePath)) {
        throw new Error(`JSON ${resourcePath} not found`)
      }
      return JSON.parse(fs.readFileSync(resourcePath))
    } catch (e) {
      logger.error('Cannot read json resource', e)
      throw new Error(`Cannot read json resource ${relativePath}`)
    }
  }
}

module.exports = Catalog
