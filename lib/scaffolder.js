import path from 'path';
import fse from 'fs-extra';
import ejs from 'ejs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get the list of available templates.
 * @returns {Promise<string[]>} A list of template names.
 */
export async function getTemplates() {
  const templatesDir = path.resolve(__dirname, '..', 'templates');
  const templateFolders = await fse.readdir(templatesDir);
  return templateFolders.filter((folder) =>
    fse.statSync(path.join(templatesDir, folder)).isDirectory()
  );
}

/**
 * Creates a new project from a template.
 * @param {string} projectName The name of the project to create.
 * @param {string} templateName The name of the template to use.
 * @throws {Error} If a directory with the same name already exists.
 */
export async function createProject(projectName, templateName) {
  const projectDir = path.resolve(process.cwd(), projectName);
  const templateDir = path.resolve(__dirname, '..', 'templates', templateName);

  if (!fse.existsSync(templateDir)) {
    throw new Error(`Template "${templateName}" not found.`);
  }

  if (fse.existsSync(projectDir)) {
    throw new Error(`Directory ${projectName} already exists.`);
  }

  await fse.copy(templateDir, projectDir);

  // Define which files should be templated. EJS will process these.
  const filesToTemplate = ['package.json', 'README.md'];

  for (const file of filesToTemplate) {
    const filePath = path.join(projectDir, file);
    if (fse.existsSync(filePath)) {
      const template = await fse.readFile(filePath, 'utf-8');
      const rendered = ejs.render(template, { projectName });
      await fse.writeFile(filePath, rendered);
    }
  }

  return projectDir;
}
