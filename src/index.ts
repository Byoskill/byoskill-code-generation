#!/usr/bin/env node
import yargs from 'yargs';
import CodeGeneration from './code-generation'

const args : any = yargs.options({
  'catalog': { type: 'string', demandOption: true, alias: 'c' },
  'project': { type: 'string', demandOption: true, alias: 'p' },
  'output': { type: 'string', demandOption: true, alias: 'o' },
})
  .help('h')
  .describe('catalog', 'Data generated by spring-crud-generator')
  .describe('output', 'the output path where the code will be generated')
  .describe('project', 'the project containing your code generation scripts.')
  .command('codegenerator [catalog] [project] [output]', 'Generates code using a catalog and a generation project into an output folder.')
  .alias('h', 'help').argv;

console.log(args);

new CodeGeneration(args.argv).generate()
