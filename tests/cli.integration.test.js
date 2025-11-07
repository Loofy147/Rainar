import { exec } from 'child_process';
import { promisify } from 'util';
import fse from 'fs-extra';
import path from 'path';

const execAsync = promisify(exec);

describe('CLI Integration Test', () => {
  const projectName = 'test-cli-project';
  const projectDir = path.resolve(process.cwd(), projectName);

  beforeEach(async () => {
    await fse.remove(projectDir);
  });

  afterAll(async () => {
    await fse.remove(projectDir);
  });

  it('should create a new project', async () => {
    const { stdout, stderr } = await execAsync(`./index.js new ${projectName}`);

    expect(stderr).toBe('');
    expect(stdout).toContain(`Creating a new project named: ${projectName}`);
    expect(stdout).toContain('Project created successfully!');

    const packageJson = await fse.readJson(path.join(projectDir, 'package.json'));
    expect(packageJson.name).toBe(projectName);
  });
});
