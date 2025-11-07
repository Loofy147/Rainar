import { jest } from '@jest/globals';

// This test file is for the main CLI entry point (index.js)

// Mock the external dependencies of index.js
const mockCreateProject = jest.fn();
const mockGetTemplates = jest.fn();
const mockCreateRepository = jest.fn();
const mockInitAndPush = jest.fn();

jest.unstable_mockModule('../lib/scaffolder.js', () => ({
  createProject: mockCreateProject,
  getTemplates: mockGetTemplates,
}));

jest.unstable_mockModule('../lib/github.js', () => ({
  createRepository: mockCreateRepository,
  initAndPush: mockInitAndPush,
}));

// We need to import the CLI entry point *after* setting up the mocks
const program = (await import('../index.js')).default;

describe('CLI Integration Test', () => {

  beforeEach(() => {
    // Reset mocks before each test
    mockCreateProject.mockClear();
    mockGetTemplates.mockClear();
    mockCreateRepository.mockClear();
    mockInitAndPush.mockClear();
  });

  it('should call scaffolder but not github when --create-repo is not provided', async () => {
    // Arrange
    mockCreateProject.mockResolvedValue('/path/to/my-project');
    const argv = ['node', 'index.js', 'new', 'my-project', '--template', 'default'];

    // Act
    await program.parseAsync(argv);

    // Assert
    expect(mockCreateProject).toHaveBeenCalledWith('my-project', 'default');
    expect(mockCreateRepository).not.toHaveBeenCalled();
    expect(mockInitAndPush).not.toHaveBeenCalled();
  });

  it('should call scaffolder and github when --create-repo is provided', async () => {
    // Arrange
    const projectPath = '/path/to/my-gh-project';
    const repoUrl = 'git@github.com:user/my-gh-project.git';
    const token = 'my-secret-token';

    mockCreateProject.mockResolvedValue(projectPath);
    mockCreateRepository.mockResolvedValue({ ssh_url: repoUrl });

    const argv = ['node', 'index.js', 'new', 'my-gh-project', '--template', 'default', '--create-repo', '--github-token', token];

    // Act
    await program.parseAsync(argv);

    // Assert
    expect(mockCreateProject).toHaveBeenCalledWith('my-gh-project', 'default');
    expect(mockCreateRepository).toHaveBeenCalledWith('my-gh-project', token);
    expect(mockInitAndPush).toHaveBeenCalledWith(repoUrl, projectPath);
  });
});
