#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var yargs_1 = __importDefault(require("yargs"));
//const CodeGeneration = require('./code-generation')
//const cli = yargs(process.argv.slice(2))
var args = yargs_1.default.options({
    'catalog': { type: 'string', demandOption: true, alias: 'c' },
    'project': { type: 'string', demandOption: true, alias: 'p' },
    'output': { type: 'string', demandOption: true, alias: 'o' },
})
    .help('h')
    .alias('h', 'help').argv;
console.log(args);
/**
cli
  .help('h')
  .alias('h', 'help')
  .demandOption(['output', 'catalog', 'project'])
  .describe('catalog', 'Data generated by spring-crud-generator')
  .describe('output', 'the output path where the code will be generated')
  .describe('project', 'the project containing your code generation scripts.')
  .command('codegenerator [catalog] [script]',
    'Generates code using a catalog and a script')
 */
//new CodeGeneration(cli.argv).generate()
