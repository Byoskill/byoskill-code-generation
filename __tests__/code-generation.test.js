const tmp = require('tmp')
// const path = require('path')
const CodeGeneration = require('../lib/code-generation')
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
