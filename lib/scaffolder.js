import path from 'path';
import fse from 'fs-extra';
import ejs from 'ejs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Creates a new project from a template.
 * @param {string} projectName The name of the project to create.
 * @throws {Error} If a directory with the same name already exists.
 */
export async function createProject(projectName) {
  const projectDir = path.resolve(process.cwd(), projectName);
  const templateDir = path.resolve(__dirname, '..', 'templates/default');

  if (fse.existsSync(projectDir)) {
    throw new Error(`Directory ${projectName} already exists.`);
  }

  await fse.copy(templateDir, projectDir);

  const filesToTemplate = ['package.json', 'README.md'];

  for (const file of filesToTemplate) {
    const templatePath = path.join(templateDir, file);
    const projectPath = path.join(projectDir, file);
    const template = await fse.readFile(templatePath, 'utf-8');
    const rendered = ejs.render(template, { projectName });
    await fse.writeFile(projectPath, rendered);
  }
}
