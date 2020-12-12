import * as path from 'path';
import * as fs from 'fs';
import recursive from 'recursive-readdir';
import { logger } from './logger';

/**
 * This class is a wrapper over the catalog resources.
 */
export default class Catalog {
  constructor(public catalogPath: string) {

  }

  /**
   * Returns the catalog path if the path is a file.
   */
  expectFile(): string {
    const stat = fs.statSync(this.catalogPath)
    if (stat.isDirectory()) {
      throw new Error(`The catalog path provided is a directory and not a file : ${this.catalogPath}`)
    }
    return this.catalogPath
  }

  /**
   * Computes a catalog absolute path from a relative path argument.
   * @param {*} relativePath
   */
  getResourcePath(relativePath: string): string {
    return path.join(this.catalogPath, relativePath)
  }

  /**
   * Scan for all resources in the catalog folder.
   * @return A promise is returned with the list of files.
   */
  getResources(): Promise<string[]> {
    const stat = fs.statSync(this.catalogPath)
    if (stat.isDirectory()) {
      // Scan recursively folders for resources
      return recursive(this.catalogPath)
    }
    // Returns the file.
    return Promise.resolve([this.catalogPath])
  }

  /**
   * Reads a JSON resource.
   * @param {*} relativePath
   */
  json(relativePath: string): any {
    try {
      const resourcePath = this.getResourcePath(relativePath)
      if (!fs.existsSync(resourcePath)) {
        throw new Error(`JSON ${resourcePath} not found`)
      }
      const buffer = fs.readFileSync(resourcePath);
      return JSON.parse(buffer.toString())
    } catch (e) {
      logger.error('Cannot read json resource', e)
      throw new Error(`Cannot read json resource ${relativePath}`)
    }
  }
}
