import { exec } from 'child_process';
import { promisify } from 'util';
import fse from 'fs-extra';
import path from 'path';

const execAsync = promisify(exec);

describe('CLI Integration Test', () => {
  const cliProjectName = 'test-cli-project';
  const cliProjectDir = path.resolve(process.cwd(), cliProjectName);
  const defaultProjectName = 'test-default-project';
  const defaultProjectDir = path.resolve(process.cwd(), defaultProjectName);

  beforeEach(async () => {
    await fse.remove(cliProjectDir);
    await fse.remove(defaultProjectDir);
  });

  afterAll(async () => {
    await fse.remove(cliProjectDir);
    await fse.remove(defaultProjectDir);
  });

  it('should create a new CLI project with the --template option', async () => {
    const { stdout, stderr } = await execAsync(`./index.js new ${cliProjectName} --template cli`);

    expect(stderr).toBe('');
    expect(stdout).toContain(`Creating a new project named: ${cliProjectName} from template: cli`);
    expect(stdout).toContain('Project created successfully!');

    const packageJson = await fse.readJson(path.join(cliProjectDir, 'package.json'));
    expect(packageJson.name).toBe(cliProjectName);
    expect(packageJson.dependencies.commander).toBeDefined();
  });

  it('should create a new default project with the --template option', async () => {
    const { stdout, stderr } = await execAsync(`./index.js new ${defaultProjectName} --template default`);

    expect(stderr).toBe('');
    expect(stdout).toContain(`Creating a new project named: ${defaultProjectName} from template: default`);
    expect(stdout).toContain('Project created successfully!');

    const packageJson = await fse.readJson(path.join(defaultProjectDir, 'package.json'));
    expect(packageJson.name).toBe(defaultProjectName);
    expect(packageJson.dependencies.pino).toBeDefined();
  });
});
