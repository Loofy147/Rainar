import { jest } from '@jest/globals';
import path from 'path';

jest.unstable_mockModule('fs-extra', () => ({
  default: {
    existsSync: jest.fn(),
    copy: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

const fse = await import('fs-extra');
const { createProject } = await import('../lib/scaffolder.js');


describe('createProject', () => {
  const projectName = 'test-project';
  const projectDir = path.resolve(process.cwd(), projectName);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if the project directory already exists', async () => {
    fse.default.existsSync.mockReturnValue(true);
    await expect(createProject(projectName)).rejects.toThrow(
      `Directory ${projectName} already exists.`
    );
  });

  it('should create a new project directory', async () => {
    fse.default.existsSync.mockReturnValue(false);
    fse.default.readFile.mockResolvedValue('<%= projectName %>');
    await createProject(projectName);
    expect(fse.default.copy).toHaveBeenCalledWith(expect.any(String), projectDir);
    expect(fse.default.readFile).toHaveBeenCalledTimes(2);
    expect(fse.default.writeFile).toHaveBeenCalledTimes(2);
  });
});
