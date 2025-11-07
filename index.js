#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { createProject, getTemplates } from './lib/scaffolder.js';

const program = new Command();

program
  .name('rainar')
  .description('A powerful, enterprise-grade project scaffolding tool.')
  .version('1.0.0');

program
  .command('new <project-name>')
  .description('Create a new project from a template')
  .option('-t, --template <template-name>', 'The name of the template to use')
  .action(async (projectName, options) => {
    let templateName = options.template;

    if (!templateName) {
      const templates = await getTemplates();
      const { selectedTemplate } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedTemplate',
          message: 'Please choose a project template:',
          choices: templates,
        },
      ]);
      templateName = selectedTemplate;
    }

    try {
      console.log(chalk.green(`Creating a new project named: ${projectName} from template: ${templateName}`));
      await createProject(projectName, templateName);
      console.log(chalk.green('Project created successfully!'));
    } catch (error) {
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

program.parse(process.argv);
