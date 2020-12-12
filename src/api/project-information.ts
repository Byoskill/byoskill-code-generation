/**
 * This interface defines the basic information of a generation project structure.
 */
export default interface ProjectInformation {
    project: string,
    templates: string,
    partials: string,
    helpers: string,
    assets: string,
    script: string
  }