/**
 * Several variables are provided for the execution of the generation.
 *
 * log: a logger to print your messages
 * template: a component to load and execute a template with a payload
 *  example: template.nunjucks("templateName", payload") : string
 *  example: template.handlebars("templateName", payload") : string
 * catalog: returns the catalog of objects to be manipulated for the generation.
 * fs: file operations
 *  fs.write("path", content)
 * path: path operations
 * globals : contains a list of global variables declared at the begin of the execution and available in both templates, helpers and partials
 * output: the output folder
 * generationInfo: contains various folder locations
	templates: path.join(argv.generation, 'templates'),
	partials: path.join(argv.generation, 'partials'),
	helpers: path.join(argv.generation, 'helpers'),
    script: path.join(argv.generation, 'generation.js')
 * Handlebars : Template engine
 * script: javascript source file
 * project : the project folder
 * JSONL: JSON to literal
 */

exports.default = class Generation {
  constructor (context) {
    // Using latest ES6 syntax, you may explode the context into several variables.
    this.context = context
    this.output = context.output
    this.log = context.log
    this.template = this.context.template
    this.path = this.context.path
    this.fs = this.context.fs
    this.catalog = this.context.catalog;
    // Options to generate the code
    this.genOpts = {
      testFolder: this.context.path.join(this.output, '__tests__'),
      entitiesFolder: this.context.path.join(this.output, 'entities'),
      libFolder: this.context.path.join(this.output, 'lib')
    }

    // Any kind of variable can be documented
    this.application = {
      author: 'Sylvain Leroy'
    }
  }

  generate () {
    this.log.warn(`script:Rendering project into ${this.project}`)

    // Write your code here.
    const context = {
      value1: 'abcdef',
      value2: '0132456789'
    }
    const model = this.catalog.json('models.json')
    if (model == null) throw new Error('Model not found')

    const generatedContent = this.template.handlebars('model1.handlebars', context)
    this.fs.writeFileSync(this.path.join(this.output, 'example.txt'), generatedContent)
  }
}
