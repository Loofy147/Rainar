#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { createProject, getTemplates } from './lib/scaffolder.js';
import { createRepository, initAndPush } from './lib/github.js';

const program = new Command();

program
  .name('rainar')
  .description('A powerful, enterprise-grade project scaffolding tool.')
  .version('1.0.0');

program
  .command('new <project-name>')
  .description('Create a new project from a template')
  .option('-t, --template <template-name>', 'The name of the template to use')
  .option('--create-repo', 'Create a new GitHub repository for the project')
  .option('--github-token <token>', 'Your GitHub personal access token')
  .action(async (projectName, options) => {
    let templateName = options.template;
    const { createRepo, githubToken } = options;

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
      const projectPath = await createProject(projectName, templateName);
      console.log(chalk.green(`Project created successfully at ${projectPath}!`));

      if (createRepo) {
        const token = githubToken || process.env.GITHUB_TOKEN;
        const repository = await createRepository(projectName, token);
        await initAndPush(repository.ssh_url, projectPath);
        console.log(chalk.green(`Project successfully pushed to ${repository.html_url}`));
      }

    } catch (error) {
      // The error is already logged in the respective function, so just exit.
      process.exit(1);
    }
  });

// Export for testing purposes
export default program;

if (process.env.NODE_ENV !== 'test') {
  program.parse(process.argv);
}
