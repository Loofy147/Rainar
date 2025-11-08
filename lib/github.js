import { Octokit } from '@octokit/rest';
import { execa } from 'execa';
import chalk from 'chalk';

async function getAuthenticatedOctokit(token) {
  if (!token) {
    throw new Error('GitHub token is required. Please provide it via the --github-token option or set the GITHUB_TOKEN environment variable.');
  }
  return new Octokit({ auth: token });
}

async function createRepository(name, token) {
  const octokit = await getAuthenticatedOctokit(token);
  console.log(chalk.blue('Creating GitHub repository...'));
  try {
    const response = await octokit.rest.repos.createForAuthenticatedUser({
      name,
      private: true, // All repositories are created as private by default
    });
    console.log(chalk.green('GitHub repository created successfully.'));
    return response.data;
  } catch (error) {
    console.error(chalk.red(`Error creating GitHub repository: ${error.message}`));
    throw error;
  }
}

async function initAndPush(repoUrl, projectPath) {
    console.log(chalk.blue('Initializing local git repository and pushing to origin...'));
    try {
        await execa('git', ['init'], { cwd: projectPath });
        await execa('git', ['add', '.'], { cwd: projectPath });
        await execa('git', ['commit', '-m', 'Initial commit from Rainar CLI'], { cwd: projectPath });
        await execa('git', ['branch', '-M', 'main'], { cwd: projectPath });
        await execa('git', ['remote', 'add', 'origin', repoUrl], { cwd: projectPath });
        await execa('git', ['push', '-u', 'origin', 'main'], { cwd: projectPath });
        console.log(chalk.green('Successfully pushed initial commit to GitHub.'));
    } catch(error) {
        console.error(chalk.red(`Error initializing git repository or pushing to origin: ${error.message}`));
        // Provide a helpful message to the user
        console.log(chalk.yellow('Please ensure you have git installed and configured correctly.'));
        console.log(chalk.yellow(`You may need to manually push the repository to: ${repoUrl}`));
        throw error;
    }
}

export { createRepository, initAndPush };
