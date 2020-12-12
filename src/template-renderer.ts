import ProjectInformation from './api/project-information';
import Handlebars from 'handlebars';
import { logger } from './logger';
import * as fs from 'fs';
import * as path from 'path';


export default class Template {
  constructor(public project: ProjectInformation) {
  }

  handlebars(templateName: string, payload: any) : string {
    logger.debug(`Generation using the template ${templateName}`)

    const templateFile = path.join(this.project.templates, templateName)
    if (!fs.existsSync(templateFile)) {
      throw new Error(`Resource ${templateFile} not found`)
    }
    logger.debug(`Location of the ${templateFile}`)

    const template = fs.readFileSync(templateFile) + ''
    const hb = Handlebars.compile(template)
    let renderedContent = hb(payload)

    if (payload.postRender) {
      logger.warn('Post treatment is requested...')
      renderedContent = Handlebars.compile(renderedContent)(payload)
    }
    if (payload && payload.debug) {
      logger.info(`Content : \n${renderedContent}`)
    }
    return renderedContent
  }
}
