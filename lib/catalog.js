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
      return JSON.parse(fs.readFileSync(relativePath))
    } catch (e) {
      logger.error('Cannot read json resource', e)
      throw new Error(`Cannot read json resource ${relativePath}`)
    }
  }
}

module.exports = Catalog
