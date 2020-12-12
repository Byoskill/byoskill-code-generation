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


  constructor(public argv: Args) {
    logger.info(`Project sources are ${argv.project}`)

    this.projectInformation = {
      project: argv.project,
      templates: path.join(argv.project, 'templates'),
      partials: path.join(argv.project, 'partials'),
      helpers: path.join(argv.project, 'helpers'),
      assets: path.join(argv.project, 'assets'),
      script: path.join(argv.project, 'generation.js')
    }
    this.catalog = new Catalog(argv.catalog)
    const catalogStat = fs.lstatSync(argv.catalog)
    if (!catalogStat.isDirectory) throw new Error('Catalog parameter expects a folder')
    const projectStat = fs.lstatSync(argv.project)
    if (!projectStat.isDirectory) throw new Error('Project parameter expects a folder')
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
      console.log(globalsObject)
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

  generate(): void {
    logger.debug('Loading catalog from ', this.argv.catalog)
    logger.debug('Generation project from ', this.argv.project)
    logger.info('Project output path is  ', this.argv.output)

    logger.info('Compilation of the template')
    try {
      const context: GenerationContext = {
        // Imports
        path: path,
        fs: fs,
        Handlebars,
        log: logger,
        globals: this.loadGlobals()(),
        // Context of the execution
        catalog: this.catalog,
        generationInfo: this.projectInformation,
        script: this.readScript(this.projectInformation.script),
        output: this.argv.output,
        project: this.argv.project,
        template: new Template(this.projectInformation),
        requires: (modulePath: string) => require(path.join(this.argv.project, modulePath))
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
      logger.error(`Cannot generate the code ${e}`)
      console.log(e)
    }
  }
}
