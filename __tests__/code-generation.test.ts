import CodeGeneration from '../src/code-generation';
import * as tmp from 'tmp'

// const path = require('path')

// const chai = require('chai')
// const expect = chai.expect

test('Code generation', () => {
  try {
    const argv = {
      catalog: './examples',
      output: './output',
      project: './examples/project'
    }
    const generation = new CodeGeneration(argv)
    generation.generate()
  } finally {
    tmp.setGracefulCleanup()
  }
})
