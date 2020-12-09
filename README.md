# byoskill-code-generation

[![Build Status](https://travis-ci.org/Byoskill/byoskill-code-generation.svg?branch=main)](https://travis-ci.org/Byoskill/byoskill-code-generation)


CLI Tool to write code generation project using a model.

This tool is an NPM module that bundles a set of libraries and scripts to allow a RAPID developer to generate easily code ( source files, AST, assets etc) from a JSON model.

## How to use

## Concepts

The JSON model structure is loosely defined to allow any model to be accepted.

A generation project has to be provided to the tool. This project will perform the code generation orchestrated by the present library.

## Source code generation

The code generation relies on Handlebar and its mechanism. To know more about template rendering with Handlebars go to [handlebars documentation](handlebarsjs.com/).

## Generation project

A generation project should follow this folder structure : 

```
assets/
helpers/
partials/
templates/
generation.js
globals.js
```

Here is the explanation : 

* `assets` the whole list of resources contained in the _assets_ folder will be copied ( and potentially overwrite) in the target folder. The resources are copied at the target directory, it means the _assets_ prefix is ignored.
* `helpers` contains the list of helpers available in your Handlebar templates. They are loaded automatically.
* `partials` contains the list of partials available in your Handlebar templates. They are loaded automatically.
* `templates` contains the list of templates available in your generation script to generate your code
* `generation.js` is the entry point to write your code.
* `global.js` contains a set of global variables available in your helpers, partials and templates as well as your generation script.

### Partials

Here is a sample of partial file : 

```
{{#if field.entityCollection}}
entity.set{{capitalize field.name}}(this.{{javaTypeToBeanName field.relatedJpaEntity}}converter.toEntities(dto.get{{capitalize field.name}}() ));
{{/if}}
{{#unless field.entityCollection}}
entity.set{{capitalize field.name}}(this.{{javaTypeToBeanName field.relatedJpaEntity}}converter.toEntity(dto.get{{capitalize field.name}}() ));
{{/unless}}

```

### Helpers

Helpers are javascript macros that can be used in your templates. The specification is provided by Handlebars.

Here is a sample : 

```
function capitalize(word) {
	return word[0].toUpperCase() + word.slice(1);
}

exports.capitalize = capitalize;

```

and another sample : 

```
function getBaseType(type) {

	if (type.variant == "class") {
        if (!type.canonicalName.startsWith("java.lang") && !type.primitive) {
            globals.usedJavaTypes.add(type.canonicalName);
        }
		return type.simpleName;
	} else if (type.variant == "parameterized") {
		var tpm = type.typeParameters.map(t => getBaseType(t)).join(',');		
		return getBaseType(type.rawtype) + "<" + tpm + ">";
	}
}

function javaType(type) {
    const baseType = getBaseType(type);
    return type.array ? baseType + "[]": baseType;
}

exports.javaType = javaType;
```

### Templates

The templates are using Handlebars and follow its convention.

Here is a sample : 

```
const Client = require('../../lib/rest-client').Client;
const EndpointConfig = require('../../lib/rest-client').EndpointConfig;
const chai = require('chai');
const assert = chai.assert; // Using Assert style

// Entities
const defaultParams = require('../../entities/default-params.json');

const client = new Client();
describe('{{{controller}}}', () => {

    /**
     * Test of the endpoint {{{method}}} {{{url}}}
     * for the controller {{{controller}}}
     */
    it('{{{operationId}}}::{{{method}}}', async () => {
        const endpointConfig = new EndpointConfig();
        endpointConfig.method = {{{literal method}}};

        endpointConfig.pathParams = {
            {{#each pathParams}} {{{@key}}}: {{{this}}}, 
            {{/each}}

        };
    });
});

```

### Generation script

The file `generation.js` is a Javascript file which requires a specific structure.

The generation script should define and export a class.

This class should contains a method **generate** and a constructor taking a **context** as sole parameter.

Here is the basic structure of a generation script : 

```
/**
 * Several variables are provided for the execution of the generation.
 *
 * log: a logger to print your messages
 * template: a component to load and execute a template with a payload
 *  example: template.nunjucks("templateName", payload") : string
 *  example: template.handlebars("templateName", payload") : string
 * catalog: returns the catalog of objects to be manipulated for the generation.
 * fs: file operations
 *  fs.write("path", content)
 * path: path operations
 * globals : contains a list of global variables declared at the begin of the execution and available in both templates, helpers and partials
 * output: the output folder
 * generationInfo: contains various folder locations
	templates: path.join(argv.generation, 'templates'),
	partials: path.join(argv.generation, 'partials'),
	helpers: path.join(argv.generation, 'helpers'),
    script: path.join(argv.generation, 'generation.js')
 * Handlebars : Template engine
 * script: javascript source file
 * project : the project folder
 * JSONL: JSON to literal
 */

exports.default = class Generation {
    constructor(context) {
        // Using latest ES6 syntax, you may explode the context into several variables.
        this.context = context;
        this.output = context.output;
        this.log = context.log;
        this.docapi = this.context.catalog;
        this.template = this.context.template;
        this.path = this.context.path;
        this.fs = this.context.fs;
        // Options to generate the code
        this.genOpts = {
            testFolder: this.context.path.join(this.output, '__tests__'),
            entitiesFolder: this.context.path.join(this.output, 'entities'),            
            libFolder: this.context.path.join(this.output, 'lib')
        };

        // Any kind of variable can be documented
        this.application = {
            author: 'Sylvain Leroy'
        };

        // Project resources can be required this way.
        this.dictionary = this.context.requires('./dictionary.json');
    }

    generate() {
        this.log.warn(`script:Rendering project into ${this.project}`);

        // Write your code here.
    }
}

```

### global.js

This file contains a list of global variables that are available in the partials, helpers, templates, and generation script.

Here is a sample : 

```
function globals() {
	return {
		usedJavaTypes: new Set(),
		test: []
	};
}

exports.globals = globals;

```

## Example of projects

Here are some examples of generation projects made with this module.

Examples : 

* fish-net : a non-regression test harness generated automatically from Swagger/OpenAPI definitions.

