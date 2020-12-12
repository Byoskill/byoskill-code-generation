import Catalog from "../catalog";
import Template from "../template-renderer";
import ProjectInformation from "./project-information";
import { Logger } from 'winston';


/**
 * Generation context passed to the generation project.
 */
export interface GenerationContext {
    // Imports
    path: any,
    fs: any,
    Handlebars: any,
    log: Logger,
    globals: any,
    // Context of the execution
    catalog: Catalog,
    generationInfo: ProjectInformation,
    script: string,
    output: string,
    project: string,
    template: Template,
    requires: (modulePath: string) => any
  }