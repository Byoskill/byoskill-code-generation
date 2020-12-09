const tmp = require('tmp');
const path = require('path');
const Template = require('../lib/template-renderer');
const chai = require('chai');
var expect = chai.expect;


test('Attempting to render with handlebar.js', () => {
    try {
    const project = {
        templates: path.join(__dirname, "../examples")
    }

    const template = new Template(project);
    const context = {
        value : "test"
    }

    const content = template.handlebars("template.handlebars", context);
    expect(content).to.equal('test');
    } finally {
        tmp.setGracefulCleanup();
    }

});