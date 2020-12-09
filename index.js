#!/usr/bin/env node
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const CodeGeneration = require('./lib/code-generation')

const cli = yargs(hideBin(process.argv))

cli
  .help('h')
  .alias('h', 'help')
  .demandOption(['output', 'catalog', 'project'])
  .describe('catalog', 'Data generated by spring-crud-generator')
  .describe('output', 'the output path where the code will be generated')
  .describe('project', 'the project containing your code generation scripts.')
  .command('codegenerator [catalog] [script]',
    'Generates code using a catalog and a script')

new CodeGeneration(cli.argv).generate()
