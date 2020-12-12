import * as tmp from 'tmp';
import * as path from 'path';
import Template from '../src/template-renderer';
import { expect } from 'chai';
import ProjectInformation from '../src/api/project-information';


test('Attempting to render with handlebar.js', () => {
    try {
        const project : ProjectInformation = {
            project: path.join(__dirname, "../examples/project"),
            partials: path.join(__dirname, "../examples/project/partial"),
            helpers: path.join(__dirname, "../examples/project/helpers"),
            assets: path.join(__dirname, "../examples/project/assets"),
            script: path.join(__dirname, "../examples/project/scripts"),
            templates: path.join(__dirname, "../examples")
        }

        const template = new Template(project);
        const context = {
            value: "test"
        }

        const content = template.handlebars("template.handlebars", context);
        expect(content).to.equal('test');
    } finally {
        tmp.setGracefulCleanup();
    }

});