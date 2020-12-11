'use strict'

const Handlebars = require('handlebars')
const log = require('./logger').logger
const fs = require('fs')
const path = require('path')
const fse = require('fs-extra')
const Template = require('./template-renderer')
const JSONL = require('json-literal')
const Catalog = require('./catalog')

const GLOBAL_JS = 'globals.js'
class CodeGeneration {
  constructor (argv) {
    log.info(`Project sources are ${argv.project}`)

    this.argv = argv
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

  readScript (scriptPath) {
    return fs.readFileSync(scriptPath, 'utf8')
  }

  loadPartials () {
    const files = fs.readdirSync(this.projectInformation.partials)
    // listing all files using forEach
    files.forEach((fileName) => {
      // Do whatever you want to do with the file
      const absPath = path.join(this.projectInformation.partials, fileName)
      const partialName = path.parse(fileName).name
      log.info(`Registering partial ${partialName} from ${absPath}`)
      const partialContent = this.readScript(absPath) + ''
      Handlebars.registerPartial(partialName, partialContent)
    })
  }

  loadHelpers (globalsObject, contextObject) {
    const files = fs.readdirSync(this.projectInformation.helpers)
    // listing all files using forEach
    files.forEach((fileName) => {
      // Do whatever you want to do with the file
      const absPath = path.join(this.projectInformation.helpers, fileName)
      const partialName = path.parse(fileName).name
      log.info(`Registering helper ${partialName} from ${absPath}`)
      const partialContent = this.readScript(absPath) + ''
      const globals = globalsObject
      const context = contextObject
      console.log(globalsObject)
      const helper = eval(partialContent)
      Handlebars.registerHelper(partialName, helper)
    })
  }

  loadGlobals () {
    log.info('Read globals.')
    const partialContent = this.readScript(path.join(this.projectInformation.project, GLOBAL_JS)) + ''
    const globals = eval(partialContent)
    return globals
  }

  copyAssets (projectPath) {
    // To copy a folder or file
    log.info(`Copying assets from ${this.projectInformation.assets} to ${projectPath}`)

    // Sync:
    try {
      fse.copySync(this.projectInformation.assets, projectPath)
      log.info('Assets are copied')
    } catch (err) {
      log.error('Cannot copy the assets')
      console.error(err)
      throw err
    }
  }

  generate () {
    log.debug('Loading catalog from ', this.argv.catalog)
    log.debug('Generation project from ', this.argv.project)
    log.info('Project output path is  ', this.argv.output)

    log.info('Compilation of the template')
    try {
      const context = {
        // Imports
        path: path,
        fs: fs,
        Handlebars,
        log,
        globals: this.loadGlobals()(),
        // Context of the execution
        catalog: this.catalog,
        generationInfo: this.projectInformation,
        script: this.readScript(this.projectInformation.script),
        output: this.argv.output,
        project: this.argv.project,
        JSONL,
        template: new Template(this.projectInformation),
        requires: (modulePath) => require(path.join(this.argv.project, modulePath))
      }

      log.info('Provided globals are', context.globals)
      this.loadPartials()
      this.loadHelpers(context.globals, context)

      log.info('Copying assets')

      this.copyAssets(context.output)

      log.info('Execution of the code generation script')
      const GenerationClass = eval(context.script)

      const generationClass = new GenerationClass(context)
      generationClass.generate()
    } catch (e) {
      log.error(`Cannot generate the code ${e}`)
      console.log(e)
    }
  }
}

module.exports = CodeGeneration
