import { jest } from '@jest/globals';

// Mock Octokit and execa
const mockCreateForAuthenticatedUser = jest.fn();
const mockOctokit = jest.fn(() => ({
  rest: {
    repos: {
      createForAuthenticatedUser: mockCreateForAuthenticatedUser,
    },
  },
}));
jest.unstable_mockModule('@octokit/rest', () => ({
  Octokit: mockOctokit,
}));

const mockExeca = jest.fn();
jest.unstable_mockModule('execa', () => ({
  execa: mockExeca,
}));

// Now, import the module to be tested
const { createRepository, initAndPush } = await import('../lib/github.js');

describe('GitHub Integration', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    mockCreateForAuthenticatedUser.mockClear();
    mockExeca.mockClear();
    mockOctokit.mockClear();
  });

  describe('createRepository', () => {
    it('should throw an error if no token is provided', async () => {
      await expect(createRepository('test-repo', null)).rejects.toThrow(
        'GitHub token is required.'
      );
    });

    it('should call Octokit with the correct parameters', async () => {
      mockCreateForAuthenticatedUser.mockResolvedValue({ data: { html_url: 'test-url' } });
      await createRepository('test-repo', 'fake-token');
      expect(mockOctokit).toHaveBeenCalledWith({ auth: 'fake-token' });
      expect(mockCreateForAuthenticatedUser).toHaveBeenCalledWith({
        name: 'test-repo',
        private: true,
      });
    });
  });

  describe('initAndPush', () => {
    it('should execute git commands in the correct order', async () => {
      const repoUrl = 'git@github.com:test/test-repo.git';
      const projectPath = '/tmp/test-project';
      await initAndPush(repoUrl, projectPath);

      expect(mockExeca.mock.calls).toEqual([
        ['git', ['init'], { cwd: projectPath }],
        ['git', ['add', '.'], { cwd: projectPath }],
        ['git', ['commit', '-m', 'Initial commit from Rainar CLI'], { cwd: projectPath }],
        ['git', ['branch', '-M', 'main'], { cwd: projectPath }],
        ['git', ['remote', 'add', 'origin', repoUrl], { cwd: projectPath }],
        ['git', ['push', '-u', 'origin', 'main'], { cwd: projectPath }],
      ]);
    });
  });
});
