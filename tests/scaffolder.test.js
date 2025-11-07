import { jest } from '@jest/globals';
import path from 'path';

jest.unstable_mockModule('fs-extra', () => ({
  default: {
    existsSync: jest.fn(),
    copy: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
    readdir: jest.fn(),
    statSync: jest.fn(),
  },
}));

const fse = await import('fs-extra');
const { createProject, getTemplates } = await import('../lib/scaffolder.js');


describe('scaffolder', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTemplates', () => {
    it('should return a list of available templates', async () => {
      fse.default.readdir.mockResolvedValue(['default', 'cli', 'not-a-directory']);
      fse.default.statSync.mockImplementation((name) => ({
        isDirectory: () => !name.endsWith('not-a-directory'),
      }));

      const templates = await getTemplates();
      expect(templates).toEqual(['default', 'cli']);
    });
  });

  describe('createProject', () => {
    const projectName = 'test-project';
    const projectDir = path.resolve(process.cwd(), projectName);
    const templateName = 'default';

    it('should throw an error if the template does not exist', async () => {
      fse.default.existsSync.mockReturnValue(false);
      await expect(createProject(projectName, 'non-existent-template')).rejects.toThrow(
        'Template "non-existent-template" not found.'
      );
    });

    it('should throw an error if the project directory already exists', async () => {
      fse.default.existsSync.mockReturnValue(true);
      await expect(createProject(projectName, templateName)).rejects.toThrow(
        `Directory ${projectName} already exists.`
      );
    });

    it('should create a new project directory from a template', async () => {
      // 1. Return true for the template directory check
      // 2. Return false for the project directory check
      // 3. Return true for all subsequent file checks inside the loop
      fse.default.existsSync
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
        .mockReturnValue(true);

      fse.default.readFile.mockResolvedValue('<%= projectName %>');
      await createProject(projectName, templateName);
      expect(fse.default.copy).toHaveBeenCalledWith(expect.stringContaining(templateName), projectDir);
      expect(fse.default.readFile).toHaveBeenCalled();
      expect(fse.default.writeFile).toHaveBeenCalled();
    });
  });
});
