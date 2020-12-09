const Handlebars = require("handlebars");
const log = require('./logger').logger;
const fs = require('fs');
const path = require('path');

class Template {
    constructor(project) {
        this.project = project;
    }

    handlebars(templateName, payload) {
        log.debug(`Generation using the template ${templateName}`);

        const templateFile = path.join(this.project.templates, templateName);
        log.debug(`Location of the ${templateFile}`);

        const template = fs.readFileSync(templateFile) + '';
        const hb = Handlebars.compile(template);
        let renderedContent = hb(payload);

        if (payload.postRender) {
            log.warn("Post treatment is requested...");
            renderedContent = Handlebars.compile(renderedContent)(payload);
        }
        if (payload && payload.debug) {
            log.info(`Content : \n${renderedContent}`);
        }
        return renderedContent;
    }
}

module.exports.Template = Template;