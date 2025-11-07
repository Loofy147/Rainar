#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createProject } from './lib/scaffolder.js';

const program = new Command();

program
  .name('rainar')
  .description('A powerful, enterprise-grade project scaffolding tool.')
  .version('1.0.0');

program
  .command('new <project-name>')
  .description('Create a new project from a template')
  .action(async (projectName) => {
    try {
      console.log(chalk.green(`Creating a new project named: ${projectName}`));
      await createProject(projectName);
      console.log(chalk.green('Project created successfully!'));
    } catch (error) {
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

program.parse(process.argv);
