import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars'

import fse from 'fs-extra';


import {logger} from './logger';

import Args from './api/args';
import Template from './template-renderer'
import Catalog from './catalog'
import ProjectInformation from './api/project-information';
import { GenerationContext } from './api/generation-context';



const GLOBAL_JS = 'globals.js'




export default class CodeGeneration {

  private projectInformation: ProjectInformation;
  private catalog: Catalog;
  private projectAbsPath: string;
  private catalogPath: string;


  constructor(public argv: Args) {    
    this.projectAbsPath = path.resolve(argv.project);
    logger.info(`Project sources are ${this.projectAbsPath}`)

    this.projectInformation = {
      project: this.projectAbsPath,
      templates: path.join(this.projectAbsPath, 'templates'),
      partials:  path.join(this.projectAbsPath, 'partials'),
      helpers:   path.join(this.projectAbsPath, 'helpers'),
      assets:    path.join(this.projectAbsPath, 'assets'),
      script:    path.join(this.projectAbsPath, 'generation.js')
    }
    this.catalogPath = path.resolve(argv.catalog);

    this.catalog = new Catalog(this.catalogPath)
    const projectStat = fs.lstatSync(this.projectAbsPath)
    if (!fs.existsSync(this.catalogPath)) throw new Error('Catalog parameter should be an existing folder or file.')
    if (!fs.existsSync(this.projectAbsPath) || !projectStat.isDirectory()) throw new Error('Project parameter expects a folder')
  }

  readScript(scriptPath: string): string {
    return fs.readFileSync(scriptPath, 'utf8').toString()    
  }

  loadPartials(): void {
    const files: string[] = fs.readdirSync(this.projectInformation.partials)
    // listing all files using forEach
    files.forEach((fileName) => {
      // Do whatever you want to do with the file
      const absPath = path.join(this.projectInformation.partials, fileName)
      const partialName = path.parse(fileName).name
      logger.info(`Registering partial ${partialName} from ${absPath}`)
      const partialContent = this.readScript(absPath) + ''
      Handlebars.registerPartial(partialName, partialContent)
    })
  }

  loadHelpers(globalsObject: any, contextObject: GenerationContext): void {
    const files: string[] = fs.readdirSync(this.projectInformation.helpers)
    // listing all files using forEach
    files.forEach((fileName) => {
      // Do whatever you want to do with the file
      const absPath = path.join(this.projectInformation.helpers, fileName)
      const partialName = path.parse(fileName).name
      logger.info(`Registering helper ${partialName} from ${absPath}`)
      const partialContent = this.readScript(absPath) + ''
      const globals = globalsObject
      const context = contextObject
      logger.info("globals", {globalsObject});
      const helper = eval(partialContent)
      Handlebars.registerHelper(partialName, helper)
    })
  }

  loadGlobals(): any {
    logger.info('Read globals.')
    const partialContent = this.readScript(path.join(this.projectInformation.project, GLOBAL_JS)) + ''
    const globals = eval(partialContent)
    return globals
  }

  copyAssets(projectPath: string) : void {
    // To copy a folder or file
    logger.info(`Copying assets from ${this.projectInformation.assets} to ${projectPath}`)

    // Sync:
    try {
      fse.copySync(this.projectInformation.assets, projectPath)
      logger.info('Assets are copied')
    } catch (err) {
      logger.error('Cannot copy the assets')
      console.error(err)
      throw err
    }
  }

  requireResource(modulePath: string) : any {
    const modAbsPath = path.join(this.projectAbsPath, modulePath);
    logger.info(`Requiring resource with path ${modAbsPath}`);
    return require(modAbsPath);
  }

  generate(): void {
    logger.debug('Loading catalog from ', this.catalogPath)
    logger.debug('Generation project from ', this.projectAbsPath)
    logger.info('Project output path is  ', this.argv.output)

    logger.info('Compilation of the template')
    try {
      const globals = this.loadGlobals()();
      const context: GenerationContext = {
        // Imports
        path: path,
        fs: fs,
        Handlebars,
        log: logger,
        globals: globals,
        // Context of the execution
        catalog: this.catalog,
        generationInfo: this.projectInformation,
        script: this.readScript(this.projectInformation.script),
        output: this.argv.output,
        project: this.projectAbsPath,
        template: new Template(this.projectInformation, this.argv.output),
        requires: (modulePath: string) => this.requireResource(modulePath)
      }
      
      logger.info('Provided globals are', context.globals)
      this.loadPartials()
      this.loadHelpers(context.globals, context)

      logger.info('Copying assets')

      this.copyAssets(context.output)

      logger.info('Execution of the code generation script')
      const GenerationClass = eval(context.script)

      const generationClass = new GenerationClass(context)
      generationClass.generate()
    } catch (e) {
      logger.error(`Cannot generate the code ${e}`, {e})
      console.log(e)
    }
  }
}
